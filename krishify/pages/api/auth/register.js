require("dotenv/config")
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")

exports.default = async function handler(req, res) {
  try {
    const body = req.body || {}
    const { name, email, password, role } = body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" })
    }

    // Validate role - only farmer and buyer allowed during public registration
    // Admin role can only be provisioned manually by existing admins
    const validRoles = ["farmer", "buyer"]
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Admin role must be provisioned manually." })
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
      // Check for existing user
      const [existingUsers] = await connection.execute(
        "SELECT id FROM User WHERE email = ?",
        [email]
      )

      if (existingUsers.length > 0) {
        return res.status(409).json({ error: "Email already registered" })
      }

      // Hash password
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Create user with role from request or default to farmer
      const userRole = role || "farmer"

      const [result] = await connection.execute(
        "INSERT INTO User (id, name, email, password, role, createdAt) VALUES (UUID(), ?, ?, ?, ?, NOW())",
        [name, email, hashedPassword, userRole]
      )

      const [users] = await connection.execute(
        "SELECT id, name, email, role FROM User WHERE id = ?",
        [result.insertId]
      )

      return res.status(201).json({
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