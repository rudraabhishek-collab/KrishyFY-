const React = require("react")

function FarmerBidsPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Auctions"),
      React.createElement("p", null, "Your active auctions and bids"),
      React.createElement(
        "p",
        null,
        "Use the API endpoints to manage auction bids."
      ),
      React.createElement(
        "p",
        null,
        "GET /api/auctions (your auctions)",
        React.createElement("br", null),
        "GET /api/auctions/[id] (auction detail)",
        React.createElement("br", null),
        "POST /api/bids (place bid)",
        React.createElement("br", null),
        "POST /api/bids/accept (accept winning bid)"
      )
    ),
  )
}

module.exports = FarmerBidsPage