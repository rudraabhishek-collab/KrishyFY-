const React = require('react')

const STATUS_STYLES = {
  PENDING: ['badge-yellow', '⏳'],
  CONFIRMED: ['badge-blue', '✅'],
  PROCESSING: ['badge-blue', '🔄'],
  COMPLETED: ['badge-green', '✓'],
  CANCELLED: ['badge-red', '✕'],
}

function BuyerDashboardPage() {
  const [user, setUser] = React.useState(null)
  const [orders, setOrders] = React.useState([])
  const [notifications, setNotifications] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/orders', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/notifications', { credentials: 'include' }).then(r => r.json()),
    ]).then(([me, ordersData, notifData]) => {
      if (!me.authenticated) { window.location.href = '/login'; return }
      if (me.user.role !== 'buyer') { window.location.href = '/'; return }
      setUser(me.user)
      if (ordersData.success) setOrders(ordersData.orders || [])
      if (notifData.success) setNotifications(notifData.notifications || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading dashboard...')
  )

  const pending = orders.filter(o => o.status === 'PENDING').length
  const completed = orders.filter(o => o.status === 'COMPLETED').length
  const unread = notifications.filter(n => !n.read).length
  const recentOrders = orders.slice(0, 5)
  const recentNotifs = notifications.slice(0, 5)

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', color: '#fff', padding: '32px 20px' } },
      React.createElement('div', { className: 'page-container', style: { paddingTop: 0, paddingBottom: 0 } },
        React.createElement('p', { style: { opacity: 0.8, fontSize: '14px', margin: '0 0 4px 0' } }, 'Welcome back,'),
        React.createElement('h1', { style: { fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' } }, user?.name || 'Buyer'),
        React.createElement('p', { style: { opacity: 0.8, fontSize: '14px', margin: 0 } }, '🛒 Buyer Account')
      )
    ),
    React.createElement('div', { className: 'page-container' },
      // Stats
      React.createElement('div', { className: 'grid-4', style: { marginBottom: '32px' } },
        statCard('📦', 'Total Orders', orders.length, '#166534'),
        statCard('⏳', 'Pending', pending, '#d97706'),
        statCard('✓', 'Completed', completed, '#166534'),
        statCard('🔔', 'Unread Alerts', unread, unread > 0 ? '#dc2626' : '#6b7280'),
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' } },
        // Recent Orders
        React.createElement('div', { className: 'card' },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
            React.createElement('h2', { style: { fontSize: '17px', fontWeight: '700', margin: 0 } }, '📦 Recent Orders'),
            React.createElement('a', { href: '/orders', style: { fontSize: '13px', color: '#166534', textDecoration: 'none', fontWeight: '600' } }, 'View all →')
          ),
          recentOrders.length === 0
            ? React.createElement('div', { className: 'empty-state', style: { padding: '24px' } },
                React.createElement('div', { className: 'empty-icon', style: { fontSize: '32px' } }, '📦'),
                React.createElement('p', null, 'No orders yet.'),
                React.createElement('a', { href: '/marketplace', className: 'btn-primary', style: { marginTop: '12px', display: 'inline-block', fontSize: '13px' } }, 'Browse Marketplace')
              )
            : recentOrders.map(o => {
                const [badgeClass, icon] = STATUS_STYLES[o.status] || ['badge-gray', '•']
                return React.createElement('div', { key: o.id, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' } },
                  React.createElement('div', null,
                    React.createElement('p', { style: { margin: '0 0 2px 0', fontWeight: '600', fontSize: '14px' } }, o.cropName),
                    React.createElement('p', { style: { margin: 0, fontSize: '12px', color: '#9ca3af' } }, `₹${Number(o.totalAmount).toLocaleString('en-IN')} • ${new Date(o.createdAt).toLocaleDateString('en-IN')}`)
                  ),
                  React.createElement('a', { href: `/orders/${o.id}`, style: { textDecoration: 'none' } },
                    React.createElement('span', { className: `badge ${badgeClass}` }, `${icon} ${o.status}`)
                  )
                )
              })
        ),
        // Notifications
        React.createElement('div', { className: 'card' },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
            React.createElement('h2', { style: { fontSize: '17px', fontWeight: '700', margin: 0 } }, '🔔 Notifications'),
            React.createElement('a', { href: '/notifications', style: { fontSize: '13px', color: '#166534', textDecoration: 'none', fontWeight: '600' } }, 'View all →')
          ),
          recentNotifs.length === 0
            ? React.createElement('p', { style: { color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '24px 0' } }, 'No notifications yet.')
            : recentNotifs.map(n => React.createElement('div', { key: n.id, style: { padding: '10px 0', borderBottom: '1px solid #f3f4f6', opacity: n.read ? 0.6 : 1 } },
                React.createElement('p', { style: { margin: '0 0 2px 0', fontWeight: n.read ? '400' : '600', fontSize: '14px' } }, n.title),
                React.createElement('p', { style: { margin: 0, fontSize: '12px', color: '#9ca3af' } }, n.message)
              ))
        )
      ),
      // Quick links
      React.createElement('div', { className: 'card', style: { marginTop: '24px' } },
        React.createElement('h2', { style: { fontSize: '17px', fontWeight: '700', margin: '0 0 16px 0' } }, '⚡ Quick Actions'),
        React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
          React.createElement('a', { href: '/marketplace', className: 'btn-primary' }, '🌾 Browse Marketplace'),
          React.createElement('a', { href: '/auctions', className: 'btn-outline' }, '🏷️ View Auctions'),
          React.createElement('a', { href: '/orders', className: 'btn-outline' }, '📦 My Orders'),
        )
      )
    )
  )
}

function statCard(icon, label, value, color) {
  return React.createElement('div', { className: 'stat-card' },
    React.createElement('div', { style: { fontSize: '28px', marginBottom: '8px' } }, icon),
    React.createElement('div', { className: 'stat-number', style: { color } }, value),
    React.createElement('div', { className: 'stat-label' }, label)
  )
}

module.exports = BuyerDashboardPage
