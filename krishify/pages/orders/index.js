const React = require("react")

function BuyerOrdersPage() {
  const [orders, setOrders] = React.useState(null)
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
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders", {
          headers: { "Content-Type": "application/json" },
        })
        const data = await res.json()
        if (data.success) {
          setOrders(data.orders)
        } else {
          setError(data.error || "Failed to load orders")
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    if (user?.sessionId) {
      loadOrders()
    } else {
      setError("Unauthenticated")
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("p", null, "Loading orders...")
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
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Orders"),
        React.createElement("p", null, `Error: ${error}`),
      ),
    )
  }

  if (!orders || orders.length === 0) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Orders"),
        React.createElement("p", null, "No orders found."),
      ),
    )
  }

  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Orders"),
      React.createElement(
        "p",
        null,
        `You have ${orders.length} order(s)`
      ),
      React.createElement(
        "ul",
        { className: "space-y-4 mt-8" },
        orders.map((order) =>
          React.createElement(
            "li",
            { key: order.id, className: "p-4 border rounded-lg" },
            React.createElement("h3", { className: "text-xl font-medium" }, `Order #${order.id.slice(0, 8)}`),
            React.createElement("p", null, `Crop: ${order.cropName}`),
            React.createElement("p", null, `Farmer: ${order.farmerName}`),
            React.createElement("p", null, `Quantity: ${order.quantity} ${order.unit}`),
            React.createElement("p", null, `Price per unit: ₹${order.pricePerUnit}`),
            React.createElement("p", null, `Total: ₹${order.totalAmount}`),
            React.createElement("p", null, `Status: ${order.status}`),
            React.createElement("p", null, `Date: ${new Date(order.createdAt).toLocaleString()}`),
            React.createElement(
              "a",
              {
                href: `/orders/${order.id}`,
                className: "mt-2 text-primary underline",
              },
              "View details"
            )
          )
        ),
      ),
    ),
  )
}

module.exports = BuyerOrdersPage