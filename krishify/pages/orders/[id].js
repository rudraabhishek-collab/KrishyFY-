const React = require("react")

function OrderDetailPage({ params }) {
  const [order, setOrder] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [user] = React.useState(() => {
    try {
      const sessionId = document.cookie.match(/krishify_session=([^;]+)/)
      return sessionId ? { sessionId: sessionId[1] } : null
    } catch {
      return null
    }
  })

  React.useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`, {
          headers: { "Content-Type": "application/json" },
        })
        const data = await res.json()
        if (data.success) {
          setOrder(data.order)
        } else {
          setError(data.error || "Failed to load order")
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [params.id, user])

  if (loading) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("p", null, "Loading order details...")
      ),
    )
  }

  if (error) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Order Details"),
        React.createElement("p", null, `Error: ${error}`),
      ),
    )
  }

  if (!order) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Order Details"),
        React.createElement("p", null, "Order not found."),
      ),
    )
  }

  // Check authorization
  const isBuyer = user.role === "buyer" && order.buyerId === user.sessionId
  const isFarmer = user.role === "farmer" && order.farmerId === user.sessionId

  if (!isBuyer && !isFarmer) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Order Details"),
        React.createElement("p", null, "Forbidden: unauthorized access to this order."),
      ),
    )
  }

  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Order Details"),
      React.createElement("p", null, `Order ID: ${order.id}`),
      React.createElement("p", null, `Crop: ${order.cropName}`),
      React.createElement("p", null, `Buyer: ${order.buyerName}`),
      React.createElement("p", null, `Farmer: ${order.farmerName}`),
      React.createElement("p", null, `Quantity: ${order.quantity} ${order.unit}`),
      React.createElement("p", null, `Price per unit: ₹${order.pricePerUnit}`),
      React.createElement("p", null, `Total amount: ₹${order.totalAmount}`),
      React.createElement("p", null, `Status: ${order.status}`),
      React.createElement("p", null, `Created: ${new Date(order.createdAt).toLocaleString()}`),
      order.auctionId
        ? React.createElement("p", null, "Auction purchase")
        : React.createElement("p", null, "Direct purchase"),
      React.createElement(
        "a",
        {
          href: "/",
          className: "mt-4 text-primary underline",
        },
        "Back to home"
      ),
    ),
  )
}

// Simple params parser for Next.js dynamic route
const path = window.location.pathname
const match = path.match(/^\/orders\/([^/]+)$/)
const params = match ? { id: match[1] } : {}

module.exports = OrderDetailPage