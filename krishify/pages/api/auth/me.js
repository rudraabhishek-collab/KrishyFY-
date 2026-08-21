require("dotenv/config")
const mysql = require("mysql2/promise")

exports.default = async function handler(req, res) {
  try {
    const sessionId = req.cookies["krishify_session"]

    if (!sessionId) {
      return res.status(200).json({ authenticated: false, user: null })
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
      // Find session with user data, check expiration
      const [rows] = await connection.execute(
        "SELECT s.id, s.userId, s.expires, s.createdAt, u.id, u.name, u.email, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
        [sessionId]
      )

      if (rows.length === 0) {
        return res.status(200).json({ authenticated: false, user: null })
      }

      const session = rows[0]
      return res.status(200).json({
        authenticated: true,
        user: {
          id: session.u.id,
          name: session.u.name,
          email: session.u.email,
          role: session.u.role,
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