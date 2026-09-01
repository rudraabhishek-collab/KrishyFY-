const React = require('react')

function timeLeft(endsAt) {
  const diff = new Date(endsAt) - new Date()
  if (diff <= 0) return 'Ended'
  const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return Math.floor(h / 24) + 'd ' + (h % 24) + 'h'
  return h + 'h ' + m + 'm'
}

function FarmerBidsPage() {
  const [auctions, setAuctions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [bidsMap, setBidsMap] = React.useState({})
  const [expanded, setExpanded] = React.useState(null)
  const [form, setForm] = React.useState({ cropListingId: '', startingPrice: '', minimumIncrement: '', endsAt: '' })
  const [eligibleCrops, setEligibleCrops] = React.useState([])
  const [createMsg, setCreateMsg] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [showCreate, setShowCreate] = React.useState(false)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/auctions', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/crops/mine', { credentials: 'include' }).then(r => r.json())
    ]).then(([aData, cData]) => {
      if (aData.success) setAuctions(aData.auctions || [])
      else if (aData.error?.includes('Unauthenticated')) window.location.href = '/login'
      else setError(aData.error || 'Failed')
      if (cData.success) {
        // Only QUALITY_VERIFIED or AUCTION_READY lots can start an auction
        const eligible = (cData.listings || []).filter(l =>
          l.lotStatus === 'QUALITY_VERIFIED' || l.lotStatus === 'AUCTION_READY' || l.lotStatus === 'AUCTION_ACTIVE'
        )
        setEligibleCrops(eligible)
      }
      setLoading(false)
    }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  function toggleBids(auctionId) {
    if (expanded === auctionId) { setExpanded(null); return }
    setExpanded(auctionId)
    if (bidsMap[auctionId]) return
    fetch('/api/bids?auctionId=' + auctionId, { credentials: 'include' })
      .then(r => r.json()).then(d => { if (d.success) setBidsMap(m => ({ ...m, [auctionId]: d.bids })) })
  }

  function createAuction(e) {
    e.preventDefault()
    setCreateMsg(''); setCreating(true)
    const selectedCrop = eligibleCrops.find(c => c.id === form.cropListingId)
    const qKg = selectedCrop?.quantityKg || 0
    const startQ = Number(form.startingPrice)
    const incQ = Number(form.minimumIncrement)
    if (!startQ || startQ <= 0) { setCreateMsg('❌ Starting price required (₹/quintal)'); setCreating(false); return }
    if (!incQ || incQ <= 0) { setCreateMsg('❌ Minimum increment required (₹/quintal)'); setCreating(false); return }
    fetch('/api/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cropListingId: form.cropListingId, startingPrice: startQ, minimumIncrement: incQ, endsAt: form.endsAt })
    }).then(r => r.json()).then(d => {
      if (d.success) {
        setCreateMsg('✅ Auction created!')
        setShowCreate(false)
        setAuctions(a => [d.auction, ...a])
        setForm({ cropListingId: '', startingPrice: '', minimumIncrement: '', endsAt: '' })
      } else setCreateMsg('❌ ' + d.error)
      setCreating(false)
    }).catch(() => { setCreateMsg('❌ Network error'); setCreating(false) })
  }

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading...')
  )

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container' },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' } },
        React.createElement('div', null,
          React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' } }, '🏷️ My Auctions'),
          React.createElement('p', { style: { color: '#6b7280', margin: 0, fontSize: '14px' } }, 'Create and manage auctions on your verified lots')
        ),
        React.createElement('button', { onClick: () => setShowCreate(!showCreate), style: { background: '#166534', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' } }, showCreate ? '✕ Cancel' : '+ Create Auction')
      ),
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '16px' } }, error),

      // Create auction form
      showCreate && React.createElement('div', { style: { background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '14px', padding: '24px', marginBottom: '24px' } },
        React.createElement('h2', { style: { fontSize: '18px', fontWeight: '800', color: '#166534', margin: '0 0 16px 0' } }, '🏷️ Create New Auction'),
        React.createElement('p', { style: { fontSize: '13px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.6' } }, 'Only quality-verified lots can be auctioned. Prices are in ₹ per quintal. The server calculates total lot value.'),
        createMsg && React.createElement('div', { className: createMsg.startsWith('✅') ? 'alert-success' : 'alert-error', style: { marginBottom: '12px' } }, createMsg),
        eligibleCrops.length === 0
          ? React.createElement('div', { style: { textAlign: 'center', padding: '24px', color: '#6b7280' } },
              React.createElement('p', { style: { fontWeight: '600' } }, '⏳ No quality-verified lots available'),
              React.createElement('p', { style: { fontSize: '13px' } }, 'Submit your lots for physical inspection first. Once approved, you can create auctions.'),
              React.createElement('a', { href: '/farmer/crops', style: { color: '#166534', fontWeight: '600', fontSize: '14px' } }, 'Go to My Lots →')
            )
          : React.createElement('form', { onSubmit: createAuction, style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' } },
              React.createElement('div', null,
                React.createElement('label', { className: 'form-label' }, 'Crop Lot *'),
                React.createElement('select', { className: 'input-field', value: form.cropListingId, onChange: e => setForm(f => ({ ...f, cropListingId: e.target.value })), required: true },
                  React.createElement('option', { value: '' }, 'Select verified lot...'),
                  eligibleCrops.map(c => {
                    const qKg = c.quantityKg || 0
                    return React.createElement('option', { key: c.id, value: c.id }, c.cropName + ' — ' + qKg.toLocaleString('en-IN') + 'kg (' + (qKg/100).toFixed(0) + 'q)')
                  })
                )
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'form-label' }, 'Starting Price (₹/quintal) *'),
                React.createElement('input', { type: 'number', className: 'input-field', min: 1, placeholder: 'e.g. 2500', value: form.startingPrice, onChange: e => setForm(f => ({ ...f, startingPrice: e.target.value })), required: true })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'form-label' }, 'Min Increment (₹/quintal) *'),
                React.createElement('input', { type: 'number', className: 'input-field', min: 1, placeholder: 'e.g. 25', value: form.minimumIncrement, onChange: e => setForm(f => ({ ...f, minimumIncrement: e.target.value })), required: true })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'form-label' }, 'Auction Ends At *'),
                React.createElement('input', { type: 'datetime-local', className: 'input-field', value: form.endsAt, onChange: e => setForm(f => ({ ...f, endsAt: e.target.value })), required: true })
              ),
              React.createElement('div', { style: { gridColumn: '1 / -1' } },
                form.cropListingId && form.startingPrice && React.createElement('div', { style: { background: '#dcfce7', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px', color: '#166534', fontWeight: '600' } }, () => {
                  const crop = eligibleCrops.find(c => c.id === form.cropListingId)
                  const total = crop ? Math.round(crop.quantityKg / 100 * Number(form.startingPrice)) : 0
                  return '📊 Starting lot value: ₹' + total.toLocaleString('en-IN') + ' (' + (crop?.quantityKg/100).toFixed(0) + 'q × ₹' + form.startingPrice + '/q)'
                })(),
                React.createElement('button', { type: 'submit', disabled: creating, style: { padding: '11px 24px', background: '#166534', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' } }, creating ? 'Creating...' : '🏷️ Start Auction')
              )
            )
      ),

      // Auctions list
      auctions.length === 0 && !showCreate && React.createElement('div', { style: { textAlign: 'center', padding: '80px 20px' } },
        React.createElement('div', { style: { fontSize: '56px', marginBottom: '16px' } }, '🏷️'),
        React.createElement('h3', { style: { fontSize: '20px', fontWeight: '700', color: '#374151', marginBottom: '8px' } }, 'No auctions yet'),
        React.createElement('p', { style: { color: '#9ca3af', fontSize: '14px', marginBottom: '20px' } }, 'Create an auction on a quality-verified lot.'),
        React.createElement('button', { onClick: () => setShowCreate(true), style: { background: '#166534', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 24px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' } }, '+ Create First Auction')
      ),

      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        auctions.map(a => {
          const qKg = a.quantityKg || 0
          const quintals = (qKg / 100).toFixed(1)
          const currentBid = a.currentBid ? Number(a.currentBid) : Number(a.startingPrice)
          const currentTotal = Math.round(qKg / 100 * currentBid)
          const ended = new Date(a.endsAt) <= new Date()
          const bids = bidsMap[a.id]
          return React.createElement('div', { key: a.id, style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' } },
              React.createElement('div', null,
                React.createElement('h3', { style: { margin: '0 0 4px 0', fontWeight: '800', fontSize: '18px' } }, a.cropName),
                React.createElement('span', { style: { fontSize: '13px', color: '#6b7280' } }, qKg.toLocaleString('en-IN') + ' kg (' + quintals + 'q) • ' + (a.bidCount || 0) + ' bids')
              ),
              React.createElement('div', { style: { textAlign: 'right' } },
                React.createElement('div', { style: { fontSize: '20px', fontWeight: '900', color: '#166534' } }, '₹' + currentBid.toLocaleString('en-IN') + '/q'),
                React.createElement('div', { style: { fontSize: '13px', color: '#6b7280' } }, 'Lot: ₹' + currentTotal.toLocaleString('en-IN')),
                React.createElement('span', { style: { background: ended ? '#f3f4f6' : '#dcfce7', color: ended ? '#6b7280' : '#166534', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' } }, ended ? 'ENDED' : '🔴 LIVE • ' + timeLeft(a.endsAt))
              )
            ),
            React.createElement('button', { onClick: () => toggleBids(a.id), style: { background: 'none', border: '1px solid #d1d5db', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: '500' } },
              expanded === a.id ? '▲ Hide Bids' : '▼ View Bids (' + (a.bidCount || 0) + ')'
            ),
            expanded === a.id && React.createElement('div', { style: { marginTop: '14px', borderTop: '1px solid #f3f4f6', paddingTop: '14px' } },
              !bids ? React.createElement('p', { style: { color: '#9ca3af', fontSize: '13px' } }, 'Loading...') :
              bids.length === 0 ? React.createElement('p', { style: { color: '#9ca3af', fontSize: '13px' } }, 'No bids yet.') :
              React.createElement('div', { style: { overflowX: 'auto' } },
                React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
                  React.createElement('thead', null, React.createElement('tr', { style: { background: '#f9fafb' } },
                    ['#', 'Buyer', 'Bid/Quintal', 'Total Lot Value', 'Time'].map(h => React.createElement('th', { key: h, style: { padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' } }, h))
                  )),
                  React.createElement('tbody', null,
                    bids.map((b, i) => React.createElement('tr', { key: b.id, style: { borderTop: '1px solid #f3f4f6' } },
                      React.createElement('td', { style: { padding: '10px 12px', fontWeight: '700', color: i === 0 ? '#166534' : '#374151' } }, i === 0 ? '🏆' : i + 1),
                      React.createElement('td', { style: { padding: '10px 12px' } }, b.buyerName),
                      React.createElement('td', { style: { padding: '10px 12px', fontWeight: '800', color: '#166534' } }, '₹' + Number(b.amount).toLocaleString('en-IN') + '/q'),
                      React.createElement('td', { style: { padding: '10px 12px', fontWeight: '700' } }, '₹' + Math.round(qKg / 100 * Number(b.amount)).toLocaleString('en-IN')),
                      React.createElement('td', { style: { padding: '10px 12px', color: '#9ca3af' } }, new Date(b.createdAt).toLocaleString('en-IN'))
                    ))
                  )
                )
              )
            )
          )
        })
      )
    )
  )
}

module.exports = FarmerBidsPage
