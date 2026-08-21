const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    // Authenticate session
    const sessionId = req.cookies["krishify_session"]
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    // Verify session and check role
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "ROOT",
      database: "krishify",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })

    const connection = await pool.getConnection()

    try {
      // Verify session and check role
      const [sessions] = await connection.execute(
        "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
        [sessionId]
      )

      if (sessions.length === 0) {
        return res.status(401).json({ error: "Unauthenticated or session expired" })
      }

      const user = sessions[0]
      if (user.role !== "farmer") {
        return res.status(403).json({ error: "Farmer role required" })
      }

      const body = req.body || {}
      const { cropListingId, startingPrice, minimumIncrement, startsAt, endsAt } = body

      // Validate required fields
      if (!cropListingId) {
        return res.status(400).json({ error: "Crop listing ID is required" })
      }
      if (startingPrice === undefined || startingPrice <= 0) {
        return res.status(400).json({ error: "Starting price must be greater than 0" })
      }
      if (minimumIncrement === undefined || minimumIncrement <= 0) {
        return res.status(400).json({ error: "Minimum increment must be greater than 0" })
      }
      if (!endsAt) {
        return res.status(400).json({ error: "End time is required" })
      }

      // Verify crop listing exists and belongs to this farmer
      const [cropListings] = await connection.execute(
        "SELECT id, farmerId FROM CropListing WHERE id = ?",
        [cropListingId]
      )

      if (cropListings.length === 0) {
        return res.status(404).json({ error: "Crop listing not found" })
      }

      if (cropListings[0].farmerId !== user.userId) {
        return res.status(403).json({ error: "Not your crop listing" })
      }

      // Check for existing active auction
      const [existingAuctions] = await connection.execute(
        "SELECT id FROM Auction WHERE cropListingId = ? AND status = 'ACTIVE'",
        [cropListingId]
      )

      if (existingAuctions.length > 0) {
        return res.status(409).json({ error: "Active auction already exists for this crop" })
      }

      // Parse startsAt if it's a string
      const startTime = startsAt ? new Date(startsAt) : new Date()
      const endTime = new Date(endsAt)

      // Validate time range
      if (endTime <= startTime) {
        return res.status(400).json({ error: "End time must be after start time" })
      }

      // Create auction
      const [result] = await connection.execute(
        "INSERT INTO Auction (id, cropListingId, startingPrice, minimumIncrement, status, startsAt, endsAt, createdAt) VALUES (UUID(), ?, ?, 'ACTIVE', ?, ?, NOW())",
        [cropListingId, startingPrice, minimumIncrement, startTime, endTime]
      )

      const auctionId = result.insertId

      // Return the created auction with crop info
      const [auctions] = await connection.execute(
        "SELECT a.*, cl.cropName, cl.farmerId FROM Auction a JOIN CropListing cl ON a.cropListingId = cl.id WHERE a.id = ?",
        [auctionId]
      )

      return res.status(201).json({
        success: true,
        auction: auctions[0],
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Create auction error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}