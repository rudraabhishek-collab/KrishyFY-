const React = require('react')

function AdminAuctionsPage() {
  const [auctions, setAuctions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState(null)

  function load(p, st) {
    setLoading(true)
    const q = new URLSearchParams({ page: p, limit: 20 })
    if (st) q.append('status', st)
    fetch('/api/admin/auctions?' + q, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setAuctions(d.auctions || []); setPagination(d.pagination) }
        else { setError(d.error || 'Failed'); if (d.error && (d.error.includes('Admin') || d.error.includes('auth'))) window.location.href = '/login' }
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { load(1, '') }, [])

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg,#1e3a5f,#1e40af)', color: '#fff', padding: '28px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('a', { href: '/admin', style: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', display: 'block', marginBottom: '6px' } }, '← Dashboard'),
        React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0' } }, '🏷️ Auction Monitoring'),
        React.createElement('p', { style: { opacity: 0.8, margin: 0, fontSize: '14px' } }, 'All auctions on the platform')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' } },
      React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' } },
        [['', 'All'], ['ACTIVE', '🔴 Active'], ['ENDED', 'Ended']].map(([val, label]) =>
          React.createElement('button', {
            key: val, onClick: () => { setStatusFilter(val); setPage(1); load(1, val) },
            style: { padding: '6px 16px', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '500', borderColor: statusFilter === val ? '#1e40af' : '#d1d5db', background: statusFilter === val ? '#1e40af' : '#fff', color: statusFilter === val ? '#fff' : '#374151' }
          }, label)
        )
      ),
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px' } }, error),
      pagination && React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '12px' } }, pagination.total + ' auctions'),
      loading
        ? React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#9ca3af' } }, 'Loading...')
        : React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflowX: 'auto' } },
            React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' } },
              React.createElement('thead', null,
                React.createElement('tr', { style: { background: '#f9fafb' } },
                  ['Crop', 'Farmer', 'Start Price', 'Highest Bid', 'Bids', 'Status', 'Ends At'].map(h =>
                    React.createElement('th', { key: h, style: { padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' } }, h)
                  )
                )
              ),
              React.createElement('tbody', null,
                auctions.length === 0
                  ? React.createElement('tr', null, React.createElement('td', { colSpan: 7, style: { textAlign: 'center', padding: '40px', color: '#9ca3af' } }, 'No auctions found'))
                  : auctions.map(a => {
                      const ended = new Date(a.endsAt) < new Date()
                      return React.createElement('tr', { key: a.id, style: { borderTop: '1px solid #f3f4f6' } },
                        React.createElement('td', { style: { padding: '12px 16px', fontWeight: '600', fontSize: '14px' } }, a.cropName),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px', color: '#374151' } }, a.farmerName),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px' } }, '₹' + Number(a.startingPrice).toLocaleString('en-IN')),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: '#166534' } }, a.highestBid ? '₹' + Number(a.highestBid).toLocaleString('en-IN') : '—'),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px', textAlign: 'center' } }, a.bidCount || 0),
                        React.createElement('td', { style: { padding: '12px 16px' } },
                          React.createElement('span', { style: { background: ended ? '#f3f4f6' : '#dcfce7', color: ended ? '#6b7280' : '#166534', padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' } }, ended ? 'ENDED' : '🔴 LIVE')
                        ),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: '#9ca3af' } }, new Date(a.endsAt).toLocaleDateString('en-IN'))
                      )
                    })
              )
            )
          ),
      pagination && pagination.totalPages > 1 && React.createElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' } },
        page > 1 && React.createElement('button', { onClick: () => { const p = page-1; setPage(p); load(p, statusFilter) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, '← Prev'),
        React.createElement('span', { style: { padding: '7px 14px', fontSize: '14px', color: '#6b7280' } }, 'Page ' + page + ' of ' + pagination.totalPages),
        page < pagination.totalPages && React.createElement('button', { onClick: () => { const p = page+1; setPage(p); load(p, statusFilter) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, 'Next →')
      )
    )
  )
}

module.exports = AdminAuctionsPage
