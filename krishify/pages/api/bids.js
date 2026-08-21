const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    // Method-based routing
    if (req.method === "POST") {
      return createBidHandler(req, res)
    }
    if (req.method === "GET") {
      return getBidsHandler(req, res)
    }
    return res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    console.error("Bids API error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function createBidHandler(req, res) {
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
      if (user.role !== "buyer") {
        return res.status(403).json({ error: "Buyer role required" })
      }

      const body = req.body || {}
      const { auctionId, amount } = body

      // Validate required fields
      if (!auctionId) {
        return res.status(400).json({ error: "Auction ID is required" })
      }
      if (amount === undefined || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" })
      }

      // Verify auction exists and is ACTIVE
      const [auctions] = await connection.execute(
        "SELECT a.*, cl.farmerId FROM Auction a JOIN CropListing cl ON a.cropListingId = cl.id WHERE a.id = ? AND a.status = 'ACTIVE'",
        [auctionId]
      )

      if (auctions.length === 0) {
        return res.status(404).json({ error: "Auction not found or not active" })
      }

      const auction = auctions[0]

      // Check that current time is within auction window
      const now = new Date()
      if (now < new Date(auction.startsAt) || now > new Date(auction.endsAt)) {
        return res.status(400).json({ error: "Auction is not currently active" })
      }

      // Check that buyer is not the farmer who created the auction
      if (auction.farmerId === user.userId) {
        return res.status(400).json({ error: "Cannot bid on your own crop" })
      }

      // Get current highest bid
      const [currentBids] = await connection.execute(
        "SELECT amount FROM Bid WHERE auctionId = ? ORDER BY amount DESC LIMIT 1",
        [auctionId]
      )

      let currentHighest = auction.startingPrice
      if (currentBids.length > 0) {
        currentHighest = currentBids[0].amount
      }

      // Validate bid amount
      const minimumIncrement = auction.minimumIncrement
      const minimumValidBid = currentHighest + minimumIncrement

      if (amount < minimumValidBid) {
        return res.status(400).json({
          error: `Bid must be at least ₹${minimumValidBid} (current highest: ₹${currentHighest} + minimum increment ₹${minimumIncrement})`,
        })
      }

      // Create bid
      const [result] = await connection.execute(
        "INSERT INTO Bid (id, auctionId, buyerId, amount, createdAt) VALUES (UUID(), ?, ?, ?, NOW())",
        [auctionId, user.userId, amount]
      )

      // Check if this is the new highest bid
      const isNewHighest = amount > currentHighest

      return res.status(201).json({
        success: true,
        bid: {
          id: result.insertId,
          auctionId,
          buyerId: user.userId,
          amount,
          isNewHighest,
        },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Create bid error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function getBidsHandler(req, res) {
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

      // Get bids for a specific auction if auctionId is provided
      const auctionId = req.query.auctionId
      if (auctionId) {
        // Verify auction exists and buyer has access
        const [auctionChecks] = await connection.execute(
          "SELECT a.id, a.cropListingId, cl.farmerId FROM Auction a JOIN CropListing cl ON a.cropListingId = cl.id WHERE a.id = ?",
          [auctionId]
        )

        if (auctionChecks.length === 0) {
          return res.status(404).json({ error: "Auction not found" })
        }

        // Buyers can see bids on auctions they have access to
        // Farmers can see bids on their own auctions
        if (user.role === "farmer" && auctionChecks[0].farmerId !== user.userId) {
          return res.status(403).json({ error: "Not your auction" })
        }
      }

      // Get bids
      let query = "SELECT b.id, b.amount, b.createdAt, u.name as buyerName FROM Bid b JOIN User u ON b.buyerId = u.id"
      let params = []
      let whereClause = ""

      if (auctionId) {
        whereClause = " WHERE b.auctionId = ?"
        params.push(auctionId)
      }

      query += whereClause + " ORDER BY b.createdAt DESC"
      const [bids] = await connection.execute(query, params)

      return res.status(200).json({
        success: true,
        bids,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Get bids error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}