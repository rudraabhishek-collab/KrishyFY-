const { getPool } = require('../../../lib/db')
const pool = getPool()

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { cropListingId } = req.query
    if (!cropListingId) return res.status(400).json({ error: 'cropListingId is required' })

    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute('SELECT * FROM CropQualityAssessment WHERE cropListingId = ?', [cropListingId])
      if (rows.length === 0) return res.status(404).json({ error: 'No assessment found for this crop' })
      const a = rows[0]
      return res.status(200).json({
        success: true,
        assessment: {
          id: a.id, score: a.score, grade: a.grade,
          issues: a.issues, observations: a.observations,
          confidence: a.confidence, provider: a.provider,
          model: a.model, status: a.status,
          createdAt: a.createdAt, updatedAt: a.updatedAt,
        }
      })
    } finally { conn.release() }
  } catch (err) {
    console.error('Crop quality GET error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports.default = module.exports
