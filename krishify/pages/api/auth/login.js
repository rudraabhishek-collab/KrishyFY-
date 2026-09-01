require("dotenv/config")
const { getPool } = require('../../../lib/db')
const bcrypt = require("bcrypt")

// Create MySQL pool once at module level (shared across all requests)
const pool = getPool()

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const body = req.body || {}
    const { email, password } = body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const connection = await pool.getConnection()

    try {
      // Find user
      const [users] = await connection.execute(
        "SELECT id, name, email, password, role FROM User WHERE email = ?",
        [email]
      )

      if (users.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      const user = users[0]

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password)
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Create session
      const sessionId = require("crypto").randomBytes(32).toString("hex")
      const expires = new Date()
      expires.setHours(expires.getHours() + 24)

      await connection.execute(
        "INSERT INTO Session (id, userId, expires, createdAt) VALUES (?, ?, ?, NOW())",
        [sessionId, user.id, expires]
      )

      // Set session cookie - Next.js uses res.setHeader for cookies
      res.setHeader(
        "Set-Cookie",
        `krishify_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${24 * 60 * 60}`
      )

      return res.status(200).json({
        success: true,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
