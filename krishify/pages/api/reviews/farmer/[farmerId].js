const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    const farmerId = req.params.farmerId
    return listFarmerReviews(farmerId, res)
  } catch (error) {
    console.error("List farmer reviews error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}