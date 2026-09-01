require("dotenv/config")
const { getPool } = require('../../../lib/db')
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const sessionId = req.cookies["krishify_session"]

    const pool = getPool()

    const connection = await pool.getConnection()

    try {
      if (sessionId) {
        await connection.execute("DELETE FROM Session WHERE id = ?", [sessionId])
      }

      // Clear cookie via setHeader
      res.setHeader(
        "Set-Cookie",
        "krishify_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
      )

      return res.status(200).json({ success: true })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Logout error:", error)
    res.setHeader(
      "Set-Cookie",
      "krishify_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    )
    return res.status(200).json({ success: true })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
