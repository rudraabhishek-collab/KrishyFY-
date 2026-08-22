const mysql = require('mysql2/promise')
const { assessCropQuality } = require('../../lib/ai/cropQuality')

const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'ROOT', database: 'krishify', waitForConnections: true, connectionLimit: 10, queueLimit: 0 })

async function getUser(sessionId) {
  if (!sessionId) return null
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.execute(
      'SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()',
      [sessionId]
    )
    return rows[0] || null
  } finally { conn.release() }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const user = await getUser(req.cookies?.krishify_session)
    if (!user) return res.status(401).json({ error: 'Unauthenticated' })
    if (user.role !== 'farmer') return res.status(403).json({ error: 'Farmer role required' })

    const { cropListingId, imageBase64, imageMimeType } = req.body || {}
    if (!cropListingId) return res.status(400).json({ error: 'cropListingId is required' })
    if (!imageBase64) return res.status(400).json({ error: 'Image is required' })

    const mimeType = imageMimeType || 'image/jpeg'
    const accepted = ['image/jpeg', 'image/png', 'image/webp']
    if (!accepted.includes(mimeType)) return res.status(400).json({ error: 'Invalid image type. Accepted: JPEG, PNG, WEBP' })

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')
    if (imageBuffer.length === 0) return res.status(400).json({ error: 'Empty image' })
    if (imageBuffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'Image too large. Max 5MB' })

    const conn = await pool.getConnection()
    try {
      // Verify crop ownership
      const [crops] = await conn.execute('SELECT id FROM CropListing WHERE id = ? AND farmerId = ?', [cropListingId, user.userId])
      if (crops.length === 0) return res.status(403).json({ error: 'Crop not found or not yours' })

      // Check for in-progress assessment
      const [processing] = await conn.execute("SELECT id FROM CropQualityAssessment WHERE cropListingId = ? AND status = 'PROCESSING'", [cropListingId])
      if (processing.length > 0) return res.status(409).json({ error: 'Assessment already in progress' })

      // Run TEST AI assessment
      const result = await assessCropQuality(imageBuffer, mimeType)

      // Upsert assessment
      const [existing] = await conn.execute('SELECT id FROM CropQualityAssessment WHERE cropListingId = ?', [cropListingId])
      if (existing.length > 0) {
        await conn.execute(
          "UPDATE CropQualityAssessment SET score=?, grade=?, issues=?, observations=?, confidence=?, provider=?, model=?, status='COMPLETED', updatedAt=NOW() WHERE cropListingId=?",
          [result.score, result.grade, JSON.stringify(result.issues), result.observations, result.confidence, result.provider, result.model, cropListingId]
        )
      } else {
        await conn.execute(
          "INSERT INTO CropQualityAssessment (id, cropListingId, score, grade, issues, observations, confidence, provider, model, status, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', NOW(), NOW())",
          [cropListingId, result.score, result.grade, JSON.stringify(result.issues), result.observations, result.confidence, result.provider, result.model]
        )
      }

      const [assessment] = await conn.execute('SELECT * FROM CropQualityAssessment WHERE cropListingId = ?', [cropListingId])
      return res.status(200).json({ success: true, assessment: assessment[0] })
    } finally { conn.release() }
  } catch (err) {
    console.error('Crop quality POST error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports.default = module.exports
