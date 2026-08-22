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
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const user = await getUser(req.cookies?.krishify_session)
    if (!user) return res.status(401).json({ error: 'Unauthenticated' })

    const { orderId } = req.query
    const conn = await pool.getConnection()
    try {
      if (orderId) {
        // Verify order access
        const roleField = user.role === 'buyer' ? 'buyerId' : user.role === 'farmer' ? 'farmerId' : null
        if (!roleField && user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' })
        if (roleField) {
          const [orders] = await conn.execute(`SELECT id FROM \`Order\` WHERE id = ? AND ${roleField} = ?`, [orderId, user.userId])
          if (orders.length === 0) return res.status(404).json({ error: 'Order not found' })
        }
        const [payments] = await conn.execute('SELECT * FROM Payment WHERE orderId = ?', [orderId])
        const payment = payments.length > 0 ? payments[0] : null
        return res.status(200).json({ success: true, payment })
      }

      // List all (admin only)
      if (user.role !== 'admin') return res.status(403).json({ error: 'Admin role required' })
      const [payments] = await conn.execute(`
        SELECT p.*, o.buyerId, o.farmerId, cl.cropName,
               ub.name as buyerName, uf.name as farmerName
        FROM Payment p
        JOIN \`Order\` o ON p.orderId = o.id
        JOIN CropListing cl ON o.cropListingId = cl.id
        JOIN User ub ON o.buyerId = ub.id
        JOIN User uf ON o.farmerId = uf.id
        ORDER BY p.createdAt DESC
      `)
      return res.status(200).json({ success: true, payments })
    } finally { conn.release() }
  } catch (err) {
    console.error('Payments GET error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
