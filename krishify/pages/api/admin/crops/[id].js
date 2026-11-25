const { getPool } = require('../../../../lib/db')

module.exports = async function handler(req, res) {
  const sessionId = req.cookies?.krishify_session
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthenticated" })
  }

  const pool = getPool()
  const connection = await pool.getConnection()

  try {
    const [sessions] = await connection.execute(
      "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
      [sessionId]
    )

    if (sessions.length === 0) {
      return res.status(401).json({ error: "Session expired" })
    }

    if (sessions[0].role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin role required" })
    }

    const { id } = req.query
    if (!id) {
      return res.status(400).json({ error: "Crop ID is required" })
    }

    const [crops] = await connection.execute(
      "SELECT id, cropName, description, category, expectedPrice, expectedPricePerQuintal, quantity, unit, quantityKg, lotStatus, inspectionStatus, status FROM CropListing WHERE id = ?",
      [id]
    )

    if (crops.length === 0) {
      return res.status(404).json({ error: "Crop not found" })
    }

    if (req.method === "GET") {
      return res.status(200).json({ success: true, crop: crops[0] })
    }

    if (req.method !== "PATCH" && req.method !== "PUT") {
      return res.status(405).json({ error: "Method not allowed" })
    }

    const { status, lotStatus, expectedPrice, expectedPricePerQuintal, quantity } = req.body || {}

    const updates = []
    const updateValues = []

    if (status !== undefined) {
      updates.push("status = ?")
      updateValues.push(status)
    }

    if (lotStatus !== undefined) {
      updates.push("lotStatus = ?")
      updateValues.push(lotStatus)
    }

    if (expectedPrice !== undefined) {
      updates.push("expectedPrice = ?")
      updateValues.push(expectedPrice)
    }

    if (expectedPricePerQuintal !== undefined) {
      updates.push("expectedPricePerQuintal = ?")
      updateValues.push(expectedPricePerQuintal)
    }

    if (quantity !== undefined) {
      updates.push("quantity = ?")
      updateValues.push(String(quantity))
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" })
    }

    updates.push("updatedAt = NOW()")
    updateValues.push(id)

    await connection.execute(
      `UPDATE CropListing SET ${updates.join(", ")} WHERE id = ?`,
      updateValues
    )

    const [updatedCrops] = await connection.execute(
      "SELECT id, cropName, description, category, expectedPrice, expectedPricePerQuintal, quantity, unit, quantityKg, lotStatus, inspectionStatus, status FROM CropListing WHERE id = ?",
      [id]
    )

    return res.status(200).json({
      success: true,
      crop: updatedCrops[0],
    })
  } catch (error) {
    console.error("Admin crop update error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    connection.release()
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
