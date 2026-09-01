const React = require('react')

function BuyerDashboard() {
  const [user, setUser] = React.useState(null)
  const [orders, setOrders] = React.useState([])
  const [notifs, setNotifs] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/orders', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/notifications', { credentials: 'include' }).then(r => r.json()),
    ]).then(([me, od, nd]) => {
      if (!me.authenticated) { window.location.href = '/login'; return }
      setUser(me.user)
      if (od.success) setOrders(od.orders || [])
      if (nd.success) setNotifs(nd.notifications || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px' } }, React.createElement('div', { className: 'spinner' }))

  const pending = orders.filter(o => o.status === 'PENDING').length
  const completed = orders.filter(o => o.status === 'COMPLETED').length
  const unread = notifs.filter(n => !n.read).length
  const S = { PENDING: '#d97706', CONFIRMED: '#1d4ed8', PROCESSING: '#6d28d9', COMPLETED: '#166534', CANCELLED: '#dc2626' }

  return React.createElement('div', { style: { background: '#f8fafc', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '40px 24px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('p', { style: { color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0' } }, '🛒 Buyer Account'),
        React.createElement('h1', { style: { fontSize: '26px', fontWeight: '900', margin: '0 0 4px 0' } }, 'Welcome, ' + (user?.name?.split(' ')[0] || 'Buyer')),
        React.createElement('p', { style: { color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '14px' } }, 'Your mandi dashboard')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' } },
        [['📦', 'Total Orders', orders.length, '#0f172a'], ['⏳', 'Pending', pending, '#d97706'], ['✓', 'Completed', completed, '#166534'], ['🔔', 'Unread', unread, unread > 0 ? '#dc2626' : '#64748b']].map(([icon, label, val, col]) =>
          React.createElement('div', { key: label, style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '24px', marginBottom: '8px' } }, icon),
            React.createElement('div', { style: { fontSize: '26px', fontWeight: '900', color: col } }, val),
            React.createElement('div', { style: { fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '4px' } }, label)
          )
        )
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '20px' } },
        React.createElement('div', { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
            React.createElement('h2', { style: { fontSize: '15px', fontWeight: '800', margin: 0 } }, '📦 Recent Orders'),
            React.createElement('a', { href: '/orders', style: { fontSize: '13px', color: '#166534', fontWeight: '700', textDecoration: 'none' } }, 'View all →')
          ),
          orders.length === 0
            ? React.createElement('p', { style: { color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '16px 0' } }, 'No orders yet')
            : orders.slice(0, 4).map(o => React.createElement('div', { key: o.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('div', null,
                  React.createElement('p', { style: { margin: '0 0 2px 0', fontWeight: '700', fontSize: '13px' } }, o.cropName),
                  React.createElement('p', { style: { margin: 0, fontSize: '12px', color: '#94a3b8' } }, '₹' + Number(o.totalAmount).toLocaleString('en-IN'))
                ),
                React.createElement('span', { style: { background: (S[o.status] || '#64748b') + '20', color: S[o.status] || '#64748b', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' } }, o.status)
              ))
        ),
        React.createElement('div', { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
            React.createElement('h2', { style: { fontSize: '15px', fontWeight: '800', margin: 0 } }, '🔔 Notifications'),
            React.createElement('a', { href: '/notifications', style: { fontSize: '13px', color: '#166534', fontWeight: '700', textDecoration: 'none' } }, 'View all →')
          ),
          notifs.length === 0
            ? React.createElement('p', { style: { color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '16px 0' } }, 'No notifications')
            : notifs.slice(0, 5).map(n => React.createElement('div', { key: n.id, style: { padding: '9px 0', borderBottom: '1px solid #f1f5f9', opacity: n.read ? 0.6 : 1 } },
                React.createElement('p', { style: { margin: '0 0 2px 0', fontWeight: n.read ? '500' : '700', fontSize: '13px' } }, n.title),
                React.createElement('p', { style: { margin: 0, fontSize: '11px', color: '#94a3b8' } }, (n.message || '').slice(0, 50) + '…')
              ))
        )
      ),
      React.createElement('div', { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' } },
        React.createElement('h2', { style: { fontSize: '14px', fontWeight: '800', margin: '0 0 14px 0' } }, '⚡ Quick Actions'),
        React.createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
          [['🌾 Browse Mandi', '/marketplace', '#166534', '#fff'], ['🏷️ Auctions', '/auctions', '#f0fdf4', '#166534'], ['📦 My Orders', '/orders', '#f0fdf4', '#166534']].map(([l, h, bg, col]) =>
            React.createElement('a', { key: h, href: h, style: { padding: '10px 20px', background: bg, color: col, borderRadius: '10px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', border: '1.5px solid ' + (bg === '#166534' ? '#166534' : '#e2e8f0') } }, l)
          )
        )
      )
    )
  )
}

module.exports = BuyerDashboard
