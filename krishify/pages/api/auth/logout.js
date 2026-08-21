require("dotenv/config")
const mysql = require("mysql2/promise")

exports.default = async function handler(req, res) {
  try {
    const sessionId = req.cookies["krishify_session"]

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
      if (sessionId) {
        // Delete session
        await connection.execute(
          "DELETE FROM Session WHERE id = ?",
          [sessionId]
        )
      }

      // Clear cookie
      res.clearCookie("krishify_session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      })

      return res.status(200).json({ success: true })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Logout error:", error)
    res.clearCookie("krishify_session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })
    return res.status(200).json({ success: true })
  }
}