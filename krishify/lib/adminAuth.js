const { getPool } = require('./db')
/**
 * Admin authorization helper
 * Verifies that the authenticated user has ADMIN role.
 * Uses the existing session infrastructure.
 *
 * @param {Object} req - Express/Next.js request object with cookies
 * @returns {Promise<Object>} - { success, user, error }
 */
async function adminAuth(req) {
  // Step 1: Read authenticated session from cookie
  const sessionId = req.cookies?.krishify_session

  if (!sessionId) {
    return { success: false, error: "Unauthenticated" }
  }

  // Step 2: Verify session expiry and retrieve user from database
  const pool = getPool()

  const connection = await pool.getConnection()

  try {
    const [sessions] = await connection.execute(
      "SELECT s.id, s.userId, u.role FROM Session s JOIN User u ON s.userId = u.id WHERE s.id = ? AND s.expires > NOW()",
      [sessionId]
    )

    if (sessions.length === 0) {
      return { success: false, error: "Session expired" }
    }

    const user = sessions[0]

    // Step 3: Verify role === ADMIN
    if (user.role !== "admin") {
      return { success: false, error: "Forbidden: Admin role required" }
    }

    return {
      success: true,
      user: {
        id: user.userId,
        role: user.role,
      },
    }
  } finally {
    await connection.release()
  }
}

module.exports = {
  adminAuth,
}