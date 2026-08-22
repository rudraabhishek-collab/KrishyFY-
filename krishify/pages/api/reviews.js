const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    // Determine the route pattern from the path
    const path = req.path
    const isFarmerRoute = path.startsWith("/api/reviews/farmer/")
    const isCropRoute = path.startsWith("/api/reviews/crop/")

    if (!isFarmerRoute && !isCropRoute) {
      // Default: create a review (POST only)
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
      }
      return createReviewHandler(req, res)
    }

    // List reviews pattern
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" })
    }

    if (isFarmerRoute) {
      // Extract farmerId from path: /api/reviews/farmer/[id]
      const farmerId = req.path.replace("/api/reviews/farmer/", "")
      return listFarmerReviews(farmerId, res)
    }

    if (isCropRoute) {
      // Extract cropListingId from path: /api/reviews/crop/[id]
      const cropListingId = req.path.replace("/api/reviews/crop/", "")
      return listCropReviews(cropListingId, res)
    }

    return res.status(400).json({ error: "Invalid review route" })
  } catch (error) {
    console.error("Reviews API error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function createReviewHandler(req, res) {
  try {
    // Authenticate session
    const sessionId = req.cookies["krishify_session"]
    if (!sessionId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    // Verify session
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
      // Verify session
      const [sessions] = await connection.execute(
        "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
        [sessionId]
      )

      if (sessions.length === 0) {
        return res.status(401).json({ error: "Unauthenticated or session expired" })
      }

      const user = sessions[0]
      if (user.role !== "buyer") {
        return res.status(403).json({ error: "Buyer role required" })
      }

      const body = req.body || {}
      const { orderId, rating, comment } = body

      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" })
      }

      if (rating === undefined || typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({ error: "Rating must be an integer between 1 and 5" })
      }

      if (comment !== undefined && comment.length > 1000) {
        return res.status(400).json({ error: "Comment must not exceed 1000 characters" })
      }

      // Load the order from MySQL
      const [orders] = await connection.execute(
        "SELECT o.*, u.name as farmerName, cl.cropName FROM \`Order\` o JOIN User u ON o.farmerId = u.id JOIN CropListing cl ON o.cropListingId = cl.id WHERE o.id = ?",
        [orderId]
      )

      if (orders.length === 0) {
        return res.status(404).json({ error: "Order not found" })
      }

      const order = orders[0]

      // Verify the order belongs to the authenticated buyer
      if (order.buyerId !== user.userId) {
        return res.status(403).json({ error: "This order does not belong to you" })
      }

      // Verify the order is eligible for review (must be COMPLETED)
      if (order.status !== "COMPLETED") {
        return res.status(400).json({ error: "Only COMPLETED orders can be reviewed" })
      }

      // Check whether the order already has a review
      const [existingReviews] = await connection.execute(
        "SELECT id FROM Review WHERE orderId = ? AND buyerId = ?",
        [orderId, user.userId]
      )

      if (existingReviews.length > 0) {
        return res.status(409).json({ error: "This order already has a review" })
      }

      // Derive farmerId and cropListingId from the order
      const farmerId = order.farmerId
      const cropListingId = order.cropListingId

      // Create the review
      const [result] = await connection.execute(
        "INSERT INTO Review (id, orderId, buyerId, farmerId, cropListingId, rating, comment, createdAt) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())",
        [orderId, user.userId, farmerId, cropListingId, rating, comment]
      )

      return res.status(201).json({
        success: true,
        review: {
          id: result.insertId,
          orderId,
          rating,
          comment,
          createdAt: new Date(),
        },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Create review error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function listFarmerReviews(farmerId, res) {
  const connection = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "ROOT",
    database: "krishify",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }).getConnection()

  try {
    const [reviews] = await connection.execute(
      "SELECT r.*, u.name as buyerName FROM Review r JOIN User u ON r.buyerId = u.id WHERE r.farmerId = ? ORDER BY r.createdAt DESC",
      [farmerId]
    )

    let averageRating = 0
    let totalCount = reviews.length

    if (totalCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = parseFloat((totalRating / totalCount).toFixed(1))
    }

    return res.status(200).json({
      success: true,
      averageRating,
      totalCount,
      reviews,
    })
  } catch (error) {
    console.error("List farmer reviews error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    connection.release()
  }
}

async function listCropReviews(cropListingId, res) {
  const connection = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "ROOT",
    database: "krishify",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }).getConnection()

  try {
    const [reviews] = await connection.execute(
      "SELECT r.*, u.name as buyerName FROM Review r JOIN User u ON r.buyerId = u.id WHERE r.cropListingId = ? ORDER BY r.createdAt DESC",
      [cropListingId]
    )

    let averageRating = 0
    let totalCount = reviews.length

    if (totalCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = parseFloat((totalRating / totalCount).toFixed(1))
    }

    return res.status(200).json({
      success: true,
      averageRating,
      totalCount,
      reviews,
    })
  } catch (error) {
    console.error("List crop reviews error:", error)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    connection.release()
  }
}