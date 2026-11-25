const React = require('react')

function timeLeft(endsAt) {
  const d = new Date(endsAt) - new Date()
  if (d <= 0) return 'Ended'
  const h = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000)
  if (h > 24) return Math.floor(h / 24) + 'd ' + (h % 24) + 'h'
  return h + 'h ' + m + 'm'
}

function AuctionCard({ a, user, onBid }) {
  const [amt, setAmt] = React.useState('')
  const [bidding, setBidding] = React.useState(false)
  const [msg, setMsg] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const qKg = a.quantityKg || 0
  const q = (qKg / 100).toFixed(0)
  const cur = a.currentBid ? Number(a.currentBid) : Number(a.startingPrice)
  const min = a.currentBid ? cur + Number(a.minimumIncrement || 0) : Number(a.startingPrice)
  const total = Math.round(qKg / 100 * cur)
  const ended = new Date(a.endsAt) <= new Date()
  const canBid = user && user.role === 'buyer' && !ended

  function bid(e) {
    e.preventDefault()
    const v = Number(amt)
    if (!v || v < min) { setMsg('Minimum: ₹' + min + '/q'); return }
    setBidding(true); setMsg('')
    fetch('/api/bids', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ cropListingId: a.cropListingId, bidPricePerQuintal: v }) })
      .then(r => r.json()).then(d => {
        if (d.success) { setMsg('✅ Bid placed! Total: ₹' + d.bid.totalValue.toLocaleString('en-IN')); setAmt(''); setOpen(false); onBid() }
        else setMsg('❌ ' + (d.error || 'Failed'))
        setBidding(false)
      }).catch(() => { setMsg('❌ Network error'); setBidding(false) })
  }

  return React.createElement('div', { style: { background: '#fff', border: '1px solid ' + (ended ? '#e2e8f0' : '#166534') + '40', borderRadius: '16px', overflow: 'hidden', boxShadow: ended ? '0 1px 3px rgba(0,0,0,0.05)' : '0 4px 16px rgba(22,101,52,0.1)', transition: 'all 0.2s' } },
    !ended && React.createElement('div', { style: { height: '3px', background: 'linear-gradient(90deg, #166534, #4ade80)' } }),
    React.createElement('div', { style: { padding: '22px' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' } },
        React.createElement('div', null,
          React.createElement('h3', { style: { fontSize: '19px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' } }, a.cropName),
          React.createElement('span', { style: { fontSize: '12px', color: '#94a3b8', fontWeight: '600', background: '#f1f5f9', padding: '2px 8px', borderRadius: '999px' } }, a.category)
        ),
        ended
          ? React.createElement('span', { style: { background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' } }, 'ENDED')
          : React.createElement('span', { style: { background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' } },
              React.createElement('span', { style: { width: '6px', height: '6px', borderRadius: '50%', background: '#166534', animation: 'pulse-badge 1.5s infinite', display: 'inline-block' } }),
              'LIVE'
            )
      ),
      React.createElement('div', { style: { background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '14px' } },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0', textAlign: 'center' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' } }, 'CURRENT BID'),
            React.createElement('div', { style: { fontSize: '20px', fontWeight: '900', color: '#166534', marginTop: '3px' } }, '₹' + cur.toLocaleString('en-IN') + '/q')
          ),
          React.createElement('div', { style: { borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' } },
            React.createElement('div', { style: { fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' } }, 'LOT VALUE'),
            React.createElement('div', { style: { fontSize: '16px', fontWeight: '800', color: '#374151', marginTop: '3px' } }, '₹' + total.toLocaleString('en-IN'))
          ),
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' } }, ended ? 'ENDED' : 'TIME LEFT'),
            React.createElement('div', { style: { fontSize: '16px', fontWeight: '800', color: ended ? '#94a3b8' : '#d97706', marginTop: '3px' } }, ended ? '—' : timeLeft(a.endsAt))
          )
        )
      ),
      React.createElement('div', { style: { fontSize: '13px', color: '#64748b', marginBottom: '14px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' } },
        React.createElement('span', null, '📦 ' + qKg.toLocaleString('en-IN') + 'kg · ' + q + 'q'),
        React.createElement('span', null, '📍 ' + (a.location || '—')),
        React.createElement('span', null, '👥 ' + (a.bidCount || 0) + ' bids'),
        React.createElement('a', { href: '/marketplace/' + a.cropListingId, style: { color: '#166534', fontWeight: '700', textDecoration: 'none', marginLeft: 'auto' } }, 'View Lot →')
      ),
      msg && React.createElement('div', { style: { padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', fontWeight: '600', background: msg.startsWith('✅') ? '#f0fdf4' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b', border: '1px solid ' + (msg.startsWith('✅') ? '#86efac' : '#fca5a5') } }, msg),
      !ended && canBid && (
        !open
          ? React.createElement('button', { onClick: () => { setOpen(true); setAmt(String(min)) }, style: { width: '100%', padding: '12px', background: '#166534', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,101,52,0.25)' } },
              '🏷️ Place Bid — Min ₹' + min.toLocaleString('en-IN') + '/q'
            )
          : React.createElement('form', { onSubmit: bid, style: { display: 'flex', gap: '8px' } },
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('input', { type: 'number', value: amt, min: min, step: '1', onChange: e => setAmt(e.target.value), placeholder: 'e.g. ' + min, style: { width: '100%', padding: '11px 14px', border: '2px solid #166534', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' } }),
                amt && Number(amt) > 0 && React.createElement('div', { style: { fontSize: '12px', color: '#166534', fontWeight: '700', marginTop: '4px' } }, 'Total: ₹' + Math.round(qKg / 100 * Number(amt)).toLocaleString('en-IN'))
              ),
              React.createElement('button', { type: 'submit', disabled: bidding, style: { padding: '11px 18px', background: '#166534', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' } }, bidding ? '…' : 'Bid'),
              React.createElement('button', { type: 'button', onClick: () => setOpen(false), style: { padding: '11px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', cursor: 'pointer' } }, '✕')
            )
      ),
      !user && !ended && React.createElement('a', { href: '/login', style: { display: 'block', width: '100%', padding: '12px', background: '#f8fafc', color: '#64748b', textDecoration: 'none', textAlign: 'center', borderRadius: '10px', fontWeight: '700', fontSize: '14px', border: '1px solid #e2e8f0' } }, 'Sign in to bid'),
      user && user.role === 'farmer' && !ended && React.createElement('p', { style: { fontSize: '13px', color: '#94a3b8', textAlign: 'center', margin: 0 } }, 'Farmers cannot bid on lots.'),
      ended && React.createElement('div', { style: { background: '#f8fafc', borderRadius: '10px', padding: '12px', textAlign: 'center', fontSize: '14px', color: '#94a3b8', border: '1px solid #e2e8f0' } }, 'This auction has ended.')
    )
  )
}

function AuctionsPage() {
  const [auctions, setAuctions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [user, setUser] = React.useState(null)
  const [filter, setFilter] = React.useState('ACTIVE')

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()).then(d => { if (d.authenticated) setUser(d.user) })
    load()
  }, [])

  function load() {
    setLoading(true)
    const q = filter !== 'ALL' ? '?status=' + filter : ''
    fetch('/api/auctions' + q).then(r => r.json()).then(d => {
      if (d.success) setAuctions(d.auctions || []); else setError(d.error || 'Failed')
      setLoading(false)
    }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { load() }, [filter])

  return React.createElement('div', { style: { background: '#f8fafc', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(160deg, #052e16 0%, #166534 100%)', color: '#fff', padding: '52px 24px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('div', { style: { fontSize: '12px', color: '#4ade80', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' } }, 'KRISHIFY · DIGITAL MANDI'),
        React.createElement('h1', { style: { fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-1px' } }, '🏷️ Live Lot Auctions'),
        React.createElement('p', { style: { color: 'rgba(255,255,255,0.7)', fontSize: '16px', margin: 0 } }, 'Bid in ₹ per quintal on verified whole crop lots')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' } },
      React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '28px' } },
        [['ACTIVE', '🔴 Live'], ['ENDED', 'Ended'], ['ALL', 'All']].map(([val, label]) =>
          React.createElement('button', { key: val, onClick: () => setFilter(val), style: { padding: '8px 18px', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '700', borderColor: filter === val ? '#166534' : '#e2e8f0', background: filter === val ? '#166534' : '#fff', color: filter === val ? '#fff' : '#64748b' } }, label)
        )
      ),
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px' } }, error),
      loading && React.createElement('div', { style: { textAlign: 'center', padding: '80px' } }, React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }), React.createElement('p', { style: { color: '#64748b' } }, 'Loading auctions…')),
      !loading && auctions.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
        React.createElement('div', { style: { fontSize: '56px', marginBottom: '16px' } }, '🏷️'),
        React.createElement('h3', { style: { fontSize: '20px', fontWeight: '800', color: '#374151', marginBottom: '8px' } }, 'No auctions'),
        React.createElement('p', { style: { color: '#94a3b8', fontSize: '14px' } }, filter === 'ACTIVE' ? 'No live auctions right now.' : 'No auctions in this category.')
      ),
      !loading && auctions.length > 0 && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' } },
        auctions.map(a => React.createElement(AuctionCard, { key: a.id, a, user, onBid: load }))
      )
    )
  )
}

module.exports = AuctionsPage
