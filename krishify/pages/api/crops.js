const { getPool } = require('../../lib/db')
const pool = getPool()

async function getSession(sessionId) {
  if (!sessionId) return null
  const connection = await pool.getConnection()
  try {
    const [sessions] = await connection.execute(
      "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
      [sessionId]
    )
    return sessions.length > 0 ? sessions[0] : null
  } finally {
    connection.release()
  }
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") return getListingsHandler(req, res)
    if (req.method === "POST") return createListingHandler(req, res)
    return res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    console.error("Crops API error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function getListingsHandler(req, res) {
  const connection = await pool.getConnection()
  try {
    const conditions = ["cl.status = 'ACTIVE'"]
    const params = []

    if (req.query.search) {
      conditions.push("(cl.cropName LIKE ? OR cl.description LIKE ?)")
      params.push(`%${req.query.search}%`, `%${req.query.search}%`)
    }

    if (req.query.category) {
      conditions.push("cl.category = ?")
      params.push(req.query.category)
    }

    if (req.query.location) {
      conditions.push("cl.location LIKE ?")
      params.push(`%${req.query.location}%`)
    }

    // Single listing by id
    if (req.query.id) {
      conditions.push("cl.id = ?")
      params.push(req.query.id)
    }

    const whereClause = conditions.join(" AND ")

    const [listings] = await connection.execute(
      `SELECT cl.id, cl.cropName, cl.category, cl.description, cl.quantity, cl.unit,
              cl.quantityKg, cl.expectedPrice, cl.expectedPricePerQuintal,
              cl.lotStatus, cl.inspectionStatus, cl.aiAssessmentStatus,
              cl.location, cl.harvestDate, cl.status, cl.createdAt,
              cl.farmerId,
              u.name AS farmerName
       FROM CropListing cl
       JOIN User u ON cl.farmerId = u.id
       WHERE ${whereClause}
       ORDER BY cl.createdAt DESC`,
      params
    )

    if (req.query.id) {
      if (listings.length === 0) {
        return res.status(404).json({ error: "Crop listing not found" })
      }
      return res.status(200).json({ success: true, listing: listings[0] })
    }

    return res.status(200).json({ success: true, listings, count: listings.length })
  } finally {
    connection.release()
  }
}

async function createListingHandler(req, res) {
  const sessionId = req.cookies["krishify_session"]
  const user = await getSession(sessionId)

  if (!user) {
    return res.status(401).json({ error: "Unauthenticated or session expired" })
  }
  if (user.role !== "farmer") {
    return res.status(403).json({ error: "Farmer role required" })
  }

  const body = req.body || {}
  const { cropName, category, description, quantity, unit, expectedPrice, location, harvestDate } = body

  if (!cropName || !category || !quantity || !unit || !location || Number(quantity) <= 0) {
    return res.status(400).json({ error: "cropName, category, quantity (must be >0), unit, and location are required" })
  }

  if (!expectedPrice || Number(expectedPrice) <= 0) {
    return res.status(400).json({ error: "Expected price per quintal must be greater than 0" })
  }

  const quantityKg = (() => {
    const q = Number(quantity)
    if (unit === 'kg') return Math.max(q, 0)
    if (unit === 'quintal') return Math.max(q * 100, 0)
    if (unit === 'ton') return Math.max(q * 1000, 0)
    return Math.max(q, 0)
  })()

  const pricePerQuintal = Number(expectedPrice)

  const connection = await pool.getConnection()
  try {
    const listingId = require("crypto").randomUUID()
    const harvest = harvestDate ? new Date(harvestDate) : null

    await connection.execute(
      `INSERT INTO CropListing (id, farmerId, cropName, category, description, quantity, unit, quantityKg, expectedPricePerQuintal, expectedPrice, location, harvestDate, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())`,
      [listingId, user.userId, cropName, category, description || null, String(quantity), unit, quantityKg, pricePerQuintal, pricePerQuintal, location, harvest]
    )

    const [listings] = await connection.execute(
      "SELECT id, cropName, category, description, quantity, unit, quantityKg, expectedPricePerQuintal, lotStatus, inspectionStatus, aiAssessmentStatus FROM CropListing WHERE id = ?",
      [listingId]
    )

    return res.status(201).json({ success: true, listing: listings[0] })
  } finally {
    connection.release()
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
