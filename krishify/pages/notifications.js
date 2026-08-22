const React = require('react')

const TYPE_ICONS = { NEW_BID: '🏷️', OUTBID: '📉', PAYMENT: '💳', DELIVERY_UPDATE: '🚚', ORDER: '📦', DEFAULT: '🔔' }

function NotificationsPage() {
  const [notifications, setNotifications] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [marking, setMarking] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/notifications', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setNotifications(data.notifications || [])
        else if (data.error?.includes('Unauthenticated')) window.location.href = '/login'
        else setError(data.error || 'Failed to load')
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  function markOne(id) {
    fetch(`/api/notifications/${id}`, { method: 'PATCH', credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))
      })
  }

  function markAll() {
    setMarking(true)
    fetch('/api/notifications/read-all', { method: 'POST', credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setNotifications(n => n.map(x => ({ ...x, read: true })))
        setMarking(false)
      }).catch(() => setMarking(false))
  }

  const unread = notifications.filter(n => !n.read).length

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading notifications...')
  )

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', color: '#fff', padding: '28px 20px', textAlign: 'center' } },
      React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0' } }, '🔔 Notifications'),
      React.createElement('p', { style: { opacity: 0.85, margin: 0, fontSize: '14px' } }, `${unread} unread`)
    ),
    React.createElement('div', { className: 'page-container' },
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '16px' } }, error),
      unread > 0 && React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' } },
        React.createElement('button', { onClick: markAll, disabled: marking, className: 'btn-outline', style: { fontSize: '13px' } }, marking ? 'Marking...' : 'Mark all as read')
      ),
      notifications.length === 0 && React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'empty-icon' }, '🔔'),
        React.createElement('h3', null, 'No notifications'),
        React.createElement('p', null, 'You\'re all caught up!')
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        notifications.map(n => React.createElement('div', {
          key: n.id,
          onClick: () => !n.read && markOne(n.id),
          style: {
            background: n.read ? '#fff' : '#f0fdf4', border: `1px solid ${n.read ? '#e5e7eb' : '#86efac'}`,
            borderRadius: '10px', padding: '14px 16px', cursor: n.read ? 'default' : 'pointer',
            display: 'flex', alignItems: 'flex-start', gap: '12px', transition: 'all 0.15s'
          }
        },
          React.createElement('span', { style: { fontSize: '22px', flexShrink: 0 } }, TYPE_ICONS[n.type] || TYPE_ICONS.DEFAULT),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' } },
              React.createElement('p', { style: { margin: '0 0 3px 0', fontWeight: n.read ? '500' : '700', fontSize: '14px', color: '#111827' } }, n.title),
              React.createElement('span', { style: { fontSize: '11px', color: '#9ca3af', flexShrink: 0 } }, new Date(n.createdAt).toLocaleDateString('en-IN'))
            ),
            React.createElement('p', { style: { margin: 0, fontSize: '13px', color: '#6b7280' } }, n.message)
          ),
          !n.read && React.createElement('div', { style: { width: '8px', height: '8px', borderRadius: '50%', background: '#166534', flexShrink: 0, marginTop: '4px' } })
        ))
      )
    )
  )
}

module.exports = NotificationsPage
