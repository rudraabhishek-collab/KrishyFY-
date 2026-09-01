const React = require('react')

const CATS = ['All', 'Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Oilseeds']
const EMOJI = { Grains: '🌾', Vegetables: '🥦', Fruits: '🍎', Pulses: '🫘', Spices: '🌶️', Oilseeds: '🌻', Other: '🌿' }

const STATUS_MAP = {
  AUCTION_ACTIVE:  ['#dbeafe', '#1d4ed8', '🔴 Live Auction'],
  QUALITY_VERIFIED:['#dcfce7', '#166534', '✓ Verified'],
  AUCTION_READY:   ['#dcfce7', '#166534', '✓ Ready'],
  DRAFT:           ['#f1f5f9', '#64748b', 'Draft'],
  SOLD:            ['#f1f5f9', '#64748b', 'Sold'],
  REJECTED:        ['#fee2e2', '#991b1b', 'Rejected'],
}

function LotCard({ lot }) {
  const qKg = lot.quantityKg || parseInt(lot.quantity) || 0
  const quintals = (qKg / 100).toFixed(0)
  const priceQ = lot.expectedPricePerQuintal || lot.expectedPrice
  const [bg, col, label] = STATUS_MAP[lot.lotStatus] || ['#f1f5f9', '#64748b', lot.lotStatus || 'Active']
  const emoji = EMOJI[lot.category] || '🌿'

  return React.createElement('a', { href: '/marketplace/' + lot.id, style: { textDecoration: 'none', display: 'block' } },
    React.createElement('div', { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s', cursor: 'pointer' },
      onMouseEnter: e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' },
      onMouseLeave: e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }
    },
      // Top accent
      React.createElement('div', { style: { height: '4px', background: 'linear-gradient(90deg, #166534, #16a34a)' } }),
      React.createElement('div', { style: { padding: '20px' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' } },
          React.createElement('div', { style: { width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' } }, emoji),
          React.createElement('span', { style: { background: bg, color: col, padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' } }, label)
        ),
        React.createElement('h3', { style: { fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' } }, lot.cropName),
        React.createElement('p', { style: { fontSize: '12px', color: '#94a3b8', margin: '0 0 14px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' } }, lot.category),
        priceQ && React.createElement('div', { style: { fontSize: '22px', fontWeight: '900', color: '#166534', margin: '0 0 10px 0', letterSpacing: '-0.5px' } },
          '₹' + Number(priceQ).toLocaleString('en-IN') + '/q'
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', color: '#64748b' } },
          React.createElement('span', null, '📦 ' + qKg.toLocaleString('en-IN') + ' kg · ' + quintals + ' quintals'),
          React.createElement('span', null, '📍 ' + (lot.location || '—')),
          React.createElement('span', null, '👨‍🌾 ' + (lot.farmerName || '—')),
          lot.inspectionStatus === 'APPROVED' && React.createElement('span', { style: { color: '#166534', fontWeight: '700' } }, '✓ Physically verified')
        )
      )
    )
  )
}

function MandiPage() {
  const [lots, setLots] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [cat, setCat] = React.useState('All')

  function load(s, c) {
    setLoading(true)
    const p = new URLSearchParams()
    if (s) p.append('search', s)
    if (c && c !== 'All') p.append('category', c)
    fetch('/api/crops?' + p).then(r => r.json()).then(d => {
      if (d.success) setLots(d.listings || []); else setError(d.error || 'Failed')
      setLoading(false)
    }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { load('', 'All') }, [])

  return React.createElement('div', { style: { background: '#f8fafc', minHeight: '100vh' } },
    // Hero
    React.createElement('div', { style: { background: 'linear-gradient(160deg, #052e16 0%, #166534 100%)', color: '#fff', padding: '52px 24px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('div', { style: { fontSize: '12px', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' } }, 'KRISHIFY · DIGITAL MANDI'),
        React.createElement('h1', { style: { fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-1px' } }, 'Wholesale Agricultural Lots'),
        React.createElement('p', { style: { color: 'rgba(255,255,255,0.7)', fontSize: '16px', margin: '0 0 28px 0', maxWidth: '500px' } }, 'Bid on complete crop lots directly from verified farmers — price in ₹ per quintal.'),
        React.createElement('form', { onSubmit: e => { e.preventDefault(); load(search, cat) }, style: { display: 'flex', gap: '10px', maxWidth: '560px' } },
          React.createElement('input', { type: 'text', placeholder: 'Search lots — wheat, tomato, mango…', value: search, onChange: e => setSearch(e.target.value),
            style: { flex: 1, padding: '12px 16px', borderRadius: '10px', border: 'none', fontSize: '14px', background: 'rgba(255,255,255,0.15)', color: '#fff', outline: 'none', backdropFilter: 'blur(4px)' } }),
          React.createElement('button', { type: 'submit', style: { padding: '12px 24px', background: '#fff', color: '#166534', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' } }, 'Search')
        )
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' } },
      // Category pills
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' } },
        CATS.map(c => React.createElement('button', { key: c, onClick: () => { setCat(c); load(search, c) },
          style: { padding: '7px 18px', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.15s', borderColor: cat === c ? '#166534' : '#e2e8f0', background: cat === c ? '#166534' : '#fff', color: cat === c ? '#fff' : '#64748b' }
        }, c))
      ),
      !loading && React.createElement('p', { style: { fontSize: '14px', color: '#94a3b8', marginBottom: '20px', fontWeight: '600' } }, lots.length + ' lot' + (lots.length !== 1 ? 's' : '') + ' found'),
      loading && React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px', color: '#64748b' } },
        React.createElement('div', { className: 'spinner' }),
        React.createElement('span', null, 'Loading lots…')
      ),
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', fontSize: '14px' } }, error),
      !loading && !error && lots.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '80px 24px' } },
        React.createElement('div', { style: { fontSize: '56px', marginBottom: '16px' } }, '🌾'),
        React.createElement('h3', { style: { fontSize: '20px', fontWeight: '800', color: '#374151', marginBottom: '8px' } }, 'No lots found'),
        React.createElement('p', { style: { color: '#94a3b8', fontSize: '14px' } }, 'Try a different search or category.')
      ),
      !loading && lots.length > 0 && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' } },
        lots.map(l => React.createElement(LotCard, { key: l.id, lot: l }))
      )
    )
  )
}

module.exports = MandiPage
