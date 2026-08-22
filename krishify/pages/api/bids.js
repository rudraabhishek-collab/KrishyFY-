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
    if (req.method === "POST" && req.path?.includes("/convert")) {
      return convertAuctionWinnerHandler(req, res)
    }
    return res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    console.error("Bids API error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function createBidHandler(req, res) {
  try {
    // (same as previous bids.js - omitted for brevity, reuse existing logic)
    // Authenticate session, verify role=buyer, validate auction, create bid
    const sessionId = req.cookies["krishify_session"]
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

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

      // Check current time is within auction window
      const now = new Date()
      if (now < new Date(auction.startsAt) || now > new Date(auction.endsAt)) {
        return res.status(400).json({ error: "Auction is not currently active" })
      }

      // Check buyer is not the farmer
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
    // (same as previous - omitted for brevity)
    const sessionId = req.cookies["krishify_session"]
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

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
      const [sessions] = await connection.execute(
        "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
        [sessionId]
      )

      if (sessions.length === 0) {
        return res.status(401).json({ error: "Unauthenticated or session expired" })
      }

      const user = sessions[0]

      const auctionId = req.query.auctionId
      if (auctionId) {
        const [auctionChecks] = await connection.execute(
          "SELECT a.id, a.cropListingId, cl.farmerId FROM Auction a JOIN CropListing cl ON a.cropListingId = cl.id WHERE a.id = ?",
          [auctionId]
        )

        if (auctionChecks.length === 0) {
          return res.status(404).json({ error: "Auction not found" })
        }

        if (user.role === "farmer" && auctionChecks[0].farmerId !== user.userId) {
          return res.status(403).json({ error: "Not your auction" })
        }
      }

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

async function convertAuctionWinnerHandler(req, res) {
  try {
    // Convert auction winner into an order
    const sessionId = req.cookies["krishify_session"]
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    // Verify session
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
      // Verify session
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

      const { auctionId } = req.body || {}

      if (!auctionId) {
        return res.status(400).json({ error: "Auction ID is required" })
      }

      // Verify auction exists and has ended
      const [auctions] = await connection.execute(
        "SELECT a.*, cl.farmerId, cl.cropName, cl.status as cropStatus, cl.expectedPrice, cl.quantity as listedQuantity FROM Auction a JOIN CropListing cl ON a.cropListingId = cl.id WHERE a.id = ? AND a.status = 'ACTIVE'",
        [auctionId]
      )

      if (auctions.length === 0) {
        return res.status(404).json({ error: "Auction not found or still active" })
      }

      const auction = auctions[0]

      // Auction must have ended
      const now = new Date()
      if (now > new Date(auction.endsAt)) {
        // Check that the user is the winning bidder
        const [highestBid] = await connection.execute(
          "SELECT buyerId, amount FROM Bid WHERE auctionId = ? ORDER BY amount DESC LIMIT 1",
          [auctionId]
        )

        if (highestBid.length === 0) {
          return res.status(400).json({ error: "No bids found for this auction" })
        }

        if (highestBid[0].buyerId !== user.userId) {
          return res.status(403).json({ error: "You are not the winning bidder" })
        }

        // Verify the crop is not already sold
        if (auction.cropStatus === "SOLD") {
          return res.status(400).json({ error: "Crop is already sold" })
        }

        // Verify the buyer is not the farmer
        if (auction.farmerId === user.userId) {
          return res.status(400).json({ error: "Cannot purchase your own crop" })
        }

        // Check for existing order
        const [existingOrders] = await connection.execute(
          "SELECT id FROM \`Order\` WHERE cropListingId = ? AND status != 'CANCELLED'",
          [auction.cropListingId]
        )

        if (existingOrders.length > 0) {
          return res.status(409).json({ error: "An order already exists for this crop" })
        }

        // Create the order - price equals the winning bid amount
        const winningAmount = highestBid[0].amount
        const quantity = "1" // default quantity, or could be calculated
        const unit = "unit"
        const totalAmount = winningAmount

        const [result] = await connection.execute(
          "INSERT INTO \`Order\` (id, cropListingId, buyerId, farmerId, auctionId, quantity, unit, pricePerUnit, totalAmount, status, createdAt) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())",
          [auction.cropListingId, user.userId, auction.farmerId, auctionId, quantity, unit, winningAmount, totalAmount]
        )

        const orderId = result.insertId

        // Mark crop as SOLD
        await connection.execute(
          "UPDATE CropListing SET status = 'SOLD' WHERE id = ?",
          [auction.cropListingId]
        )

        // Mark auction as completed
        await connection.execute(
          "UPDATE Auction SET status = 'COMPLETED' WHERE id = ?",
          [auctionId]
        )

        // Return the created order
        const [orders] = await connection.execute(
          "SELECT o.*, u.name as buyerName, u2.name as farmerName FROM \`Order\` o JOIN User u ON o.buyerId = u.id JOIN User u2 ON o.farmerId = u2.id WHERE o.id = ?",
          [orderId]
        )

        return res.status(201).json({
          success: true,
          order: orders[0],
          message: "Auction won and order created successfully",
        })
      } else {
        return res.status(400).json({ error: "Auction has not ended yet" })
      }
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Convert auction winner error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}