const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    const sessionId = req.cookies?.krishify_session
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const { inspectionId, status, grade, moisturePercentage, foreignMatterPercentage, damagedPercentage, weightKg, appearance, remarks, inspectionCertificate } = req.body || {}
    if (!inspectionId) {
      return res.status(400).json({ error: "Inspection ID is required" })
    }
    if (!status) {
      return res.status(400).json({ error: "Status is required" })
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

      // Update inspection
      const updateFields = []
      const updateValues = [status]

      if (grade !== undefined) {
        updateFields.push("grade = ?")
        updateValues.push(grade)
      }
      if (moisturePercentage !== undefined) {
        updateFields.push("moisturePercentage = ?")
        updateValues.push(moisturePercentage)
      }
      if (foreignMatterPercentage !== undefined) {
        updateFields.push("foreignMatterPercentage = ?")
        updateValues.push(foreignMatterPercentage)
      }
      if (damagedPercentage !== undefined) {
        updateFields.push("damagedPercentage = ?")
        updateValues.push(damagedPercentage)
      }
      if (weightKg !== undefined) {
        updateFields.push("weightKg = ?")
        updateValues.push(weightKg)
      }
      if (appearance !== undefined) {
        updateFields.push("appearance = ?")
        updateValues.push(appearance)
      }
      if (remarks !== undefined) {
        updateFields.push("remarks = ?")
        updateValues.push(remarks)
      }
      if (inspectionCertificate !== undefined) {
        updateFields.push("inspectionCertificate = ?")
        updateValues.push(inspectionCertificate)
      }

      // Set inspectedAt if approving
      if (status === 'APPROVED') {
        updateFields.push("inspectedAt = NOW()")
      }

      updateFields.push("updatedAt = NOW()")
      updateValues.push(inspectionId)

      const query = "UPDATE CropInspection SET " + updateFields.join(", ") + " WHERE id = ?"

      const [result] = await connection.execute(query, updateValues)

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Inspection not found" })
      }

      // If approved, update lot status to QUALITY_VERIFIED
      if (status === 'APPROVED') {
        const [inspection] = await connection.execute(
          "SELECT cropListingId FROM CropInspection WHERE id = ?",
          [inspectionId]
        )
        if (inspection.length > 0 && inspection[0].cropListingId) {
          await connection.execute(
            "UPDATE CropListing SET lotStatus = 'QUALITY_VERIFIED', inspectionStatus = 'APPROVED' WHERE id = ?",
            [inspection[0].cropListingId]
          )
        }
      }

      // Get updated inspection
      const [updatedInspections] = await connection.execute(
        "SELECT ci.id, ci.cropListingId, cl.cropName, ci.status, ci.grade, ci.moisturePercentage, ci.inspectedAt, u.name AS farmerName, u2.name AS inspectorName "+
        "FROM CropInspection ci "+
        "JOIN CropListing cl ON ci.cropListingId = cl.id "+
        "LEFT JOIN User u ON ci.farmerId = u.id "+
        "LEFT JOIN User u2 ON ci.inspectorId = u2.id "+
        "WHERE ci.id = ?",
        [inspectionId]
      )

      return res.status(200).json({
        success: true,
        inspection: updatedInspections[0],
      })
    } finally {
      await connection.release()
    }
  } catch (error) {
    console.error("Inspector update error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

module.exports.default = module.exports
