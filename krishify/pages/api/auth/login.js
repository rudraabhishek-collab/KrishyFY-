require("dotenv/config")
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")

exports.default = async function handler(req, res) {
  try {
    const body = req.body || {}
    const { email, password } = body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
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

      // Set session cookie
      res.cookie("krishify_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60,
      })

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sessionId,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}