const React = require('react')

function MandiLotDetailPage() {
  var _a = React.useState('UNKNOWN')
  var id = _a[0]
  var setId = _a[1]

  React.useEffect(function() {
    if (typeof window !== 'undefined') {
      var _b = new URLSearchParams(window.location.search)
      var _c = _b.get('id')
      setId(_c || 'UNKNOWN')
    }
  }, [])

  return React.createElement('div', { className: 'admin-page' },
    React.createElement('h1', null, 'Mandi Lot Detail'),
    React.createElement('p', null, 'Lot ID: ', id),
    React.createElement('p', null, 'This page displays detailed information about a mandi lot including physical inspection, AI assessment, and auction status.')
  )
}

module.exports = MandiLotDetailPage
