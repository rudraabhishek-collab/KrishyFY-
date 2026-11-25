const { getPool } = require('../../../lib/db')

const validRoles = ["admin", "buyer", "farmer", "inspector"]

module.exports = async function handler(req, res) {
  const sessionId = req.cookies?.krishify_session
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthenticated" })
  }

  const pool = getPool()
  const connection = await pool.getConnection()

  try {
    const [sessions] = await connection.execute(
      "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
      [sessionId]
    )

    if (sessions.length === 0) {
      return res.status(401).json({ error: "Session expired" })
    }

    if (sessions[0].role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin role required" })
    }

    const { search, role, page = 1, limit = 20 } = req.query
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
    const offset = (pageNum - 1) * pageSize

    let whereClause = ""
    let whereParams = []

    if (search) {
      whereClause = "WHERE (name LIKE ? OR email LIKE ?)"
      whereParams = [`%${search}%`, `%${search}%`]
    }

    if (role && validRoles.includes(role)) {
      whereClause += whereClause ? " AND role = ?" : "WHERE role = ?"
      whereParams.push(role)
    }

    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM User ${whereClause}`,
      whereParams
    )
    const total = countResult[0].total
    const totalPages = Math.ceil(total / pageSize)

    const [users] = await connection.execute(
      `SELECT id, name, email, role, createdAt FROM User ${whereClause} ORDER BY createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`,
      whereParams
    )

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    connection.release()
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
