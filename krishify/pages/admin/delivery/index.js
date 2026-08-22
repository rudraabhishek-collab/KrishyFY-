const React = require('react')

const DELIVERY_COLORS = {
  CREATED: ['#f3f4f6', '#6b7280'],
  PACKED: ['#fef9c3', '#854d0e'],
  DISPATCHED: ['#dbeafe', '#1e40af'],
  IN_TRANSIT: ['#ede9fe', '#6d28d9'],
  OUT_FOR_DELIVERY: ['#fef3c7', '#b45309'],
  DELIVERED: ['#dcfce7', '#166534'],
  CANCELLED: ['#fee2e2', '#991b1b'],
}

function deliveryBadge(status) {
  const [bg, col] = DELIVERY_COLORS[status] || ['#f3f4f6', '#6b7280']
  return React.createElement('span', {
    style: { background: bg, color: col, padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }
  }, status.replace('_', ' '))
}

function AdminDeliveryPage() {
  const [deliveries, setDeliveries] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState(null)

  function load(p, st) {
    setLoading(true)
    const q = new URLSearchParams({ page: p, limit: 20, ...(st && { status: st }) })
    fetch('/api/admin/deliveries?' + q, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setDeliveries(d.deliveries || []); setPagination(d.pagination) }
        else { setError(d.error || 'Failed'); if (d.error && (d.error.includes('Admin') || d.error.includes('auth'))) window.location.href = '/login' }
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { load(1, '') }, [])

  const statuses = ['', 'CREATED', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)', color: '#fff', padding: '28px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('a', { href: '/admin', style: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', display: 'block', marginBottom: '4px' } }, '← Dashboard'),
        React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', margin: 0 } }, '🚚 Delivery Management'),
        React.createElement('p', { style: { opacity: 0.8, margin: 0, fontSize: '14px' } }, 'Track all deliveries')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' } },
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' } },
        statuses.map(s =>
          React.createElement('button', {
            key: s || 'all',
            onClick: () => { setStatusFilter(s); setPage(1); load(1, s) },
            style: {
              padding: '5px 12px', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
              borderColor: statusFilter === s ? '#1e40af' : '#d1d5db',
              background: statusFilter === s ? '#1e40af' : '#fff',
              color: statusFilter === s ? '#fff' : '#374151'
            }
          }, s === '' ? 'All' : s.replace('_', ' '))
        )
      ),
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px' } }, error),
      pagination && React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '12px' } }, pagination.total + ' deliveries'),
      loading ? React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#9ca3af' } }, 'Loading...') :
      React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflowX: 'auto' } },
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', minWidth: '750px' } },
          React.createElement('thead', null,
            React.createElement('tr', { style: { background: '#f9fafb' } },
              ['Order ID', 'Status', 'Tracking #', 'Carrier', 'ETA', 'Delivered', 'Created'].map(h =>
                React.createElement('th', { key: h, style: { padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' } }, h)
              )
            )
          ),
          React.createElement('tbody', null,
            deliveries.length === 0
              ? React.createElement('tr', null, React.createElement('td', { colSpan: 7, style: { textAlign: 'center', padding: '40px', color: '#9ca3af' } }, 'No deliveries found'))
              : deliveries.map(d => React.createElement('tr', { key: d.id, style: { borderTop: '1px solid #f3f4f6' } },
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#374151' } }, d.orderId ? d.orderId.slice(0, 8) + '…' : '—'),
                  React.createElement('td', { style: { padding: '12px 16px' } }, deliveryBadge(d.status)),
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: '#6b7280' } }, d.trackingNumber || '—'),
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: '#6b7280' } }, d.deliveryPartner || '—'),
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: '#6b7280' } }, d.estimatedDeliveryDate ? new Date(d.estimatedDeliveryDate).toLocaleDateString('en-IN') : '—'),
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: d.deliveredAt ? '#166534' : '#9ca3af', fontWeight: d.deliveredAt ? '600' : '400' } }, d.deliveredAt ? new Date(d.deliveredAt).toLocaleDateString('en-IN') : '—'),
                  React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: '#9ca3af' } }, new Date(d.createdAt).toLocaleDateString('en-IN'))
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

module.exports = AdminDeliveryPage
