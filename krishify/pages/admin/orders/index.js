const React = require('react')

const STATUS_COLORS = {
  PENDING: ['#fef9c3', '#854d0e'],
  CONFIRMED: ['#dbeafe', '#1e40af'],
  PROCESSING: ['#ede9fe', '#6d28d9'],
  COMPLETED: ['#dcfce7', '#166534'],
  CANCELLED: ['#fee2e2', '#991b1b'],
}

function badge(status) {
  const [bg, col] = STATUS_COLORS[status] || ['#f3f4f6', '#6b7280']
  return React.createElement('span', {
    style: { background: bg, color: col, padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }
  }, status)
}

function AdminOrdersPage() {
  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState(null)

  function load(p, st) {
    setLoading(true)
    const q = new URLSearchParams({ page: p, limit: 20, ...(st && { status: st }) })
    fetch('/api/admin/orders?' + q, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setOrders(d.orders || []); setPagination(d.pagination) }
        else { setError(d.error || 'Failed'); if (d.error && (d.error.includes('Admin') || d.error.includes('auth'))) window.location.href = '/login' }
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { load(1, '') }, [])

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    // Header
    React.createElement('div', { style: { background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)', color: '#fff', padding: '28px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' } },
          React.createElement('a', { href: '/admin', style: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' } }, '← Dashboard'),
        ),
        React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', margin: 0 } }, '📦 Order Management'),
        React.createElement('p', { style: { opacity: 0.8, margin: 0, fontSize: '14px' } }, 'View and monitor all orders')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' } },
      // Status filter
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' } },
        ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map(s =>
          React.createElement('button', {
            key: s || 'all',
            onClick: () => { setStatusFilter(s); setPage(1); load(1, s) },
            style: {
              padding: '6px 14px', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
              borderColor: statusFilter === s ? '#1e40af' : '#d1d5db',
              background: statusFilter === s ? '#1e40af' : '#fff',
              color: statusFilter === s ? '#fff' : '#374151'
            }
          }, s === '' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase())
        )
      ),
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px' } }, error),
      pagination && React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '12px' } }, pagination.total + ' orders'),
      loading ? React.createElement('div', { style: { textAlign: 'center', padding: '60px' } },
        React.createElement('div', { style: { display: 'inline-block', width: '28px', height: '28px', border: '3px solid #dbeafe', borderTopColor: '#1e40af', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: '12px' } }),
        React.createElement('p', { style: { color: '#6b7280' } }, 'Loading...')
      ) :
      React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflowX: 'auto' } },
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' } },
          React.createElement('thead', null,
            React.createElement('tr', { style: { background: '#f9fafb' } },
              ['Crop', 'Buyer', 'Farmer', 'Quantity', 'Total', 'Status', 'Date'].map(h =>
                React.createElement('th', { key: h, style: { padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' } }, h)
              )
            )
          ),
          React.createElement('tbody', null,
            orders.length === 0
              ? React.createElement('tr', null, React.createElement('td', { colSpan: 7, style: { textAlign: 'center', padding: '40px', color: '#9ca3af' } }, 'No orders found'))
              : orders.map(o => React.createElement('tr', { key: o.id, style: { borderTop: '1px solid #f3f4f6' } },
                  React.createElement('td', { style: { padding: '12px 16px', fontWeight: '600', fontSize: '14px' } }, o.cropName),
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px', color: '#374151' } }, o.buyerName),
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px', color: '#374151' } }, o.farmerName),
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px' } }, o.quantity + ' ' + o.unit),
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: '#166534' } }, '₹' + Number(o.totalAmount).toLocaleString('en-IN')),
                  React.createElement('td', { style: { padding: '12px 16px' } }, badge(o.status)),
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: '#9ca3af' } }, new Date(o.createdAt).toLocaleDateString('en-IN'))
                ))
          )
        )
      ),
      pagination && pagination.totalPages > 1 && React.createElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' } },
        page > 1 && React.createElement('button', { onClick: () => { const p = page - 1; setPage(p); load(p, statusFilter) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, '← Prev'),
        React.createElement('span', { style: { padding: '7px 14px', fontSize: '14px', color: '#6b7280' } }, 'Page ' + page + ' of ' + pagination.totalPages),
        page < pagination.totalPages && React.createElement('button', { onClick: () => { const p = page + 1; setPage(p); load(p, statusFilter) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, 'Next →')
      )
    )
  )
}

module.exports = AdminOrdersPage
