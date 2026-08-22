const React = require('react')

function timeLeft(endsAt) {
  const diff = new Date(endsAt) - new Date()
  if (diff <= 0) return 'Ended'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  return `${h}h ${m}m`
}

function FarmerBidsPage() {
  const [auctions, setAuctions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [bidsMap, setBidsMap] = React.useState({})
  const [expandedAuction, setExpandedAuction] = React.useState(null)
  const [createForm, setCreateForm] = React.useState({ cropListingId: '', startingPrice: '', minimumIncrement: '', endsAt: '' })
  const [crops, setCrops] = React.useState([])
  const [createMsg, setCreateMsg] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [showCreate, setShowCreate] = React.useState(false)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/auctions', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/crops/mine', { credentials: 'include' }).then(r => r.json())
    ]).then(([auctionData, cropData]) => {
      if (auctionData.success) setAuctions(auctionData.auctions || [])
      else if (auctionData.error?.includes('Unauthenticated')) window.location.href = '/login'
      else setError(auctionData.error || 'Failed to load')
      if (cropData.success) setCrops(cropData.listings?.filter(l => l.status === 'ACTIVE') || [])
      setLoading(false)
    }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  function loadBids(auctionId) {
    if (expandedAuction === auctionId) { setExpandedAuction(null); return }
    setExpandedAuction(auctionId)
    if (bidsMap[auctionId]) return
    fetch(`/api/bids?auctionId=${auctionId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.success) setBidsMap(m => ({ ...m, [auctionId]: data.bids })) })
  }

  function createAuction(e) {
    e.preventDefault()
    setCreateMsg(''); setCreating(true)
    // Set endsAt to end of provided datetime
    fetch('/api/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...createForm, startingPrice: Number(createForm.startingPrice), minimumIncrement: Number(createForm.minimumIncrement) })
    }).then(r => r.json()).then(data => {
      if (data.success) {
        setCreateMsg('✅ Auction created!')
        setShowCreate(false)
        setAuctions(a => [data.auction, ...a])
        setCreateForm({ cropListingId: '', startingPrice: '', minimumIncrement: '', endsAt: '' })
      } else setCreateMsg(`❌ ${data.error}`)
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
          React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' } }, '🏷️ My Auctions & Bids'),
          React.createElement('p', { style: { color: '#6b7280', margin: 0, fontSize: '14px' } }, 'Manage auctions on your crops')
        ),
        React.createElement('button', { className: 'btn-primary', onClick: () => setShowCreate(!showCreate) }, '+ Create Auction')
      ),
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '20px' } }, error),
      // Create form
      showCreate && React.createElement('div', { className: 'card', style: { marginBottom: '24px', background: '#f0fdf4', border: '1px solid #86efac' } },
        React.createElement('h3', { style: { margin: '0 0 16px 0', color: '#166534' } }, '🏷️ Create New Auction'),
        createMsg && React.createElement('div', { className: createMsg.startsWith('✅') ? 'alert-success' : 'alert-error', style: { marginBottom: '12px' } }, createMsg),
        crops.length === 0 ? React.createElement('p', { style: { color: '#6b7280' } }, 'No active crop listings. Add a crop first.') :
        React.createElement('form', { onSubmit: createAuction, style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' } },
          React.createElement('div', null,
            React.createElement('label', { className: 'form-label' }, 'Crop Listing'),
            React.createElement('select', { className: 'input-field', value: createForm.cropListingId, onChange: e => setCreateForm(f => ({ ...f, cropListingId: e.target.value })), required: true },
              React.createElement('option', { value: '' }, 'Select crop...'),
              crops.map(c => React.createElement('option', { key: c.id, value: c.id }, `${c.cropName} (${c.quantity} ${c.unit})`))
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'form-label' }, 'Starting Price (₹)'),
            React.createElement('input', { type: 'number', className: 'input-field', min: 1, placeholder: '500', value: createForm.startingPrice, onChange: e => setCreateForm(f => ({ ...f, startingPrice: e.target.value })), required: true })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'form-label' }, 'Min Increment (₹)'),
            React.createElement('input', { type: 'number', className: 'input-field', min: 1, placeholder: '50', value: createForm.minimumIncrement, onChange: e => setCreateForm(f => ({ ...f, minimumIncrement: e.target.value })), required: true })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'form-label' }, 'Ends At'),
            React.createElement('input', { type: 'datetime-local', className: 'input-field', value: createForm.endsAt, onChange: e => setCreateForm(f => ({ ...f, endsAt: e.target.value })), required: true })
          ),
          React.createElement('div', { style: { gridColumn: '1 / -1', display: 'flex', gap: '8px' } },
            React.createElement('button', { type: 'submit', className: 'btn-primary', disabled: creating }, creating ? 'Creating...' : 'Create Auction'),
            React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowCreate(false) }, 'Cancel')
          )
        )
      ),
      auctions.length === 0 && !error && React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'empty-icon' }, '🏷️'),
        React.createElement('h3', null, 'No auctions yet'),
        React.createElement('p', null, 'Create an auction on one of your crop listings.')
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        auctions.map(a => {
          const ended = new Date(a.endsAt) <= new Date()
          const bids = bidsMap[a.id]
          return React.createElement('div', { key: a.id, className: 'card' },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' } },
              React.createElement('div', null,
                React.createElement('h3', { style: { margin: '0 0 4px 0', fontWeight: '700', fontSize: '17px' } }, a.cropName),
                React.createElement('span', { className: `badge ${ended ? 'badge-gray' : 'badge-green'}` }, ended ? 'Ended' : '🔴 Live'),
                React.createElement('span', { style: { marginLeft: '8px', fontSize: '13px', color: '#6b7280' } }, `${a.bidCount} bid${a.bidCount != 1 ? 's' : ''}`)
              ),
              React.createElement('div', { style: { textAlign: 'right' } },
                React.createElement('div', { style: { fontSize: '18px', fontWeight: '800', color: '#166534' } },
                  `₹${a.currentBid ? Number(a.currentBid).toLocaleString('en-IN') : Number(a.startingPrice).toLocaleString('en-IN')}`
                ),
                React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af' } }, ended ? `Ended ${new Date(a.endsAt).toLocaleDateString('en-IN')}` : `Ends in ${timeLeft(a.endsAt)}`)
              )
            ),
            React.createElement('button', {
              onClick: () => loadBids(a.id),
              style: { marginTop: '10px', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', color: '#374151' }
            }, expandedAuction === a.id ? '▲ Hide bids' : '▼ View bids'),
            expandedAuction === a.id && React.createElement('div', { style: { marginTop: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' } },
              !bids ? React.createElement('p', { style: { color: '#9ca3af', fontSize: '13px' } }, 'Loading...') :
              bids.length === 0 ? React.createElement('p', { style: { color: '#9ca3af', fontSize: '13px' } }, 'No bids yet.') :
              React.createElement('div', { className: 'table-container' },
                React.createElement('table', null,
                  React.createElement('thead', null, React.createElement('tr', null,
                    React.createElement('th', null, 'Buyer'), React.createElement('th', null, 'Amount'), React.createElement('th', null, 'Time')
                  )),
                  React.createElement('tbody', null,
                    bids.map((b, i) => React.createElement('tr', { key: b.id },
                      React.createElement('td', null, i === 0 ? React.createElement('span', null, '🏆 ', b.buyerName) : b.buyerName),
                      React.createElement('td', { style: { fontWeight: '600', color: '#166534' } }, `₹${Number(b.amount).toLocaleString('en-IN')}`),
                      React.createElement('td', { style: { color: '#9ca3af', fontSize: '12px' } }, new Date(b.createdAt).toLocaleString('en-IN'))
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
