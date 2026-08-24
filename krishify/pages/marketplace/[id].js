const React = require('react')

function MarketplaceDetailPage() {
  const [listing, setListing] = React.useState(null)
  const [quality, setQuality] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [user, setUser] = React.useState(null)
  const [id, setId] = React.useState(null)

  React.useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/\/marketplace\/([^/]+)/)
    const cropId = match ? match[1] : null
    setId(cropId)
    if (!cropId) { setError('Invalid listing ID'); setLoading(false); return }

    Promise.all([
      fetch(`/api/crops?id=${cropId}`).then(r => r.json()),
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/crop-quality/${cropId}`).then(r => r.json()).catch(() => null)
    ]).then(([cropData, meData, qualityData]) => {
      if (cropData.success) setListing(cropData.listing)
      else setError(cropData.error || 'Crop not found')
      if (meData.authenticated) setUser(meData.user)
      if (qualityData && qualityData.success) setQuality(qualityData.assessment)
      setLoading(false)
    }).catch(() => { setError('Failed to load listing'); setLoading(false) })
  }, [])

  function placeOrder() {
    if (!user) { window.location.href = '/login'; return }
    if (user.role !== 'buyer') { setOrderMsg('Only buyers can purchase crops.'); return }
    setOrdering(true); setOrderMsg('')
    // Whole-lot: purchase the complete lot, no quantity selector
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cropListingId: id })
    }).then(r => r.json()).then(data => {
      if (data.success) {
        setOrderMsg('Order placed')
        setTimeout(() => { window.location.href = '/orders' }, 1500)
      } else {
        setOrderMsg(data.error || 'Failed to place order')
        setOrdering(false)
      }
    }).catch(() => { setOrderMsg('Network error'); setOrdering(false) })
  }

  function gradeColor(grade) {
    const m = { A: '#166534', B: '#16a34a', C: '#d97706', D: '#dc2626' }
    return m[grade] || '#6b7280'
  }

  var _orderMsg = ''
  var _ordering = false

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading...')
  )

  if (error) return React.createElement('div', { className: 'page-container' },
    React.createElement('div', { className: 'alert-error' }, error),
    React.createElement('a', { href: '/marketplace', style: { color: '#166534', marginTop: '16px', display: 'inline-block' } }, 'Back to Marketplace')
  )

  if (!listing) return null

  const quintals = listing.quantityKg / 100
  const totalValue = listing.expectedPricePerQuintal ?
    Math.round(listing.quantityKg / 100 * listing.expectedPricePerQuintal) : 0
  const canBuy = user && user.role === 'buyer' && listing.status === 'ACTIVE' && listing.farmerId !== user.id

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container' },
      React.createElement('a', { href: '/marketplace', style: { color: '#166534', textDecoration: 'none', fontSize: '14px', fontWeight: '700' } }, 'Back to Marketplace'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '20px' } },
        React.createElement('div', { style: { gridColumn: 'span 2' } },
          React.createElement('div', { className: 'card' },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' } },
              React.createElement('div', null,
                React.createElement('h1', { style: { fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' } }, listing.cropName),
                React.createElement('span', { style: { background: '#f3f4f6', borderRadius: '6px', padding: '4px 12px', fontSize: '13px', fontWeight: '600', color: '#374151' } }, listing.category)
              ),
              React.createElement('span', {
                className: `badge ${listing.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`,
                style: { fontSize: '13px' }
              }, listing.status)
            ),
            listing.description && React.createElement('p', { style: { color: '#6b7280', marginTop: '16px', lineHeight: '1.6' } }, listing.description),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '24px' } },
              React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '12px' } },
                React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' } }, 'Quantity'),
                React.createElement('div', { style: { fontWeight: '600', color: '#111827', fontSize: '14px' } }, listing.quantityKg + ' kg (' + quintals.toFixed(1) + 'q)')
              ),
              React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '12px' } },
                React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' } }, 'Location'),
                React.createElement('div', { style: { fontWeight: '600', color: '#111827', fontSize: '14px' } }, listing.location)
              ),
              React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '12px' } },
                React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' } }, 'Farmer'),
                React.createElement('div', { style: { fontWeight: '600', color: '#111827', fontSize: '14px' } }, listing.farmerName)
              ),
              listing.harvestDate && React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '12px' } },
                React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' } }, 'Harvest'),
                React.createElement('div', { style: { fontWeight: '600', color: '#111827', fontSize: '14px' } }, new Date(listing.harvestDate).toLocaleDateString('en-IN'))
              ),
              React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '12px' } },
                React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' } }, 'Listed'),
                React.createElement('div', { style: { fontWeight: '600', color: '#111827', fontSize: '14px' } }, new Date(listing.createdAt).toLocaleDateString('en-IN'))
              )
            )
          )
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'card' },
            React.createElement('h2', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#111827' } }, 'Purchase This Lot'),
            listing.status !== 'ACTIVE' && React.createElement('div', { className: 'alert-error', style: { marginBottom: '12px' } }, 'This lot is no longer available.'),
            canBuy && React.createElement(React.Fragment, null,
              React.createElement('p', null, 'Whole lot purchase - ' + listing.quantityKg + ' kg (' + quintals.toFixed(1) + 'q)'),
              totalValue > 0 && React.createElement('div', { style: { background: '#f0fdf4', borderRadius: '8px', padding: '12px', marginBottom: '16px', textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: '24px', fontWeight: '800', color: '#166534' } }, 'Total: ₹' + totalValue.toLocaleString('en-IN')),
                React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'estimated value')
              ),
              _orderMsg ? React.createElement('div', { className: 'alert-success', style: { marginBottom: '12px' } }, _orderMsg) : null,
              React.createElement('button', {
                onClick: function() { _ordering = true; placeOrder() },
                disabled: _ordering,
                className: 'btn-primary', style: { width: '100%', padding: '12px', fontSize: '15px' }
              }, _ordering ? 'Placing order...' : 'Purchase Whole Lot')
            ),
            !user && React.createElement('div', null,
              React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '12px' } }, 'Sign in as a buyer to purchase this crop.'),
              React.createElement('a', { href: '/login', className: 'btn-primary', style: { display: 'block', textAlign: 'center', padding: '12px' } }, 'Login to Buy')
            ),
            user && user.role === 'farmer' && React.createElement('p', { style: { color: '#6b7280', fontSize: '13px' } }, 'Farmers cannot purchase crops.')
          )
        )
      )
    )
  )

  module.exports = MarketplaceDetailPage
}
