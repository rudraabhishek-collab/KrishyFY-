const React = require('react')

const STATUS_STYLES = { PENDING: 'badge-yellow', CONFIRMED: 'badge-blue', PROCESSING: 'badge-blue', COMPLETED: 'badge-green', CANCELLED: 'badge-red' }

function OrdersPage() {
  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [filter, setFilter] = React.useState('ALL')

  React.useEffect(() => {
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrders(data.orders || [])
        else setError(data.error || 'Failed to load')
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading orders...')
  )

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', color: '#fff', padding: '28px 20px', textAlign: 'center' } },
      React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0' } }, '📦 My Orders'),
      React.createElement('p', { style: { opacity: 0.85, margin: 0, fontSize: '14px' } }, `${orders.length} total order${orders.length !== 1 ? 's' : ''}`)
    ),
    React.createElement('div', { className: 'page-container' },
      // Filter tabs
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' } },
        ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map(s =>
          React.createElement('button', {
            key: s, onClick: () => setFilter(s),
            style: { padding: '6px 14px', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.15s', borderColor: filter === s ? '#166534' : '#d1d5db', background: filter === s ? '#166534' : '#fff', color: filter === s ? '#fff' : '#374151' }
          }, s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase())
        )
      ),
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '16px' } }, error),
      filtered.length === 0 && React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'empty-icon' }, '📦'),
        React.createElement('h3', null, filter === 'ALL' ? 'No orders yet' : `No ${filter.toLowerCase()} orders`),
        React.createElement('p', null, filter === 'ALL' ? 'Browse the marketplace to place your first order.' : 'Try a different filter.'),
        filter === 'ALL' && React.createElement('a', { href: '/marketplace', className: 'btn-primary', style: { marginTop: '16px', display: 'inline-block' } }, '🌾 Browse Marketplace')
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        filtered.map(o => React.createElement('div', { key: o.id, className: 'card' },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' } },
            React.createElement('div', null,
              React.createElement('h3', { style: { margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700' } }, o.cropName),
              React.createElement('p', { style: { margin: 0, fontSize: '13px', color: '#6b7280' } },
                o.farmerName ? `Farmer: ${o.farmerName}` : o.buyerName ? `Buyer: ${o.buyerName}` : ''
              )
            ),
            React.createElement('span', { className: `badge ${STATUS_STYLES[o.status] || 'badge-gray'}` }, o.status)
          ),
          React.createElement('div', { style: { display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: '#374151', margin: '12px 0' } },
            React.createElement('span', null, `📦 ${o.quantity} ${o.unit}`),
            React.createElement('span', null, `💰 ₹${Number(o.totalAmount).toLocaleString('en-IN')}`),
            React.createElement('span', null, `🗓 ${new Date(o.createdAt).toLocaleDateString('en-IN')}`)
          ),
          React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            React.createElement('a', { href: `/orders/${o.id}`, style: { padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #166534', color: '#166534', textDecoration: 'none', fontSize: '13px', fontWeight: '600' } }, 'View Details →'),
            o.status === 'COMPLETED' && React.createElement('a', { href: `/reviews/new?orderId=${o.id}`, style: { padding: '6px 14px', borderRadius: '8px', background: '#f59e0b', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '600', border: 'none' } }, '⭐ Review')
          )
        ))
      )
    )
  )
}

module.exports = OrdersPage
