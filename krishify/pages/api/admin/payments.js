const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  // Admin authorization
  const sessionId = req.cookies?.krishify_session
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthenticated" })
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
    // Payment status breakdown
    const [paidStats] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid, SUM(CASE WHEN status = 'CREATED' THEN 1 ELSE 0 END) as pending FROM Payment"
    )

    // Recent payments (last 10)
    const [recentPayments] = await connection.execute(
      "SELECT id, userId, amount, status, createdAt FROM Payment ORDER BY createdAt DESC LIMIT 10"
    )

    // Payment method breakdown
    const [methodStats] = await connection.execute(
      "SELECT payment_method, COUNT(*) as count FROM Payment GROUP BY payment_method"
    )

    // Total revenue
    const [revenueResult] = await connection.execute(
      "SELECT SUM(amount) as total_revenue FROM Payment WHERE status = 'PAID'"
    )

    return res.status(200).json({
      success: true,
      payments: {
        stats: {
          total: paidStats[0].total,
          paid: paidStats[0].paid || 0,
          pending: paidStats[0].pending || 0,
        },
        recent: recentPayments,
        methodDistribution: methodStats,
        totalRevenue: revenueResult[0].total_revenue || 0,
      },
    })
  } catch (error) {
    console.error("Admin payments error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    await connection.end()
  }
}