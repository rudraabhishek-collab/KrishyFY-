const React = require('react')

function FarmerDashboard() {
  const [user, setUser] = React.useState(null)
  const [crops, setCrops] = React.useState([])
  const [orders, setOrders] = React.useState([])
  const [notifs, setNotifs] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/crops/mine', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/orders', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/notifications', { credentials: 'include' }).then(r => r.json()),
    ]).then(([me, cd, od, nd]) => {
      if (!me.authenticated) { window.location.href = '/login'; return }
      if (me.user.role !== 'farmer') { window.location.href = '/'; return }
      setUser(me.user)
      if (cd.success) setCrops(cd.listings || [])
      if (od.success) setOrders(od.orders || [])
      if (nd.success) setNotifs(nd.notifications || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px', color: '#64748b' } },
    React.createElement('div', { className: 'spinner' }), React.createElement('span', null, 'Loading…')
  )

  const active = crops.filter(c => c.lotStatus === 'AUCTION_ACTIVE').length
  const verified = crops.filter(c => c.inspectionStatus === 'APPROVED').length
  const pending = orders.filter(o => o.status === 'PENDING').length
  const unread = notifs.filter(n => !n.read).length

  const S_COL = { PENDING: '#d97706', CONFIRMED: '#1d4ed8', PROCESSING: '#6d28d9', COMPLETED: '#166534', CANCELLED: '#dc2626' }

  return React.createElement('div', { style: { background: '#f8fafc', minHeight: '100vh' } },
    // Header
    React.createElement('div', { style: { background: 'linear-gradient(160deg, #052e16 0%, #166534 100%)', color: '#fff', padding: '40px 24px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('p', { style: { color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0' } }, '👨‍🌾 Farmer Account'),
        React.createElement('h1', { style: { fontSize: '28px', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '-0.5px' } }, 'Good day, ' + (user?.name?.split(' ')[0] || 'Farmer')),
        React.createElement('p', { style: { color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: '14px' } }, 'Manage your mandi lots and auctions')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' } },
      // Stats
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '16px', marginBottom: '32px' } },
        [['🌾', 'Total Lots', crops.length, '#166534'], ['✓', 'Verified Lots', verified, '#166534'], ['🏷️', 'Live Auctions', active, '#1d4ed8'], ['📦', 'Pending Orders', pending, '#d97706'], ['🔔', 'Unread Alerts', unread, unread > 0 ? '#dc2626' : '#94a3b8']].map(([icon, label, val, col]) =>
          React.createElement('div', { key: label, style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
            React.createElement('div', { style: { fontSize: '26px', marginBottom: '10px' } }, icon),
            React.createElement('div', { style: { fontSize: '28px', fontWeight: '900', color: col, lineHeight: 1 } }, val),
            React.createElement('div', { style: { fontSize: '13px', color: '#64748b', fontWeight: '600', marginTop: '4px' } }, label)
          )
        )
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' } },
        // Recent orders
        React.createElement('div', { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' } },
            React.createElement('h2', { style: { fontSize: '16px', fontWeight: '800', margin: 0 } }, '📦 Recent Orders'),
            React.createElement('a', { href: '/farmer/orders', style: { fontSize: '13px', color: '#166534', fontWeight: '700', textDecoration: 'none' } }, 'View all →')
          ),
          orders.length === 0
            ? React.createElement('p', { style: { color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' } }, 'No orders yet')
            : orders.slice(0, 4).map(o => React.createElement('div', { key: o.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' } },
                React.createElement('div', null,
                  React.createElement('p', { style: { margin: '0 0 2px 0', fontWeight: '700', fontSize: '14px' } }, o.cropName),
                  React.createElement('p', { style: { margin: 0, fontSize: '12px', color: '#94a3b8' } }, '₹' + Number(o.totalAmount).toLocaleString('en-IN'))
                ),
                React.createElement('span', { style: { background: (S_COL[o.status] || '#94a3b8') + '20', color: S_COL[o.status] || '#94a3b8', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' } }, o.status)
              ))
        ),
        // Notifications
        React.createElement('div', { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' } },
            React.createElement('h2', { style: { fontSize: '16px', fontWeight: '800', margin: 0 } }, '🔔 Notifications'),
            React.createElement('a', { href: '/notifications', style: { fontSize: '13px', color: '#166534', fontWeight: '700', textDecoration: 'none' } }, 'View all →')
          ),
          notifs.length === 0
            ? React.createElement('p', { style: { color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' } }, 'No notifications')
            : notifs.slice(0, 5).map(n => React.createElement('div', { key: n.id, style: { padding: '10px 0', borderBottom: '1px solid #f1f5f9', opacity: n.read ? 0.6 : 1 } },
                React.createElement('p', { style: { margin: '0 0 2px 0', fontWeight: n.read ? '500' : '700', fontSize: '13px', color: '#0f172a' } }, n.title),
                React.createElement('p', { style: { margin: 0, fontSize: '12px', color: '#94a3b8' } }, (n.message || '').slice(0, 55) + ((n.message || '').length > 55 ? '…' : ''))
              ))
        )
      ),
      // Quick actions
      React.createElement('div', { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
        React.createElement('h2', { style: { fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0' } }, '⚡ Quick Actions'),
        React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
          [['+ List New Lot', '/farmer/crops/new', '#166534', '#fff'], ['My Lots', '/farmer/crops', '#f0fdf4', '#166534'], ['🏷️ Auctions', '/farmer/bids', '#f0fdf4', '#166534'], ['📦 Orders', '/farmer/orders', '#f0fdf4', '#166534'], ['🚚 Delivery', '/farmer/delivery', '#f0fdf4', '#166534']].map(([label, href, bg, col]) =>
            React.createElement('a', { key: href, href, style: { padding: '10px 20px', background: bg, color: col, borderRadius: '10px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', border: '1.5px solid ' + (bg === '#166534' ? '#166534' : '#e2e8f0'), transition: 'all 0.15s' } }, label)
          )
        )
      )
    )
  )
}

module.exports = FarmerDashboard
