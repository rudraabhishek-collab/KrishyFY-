const mysql = require('mysql2/promise')

// Parse DATABASE_URL if provided (for production/Vercel)
// Format: mysql://user:password@host:port/database
function getConfig() {
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      return {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1), // remove leading /
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: url.searchParams.get('ssl') === 'true' ? { rejectUnauthorized: false } : undefined,
      }
    } catch (e) {
      console.error('Invalid DATABASE_URL format:', e.message)
    }
  }

  // Local development fallback
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ROOT',
    database: process.env.DB_NAME || 'krishify',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }
}

let _pool = null

function getPool() {
  if (!_pool) {
    _pool = mysql.createPool(getConfig())
  }
  return _pool
}

module.exports = { getPool }
