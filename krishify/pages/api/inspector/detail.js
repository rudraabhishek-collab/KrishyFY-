const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    const sessionId = req.cookies?.krishify_session
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const { inspectionId } = req.query
    if (!inspectionId) {
      return res.status(400).json({ error: "Inspection ID is required" })
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

      // Get inspection detail
      const [inspections] = await connection.execute(
        "SELECT ci.id, ci.cropListingId, cl.cropName, cl.farmerId, cl.quantity, cl.unit, ci.status, ci.grade, ci.moisturePercentage, ci.foreignMatterPercentage, ci.damagedPercentage, ci.weightKg, ci.appearance, ci.remarks, ci.inspectionCertificate, ci.inspectedAt, ci.createdAt, u.name AS farmerName, u2.name AS inspectorName "+
        "FROM CropInspection ci "+
        "JOIN CropListing cl ON ci.cropListingId = cl.id "+
        "LEFT JOIN User u ON ci.farmerId = u.id "+
        "LEFT JOIN User u2 ON ci.inspectorId = u2.id "+
        "WHERE ci.id = ?",
        [inspectionId]
      )

      if (inspections.length === 0) {
        return res.status(404).json({ error: "Inspection not found" })
      }

      return res.status(200).json({
        success: true,
        inspection: inspections[0],
      })
    } finally {
      await connection.release()
    }
  } catch (error) {
    console.error("Inspector detail error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
