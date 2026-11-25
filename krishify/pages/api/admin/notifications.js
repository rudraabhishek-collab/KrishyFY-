const { getPool } = require('../../../lib/db')
const { adminAuth } = require('../../../lib/adminAuth')

module.exports = async function handler(req, res) {
  const auth = await adminAuth(req)
  if (!auth.success) {
    return res.status(auth.error === "Unauthenticated" ? 401 : 403).json({ error: auth.error })
  }

  const pool = getPool()
  const connection = await pool.getConnection()

  try {
    const [notifications] = await connection.execute(
      "SELECT id, userId, type, title, message, relatedEntityType, relatedEntityId, `read`, createdAt FROM Notification ORDER BY createdAt DESC LIMIT 10"
    )

    const [recentActivity] = await connection.execute(
      "SELECT id, userId, type, title, relatedEntityType, relatedEntityId, createdAt FROM Notification WHERE `read` = false ORDER BY createdAt DESC LIMIT 20"
    )

    return res.status(200).json({
      success: true,
      activity: recentActivity,
      notifications,
    })
  } catch (error) {
    console.error("Admin notifications error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    connection.release()
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
