const React = require('react')

const TYPE_ICON = { NEW_BID: '🏷️', OUTBID: '📉', PAYMENT: '💳', DELIVERY_UPDATE: '🚚', INSPECTION_APPROVED: '✅', INSPECTION_REJECTED: '❌', INSPECTION_REQUEST: '🔍', ORDER: '📦' }

function NotificationsPage() {
  const [notifs, setNotifs] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [marking, setMarking] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/notifications', { credentials: 'include' }).then(r => r.json()).then(d => {
      if (d.success) setNotifs(d.notifications || [])
      else if (d.error?.includes('Unauthenticated')) window.location.href = '/login'
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function markOne(id) {
    fetch('/api/notifications/' + id, { method: 'PATCH', credentials: 'include' }).then(r => r.json()).then(d => {
      if (d.success) setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x))
    })
  }

  function markAll() {
    setMarking(true)
    fetch('/api/notifications/read-all', { method: 'POST', credentials: 'include' }).then(r => r.json()).then(d => {
      if (d.success) setNotifs(n => n.map(x => ({ ...x, read: true })))
      setMarking(false)
    }).catch(() => setMarking(false))
  }

  const unread = notifs.filter(n => !n.read).length

  return React.createElement('div', { style: { background: '#f8fafc', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(160deg, #052e16 0%, #166534 100%)', color: '#fff', padding: '40px 24px' } },
      React.createElement('div', { style: { maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' } },
        React.createElement('div', null,
          React.createElement('h1', { style: { fontSize: '26px', fontWeight: '900', margin: '0 0 4px 0' } }, '🔔 Notifications'),
          React.createElement('p', { style: { color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: '14px' } }, unread + ' unread')
        ),
        unread > 0 && React.createElement('button', { onClick: markAll, disabled: marking, style: { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' } }, marking ? 'Marking…' : 'Mark all read')
      )
    ),
    React.createElement('div', { style: { maxWidth: '760px', margin: '0 auto', padding: '28px 24px' } },
      loading && React.createElement('div', { style: { textAlign: 'center', padding: '60px' } }, React.createElement('div', { className: 'spinner', style: { margin: '0 auto' } })),
      !loading && notifs.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '80px', color: '#94a3b8' } },
        React.createElement('div', { style: { fontSize: '56px', marginBottom: '16px' } }, '🔔'),
        React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '8px' } }, "You're all caught up"),
        React.createElement('p', { style: { fontSize: '14px' } }, 'No notifications yet')
      ),
      !loading && notifs.length > 0 && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        notifs.map(n => React.createElement('div', { key: n.id,
          onClick: () => !n.read && markOne(n.id),
          style: { background: n.read ? '#fff' : '#f0fdf4', border: '1px solid ' + (n.read ? '#e2e8f0' : '#86efac'), borderRadius: '12px', padding: '16px 20px', cursor: n.read ? 'default' : 'pointer', display: 'flex', alignItems: 'flex-start', gap: '14px', transition: 'all 0.15s' }
        },
          React.createElement('div', { style: { width: '38px', height: '38px', borderRadius: '10px', background: n.read ? '#f1f5f9' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 } }, TYPE_ICON[n.type] || '🔔'),
          React.createElement('div', { style: { flex: 1, minWidth: 0 } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' } },
              React.createElement('p', { style: { margin: '0 0 3px 0', fontWeight: n.read ? '600' : '800', fontSize: '14px', color: '#0f172a' } }, n.title),
              React.createElement('span', { style: { fontSize: '11px', color: '#94a3b8', flexShrink: 0 } }, new Date(n.createdAt).toLocaleDateString('en-IN'))
            ),
            React.createElement('p', { style: { margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' } }, n.message)
          ),
          !n.read && React.createElement('div', { style: { width: '8px', height: '8px', borderRadius: '50%', background: '#166534', flexShrink: 0, marginTop: '4px' } })
        ))
      )
    )
  )
}

module.exports = NotificationsPage
