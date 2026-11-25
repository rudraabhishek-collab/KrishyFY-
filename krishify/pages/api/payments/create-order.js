const { getPool } = require('../../../lib/db')
const Razorpay = require('razorpay')

const pool = getPool()

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

      const [paid] = await conn.execute("SELECT id FROM Payment WHERE orderId = ? AND status = 'PAID'", [orderId])
      if (paid.length > 0) return res.status(400).json({ error: 'Order already paid' })

      const amountInPaise = Math.round(Number(order.totalAmount) * 100)
      if (!amountInPaise || amountInPaise <= 0) return res.status(400).json({ error: 'Invalid order amount' })

      const keyId = process.env.RAZORPAY_KEY_ID || ''
      const keySecret = process.env.RAZORPAY_KEY_SECRET || ''
      let razorpayOrderId = null
      let testMode = false

      if (keyId && keySecret && !keyId.includes('placeholder') && !keyId.includes('your_key')) {
        try {
          const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })
          const rzpOrder = await rzp.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${orderId.slice(0, 28)}`,
          })
          razorpayOrderId = rzpOrder.id
        } catch (rzpErr) {
          console.warn('[payment] Razorpay API unavailable, falling back to simulated TEST mode:', rzpErr.message)
        }
      }

      if (!razorpayOrderId) {
        razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
        testMode = true
      }

      const [existing] = await conn.execute('SELECT id FROM Payment WHERE orderId = ?', [orderId])
      if (existing.length > 0) {
        await conn.execute(
          "UPDATE Payment SET razorpayOrderId = ?, razorpayPaymentId = '', razorpaySignature = '', amount = ?, status = 'CREATED', updatedAt = NOW() WHERE orderId = ?",
          [razorpayOrderId, amountInPaise, orderId]
        )
      } else {
        await conn.execute(
          "INSERT INTO Payment (id, orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, currency, status, createdAt, updatedAt) VALUES (UUID(), ?, ?, '', '', ?, 'INR', 'CREATED', NOW(), NOW())",
          [orderId, razorpayOrderId, amountInPaise]
        )
      }

      return res.status(201).json({
        success: true,
        payment: {
          razorpayOrderId,
          amount: amountInPaise,
          currency: 'INR',
          keyId: keyId || 'rzp_test_placeholder',
          orderId,
          testMode,
        }
      })
    } finally { conn.release() }
  } catch (err) {
    console.error('Create payment order error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
