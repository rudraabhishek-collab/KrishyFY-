const { getPool } = require('../../../lib/db')
const { adminAuth } = require("../../../lib/adminAuth")

module.exports = async function handler(req, res) {
  const auth = await adminAuth(req)
  if (!auth.success) {
    return res.status(auth.error === "Unauthenticated" ? 401 : 403).json({ error: auth.error })
  }

  const pool = getPool()

  const connection = await pool.getConnection()

  try {
    const { status, category, search, page = 1, limit = 20 } = req.query
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
    const offset = (pageNum - 1) * pageSize

    const conditions = []
    const whereParams = []

    if (status) {
      conditions.push("cl.status = ?")
      whereParams.push(status)
    }
    if (category) {
      conditions.push("cl.category = ?")
      whereParams.push(category)
    }
    if (search) {
      conditions.push("(cl.cropName LIKE ? OR cl.description LIKE ?)")
      whereParams.push(`%${search}%`, `%${search}%`)
    }

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : ""

    const [countResult] = await connection.execute(
      `SELECT COUNT(*) AS total FROM CropListing cl ${whereClause}`,
      whereParams
    )
    const total = countResult[0].total
    const totalPages = Math.ceil(total / pageSize)

    const [crops] = await connection.execute(
      `SELECT cl.id, cl.cropName, cl.category, cl.description, cl.quantity, cl.unit,
              cl.expectedPrice, cl.location, cl.status, cl.createdAt,
              u.name AS farmerName
       FROM CropListing cl
       JOIN User u ON cl.farmerId = u.id
       ${whereClause}
       ORDER BY cl.createdAt DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      whereParams
    )

    return res.status(200).json({ success: true, crops, pagination: { page: pageNum, limit: pageSize, total, totalPages } })
  } catch (error) {
    console.error("Admin crops error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    connection.release()
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
