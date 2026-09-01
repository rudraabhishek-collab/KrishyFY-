const React = require('react')

function MandiLotDetailPage() {
  const [listing, setListing] = React.useState(null)
  const [inspection, setInspection] = React.useState(null)
  const [quality, setQuality] = React.useState(null)
  const [auction, setAuction] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [user, setUser] = React.useState(null)
  const [bidAmount, setBidAmount] = React.useState('')
  const [bidMsg, setBidMsg] = React.useState('')
  const [bidding, setBidding] = React.useState(false)
  const [id, setId] = React.useState(null)

  React.useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/\/(?:marketplace|mandi-lot)\/([^/]+)/)
    const cropId = match ? match[1] : null
    setId(cropId)
    if (!cropId) { setError('Invalid lot ID'); setLoading(false); return }

    Promise.all([
      fetch('/api/crops?id=' + cropId).then(r => r.json()),
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/crop-quality/' + cropId).then(r => r.json()).catch(() => null),
      fetch('/api/auctions?cropListingId=' + cropId).then(r => r.json()).catch(() => null),
      fetch('/api/inspector/detail?cropListingId=' + cropId).then(r => r.json()).catch(() => null),
    ]).then(([cropData, meData, qualityData, auctionData, inspData]) => {
      if (cropData.success) setListing(cropData.listing)
      else setError(cropData.error || 'Lot not found')
      if (meData.authenticated) setUser(meData.user)
      if (qualityData && qualityData.success) setQuality(qualityData.assessment)
      if (auctionData && auctionData.success && auctionData.auctions && auctionData.auctions.length > 0) {
        setAuction(auctionData.auctions[0])
      }
      if (inspData && inspData.success) setInspection(inspData.inspection)
      setLoading(false)
    }).catch(() => { setError('Failed to load lot details'); setLoading(false) })
  }, [])

  function submitBid(e) {
    e.preventDefault()
    if (!user) { window.location.href = '/login'; return }
    const amt = Number(bidAmount)
    if (!amt || amt <= 0) { setBidMsg('Enter a valid bid amount (₹/quintal)'); return }
    setBidding(true); setBidMsg('')
    fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cropListingId: id, bidPricePerQuintal: amt })
    }).then(r => r.json()).then(d => {
      if (d.success) {
        setBidMsg('✅ Bid placed successfully!')
        setBidAmount('')
        // Refresh auction data
        fetch('/api/auctions?cropListingId=' + id).then(r => r.json()).then(ad => {
          if (ad.success && ad.auctions && ad.auctions.length > 0) setAuction(ad.auctions[0])
        })
      } else setBidMsg('❌ ' + (d.error || 'Failed to place bid'))
      setBidding(false)
    }).catch(() => { setBidMsg('❌ Network error'); setBidding(false) })
  }

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading mandi lot...')
  )

  if (error) return React.createElement('div', { className: 'page-container' },
    React.createElement('div', { className: 'alert-error', style: { marginBottom: '16px' } }, error),
    React.createElement('a', { href: '/marketplace', style: { color: '#166534', textDecoration: 'none' } }, '← Back to Mandi')
  )

  if (!listing) return null

  const qKg = listing.quantityKg || parseInt(listing.quantity) || 0
  const quintals = (qKg / 100).toFixed(1)
  const tonnes = (qKg / 1000).toFixed(2)
  const pricePerQ = listing.expectedPricePerQuintal || listing.expectedPrice
  const estTotal = pricePerQ ? Math.round(qKg / 100 * Number(pricePerQ)) : null

  const currentBid = auction && auction.currentBid ? Number(auction.currentBid) : null
  const startPrice = auction ? Number(auction.startingPrice) : null
  const minIncrement = auction ? Number(auction.minimumIncrement) : 0
  const minBid = currentBid ? currentBid + minIncrement : startPrice || 0
  const currentTotal = currentBid ? Math.round(qKg / 100 * currentBid) : null
  const auctionEnded = auction && new Date(auction.endsAt) < new Date()
  const canBid = user && user.role === 'buyer' && auction && !auctionEnded && auction.status === 'ACTIVE'

  const statusBadge = (s, cls) => React.createElement('span', { className: 'badge ' + cls, style: { fontSize: '12px' } }, s)

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container' },
      React.createElement('a', { href: '/marketplace', style: { color: '#166534', textDecoration: 'none', fontSize: '14px', fontWeight: '600' } }, '← Back to Mandi'),

      // Lot ID header
      React.createElement('div', { style: { marginTop: '16px', marginBottom: '20px' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
          React.createElement('span', { style: { fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace', background: '#f3f4f6', padding: '3px 10px', borderRadius: '6px' } }, 'MANDI LOT #' + listing.id.slice(0, 8).toUpperCase()),
          listing.inspectionStatus === 'APPROVED' && statusBadge('✓ PHYSICALLY VERIFIED', 'badge-green'),
          listing.lotStatus && statusBadge(listing.lotStatus.replace('_', ' '), listing.lotStatus === 'AUCTION_ACTIVE' ? 'badge-blue' : listing.lotStatus === 'SOLD' ? 'badge-gray' : 'badge-yellow')
        )
      ),

      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' } },

        // Main lot info (takes 2 cols)
        React.createElement('div', { style: { gridColumn: 'span 2' } },
          // Lot Details Card
          React.createElement('div', { className: 'card', style: { marginBottom: '20px' } },
            React.createElement('h1', { style: { fontSize: '26px', fontWeight: '900', color: '#111827', margin: '0 0 4px 0' } }, listing.cropName),
            listing.category && React.createElement('span', { style: { background: '#f3f4f6', borderRadius: '6px', padding: '3px 10px', fontSize: '12px', fontWeight: '600', color: '#374151' } }, listing.category),
            listing.description && React.createElement('p', { style: { color: '#6b7280', marginTop: '12px', lineHeight: '1.6', fontSize: '14px' } }, listing.description),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginTop: '20px' } },
              infoCell('📦 Lot Quantity', qKg.toLocaleString('en-IN') + ' kg'),
              infoCell('⚖️ In Quintals', quintals + ' quintals'),
              infoCell('🏋️ In Tonnes', tonnes + ' tonnes'),
              infoCell('📍 Location', listing.location || '—'),
              infoCell('👨‍🌾 Farmer', listing.farmerName || '—'),
              listing.harvestDate && infoCell('📅 Harvest', new Date(listing.harvestDate).toLocaleDateString('en-IN')),
              pricePerQ && infoCell('💰 Expected', '₹' + Number(pricePerQ).toLocaleString('en-IN') + '/q'),
              estTotal && infoCell('📊 Est. Value', '₹' + estTotal.toLocaleString('en-IN'))
            )
          ),

          // Physical Inspection Card
          React.createElement('div', { className: 'card', style: { marginBottom: '20px', borderLeft: '4px solid ' + (inspection && inspection.status === 'APPROVED' ? '#166534' : '#d97706') } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' } },
              React.createElement('span', { style: { fontSize: '22px' } }, '🔍'),
              React.createElement('h2', { style: { fontSize: '17px', fontWeight: '800', margin: 0 } }, 'Physical Quality Inspection'),
              React.createElement('span', { style: { fontSize: '11px', color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' } }, 'OFFICIAL')
            ),
            inspection && inspection.status === 'APPROVED'
              ? React.createElement('div', null,
                  React.createElement('div', { style: { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '14px', marginBottom: '14px' } },
                    React.createElement('div', { style: { fontSize: '16px', fontWeight: '800', color: '#166534' } }, '✓ PHYSICALLY VERIFIED'),
                    React.createElement('div', { style: { fontSize: '13px', color: '#6b7280', marginTop: '2px' } }, 'Official quality verification by certified inspector')
                  ),
                  React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' } },
                    inspection.grade && infoCell('Grade', inspection.grade),
                    inspection.moisturePercentage != null && infoCell('Moisture', inspection.moisturePercentage + '%'),
                    inspection.foreignMatterPercentage != null && infoCell('Foreign Matter', inspection.foreignMatterPercentage + '%'),
                    inspection.damagedPercentage != null && infoCell('Damaged', inspection.damagedPercentage + '%'),
                    inspection.weightKg && infoCell('Verified Weight', inspection.weightKg.toLocaleString('en-IN') + ' kg'),
                    inspection.appearance && infoCell('Appearance', inspection.appearance)
                  ),
                  inspection.remarks && React.createElement('p', { style: { marginTop: '10px', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' } }, '"' + inspection.remarks + '"'),
                  inspection.inspectedAt && React.createElement('p', { style: { marginTop: '8px', fontSize: '12px', color: '#9ca3af' } }, 'Inspected: ' + new Date(inspection.inspectedAt).toLocaleDateString('en-IN'))
                )
              : React.createElement('div', { style: { color: '#9ca3af', fontSize: '14px' } },
                  React.createElement('div', { style: { background: '#fef9c3', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px', color: '#92400e' } },
                    '⏳ ' + (inspection ? 'Inspection ' + inspection.status : 'Physical inspection pending')
                  )
                )
          ),

          // AI Quality Card
          React.createElement('div', { className: 'card', style: { marginBottom: '20px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' } },
              React.createElement('span', { style: { fontSize: '22px' } }, '🤖'),
              React.createElement('h2', { style: { fontSize: '17px', fontWeight: '800', margin: 0 } }, 'AI-Assisted Assessment'),
              React.createElement('span', { style: { fontSize: '11px', color: '#854d0e', background: '#fef9c3', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' } }, 'TEST / DEMO'),
              React.createElement('span', { style: { fontSize: '11px', color: '#6b7280' } }, '— not an official certification')
            ),
            quality
              ? React.createElement('div', null,
                  React.createElement('p', { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '12px', fontStyle: 'italic' } }, 'Physical inspection is the official quality verification. AI provides an additional assessment.'),
                  React.createElement('div', { style: { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' } },
                    React.createElement('div', { style: { textAlign: 'center', background: '#f0fdf4', borderRadius: '12px', padding: '16px 24px' } },
                      React.createElement('div', { style: { fontSize: '40px', fontWeight: '900', color: '#166534' } }, quality.score),
                      React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'Score / 100')
                    ),
                    React.createElement('div', { style: { textAlign: 'center', background: '#f0fdf4', borderRadius: '12px', padding: '16px 24px' } },
                      React.createElement('div', { style: { fontSize: '32px', fontWeight: '900', color: '#166534' } }, quality.grade),
                      React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'AI Grade')
                    ),
                    React.createElement('div', { style: { textAlign: 'center' } },
                      React.createElement('div', { style: { fontSize: '24px', fontWeight: '700', color: '#374151' } }, quality.confidence + '%'),
                      React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'Confidence')
                    )
                  ),
                  quality.observations && React.createElement('p', { style: { fontSize: '14px', color: '#374151', lineHeight: '1.6' } }, quality.observations),
                  React.createElement('p', { style: { fontSize: '11px', color: '#9ca3af', marginTop: '8px' } }, 'Provider: ' + quality.provider + ' • Model: ' + quality.model)
                )
              : React.createElement('div', { style: { color: '#9ca3af', fontSize: '14px', padding: '16px', textAlign: 'center' } },
                  inspection && inspection.status === 'APPROVED'
                    ? 'AI assessment not yet run on this lot.'
                    : '🔒 AI assessment available after physical inspection approval.'
                )
          )
        ),

        // Right column: Auction + Bid
        React.createElement('div', null,
          auction
            ? React.createElement('div', { className: 'card', style: { border: '2px solid ' + (auctionEnded ? '#e5e7eb' : '#166534') } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
                  React.createElement('h2', { style: { fontSize: '18px', fontWeight: '800', margin: 0 } }, '🏷️ Live Auction'),
                  React.createElement('span', { className: 'badge ' + (auctionEnded ? 'badge-gray' : 'badge-green') }, auctionEnded ? 'ENDED' : '🔴 LIVE')
                ),
                React.createElement('div', { style: { background: '#f0fdf4', borderRadius: '10px', padding: '16px', marginBottom: '16px', textAlign: 'center' } },
                  React.createElement('div', { style: { fontSize: '11px', color: '#9ca3af', fontWeight: '600' } }, 'CURRENT HIGHEST BID'),
                  currentBid
                    ? React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: '28px', fontWeight: '900', color: '#166534' } }, '₹' + currentBid.toLocaleString('en-IN') + '/q'),
                        React.createElement('div', { style: { fontSize: '14px', color: '#374151', fontWeight: '700' } }, 'Total: ₹' + (currentTotal || 0).toLocaleString('en-IN'))
                      )
                    : React.createElement('div', { style: { fontSize: '18px', color: '#9ca3af' } }, 'No bids yet — Starting ₹' + startPrice + '/q')
                ),
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', fontSize: '13px' } },
                  React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '10px', textAlign: 'center' } },
                    React.createElement('div', { style: { color: '#9ca3af', fontSize: '11px', fontWeight: '600' } }, 'BIDDERS'),
                    React.createElement('div', { style: { fontWeight: '800', color: '#111827', fontSize: '18px' } }, auction.bidCount || 0)
                  ),
                  React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '10px', textAlign: 'center' } },
                    React.createElement('div', { style: { color: '#9ca3af', fontSize: '11px', fontWeight: '600' } }, 'LOT'),
                    React.createElement('div', { style: { fontWeight: '700', color: '#111827', fontSize: '14px' } }, qKg.toLocaleString('en-IN') + ' kg')
                  )
                ),
                !auctionEnded && React.createElement('div', { style: { marginBottom: '16px', fontSize: '13px', color: '#6b7280' } },
                  'Ends: ' + new Date(auction.endsAt).toLocaleString('en-IN')
                ),
                bidMsg && React.createElement('div', { className: bidMsg.startsWith('✅') ? 'alert-success' : 'alert-error', style: { marginBottom: '12px', fontSize: '13px' } }, bidMsg),
                canBid && React.createElement('form', { onSubmit: submitBid },
                  React.createElement('label', { className: 'form-label' }, 'Your Bid (₹ per quintal)'),
                  React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '8px' } }, 'Minimum: ₹' + minBid.toLocaleString('en-IN') + '/q'),
                  React.createElement('input', {
                    type: 'number', className: 'input-field', value: bidAmount, min: minBid, step: '0.01',
                    onChange: e => setBidAmount(e.target.value), placeholder: 'e.g. ' + minBid,
                    style: { marginBottom: '8px' }
                  }),
                  bidAmount && React.createElement('div', { style: { fontSize: '13px', color: '#166534', fontWeight: '700', marginBottom: '10px' } },
                    'Total lot value: ₹' + Math.round(qKg / 100 * Number(bidAmount)).toLocaleString('en-IN')
                  ),
                  React.createElement('button', { type: 'submit', className: 'btn-primary', style: { width: '100%', padding: '12px' }, disabled: bidding },
                    bidding ? 'Placing bid...' : '🏷️ Place Bid'
                  )
                ),
                !user && !auctionEnded && React.createElement('a', { href: '/login', className: 'btn-primary', style: { display: 'block', textAlign: 'center' } }, 'Login to Bid'),
                user && user.role === 'farmer' && !auctionEnded && React.createElement('p', { style: { fontSize: '13px', color: '#9ca3af', textAlign: 'center' } }, 'Farmers cannot bid on lots.'),
                auctionEnded && React.createElement('div', { style: { background: '#f3f4f6', borderRadius: '8px', padding: '12px', textAlign: 'center', fontSize: '14px', color: '#6b7280' } }, 'This auction has ended.')
              )
            : listing.lotStatus === 'QUALITY_VERIFIED' || listing.lotStatus === 'AUCTION_READY'
              ? React.createElement('div', { className: 'card', style: { border: '2px solid #dcfce7', textAlign: 'center', padding: '32px' } },
                  React.createElement('div', { style: { fontSize: '36px', marginBottom: '12px' } }, '✅'),
                  React.createElement('h3', { style: { color: '#166534', margin: '0 0 8px 0' } }, 'Quality Verified'),
                  React.createElement('p', { style: { color: '#6b7280', fontSize: '14px' } }, 'This lot has passed physical inspection. Auction coming soon.')
                )
              : React.createElement('div', { className: 'card', style: { textAlign: 'center', padding: '32px' } },
                  React.createElement('div', { style: { fontSize: '36px', marginBottom: '12px' } }, '⏳'),
                  React.createElement('h3', { style: { margin: '0 0 8px 0' } }, 'Awaiting Verification'),
                  React.createElement('p', { style: { color: '#6b7280', fontSize: '14px' } }, 'This lot is undergoing physical quality inspection before auction.')
                )
        )
      )
    )
  )
}

function infoCell(label, value) {
  return React.createElement('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '12px' } },
    React.createElement('div', { style: { fontSize: '11px', color: '#9ca3af', fontWeight: '600', marginBottom: '3px' } }, label),
    React.createElement('div', { style: { fontWeight: '700', color: '#111827', fontSize: '14px' } }, value)
  )
}

module.exports = MandiLotDetailPage
