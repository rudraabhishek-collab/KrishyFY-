const React = require('react')

function FarmerDashboard() {
  const [user, setUser] = React.useState(null)
  const [crops, setCrops] = React.useState([])
  const [orders, setOrders] = React.useState([])
  const [notifications, setNotifications] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/crops/mine', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/orders', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/notifications', { credentials: 'include' }).then(r => r.json()),
    ]).then(([me, cropsData, ordersData, notifData]) => {
      if (!me.authenticated) { window.location.href = '/login'; return }
      if (me.user.role !== 'farmer') { window.location.href = '/'; return }
      setUser(me.user)
      if (cropsData.success) setCrops(cropsData.listings || [])
      if (ordersData.success) setOrders(ordersData.orders || [])
      if (notifData.success) setNotifications(notifData.notifications || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { style: { display: 'inline-block', width: '32px', height: '32px', border: '4px solid #dcfce7', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.7s linear infinite' } }),
    React.createElement('p', { style: { color: '#6b7280', marginTop: '16px' } }, 'Loading...')
  )

  const active = crops.filter(c => c.status === 'ACTIVE').length
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const unread = notifications.filter(n => !n.read).length
  const recentOrders = orders.slice(0, 5)
  const recentNotifs = notifications.slice(0, 5)

  const STATUS_COLORS = { PENDING: '#854d0e', CONFIRMED: '#1e40af', PROCESSING: '#6d28d9', COMPLETED: '#166534', CANCELLED: '#991b1b' }

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg,#166534,#15803d)', color: '#fff', padding: '32px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('p', { style: { opacity: 0.8, fontSize: '14px', margin: '0 0 4px 0' } }, 'Welcome back,'),
        React.createElement('h1', { style: { fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' } }, user?.name || 'Farmer'),
        React.createElement('p', { style: { opacity: 0.8, fontSize: '14px', margin: 0 } }, '👨‍🌾 Farmer Account')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' } },
      // Stats
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' } },
        [
          ['🌾', 'Active Crops', active, '#166534'],
          ['📦', 'Total Orders', orders.length, '#374151'],
          ['⏳', 'Pending Orders', pendingOrders, '#d97706'],
          ['🔔', 'Unread Alerts', unread, unread > 0 ? '#dc2626' : '#6b7280'],
        ].map(([icon, label, val, color]) =>
          React.createElement('div', { key: label, style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '26px', marginBottom: '6px' } }, icon),
            React.createElement('div', { style: { fontSize: '28px', fontWeight: '800', color } }, val),
            React.createElement('div', { style: { fontSize: '13px', color: '#6b7280', marginTop: '4px' } }, label)
          )
        )
      ),
      // Two-column layout
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' } },
        // Recent Orders
        React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
            React.createElement('h2', { style: { fontSize: '16px', fontWeight: '700', margin: 0 } }, '📦 Recent Orders'),
            React.createElement('a', { href: '/farmer/orders', style: { fontSize: '13px', color: '#166534', textDecoration: 'none', fontWeight: '600' } }, 'View all →')
          ),
          recentOrders.length === 0
            ? React.createElement('p', { style: { color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' } }, 'No orders yet.')
            : recentOrders.map(o => React.createElement('div', { key: o.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f3f4f6' } },
                React.createElement('div', null,
                  React.createElement('p', { style: { margin: '0 0 2px 0', fontWeight: '600', fontSize: '14px' } }, o.cropName),
                  React.createElement('p', { style: { margin: 0, fontSize: '12px', color: '#9ca3af' } }, '₹' + Number(o.totalAmount).toLocaleString('en-IN'))
                ),
                React.createElement('span', { style: { background: (STATUS_COLORS[o.status] || '#6b7280') + '20', color: STATUS_COLORS[o.status] || '#6b7280', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' } }, o.status)
              ))
        ),
        // Notifications
        React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
            React.createElement('h2', { style: { fontSize: '16px', fontWeight: '700', margin: 0 } }, '🔔 Notifications'),
            React.createElement('a', { href: '/notifications', style: { fontSize: '13px', color: '#166534', textDecoration: 'none', fontWeight: '600' } }, 'View all →')
          ),
          recentNotifs.length === 0
            ? React.createElement('p', { style: { color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' } }, 'No notifications.')
            : recentNotifs.map(n => React.createElement('div', { key: n.id, style: { padding: '9px 0', borderBottom: '1px solid #f3f4f6', opacity: n.read ? 0.6 : 1 } },
                React.createElement('p', { style: { margin: '0 0 2px 0', fontWeight: n.read ? '400' : '600', fontSize: '13px' } }, n.title),
                React.createElement('p', { style: { margin: 0, fontSize: '12px', color: '#9ca3af' } }, n.message?.slice(0, 60) + (n.message?.length > 60 ? '…' : ''))
              ))
        )
      ),
      // Quick actions
      React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' } },
        React.createElement('h2', { style: { fontSize: '16px', fontWeight: '700', margin: '0 0 14px 0' } }, '⚡ Quick Actions'),
        React.createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
          React.createElement('a', { href: '/farmer/crops/new', style: { padding: '9px 18px', background: '#166534', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textDecoration: 'none', display: 'inline-block' } }, '🌾 List New Crop'),
          React.createElement('a', { href: '/farmer/crops', style: { padding: '9px 18px', background: 'transparent', color: '#166534', border: '1.5px solid #166534', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textDecoration: 'none', display: 'inline-block' } }, 'My Crops'),
          React.createElement('a', { href: '/farmer/bids', style: { padding: '9px 18px', background: 'transparent', color: '#166534', border: '1.5px solid #166534', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textDecoration: 'none', display: 'inline-block' } }, '🏷️ Auctions & Bids'),
          React.createElement('a', { href: '/farmer/delivery', style: { padding: '9px 18px', background: 'transparent', color: '#166534', border: '1.5px solid #166534', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textDecoration: 'none', display: 'inline-block' } }, '🚚 Deliveries')
        )
      )
    )
  )
}

module.exports = FarmerDashboard
