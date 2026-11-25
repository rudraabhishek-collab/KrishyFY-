const React = require('react')

const STATUS_STYLES = { PENDING: 'badge-yellow', CONFIRMED: 'badge-blue', PROCESSING: 'badge-blue', COMPLETED: 'badge-green', CANCELLED: 'badge-red' }
const TRANSITIONS = { PENDING: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['PROCESSING', 'CANCELLED'], PROCESSING: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [] }

function FarmerOrdersPage() {
  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [updating, setUpdating] = React.useState({})
  const [msg, setMsg] = React.useState('')

  React.useEffect(() => {
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrders(data.orders || [])
        else setError(data.error || 'Failed to load')
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  function updateStatus(orderId, status) {
    setUpdating(u => ({ ...u, [orderId]: true })); setMsg('')
    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    }).then(r => r.json()).then(data => {
      if (data.success) {
        setOrders(o => o.map(ord => ord.id === orderId ? { ...ord, status } : ord))
        setMsg(`✅ Order updated to ${status}`)
      } else setMsg(`❌ ${data.error}`)
      setUpdating(u => ({ ...u, [orderId]: false }))
    }).catch(() => { setMsg('❌ Network error'); setUpdating(u => ({ ...u, [orderId]: false })) })
  }

  function startDelivery(orderId) {
    setUpdating(u => ({ ...u, [orderId]: true })); setMsg('')
    fetch('/api/delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ orderId })
    }).then(r => r.json()).then(d => {
      if (d.success) {
        setMsg('✅ Delivery tracking initialized! Go to Delivery page to update status.')
      } else if (d.error && d.error.includes('already exists')) {
        window.location.href = '/farmer/delivery'
      } else {
        setMsg(`❌ ${d.error || 'Failed to start delivery'}`)
      }
      setUpdating(u => ({ ...u, [orderId]: false }))
    }).catch(() => { setMsg('❌ Network error'); setUpdating(u => ({ ...u, [orderId]: false })) })
  }

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading orders...')
  )

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container' },
      React.createElement('div', { style: { marginBottom: '24px' } },
        React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' } }, '📦 Orders for My Crops'),
        React.createElement('p', { style: { color: '#6b7280', margin: 0, fontSize: '14px' } }, `${orders.length} order${orders.length !== 1 ? 's' : ''}`)
      ),
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '20px' } }, error),
      msg && React.createElement('div', { className: msg.startsWith('✅') ? 'alert-success' : 'alert-error', style: { marginBottom: '20px' } }, msg),
      orders.length === 0 && !error && React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'empty-icon' }, '📦'),
        React.createElement('h3', null, 'No orders yet'),
        React.createElement('p', null, 'Orders will appear here when buyers purchase your crops.')
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        orders.map(o => {
          const next = TRANSITIONS[o.status] || []
          return React.createElement('div', { key: o.id, className: 'card' },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' } },
              React.createElement('div', null,
                React.createElement('h3', { style: { margin: '0 0 4px 0', fontWeight: '700', fontSize: '17px' } }, o.cropName),
                React.createElement('p', { style: { margin: 0, color: '#6b7280', fontSize: '13px' } }, `Buyer: ${o.buyerName}`)
              ),
              React.createElement('span', { className: `badge ${STATUS_STYLES[o.status] || 'badge-gray'}` }, o.status)
            ),
            React.createElement('div', { style: { display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '14px', color: '#374151', marginBottom: '12px' } },
              React.createElement('span', null, `📦 ${o.quantity} ${o.unit}`),
              React.createElement('span', null, `💰 ₹${Number(o.totalAmount).toLocaleString('en-IN')}`),
              React.createElement('span', null, `📅 ${new Date(o.createdAt).toLocaleDateString('en-IN')}`)
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
              React.createElement('a', { href: `/orders/${o.id}`, style: { padding: '5px 12px', borderRadius: '6px', border: '1px solid #d1d5db', textDecoration: 'none', fontSize: '12px', fontWeight: '600', color: '#374151' } }, 'View Details →'),
              (o.status === 'CONFIRMED' || o.status === 'PROCESSING') && React.createElement('button', {
                onClick: () => startDelivery(o.id),
                disabled: updating[o.id],
                style: { padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: '#dbeafe', color: '#1e40af' }
              }, '🚚 Start / Track Delivery'),
              next.map(s => React.createElement('button', {
                key: s, onClick: () => updateStatus(o.id, s),
                disabled: updating[o.id],
                style: {
                  padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                  background: s === 'CANCELLED' ? '#fee2e2' : '#dcfce7',
                  color: s === 'CANCELLED' ? '#991b1b' : '#166534'
                }
              }, updating[o.id] ? '...' : `→ ${s}`))
            )
          )
        })
      )
    )
  )
}

module.exports = FarmerOrdersPage
