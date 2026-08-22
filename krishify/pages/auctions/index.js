const React = require('react')

function timeLeft(endsAt) {
  const diff = new Date(endsAt) - new Date()
  if (diff <= 0) return 'Ended'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function AuctionCard({ auction, user, onBid }) {
  const [bidAmount, setBidAmount] = React.useState('')
  const [bidding, setBidding] = React.useState(false)
  const [msg, setMsg] = React.useState('')
  const [showBid, setShowBid] = React.useState(false)

  const currentBid = auction.currentBid ? Number(auction.currentBid) : Number(auction.startingPrice)
  const minBid = currentBid + Number(auction.minimumIncrement)
  const ended = new Date(auction.endsAt) <= new Date()

  function submitBid(e) {
    e.preventDefault()
    if (!bidAmount || Number(bidAmount) < minBid) { setMsg(`Minimum bid: ₹${minBid}`); return }
    setBidding(true); setMsg('')
    fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ auctionId: auction.id, amount: Number(bidAmount) })
    }).then(r => r.json()).then(data => {
      if (data.success) { setMsg('✅ Bid placed!'); setBidAmount(''); setShowBid(false); onBid() }
      else setMsg(`❌ ${data.error}`)
      setBidding(false)
    }).catch(() => { setMsg('❌ Network error'); setBidding(false) })
  }

  return React.createElement('div', { className: 'card' },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' } },
      React.createElement('div', null,
        React.createElement('h3', { style: { margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700' } }, auction.cropName),
        React.createElement('span', { style: { background: '#f3f4f6', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', color: '#6b7280' } }, auction.category)
      ),
      React.createElement('span', {
        className: `badge ${ended ? 'badge-gray' : 'badge-green'}`,
      }, ended ? 'Ended' : '🔴 Live')
    ),
    React.createElement('div', { style: { display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' } },
      React.createElement('div', { style: { background: '#f0fdf4', borderRadius: '8px', padding: '10px 14px', flex: 1 } },
        React.createElement('div', { style: { fontSize: '11px', color: '#9ca3af', fontWeight: '600' } }, 'CURRENT BID'),
        React.createElement('div', { style: { fontSize: '22px', fontWeight: '800', color: '#166534' } }, `₹${Number(currentBid).toLocaleString('en-IN')}`)
      ),
      React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '10px 14px', flex: 1 } },
        React.createElement('div', { style: { fontSize: '11px', color: '#9ca3af', fontWeight: '600' } }, 'TIME LEFT'),
        React.createElement('div', { style: { fontSize: '18px', fontWeight: '700', color: ended ? '#9ca3af' : '#d97706' } }, timeLeft(auction.endsAt))
      )
    ),
    React.createElement('div', { style: { fontSize: '13px', color: '#6b7280', marginBottom: '12px' } },
      React.createElement('span', null, `📦 ${auction.quantity} ${auction.unit}`),
      React.createElement('span', { style: { margin: '0 8px' } }, '•'),
      React.createElement('span', null, `📍 ${auction.location}`),
      React.createElement('span', { style: { margin: '0 8px' } }, '•'),
      React.createElement('span', null, `👥 ${auction.bidCount} bid${auction.bidCount != 1 ? 's' : ''}`)
    ),
    msg && React.createElement('div', { className: msg.startsWith('✅') ? 'alert-success' : 'alert-error', style: { marginBottom: '10px', fontSize: '13px' } }, msg),
    !ended && user && user.role === 'buyer' && React.createElement('div', null,
      !showBid ? React.createElement('button', {
        className: 'btn-primary', style: { width: '100%' },
        onClick: () => { setShowBid(true); setBidAmount(String(minBid)) }
      }, `Place Bid (min ₹${minBid.toLocaleString('en-IN')})`) :
      React.createElement('form', { onSubmit: submitBid, style: { display: 'flex', gap: '8px' } },
        React.createElement('input', {
          type: 'number', className: 'input-field', value: bidAmount, min: minBid,
          onChange: e => setBidAmount(e.target.value), style: { flex: 1 },
          placeholder: `Min ₹${minBid}`
        }),
        React.createElement('button', { type: 'submit', className: 'btn-primary', disabled: bidding }, bidding ? '...' : 'Bid'),
        React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowBid(false) }, '✕')
      )
    ),
    !user && !ended && React.createElement('a', { href: '/login', className: 'btn-outline', style: { display: 'block', textAlign: 'center' } }, 'Login to Bid'),
    user && user.role === 'farmer' && !ended && React.createElement('p', { style: { fontSize: '13px', color: '#9ca3af', textAlign: 'center' } }, 'Farmers cannot bid on auctions.')
  )
}

function AuctionsPage() {
  const [auctions, setAuctions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [user, setUser] = React.useState(null)
  const [filter, setFilter] = React.useState('ACTIVE')

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.authenticated) setUser(d.user) })
    loadAuctions()
  }, [])

  function loadAuctions() {
    setLoading(true)
    const params = filter !== 'ALL' ? `?status=${filter}` : ''
    fetch(`/api/auctions${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setAuctions(data.auctions || [])
        else setError(data.error || 'Failed to load')
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { loadAuctions() }, [filter])

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', color: '#fff', padding: '32px 20px', textAlign: 'center' } },
      React.createElement('h1', { style: { fontSize: '30px', fontWeight: '800', margin: '0 0 8px 0' } }, '🏷️ Auctions'),
      React.createElement('p', { style: { opacity: 0.9, margin: 0 } }, 'Bid on fresh produce directly from farmers')
    ),
    React.createElement('div', { className: 'page-container' },
      React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '24px' } },
        ['ACTIVE', 'ENDED', 'ALL'].map(f =>
          React.createElement('button', {
            key: f, onClick: () => setFilter(f),
            style: { padding: '6px 16px', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.15s', borderColor: filter === f ? '#166534' : '#d1d5db', background: filter === f ? '#166534' : '#fff', color: filter === f ? '#fff' : '#374151' }
          }, f === 'ACTIVE' ? '🔴 Live' : f === 'ENDED' ? 'Ended' : 'All')
        )
      ),
      loading && React.createElement('div', { style: { textAlign: 'center', padding: '60px' } },
        React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
        React.createElement('p', { style: { color: '#6b7280' } }, 'Loading auctions...')
      ),
      error && React.createElement('div', { className: 'alert-error' }, error),
      !loading && auctions.length === 0 && React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'empty-icon' }, '🏷️'),
        React.createElement('h3', null, 'No auctions found'),
        React.createElement('p', null, filter === 'ACTIVE' ? 'No live auctions right now. Check back soon.' : 'No auctions in this category.')
      ),
      !loading && auctions.length > 0 && React.createElement('div', { className: 'grid-2' },
        auctions.map(a => React.createElement(AuctionCard, { key: a.id, auction: a, user, onBid: loadAuctions }))
      )
    )
  )
}

module.exports = AuctionsPage
