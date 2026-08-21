const React = require("react")

function BuyerAuctionsPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-3xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Auctions"),
      React.createElement("p", null, "Browse live auctions and place bids"),
      React.createElement(
        "p",
        null,
        "Use the API endpoints to browse auctions and place bids."
      ),
      React.createElement(
        "p",
        null,
        "GET /api/auctions (marketplace auctions)",
        React.createElement("br", null),
        "GET /api/bids?auctionId= (bid history)",
        React.createElement("br", null),
        "POST /api/bids (place bid)"
      )
    ),
  )
}

module.exports = BuyerAuctionsPage