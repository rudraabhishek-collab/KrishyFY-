const mysql = require("mysql2/promise")

module.exports = async function handler(req, res) {
  try {
    const cropListingId = req.params.cropListingId
    return listCropReviews(cropListingId, res)
  } catch (error) {
    console.error("List crop reviews error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}