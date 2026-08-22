const mysql = require("mysql2/promise")
const { createNotification } = require("../../lib/notifications")

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "ROOT",
  database: "krishify",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

module.exports = async function handler(req, res) {
  try {
    if (req.method === "POST") return createBidHandler(req, res)
    if (req.method === "GET") return getBidsHandler(req, res)
    return res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    console.error("Bids API error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function getSession(sessionId) {
  if (!sessionId) return null
  const connection = await pool.getConnection()
  try {
    const [sessions] = await connection.execute(
      "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
      [sessionId]
    )
    return sessions.length > 0 ? sessions[0] : null
  } finally {
    connection.release()
  }
}

async function createBidHandler(req, res) {
  const sessionId = req.cookies["krishify_session"]
  const user = await getSession(sessionId)

  if (!user) {
    return res.status(401).json({ error: "Unauthenticated or session expired" })
  }
  if (user.role !== "buyer") {
    return res.status(403).json({ error: "Buyer role required" })
  }

  const body = req.body || {}
  const { cropListingId, bidPricePerQuintal } = body

  if (!cropListingId) {
    return res.status(400).json({ error: "Crop listing ID is required" })
  }
  if (!bidPricePerQuintal || isNaN(bidPricePerQuintal) || Number(bidPricePerQuintal) <= 0) {
    return res.status(400).json({ error: "Valid bid price per quintal is required" })
  }

  const connection = await pool.getConnection()
  try {
    // Verify crop listing exists and check lot status
    const [cropListings] = await connection.execute(
      "SELECT id, farmerId, cropName, quantityKg, lotStatus, inspectionStatus, expectedPricePerQuintal FROM CropListing WHERE id = ?",
      [cropListingId]
    )

    if (cropListings.length === 0) {
      return res.status(404).json({ error: "Crop listing not found" })
    }

    const crop = cropListings[0]

    // Only AUCTION_READY or AUCTION_ACTIVE lots can be bid on
    if (crop.lotStatus !== 'AUCTION_READY' && crop.lotStatus !== 'AUCTION_ACTIVE') {
      return res.status(400).json({ error: 'Lot is not in auction state. Current status: ' + crop.lotStatus })
    }

    // Buyer cannot bid on own crop
    if (crop.farmerId === user.userId) {
      return res.status(400).json({ error: "Cannot bid on your own crop" })
    }

    // Check auction exists and is active for this crop listing
    const [auctions] = await connection.execute(
      "SELECT id, status, startsAt, endsAt FROM Auction WHERE cropListingId = ? AND status = 'ACTIVE'",
      [cropListingId]
    )

    if (auctions.length === 0) {
      return res.status(404).json({ error: "No active auction for this crop listing" })
    }

    const auction = auctions[0]

    // Check current time is within auction window
    const now = new Date()
    if (now < new Date(auction.startsAt) || now > new Date(auction.endsAt)) {
      return res.status(400).json({ error: "Auction is not currently active" })
    }

    // Get current highest bid
    const [currentBids] = await connection.execute(
      "SELECT amount, buyerId FROM Bid WHERE auctionId = ? ORDER BY amount DESC LIMIT 1",
      [auction.id]
    )

    const currentHighest = currentBids.length > 0 ? Number(currentBids[0].amount) : Number(crop.expectedPricePerQuintal || 0)
    const minimumValidBid = currentHighest + Number(crop.minimumIncrement || 25)

    if (Number(bidPricePerQuintal) < minimumValidBid) {
      return res.status(400).json({
        error: `Bid must be at least ₹${minimumValidBid}/quintal (current: ₹${currentHighest}/quintal + increment ₹${crop.minimumIncrement || 25}/quintal)`,
      })
    }

    const isNewHighest = Number(bidPricePerQuintal) >= minimumValidBid

    // Calculate total value server-side: quantityKg / 100 × bidPricePerQuintal
    const totalValue = Math.round((crop.quantityKg / 100) * Number(bidPricePerQuintal))

    // Create bid with bidPricePerQuintal
    const bidId = require("crypto").randomUUID()
    await connection.execute(
      "INSERT INTO Bid (id, auctionId, buyerId, amount, createdAt) VALUES (?, ?, ?, ?, NOW())",
      [bidId, auction.id, user.userId, bidPricePerQuintal]
    )

    // Notify farmer about new bid
    try {
      await createNotification({
        userId: crop.farmerId,
        type: "NEW_BID",
        title: "New bid received",
        message: `A new bid of ₹${bidPricePerQuintal}/q has been placed on your ${crop.cropName} lot (${crop.quantityKg}kg / ${crop.quantityKg/100}q). Total: ₹${totalValue}`,
        relatedEntityType: "auction",
        relatedEntityId: auction.id,
      })
    } catch (notifErr) {
      console.error("Notification error:", notifErr)
    }

    // Notify previous highest bidder if outbid
    if (isNewHighest && currentBids.length > 0 && currentBids[0].buyerId !== user.userId) {
      try {
        await createNotification({
          userId: currentBids[0].buyerId,
          type: "OUTBID",
          title: "You have been outbid",
          message: `Another buyer placed a higher bid of ₹${bidPricePerQuintal}/q on ${crop.cropName}. Total lot value: ₹${totalValue}`,
          relatedEntityType: "auction",
          relatedEntityId: auction.id,
        })
      } catch (notifErr) {
        console.error("Outbid notification error:", notifErr)
      }
    }

    return res.status(201).json({
      success: true,
      bid: { id: bidId, auctionId: auction.id, buyerId: user.userId, bidPricePerQuintal, totalValue, isNewHighest },
    })
  } finally {
    connection.release()
  }
}

async function getBidsHandler(req, res) {
  const sessionId = req.cookies["krishify_session"]
  const user = await getSession(sessionId)

  if (!user) {
    return res.status(401).json({ error: "Unauthenticated or session expired" })
  }

  const { auctionId } = req.query
  const connection = await pool.getConnection()

  try {
    let query = `SELECT b.id, b.amount AS bidPricePerQuintal, b.createdAt, b.auctionId, u.name AS buyerName, cl.cropName, cl.quantityKg, cl.lotStatus `+
      `FROM Bid b JOIN User u ON b.buyerId = u.id JOIN CropListing cl ON b.auctionId = cl.id `

    let params = []

    if (auctionId) {
      query += " WHERE b.auctionId = ?"
      params.push(auctionId)
    }

    query += " ORDER BY b.amount DESC, b.createdAt DESC"

    const [bids] = await connection.execute(query, params)

    return res.status(200).json({ success: true, bids })
  } finally {
    connection.release()
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }

if (typeof module.exports === "object") { module.exports = { default: module.exports }; }
