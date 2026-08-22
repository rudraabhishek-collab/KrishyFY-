const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    // Step 1: Verify authentication
    if (!req.cookies || !req.cookies.krishify_session) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const sessionId = req.cookies.krishify_session

    // Step 2: Verify session expiry
    const pool = await mysql.createPool({
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
      // Step 3: Get user from session
      const [sessions] = await connection.execute(
        "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
        [sessionId]
      )

      if (sessions.length === 0) {
        return res.status(401).json({ error: "Session expired" })
      }

      const user = sessions[0]
      const userId = user.userId
      const role = user.role

      // Step 4: Retrieve order ID from body
      const { orderId } = req.body
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" })
      }

      // Step 5: Verify order exists and check ownership
      let orderQuery
      let orderParams

      if (role === "buyer") {
        orderQuery = "SELECT * FROM \`Order\` WHERE id = ? AND buyerId = ?"
        orderParams = [orderId, userId]
      } else if (role === "farmer") {
        orderQuery = "SELECT * FROM \`Order\` WHERE id = ? AND farmerId = ?"
        orderParams = [orderId, userId]
      } else {
        return res.status(403).json({ error: "Unauthenticated role" })
      }

      const [orders] = await connection.execute(orderQuery, orderParams)

      if (orders.length === 0) {
        return res.status(403).json({ error: "Order not found or not owned by you" })
      }

      const order = orders[0]

      // Step 6: Check order status - delivery can be created when order is CONFIRMED
      // Phase 5 order lifecycle: PENDING → CONFIRMED → PROCESSING → COMPLETED
      // Also allow CREATED status for orders that haven't progressed
      const eligibleStatuses = ["PENDING", "CONFIRMED"]
      if (!eligibleStatuses.includes(order.status)) {
        return res.status(409).json({
          error: `Cannot create delivery for order in "${order.status}" status. Order must be PENDING or CONFIRMED.`,
        })
      }

      // Step 7: Check for existing delivery (one delivery per order)
      const [existingDeliveries] = await connection.execute(
        "SELECT * FROM Delivery WHERE orderId = ?",
        [orderId]
      )

      if (existingDeliveries.length > 0) {
        return res.status(409).json({
          error: "Delivery already exists for this order. Each order has one delivery record.",
        })
      }

      // Step 8: Create delivery with status CREATED
      const [deliveryResult] = await connection.execute(
        "INSERT INTO Delivery (id, orderId, status, createdAt, updatedAt) VALUES (UUID?, ?, 'CREATED', NOW(), NOW())",
        [uuidv4()]
      )

      const deliveryId = deliveryResult.insertId

      // Step 9: Create first DeliveryEvent
      await connection.execute(
        "INSERT INTO DeliveryEvent (id, deliveryId, status, title, description, createdAt, updatedAt) VALUES (UUID?, ?, 'CREATED', 'Delivery created', 'Delivery tracking has been initialized.', NOW(), NOW())",
        [uuidv4(), deliveryId]
      )

      // Step 10: Return delivery information
      const [delivery] = await connection.execute(
        "SELECT d.*, o.id as orderId, o.status as orderStatus, u.name as userName FROM Delivery d JOIN \`Order\` o ON d.orderId = o.id JOIN User u ON o.buyerId = u.id WHERE d.id = ?",
        [deliveryId]
      )

      return res.status(201).json({
        success: true,
        delivery: delivery[0],
      })
    } finally {
      await connection.release()
    }
  } catch (error) {
    console.error("Create delivery error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = Math.random() * 16 | 0
      return c === "x" ? r : (r & 0x3 | 0x8)
    }
  )
}