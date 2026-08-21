const React = require("react")

function FarmerCropListingIndexPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Crop Listings"),
      React.createElement("p", null, "Your active crop listings on Krishify"),
      React.createElement(
        "p",
        null,
        "Use the API endpoints to manage your listings."
      ),
      React.createElement(
        "p",
        null,
        "POST /api/crops (create listing)",
        React.createElement("br", null),
        "GET /api/crops/mine (view your listings)"
      )
    ),
  )
}

module.exports = FarmerCropListingIndexPage