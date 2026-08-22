const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    // Method-based routing
    if (req.method === "POST") {
      return createOrderHandler(req, res)
    }
    if (req.method === "GET") {
      return listOrdersHandler(req, res)
    }
    return res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    console.error("Orders API error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function createOrderHandler(req, res) {
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
      const buyerId = user.userId

      // Only buyers can create direct purchases
      if (user.role !== "buyer") {
        return res.status(403).json({ error: "Buyer role required" })
      }

      const body = req.body || {}
      const { cropListingId, quantity } = body

      // Validate required fields
      if (!cropListingId) {
        return res.status(400).json({ error: "Crop listing ID is required" })
      }
      if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
        return res.status(400).json({ error: "Valid quantity is required" })
      }

      // Verify crop listing exists
      const [listings] = await connection.execute(
        "SELECT id, farmerId, cropName, quantity as listedQuantity, unit, expectedPrice, status FROM CropListing WHERE id = ?",
        [cropListingId]
      )

      if (listings.length === 0) {
        return res.status(404).json({ error: "Crop listing not found" })
      }

      const crop = listings[0]

      // Verify crop is ACTIVE
      if (crop.status !== "ACTIVE") {
        return res.status(400).json({ error: "Crop is not available for purchase" })
      }

      // Verify buyer is not the farmer
      if (crop.farmerId === buyerId) {
        return res.status(400).json({ error: "Cannot purchase your own crop" })
      }

      // Verify requested quantity is available
      const requestedQty = parseInt(quantity)
      const listedQty = parseInt(crop.listedQuantity)
      if (requestedQty > listedQty) {
        return res.status(400).json({ error: "Requested quantity exceeds available quantity" })
      }

      // Calculate price server-side (never trust client-supplied price)
      const pricePerUnit = crop.expectedPrice
      if (pricePerUnit === null || pricePerUnit === undefined) {
        return res.status(400).json({ error: "Price not available for this crop" })
      }

      const totalAmount = pricePerUnit * requestedQty

      // Create the order
      const [result] = await connection.execute(
        "INSERT INTO \`Order\` (id, cropListingId, buyerId, farmerId, quantity, unit, pricePerUnit, totalAmount, status, createdAt) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())",
        [cropListingId, buyerId, crop.farmerId, quantity, crop.unit, pricePerUnit, totalAmount]
      )

      const orderId = result.insertId

      // Update crop status to SOLD if full quantity is purchased
      // For now, mark as SOLD if the listing is fully purchased
      const remainingQty = listedQty - requestedQty
      if (remainingQty <= 0) {
        await connection.execute(
          "UPDATE CropListing SET status = 'SOLD' WHERE id = ?",
          [cropListingId]
        )
      }

      // Return the created order
      const [orders] = await connection.execute(
        "SELECT o.*, u.name as buyerName, u2.name as farmerName FROM \`Order\` o JOIN User u ON o.buyerId = u.id JOIN User u2 ON o.farmerId = u2.id WHERE o.id = ?",
        [orderId]
      )

      return res.status(201).json({
        success: true,
        order: orders[0],
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Create order error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function listOrdersHandler(req, res) {
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

      // Build query based on role
      let query = ""
      let params = []

      if (user.role === "buyer") {
        // Buyer sees only their own orders
        query = "SELECT o.*, u.name as farmerName, cl.cropName FROM \`Order\` o JOIN User u ON o.farmerId = u.id JOIN CropListing cl ON o.cropListingId = cl.id WHERE o.buyerId = ? ORDER BY o.createdAt DESC"
        params.push(buyerId)
      } else if (user.role === "farmer") {
        // Farmer sees only orders for their crops
        query = "SELECT o.*, u.name as buyerName, cl.cropName FROM \`Order\` o JOIN User u ON o.buyerId = u.id JOIN CropListing cl ON o.cropListingId = cl.id WHERE o.farmerId = ? ORDER BY o.createdAt DESC"
        params.push(user.userId)
      } else {
        return res.status(403).json({ error: "Unauthorized" })
      }

      const [orders] = await connection.execute(query, params)

      return res.status(200).json({
        success: true,
        orders,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("List orders error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}