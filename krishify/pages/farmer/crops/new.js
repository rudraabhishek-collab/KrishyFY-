const React = require("react")

function FarmerCropListingNewPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Create Crop Listing"),
      React.createElement("p", null, "Use the API endpoints to create listings."),
      React.createElement(
        "p",
        null,
        "POST /api/crops (authenticated farmer)"
      ),
      React.createElement(
        "p",
        null,
        "GET /api/crops/mine (view your listings)"
      )
    ),
  )
}

module.exports = FarmerCropListingNewPage