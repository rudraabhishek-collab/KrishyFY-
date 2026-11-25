const { getPool } = require('../../../lib/db')
const pool = getPool()

function toNullableNumber(val) {
  if (val === undefined || val === null || val === '') return null
  const num = Number(val)
  return Number.isNaN(num) ? null : num
}

function toNullableString(val) {
  if (val === undefined || val === null || val === '') return null
  return String(val)
}

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

      const sets = ['status = ?', 'updatedAt = NOW()']
      const vals = [status]
      if (grade !== undefined) { sets.push('grade = ?'); vals.push(toNullableString(grade)) }
      if (moisturePercentage !== undefined) { sets.push('moisturePercentage = ?'); vals.push(toNullableNumber(moisturePercentage)) }
      if (foreignMatterPercentage !== undefined) { sets.push('foreignMatterPercentage = ?'); vals.push(toNullableNumber(foreignMatterPercentage)) }
      if (damagedPercentage !== undefined) { sets.push('damagedPercentage = ?'); vals.push(toNullableNumber(damagedPercentage)) }
      if (weightKg !== undefined) { sets.push('weightKg = ?'); vals.push(toNullableNumber(weightKg)) }
      if (appearance !== undefined) { sets.push('appearance = ?'); vals.push(toNullableString(appearance)) }
      if (remarks !== undefined) { sets.push('remarks = ?'); vals.push(toNullableString(remarks)) }
      if (status === 'APPROVED') { sets.push('inspectedAt = NOW()') }

      sets.push('inspectorId = COALESCE(inspectorId, ?)')
      vals.push(user.userId)
      vals.push(inspectionId)

      const [result] = await conn.execute(
        'UPDATE CropInspection SET ' + sets.join(', ') + ' WHERE id = ?',
        vals
      )
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Inspection not found' })

      const [inspRows] = await conn.execute('SELECT cropListingId FROM CropInspection WHERE id = ?', [inspectionId])
      if (inspRows.length > 0) {
        const cropId = inspRows[0].cropListingId
        const [crops] = await conn.execute('SELECT farmerId, cropName FROM CropListing WHERE id=?', [cropId])
        if (status === 'APPROVED') {
          await conn.execute(
            "UPDATE CropListing SET lotStatus='QUALITY_VERIFIED', inspectionStatus='APPROVED', updatedAt=NOW() WHERE id=?",
            [cropId]
          )
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
          if (crops.length > 0) {
            await conn.execute(
              "INSERT INTO Notification (id, userId, type, title, message, relatedEntityType, relatedEntityId, `read`, createdAt, updatedAt) VALUES (UUID(),?,?,?,?,?,?,false,NOW(),NOW())",
              [crops[0].farmerId, 'INSPECTION_REJECTED', 'Lot inspection rejected', 'Your crop lot "' + crops[0].cropName + '" did not pass physical inspection. Remarks: ' + (remarks || 'See inspection details.'), 'crop', cropId]
            ).catch(() => {})
          }
        } else if (status === 'REINSPECTION_REQUIRED') {
          await conn.execute(
            "UPDATE CropListing SET lotStatus='REINSPECTION_REQUIRED', inspectionStatus='REINSPECTION_REQUIRED', updatedAt=NOW() WHERE id=?",
            [cropId]
          )
          if (crops.length > 0) {
            await conn.execute(
              "INSERT INTO Notification (id, userId, type, title, message, relatedEntityType, relatedEntityId, `read`, createdAt, updatedAt) VALUES (UUID(),?,?,?,?,?,?,false,NOW(),NOW())",
              [crops[0].farmerId, 'INSPECTION_REQUEST', 'Reinspection required', 'Reinspection requested for "' + crops[0].cropName + '". Remarks: ' + (remarks || 'Please review and resubmit.'), 'crop', cropId]
            ).catch(() => {})
          }
        } else if (status === 'IN_PROGRESS') {
          await conn.execute(
            "UPDATE CropListing SET lotStatus='INSPECTION_IN_PROGRESS', inspectionStatus='IN_PROGRESS', updatedAt=NOW() WHERE id=?",
            [cropId]
          )
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
