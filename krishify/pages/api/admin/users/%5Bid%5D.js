const { getPool } = require('../../../../lib/db')
module.exports = async function handler(req, res) {
  // Step 1: Admin authorization
  const sessionId = req.cookies?.krishify_session
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthenticated" })
  }

  const pool = getPool()

  const connection = await pool.getConnection()

  try {
    // Step 2: Verify session
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

    // Step 3: Get user ID from route parameters
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ error: "User ID is required" })
    }

    // Step 4: Get the target user
    const [users] = await connection.execute(
      "SELECT id, name, email, role, createdAt FROM User WHERE id = ?",
      [id]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const user = users[0]

    // Step 5: Parse update body
    const { name, role, status } = req.body || {}

    // Step 6: Build update query dynamically
    const updates = []
    const updateValues = []

    if (name !== undefined) {
      updates.push("name = ?")
      updateValues.push(name)
    }

    if (role !== undefined) {
      const validRoles = ["admin", "buyer", "farmer"]
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" })
      }
      updates.push("role = ?")
      updateValues.push(role)
    }

    if (status !== undefined) {
      updates.push("status = ?")
      updateValues.push(status)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" })
    }

    updateValues.push(id)

    // Step 7: Execute update
    const [result] = await connection.execute(
      `UPDATE User SET ${updates.join(", ")} WHERE id = ?`,
      updateValues
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    // Step 8: Return updated user
    const [updatedUsers] = await connection.execute(
      "SELECT id, name, email, role, createdAt FROM User WHERE id = ?",
      [id]
    )

    return res.status(200).json({
      success: true,
      user: updatedUsers[0],
    })
  } catch (error) {
    console.error("Admin user update error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    await connection.end()
  }
}
if (typeof module.exports === "function") { module.exports.default = module.exports; }
