const crypto = require('crypto')
const { getPool } = require('../../../../lib/db')
const { createNotification } = require('../../../../lib/notifications')

const pool = getPool()

async function getSession(sessionId) {
  if (!sessionId) return null
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.execute(
      'SELECT s.id, s.userId, u.role, u.name FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()',
      [sessionId]
    )
    return rows[0] || null
  } finally {
    conn.release()
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getSession(req.cookies?.krishify_session)
    if (!user) return res.status(401).json({ error: 'Unauthenticated' })

    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Auction ID is required' })

    const conn = await pool.getConnection()
    try {
      const [auctions] = await conn.execute(
        `SELECT a.*, cl.farmerId, cl.cropName, cl.quantityKg, cl.unit, cl.lotStatus, cl.status AS listingStatus
         FROM Auction a
         JOIN CropListing cl ON a.cropListingId = cl.id
         WHERE a.id = ?`,
        [id]
      )
      if (auctions.length === 0) {
        return res.status(404).json({ error: 'Auction not found' })
      }
      const auction = auctions[0]

      const isFarmerOwner = user.role === 'farmer' && auction.farmerId === user.userId
      const isBuyer = user.role === 'buyer'
      const isAdmin = user.role === 'admin'
      if (!isFarmerOwner && !isBuyer && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized' })
      }

      // Check existing order for this auction
      const [existingOrders] = await conn.execute(
        'SELECT * FROM `Order` WHERE auctionId = ? LIMIT 1',
        [id]
      )
      if (existingOrders.length > 0) {
        return res.status(200).json({ success: true, order: existingOrders[0], alreadyFinalized: true })
      }

      // Buyers can only finalize once the auction has ended; farmers/admins can close & finalize anytime
      const ended = new Date(auction.endsAt) <= new Date() || auction.status !== 'ACTIVE'
      if (isBuyer && !ended) {
        return res.status(409).json({ error: 'Auction is still active. Wait until it ends to finalize.' })
      }

      // Find highest bid
      const [bids] = await conn.execute(
        'SELECT * FROM Bid WHERE auctionId = ? ORDER BY amount DESC, createdAt ASC LIMIT 1',
        [id]
      )
      if (bids.length === 0) {
        await conn.execute("UPDATE Auction SET status = 'ENDED', updatedAt = NOW() WHERE id = ?", [id])
        await conn.execute("UPDATE CropListing SET lotStatus = 'AUCTION_CLOSED', updatedAt = NOW() WHERE id = ?", [auction.cropListingId])
        return res.status(400).json({ error: 'No bids were placed on this auction' })
      }

      const winningBid = bids[0]
      if (isBuyer && winningBid.buyerId !== user.userId) {
        return res.status(403).json({ error: 'Only the winning bidder or farmer can finalize this auction' })
      }

      const quantityKg = Number(auction.quantityKg) || 0
      const quintals = quantityKg / 100
      const pricePerQuintal = Number(winningBid.amount)
      const totalAmount = Math.round(quintals * pricePerQuintal)
      const orderId = crypto.randomUUID()

      await conn.execute(
        "INSERT INTO `Order` (id, cropListingId, buyerId, farmerId, auctionId, quantity, unit, pricePerUnit, totalAmount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'kg', ?, ?, 'PENDING', NOW(), NOW())",
        [orderId, auction.cropListingId, winningBid.buyerId, auction.farmerId, id, String(quantityKg), pricePerQuintal, totalAmount]
      )

      await conn.execute("UPDATE Auction SET status = 'ENDED', updatedAt = NOW() WHERE id = ?", [id])
      await conn.execute("UPDATE CropListing SET lotStatus = 'SOLD', status = 'SOLD', updatedAt = NOW() WHERE id = ?", [auction.cropListingId])

      const [orders] = await conn.execute(
        `SELECT o.*, ub.name AS buyerName, uf.name AS farmerName, cl.cropName
         FROM \`Order\` o
         JOIN User ub ON o.buyerId = ub.id
         JOIN User uf ON o.farmerId = uf.id
         JOIN CropListing cl ON o.cropListingId = cl.id
         WHERE o.id = ?`,
        [orderId]
      )

      // Notify winner and farmer
      await Promise.allSettled([
        createNotification({
          userId: winningBid.buyerId,
          type: 'ORDER_PLACED',
          title: 'Auction won! Order created',
          message: `You won the auction for ${auction.cropName} at ₹${pricePerQuintal.toLocaleString('en-IN')}/q (Total: ₹${totalAmount.toLocaleString('en-IN')}). Complete payment on your order page.`,
          relatedEntityType: 'order',
          relatedEntityId: orderId,
        }),
        createNotification({
          userId: auction.farmerId,
          type: 'ORDER_PLACED',
          title: 'Auction finalized — Order created',
          message: `Your ${auction.cropName} auction closed at ₹${pricePerQuintal.toLocaleString('en-IN')}/q (Total: ₹${totalAmount.toLocaleString('en-IN')}).`,
          relatedEntityType: 'order',
          relatedEntityId: orderId,
        }),
      ])

      return res.status(201).json({ success: true, order: orders[0] })
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error('Finalize auction error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

if (typeof module.exports === "function") { module.exports.default = module.exports; }
