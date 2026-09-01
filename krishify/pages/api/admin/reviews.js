const { getPool } = require('../../../lib/db')
const { adminAuth } = require('../../../lib/adminAuth')

const pool = getPool()

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const auth = await adminAuth(req)
    if (!auth.success) return res.status(auth.error === 'Unauthenticated' ? 401 : 403).json({ error: auth.error })

    const { page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page, 10)
    const pageSize = parseInt(limit, 10)
    const offset = (pageNum - 1) * pageSize

    const conn = await pool.getConnection()
    try {
      const [[{ total }]] = await conn.execute('SELECT COUNT(*) as total FROM Review')
      const totalPages = Math.ceil(total / pageSize)

      const [reviews] = await conn.execute(
        `SELECT r.id, r.orderId, r.buyerId, r.farmerId, r.cropListingId,
                r.rating, r.comment, r.createdAt, r.updatedAt,
                ub.name AS buyerName, uf.name AS farmerName, cl.cropName
         FROM Review r
         JOIN User ub ON r.buyerId = ub.id
         JOIN User uf ON r.farmerId = uf.id
         JOIN CropListing cl ON r.cropListingId = cl.id
         ORDER BY r.createdAt DESC
         LIMIT ? OFFSET ?`,
        [pageSize, offset]
      )

      return res.status(200).json({ success: true, reviews, pagination: { page: pageNum, limit: pageSize, total, totalPages } })
    } finally { conn.release() }
  } catch (err) {
    console.error('Admin reviews error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports.default = module.exports
