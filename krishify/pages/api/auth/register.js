require("dotenv/config")
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")

// Create MySQL pool once at module level (shared across all requests)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "ROOT",
  database: "krishify",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const body = req.body || {}
    const { name, email, password, role } = body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" })
    }

    // Validate role - only farmer and buyer allowed during public registration
    const validRoles = ["farmer", "buyer"]
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be farmer or buyer." })
    }

    const connection = await pool.getConnection()

    try {
      // Check for existing user
      const [existingUsers] = await connection.execute(
        "SELECT id FROM User WHERE email = ?",
        [email]
      )

      if (existingUsers.length > 0) {
        return res.status(409).json({ error: "Email already registered" })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      const userRole = role || "buyer"

      // UUID() used for id
      await connection.execute(
        "INSERT INTO User (id, name, email, password, role, createdAt) VALUES (UUID(), ?, ?, ?, ?, NOW())",
        [name, email, hashedPassword, userRole]
      )

      // Fetch the created user (can't use insertId because UUID)
      const [users] = await connection.execute(
        "SELECT id, name, email, role FROM User WHERE email = ?",
        [email]
      )

      return res.status(201).json({
        success: true,
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        role: users[0].role,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
