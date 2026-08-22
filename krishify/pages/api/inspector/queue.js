const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
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
      // Verify inspector role
      const [sessions] = await connection.execute(
        "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
        [sessionId]
      )

      if (sessions.length === 0) {
        return res.status(401).json({ error: "Session expired" })
      }

      const user = sessions[0]
      if (user.role !== "inspector") {
        return res.status(403).json({ error: "Inspector role required" })
      }

      // Get pending and in-progress inspections
      const [inspections] = await connection.execute(
        "SELECT ci.id, ci.cropListingId, cl.cropName, ci.status, ci.grade, ci.moisturePercentage, ci.inspectedAt, u.name AS farmerName "+
        "FROM CropInspection ci "+
        "JOIN CropListing cl ON ci.cropListingId = cl.id "+
        "LEFT JOIN User u ON ci.inspectorId = u.id "+
        "WHERE ci.status IN ('PENDING', 'IN_PROGRESS') "+
        "ORDER BY ci.createdAt DESC LIMIT 20"
      )

      return res.status(200).json({
        success: true,
        inspections,
      })
    } finally {
      await connection.release()
    }
  } catch (error) {
    console.error("Inspector queue error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
