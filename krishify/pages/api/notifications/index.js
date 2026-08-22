const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    // Authenticate session
    const sessionId = req.cookies["krishify_session"]
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    // Verify session
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
      // Verify session
      const [sessions] = await connection.execute(
        "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
        [sessionId]
      )

      if (sessions.length === 0) {
        return res.status(401).json({ error: "Unauthenticated or session expired" })
      }

      const user = sessions[0]

      // Build query - only return notifications for current user
      let query = "SELECT * FROM Notification WHERE userId = ?"
      let params = [user.userId]

      // Optional: sort by createdAt descending
      query += " ORDER BY createdAt DESC"

      const [notifications] = await connection.execute(query, params)

      // Count unread notifications
      const [unreadResult] = await connection.execute(
        "SELECT COUNT(*) as count FROM Notification WHERE userId = ? AND read = false",
        [user.userId]
      )
      const unreadCount = unreadResult[0].count

      return res.status(200).json({
        success: true,
        notifications,
        unreadCount,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Get notifications error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
if (typeof module.exports === "function") { module.exports.default = module.exports; }
