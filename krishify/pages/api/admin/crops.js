const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  // Admin authorization
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
    // Get all crops with optional filtering
    const { status, category, search, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page, 10)
    const pageSize = parseInt(limit, 10)
    const offset = (pageNum - 1) * pageSize

    let whereClause = ""
    let whereParams = []

    if (status) {
      whereClause = "WHERE status = ?"
      whereParams.push(status)
    }

    if (category) {
      if (whereClause) {
        whereClause += " AND category = ?"
      } else {
        whereClause = "WHERE category = ?"
      }
      whereParams.push(category)
    }

    if (search) {
      if (whereClause) {
        whereClause += " AND (name LIKE ? OR description LIKE ?)"
      } else {
        whereClause = "WHERE (name LIKE ? OR description LIKE ?)"
      }
      whereParams.push(`%${search}%`, `%${search}%`)
    }

    // Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM CropListing ${whereClause}`,
      whereParams
    )
    const total = countResult[0].total
    const totalPages = Math.ceil(total / pageSize)

    // Get crops with pagination
    const [crops] = await connection.execute(
      `SELECT id, name, description, category, price, quantity, unit, status, createdAt, updatedAt FROM CropListing ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...whereParams, pageSize, offset]
    )

    return res.status(200).json({
      success: true,
      crops,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Admin crops error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    await connection.end()
  }
}