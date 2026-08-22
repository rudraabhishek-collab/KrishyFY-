const mysql = require("mysql2/promise")

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "ROOT",
  database: "krishify",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

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
    if (req.method === "POST") return createOrderHandler(req, res)
    if (req.method === "GET") return listOrdersHandler(req, res)
    return res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    console.error("Orders API error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function createOrderHandler(req, res) {
  const sessionId = req.cookies["krishify_session"]
  const user = await getSession(sessionId)

  if (!user) {
    return res.status(401).json({ error: "Unauthenticated or session expired" })
  }
  if (user.role !== "buyer") {
    return res.status(403).json({ error: "Buyer role required" })
  }

  const body = req.body || {}
  const { cropListingId, quantity } = body

  if (!cropListingId) {
    return res.status(400).json({ error: "Crop listing ID is required" })
  }
  if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
    return res.status(400).json({ error: "Valid quantity is required" })
  }

  const connection = await pool.getConnection()
  try {
    const [listings] = await connection.execute(
      "SELECT id, farmerId, cropName, quantity AS listedQuantity, unit, expectedPrice, status FROM CropListing WHERE id = ?",
      [cropListingId]
    )

    if (listings.length === 0) {
      return res.status(404).json({ error: "Crop listing not found" })
    }

    const crop = listings[0]

    if (crop.status !== "ACTIVE") {
      return res.status(400).json({ error: "Crop is not available for purchase" })
    }

    if (crop.farmerId === user.userId) {
      return res.status(400).json({ error: "Cannot purchase your own crop" })
    }

    const requestedQty = parseInt(quantity)
    const listedQty = parseInt(crop.listedQuantity)
    if (requestedQty > listedQty) {
      return res.status(400).json({ error: "Requested quantity exceeds available quantity" })
    }

    if (crop.expectedPrice === null || crop.expectedPrice === undefined) {
      return res.status(400).json({ error: "Price not available for this crop" })
    }

    const pricePerUnit = Number(crop.expectedPrice)
    const totalAmount = pricePerUnit * requestedQty

    const orderId = require("crypto").randomUUID()
    await connection.execute(
      "INSERT INTO `Order` (id, cropListingId, buyerId, farmerId, quantity, unit, pricePerUnit, totalAmount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())",
      [orderId, cropListingId, user.userId, crop.farmerId, String(requestedQty), crop.unit, pricePerUnit, totalAmount]
    )

    // Mark as SOLD if fully purchased
    if (requestedQty >= listedQty) {
      await connection.execute(
        "UPDATE CropListing SET status = 'SOLD' WHERE id = ?",
        [cropListingId]
      )
    }

    const [orders] = await connection.execute(
      `SELECT o.*, ub.name AS buyerName, uf.name AS farmerName, cl.cropName
       FROM \`Order\` o
       JOIN User ub ON o.buyerId = ub.id
       JOIN User uf ON o.farmerId = uf.id
       JOIN CropListing cl ON o.cropListingId = cl.id
       WHERE o.id = ?`,
      [orderId]
    )

    return res.status(201).json({ success: true, order: orders[0] })
  } finally {
    connection.release()
  }
}

async function listOrdersHandler(req, res) {
  const sessionId = req.cookies["krishify_session"]
  const user = await getSession(sessionId)

  if (!user) {
    return res.status(401).json({ error: "Unauthenticated or session expired" })
  }

  const connection = await pool.getConnection()
  try {
    let query = ""
    let params = []

    if (user.role === "buyer") {
      query = `SELECT o.*, uf.name AS farmerName, cl.cropName
               FROM \`Order\` o
               JOIN User uf ON o.farmerId = uf.id
               JOIN CropListing cl ON o.cropListingId = cl.id
               WHERE o.buyerId = ?
               ORDER BY o.createdAt DESC`
      params.push(user.userId)
    } else if (user.role === "farmer") {
      query = `SELECT o.*, ub.name AS buyerName, cl.cropName
               FROM \`Order\` o
               JOIN User ub ON o.buyerId = ub.id
               JOIN CropListing cl ON o.cropListingId = cl.id
               WHERE o.farmerId = ?
               ORDER BY o.createdAt DESC`
      params.push(user.userId)
    } else if (user.role === "admin") {
      query = `SELECT o.*, ub.name AS buyerName, uf.name AS farmerName, cl.cropName
               FROM \`Order\` o
               JOIN User ub ON o.buyerId = ub.id
               JOIN User uf ON o.farmerId = uf.id
               JOIN CropListing cl ON o.cropListingId = cl.id
               ORDER BY o.createdAt DESC`
    } else {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const [orders] = await connection.execute(query, params)

    return res.status(200).json({ success: true, orders })
  } finally {
    connection.release()
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
