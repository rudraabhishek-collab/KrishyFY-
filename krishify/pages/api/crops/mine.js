const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    // Authenticate session
    const sessionId = req.cookies["krishify_session"]
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    // Verify session and check role
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
      // Verify session and check role
      const [sessions] = await connection.execute(
        "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
        [sessionId]
      )

      if (sessions.length === 0) {
        return res.status(401).json({ error: "Unauthenticated or session expired" })
      }

      const user = sessions[0]
      if (user.role !== "farmer") {
        return res.status(403).json({ error: "Farmer role required" })
      }

      // Get only this farmer's listings, newest first
      const [listings] = await connection.execute(
        "SELECT cl.*, u.name as farmerName FROM CropListing cl JOIN User u ON cl.farmerId = u.id WHERE cl.farmerId = ? ORDER BY cl.createdAt DESC",
        [user.userId]
      )

      return res.status(200).json({
        success: true,
        listings,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Get farmer listings error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
if (typeof module.exports === "function") { module.exports.default = module.exports; }
