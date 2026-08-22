const React = require('react')

function statCard(icon, label, value, color) {
  return React.createElement('div', {
    style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', textAlign: 'center' }
  },
    React.createElement('div', { style: { fontSize: '28px', marginBottom: '8px' } }, icon),
    React.createElement('div', { style: { fontSize: '30px', fontWeight: '800', color } }, value ?? '—'),
    React.createElement('div', { style: { fontSize: '13px', color: '#6b7280', fontWeight: '500', marginTop: '4px' } }, label)
  )
}

function AdminDashboard() {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.dashboard)
        else { setError(d.error || 'Failed'); if (d.error?.includes('Admin') || d.error?.includes('auth')) window.location.href = '/login' }
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { style: { display: 'inline-block', width: '32px', height: '32px', border: '4px solid #dbeafe', borderTopColor: '#1e40af', borderRadius: '50%', animation: 'spin 0.7s linear infinite' } }),
    React.createElement('p', { style: { color: '#6b7280', marginTop: '16px' } }, 'Loading dashboard...')
  )

  const s = data || {}
  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)', color: '#fff', padding: '32px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' } },
        React.createElement('h1', { style: { fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' } }, '⚙️ Admin Dashboard'),
        React.createElement('p', { style: { opacity: 0.8, margin: 0, fontSize: '14px' } }, 'Krishify platform overview')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' } },
      error && React.createElement('div', { style: { background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' } }, error),
      data && React.createElement(React.Fragment, null,
        // Main stats
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' } },
          statCard('👥', 'Total Users', s.users?.total, '#1e40af'),
          statCard('🌾', 'Active Crops', s.crops?.active, '#166534'),
          statCard('🏷️', 'Open Auctions', s.auctions?.active, '#d97706'),
          statCard('📦', 'Pending Orders', s.orders?.pending, '#dc2626'),
          statCard('💳', 'Paid Payments', s.payments?.paid, '#166534'),
          statCard('🚚', 'Deliveries', s.deliveries?.total, '#6b7280'),
          statCard('⭐', 'Reviews', s.reviews?.total, '#d97706'),
          statCard('✓', 'Completed Orders', s.orders?.completed, '#166534')
        ),
        // Breakdown cards
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' } },
          breakdownCard('👥 Users', [
            ['Farmers', s.users?.farmers],
            ['Buyers', s.users?.buyers],
            ['Admins', s.users?.admins],
          ]),
          breakdownCard('📦 Orders', [
            ['Pending', s.orders?.pending],
            ['Confirmed', s.orders?.confirmed],
            ['Processing', s.orders?.processing],
            ['Completed', s.orders?.completed],
            ['Cancelled', s.orders?.cancelled],
          ]),
          breakdownCard('🚚 Deliveries', [
            ['Created', s.deliveries?.created],
            ['In Transit', s.deliveries?.in_transit],
            ['Delivered', s.deliveries?.delivered],
            ['Cancelled', s.deliveries?.cancelled],
          ])
        ),
        // Quick nav
        React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' } },
          React.createElement('h2', { style: { fontSize: '16px', fontWeight: '700', margin: '0 0 14px 0' } }, '⚡ Quick Navigation'),
          React.createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
            [['👥 Users', '/admin/users'], ['🌾 Crops', '/admin/crops'], ['🏷️ Auctions', '/admin/auctions'],
             ['📦 Orders', '/admin/orders'], ['💳 Payments', '/admin/payments'], ['🚚 Deliveries', '/admin/delivery'], ['⭐ Reviews', '/admin/reviews']]
            .map(([label, href]) => React.createElement('a', { key: href, href,
              style: { padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #d1d5db', textDecoration: 'none', color: '#374151', fontSize: '13px', fontWeight: '500', background: '#fff' }
            }, label))
          )
        )
      )
    )
  )
}

function breakdownCard(title, rows) {
  return React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px' } },
    React.createElement('h3', { style: { fontSize: '15px', fontWeight: '700', margin: '0 0 12px 0' } }, title),
    rows.map(([label, val]) => React.createElement('div', { key: label, style: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: '14px' } },
      React.createElement('span', { style: { color: '#6b7280' } }, label),
      React.createElement('span', { style: { fontWeight: '700', color: '#111827' } }, val ?? 0)
    ))
  )
}

module.exports = AdminDashboard
