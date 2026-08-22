const React = require('react')

const STATUS_STYLE = { PAID: ['#dcfce7','#166534'], CREATED: ['#fef9c3','#854d0e'], FAILED: ['#fee2e2','#991b1b'] }

function AdminPaymentsPage() {
  const [payments, setPayments] = React.useState([])
  const [stats, setStats] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState(null)

  function load(p) {
    setLoading(true)
    fetch('/api/admin/payments?page=' + p + '&limit=20', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setPayments(d.payments || [])
          if (d.stats) setStats(d.stats)
          if (d.pagination) setPagination(d.pagination)
        } else {
          setError(d.error || 'Failed')
          if (d.error && (d.error.includes('Admin') || d.error.includes('auth'))) window.location.href = '/login'
        }
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { load(1) }, [])

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg,#1e3a5f,#1e40af)', color: '#fff', padding: '28px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('a', { href: '/admin', style: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', display: 'block', marginBottom: '6px' } }, '← Dashboard'),
        React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0' } }, '💳 Payment Management'),
        React.createElement('p', { style: { opacity: 0.8, margin: 0, fontSize: '14px' } }, 'TEST MODE — All payments are simulated')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' } },
      // TEST mode banner
      React.createElement('div', { style: { background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', fontSize: '14px', color: '#92400e', fontWeight: '600' } },
        '⚠️ TEST MODE — Razorpay is in test mode. No real money is involved.'
      ),
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px' } }, error),
      stats && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' } },
        [['Total', stats.total || 0, '#374151'], ['Paid', stats.paid || 0, '#166534'], ['Pending', stats.pending || 0, '#854d0e']].map(([label, val, col]) =>
          React.createElement('div', { key: label, style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '26px', fontWeight: '800', color: col } }, val),
            React.createElement('div', { style: { fontSize: '13px', color: '#6b7280', marginTop: '4px' } }, label + ' Payments')
          )
        )
      ),
      loading
        ? React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#9ca3af' } }, 'Loading...')
        : React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflowX: 'auto' } },
            React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', minWidth: '650px' } },
              React.createElement('thead', null,
                React.createElement('tr', { style: { background: '#f9fafb' } },
                  ['Order ID', 'Razorpay Order ID', 'Amount', 'Currency', 'Status', 'Date'].map(h =>
                    React.createElement('th', { key: h, style: { padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' } }, h)
                  )
                )
              ),
              React.createElement('tbody', null,
                payments.length === 0
                  ? React.createElement('tr', null, React.createElement('td', { colSpan: 6, style: { textAlign: 'center', padding: '40px', color: '#9ca3af' } }, 'No payments yet'))
                  : payments.map(p => {
                      const [bg, col] = STATUS_STYLE[p.status] || ['#f3f4f6','#6b7280']
                      return React.createElement('tr', { key: p.id, style: { borderTop: '1px solid #f3f4f6' } },
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#374151' } }, p.orderId ? p.orderId.slice(0,8) + '…' : '—'),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' } }, p.razorpayOrderId ? p.razorpayOrderId.slice(0,20) + '…' : '—'),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: '#166534' } }, p.amount ? '₹' + (Number(p.amount) / 100).toLocaleString('en-IN') : '—'),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px' } }, p.currency || 'INR'),
                        React.createElement('td', { style: { padding: '12px 16px' } }, React.createElement('span', { style: { background: bg, color: col, padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' } }, p.status)),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: '#9ca3af' } }, new Date(p.createdAt).toLocaleDateString('en-IN'))
                      )
                    })
              )
            )
          ),
      pagination && pagination.totalPages > 1 && React.createElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' } },
        page > 1 && React.createElement('button', { onClick: () => { const p = page-1; setPage(p); load(p) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, '← Prev'),
        React.createElement('span', { style: { padding: '7px 14px', fontSize: '14px', color: '#6b7280' } }, 'Page ' + page + ' of ' + pagination.totalPages),
        page < pagination.totalPages && React.createElement('button', { onClick: () => { const p = page+1; setPage(p); load(p) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, 'Next →')
      )
    )
  )
}

module.exports = AdminPaymentsPage
