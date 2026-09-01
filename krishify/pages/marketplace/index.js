const React = require('react')

function statusBadge(status) {
  const map = { 
    AUCTION_READY: ['badge-green', 'Auction Ready'], 
    AUCTION_ACTIVE: ['badge-blue', 'Auction Active'], 
    QUALITY_VERIFIED: ['badge-blue', 'Verified'], 
    SOLD: ['badge-gray', 'Sold'], 
    DRAFT: ['badge-yellow', 'Draft'], 
    REJECTED: ['badge-red', 'Rejected'] 
  }
  const [cls, label] = map[status] || ['badge-gray', status]
  return React.createElement('span', { className: `badge ${cls}` }, label)
}

function getCropEmoji(category) {
  const map = { Vegetables: '🥦', Fruits: '🍎', Grains: '🌾', Pulses: '🫘', Spices: '🌶️', Oilseeds: '🌻', Other: '🌿' }
  return map[category] || '🌿'
}

// Format KG to quintals/tonnes
function formatQuantity(quantityKg) {
  const q = quantityKg / 100
  const t = quantityKg / 1000
  if (t >= 1) return `${quantityKg} kg (${t.toFixed(1)}t)`
  return `${quantityKg} kg (${q.toFixed(1)}q)`
}

function MandiLotCard({ listing }) {
  const pricePerQuintal = listing.expectedPricePerQuintal ? `₹${Number(listing.expectedPricePerQuintal).toLocaleString('en-IN')}/q` : 'Price on request'
  const totalValue = listing.quantityKg && listing.expectedPricePerQuintal ? 
    Math.round(listing.quantityKg / 100 * listing.expectedPricePerQuintal) : '—'
  const inspectionStatus = listing.inspectionStatus ? `✓ ${listing.inspectionStatus}` : '—'
  const lotStatusBadge = statusBadge(listing.lotStatus)
  
  return React.createElement('a', {
    href: `/marketplace/${listing.id}`,
    style: { textDecoration: 'none', color: 'inherit', display: 'block' }
  },
    React.createElement('div', { className: 'card', style: { cursor: 'pointer', height: '100%' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' } },
        React.createElement('div', {
          style: { background: '#f0fdf4', borderRadius: '8px', padding: '8px 12px', fontSize: '24px' }
        }, getCropEmoji(listing.category)),
        lotStatusBadge
      ),
      React.createElement('h3', { style: { margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', color: '#111827' } }, listing.cropName),
      React.createElement('p', { style: { margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280' } },
        React.createElement('span', { style: { background: '#f3f4f6', borderRadius: '4px', padding: '2px 8px', fontWeight: '500' } }, listing.category)
      ),
      React.createElement('div', { style: { fontSize: '22px', fontWeight: '800', color: '#166534', margin: '8px 0' } }, pricePerQuintal),
      React.createElement('div', { style: { fontSize: '13px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '4px' } },
        React.createElement('div', null, formatQuantity(listing.quantityKg)),
        React.createElement('div', null, `📍 ${listing.location}`),
        React.createElement('div', null, inspectionStatus),
        React.createElement('div', null, `👨‍🌾 ${listing.farmerName}`)
      )
    )
  )
}

function MarketplacePage() {
  const [listings, setListings] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [category, setCategory] = React.useState('All')

  React.useEffect(() => {
    loadListings()
  }, [])

  function loadListings() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category && category !== 'All') params.append('category', category)
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
        React.createElement('h1', { style: { fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' } }, '🌾 Krishify Mandi'),
        React.createElement('p', { style: { opacity: 0.9, fontSize: '16px', margin: '0 0 24px 0' } }, 'Wholesale agricultural auction platform'),
        React.createElement('form', { onSubmit: handleSearch, style: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' } },
          React.createElement('input', {
            type: 'text', placeholder: '🔍 Search lots...', value: search,
            onChange: e => setSearch(e.target.value),
            style: { flex: '1', minWidth: '200px', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px' }
          }),
          React.createElement('button', { type: 'submit', style: { background: '#fff', color: '#166534', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' } }, 'Search')
        )
      )
    ),
    // Filters + Content
    React.createElement('div', { className: 'page-container' },
      // Category filters
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' } },
        ['All', 'Grains', 'Vegetables', 'Fruits', 'Pulses'].map(cat =>
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
        `${listings.length} lot${listings.length !== 1 ? 's' : ''} found`
      ),
      // Loading
      loading && React.createElement('div', { style: { textAlign: 'center', padding: '60px' } },
        React.createElement('div', { style: { margin: '0 auto 16px' } }),
        React.createElement('p', { style: { color: '#6b7280' } }, 'Loading lots...')
      ),
      // Error
      error && React.createElement('div', { style: { marginBottom: '20px' } }, error),
      // Empty
      !loading && !error && listings.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '80px 20px' } },
        React.createElement('div', { style: { width: '120px', height: '120px', margin: '0 auto 24px', background: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, React.createElement('div', { style: { fontSize: '48px' } }, '🌾') ),
        React.createElement('h3', { style: { fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '16px' } }, 'No lots found'),
        React.createElement('p', { style: { color: '#6b7280', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' } }, 'Your crops haven\'t appeared on the marketplace yet. List your first produce to get started!'),
        React.createElement('div', { style: { display: 'flex', gap: '12px', justifyContent: 'center' } },
          React.createElement('a', { href: '/farmer/crops/new', style: { display: 'inline-block', background: '#166534', color: '#fff', borderRadius: '10px', padding: '12px 24px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' } }, '🚀 List Your First Crop')
        )
      ),
      // Grid
      !loading && listings.length > 0 && React.createElement('div', { style: { display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' } },
        listings.map(l => React.createElement(MandiLotCard, { key: l.id, listing: l }))
      )
    )
  )
}

module.exports = MarketplacePage
