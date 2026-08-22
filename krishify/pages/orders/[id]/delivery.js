const React = require('react')

function DeliveryDetailPage({ id }) {
  const [delivery, setDelivery] = React.useState(null)
  const [timeline, setTimeline] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Content-Type': 'application/json' },
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
    async function loadDelivery() {
      const orderId = id
      if (!orderId) return
      try {
        const res = await fetch(`/api/delivery/${orderId}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        const data = await res.json()
        if (data.success) {
          setDelivery(data.delivery)
          setTimeline(data.timeline || [])
        } else {
          setError(data.error || 'Failed to load delivery')
        }
      } catch (e) {
        setError('Failed to load delivery')
      } finally {
        setLoading(false)
      }
    }
    loadDelivery()
  }, [id])

  if (loading) {
    return React.createElement(
      'div',
      { className: 'min-h-screen bg-white' },
      React.createElement(
        'div',
        { className: 'max-w-2xl mx-auto py-12 px-4 text-center' },
        React.createElement('p', null, 'Loading delivery details...')
      )
    )
  }

  if (error) {
    return React.createElement(
      'div',
      { className: 'min-h-screen bg-white' },
      React.createElement(
        'div',
        { className: 'max-w-2xl mx-auto py-12 px-4 text-center' },
        React.createElement('h2', { className: 'text-3xl font-bold text-primary' }, 'Delivery Details'),
        React.createElement('p', null, `Error: ${error}`)
      )
    )
  }

  if (!delivery) {
    return React.createElement(
      'div',
      { className: 'min-h-screen bg-white' },
      React.createElement(
        'div',
        { className: 'max-w-2xl mx-auto py-12 px-4 text-center' },
        React.createElement('h2', { className: 'text-3xl font-bold text-primary' }, 'Delivery Details'),
        React.createElement('p', null, 'Delivery not found.')
      )
    )
  }

  const statusLabels = {
    CREATED: 'Delivery initialized',
    PACKED: 'Delivery packed',
    DISPATCHED: 'Delivery dispatched',
    IN_TRANSIT: 'In transit',
    OUT_FOR_DELIVERY: 'Out for delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-white' },
    React.createElement(
      'div',
      { className: 'max-w-2xl mx-auto py-12 px-4 text-center' },
      React.createElement('h2', { className: 'text-3xl font-bold text-primary' }, 'Delivery Details'),
      React.createElement('p', null, 'Order ID: ', delivery.orderId),
      delivery.cropName != null && React.createElement('p', null, 'Crop: ', delivery.cropName),
      React.createElement(
        'span',
        { className: 'inline-block px-2 py-1 text-sm bg-green-100 text-green-800 rounded mb-2' },
        statusLabels[delivery.status] || delivery.status
      ),
      delivery.trackingNumber != null && React.createElement('p', null, 'Tracking Number: ', delivery.trackingNumber),
      delivery.deliveryPartner != null && React.createElement('p', null, 'Delivery Partner: ', delivery.deliveryPartner),
      delivery.estimatedDeliveryDate != null &&
        React.createElement('p', null, 'Estimated Delivery: ', new Date(delivery.estimatedDeliveryDate).toLocaleDateString()),
      React.createElement('hr', { className: 'my-4' }),
      React.createElement('h3', { className: 'text-xl font-medium text-primary mb-2' }, 'Timeline'),
      timeline.length > 0
        ? React.createElement(
            'ul',
            { className: 'list-disc pl-3 text-sm text-left' },
            timeline.map((event) =>
              React.createElement(
                'li',
                { key: event.id, className: 'mb-2' },
                React.createElement('strong', null, event.title),
                ' • ',
                event.description,
                ' • ',
                new Date(event.createdAt).toLocaleString()
              )
            )
          )
        : React.createElement('p', { className: 'text-sm text-muted-foreground' }, 'No timeline events.'),
      React.createElement(
        'a',
        { href: `/orders/${id}`, className: 'mt-4 inline-block text-primary underline' },
        'Back to Order'
      )
    )
  )
}

module.exports = DeliveryDetailPage

module.exports.getServerSideProps = async function (context) {
  return { props: { id: context.params.id } }
}
