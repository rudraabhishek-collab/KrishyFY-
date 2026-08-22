const React = require('react')

function MarketplaceDetailPage() {
  const [listing, setListing] = React.useState(null)
  const [quality, setQuality] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [user, setUser] = React.useState(null)
  const [orderQty, setOrderQty] = React.useState(1)
  const [ordering, setOrdering] = React.useState(false)
  const [orderMsg, setOrderMsg] = React.useState('')
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
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cropListingId: id, quantity: orderQty })
    }).then(r => r.json()).then(data => {
      if (data.success) {
        setOrderMsg('✅ Order placed! Redirecting...')
        setTimeout(() => { window.location.href = '/orders' }, 1500)
      } else {
        setOrderMsg(`❌ ${data.error || 'Failed to place order'}`)
        setOrdering(false)
      }
    }).catch(() => { setOrderMsg('❌ Network error'); setOrdering(false) })
  }

  function gradeColor(grade) {
    const m = { A: '#166534', B: '#16a34a', C: '#d97706', D: '#dc2626' }
    return m[grade] || '#6b7280'
  }

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading...')
  )

  if (error) return React.createElement('div', { className: 'page-container' },
    React.createElement('div', { className: 'alert-error' }, error),
    React.createElement('a', { href: '/marketplace', style: { color: '#166534', marginTop: '16px', display: 'inline-block' } }, '← Back to Marketplace')
  )

  if (!listing) return null

  const price = listing.expectedPrice ? `₹${Number(listing.expectedPrice).toLocaleString('en-IN')} / ${listing.unit}` : 'Price on request'
  const totalPrice = listing.expectedPrice ? `₹${(Number(listing.expectedPrice) * orderQty).toLocaleString('en-IN')}` : ''
  const canBuy = user && user.role === 'buyer' && listing.status === 'ACTIVE' && listing.farmerId !== user.id

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container' },
      React.createElement('a', { href: '/marketplace', style: { color: '#166534', textDecoration: 'none', fontSize: '14px', fontWeight: '500' } }, '← Back to Marketplace'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '20px' } },
        // Main info card
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
              infoBox('💰 Price', price),
              infoBox('📦 Quantity', `${listing.quantity} ${listing.unit}`),
              infoBox('📍 Location', listing.location),
              infoBox('👨‍🌾 Farmer', listing.farmerName),
              listing.harvestDate && infoBox('📅 Harvest', new Date(listing.harvestDate).toLocaleDateString('en-IN')),
              infoBox('📋 Listed', new Date(listing.createdAt).toLocaleDateString('en-IN'))
            )
          )
        ),
        // Purchase card
        React.createElement('div', null,
          React.createElement('div', { className: 'card' },
            React.createElement('h2', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#111827' } }, 'Purchase Crop'),
            listing.status !== 'ACTIVE' && React.createElement('div', { className: 'alert-error', style: { marginBottom: '12px' } }, 'This crop is no longer available.'),
            canBuy && React.createElement(React.Fragment, null,
              React.createElement('label', { className: 'form-label' }, 'Quantity'),
              React.createElement('input', {
                type: 'number', className: 'input-field', min: 1, max: parseInt(listing.quantity),
                value: orderQty, onChange: e => setOrderQty(parseInt(e.target.value) || 1),
                style: { marginBottom: '8px' }
              }),
              React.createElement('p', { style: { fontSize: '13px', color: '#6b7280', marginBottom: '16px' } }, `Available: ${listing.quantity} ${listing.unit}`),
              totalPrice && React.createElement('div', { style: { background: '#f0fdf4', borderRadius: '8px', padding: '12px', marginBottom: '16px', textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: '24px', fontWeight: '800', color: '#166534' } }, totalPrice),
                React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'Total amount')
              ),
              orderMsg && React.createElement('div', { className: orderMsg.startsWith('✅') ? 'alert-success' : 'alert-error', style: { marginBottom: '12px' } }, orderMsg),
              React.createElement('button', {
                onClick: placeOrder, disabled: ordering,
                className: 'btn-primary', style: { width: '100%', padding: '12px', fontSize: '15px' }
              }, ordering ? 'Placing order...' : 'Place Order')
            ),
            !user && React.createElement('div', null,
              React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '12px' } }, 'Sign in as a buyer to purchase this crop.'),
              React.createElement('a', { href: '/login', className: 'btn-primary', style: { display: 'block', textAlign: 'center', padding: '12px' } }, 'Login to Buy')
            ),
            user && user.role === 'farmer' && React.createElement('p', { style: { color: '#6b7280', fontSize: '13px' } }, 'Farmers cannot purchase crops.')
          )
        )
      ),
      // AI Quality Assessment
      React.createElement('div', { style: { marginTop: '24px' } },
        React.createElement('div', { className: 'card' },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' } },
            React.createElement('h2', { style: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 } }, '🤖 AI Quality Assessment'),
            React.createElement('span', { className: 'badge badge-yellow' }, 'TEST / DEMO')
          ),
          quality ? React.createElement('div', null,
            React.createElement('div', { style: { display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' } },
              React.createElement('div', { style: { textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: '48px', fontWeight: '800', color: gradeColor(quality.grade) } }, quality.grade),
                React.createElement('div', { style: { fontSize: '13px', color: '#6b7280' } }, 'Grade')
              ),
              React.createElement('div', { style: { textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: '48px', fontWeight: '800', color: '#166534' } }, quality.score),
                React.createElement('div', { style: { fontSize: '13px', color: '#6b7280' } }, 'Quality Score / 100')
              ),
              React.createElement('div', { style: { textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: '32px', fontWeight: '700', color: '#374151' } }, `${quality.confidence}%`),
                React.createElement('div', { style: { fontSize: '13px', color: '#6b7280' } }, 'Confidence')
              )
            ),
            quality.observations && React.createElement('p', { style: { color: '#374151', lineHeight: '1.6', marginBottom: '12px' } }, quality.observations),
            quality.issues && Array.isArray(JSON.parse(quality.issues || '[]')) && JSON.parse(quality.issues || '[]').length > 0 && React.createElement('div', null,
              React.createElement('p', { style: { fontWeight: '600', color: '#374151', marginBottom: '8px' } }, 'Observed Issues:'),
              React.createElement('ul', { style: { margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '14px' } },
                JSON.parse(quality.issues || '[]').map((issue, i) => React.createElement('li', { key: i }, issue))
              )
            ),
            React.createElement('p', { style: { fontSize: '12px', color: '#9ca3af', marginTop: '12px' } },
              `Provider: ${quality.provider} • Model: ${quality.model} • This is an AI-assisted assessment, not an official certification.`
            )
          ) : React.createElement('div', { style: { color: '#9ca3af', textAlign: 'center', padding: '24px' } },
            React.createElement('div', { style: { fontSize: '32px', marginBottom: '8px' } }, '🔍'),
            React.createElement('p', null, 'No quality assessment available for this crop yet.')
          )
        )
      )
    )
  )
}

function infoBox(label, value) {
  return React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '12px' } },
    React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' } }, label),
    React.createElement('div', { style: { fontWeight: '600', color: '#111827', fontSize: '14px' } }, value)
  )
}

module.exports = MarketplaceDetailPage
