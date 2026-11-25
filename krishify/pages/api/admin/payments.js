const { getPool } = require('../../../lib/db')
const { adminAuth } = require('../../../lib/adminAuth')

const pool = getPool()

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const auth = await adminAuth(req)
    if (!auth.success) return res.status(auth.error === 'Unauthenticated' ? 401 : 403).json({ error: auth.error })

    const { page = 1, limit = 20 } = req.query
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
    const offset = (pageNum - 1) * pageSize

    const conn = await pool.getConnection()
    try {
      const [[{ total }]] = await conn.execute('SELECT COUNT(*) as total FROM Payment')
      const totalPages = Math.ceil(total / pageSize)

      const [payments] = await conn.execute(
        `SELECT p.*, o.buyerId, o.farmerId, cl.cropName,
                ub.name AS buyerName, uf.name AS farmerName
         FROM Payment p
         JOIN \`Order\` o ON p.orderId = o.id
         JOIN CropListing cl ON o.cropListingId = cl.id
         JOIN User ub ON o.buyerId = ub.id
         JOIN User uf ON o.farmerId = uf.id
         ORDER BY p.createdAt DESC
         LIMIT ${pageSize} OFFSET ${offset}`
      )

      const [[statsRow]] = await conn.execute(
        "SELECT COUNT(*) as total, SUM(CASE WHEN status='PAID' THEN 1 ELSE 0 END) as paid, SUM(CASE WHEN status='CREATED' THEN 1 ELSE 0 END) as pending FROM Payment"
      )

      return res.status(200).json({
        success: true,
        payments,
        stats: { total: statsRow.total, paid: statsRow.paid || 0, pending: statsRow.pending || 0 },
        pagination: { page: pageNum, limit: pageSize, total, totalPages }
      })
    } finally { conn.release() }
  } catch (err) {
    console.error('Admin payments error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports.default = module.exports
