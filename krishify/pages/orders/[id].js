const React = require('react')

const STATUS_STYLES = { PENDING: 'badge-yellow', CONFIRMED: 'badge-blue', PROCESSING: 'badge-blue', COMPLETED: 'badge-green', CANCELLED: 'badge-red' }
const DELIVERY_STATUS_LABELS = { CREATED: 'Initialized', PACKED: 'Packed', DISPATCHED: 'Dispatched', IN_TRANSIT: 'In Transit', OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: '✓ Delivered', CANCELLED: 'Cancelled' }

function OrderDetailPage({ id }) {
  const [order, setOrder] = React.useState(null)
  const [payment, setPayment] = React.useState(null)
  const [delivery, setDelivery] = React.useState(null)
  const [user, setUser] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [payLoading, setPayLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [payMsg, setPayMsg] = React.useState('')
  const [orderId, setOrderId] = React.useState(id || null)

  React.useEffect(() => {
    if (!orderId) {
      const m = window.location.pathname.match(/\/orders\/([^/]+)$/)
      if (m) setOrderId(m[1])
    }
  }, [])

  React.useEffect(() => {
    if (!orderId) return
    Promise.all([
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/orders/${orderId}`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([me, orderData]) => {
      if (me.authenticated) setUser(me.user)
      if (orderData.success) {
        setOrder(orderData.order)
        // Load payment info
        fetch(`/api/payments?orderId=${orderId}`, { credentials: 'include' })
          .then(r => r.json()).then(d => { if (d.success) setPayment(d.payment) })
        // Load delivery
        fetch(`/api/delivery/${orderId}`, { credentials: 'include' })
          .then(r => r.json()).then(d => { if (d.success) setDelivery(d.delivery) }).catch(() => {})
      } else {
        setError(orderData.error || 'Order not found')
      }
      setLoading(false)
    }).catch(() => { setError('Network error'); setLoading(false) })
  }, [orderId])

  function initiatePayment() {
    if (!order || payLoading) return
    setPayLoading(true); setPayMsg('')
    fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ orderId: order.id })
    }).then(r => r.json()).then(data => {
      if (!data.success) { setPayMsg(`❌ ${data.error || 'Failed to create payment'}`); setPayLoading(false); return }
      const { razorpayOrderId, amount, currency, keyId, testMode } = data.payment
      if (testMode) {
        fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ orderId: order.id, razorpayOrderId, testMode: true })
        }).then(r => r.json()).then(v => {
          if (v.success) { setPayMsg('✅ Payment successful (TEST MODE)!'); setPayment({ status: 'PAID', razorpayPaymentId: v.payment.razorpayPaymentId, amount: v.payment.amount }) }
          else setPayMsg(`❌ ${v.error || 'Verification failed'}`)
          setPayLoading(false)
        }).catch(() => { setPayMsg('❌ Network error'); setPayLoading(false) })
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        // eslint-disable-next-line no-undef
        const rzp = new Razorpay({
          key: keyId, amount, currency, order_id: razorpayOrderId,
          name: 'Krishify', description: `Order for ${order.cropName}`,
          theme: { color: '#166534' },
          handler: function(response) {
            fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ orderId: order.id, razorpayOrderId, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature })
            }).then(r => r.json()).then(v => {
              if (v.success) { setPayMsg('✅ Payment successful!'); setPayment({ status: 'PAID', razorpayPaymentId: v.payment.razorpayPaymentId, amount: v.payment.amount }) }
              else setPayMsg(`❌ ${v.error || 'Verification failed'}`)
              setPayLoading(false)
            })
          },
          modal: { ondismiss: () => setPayLoading(false) }
        })
        rzp.open()
      }
      script.onerror = () => { setPayMsg('❌ Could not load Razorpay. Check your connection.'); setPayLoading(false) }
      document.body.appendChild(script)
    }).catch(() => { setPayMsg('❌ Network error'); setPayLoading(false) })
  }

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading order...')
  )

  if (error) return React.createElement('div', { className: 'page-container' },
    React.createElement('div', { className: 'alert-error', style: { marginBottom: '16px' } }, error),
    React.createElement('a', { href: '/orders', style: { color: '#166534' } }, '← Back to Orders')
  )

  if (!order) return null

  const isBuyer = user?.role === 'buyer'
  const isPaid = payment?.status === 'PAID'
  const canPay = isBuyer && !isPaid && order.status !== 'CANCELLED'

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container' },
      React.createElement('a', { href: '/orders', style: { color: '#166534', textDecoration: 'none', fontSize: '14px', fontWeight: '500' } }, '← Back to Orders'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' } },

        // Order info
        React.createElement('div', { className: 'card', style: { gridColumn: 'span 2' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' } },
            React.createElement('div', null,
              React.createElement('h1', { style: { fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0' } }, order.cropName),
              React.createElement('p', { style: { color: '#6b7280', margin: 0, fontSize: '13px' } }, `Order #${order.id.slice(0, 8).toUpperCase()}`)
            ),
            React.createElement('span', { className: `badge ${STATUS_STYLES[order.status] || 'badge-gray'}` }, order.status)
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' } },
            infoBox('👨‍🌾 Farmer', order.farmerName || '—'),
            infoBox('🛒 Buyer', order.buyerName || '—'),
            infoBox('📦 Quantity', `${order.quantity} ${order.unit}`),
            infoBox('💰 Price/Unit', `₹${Number(order.pricePerUnit).toLocaleString('en-IN')}`),
            infoBox('💵 Total Amount', `₹${Number(order.totalAmount).toLocaleString('en-IN')}`),
            infoBox('📅 Placed On', new Date(order.createdAt).toLocaleDateString('en-IN')),
          ),
          isBuyer && order.status === 'COMPLETED' && React.createElement('div', { style: { marginTop: '18px' } },
            React.createElement('a', { href: `/reviews/new?orderId=${order.id}`, className: 'btn-outline', style: { fontSize: '13px' } }, '⭐ Leave a Review')
          )
        ),

        // Payment card
        React.createElement('div', { className: 'card' },
          React.createElement('h2', { style: { fontSize: '17px', fontWeight: '700', margin: '0 0 16px 0' } }, '💳 Payment'),
          React.createElement('div', { style: { padding: '14px', borderRadius: '8px', background: isPaid ? '#dcfce7' : '#fef9c3', marginBottom: '14px' } },
            React.createElement('div', { style: { fontWeight: '700', color: isPaid ? '#166534' : '#854d0e', marginBottom: '4px' } }, isPaid ? '✅ Payment Complete' : '⏳ Payment Pending'),
            isPaid && React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, `ID: ${payment.razorpayPaymentId || 'N/A'}`),
            isPaid && React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, `Amount: ₹${Number(payment.amount / 100).toLocaleString('en-IN')}`)
          ),
          payMsg && React.createElement('div', { className: payMsg.startsWith('✅') ? 'alert-success' : 'alert-error', style: { marginBottom: '12px', fontSize: '13px' } }, payMsg),
          canPay && React.createElement('div', null,
            React.createElement('div', { style: { background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#92400e' } }, '⚠️ TEST MODE — No real money charged'),
            React.createElement('button', {
              onClick: initiatePayment, disabled: payLoading, className: 'btn-primary',
              style: { width: '100%', padding: '12px', fontSize: '15px' }
            }, payLoading ? 'Processing...' : `Pay ₹${Number(order.totalAmount).toLocaleString('en-IN')}`)
          ),
          !isBuyer && React.createElement('p', { style: { fontSize: '13px', color: '#9ca3af' } }, 'Only the buyer can make payment.')
        ),

        // Delivery card
        delivery && React.createElement('div', { className: 'card' },
          React.createElement('h2', { style: { fontSize: '17px', fontWeight: '700', margin: '0 0 16px 0' } }, '🚚 Delivery Tracking'),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { fontWeight: '600', color: '#374151' } }, 'Status'),
            React.createElement('span', { style: { fontWeight: '700', color: '#166534' } }, DELIVERY_STATUS_LABELS[delivery.status] || delivery.status)
          ),
          delivery.trackingNumber && React.createElement('p', { style: { fontSize: '13px', color: '#6b7280', margin: '4px 0' } }, `Tracking: ${delivery.trackingNumber}`),
          delivery.deliveryPartner && React.createElement('p', { style: { fontSize: '13px', color: '#6b7280', margin: '4px 0' } }, `Carrier: ${delivery.deliveryPartner}`),
          delivery.estimatedDeliveryDate && React.createElement('p', { style: { fontSize: '13px', color: '#6b7280', margin: '4px 0' } }, `ETA: ${new Date(delivery.estimatedDeliveryDate).toLocaleDateString('en-IN')}`),
          delivery.deliveredAt && React.createElement('p', { style: { fontSize: '13px', color: '#166534', fontWeight: '600', margin: '4px 0' } }, `Delivered: ${new Date(delivery.deliveredAt).toLocaleDateString('en-IN')}`),
          React.createElement('a', { href: `/orders/${order.id}/delivery`, style: { display: 'inline-block', marginTop: '10px', color: '#166534', fontWeight: '700', fontSize: '13px', textDecoration: 'none' } }, 'View Full Timeline →')
        )
      )
    )
  )
}

function infoBox(label, value) {
  return React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '12px' } },
    React.createElement('div', { style: { fontSize: '11px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' } }, label),
    React.createElement('div', { style: { fontWeight: '600', color: '#111827', fontSize: '14px' } }, value)
  )
}

module.exports = OrderDetailPage
module.exports.getServerSideProps = async function(ctx) {
  return { props: { id: ctx.params.id } }
}
