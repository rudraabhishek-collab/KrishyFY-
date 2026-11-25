const crypto = require('crypto')
const { getPool } = require('./db')

// Create a new notification for a user
async function createNotification({ userId, type, title, message, relatedEntityType = null, relatedEntityId = null }) {
  if (!userId || !type || !title || !message) {
    throw new Error("Missing required notification fields: userId, type, title, message")
  }

  const connection = await getPool().getConnection()
  try {
    const id = crypto.randomUUID()
    await connection.execute(
      "INSERT INTO Notification (id, userId, type, title, message, relatedEntityType, relatedEntityId, `read`, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, false, NOW(), NOW())",
      [id, userId, type, title, message, relatedEntityType, relatedEntityId]
    )
    return { id, userId, type, title, message, relatedEntityType, relatedEntityId, read: false, createdAt: new Date(), updatedAt: new Date() }
  } finally {
    connection.release()
  }
}

// Get notifications for a user (optionally only unread)
async function getNotifications(userId, onlyUnread = false) {
  const connection = await getPool().getConnection()
  try {
    let query = "SELECT * FROM Notification WHERE userId = ?"
    const params = [userId]

    if (onlyUnread) {
      query += " AND `read` = false"
    }

    query += " ORDER BY createdAt DESC"
    const [notifications] = await connection.execute(query, params)
    return notifications
  } finally {
    connection.release()
  }
}

// Mark a single notification as read
async function markAsRead(notificationId, userId) {
  const connection = await getPool().getConnection()
  try {
    const [result] = await connection.execute(
      "UPDATE Notification SET `read` = true, updatedAt = NOW() WHERE id = ? AND userId = ?",
      [notificationId, userId]
    )
    return result.affectedRows > 0
  } finally {
    connection.release()
  }
}

// Mark all notifications as read for a user
async function markAllAsRead(userId) {
  const connection = await getPool().getConnection()
  try {
    const [result] = await connection.execute(
      "UPDATE Notification SET `read` = true, updatedAt = NOW() WHERE userId = ? AND `read` = false",
      [userId]
    )
    return result.affectedRows
  } finally {
    connection.release()
  }
}

// Get unread count for a user
async function getUnreadCount(userId) {
  const connection = await getPool().getConnection()
  try {
    const [result] = await connection.execute(
      "SELECT COUNT(*) as count FROM Notification WHERE userId = ? AND `read` = false",
      [userId]
    )
    return result[0].count
  } finally {
    connection.release()
  }
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
}
