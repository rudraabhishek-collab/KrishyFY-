const React = require('react')

const LOT_STATUS_STYLE = {
  DRAFT: ['#fef9c3','#854d0e'],
  SUBMITTED_FOR_INSPECTION: ['#dbeafe','#1e40af'],
  INSPECTION_IN_PROGRESS: ['#ede9fe','#6d28d9'],
  QUALITY_VERIFIED: ['#dcfce7','#166534'],
  AUCTION_READY: ['#dcfce7','#166534'],
  AUCTION_ACTIVE: ['#dbeafe','#1e40af'],
  AUCTION_CLOSED: ['#f3f4f6','#6b7280'],
  SOLD: ['#f3f4f6','#6b7280'],
  REJECTED: ['#fee2e2','#991b1b'],
}

function lotBadge(status) {
  const [bg, col] = LOT_STATUS_STYLE[status] || ['#f3f4f6','#6b7280']
  return React.createElement('span', { style: { background: bg, color: col, padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' } }, (status || 'DRAFT').replace(/_/g, ' '))
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
        else if (data.error?.includes('Unauthenticated')) window.location.href = '/login'
        else setError(data.error || 'Failed to load')
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading your lots...')
  )

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container' },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' } },
        React.createElement('div', null,
          React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' } }, '🌾 My Mandi Lots'),
          React.createElement('p', { style: { color: '#6b7280', margin: 0, fontSize: '14px' } }, listings.length + ' lot' + (listings.length !== 1 ? 's' : ''))
        ),
        React.createElement('a', { href: '/farmer/crops/new', style: { background: '#166534', color: '#fff', borderRadius: '10px', padding: '10px 20px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' } }, '+ List New Lot')
      ),
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '16px' } }, error),
      listings.length === 0 && !error && React.createElement('div', { style: { textAlign: 'center', padding: '80px 20px' } },
        React.createElement('div', { style: { fontSize: '64px', marginBottom: '16px' } }, '🌾'),
        React.createElement('h3', { style: { fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' } }, 'No lots yet'),
        React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '24px' } }, 'List your first crop lot to appear on the Digital Mandi.'),
        React.createElement('a', { href: '/farmer/crops/new', style: { background: '#166534', color: '#fff', borderRadius: '10px', padding: '12px 24px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', display: 'inline-block' } }, '+ List First Lot')
      ),
      listings.length > 0 && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        listings.map(l => {
          const qKg = l.quantityKg || parseInt(l.quantity) || 0
          const quintals = (qKg / 100).toFixed(1)
          const pricePerQ = l.expectedPricePerQuintal || l.expectedPrice
          const totalVal = pricePerQ && qKg ? Math.round(qKg / 100 * Number(pricePerQ)) : null
          return React.createElement('div', { key: l.id, style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' } },
              React.createElement('div', null,
                React.createElement('h3', { style: { margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#111827' } }, l.cropName),
                React.createElement('p', { style: { margin: 0, fontSize: '13px', color: '#6b7280' } }, l.category + ' • 📍 ' + (l.location || '—'))
              ),
              React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                lotBadge(l.lotStatus),
                l.inspectionStatus === 'APPROVED' && React.createElement('span', { style: { background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' } }, '✓ VERIFIED')
              )
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '14px' } },
              cell('📦 Quantity', qKg.toLocaleString('en-IN') + ' kg'),
              cell('⚖️ Quintals', quintals + 'q'),
              pricePerQ && cell('💰 Price/q', '₹' + Number(pricePerQ).toLocaleString('en-IN')),
              totalVal && cell('📊 Lot Value', '₹' + totalVal.toLocaleString('en-IN')),
              cell('🔍 Inspection', l.inspectionStatus || 'PENDING')
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
              React.createElement('a', { href: '/marketplace/' + l.id, style: { color: '#166534', textDecoration: 'none', fontSize: '13px', fontWeight: '600', padding: '6px 12px', border: '1px solid #166534', borderRadius: '8px' } }, 'View Lot →'),
              (!l.lotStatus || l.lotStatus === 'DRAFT') && React.createElement('button', {
                onClick: () => submitForInspection(l.id, setListings),
                style: { color: '#1e40af', background: '#dbeafe', border: 'none', borderRadius: '8px', padding: '6px 12px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }
              }, '📋 Submit for Inspection')
            )
          )
        })
      )
    )
  )
}

function cell(label, value) {
  return React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '10px' } },
    React.createElement('div', { style: { fontSize: '11px', color: '#9ca3af', fontWeight: '600' } }, label),
    React.createElement('div', { style: { fontWeight: '700', color: '#111827', fontSize: '13px', marginTop: '2px' } }, value)
  )
}

function submitForInspection(id, setListings) {
  fetch('/api/crops/' + id + '/submit-inspection', { method: 'POST', credentials: 'include' })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        setListings(prev => prev.map(l => l.id === id ? { ...l, lotStatus: 'SUBMITTED_FOR_INSPECTION' } : l))
      } else alert(d.error || 'Failed to submit')
    }).catch(() => alert('Network error'))
}

module.exports = FarmerCropsPage
