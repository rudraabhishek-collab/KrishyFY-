const mysql = require('mysql2/promise')

const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'ROOT', database: 'krishify', waitForConnections: true, connectionLimit: 10, queueLimit: 0 })

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const sessionId = req.cookies?.krishify_session
    if (!sessionId) return res.status(401).json({ error: 'Unauthenticated' })

    const conn = await pool.getConnection()
    try {
      const [sess] = await conn.execute(
        'SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId=u.id WHERE s.id=? AND s.expires>NOW()',
        [sessionId]
      )
      if (!sess.length) return res.status(401).json({ error: 'Session expired' })
      const user = sess[0]
      if (user.role !== 'inspector') return res.status(403).json({ error: 'Inspector role required' })

      const { inspectionId, status, grade, moisturePercentage, foreignMatterPercentage, damagedPercentage, weightKg, appearance, remarks } = req.body || {}
      if (!inspectionId) return res.status(400).json({ error: 'inspectionId is required' })
      if (!status) return res.status(400).json({ error: 'status is required' })

      const allowed = ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'REINSPECTION_REQUIRED']
      if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })

      // Build update SET clause
      const sets = ['status = ?', 'updatedAt = NOW()']
      const vals = [status]
      if (grade !== undefined) { sets.push('grade = ?'); vals.push(grade) }
      if (moisturePercentage !== undefined) { sets.push('moisturePercentage = ?'); vals.push(moisturePercentage) }
      if (foreignMatterPercentage !== undefined) { sets.push('foreignMatterPercentage = ?'); vals.push(foreignMatterPercentage) }
      if (damagedPercentage !== undefined) { sets.push('damagedPercentage = ?'); vals.push(damagedPercentage) }
      if (weightKg !== undefined) { sets.push('weightKg = ?'); vals.push(weightKg) }
      if (appearance !== undefined) { sets.push('appearance = ?'); vals.push(appearance) }
      if (remarks !== undefined) { sets.push('remarks = ?'); vals.push(remarks) }
      if (status === 'APPROVED') { sets.push('inspectedAt = NOW()'); }

      // Assign inspector if not already set
      sets.push('inspectorId = COALESCE(inspectorId, ?)')
      vals.push(user.userId)

      vals.push(inspectionId)

      const [result] = await conn.execute(
        'UPDATE CropInspection SET ' + sets.join(', ') + ' WHERE id = ?',
        vals
      )
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Inspection not found' })

      // Update lot status based on inspection result
      const [inspRows] = await conn.execute('SELECT cropListingId FROM CropInspection WHERE id = ?', [inspectionId])
      if (inspRows.length > 0) {
        const cropId = inspRows[0].cropListingId
        if (status === 'APPROVED') {
          await conn.execute(
            "UPDATE CropListing SET lotStatus='QUALITY_VERIFIED', inspectionStatus='APPROVED', updatedAt=NOW() WHERE id=?",
            [cropId]
          )
          // Notify farmer
          const [crops] = await conn.execute('SELECT farmerId, cropName FROM CropListing WHERE id=?', [cropId])
          if (crops.length > 0) {
            await conn.execute(
              "INSERT INTO Notification (id, userId, type, title, message, relatedEntityType, relatedEntityId, `read`, createdAt, updatedAt) VALUES (UUID(),?,?,?,?,?,?,false,NOW(),NOW())",
              [crops[0].farmerId, 'INSPECTION_APPROVED', 'Lot quality verified ✓', 'Your crop lot "' + crops[0].cropName + '" has passed physical inspection and is now quality verified.', 'crop', cropId]
            ).catch(() => {})
          }
        } else if (status === 'REJECTED') {
          await conn.execute(
            "UPDATE CropListing SET lotStatus='REJECTED', inspectionStatus='REJECTED', updatedAt=NOW() WHERE id=?",
            [cropId]
          )
          const [crops] = await conn.execute('SELECT farmerId, cropName FROM CropListing WHERE id=?', [cropId])
          if (crops.length > 0) {
            await conn.execute(
              "INSERT INTO Notification (id, userId, type, title, message, relatedEntityType, relatedEntityId, `read`, createdAt, updatedAt) VALUES (UUID(),?,?,?,?,?,?,false,NOW(),NOW())",
              [crops[0].farmerId, 'INSPECTION_REJECTED', 'Lot inspection rejected', 'Your crop lot "' + crops[0].cropName + '" did not pass physical inspection. Remarks: ' + (remarks || 'See inspection details.'), 'crop', cropId]
            ).catch(() => {})
          }
        } else if (status === 'IN_PROGRESS') {
          await conn.execute("UPDATE CropListing SET lotStatus='INSPECTION_IN_PROGRESS', updatedAt=NOW() WHERE id=?", [cropId])
        }
      }

      const [updated] = await conn.execute(
        'SELECT ci.*, u.name AS farmerName, cl.cropName, cl.quantityKg FROM CropInspection ci LEFT JOIN CropListing cl ON ci.cropListingId=cl.id LEFT JOIN User u ON cl.farmerId=u.id WHERE ci.id=?',
        [inspectionId]
      )
      return res.status(200).json({ success: true, inspection: updated[0] })
    } finally { conn.release() }
  } catch (err) {
    console.error('Inspector update error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports.default = module.exports
