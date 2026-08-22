const mysql = require("mysql2/promise")
const crypto = require("crypto")

module.exports = async function handler(req, res) {
  try {
    // Step 1: Verify authentication
    if (!req.cookies || !req.cookies.krishify_session) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const sessionId = req.cookies.krishify_session

    // Step 2: Verify session expiry
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
      // Step 3: Get user from session
      const [sessions] = await connection.execute(
        "SELECT * FROM Session WHERE id = ?",
        [sessionId]
      )

      if (sessions.length === 0) {
        return res.status(401).json({ error: "Session expired" })
      }

      const user = sessions[0].user
      // Step 4: Verify user role is FARMER
      if (user.role !== "FARMER") {
        return res.status(403).json({ error: "Only farmers can assess crop quality" })
      }

      const farmerId = user.id

      // Step 5: Retrieve crop listing and verify ownership
      const cropId = req.params.cropId || req.body.cropListingId
      if (!cropId) {
        return res.status(400).json({ error: "Crop listing ID is required" })
      }

      const [crops] = await connection.execute(
        "SELECT * FROM CropListing WHERE id = ? AND farmerId = ?",
        [cropId, farmerId]
      )

      if (crops.length === 0) {
        return res.status(403).json({ error: "Crop not found or not owned by you" })
      }

      const cropListing = crops[0]

      // Step 6: Rate abuse protection - check for existing PROCESSING assessment
      // Prevent duplicate simultaneous requests for the same crop
      const [existingAssessments] = await connection.execute(
        "SELECT * FROM CropQualityAssessment WHERE cropListingId = ? AND status = 'PROCESSING'",
        [cropId]
      )

      if (existingAssessments.length > 0) {
        return res.status(409).json({
          error: "An assessment is already in progress for this crop. Please wait for it to complete.",
        })
      }

      // Step 7: Validate the uploaded image
      let imageBuffer
      let imageMimeType

      if (req.body.imageBase64) {
        const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, "")
        imageBuffer = Buffer.from(base64Data, "base64")
        imageMimeType = req.body.imageMimeType || "application/octet-stream"
      } else if (req.file) {
        imageBuffer = req.file.buffer
        imageMimeType = req.file.mimeType
      } else {
        return res.status(400).json({ error: "No image provided" })
      }

      // Image validation
      const acceptedMimeTypes = ["image/jpeg", "image/png", "image/webp"]
      if (!acceptedMimeTypes.includes(imageMimeType)) {
        return res.status(400).json({ error: "Invalid image type. Accepted: JPEG, PNG, WEBP" })
      }

      const maxSize = 5 * 1024 * 1024 // 5MB
      if (imageBuffer.length > maxSize) {
        return res.status(400).json({ error: "Image too large. Maximum size: 5MB" })
      }

      if (imageBuffer.length === 0) {
        return res.status(400).json({ error: "Empty image file" })
      }

      // Step 8: Check for existing assessment - re-assessment behavior:
      // If assessment exists (not PROCESSING), update it. If not, create new.
      const [allAssessments] = await connection.execute(
        "SELECT * FROM CropQualityAssessment WHERE cropListingId = ?",
        [cropId]
      )

      let assessmentId
      let isUpdate = false

      if (allAssessments.length > 0 && allAssessments[0].status !== "PROCESSING") {
        // Existing completed assessment: update it (re-assessment)
        assessmentId = allAssessments[0].id
        isUpdate = true
      } else {
        // New assessment: generate UUID
        const uuidStr = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            const r = Math.random() * 16 | 0
            return c === "x" ? r : (r & 0x3 | 0x8)
          }
        )
        assessmentId = `assess_${uuidStr}`
      }

      // Step 9: Send image to AI service
      let aiResult
      try {
        aiResult = await aiService.assessCropQuality(imageBuffer, imageMimeType)

        // Step 10: Normalize the AI response
        const normalized = aiService.normalizeAssessmentResult(aiResult)

        if (isUpdate) {
          // Update existing assessment
          await connection.execute(
            `UPDATE CropQualityAssessment 
             SET score = ?, grade = ?, issues = ?, observations = ?, confidence = ?, provider = ?, model = ?, status = 'COMPLETED', updatedAt = NOW()
             WHERE id = ?`,
            [
              normalized.score,
              normalized.grade,
              JSON.stringify(normalized.issues),
              normalized.observations,
              normalized.confidence,
              normalized.provider,
              normalized.model,
              assessmentId,
            ]
          )
        } else {
          // Create new assessment
          await connection.execute(
            `INSERT INTO CropQualityAssessment 
              (id, cropListingId, score, grade, issues, observations, confidence, provider, model, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PROCESSING')`,
            [
              assessmentId,
              cropId,
              0,
              "C",
              [],
              "AI assessment in progress...",
              0,
              process.env.AI_PROVIDER || "TEST",
              process.env.AI_MODEL || "demo-model",
            ]
          )

          // Now update with AI results
          await connection.execute(
            `UPDATE CropQualityAssessment 
             SET score = ?, grade = ?, issues = ?, observations = ?, confidence = ?, provider = ?, model = ?, status = 'COMPLETED', updatedAt = NOW()
             WHERE id = ?`,
            [
              normalized.score,
              normalized.grade,
              JSON.stringify(normalized.issues),
              normalized.observations,
              normalized.confidence,
              normalized.provider,
              normalized.model,
              assessmentId,
            ]
          )
        }
      } catch (aiError) {
        // AI service failed - mark assessment as FAILED
        if (!isUpdate && allAssessments.length === 0) {
          // Only mark as FAILED if we created a new assessment (not re-assessment)
          await connection.execute(
            `UPDATE CropQualityAssessment 
             SET status = 'FAILED', updatedAt = NOW()
             WHERE id = ?`,
            [assessmentId]
          )
        }

        return res.status(500).json({
          error: "AI assessment is temporarily unavailable. Please try again later.",
        })
      }

      // Step 11: Return the assessment result
      const [result] = await connection.execute(
        "SELECT * FROM CropQualityAssessment WHERE id = ?",
        [assessmentId]
      )

      return res.status(200).json({
        success: true,
        assessment: result[0],
        isUpdate,
      })
    } finally {
      await connection.release()
    }
  } catch (error) {
    console.error("Create crop quality assessment error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = Math.random() * 16 | 0
      return c === "x" ? r : (r & 0x3 | 0x8)
    }
  )
}