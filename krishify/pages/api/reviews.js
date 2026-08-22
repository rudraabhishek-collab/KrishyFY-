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

    const { orderId, rating, comment } = req.body || {}
    if (!orderId) return res.status(400).json({ error: 'orderId is required' })

    const ratingNum = parseInt(rating, 10)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) return res.status(400).json({ error: 'Rating must be 1–5' })
    if (comment && comment.length > 1000) return res.status(400).json({ error: 'Comment max 1000 chars' })

    const conn = await pool.getConnection()
    try {
      // Verify order belongs to buyer and is COMPLETED
      const [orders] = await conn.execute(
        'SELECT o.*, cl.cropName FROM `Order` o JOIN CropListing cl ON o.cropListingId = cl.id WHERE o.id = ? AND o.buyerId = ?',
        [orderId, user.userId]
      )
      if (orders.length === 0) return res.status(404).json({ error: 'Order not found' })
      const order = orders[0]
      if (order.status !== 'COMPLETED') return res.status(400).json({ error: 'Only COMPLETED orders can be reviewed' })

      // Duplicate check
      const [existing] = await conn.execute('SELECT id FROM Review WHERE orderId = ? AND buyerId = ?', [orderId, user.userId])
      if (existing.length > 0) return res.status(409).json({ error: 'Order already reviewed' })

      await conn.execute(
        'INSERT INTO Review (id, orderId, buyerId, farmerId, cropListingId, rating, comment, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [orderId, user.userId, order.farmerId, order.cropListingId, ratingNum, comment || null]
      )

      return res.status(201).json({ success: true, message: 'Review submitted successfully' })
    } finally { conn.release() }
  } catch (err) {
    console.error('Reviews POST error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports.default = module.exports
