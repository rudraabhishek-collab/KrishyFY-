const React = require("react")

function FarmerDeliveryPage() {
  const [deliveries, setDeliveries] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [user] = React.useState(() => {
    try {
      const cookieVal = document.cookie.replace(/(?:(?:^|.*)\s*krishify_session\s*=\s*([^;]*).*$)|^.*$/, "$1")
      return cookieVal ? { sessionId: cookieVal } : null
    } catch {
      return null
    }
  })

  React.useEffect(() => {
    async function loadDeliveries() {
      try {
        const res = await fetch("/api/delivery", {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })
        const data = await res.json()
        if (data.success) {
          setDeliveries(data.deliveries)
        } else {
          setError(data.error || "Failed to load deliveries")
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    if (user?.sessionId) {
      loadDeliveries()
    } else {
      setError("Unauthenticated")
      setLoading(false)
    }
  }, [])

  const statusLabels = {
    CREATED: "Created",
    PACKED: "Packed",
    DISPATCHED: "Dispatched",
    IN_TRANSIT: "In transit",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  }

  if (loading) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("p", null, "Loading deliveries...")
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
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Deliveries"),
        React.createElement("p", null, `Error: ${error}`),
      ),
    )
  }

  if (!deliveries || deliveries.length === 0) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Deliveries"),
        React.createElement("p", null, "No deliveries found."),
      ),
    )
  }

  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Deliveries"),
      React.createElement("p", null, `You have ${deliveries.length} delivery(s)`),
      deliveries.map((d) => {
        const s = statusLabels[d.status] || d.status
        const oid = d.orderId ? d.orderId.slice(0, 8) : "N/A"
        return React.createElement(
          "div",
          { key: d.id, className: "p-4 border rounded-lg mb-3" },
          React.createElement("h4", null, "Delivery #", d.id ? d.id.slice(0, 8) : "N/A"),
          React.createElement("p", null, "Status: ", s),
          delivery.trackingNumber !== undefined && React.createElement("p", null, "Tracking: ", delivery.trackingNumber),
          delivery.deliveryPartner !== undefined && React.createElement("p", null, "Partner: ", delivery.deliveryPartner),
          delivery.estimatedDeliveryDate !== undefined && React.createElement("p", null, "Estimate: ", new Date(delivery.estimatedDeliveryDate).toLocaleDateString())
        )
      })
    )
  )
}

module.exports = FarmerDeliveryPage