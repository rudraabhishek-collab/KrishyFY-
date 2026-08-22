const mysql = require('mysql2/promise')
const crypto = require('crypto')

const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'ROOT', database: 'krishify', waitForConnections: true, connectionLimit: 10, queueLimit: 0 })

async function getUser(sessionId) {
  if (!sessionId) return null
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.execute(
      'SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()',
      [sessionId]
    )
    return rows[0] || null
  } finally { conn.release() }
}

module.exports = async function handler(req, res) {
  try {
    const user = await getUser(req.cookies?.krishify_session)
    if (!user) return res.status(401).json({ error: 'Unauthenticated' })

    if (req.method === 'GET') {
      // List deliveries for the current user's orders
      const conn = await pool.getConnection()
      try {
        let deliveries
        if (user.role === 'farmer') {
          const [rows] = await conn.execute(
            `SELECT d.*, o.cropListingId, cl.cropName, ub.name as buyerName
             FROM Delivery d
             JOIN \`Order\` o ON d.orderId = o.id
             JOIN CropListing cl ON o.cropListingId = cl.id
             JOIN User ub ON o.buyerId = ub.id
             WHERE o.farmerId = ?
             ORDER BY d.createdAt DESC`,
            [user.userId]
          )
          deliveries = rows
        } else if (user.role === 'buyer') {
          const [rows] = await conn.execute(
            `SELECT d.*, o.cropListingId, cl.cropName, uf.name as farmerName
             FROM Delivery d
             JOIN \`Order\` o ON d.orderId = o.id
             JOIN CropListing cl ON o.cropListingId = cl.id
             JOIN User uf ON o.farmerId = uf.id
             WHERE o.buyerId = ?
             ORDER BY d.createdAt DESC`,
            [user.userId]
          )
          deliveries = rows
        } else {
          const [rows] = await conn.execute(
            `SELECT d.*, o.cropListingId, cl.cropName
             FROM Delivery d
             JOIN \`Order\` o ON d.orderId = o.id
             JOIN CropListing cl ON o.cropListingId = cl.id
             ORDER BY d.createdAt DESC`
          )
          deliveries = rows
        }
        return res.status(200).json({ success: true, deliveries })
      } finally { conn.release() }
    }

    if (req.method === 'POST') {
      const { orderId } = req.body || {}
      if (!orderId) return res.status(400).json({ error: 'orderId is required' })

      const conn = await pool.getConnection()
      try {
        // Verify order ownership
        const roleFilter = user.role === 'farmer' ? 'farmerId' : 'buyerId'
        const [orders] = await conn.execute(
          `SELECT * FROM \`Order\` WHERE id = ? AND ${roleFilter} = ?`,
          [orderId, user.userId]
        )
        if (orders.length === 0) return res.status(404).json({ error: 'Order not found or not yours' })

        // Check existing delivery
        const [existing] = await conn.execute('SELECT id FROM Delivery WHERE orderId = ?', [orderId])
        if (existing.length > 0) return res.status(409).json({ error: 'Delivery already exists for this order' })

        const deliveryId = crypto.randomUUID()
        await conn.execute(
          'INSERT INTO Delivery (id, orderId, status, createdAt, updatedAt) VALUES (?, ?, \'CREATED\', NOW(), NOW())',
          [deliveryId, orderId]
        )
        await conn.execute(
          'INSERT INTO DeliveryEvent (id, deliveryId, status, title, description, createdAt, updatedAt) VALUES (UUID(), ?, \'CREATED\', \'Delivery initialized\', \'Delivery tracking started.\', NOW(), NOW())',
          [deliveryId]
        )
        const [delivery] = await conn.execute('SELECT * FROM Delivery WHERE id = ?', [deliveryId])
        return res.status(201).json({ success: true, delivery: delivery[0] })
      } finally { conn.release() }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Delivery API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
