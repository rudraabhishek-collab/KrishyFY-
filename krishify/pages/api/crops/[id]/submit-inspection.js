const { getPool } = require('../../../../lib/db')
const crypto = require('crypto')

const pool = getPool()

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Crop ID required' })

    const sessionId = req.cookies?.krishify_session
    if (!sessionId) return res.status(401).json({ error: 'Unauthenticated' })

    const conn = await pool.getConnection()
    try {
      const [sess] = await conn.execute('SELECT s.userId, u.role FROM Session s JOIN User u ON s.userId=u.id WHERE s.id=? AND s.expires>NOW()', [sessionId])
      if (!sess.length) return res.status(401).json({ error: 'Session expired' })
      if (sess[0].role !== 'farmer') return res.status(403).json({ error: 'Farmer role required' })

      const [crops] = await conn.execute('SELECT id, farmerId, lotStatus FROM CropListing WHERE id=?', [id])
      if (!crops.length) return res.status(404).json({ error: 'Lot not found' })
      if (crops[0].farmerId !== sess[0].userId) return res.status(403).json({ error: 'Not your lot' })
      if (crops[0].lotStatus !== 'DRAFT' && crops[0].lotStatus !== null) return res.status(409).json({ error: 'Lot already submitted' })

      // Update lot status
      await conn.execute("UPDATE CropListing SET lotStatus='SUBMITTED_FOR_INSPECTION', updatedAt=NOW() WHERE id=?", [id])

      // Create or update inspection record
      const [existing] = await conn.execute('SELECT id FROM CropInspection WHERE cropListingId=?', [id])
      if (existing.length === 0) {
        await conn.execute("INSERT INTO CropInspection (id, cropListingId, status, createdAt, updatedAt) VALUES (UUID(), ?, 'PENDING', NOW(), NOW())", [id])
      } else {
        await conn.execute("UPDATE CropInspection SET status='PENDING', updatedAt=NOW() WHERE cropListingId=?", [id])
      }

      // Notify inspector (if any exists)
      const [inspectors] = await conn.execute("SELECT id FROM User WHERE role='inspector' LIMIT 1")
      if (inspectors.length > 0) {
        const [cropInfo] = await conn.execute('SELECT cropName FROM CropListing WHERE id=?', [id])
        await conn.execute(
          "INSERT INTO Notification (id, userId, type, title, message, relatedEntityType, relatedEntityId, `read`, createdAt, updatedAt) VALUES (UUID(),?,?,?,?,?,?,false,NOW(),NOW())",
          [inspectors[0].id, 'INSPECTION_REQUEST', 'New lot awaiting inspection', 'A new crop lot (' + (cropInfo[0]?.cropName || 'unknown') + ') has been submitted for physical inspection.', 'crop', id]
        ).catch(() => {})
      }

      return res.status(200).json({ success: true, message: 'Lot submitted for inspection' })
    } finally { conn.release() }
  } catch (err) {
    console.error('Submit inspection error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports.default = module.exports
