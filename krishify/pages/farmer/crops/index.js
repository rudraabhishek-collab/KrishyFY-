const React = require('react')

function FarmerCropsPage() {
  var _a = React.useState([])
  var listings = _a[0]
  var setListings = _a[1]
  var _c = React.useState(true)
  var loading = _c[0]
  var setLoading = _c[1]
  var _d = React.useState('')
  var error = _d[0]
  var setError = _d[1]

  React.useEffect(function() {
    fetch('/api/crops/mine', { credentials: 'include' })
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.success) setListings(data.listings || [])
        else if (data.error === 'Unauthenticated' || data.error === 'Unauthenticated or session expired') {
          // Only redirect if genuinely unauthenticated
          setLoading(false)
        }
        else setError(data.error || 'Failed to load')
        setLoading(false)
      })['catch'](function() { setError('Network error'); setLoading(false) })
  }, [])

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container', style: { maxWidth: '700px' } },
      React.createElement('a', { href: '/farmer/crops/new', style: { color: '#166534', textDecoration: 'none', fontSize: '14px', fontWeight: '500' } }, '← Back'),
      React.createElement('div', { className: 'card', style: { marginTop: '20px' } },
        React.createElement('h1', { style: { fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' } }, '🌾 My Mandi Lots'),
        !loading && React.createElement('p', { style: { color: '#6b7280', fontSize: '15px', marginBottom: '24px' } }, listings.length + ' lot' + (listings.length !== 1 ? 's' : '')),
        listings.length > 0 && React.createElement('p', { style: { color: '#6b7280', fontSize: '14px' } }, 'API integration ready'),
        listings.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '40px 20px' } },
          React.createElement('div', { style: { width: '80px', height: '80px', margin: '0 auto 20px', background: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, React.createElement('div', { style: { fontSize: '32px' } }, '🌾') ),
          React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' } }, 'No lots yet'),
          React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' } }, 'List your first crop to appear here.'),
          React.createElement('a', { href: '/farmer/crops/new', style: { background: '#166534', color: '#fff', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' } }, '🚀 List First Crop')
        )
      )
    )
  )
}
module.exports = FarmerCropsPage
