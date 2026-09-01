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

      // Get pending and in-progress inspections (or all if requested)
      const showAll = req.query.all === 'true'
      const whereFilter = showAll
        ? "WHERE 1=1"
        : "WHERE ci.status IN ('PENDING', 'IN_PROGRESS')"

      const [inspections] = await connection.execute(
        "SELECT ci.id, ci.cropListingId, cl.cropName, cl.quantityKg, cl.location, ci.status, ci.grade, ci.moisturePercentage, ci.inspectedAt, u.name AS farmerName " +
        "FROM CropInspection ci " +
        "JOIN CropListing cl ON ci.cropListingId = cl.id " +
        "LEFT JOIN User u ON cl.farmerId = u.id " +
        whereFilter + " " +
        "ORDER BY ci.createdAt DESC LIMIT 50"
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

module.exports.default = module.exports
