const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    const notificationId = req.query.id
    if (!notificationId) {
      return res.status(400).json({ error: "Notification ID is required" })
    }

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

      // Mark notification as read - only if it belongs to current user
      const [result] = await connection.execute(
        "UPDATE Notification SET read = true, updatedAt = NOW() WHERE id = ? AND userId = ?",
        [notificationId, user.userId]
      )

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Notification not found or unauthorized" })
      }

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Mark notification read error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
if (typeof module.exports === "function") { module.exports.default = module.exports; }
