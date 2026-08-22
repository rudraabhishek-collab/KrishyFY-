const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  // Step 1: Admin authorization: verify session and role
  const sessionId = req.cookies?.krishify_session
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthenticated" })
  }

  const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "ROOT",
    database: "krishify",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  const connection = await pool.getConnection()

  try {
    const [sessions] = await connection.execute(
      "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
      [sessionId]
    )

    if (sessions.length === 0) {
      return res.status(401).json({ error: "Session expired" })
    }

    const user = sessions[0]
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin role required" })
    }

    // Step 2: Parse query parameters
    const { search, role, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page, 10)
    const pageSize = parseInt(limit, 10)
    const offset = (pageNum - 1) * pageSize

    // Step 3: Build WHERE clause for search
    let whereClause = ""
    let whereParams = []

    if (search) {
      whereClause = "WHERE (name LIKE ? OR email LIKE ?)"
      whereParams = [`%${search}%`, `%${search}%`]
    }

    if (role && validRoles.includes(role)) {
      if (whereClause) {
        whereClause += " AND role = ?"
      } else {
        whereClause = "WHERE role = ?"
      }
      whereParams.push(role)
    }

    // Step 4: Get total count for pagination
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM User ${whereClause}`,
      whereParams
    )
    const total = countResult[0].total
    const totalPages = Math.ceil(total / pageSize)

    // Step 5: Get users with pagination
    const [users] = await connection.execute(
      `SELECT id, name, email, role, createdAt, updatedAt FROM User ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...whereParams, pageSize, offset]
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
    await connection.end()
  }
}

const validRoles = ["admin", "buyer", "farmer"]
if (typeof module.exports === "function") { module.exports.default = module.exports; }
