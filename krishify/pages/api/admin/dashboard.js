const { getPool } = require('../../../lib/db')
module.exports = async function handler(req, res) {
  // Admin authorization: verify session and role
  const sessionId = req.cookies?.krishify_session
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthenticated" })
  }

  const pool = getPool()

  const connection = await pool.getConnection()

  try {
    const [sessions] = await connection.execute(
      "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
      [sessionId]
    )

    if (sessions.length === 0) {
      return res.status(401).json({ error: "Session expired" })
    }

    const user = sessions[0]
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin role required" })
    }

    // Step 2: Get user count breakdown
    const [userStats] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN role = 'buyer' THEN 1 ELSE 0 END) as buyers, SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END) as farmers, SUM(CASE WHEN role = 'inspector' THEN 1 ELSE 0 END) as inspectors, SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins FROM User"
    )

    // Step 3: Get crop listing stats
    const [cropStats] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active, SUM(CASE WHEN status = 'SOLD' THEN 1 ELSE 0 END) as sold FROM CropListing"
    )

    // Step 4: Get auction stats
    const [auctionStats] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'ACTIVE' AND endsAt > NOW() THEN 1 ELSE 0 END) as active, SUM(CASE WHEN status <> 'ACTIVE' OR endsAt <= NOW() THEN 1 ELSE 0 END) as completed FROM Auction"
    )

    // Step 5: Get order status breakdown
    const [orderStats] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed, SUM(CASE WHEN status = 'PROCESSING' THEN 1 ELSE 0 END) as processing, SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled FROM \`Order\`"
    )

    // Step 6: Get payment stats
    const [paymentStats] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid, SUM(CASE WHEN status = 'CREATED' THEN 1 ELSE 0 END) as pending FROM Payment"
    )

    // Step 7: Get delivery status breakdown
    const [deliveryStats] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'CREATED' THEN 1 ELSE 0 END) as created, SUM(CASE WHEN status = 'PACKED' THEN 1 ELSE 0 END) as packed, SUM(CASE WHEN status = 'DISPATCHED' THEN 1 ELSE 0 END) as dispatched, SUM(CASE WHEN status = 'IN_TRANSIT' THEN 1 ELSE 0 END) as in_transit, SUM(CASE WHEN status = 'OUT_FOR_DELIVERY' THEN 1 ELSE 0 END) as out_for_delivery, SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered, SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled FROM Delivery"
    )

    // Step 8: Get review stats
    const [reviewStats] = await connection.execute(
      "SELECT COUNT(*) as total, AVG(rating) as average_rating FROM Review"
    )

    // Step 9: Return dashboard statistics (no sensitive data)
    return res.status(200).json({
      success: true,
      dashboard: {
        users: {
          total: userStats[0].total,
          buyers: userStats[0].buyers || 0,
          farmers: userStats[0].farmers || 0,
          inspectors: userStats[0].inspectors || 0,
          admins: userStats[0].admins || 0,
        },
        crops: {
          total: cropStats[0].total,
          active: cropStats[0].active,
          sold: cropStats[0].sold,
        },
        auctions: {
          total: auctionStats[0].total,
          active: auctionStats[0].active,
          completed: auctionStats[0].completed,
        },
        orders: {
          total: orderStats[0].total,
          pending: orderStats[0].pending,
          confirmed: orderStats[0].confirmed,
          processing: orderStats[0].processing,
          completed: orderStats[0].completed,
          cancelled: orderStats[0].cancelled,
        },
        payments: {
          total: paymentStats[0].total,
          paid: paymentStats[0].paid || 0,
          pending: paymentStats[0].pending || 0,
        },
        deliveries: {
          total: deliveryStats[0].total,
          created: deliveryStats[0].created || 0,
          packed: deliveryStats[0].packed || 0,
          dispatched: deliveryStats[0].dispatched || 0,
          in_transit: deliveryStats[0].in_transit || 0,
          out_for_delivery: deliveryStats[0].out_for_delivery || 0,
          delivered: deliveryStats[0].delivered || 0,
          cancelled: deliveryStats[0].cancelled || 0,
        },
        reviews: {
          total: reviewStats[0].total || 0,
          average_rating: reviewStats[0].average_rating !== null ? parseFloat(Number(reviewStats[0].average_rating).toFixed(1)) : 0,
        },
      },
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    connection.release()
  }
}
if (typeof module.exports === "function") { module.exports.default = module.exports; }
