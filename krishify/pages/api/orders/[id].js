const { getPool } = require('../../../lib/db')
async function handler(req, res) {
  try {
    const orderId = req.query.id
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" })
    }

    // Check for status update
    if (req.method === "PATCH") {
      return updateOrderStatusHandler(req, res)
    }

    // GET order detail
    return getOrderDetailHandler(req, res)
  } catch (error) {
    console.error("Order API error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function getOrderDetailHandler(req, res) {
  try {
    const orderId = req.query.id
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" })
    }

    // Authenticate session
    const sessionId = req.cookies["krishify_session"]
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    // Verify session
    const pool = getPool()

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

      // Get order details
      const [orders] = await connection.execute(
        "SELECT o.*, u.name as buyerName, u2.name as farmerName, cl.cropName FROM \`Order\` o JOIN User u ON o.buyerId = u.id JOIN User u2 ON o.farmerId = u2.id JOIN CropListing cl ON o.cropListingId = cl.id WHERE o.id = ?",
        [orderId]
      )

      if (orders.length === 0) {
        return res.status(404).json({ error: "Order not found" })
      }

      const order = orders[0]

      // Check authorization
      const isBuyer = user.role === "buyer" && order.buyerId === user.userId
      const isFarmer = user.role === "farmer" && order.farmerId === user.userId

      if (!isBuyer && !isFarmer) {
        return res.status(403).json({ error: "Forbidden: unauthorized access to this order" })
      }

      return res.status(200).json({
        success: true,
        order,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Get order detail error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function updateOrderStatusHandler(req, res) {
  try {
    const orderId = req.query.id
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" })
    }

    // Authenticate session
    const sessionId = req.cookies["krishify_session"]
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    // Verify session
    const pool = getPool()

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

      // Only farmers can update order status
      if (user.role !== "farmer") {
        return res.status(403).json({ error: "Farmer role required" })
      }

      const body = req.body || {}
      const { status } = body

      if (!status) {
        return res.status(400).json({ error: "Status is required" })
      }

      // Validate allowed statuses
      const allowedStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"]
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" })
      }

      // Get order and verify it belongs to this farmer
      const [orders] = await connection.execute(
        "SELECT id, farmerId, status FROM \`Order\` WHERE id = ?",
        [orderId]
      )

      if (orders.length === 0) {
        return res.status(404).json({ error: "Order not found" })
      }

      const order = orders[0]

      if (order.farmerId !== user.userId) {
        return res.status(403).json({ error: "This order does not belong to you" })
      }

      // Validate status transitions
      const currentStatus = order.status

      // Allowed transitions
      const validTransitions = {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["COMPLETED", "CANCELLED"],
        COMPLETED: [],
        CANCELLED: [],
      }

      const allowedNext = validTransitions[currentStatus] || []
      if (!allowedNext.includes(status)) {
        return res.status(400).json({ error: `Invalid status transition from "${currentStatus}" to "${status}"` })
      }

      // Update order status
      await connection.execute(
        "UPDATE \`Order\` SET status = ?, updatedAt = NOW() WHERE id = ?",
        [status, orderId]
      )

      // If marking as COMPLETED, also mark the crop as SOLD if not already
      if (status === "COMPLETED" && currentStatus !== "COMPLETED") {
        const [crop] = await connection.execute(
          "SELECT status FROM CropListing WHERE id = ?",
          [order.cropListingId]
        )
        if (crop[0].status !== "SOLD") {
          await connection.execute(
            "UPDATE CropListing SET status = 'SOLD' WHERE id = ?",
            [order.cropListingId]
          )
        }
      }

      // Return updated order
      const [updatedOrders] = await connection.execute(
        "SELECT o.*, u.name as buyerName, u2.name as farmerName, cl.cropName FROM \`Order\` o JOIN User u ON o.buyerId = u.id JOIN User u2 ON o.farmerId = u2.id JOIN CropListing cl ON o.cropListingId = cl.id WHERE o.id = ?",
        [orderId]
      )

      return res.status(200).json({
        success: true,
        order: updatedOrders[0],
        message: `Order status updated to ${status}`,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Update order status error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

exports.default = handler
module.exports = handler
if (typeof module.exports === "function") { module.exports.default = module.exports; }
