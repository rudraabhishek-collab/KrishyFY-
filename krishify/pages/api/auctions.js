const { getPool } = require('../../lib/db')
const pool = getPool()

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

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return getAuctionsHandler(req, res)
    }
    if (req.method === "POST") {
      return createAuctionHandler(req, res)
    }
    return res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    console.error("Auctions API error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function getAuctionsHandler(req, res) {
  const connection = await pool.getConnection()
  try {
    const { status, cropListingId, mine } = req.query
    const conditions = []
    const params = []

    if (mine === "true") {
      const user = await getSession(req.cookies?.krishify_session)
      if (!user) return res.status(401).json({ error: "Unauthenticated or session expired" })
      conditions.push("cl.farmerId = ?")
      params.push(user.userId)
    }

    if (status === "ACTIVE") {
      conditions.push("a.status = 'ACTIVE' AND a.endsAt > NOW()")
    } else if (status === "ENDED") {
      conditions.push("(a.status <> 'ACTIVE' OR a.endsAt <= NOW())")
    } else if (status) {
      conditions.push("a.status = ?")
      params.push(status)
    }

    if (cropListingId) {
      conditions.push("a.cropListingId = ?")
      params.push(cropListingId)
    }

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : ""

    const [auctions] = await connection.execute(
      `SELECT a.id, a.cropListingId, a.startingPrice, a.minimumIncrement, a.status,
              a.startsAt, a.endsAt, a.createdAt,
              cl.cropName, cl.category, cl.quantity, cl.unit, cl.location,
              cl.quantityKg, cl.expectedPricePerQuintal, cl.lotStatus, cl.inspectionStatus,
              u.name AS farmerName,
              (SELECT MAX(b.amount) FROM Bid b WHERE b.auctionId = a.id) AS currentBid,
              (SELECT COUNT(*) FROM Bid b WHERE b.auctionId = a.id) AS bidCount,
              (SELECT COUNT(*) FROM \`Order\` o WHERE o.auctionId = a.id) AS orderCount,
              (SELECT o.id FROM \`Order\` o WHERE o.auctionId = a.id LIMIT 1) AS orderId
       FROM Auction a
       JOIN CropListing cl ON a.cropListingId = cl.id
       JOIN User u ON cl.farmerId = u.id
       ${whereClause}
       ORDER BY a.createdAt DESC`,
      params
    )

    return res.status(200).json({ success: true, auctions })
  } finally {
    connection.release()
  }
}

async function createAuctionHandler(req, res) {
  const sessionId = req.cookies["krishify_session"]
  const user = await getSession(sessionId)

  if (!user) {
    return res.status(401).json({ error: "Unauthenticated or session expired" })
  }
  if (user.role !== "farmer") {
    return res.status(403).json({ error: "Farmer role required" })
  }

  const body = req.body || {}
  const { cropListingId, startingPrice, minimumIncrement, startsAt, endsAt } = body

  if (!cropListingId) {
    return res.status(400).json({ error: "Crop listing ID is required" })
  }
  if (!startingPrice || Number(startingPrice) <= 0) {
    return res.status(400).json({ error: "Starting price must be greater than 0" })
  }
  if (!minimumIncrement || Number(minimumIncrement) <= 0) {
    return res.status(400).json({ error: "Minimum increment must be greater than 0" })
  }
  if (!endsAt) {
    return res.status(400).json({ error: "End time is required" })
  }

  const connection = await pool.getConnection()
  try {
    const [cropListings] = await connection.execute(
      "SELECT id, farmerId, lotStatus, inspectionStatus FROM CropListing WHERE id = ?",
      [cropListingId]
    )

    if (cropListings.length === 0) {
      return res.status(404).json({ error: "Crop listing not found" })
    }

    const crop = cropListings[0]
    if (crop.farmerId !== user.userId) {
      return res.status(403).json({ error: "Not your crop listing" })
    }

    if (crop.inspectionStatus !== "APPROVED" && crop.lotStatus !== "QUALITY_VERIFIED" && crop.lotStatus !== "AUCTION_READY") {
      return res.status(409).json({ error: "Lot must pass physical inspection before starting an auction" })
    }

    const [existingAuctions] = await connection.execute(
      "SELECT id FROM Auction WHERE cropListingId = ? AND status = 'ACTIVE' AND endsAt > NOW()",
      [cropListingId]
    )

    if (existingAuctions.length > 0) {
      return res.status(409).json({ error: "Active auction already exists for this crop" })
    }

    const startTime = startsAt ? new Date(startsAt) : new Date()
    const endTime = new Date(endsAt)

    if (isNaN(endTime.getTime()) || endTime <= startTime) {
      return res.status(400).json({ error: "End time must be after start time" })
    }

    const auctionId = require("crypto").randomUUID()
    await connection.execute(
      "INSERT INTO Auction (id, cropListingId, startingPrice, minimumIncrement, status, startsAt, endsAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, NOW(), NOW())",
      [auctionId, cropListingId, startingPrice, minimumIncrement, startTime, endTime]
    )

    await connection.execute(
      "UPDATE CropListing SET lotStatus = 'AUCTION_ACTIVE', updatedAt = NOW() WHERE id = ?",
      [cropListingId]
    )

    const [auctions] = await connection.execute(
      `SELECT a.id, a.cropListingId, a.startingPrice, a.minimumIncrement, a.status,
              a.startsAt, a.endsAt, a.createdAt,
              cl.cropName, cl.category, cl.quantity, cl.unit, cl.location,
              cl.quantityKg, cl.expectedPricePerQuintal, cl.lotStatus, cl.inspectionStatus,
              u.name AS farmerName,
              NULL AS currentBid,
              0 AS bidCount,
              0 AS orderCount,
              NULL AS orderId
       FROM Auction a
       JOIN CropListing cl ON a.cropListingId = cl.id
       JOIN User u ON cl.farmerId = u.id
       WHERE a.id = ?`,
      [auctionId]
    )

    return res.status(201).json({ success: true, auction: auctions[0] })
  } finally {
    connection.release()
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
