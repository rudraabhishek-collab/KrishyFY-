const mysql = require("mysql2/promise")

const getConnection = () =>
  mysql.createPool({
    host: "localhost",
    user: "root",
    password: "ROOT",
    database: "krishify",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

// Create a new notification for a user
async function createNotification({ userId, type, title, message, relatedEntityType, relatedEntityId }) {
  if (!userId || !type || !title || !message) {
    throw new Error("Missing required notification fields: userId, type, title, message")
  }

  const connection = await getConnection()
  try {
    const [result] = await connection.execute(
      "INSERT INTO Notification (id, userId, type, title, message, relatedEntityType, relatedEntityId, read, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, ?, ?, false, NOW(), NOW())",
      [userId, type, title, message, relatedEntityType, relatedEntityId]
    )
    return { id: result.insertId, ...{ userId, type, title, message, relatedEntityType, relatedEntityId, read: false, createdAt: new Date(), updatedAt: new Date() } }
  } finally {
    await connection.end()
  }
}

// Get notifications for a user (optionally only unread)
async function getNotifications(userId, onlyUnread = false) {
  const connection = await getConnection()
  try {
    let query = "SELECT * FROM Notification WHERE userId = ?"
    let params = [userId]

    if (onlyUnread) {
      query += " AND read = false"
    }

    query += " ORDER BY createdAt DESC"
    const [notifications] = await connection.execute(query, params)
    return notifications
  } finally {
    await connection.end()
  }
}

// Mark a single notification as read
async function markAsRead(notificationId, userId) {
  const connection = await getConnection()
  try {
    const [result] = await connection.execute(
      "UPDATE Notification SET read = true, updatedAt = NOW() WHERE id = ? AND userId = ?",
      [notificationId, userId]
    )
    return result.affectedRows > 0
  } finally {
    await connection.end()
  }
}

// Mark all notifications as read for a user
async function markAllAsRead(userId) {
  const connection = await getConnection()
  try {
    const [result] = await connection.execute(
      "UPDATE Notification SET read = true, updatedAt = NOW() WHERE userId = ? AND read = false",
      [userId]
    )
    return result.affectedRows
  } finally {
    await connection.end()
  }
}

// Get unread count for a user
async function getUnreadCount(userId) {
  const connection = await getConnection()
  try {
    const [result] = await connection.execute(
      "SELECT COUNT(*) as count FROM Notification WHERE userId = ? AND read = false",
      [userId]
    )
    return result[0].count
  } finally {
    await connection.end()
  }
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
}