const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    // Build WHERE clause for ACTIVE listings only
    const conditions = ["cl.status = 'ACTIVE'"]

    // Search filter
    if (req.query.search) {
      conditions.push("(cl.cropName LIKE ? OR cl.description LIKE ?)")
      const searchTerm = `%${req.query.search}%`
      // note: will bind parameters below
    }

    // Category filter
    if (req.query.category) {
      conditions.push("cl.category = ?")
    }

    // Location filter
    if (req.query.location) {
      conditions.push("cl.location = ?")
    }

    const whereClause = conditions.join(" AND ")

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
      // Build query with parameterized filters
      let query = `SELECT cl.*, u.name as farmerName, u.location as farmerLocation FROM CropListing cl JOIN User u ON cl.farmerId = u.id WHERE ${whereClause} ORDER BY cl.createdAt DESC`
      let params = []

      // Add search parameters
      if (req.query.search) {
        query = query.replace("cl.cropName LIKE ?", "cl.cropName LIKE ?")
        query = query.replace("cl.description LIKE ?", "cl.description LIKE ?")
        params.push(`%${req.query.search}%`, `%${req.query.search}%`)
      }

      // Add category parameter
      if (req.query.category) {
        params.push(req.query.category)
      }

      // Add location parameter
      if (req.query.location) {
        params.push(req.query.location)
      }

      const [listings] = await connection.execute(query, params)

      return res.status(200).json({
        success: true,
        listings,
        count: listings.length,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Get marketplace listings error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}