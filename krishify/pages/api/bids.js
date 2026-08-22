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
  const { auctionId, amount } = body

  if (!auctionId) {
    return res.status(400).json({ error: "Auction ID is required" })
  }
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "Valid amount is required" })
  }

  const connection = await pool.getConnection()
  try {
    // Verify auction exists and is ACTIVE
    const [auctions] = await connection.execute(
      `SELECT a.*, cl.farmerId, cl.cropName
       FROM Auction a
       JOIN CropListing cl ON a.cropListingId = cl.id
       WHERE a.id = ? AND a.status = 'ACTIVE'`,
      [auctionId]
    )

    if (auctions.length === 0) {
      return res.status(404).json({ error: "Auction not found or not active" })
    }

    const auction = auctions[0]

    // Check current time is within auction window
    const now = new Date()
    if (now < new Date(auction.startsAt) || now > new Date(auction.endsAt)) {
      return res.status(400).json({ error: "Auction is not currently active" })
    }

    // Buyer cannot bid on own crop
    if (auction.farmerId === user.userId) {
      return res.status(400).json({ error: "Cannot bid on your own crop" })
    }

    // Get current highest bid
    const [currentBids] = await connection.execute(
      "SELECT amount, buyerId FROM Bid WHERE auctionId = ? ORDER BY amount DESC LIMIT 1",
      [auctionId]
    )

    const currentHighest = currentBids.length > 0 ? Number(currentBids[0].amount) : Number(auction.startingPrice)
    const minimumValidBid = currentHighest + Number(auction.minimumIncrement)

    if (Number(amount) < minimumValidBid) {
      return res.status(400).json({
        error: `Bid must be at least ₹${minimumValidBid} (current: ₹${currentHighest} + increment ₹${auction.minimumIncrement})`,
      })
    }

    const isNewHighest = Number(amount) >= minimumValidBid

    // Create bid
    const bidId = require("crypto").randomUUID()
    await connection.execute(
      "INSERT INTO Bid (id, auctionId, buyerId, amount, createdAt) VALUES (?, ?, ?, ?, NOW())",
      [bidId, auctionId, user.userId, amount]
    )

    // Notify farmer about new bid
    try {
      await createNotification({
        userId: auction.farmerId,
        type: "NEW_BID",
        title: "New bid received",
        message: `A new bid of ₹${amount} has been placed on your crop ${auction.cropName}.`,
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
          message: `Another buyer placed a higher bid of ₹${amount} on ${auction.cropName}.`,
          relatedEntityType: "auction",
          relatedEntityId: auction.id,
        })
      } catch (notifErr) {
        console.error("Outbid notification error:", notifErr)
      }
    }

    return res.status(201).json({
      success: true,
      bid: { id: bidId, auctionId, buyerId: user.userId, amount, isNewHighest },
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
    if (auctionId) {
      const [auctionChecks] = await connection.execute(
        "SELECT a.id, cl.farmerId FROM Auction a JOIN CropListing cl ON a.cropListingId = cl.id WHERE a.id = ?",
        [auctionId]
      )

      if (auctionChecks.length === 0) {
        return res.status(404).json({ error: "Auction not found" })
      }
    }

    let query = `SELECT b.id, b.amount, b.createdAt, b.auctionId,
                        u.name AS buyerName
                 FROM Bid b
                 JOIN User u ON b.buyerId = u.id`
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
