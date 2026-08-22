const React = require("react")

function OrderDetailPage({ params }) {
  const [order, setOrder] = React.useState(null)
  const [payment, setPayment] = React.useState(null)
  const [delivery, setDelivery] = React.useState(null)
  const [timeline, setTimeline] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [payLoading, setPayLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [user, setUser] = React.useState(null)
  const [paramsData, setParamsData] = React.useState({ id: params.id })

  React.useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/^\/orders\/([^/]+)$/)
    setParamsData(match ? { id: match[1] } : { id: params.id })
  }, [])

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

  React.useEffect(() => {
    async function loadOrder() {
      if (!paramsData.id) return
      try {
        const res = await fetch(`/api/orders/${paramsData.id}`, {
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
  }, [paramsData.id])

  React.useEffect(() => {
    async function loadPayment() {
      if (!order) return
      try {
        const res = await fetch(`/api/payments/${order.id}`, {
          headers: { "Content-Type": "application/json" },
        })
        const data = await res.json()
        if (data.success) {
          setPayment(data.payment)
        }
      } catch (e) {
        // Payment may not exist yet, that's OK
      }
    }
    if (order) {
      loadPayment()
    }
  }, [order])

  // Handle payment creation and Razorpay checkout
  async function initiatePayment() {
    if (!order || payLoading) return
    setPayLoading(true)
    setError(null)

    try {
      // Step 1: Create Razorpay test order
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.error || "Failed to create payment order")
        setPayLoading(false)
        return
      }

      const { razorpayOrderId, amount, currency, keyId } = data.payment

      // Step 2: Open Razorpay Checkout (only in browser)
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => {
        const rzp1 = new Razorpay({
          key: keyId,
          amount: amount,
          currency: currency,
          order_id: razorpayOrderId,
          handler: function (response) {
            // Step 3: Verify payment with backend
            fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
              .then((resp) => resp.json())
              .then((verifyData) => {
                if (verifyData.success) {
                  // Payment successful - update UI state
                  setPayment({
                    id: verifyData.payment.id,
                    status: "PAID",
                    razorpayPaymentId: verifyData.payment.razorpayPaymentId,
                    amount: verifyData.payment.amount,
                    currency: verifyData.payment.currency,
                  })
                  // Refresh order data
                  loadOrder()
                } else {
                  setError(verifyData.error || "Payment verification failed")
                }
              })
              .catch((err) => {
                setError("Payment verification request failed")
              })
          },
          notes: {},
          theme: { color: "primary" },
        })

        rzp1.open()
      }
      script.onerror = () => {
        setError("Failed to load Razorpay checkout")
        setPayLoading(false)
      }
      document.body.appendChild(script)
    } catch (err) {
      setError("Payment initiation failed")
      setPayLoading(false)
    }
  }

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
  const isBuyer = user?.role === "buyer" && order?.buyerId === user?.userId
  const isFarmer = user?.role === "farmer" && order?.farmerId === user?.userId

  if (!isBuyer && !isFarmer) {
    return React.createElement(
      "div",
      { className: "min-h-screen bg-white" },
      React.createElement(
        "div",
        { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
        React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Order Details"),
        React.createElement("p", null, "Forbidden: unauthorized access to this order.")
      ),
    )
  }

  // Determine payment state
  const isPaid = payment?.status === "PAID"
  const isPaymentEligible = !isPaid && user?.role === "buyer"

  // Delivery section
  let deliveryUI = null
  if (delivery) {
    const statusLabels = {
      CREATED: "Delivery initialized",
      PACKED: "Delivery packed",
      DISPATCHED: "Delivery dispatched",
      IN_TRANSIT: "In transit",
      OUT_FOR_DELIVERY: "Out for delivery",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    }

    let statusText = statusLabels[delivery.status] || delivery.status

    deliveryUI = React.createElement(
      "div",
      { className: "bg-secondary/10 rounded p-4 mb-6 mt-6" },
      React.createElement(
        "h3",
        { className: "text-xl font-medium text-secondary mb-3" },
        "Delivery Tracking"
      ),
      React.createElement(
        "p",
        { className: "text-sm text-secondary mb-2" },
        "TEST/DEMO DELIVERY TRACKING"
      ),
      React.createElement(
        "div",
        { className: "mb-3" },
        React.createElement(
          "p",
          { className: "font-medium" },
          "Status:"
        ),
        React.createElement(
          "span",
          { className: `text-${delivery.status.toLowerCase()} mb-1` },
          statusText
        )
      )
    )

    if (delivery.status !== "DELIVERED" && delivery.status !== "CANCELLED") {
      let trackingRow = null
      if (delivery.trackingNumber !== undefined && delivery.trackingNumber !== null) {
        trackingRow = React.createElement(
          "div",
          { className: "mb-2" },
          React.createElement("strong", null, "Tracking Number:"),
          ` ${delivery.trackingNumber}`
        )
      }
      let partnerRow = null
      if (delivery.deliveryPartner !== undefined && delivery.deliveryPartner !== null) {
        partnerRow = React.createElement(
          "div",
          { className: "mb-2" },
          React.createElement("strong", null, "Delivery Partner:"),
          ` ${delivery.deliveryPartner}`
        )
      }
      let estRow = null
      if (delivery.estimatedDeliveryDate !== undefined && delivery.estimatedDeliveryDate !== null) {
        const estDate = new Date(delivery.estimatedDeliveryDate).toLocaleDateString()
        estRow = React.createElement(
          "div",
          { className: "mb-2" },
          React.createElement("strong", null, "Estimated Delivery:"),
          ` ${estDate}`
        )
      }
      deliveryUI = React.createElement(
        "div",
        null,
        trackingRow,
        partnerRow,
        estRow
      )
    }

    if (delivery.status !== "DELIVERED" && delivery.status !== "CANCELLED") {
      let timelineItems = []
      for (const event of timeline) {
        const eventDate = new Date(event.createdAt).toLocaleString()
        timelineItems.push(React.createElement(
          "li",
          { key: event.id, className: "mb-1" },
          React.createElement("span", { className: "text-secondary" }, event.title, ` • ${eventDate}`)
        ))
      }
      deliveryUI = React.createElement(
        "div",
        null,
        deliveryUI,
        React.createElement(
          "div",
          { className: "mt-3 p-3 bg-secondary/5 rounded" },
          React.createElement("p", { className: "text-xs text-secondary mb-1" }, "Timeline:"),
          React.createElement(
            "ul",
            { className: "list-disc pl-3 text-secondary text-sm mt-1" },
            timelineItems
          )
        )
      )
    }
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

      // Payment section
      React.createElement(
        "div",
        { className: "mt-6 p-4 border rounded-lg" },
        isPaid
          ? React.createElement(
              "p",
              null,
              "Payment: Successful ✓",
              React.createElement("br", null),
              `Razorpay Payment ID: ${payment?.razorpayPaymentId || "N/A"}`
            )
          : isPaymentEligible
            ? React.createElement(
                "button",
                {
                  id: "payNowBtn",
                  className: "mt-2 px-4 py-2 bg-primary text-white rounded",
                  onClick: initiatePayment,
                  disabled: payLoading,
                },
                payLoading
                  ? "Processing payment..."
                  : "Pay Now"
              )
            : React.createElement(
                "p",
                null,
                "Payment unavailable. Only the buyer can pay for this order."
              ),
      ),

      deliveryUI,

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

// params parsed in useEffect, no top-level window access
module.exports = OrderDetailPage