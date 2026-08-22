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

      // Mark all unread notifications as read for current user only
      const [result] = await connection.execute(
        "UPDATE Notification SET read = true, updatedAt = NOW() WHERE userId = ? AND read = false",
        [user.userId]
      )

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        updatedCount: result.affectedRows,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}