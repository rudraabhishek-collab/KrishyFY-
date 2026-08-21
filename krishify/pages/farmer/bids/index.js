const React = require("react")

function FarmerBidsPage() {
  const [auctions, setAuctions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    async function loadAuctions() {
      try {
        const res = await fetch("/api/auctions")
        const data = await res.json()
        if (data.success) {
          setAuctions(data.auctions || [])
        }
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    loadAuctions()
  }, [])

  if (loading) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-3xl mx-auto py-12 px-4 text-center" },
        React.createElement("p", null, "Loading auctions...")
      ),
    )
  }

  if (error) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-3xl mx-auto py-12 px-4 text-center" },
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Auctions"),
        React.createElement("p", null, `Error: ${error.message}`),
        React.createElement("p", null, "Try again later.")
      ),
    )
  }

  if (auctions.length === 0) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-3xl mx-auto py-12 px-4 text-center" },
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Auctions"),
        React.createElement("p", null, "No active auctions found."),
        React.createElement(
          "p",
          null,
          "Create a new auction from your crop listings."
        )
      ),
    )
  }

  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-3xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Auctions"),
      React.createElement(
        "p",
        null,
        "Manage your active auctions and winning bids"
      ),
      React.createElement(
        "ul",
        { className: "space-y-4" },
        auctions.map((auction) => React.createElement(
          "li",
          { key: auction.id, className: "p-4 border rounded-lg" },
          React.createElement("h3", { className: "text-xl font-medium" }, auction.cropListingId ? `Crop: ${auction.cropListingId}` : `Auction ${auction.id}`),
          React.createElement("p", null, `Status: ${auction.status}`),
          React.createElement("p", null, `Starting Price: ₹${auction.startingPrice}`),
          React.createElement("p", null, `Minimum Increment: ₹${auction.minimumIncrement}`),
          React.createElement("p", null, `Ends: ${new Date(auction.endsAt).toLocaleString()}`),
          auction.status === "ACTIVE"
            ? React.createElement("p", null, `Current highest bid: ₹${auction.currentBid || auction.startingPrice}`)
            : auction.status === "COMPLETED"
              ? React.createElement("p", null, auction.winningBid ? `Winning bid: ₹${auction.winningBid}` : "No bids")
              : React.createElement("p", null, "Auction completed")
        ))
        ),
      React.createElement(
        "p",
        null,
        "Use the API endpoints to manage your auctions and bids."
      )
    ),
  )
}

module.exports = FarmerBidsPage