const mysql = require('mysql2/promise')

const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'ROOT', database: 'krishify', waitForConnections: true, connectionLimit: 10, queueLimit: 0 })

async function getUser(sessionId) {
  if (!sessionId) return null
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.execute(
      'SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()',
      [sessionId]
    )
    return rows[0] || null
  } finally { conn.release() }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const user = await getUser(req.cookies?.krishify_session)
    if (!user) return res.status(401).json({ error: 'Unauthenticated' })
    if (user.role !== 'buyer') return res.status(403).json({ error: 'Buyer role required' })

    const { orderId } = req.body || {}
    if (!orderId) return res.status(400).json({ error: 'orderId is required' })

    const conn = await pool.getConnection()
    try {
      const [orders] = await conn.execute(
        'SELECT * FROM `Order` WHERE id = ? AND buyerId = ?',
        [orderId, user.userId]
      )
      if (orders.length === 0) return res.status(404).json({ error: 'Order not found' })
      const order = orders[0]
      if (order.status === 'CANCELLED') return res.status(400).json({ error: 'Order is cancelled' })

      // Check already paid
      const [paid] = await conn.execute("SELECT id FROM Payment WHERE orderId = ? AND status = 'PAID'", [orderId])
      if (paid.length > 0) return res.status(400).json({ error: 'Order already paid' })

      // Check existing payment record
      const [existing] = await conn.execute('SELECT id FROM Payment WHERE orderId = ?', [orderId])
      if (existing.length > 0) return res.status(409).json({ error: 'Payment record already exists for this order' })

      const amountInPaise = Math.round(Number(order.totalAmount) * 100)
      if (!amountInPaise || amountInPaise <= 0) return res.status(400).json({ error: 'Invalid order amount' })

      // Generate test Razorpay order ID
      const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

      await conn.execute(
        "INSERT INTO Payment (id, orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, currency, status, createdAt, updatedAt) VALUES (UUID(), ?, ?, '', '', ?, 'INR', 'CREATED', NOW(), NOW())",
        [orderId, razorpayOrderId, amountInPaise]
      )

      return res.status(201).json({
        success: true,
        payment: {
          razorpayOrderId,
          amount: amountInPaise,
          currency: 'INR',
          keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          orderId,
        }
      })
    } finally { conn.release() }
  } catch (err) {
    console.error('Create payment order error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
