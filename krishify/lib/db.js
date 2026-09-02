const mysql = require('mysql2/promise')

function getConfig() {
  const dbUrl = process.env.DATABASE_URL

  if (dbUrl) {
    try {
      // Handle both mysql:// and mysql2:// schemes
      const urlStr = dbUrl.replace(/^mysql2:\/\//, 'mysql://')
      const url = new URL(urlStr)
      const host = url.hostname
      const port = parseInt(url.port) || 3306
      const user = decodeURIComponent(url.username)
      const password = decodeURIComponent(url.password)
      const database = url.pathname.replace(/^\//, '')

      // Enable SSL for cloud databases (anything not localhost)
      const isLocal = host === 'localhost' || host === '127.0.0.1'
      const sslParam = url.searchParams.get('ssl')
      const sslcaParam = url.searchParams.get('sslaccept')
      
      const ssl = !isLocal || sslParam === 'true' || sslcaParam
        ? { rejectUnauthorized: false }
        : undefined

      return {
        host, port, user, password, database,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_POOL_SIZE) || 5,
        queueLimit: 0,
        ssl,
        connectTimeout: 10000,
      }
    } catch (e) {
      console.error('[db] Invalid DATABASE_URL:', e.message)
    }
  }

  // Local development defaults
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ROOT',
    database: process.env.DB_NAME || 'krishify',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 10000,
  }
}

let _pool = null

function getPool() {
  if (!_pool) {
    const config = getConfig()
    _pool = mysql.createPool(config)
    
    // Test connection on first use in production
    if (process.env.NODE_ENV === 'production') {
      _pool.getConnection()
        .then(conn => { conn.release(); console.log('[db] Connected to database') })
        .catch(err => console.error('[db] Connection failed:', err.message))
    }
  }
  return _pool
}

module.exports = { getPool }
