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
    // System notifications (from Notification table)
    const [notifications] = await connection.execute(
      "SELECT id, type, title, message, createdAt, read FROM Notification ORDER BY createdAt DESC LIMIT 10"
    )

    // Recent activity from various entities
    const [recentActivity] = await connection.execute(
      "SELECT id, userId, action, relatedEntityType, relatedEntityId, createdAt FROM Notification WHERE read = false ORDER BY createdAt DESC LIMIT 20"
    )

    // Return activity and notifications
    return res.status(200).json({
      success: true,
      activity: recentActivity,
      notifications,
    })
  } catch (error) {
    console.error("Admin notifications error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    await connection.end()
  }
}
if (typeof module.exports === "function") { module.exports.default = module.exports; }
