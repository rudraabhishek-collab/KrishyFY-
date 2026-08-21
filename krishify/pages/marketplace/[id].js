const React = require("react")

function CropDetailPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Crop Detail"),
      React.createElement("p", null, "View details of a specific crop listing."),
      React.createElement(
        "p",
        null,
        "Use the API endpoint to view crop details."
      ),
      React.createElement("p", null, "GET /api/crops/[id]")
    ),
  )
}

module.exports = CropDetailPage