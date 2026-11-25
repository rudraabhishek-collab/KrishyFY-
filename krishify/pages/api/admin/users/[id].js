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
      return res.status(400).json({ error: "User ID is required" })
    }

    const [users] = await connection.execute(
      "SELECT id, name, email, role, createdAt FROM User WHERE id = ?",
      [id]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    if (req.method === "GET") {
      return res.status(200).json({ success: true, user: users[0] })
    }

    if (req.method !== "PATCH" && req.method !== "PUT") {
      return res.status(405).json({ error: "Method not allowed" })
    }

    const { name, role } = req.body || {}

    const updates = []
    const updateValues = []

    if (name !== undefined) {
      updates.push("name = ?")
      updateValues.push(name)
    }

    if (role !== undefined) {
      const validRoles = ["admin", "buyer", "farmer", "inspector"]
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" })
      }
      updates.push("role = ?")
      updateValues.push(role)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" })
    }

    updateValues.push(id)

    await connection.execute(
      `UPDATE User SET ${updates.join(", ")} WHERE id = ?`,
      updateValues
    )

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
    connection.release()
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
