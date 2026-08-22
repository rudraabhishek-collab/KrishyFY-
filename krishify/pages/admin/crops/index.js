const React = require('react')

const STATUS_STYLE = { ACTIVE: ['#dcfce7','#166534'], SOLD: ['#f3f4f6','#6b7280'], INACTIVE: ['#fef9c3','#854d0e'] }

function AdminCropsPage() {
  const [crops, setCrops] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState(null)

  function load(p, s, st) {
    setLoading(true)
    const q = new URLSearchParams({ page: p, limit: 20 })
    if (s) q.append('search', s)
    if (st) q.append('status', st)
    fetch('/api/admin/crops?' + q, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setCrops(d.crops || []); setPagination(d.pagination) }
        else { setError(d.error || 'Failed'); if (d.error && (d.error.includes('Admin') || d.error.includes('auth'))) window.location.href = '/login' }
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { load(1, '', '') }, [])

  function handleSearch(e) { e.preventDefault(); setPage(1); load(1, search, statusFilter) }

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg,#1e3a5f,#1e40af)', color: '#fff', padding: '28px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('a', { href: '/admin', style: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', display: 'block', marginBottom: '6px' } }, '← Dashboard'),
        React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0' } }, '🌾 Crop Management'),
        React.createElement('p', { style: { opacity: 0.8, margin: 0, fontSize: '14px' } }, 'All crop listings on the platform')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' } },
      React.createElement('form', { onSubmit: handleSearch, style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' } },
        React.createElement('input', {
          type: 'text', placeholder: '🔍 Search crop name...', value: search,
          onChange: e => setSearch(e.target.value),
          style: { flex: 1, minWidth: '200px', padding: '9px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: '#fff' }
        }),
        React.createElement('select', {
          value: statusFilter, onChange: e => setStatusFilter(e.target.value),
          style: { padding: '9px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: '#fff' }
        },
          React.createElement('option', { value: '' }, 'All Status'),
          ['ACTIVE','SOLD','INACTIVE'].map(s => React.createElement('option', { key: s, value: s }, s))
        ),
        React.createElement('button', { type: 'submit', style: { padding: '9px 20px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' } }, 'Search')
      ),
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px' } }, error),
      pagination && React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '12px' } }, pagination.total + ' listings'),
      loading
        ? React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#9ca3af' } }, 'Loading...')
        : React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflowX: 'auto' } },
            React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' } },
              React.createElement('thead', null,
                React.createElement('tr', { style: { background: '#f9fafb' } },
                  ['Crop', 'Category', 'Farmer', 'Price', 'Qty', 'Location', 'Status', 'Date'].map(h =>
                    React.createElement('th', { key: h, style: { padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' } }, h)
                  )
                )
              ),
              React.createElement('tbody', null,
                crops.length === 0
                  ? React.createElement('tr', null, React.createElement('td', { colSpan: 8, style: { textAlign: 'center', padding: '40px', color: '#9ca3af' } }, 'No crops found'))
                  : crops.map(c => {
                      const [bg, col] = STATUS_STYLE[c.status] || ['#f3f4f6','#6b7280']
                      return React.createElement('tr', { key: c.id, style: { borderTop: '1px solid #f3f4f6' } },
                        React.createElement('td', { style: { padding: '12px 16px', fontWeight: '600', fontSize: '14px' } }, c.cropName),
                        React.createElement('td', { style: { padding: '12px 16px' } }, React.createElement('span', { style: { background: '#f3f4f6', borderRadius: '4px', padding: '2px 8px', fontSize: '12px' } }, c.category)),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px', color: '#374151' } }, c.farmerName),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#166534' } }, c.expectedPrice ? '₹' + Number(c.expectedPrice).toLocaleString('en-IN') : '—'),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px' } }, c.quantity + ' ' + c.unit),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: '#6b7280' } }, c.location),
                        React.createElement('td', { style: { padding: '12px 16px' } }, React.createElement('span', { style: { background: bg, color: col, padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' } }, c.status)),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: '#9ca3af' } }, new Date(c.createdAt).toLocaleDateString('en-IN'))
                      )
                    })
              )
            )
          ),
      pagination && pagination.totalPages > 1 && React.createElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' } },
        page > 1 && React.createElement('button', { onClick: () => { const p = page-1; setPage(p); load(p, search, statusFilter) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, '← Prev'),
        React.createElement('span', { style: { padding: '7px 14px', fontSize: '14px', color: '#6b7280' } }, 'Page ' + page + ' of ' + pagination.totalPages),
        page < pagination.totalPages && React.createElement('button', { onClick: () => { const p = page+1; setPage(p); load(p, search, statusFilter) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, 'Next →')
      )
    )
  )
}

module.exports = AdminCropsPage
