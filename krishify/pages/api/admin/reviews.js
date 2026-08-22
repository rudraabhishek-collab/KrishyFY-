const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  // Step 1: Admin authorization
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
    // Step 2: Parse query parameters
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

    // Step 3: Get total count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM Review ${whereClause}`,
      whereParams
    )
    const total = countResult[0].total
    const totalPages = Math.ceil(total / pageSize)

    // Step 4: Get reviews with pagination
    const [reviews] = await connection.execute(
      `SELECT id, userId, rating, title, content, createdAt, updatedAt FROM Review ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...whereParams, pageSize, offset]
    )

    // Step 5: If PATCH request, moderation action
    if (req.method === "PATCH") {
      const { reviewId } = req.query
      const { action, response } = req.body || {}

      if (!reviewId) {
        return res.status(400).json({ error: "Review ID is required" })
      }

      if (!action || !["approve", "reject", "flag"].includes(action)) {
        return res.status(400).json({ error: "Invalid action. Must be: approve, reject, or flag" })
      }

      // Update review status
      const [result] = await connection.execute(
        "UPDATE Review SET status = ?, moderatorResponse = ?, updatedAt = NOW() WHERE id = ?",
        [action, response || null, reviewId]
      )

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Review not found" })
      }

      const [updatedReview] = await connection.execute(
        "SELECT id, userId, rating, title, content, status, moderatorResponse, createdAt FROM Review WHERE id = ?",
        [reviewId]
      )

      return res.status(200).json({
        success: true,
        review: updatedReview[0],
      })
    }

    // Step 6: GET request - return reviews
    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Admin reviews error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    await connection.end()
  }
}