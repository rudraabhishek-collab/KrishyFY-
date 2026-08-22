const React = require('react')

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Oilseeds', 'Other']

function statusBadge(status) {
  const map = { ACTIVE: ['badge-green', 'Active'], SOLD: ['badge-gray', 'Sold'], INACTIVE: ['badge-yellow', 'Inactive'] }
  const [cls, label] = map[status] || ['badge-gray', status]
  return React.createElement('span', { className: `badge ${cls}` }, label)
}

function CropCard({ listing }) {
  const price = listing.expectedPrice ? `₹${Number(listing.expectedPrice).toLocaleString('en-IN')}` : 'Price on request'
  return React.createElement('a', {
    href: `/marketplace/${listing.id}`,
    style: { textDecoration: 'none', color: 'inherit', display: 'block' }
  },
    React.createElement('div', { className: 'card', style: { cursor: 'pointer', height: '100%' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' } },
        React.createElement('div', {
          style: { background: '#f0fdf4', borderRadius: '8px', padding: '8px 12px', fontSize: '24px' }
        }, getCropEmoji(listing.category)),
        statusBadge(listing.status)
      ),
      React.createElement('h3', { style: { margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', color: '#111827' } }, listing.cropName),
      React.createElement('p', { style: { margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280' } },
        React.createElement('span', { style: { background: '#f3f4f6', borderRadius: '4px', padding: '2px 8px', fontWeight: '500' } }, listing.category)
      ),
      React.createElement('div', { style: { fontSize: '22px', fontWeight: '800', color: '#166534', margin: '8px 0' } }, price),
      React.createElement('div', { style: { fontSize: '13px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '4px' } },
        React.createElement('div', null, `📦 ${listing.quantity} ${listing.unit}`),
        React.createElement('div', null, `📍 ${listing.location}`),
        React.createElement('div', null, `👨‍🌾 ${listing.farmerName}`)
      )
    )
  )
}

function getCropEmoji(category) {
  const map = { Vegetables: '🥦', Fruits: '🍎', Grains: '🌾', Pulses: '🫘', Spices: '🌶️', Oilseeds: '🌻', Other: '🌿' }
  return map[category] || '🌿'
}

function MarketplacePage() {
  const [listings, setListings] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [category, setCategory] = React.useState('All')
  const [location, setLocation] = React.useState('')

  React.useEffect(() => {
    loadListings()
  }, [])

  function loadListings() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category && category !== 'All') params.append('category', category)
    if (location) params.append('location', location)
    fetch(`/api/crops?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setListings(data.listings || [])
        else setError(data.error || 'Failed to load')
        setLoading(false)
      })
      .catch(() => { setError('Failed to connect to server'); setLoading(false) })
  }

  function handleSearch(e) {
    e.preventDefault()
    loadListings()
  }

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    // Hero
    React.createElement('div', {
      style: { background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', color: '#fff', padding: '40px 20px' }
    },
      React.createElement('div', { style: { maxWidth: '800px', margin: '0 auto', textAlign: 'center' } },
        React.createElement('h1', { style: { fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' } }, '🌾 Krishify Marketplace'),
        React.createElement('p', { style: { opacity: 0.9, fontSize: '16px', margin: '0 0 24px 0' } }, 'Fresh, verified produce directly from farmers'),
        React.createElement('form', { onSubmit: handleSearch, style: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' } },
          React.createElement('input', {
            type: 'text', placeholder: '🔍 Search crops...', value: search,
            onChange: e => setSearch(e.target.value),
            style: { flex: '1', minWidth: '200px', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px' }
          }),
          React.createElement('input', {
            type: 'text', placeholder: '📍 Location', value: location,
            onChange: e => setLocation(e.target.value),
            style: { width: '150px', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px' }
          }),
          React.createElement('button', { type: 'submit', style: { background: '#fff', color: '#166534', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' } }, 'Search')
        )
      )
    ),
    // Filters + Content
    React.createElement('div', { className: 'page-container' },
      // Category filters
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' } },
        CATEGORIES.map(cat =>
          React.createElement('button', {
            key: cat,
            onClick: () => { setCategory(cat); setTimeout(loadListings, 0) },
            style: {
              padding: '6px 16px', borderRadius: '999px', border: '1.5px solid',
              borderColor: category === cat ? '#166534' : '#d1d5db',
              background: category === cat ? '#166534' : '#fff',
              color: category === cat ? '#fff' : '#374151',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.15s'
            }
          }, cat)
        )
      ),
      // Results header
      !loading && React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '16px' } },
        `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`
      ),
      // Loading
      loading && React.createElement('div', { style: { textAlign: 'center', padding: '60px' } },
        React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
        React.createElement('p', { style: { color: '#6b7280' } }, 'Loading marketplace...')
      ),
      // Error
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '20px' } }, error),
      // Empty
      !loading && !error && listings.length === 0 && React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'empty-icon' }, '🌿'),
        React.createElement('h3', null, 'No crops found'),
        React.createElement('p', null, 'Try adjusting your search or check back later.')
      ),
      // Grid
      !loading && listings.length > 0 && React.createElement('div', { className: 'grid-3' },
        listings.map(l => React.createElement(CropCard, { key: l.id, listing: l }))
      )
    )
  )
}

module.exports = MarketplacePage
