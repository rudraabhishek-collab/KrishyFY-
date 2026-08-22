const mysql = require('mysql2/promise')

const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'ROOT', database: 'krishify', waitForConnections: true, connectionLimit: 10, queueLimit: 0 })

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { farmerId } = req.query
    if (!farmerId) return res.status(400).json({ error: 'farmerId is required' })

    const conn = await pool.getConnection()
    try {
      const [reviews] = await conn.execute(
        'SELECT r.*, u.name AS buyerName FROM Review r JOIN User u ON r.buyerId = u.id WHERE r.farmerId = ? ORDER BY r.createdAt DESC',
        [farmerId]
      )
      const avg = reviews.length > 0 ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)) : 0
      return res.status(200).json({ success: true, reviews, averageRating: avg, totalCount: reviews.length })
    } finally { conn.release() }
  } catch (err) {
    console.error('Farmer reviews error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports.default = module.exports
