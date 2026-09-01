const { getPool } = require('../../../lib/db')
module.exports = async function handler(req, res) {
  try {
    const sessionId = req.cookies?.krishify_session
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const pool = getPool()

    const connection = await pool.getConnection()

    try {
      // Verify admin role
      const [sessions] = await connection.execute(
        "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
        [sessionId]
      )

      if (sessions.length === 0) {
        return res.status(401).json({ error: "Session expired" })
      }

      const user = sessions[0]
      if (user.role !== "admin") {
        return res.status(403).json({ error: "Admin role required" })
      }

      // Get all buyers with verification state
      const [buyers] = await connection.execute(
        "SELECT u.id, u.name, u.email, u.role, "+
        "(SELECT COUNT(*) FROM `Order` o WHERE o.buyerId = u.id) AS orderCount, "+
        "CASE WHEN u.role = 'buyer' THEN 'verified' ELSE 'N/A' END AS verificationState "+
        "FROM User u "+
        "WHERE u.role = 'buyer' "+
        "ORDER BY u.createdAt DESC LIMIT 50"
      )

      return res.status(200).json({
        success: true,
        buyers,
      })
    } finally {
      await connection.release()
    }
  } catch (error) {
    console.error("Admin buyers error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
