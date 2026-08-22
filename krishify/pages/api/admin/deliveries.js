const mysql = require("mysql2/promise")
const { adminAuth } = require("../../../lib/adminAuth")

module.exports = async function handler(req, res) {
  const auth = await adminAuth(req)
  if (!auth.success) {
    return res.status(auth.error === "Unauthenticated" ? 401 : 403).json({ error: auth.error })
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
    const { status, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page, 10)
    const pageSize = parseInt(limit, 10)
    const offset = (pageNum - 1) * pageSize

    let whereClause = ""
    let whereParams = []

    if (status) {
      whereClause = "WHERE d.status = ?"
      whereParams.push(status)
    }

    const [countResult] = await connection.execute(
      `SELECT COUNT(*) AS total FROM Delivery d ${whereClause}`,
      whereParams
    )
    const total = countResult[0].total
    const totalPages = Math.ceil(total / pageSize)

    const [deliveries] = await connection.execute(
      `SELECT d.id, d.orderId, d.status, d.trackingNumber, d.deliveryPartner,
              d.estimatedDeliveryDate, d.dispatchedAt, d.deliveredAt, d.createdAt,
              d.updatedAt
       FROM Delivery d
       ${whereClause}
       ORDER BY d.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...whereParams, pageSize, offset]
    )

    return res.status(200).json({ success: true, deliveries, pagination: { page: pageNum, limit: pageSize, total, totalPages } })
  } catch (error) {
    console.error("Admin deliveries error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    connection.release()
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
