const { getPool } = require('../../../lib/db')
const crypto = require('crypto')

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

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, testMode } = req.body || {}
    if (!orderId || !razorpayOrderId) {
      return res.status(400).json({ error: 'Missing required payment parameters' })
    }

    const conn = await pool.getConnection()
    try {
      const [payments] = await conn.execute('SELECT * FROM Payment WHERE orderId = ?', [orderId])
      if (payments.length === 0) return res.status(404).json({ error: 'Payment record not found' })
      const payment = payments[0]

      if (payment.status === 'PAID') {
        return res.status(200).json({ success: true, payment: { id: payment.id, status: 'PAID', razorpayPaymentId: payment.razorpayPaymentId, amount: payment.amount } })
      }

      const [orders] = await conn.execute('SELECT buyerId FROM `Order` WHERE id = ?', [orderId])
      if (orders.length === 0 || orders[0].buyerId !== user.userId) {
        return res.status(403).json({ error: 'Order not yours' })
      }

      let finalPaymentId = razorpayPaymentId
      let finalSignature = razorpaySignature
      const isSimulatedTestOrder = payment.razorpayOrderId.startsWith('order_test_') && razorpayOrderId === payment.razorpayOrderId

      if (isSimulatedTestOrder && testMode) {
        finalPaymentId = finalPaymentId || `pay_test_${Date.now()}`
        finalSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
          .update(razorpayOrderId + '|' + finalPaymentId)
          .digest('hex')
      } else {
        if (!finalPaymentId || !finalSignature) {
          return res.status(400).json({ error: 'Missing required payment parameters' })
        }
        const secret = process.env.RAZORPAY_KEY_SECRET || ''
        const expectedSig = crypto.createHmac('sha256', secret)
          .update(razorpayOrderId + '|' + finalPaymentId)
          .digest('hex')

        if (secret && expectedSig !== finalSignature) {
          await conn.execute("UPDATE Payment SET status = 'FAILED', updatedAt = NOW() WHERE id = ?", [payment.id])
          return res.status(400).json({ success: false, error: 'Invalid signature' })
        }
      }

      await conn.execute(
        "UPDATE Payment SET razorpayPaymentId = ?, razorpaySignature = ?, status = 'PAID', updatedAt = NOW() WHERE id = ?",
        [finalPaymentId, finalSignature, payment.id]
      )

      const [fullOrder] = await conn.execute(
        'SELECT o.farmerId, cl.cropName FROM `Order` o JOIN CropListing cl ON o.cropListingId = cl.id WHERE o.id = ?',
        [orderId]
      )
      if (fullOrder.length > 0) {
        await conn.execute(
          'INSERT INTO Notification (id, userId, type, title, message, relatedEntityType, relatedEntityId, `read`, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, ?, ?, false, NOW(), NOW())',
          [fullOrder[0].farmerId, 'PAYMENT', 'Payment received', `Payment received for order of ${fullOrder[0].cropName}.`, 'order', orderId]
        ).catch(() => {})
      }

      return res.status(200).json({ success: true, payment: { id: payment.id, status: 'PAID', razorpayPaymentId: finalPaymentId, amount: payment.amount } })
    } finally { conn.release() }
  } catch (err) {
    console.error('Verify payment error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
