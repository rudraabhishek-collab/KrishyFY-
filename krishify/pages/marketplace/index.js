const React = require("react")

function MarketplaceIndexPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Krishify Marketplace"),
      React.createElement("p", null, "Browse available produce from farmers"),
      React.createElement(
        "p",
        null,
        "Use the API endpoint to browse crops."
      ),
      React.createElement(
        "p",
        null,
        "GET /api/crops (marketplace listings)",
        React.createElement("br", null),
        "?search=tomato",
        React.createElement("br", null),
        "?category=vegetables",
        React.createElement("br", null),
        "?location=pune"
      )
    ),
  )
}

module.exports = MarketplaceIndexPage