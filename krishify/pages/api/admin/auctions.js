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
    // Get all auctions with optional filtering
    const { status, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page, 10)
    const pageSize = parseInt(limit, 10)
    const offset = (pageNum - 1) * pageSize

    let whereClause = ""
    let whereParams = []

    if (status) {
      whereClause = "WHERE status = ?"
      whereParams.push(status)
    }

    // Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM Auction ${whereClause}`,
      whereParams
    )
    const total = countResult[0].total
    const totalPages = Math.ceil(total / pageSize)

    // Get auctions with pagination
    const [auctions] = await connection.execute(
      `SELECT id, title, description, starting_price, current_price, highest_bidder, status, createdAt, endsAt FROM Auction ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...whereParams, pageSize, offset]
    )

    return res.status(200).json({
      success: true,
      auctions,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Admin auctions error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    await connection.end()
  }
}