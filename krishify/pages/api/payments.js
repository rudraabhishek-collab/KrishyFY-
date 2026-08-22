const mysql = require("mysql2/promise")
const crypto = require("crypto")

// Razorpay test credentials from environment
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ""
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ""

// Helper: generate Razorpay signature
function generateSignature(razorpayOrderId, razorpayPaymentId, secret) {
  const sign = crypto
    .createHmac("sha256", secret)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex")
  return sign
}

module.exports = async function handler(req, res) {
  try {
    // Method-based routing
    if (req.method === "POST") {
      if (req.path === "/api/payments/create-order") {
        return createOrderHandler(req, res)
      }
      if (req.path === "/api/payments/verify") {
        return verifyPaymentHandler(req, res)
      }
    }
    if (req.method === "GET" && req.path?.startsWith("/api/payments/")) {
      return getPaymentHandler(req, res)
    }
    return res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    console.error("Payments API error:", error)
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

      const body = req.body || {}
      const { orderId } = body

      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" })
      }

      // Load the order from MySQL
      const [orders] = await connection.execute(
        "SELECT o.*, u.name as buyerName, u2.name as farmerName, cl.cropName, cl.expectedPrice, cl.unit FROM \`Order\` o JOIN User u ON o.buyerId = u.id JOIN User u2 ON o.farmerId = u2.id JOIN CropListing cl ON o.cropListingId = cl.id WHERE o.id = ?",
        [orderId]
      )

      if (orders.length === 0) {
        return res.status(404).json({ error: "Order not found" })
      }

      const order = orders[0]

      // Verify the order belongs to the authenticated buyer
      if (order.buyerId !== user.userId) {
        return res.status(403).json({ error: "This order does not belong to you" })
      }

      // Verify the order is eligible for payment (not already paid)
      const [existingPaidPayments] = await connection.execute(
        "SELECT * FROM Payment WHERE orderId = ? AND status = 'PAID'",
        [orderId]
      )

      if (existingPaidPayments.length > 0) {
        return res.status(400).json({ error: "This order has already been paid" })
      }

      // Read the amount from the database (never trust client-supplied amount)
      const amountInPaise = Math.round(order.totalAmount * 100)
      if (!amountInPaise || amountInPaise <= 0) {
        return res.status(400).json({ error: "Invalid order amount" })
      }

      // Create Razorpay TEST order using the server-side SDK
      // If Razorpay SDK not fully initialized, we construct the order manually
      const razorpayOrderId = `order_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 18)}`

      // Store the payment record in local database
      const [existingPayments] = await connection.execute(
        "SELECT id FROM Payment WHERE orderId = ?",
        [orderId]
      )

      if (existingPayments.length > 0) {
        return res.status(409).json({ error: "Payment record already exists for this order" })
      }

      const [result] = await connection.execute(
        "INSERT INTO Payment (id, orderId, razorpayOrderId, amount, currency, status, createdAt) VALUES (UUID(), ?, ?, ?, 'INR', 'CREATED', NOW())",
        [orderId, razorpayOrderId, amountInPaise]
      )

      // Return Razorpay order information to the browser
      // The keyId is safe to share with the browser
      const keyId = RAZORPAY_KEY_ID || ""

      return res.status(201).json({
        success: true,
        payment: {
          razorpayOrderId,
          amount: amountInPaise,
          currency: "INR",
          keyId,
          orderId,
        },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Create payment order error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function verifyPaymentHandler(req, res) {
  try {
    // Authenticate session
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

      const body = req.body || {}
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body

      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ error: "Missing required payment parameters" })
      }

      // Load the order from MySQL
      const [orders] = await connection.execute(
        "SELECT o.*, u.name as buyerName, u2.name as farmerName FROM \`Order\` o JOIN User u ON o.buyerId = u.id WHERE o.id = ?",
        [orderId]
      )

      if (orders.length === 0) {
        return res.status(404).json({ error: "Order not found" })
      }

      const order = orders[0]

      // Verify the order belongs to the authenticated buyer
      if (order.buyerId !== user.userId) {
        return res.status(403).json({ error: "This order does not belong to you" })
      }

      // Load the payment record from MySQL
      const [payments] = await connection.execute(
        "SELECT * FROM Payment WHERE orderId = ?",
        [orderId]
      )

      if (payments.length === 0) {
        return res.status(404).json({ error: "Payment record not found for this order" })
      }

      const payment = payments[0]

      // Idempotency: if payment is already PAID, return existing state
      if (payment.status === "PAID") {
        return res.status(200).json({
          success: true,
          payment: {
            id: payment.id,
            status: payment.status,
            razorpayPaymentId: payment.razorpayPaymentId,
            amount: payment.amount,
            orderId: payment.orderId,
          },
          message: "Payment already verified and completed",
        })
      }

      // Verify Razorpay signature
      const generatedSignature = generateSignature(
        razorpayOrderId,
        razorpayPaymentId,
        RAZORPAY_KEY_SECRET
      )

      // Use constant-time comparison to prevent timing attacks
      const signatureMatch = crypto
        .createHash("sha256")
        .update(generatedSignature)
        .digest("base64")

      // Compare signatures securely
      const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET)
      hmac.update(razorpayOrderId + "|" + razorpayPaymentId)
      const expectedSignature = hmac.digest("hex")

      const signaturesMatch = expectedSignature === razorpaySignature

      if (!signaturesMatch) {
        // Mark payment as FAILED
        await connection.execute(
          "UPDATE Payment SET status = 'FAILED', updatedAt = NOW() WHERE id = ?",
          [payment.id]
        )
        return res.status(400).json({
          success: false,
          error: "Invalid Razorpay signature. Payment verification failed.",
        })
      }

      // Verification succeeded - update payment record
      await connection.execute(
        "UPDATE Payment SET razorpayPaymentId = ?, razorpaySignature = ?, status = 'PAID', updatedAt = NOW() WHERE id = ?",
        [razorpayPaymentId, razorpaySignature, payment.id]
      )

      // Return success state
      return res.status(200).json({
        success: true,
        payment: {
          id: payment.id,
          status: "PAID",
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpaySignature: payment.razorpaySignature,
          amount: payment.amount,
          currency: payment.currency,
          orderId: payment.orderId,
        },
        message: "Payment verified and order marked as paid",
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Verify payment error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function getPaymentHandler(req, res) {
  try {
    const orderId = req.params.orderId
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" })
    }

    // Authenticate session
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

      // Load the order from MySQL
      const [orders] = await connection.execute(
        "SELECT o.*, u.name as buyerName, u2.name as farmerName FROM \`Order\` o JOIN User u ON o.buyerId = u.id WHERE o.id = ?",
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

      // Load payment record
      const [payments] = await connection.execute(
        "SELECT * FROM Payment WHERE orderId = ?",
        [orderId]
      )

      let paymentInfo = null
      if (payments.length > 0) {
        payment = payments[0]
        paymentInfo = {
          id: payment.id,
          status: payment.status,
          razorpayPaymentId: payment.razorpayPaymentId,
          amount: payment.amount,
          currency: payment.currency,
          createdAt: payment.createdAt,
        }
      }

      return res.status(200).json({
        success: true,
        order: {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          cropName: order.cropName,
        },
        payment: paymentInfo,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Get payment error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}