const React = require("react")

function DeliveryDetailPage({ params }) {
  const [delivery, setDelivery] = React.useState(null)
  const [timeline, setTimeline] = React.useState([])
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
    async function loadDelivery() {
      const orderId = params.id
      if (!orderId) return
      try {
        const res = await fetch(`/api/delivery/${orderId}`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })
        const data = await res.json()
        if (data.success) {
          setDelivery(data.delivery)
          setTimeline(data.timeline)
        }
      } catch (e) {
        setError("Failed to load delivery")
      } finally {
        setLoading(false)
      }
    }
    loadDelivery()
  }, [params.id])

  React.useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { "Content-Type": "application/json" },
        })
        const data = await res.json()
        setUser(data)
      } catch (e) {
        setUser(null)
      }
    }
    loadUser()
  }, [])

  if (loading) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("p", null, "Loading delivery details...")
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
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Delivery Details"),
        React.createElement("p", null, `Error: ${error}`),
      ),
    )
  }

  if (!delivery) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Delivery Details"),
        React.createElement("p", null, "Delivery not found."),
      ),
    )
  }

  // Check authorization
  const isBuyer = user?.role === "buyer" && delivery.orderId && delivery.deliveryOrderBuyerId
  const isFarmer = user?.role === "farmer" && delivery.deliveryOrderFarmerId

  if (!isBuyer && !isFarmer) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Delivery Details"),
        React.createElement("p", null, "Forbidden: unauthorized access to this delivery."),
      ),
    )
  }

  const statusLabels = {
    CREATED: "Delivery initialized",
    PACKED: "Delivery packed",
    DISPATCHED: "Delivery dispatched",
    IN_TRANSIT: "In transit",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  }

  let statusBadge = null
  if (delivery.status) {
    const cls = delivery.status.toLowerCase()
    statusBadge = React.createElement(
      "span",
      { className: `text-${cls} mb-2` },
      statusLabels[delivery.status] || delivery.status
    )
  }

  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Delivery Details"),
      React.createElement("p", null, "Order ID: ", delivery.orderId),
      delivery.cropName !== undefined && React.createElement("p", null, "Crop: ", delivery.cropName),
      statusBadge,
      delivery.trackingNumber !== undefined && React.createElement("p", null, "Tracking Number: ", delivery.trackingNumber),
      delivery.deliveryPartner !== undefined && React.createElement("p", null, "Delivery Partner: ", delivery.deliveryPartner),
      delivery.estimatedDeliveryDate !== undefined && React.createElement("p", null, "Estimated Delivery: ", new Date(delivery.estimatedDeliveryDate).toLocaleDateString()),
      delivery.dispatchedAt !== undefined && React.createElement("p", null, "Dispatched: ", delivery.dispatchedAt ? new Date(deliveredAt).toLocaleString() : "N/A"),
      deliveredAt !== undefined && React.createElement("p", null, "Delivered: ", deliveredAt ? new Date(deliveredAt).toLocaleString() : "N/A"),
      React.createElement("hr", { className: "my-4" }),
      React.createElement("h3", { className: "text-xl font-medium text-secondary" }, "Timeline"),
      timeline.length > 0 ? (
        React.createElement(
          "ul",
          { className: "list-disc pl-3 text-secondary text-sm" },
          timeline.map((event) => React.createElement(
            "li",
            { key: event.id, className: "mb-2" },
            React.createElement("strong", null, event.title),
            " • ",
            event.description,
            " • ",
            new Date(event.createdAt).toLocaleString()
          ))
        )
      ) : React.createElement("p", { className: "text-secondary text-sm" }, "No timeline events."),
    ),
  )
}

// params parsed in useEffect, no top-level window access
module.exports = DeliveryDetailPage