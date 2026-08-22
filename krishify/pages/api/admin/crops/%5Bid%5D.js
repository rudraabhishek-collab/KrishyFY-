const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  // Admin authorization
  const sessionId = req.cookies?.krishify_session
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthenticated" })
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
    // Verify session
    const [sessions] = await connection.execute(
      "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
      [sessionId]
    )

    if (sessions.length === 0) {
      return res.status(401).json({ error: "Session expired" })
    }

    const adminUser = sessions[0]
    if (adminUser.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin role required" })
    }

    // Get crop ID from route parameters
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ error: "Crop ID is required" })
    }

    // Get the target crop
    const [crops] = await connection.execute(
      "SELECT id, name, description, category, price, quantity, unit, status FROM CropListing WHERE id = ?",
      [id]
    )

    if (crops.length === 0) {
      return res.status(404).json({ error: "Crop not found" })
    }

    const crop = crops[0]

    // Parse update body
    const { status, price, quantity } = req.body || {}

    // Build update query dynamically
    const updates = []
    const updateValues = []

    if (status !== undefined) {
      updates.push("status = ?")
      updateValues.push(status)
    }

    if (price !== undefined) {
      updates.push("price = ?")
      updateValues.push(price)
    }

    if (quantity !== undefined) {
      updates.push("quantity = ?")
      updateValues.push(quantity)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" })
    }

    updateValues.push(id)

    // Execute update
    const [result] = await connection.execute(
      `UPDATE CropListing SET ${updates.join(", ")} WHERE id = ?`,
      updateValues
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Crop not found" })
    }

    // Return updated crop
    const [updatedCrops] = await connection.execute(
      "SELECT id, name, description, category, price, quantity, unit, status FROM CropListing WHERE id = ?",
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
    await connection.end()
  }
}