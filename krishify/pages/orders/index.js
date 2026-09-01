const React = require('react')

const S = { PENDING: ['#fef9c3','#92400e'], CONFIRMED: ['#dbeafe','#1d4ed8'], PROCESSING: ['#ede9fe','#6d28d9'], COMPLETED: ['#dcfce7','#166534'], CANCELLED: ['#fee2e2','#991b1b'] }

function OrdersPage() {
  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [filter, setFilter] = React.useState('ALL')

  React.useEffect(() => {
    fetch('/api/orders', { credentials: 'include' }).then(r => r.json()).then(d => {
      if (d.success) setOrders(d.orders || [])
      else if (d.error?.includes('Unauthenticated')) window.location.href = '/login'
      else setError(d.error || 'Failed')
      setLoading(false)
    }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  return React.createElement('div', { style: { background: '#f8fafc', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '40px 24px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' } },
        React.createElement('div', null,
          React.createElement('h1', { style: { fontSize: '26px', fontWeight: '900', margin: '0 0 4px 0' } }, '📦 My Orders'),
          React.createElement('p', { style: { color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '14px' } }, orders.length + ' total orders')
        )
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' } },
      React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' } },
        ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map(st =>
          React.createElement('button', { key: st, onClick: () => setFilter(st), style: { padding: '6px 16px', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '700', borderColor: filter === st ? '#0f172a' : '#e2e8f0', background: filter === st ? '#0f172a' : '#fff', color: filter === st ? '#fff' : '#64748b' } },
            st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()
          )
        )
      ),
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px' } }, error),
      loading && React.createElement('div', { style: { textAlign: 'center', padding: '80px' } }, React.createElement('div', { className: 'spinner', style: { margin: '0 auto' } })),
      !loading && filtered.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
        React.createElement('div', { style: { fontSize: '56px', marginBottom: '16px' } }, '📦'),
        React.createElement('h3', { style: { fontSize: '18px', fontWeight: '800', color: '#374151', marginBottom: '8px' } }, filter === 'ALL' ? 'No orders yet' : 'No ' + filter.toLowerCase() + ' orders'),
        filter === 'ALL' && React.createElement('a', { href: '/marketplace', style: { display: 'inline-block', marginTop: '16px', background: '#166534', color: '#fff', padding: '11px 22px', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' } }, '🌾 Browse Mandi')
      ),
      !loading && filtered.length > 0 && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        filtered.map(o => {
          const [bg, col] = S[o.status] || ['#f1f5f9', '#64748b']
          return React.createElement('div', { key: o.id, style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' } },
              React.createElement('div', null,
                React.createElement('h3', { style: { margin: '0 0 4px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' } }, o.cropName),
                React.createElement('p', { style: { margin: 0, fontSize: '13px', color: '#64748b' } }, o.farmerName ? '👨‍🌾 ' + o.farmerName : o.buyerName ? '🛒 ' + o.buyerName : '')
              ),
              React.createElement('span', { style: { background: bg, color: col, padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' } }, o.status)
            ),
            React.createElement('div', { style: { display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: '#374151', marginBottom: '14px', background: '#f8fafc', borderRadius: '10px', padding: '12px' } },
              React.createElement('span', { style: { fontWeight: '700' } }, '₹' + Number(o.totalAmount).toLocaleString('en-IN') + ' total'),
              React.createElement('span', null, '📅 ' + new Date(o.createdAt).toLocaleDateString('en-IN'))
            ),
            React.createElement('a', { href: '/orders/' + o.id, style: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: '700', fontSize: '13px', textDecoration: 'none', padding: '7px 14px', border: '1.5px solid #166534', borderRadius: '8px' } }, 'View Details →')
          )
        })
      )
    )
  )
}

module.exports = OrdersPage
