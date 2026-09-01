const React = require('react')

function timeLeft(endsAt) {
  const diff = new Date(endsAt) - new Date()
  if (diff <= 0) return 'Ended'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return Math.floor(h / 24) + 'd ' + (h % 24) + 'h'
  if (h > 0) return h + 'h ' + m + 'm'
  return m + 'm'
}

function AuctionCard({ auction, user, onBid }) {
  const [bidAmount, setBidAmount] = React.useState('')
  const [bidding, setBidding] = React.useState(false)
  const [msg, setMsg] = React.useState('')
  const [showBid, setShowBid] = React.useState(false)

  const qKg = auction.quantityKg || 0
  const quintals = (qKg / 100).toFixed(1)
  const currentBid = auction.currentBid ? Number(auction.currentBid) : Number(auction.startingPrice)
  const minIncrement = Number(auction.minimumIncrement) || 0
  const minBid = currentBid + minIncrement
  const currentTotal = Math.round(qKg / 100 * currentBid)
  const ended = new Date(auction.endsAt) <= new Date()

  function submitBid(e) {
    e.preventDefault()
    const amt = Number(bidAmount)
    if (!amt || amt < minBid) { setMsg('Minimum bid: ₹' + minBid + '/q'); return }
    setBidding(true); setMsg('')
    // Correct: send cropListingId + bidPricePerQuintal
    fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cropListingId: auction.cropListingId, bidPricePerQuintal: amt })
    }).then(r => r.json()).then(d => {
      if (d.success) {
        setMsg('✅ Bid placed! Total: ₹' + d.bid.totalValue.toLocaleString('en-IN'))
        setBidAmount(''); setShowBid(false); onBid()
      } else setMsg('❌ ' + (d.error || 'Failed'))
      setBidding(false)
    }).catch(() => { setMsg('❌ Network error'); setBidding(false) })
  }

  return React.createElement('div', { style: { background: '#fff', border: '2px solid ' + (ended ? '#e5e7eb' : '#166534'), borderRadius: '16px', padding: '24px' } },
    // Header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' } },
      React.createElement('div', null,
        React.createElement('h3', { style: { margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800', color: '#111827' } }, auction.cropName),
        React.createElement('span', { style: { background: '#f3f4f6', borderRadius: '6px', padding: '2px 10px', fontSize: '12px', color: '#6b7280', fontWeight: '600' } }, auction.category)
      ),
      React.createElement('span', { style: { background: ended ? '#f3f4f6' : '#dcfce7', color: ended ? '#6b7280' : '#166534', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' } }, ended ? 'ENDED' : '🔴 LIVE')
    ),
    // Lot info
    React.createElement('div', { style: { background: '#f9fafb', borderRadius: '10px', padding: '12px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#374151' } },
      React.createElement('span', { style: { fontWeight: '700' } }, '📦 ' + qKg.toLocaleString('en-IN') + ' kg (' + quintals + 'q)'),
      React.createElement('span', null, '📍 ' + (auction.location || '—')),
      React.createElement('span', null, '👨‍🌾 ' + (auction.farmerName || '—'))
    ),
    // Current bid
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' } },
      React.createElement('div', { style: { background: '#f0fdf4', borderRadius: '10px', padding: '12px', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: '10px', color: '#9ca3af', fontWeight: '700', marginBottom: '2px' } }, 'CURRENT BID'),
        React.createElement('div', { style: { fontSize: '20px', fontWeight: '900', color: '#166534' } }, '₹' + currentBid.toLocaleString('en-IN') + '/q')
      ),
      React.createElement('div', { style: { background: '#f9fafb', borderRadius: '10px', padding: '12px', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: '10px', color: '#9ca3af', fontWeight: '700', marginBottom: '2px' } }, 'LOT VALUE'),
        React.createElement('div', { style: { fontSize: '16px', fontWeight: '800', color: '#374151' } }, '₹' + currentTotal.toLocaleString('en-IN'))
      ),
      React.createElement('div', { style: { background: '#f9fafb', borderRadius: '10px', padding: '12px', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: '10px', color: '#9ca3af', fontWeight: '700', marginBottom: '2px' } }, ended ? 'ENDED' : 'TIME LEFT'),
        React.createElement('div', { style: { fontSize: '16px', fontWeight: '800', color: ended ? '#9ca3af' : '#d97706' } }, ended ? '—' : timeLeft(auction.endsAt))
      )
    ),
    React.createElement('div', { style: { fontSize: '13px', color: '#9ca3af', marginBottom: '12px' } }, auction.bidCount + ' bid' + (auction.bidCount != 1 ? 's' : '') + ' • Min increment: ₹' + minIncrement + '/q'),
    msg && React.createElement('div', { style: { background: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b', borderRadius: '8px', padding: '10px', marginBottom: '10px', fontSize: '13px', fontWeight: '600' } }, msg),
    // Bid form
    !ended && user && user.role === 'buyer' && (
      !showBid
        ? React.createElement('button', { onClick: () => { setShowBid(true); setBidAmount(String(minBid)) }, style: { width: '100%', padding: '12px', background: '#166534', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' } },
            '🏷️ Place Bid — Min ₹' + minBid.toLocaleString('en-IN') + '/q'
          )
        : React.createElement('form', { onSubmit: submitBid },
            React.createElement('label', { style: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' } }, 'Your Bid (₹ per quintal)'),
            React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } },
              React.createElement('input', { type: 'number', value: bidAmount, min: minBid, step: '1', onChange: e => setBidAmount(e.target.value), placeholder: 'e.g. ' + minBid, style: { flex: 1, padding: '10px 14px', border: '2px solid #166534', borderRadius: '9px', fontSize: '14px' } }),
              React.createElement('button', { type: 'submit', disabled: bidding, style: { padding: '10px 18px', background: '#166534', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' } }, bidding ? '...' : 'Bid'),
              React.createElement('button', { type: 'button', onClick: () => setShowBid(false), style: { padding: '10px 14px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9px', cursor: 'pointer' } }, '✕')
            ),
            bidAmount && Number(bidAmount) > 0 && React.createElement('div', { style: { fontSize: '13px', color: '#166534', fontWeight: '700' } },
              'Total lot value: ₹' + Math.round(qKg / 100 * Number(bidAmount)).toLocaleString('en-IN')
            )
          )
    ),
    !user && !ended && React.createElement('a', { href: '/login', style: { display: 'block', width: '100%', padding: '12px', background: '#f3f4f6', color: '#374151', textDecoration: 'none', textAlign: 'center', borderRadius: '10px', fontWeight: '600', fontSize: '14px' } }, 'Login as Buyer to Bid'),
    user && user.role === 'farmer' && !ended && React.createElement('p', { style: { fontSize: '13px', color: '#9ca3af', textAlign: 'center' } }, 'Farmers cannot bid on lots.'),
    ended && React.createElement('div', { style: { background: '#f3f4f6', borderRadius: '10px', padding: '12px', textAlign: 'center', fontSize: '14px', color: '#6b7280' } }, 'This auction has ended.')
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
    loadAuctions()
  }, [])

  function loadAuctions() {
    setLoading(true)
    const q = filter !== 'ALL' ? '?status=' + filter : ''
    fetch('/api/auctions' + q).then(r => r.json()).then(d => {
      if (d.success) setAuctions(d.auctions || [])
      else setError(d.error || 'Failed')
      setLoading(false)
    }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { loadAuctions() }, [filter])

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    // Header
    React.createElement('div', { style: { background: 'linear-gradient(135deg,#052e16,#166534)', color: '#fff', padding: '36px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('div', { style: { marginBottom: '6px', fontSize: '13px', color: '#bbf7d0', fontWeight: '600' } }, '🌾 KRISHIFY DIGITAL MANDI'),
        React.createElement('h1', { style: { fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0' } }, '🏷️ Live Auctions'),
        React.createElement('p', { style: { opacity: 0.85, margin: 0, fontSize: '15px' } }, 'Bid on verified whole crop lots — price in ₹ per quintal')
      )
    ),
    React.createElement('div', { className: 'page-container' },
      // Filter tabs
      React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' } },
        [['ACTIVE','🔴 Live Auctions'],['ENDED','Ended'],['ALL','All']].map(([val, label]) =>
          React.createElement('button', { key: val, onClick: () => setFilter(val), style: { padding: '7px 18px', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '600', borderColor: filter===val ? '#166534' : '#d1d5db', background: filter===val ? '#166534' : '#fff', color: filter===val ? '#fff' : '#374151' } }, label)
        )
      ),
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '16px' } }, error),
      loading && React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#9ca3af' } }, 'Loading auctions...'),
      !loading && auctions.length === 0 && React.createElement('div', { style: { textAlign: 'center', padding: '80px 20px' } },
        React.createElement('div', { style: { fontSize: '56px', marginBottom: '16px' } }, '🏷️'),
        React.createElement('h3', { style: { fontSize: '20px', fontWeight: '700', color: '#374151', marginBottom: '8px' } }, 'No auctions found'),
        React.createElement('p', { style: { color: '#9ca3af', fontSize: '14px' } }, filter === 'ACTIVE' ? 'No live auctions at the moment. Check back soon.' : 'No auctions in this category.')
      ),
      !loading && auctions.length > 0 && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' } },
        auctions.map(a => React.createElement(AuctionCard, { key: a.id, auction: a, user, onBid: loadAuctions }))
      )
    )
  )
}

module.exports = AuctionsPage
