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
  try {
    const sessionId = req.cookies["krishify_session"]

    if (!sessionId) {
      return res.status(200).json({ authenticated: false, user: null })
    }

    const connection = await pool.getConnection()

    try {
      // Find session with user data, check expiration
      // Use explicit column aliases to avoid collision
      const [rows] = await connection.execute(
        `SELECT s.id AS sessionId, s.expires,
                u.id AS userId, u.name AS userName, u.email AS userEmail, u.role AS userRole
         FROM Session s
         JOIN User u ON s.userId = u.id
         WHERE s.id = ? AND s.expires > NOW()`,
        [sessionId]
      )

      if (rows.length === 0) {
        return res.status(200).json({ authenticated: false, user: null })
      }

      const row = rows[0]
      return res.status(200).json({
        authenticated: true,
        user: {
          id: row.userId,
          name: row.userName,
          email: row.userEmail,
          role: row.userRole,
        },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Me endpoint error:", error)
    return res.status(500).json({ authenticated: false, user: null })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
