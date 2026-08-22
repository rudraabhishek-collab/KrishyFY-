const React = require('react')

function statusBadge(s) {
  const m = { ACTIVE: 'badge-green', SOLD: 'badge-gray', INACTIVE: 'badge-yellow' }
  return React.createElement('span', { className: `badge ${m[s] || 'badge-gray'}` }, s)
}

function FarmerCropsPage() {
  const [listings, setListings] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    fetch('/api/crops/mine', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setListings(data.listings || [])
        else if (data.error === 'Unauthenticated' || data.error === 'Unauthenticated or session expired') window.location.href = '/login'
        else setError(data.error || 'Failed to load')
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading your crops...')
  )

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container' },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' } },
        React.createElement('div', null,
          React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' } }, '🌾 My Crop Listings'),
          React.createElement('p', { style: { color: '#6b7280', margin: 0, fontSize: '14px' } }, `${listings.length} listing${listings.length !== 1 ? 's' : ''}`)
        ),
        React.createElement('a', { href: '/farmer/crops/new', className: 'btn-primary' }, '+ Add New Crop')
      ),
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '20px' } }, error),
      listings.length === 0 && !error && React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'empty-icon' }, '🌿'),
        React.createElement('h3', null, 'No crop listings yet'),
        React.createElement('p', null, 'Start by adding your first crop listing.'),
        React.createElement('a', { href: '/farmer/crops/new', className: 'btn-primary', style: { marginTop: '16px', display: 'inline-block' } }, '+ Add First Crop')
      ),
      listings.length > 0 && React.createElement('div', { className: 'table-container' },
        React.createElement('table', null,
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'Crop'),
              React.createElement('th', null, 'Category'),
              React.createElement('th', null, 'Quantity'),
              React.createElement('th', null, 'Price / unit'),
              React.createElement('th', null, 'Location'),
              React.createElement('th', null, 'Status'),
              React.createElement('th', null, 'Listed On'),
              React.createElement('th', null, 'Actions')
            )
          ),
          React.createElement('tbody', null,
            listings.map(l => React.createElement('tr', { key: l.id },
              React.createElement('td', { style: { fontWeight: '600' } }, l.cropName),
              React.createElement('td', null, React.createElement('span', { style: { background: '#f3f4f6', borderRadius: '4px', padding: '2px 8px', fontSize: '12px' } }, l.category)),
              React.createElement('td', null, `${l.quantity} ${l.unit}`),
              React.createElement('td', null, l.expectedPrice ? `₹${Number(l.expectedPrice).toLocaleString('en-IN')}` : '—'),
              React.createElement('td', null, l.location),
              React.createElement('td', null, statusBadge(l.status)),
              React.createElement('td', null, new Date(l.createdAt).toLocaleDateString('en-IN')),
              React.createElement('td', null,
                React.createElement('a', { href: `/marketplace/${l.id}`, style: { color: '#166534', textDecoration: 'none', fontSize: '13px', fontWeight: '500' } }, 'View →')
              )
            ))
          )
        )
      )
    )
  )
}

module.exports = FarmerCropsPage
