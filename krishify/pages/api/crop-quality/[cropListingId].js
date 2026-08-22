const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    // Step 1: Verify authentication
    if (!req.cookies || !req.cookies.krishify_session) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const sessionId = req.cookies.krishify_session

    const pool = await mysql.createPool({
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
      // Step 2: Get user from session
      const [sessions] = await connection.execute(
        "SELECT * FROM Session WHERE id = ?",
        [sessionId]
      )

      if (sessions.length === 0) {
        return res.status(401).json({ error: "Session expired" })
      }

      const user = sessions[0]
      const farmerId = user.id

      // Step 3: Get cropListingId from params
      const cropListingId = req.params.cropListingId
      if (!cropListingId) {
        return res.status(400).json({ error: "Crop listing ID is required" })
      }

      // Step 4: Retrieve assessment for this crop
      const [assessments] = await connection.execute(
        "SELECT * FROM CropQualityAssessment WHERE cropListingId = ?",
        [cropListingId]
      )

      if (assessments.length === 0) {
        return res.status(404).json({ error: "No assessment found for this crop" })
      }

      const assessment = assessments[0]

      // Step 5: Check authorization
      // Buyer can view assessment for marketplace crop
      // Farmer can view assessment for their own crop
      if (user.role !== "FARMER" && user.role !== "BUYER") {
        return res.status(403).json({ error: "Unauthorized" })
      }

      // If farmer, verify they own the crop
      if (user.role === "FARMER") {
        const [crops] = await connection.execute(
          "SELECT farmerId FROM CropListing WHERE id = ?",
          [cropListingId]
        )

        if (crops.length === 0 || crops[0].farmerId !== farmerId) {
          return res.status(403).json({ error: "You can only view assessments for your own crops" })
        }
      }

      // Return assessment data (no API keys or secrets)
      return res.status(200).json({
        success: true,
        assessment: {
          id: assessment.id,
          score: assessment.score,
          grade: assessment.grade,
          issues: assessment.issues,
          observations: assessment.observations,
          confidence: assessment.confidence,
          provider: assessment.provider,
          model: assessment.model,
          status: assessment.status,
          createdAt: assessment.createdAt,
          updatedAt: assessment.updatedAt,
        },
      })
    } finally {
      await connection.release()
    }
  } catch (error) {
    console.error("Get crop quality assessment error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}