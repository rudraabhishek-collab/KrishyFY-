const mysql = require("mysql2/promise")

// Allowed status transitions: currentStatus → newStatus
const allowedTransitions = {
  CREATED: ["PACKED", "CANCELLED"],
  PACKED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [], // No further changes
  CANCELLED: [], // No further changes
}

function validateTrackingNumber(trackingNumber) {
  if (trackingNumber === undefined || trackingNumber === null) return true
  if (typeof trackingNumber !== "string") return false
  const trimmed = trackingNumber.trim()
  if (trimmed.length === 0) return false
  if (trimmed.length > 50) return false
  return true
}

function validateDeliveryPartner(deliveryPartner) {
  if (deliveryPartner === undefined || deliveryPartner === null) return true
  if (typeof deliveryPartner !== "string") return false
  const trimmed = deliveryPartner.trim()
  if (trimmed.length === 0) return false
  if (trimmed.length > 50) return false
  return true
}

function validateEstimatedDeliveryDate(dateString) {
  if (dateString === undefined || dateString === null) return true
  if (typeof dateString !== "string") return false
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return false
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 1)
  if (date < minDate) return false
  return true
}

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

      // Step 4: Retrieve order ID from params
      const orderId = req.params.orderId
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" })
      }

      // Step 5: Verify order exists and check authorization
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
        return res.status(404).json({ error: "Order not found or not accessible" })
      }

      const order = orders[0]

      // Step 6: Retrieve delivery for this order
      const [deliveries] = await connection.execute(
        "SELECT * FROM Delivery WHERE orderId = ?",
        [orderId]
      )

      if (deliveries.length === 0) {
        return res.status(404).json({ error: "Delivery record not found for this order" })
      }

      const delivery = deliveries[0]

      // Step 7: Check if delivery is in a terminal state
      if (delivery.status === "DELIVERED") {
        return res.status(409).json({
          error: "Delivery has already been delivered. No further status changes allowed.",
        })
      }

      if (delivery.status === "CANCELLED") {
        return res.status(409).json({
          error: "Delivery has been cancelled. No further status changes allowed.",
        })
      }

      // Step 8: Validate and apply tracking information (farmers only)
      if (role === "buyer") {
        // Buyers cannot modify tracking information
        if (req.body.trackingNumber !== undefined || req.body.deliveryPartner !== undefined || req.body.estimatedDeliveryDate !== undefined) {
          return res.status(403).json({ error: "Buyers cannot modify tracking information" })
        }
      } else {
        // Farmers can modify tracking information with validation
        if (req.body.trackingNumber !== undefined) {
          if (!validateTrackingNumber(req.body.trackingNumber)) {
            return res.status(400).json({ error: "Invalid tracking number. Must be a non-empty string up to 50 characters." })
          }
          delivery.trackingNumber = req.body.trackingNumber.trim()
        }

        if (req.body.deliveryPartner !== undefined) {
          if (!validateDeliveryPartner(req.body.deliveryPartner)) {
            return res.status(400).json({ error: "Invalid delivery partner. Must be a non-empty string up to 50 characters." })
          }
          delivery.deliveryPartner = req.body.deliveryPartner.trim()
        }

        if (req.body.estimatedDeliveryDate !== undefined) {
          if (!validateEstimatedDeliveryDate(req.body.estimatedDeliveryDate)) {
            return res.status(400).json({ error: "Invalid estimated delivery date." })
          }
          delivery.estimatedDeliveryDate = new Date(req.body.estimatedDeliveryDate)
        }
      }

      // Step 9: Validate the requested status transition
      const { status } = req.body
      if (!status && req.body.trackingNumber === undefined && req.body.deliveryPartner === undefined && req.body.estimatedDeliveryDate === undefined) {
        return res.status(400).json({ error: "At least one field to update is required" })
      }

      const permittedTransitions = allowedTransitions[delivery.status]
      if (!permittedTransitions || !permittedTransitions.includes(status)) {
        return res.status(409).json({
          error: `Invalid transition from "${delivery.status}" to "${status}".`,
        })
      }

      // Step 10: Update delivery status and timestamps
      const updateParts = ["status = ?", "updatedAt = NOW()"]
      const updateParams = [status]

      // Add dispatchedAt if transitioning to DISPATCHED
      if (status === "DISPATCHED") {
        updateParts.push("dispatchedAt = NOW()")
      }

      // Add deliveredAt if transitioning to DELIVERED
      if (status === "DELIVERED") {
        updateParts.push("deliveredAt = NOW()")
      }

      // Add tracking information if provided
      if (delivery.trackingNumber !== undefined) {
        updateParts.push("trackingNumber = ?")
        updateParams.push(delivery.trackingNumber)
      }
      if (delivery.deliveryPartner !== undefined) {
        updateParts.push("deliveryPartner = ?")
        updateParams.push(delivery.deliveryPartner)
      }
      if (delivery.estimatedDeliveryDate !== undefined) {
        updateParts.push("estimatedDeliveryDate = ?")
        updateParams.push(delivery.estimatedDeliveryDate)
      }

      await connection.execute(
        `UPDATE Delivery SET ${updateParts.join(", ")} WHERE id = ?`,
        [...updateParams, delivery.id]
      )

      // Step 11: Create DeliveryEvent for status transitions
      const eventMap = {
        CREATED: { title: "Delivery created", description: "Delivery tracking has been initialized." },
        PACKED: { title: "Delivery packed", description: "Delivery has been packed for shipment." },
        DISPATCHED: { title: "Delivery dispatched", description: "Delivery has been dispatched." },
        IN_TRANSIT: { title: "In transit", description: "Delivery is in transit." },
        OUT_FOR_DELIVERY: { title: "Out for delivery", description: "Delivery is out for delivery." },
        DELIVERED: { title: "Delivered", description: "Delivery has been delivered." },
        CANCELLED: { title: "Delivery cancelled", description: "Delivery has been cancelled." },
      }

      const eventData = eventMap[status] || { title: status, description: "Status updated." }

      if (status) {
        await connection.execute(
          "INSERT INTO DeliveryEvent (id, deliveryId, status, title, description, createdAt, updatedAt) VALUES (UUID?, ?, ?, ?, ?, NOW(), NOW())",
          [uuidv4(), delivery.id, status, eventData.title, eventData.description]
        )
      }

      // Step 12: Create buyer notification for important status changes
      const notificationTypes = {
        DISPATCHED: "Your order has been dispatched.",
        DELIVERED: "Your order has been delivered.",
        CANCELLED: "Your order has been cancelled.",
      }

      if (status && notificationTypes[status]) {
        const [orderWithBuyer] = await connection.execute(
          "SELECT buyerId FROM \`Order\` WHERE id = ?",
          [orderId]
        )

        if (orderWithBuyer.length > 0 && orderWithBuyer[0].buyerId) {
          const buyerId = orderWithBuyer[0].buyerId

          // Check for duplicate notifications
          const [existingNotifs] = await connection.execute(
            "SELECT * FROM Notification WHERE userId = ? AND relatedEntityId = ? AND type = ? AND read = false",
            [buyerId, delivery.id, status]
          )

          if (existingNotifs.length === 0) {
            await connection.execute(
              "INSERT INTO Notification (id, userId, type, title, message, relatedEntityType, relatedEntityId, read, createdAt, updatedAt) VALUES (UUID?, ?, ?, ?, ?, ?, ?, false, NOW(), NOW())",
              [uuidv4(), buyerId, status, eventData.title, notificationTypes[status], "DELIVERY", delivery.id]
            )
          }
        }
      }

      // Step 13: Return updated delivery information
      const [updatedDelivery] = await connection.execute(
        "SELECT d.*, o.id as orderId, o.status as orderStatus, u.name as buyerName FROM Delivery d JOIN \`Order\` o ON d.orderId = o.id JOIN User u ON o.buyerId = u.id WHERE d.id = ?",
        [delivery.id]
      )

      // Build timeline events
      const [events] = await connection.execute(
        "SELECT * FROM DeliveryEvent WHERE deliveryId = ? ORDER BY createdAt ASC",
        [delivery.id]
      )

      const timeline = []
      for (const event of events) {
        timeline.push({
          id: event.id,
          status: event.status,
          title: event.title,
          description: event.description,
          createdAt: event.createdAt,
        })
      }

      return res.status(200).json({
        success: true,
        delivery: updatedDelivery[0],
        timeline,
      })
    } finally {
      await connection.release()
    }
  } catch (error) {
    console.error("Patch delivery error:", error)
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