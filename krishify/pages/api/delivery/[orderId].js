const mysql = require('mysql2/promise')
const crypto = require('crypto')

const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'ROOT', database: 'krishify', waitForConnections: true, connectionLimit: 10, queueLimit: 0 })

const TRANSITIONS = {
  CREATED: ['PACKED', 'CANCELLED'],
  PACKED: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['IN_TRANSIT'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

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
    const orderId = req.query.orderId
    if (!orderId) return res.status(400).json({ error: 'Order ID required' })

    const user = await getUser(req.cookies?.krishify_session)
    if (!user) return res.status(401).json({ error: 'Unauthenticated' })

    const conn = await pool.getConnection()
    try {
      // Verify order access
      let orderQ = 'SELECT * FROM `Order` WHERE id = ?'
      let orderP = [orderId]
      if (user.role === 'buyer') { orderQ += ' AND buyerId = ?'; orderP.push(user.userId) }
      else if (user.role === 'farmer') { orderQ += ' AND farmerId = ?'; orderP.push(user.userId) }
      const [orders] = await conn.execute(orderQ, orderP)
      if (orders.length === 0) return res.status(404).json({ error: 'Order not found or not accessible' })

      // GET — return delivery + timeline
      if (req.method === 'GET') {
        const [deliveries] = await conn.execute('SELECT * FROM Delivery WHERE orderId = ?', [orderId])
        if (deliveries.length === 0) return res.status(404).json({ error: 'No delivery record found for this order' })
        const delivery = deliveries[0]
        const [events] = await conn.execute('SELECT * FROM DeliveryEvent WHERE deliveryId = ? ORDER BY createdAt ASC', [delivery.id])
        return res.status(200).json({ success: true, delivery, timeline: events })
      }

      // PATCH — update delivery status (farmers only)
      if (req.method === 'PATCH') {
        if (user.role !== 'farmer') return res.status(403).json({ error: 'Farmer role required to update delivery' })

        const [deliveries] = await conn.execute('SELECT * FROM Delivery WHERE orderId = ?', [orderId])
        if (deliveries.length === 0) return res.status(404).json({ error: 'Delivery not found' })
        const delivery = deliveries[0]

        const { status, trackingNumber, deliveryPartner, estimatedDeliveryDate } = req.body || {}
        if (!status) return res.status(400).json({ error: 'status is required' })

        const allowed = TRANSITIONS[delivery.status] || []
        if (!allowed.includes(status)) {
          return res.status(409).json({ error: `Cannot transition from ${delivery.status} to ${status}` })
        }

        const setParts = ['status = ?', 'updatedAt = NOW()']
        const setParams = [status]
        if (status === 'DISPATCHED') setParts.push('dispatchedAt = NOW()')
        if (status === 'DELIVERED') setParts.push('deliveredAt = NOW()')
        if (trackingNumber) { setParts.push('trackingNumber = ?'); setParams.push(trackingNumber) }
        if (deliveryPartner) { setParts.push('deliveryPartner = ?'); setParams.push(deliveryPartner) }
        if (estimatedDeliveryDate) { setParts.push('estimatedDeliveryDate = ?'); setParams.push(new Date(estimatedDeliveryDate)) }

        await conn.execute(`UPDATE Delivery SET ${setParts.join(', ')} WHERE id = ?`, [...setParams, delivery.id])

        // Log event
        const eventTitles = { PACKED: 'Packed', DISPATCHED: 'Dispatched', IN_TRANSIT: 'In Transit', OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' }
        await conn.execute(
          'INSERT INTO DeliveryEvent (id, deliveryId, status, title, description, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())',
          [delivery.id, status, eventTitles[status] || status, `Delivery status updated to ${status}`]
        )

        // Notify buyer
        const notifyStatuses = { DISPATCHED: 'Your order has been dispatched.', DELIVERED: 'Your order has been delivered.' }
        if (notifyStatuses[status]) {
          const buyerId = orders[0].buyerId
          await conn.execute(
            'INSERT INTO Notification (id, userId, type, title, message, relatedEntityType, relatedEntityId, `read`, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, ?, ?, false, NOW(), NOW())',
            [buyerId, 'DELIVERY_UPDATE', eventTitles[status], notifyStatuses[status], 'delivery', delivery.id]
          ).catch(() => {})
        }

        const [updated] = await conn.execute('SELECT * FROM Delivery WHERE id = ?', [delivery.id])
        const [events] = await conn.execute('SELECT * FROM DeliveryEvent WHERE deliveryId = ? ORDER BY createdAt ASC', [delivery.id])
        return res.status(200).json({ success: true, delivery: updated[0], timeline: events })
      }

      return res.status(405).json({ error: 'Method not allowed' })
    } finally { conn.release() }
  } catch (err) {
    console.error('Delivery [orderId] error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
