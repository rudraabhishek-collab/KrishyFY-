const React = require("react")

function OrderDetailPage({ params }) {
  const [order, setOrder] = React.useState(null)
  const [payment, setPayment] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [payLoading, setPayLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [user] = React.useState(() => {
    try {
      const sessionId = document.cookie.match(/krishify_session=([^;]+)/)
      return sessionId ? { sessionId: sessionId[1] } : null
    } catch {
      return null
    }
  })

  // Parse params from dynamic route
  const path = window.location.pathname
  const match = path.match(/^\/orders\/([^/]+)$/)
  const paramsData = match ? { id: match[1] } : { id: params.id }

  React.useEffect(() => {
    async function loadOrder() {
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
  }, [paramsData.id, user])

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

      // Step 2: Open Razorpay Checkout
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

  // Determine payment state
  const isPaid = payment?.status === "PAID"
  const isPaymentEligible = !isPaid && user.role === "buyer"

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
const match = window.location.pathname.match(/^\/orders\/([^/]+)$/)
const params = match ? { id: match[1] } : {}

module.exports = OrderDetailPage