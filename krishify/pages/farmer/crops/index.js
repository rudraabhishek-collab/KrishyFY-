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
        else if (data.error === 'Unauthenticated' || data.error === 'Unauthenticated or session expired') window.location.href = '/login'
        else setError(data.error || 'Failed to load')
        setLoading(false)
      })['catch'](function() { setError('Network error'); setLoading(false) })
  }, [])

  var statusTxt = 'No lots'
  if (listings.length > 0) statusTxt = listings.length + ' lot' + (listings.length !== 1 ? 's' : '')

  return React.createElement('div', null,
    React.createElement('h1', null, '🌾 My Mandi Lots'),
    React.createElement('p', null, statusTxt),
    listings.length > 0 && React.createElement('p', null, 'API integration ready')
  )
}

module.exports = FarmerCropsPage
