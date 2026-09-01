const React = require('react')

function AdminDashboard() {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' }).then(r => r.json()).then(d => {
      if (d.success) setData(d.dashboard)
      else { setError(d.error || 'Failed'); if (d.error?.includes('Admin') || d.error?.includes('auth')) window.location.href = '/login' }
      setLoading(false)
    }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  if (loading) return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px', color: '#64748b' } },
    React.createElement('div', { className: 'spinner' }), React.createElement('span', null, 'Loading…')
  )

  const s = data || {}
  const KPIs = [
    ['👥', 'Total Users', s.users?.total, '#1d4ed8', '#dbeafe'],
    ['🌾', 'Active Lots', s.crops?.active, '#166534', '#dcfce7'],
    ['🏷️', 'Live Auctions', s.auctions?.active, '#d97706', '#fef9c3'],
    ['📦', 'Pending Orders', s.orders?.pending, '#dc2626', '#fee2e2'],
    ['💳', 'Paid Payments', s.payments?.paid, '#166534', '#dcfce7'],
    ['🚚', 'Deliveries', s.deliveries?.total, '#64748b', '#f1f5f9'],
    ['⭐', 'Reviews', s.reviews?.total, '#d97706', '#fef9c3'],
    ['✓', 'Completed', s.orders?.completed, '#166534', '#dcfce7'],
  ]

  return React.createElement('div', { style: { background: '#f8fafc', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(160deg, #0a0f1e 0%, #1e293b 100%)', color: '#fff', padding: '44px 24px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('div', { style: { fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' } }, '⚙️ ADMIN · KRISHIFY'),
        React.createElement('h1', { style: { fontSize: '28px', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '-0.5px' } }, 'Platform Dashboard'),
        React.createElement('p', { style: { color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '14px' } }, 'Real-time mandi platform overview')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' } },
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px' } }, error),
      data && React.createElement(React.Fragment, null,
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px', marginBottom: '28px' } },
          KPIs.map(([icon, label, val, col, bg]) =>
            React.createElement('div', { key: label, style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
              React.createElement('div', { style: { width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' } }, icon),
              React.createElement('div', { style: { fontSize: '26px', fontWeight: '900', color: col, lineHeight: 1 } }, val ?? '—'),
              React.createElement('div', { style: { fontSize: '13px', color: '#64748b', fontWeight: '600', marginTop: '4px' } }, label)
            )
          )
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' } },
          [['👥 Users', [['Farmers', s.users?.farmers], ['Buyers', s.users?.buyers], ['Admins', s.users?.admins]]],
           ['📦 Orders', [['Pending', s.orders?.pending], ['Confirmed', s.orders?.confirmed], ['Completed', s.orders?.completed], ['Cancelled', s.orders?.cancelled]]],
           ['🚚 Deliveries', [['Created', s.deliveries?.created], ['In Transit', s.deliveries?.in_transit], ['Delivered', s.deliveries?.delivered]]]
          ].map(([title, rows]) =>
            React.createElement('div', { key: title, style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' } },
              React.createElement('h3', { style: { fontSize: '14px', fontWeight: '800', margin: '0 0 14px 0', color: '#374151' } }, title),
              rows.map(([label, val]) =>
                React.createElement('div', { key: label, style: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px' } },
                  React.createElement('span', { style: { color: '#64748b' } }, label),
                  React.createElement('span', { style: { fontWeight: '800', color: '#0f172a' } }, val ?? 0)
                )
              )
            )
          )
        ),
        React.createElement('div', { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px' } },
          React.createElement('h3', { style: { fontSize: '14px', fontWeight: '800', margin: '0 0 16px 0', color: '#374151' } }, '⚡ Quick Navigation'),
          React.createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
            [['👥 Users', '/admin/users'], ['🌾 Lots', '/admin/crops'], ['🏷️ Auctions', '/admin/auctions'], ['📦 Orders', '/admin/orders'], ['💳 Payments', '/admin/payments'], ['🚚 Delivery', '/admin/delivery'], ['⭐ Reviews', '/admin/reviews']].map(([l, h]) =>
              React.createElement('a', { key: h, href: h, style: { padding: '8px 16px', background: '#f8fafc', color: '#374151', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', transition: 'all 0.15s' },
                onMouseEnter: e => { e.target.style.background = '#f0fdf4'; e.target.style.borderColor = '#166534'; e.target.style.color = '#166534' },
                onMouseLeave: e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.color = '#374151' }
              }, l)
            )
          )
        )
      )
    )
  )
}

module.exports = AdminDashboard
