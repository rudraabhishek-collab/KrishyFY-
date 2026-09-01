const { getPool } = require('../../../lib/db')
const pool = getPool()

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { cropListingId } = req.query
    if (!cropListingId) return res.status(400).json({ error: 'cropListingId required' })
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute(
        'SELECT ci.*, u.name AS inspectorName FROM CropInspection ci LEFT JOIN User u ON ci.inspectorId = u.id WHERE ci.cropListingId = ? ORDER BY ci.createdAt DESC LIMIT 1',
        [cropListingId]
      )
      if (rows.length === 0) return res.status(404).json({ error: 'No inspection found' })
      return res.status(200).json({ success: true, inspection: rows[0] })
    } finally { conn.release() }
  } catch (err) {
    console.error('Inspector detail error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports.default = module.exports
