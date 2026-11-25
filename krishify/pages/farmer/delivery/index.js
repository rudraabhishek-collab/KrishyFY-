const React = require('react')

const DELIVERY_STATUS = { CREATED: 'badge-gray', PACKED: 'badge-yellow', DISPATCHED: 'badge-blue', IN_TRANSIT: 'badge-blue', OUT_FOR_DELIVERY: 'badge-yellow', DELIVERED: 'badge-green', CANCELLED: 'badge-red' }
const STATUS_LABELS = { CREATED: 'Created', PACKED: 'Packed', DISPATCHED: 'Dispatched', IN_TRANSIT: 'In Transit', OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' }
const STATUS_STEPS = ['CREATED', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED']
const NEXT_STATUS = {
  CREATED: 'PACKED',
  PACKED: 'DISPATCHED',
  DISPATCHED: 'IN_TRANSIT',
  IN_TRANSIT: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
}

function FarmerDeliveryPage() {
  const [deliveries, setDeliveries] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [msg, setMsg] = React.useState('')
  const [updating, setUpdating] = React.useState({})
  const [meta, setMeta] = React.useState({})

  React.useEffect(() => {
    fetch('/api/delivery', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setDeliveries(data.deliveries || [])
        else if (data.error?.includes('Unauthenticated')) window.location.href = '/login'
        else setError(data.error || 'Failed to load')
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  function advanceDelivery(d, nextStatus) {
    setUpdating(u => ({ ...u, [d.id]: true })); setMsg('')
    const m = meta[d.id] || {}
    fetch(`/api/delivery/${d.orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        status: nextStatus,
        trackingNumber: m.trackingNumber || d.trackingNumber || undefined,
        deliveryPartner: m.deliveryPartner || d.deliveryPartner || undefined,
      })
    }).then(r => r.json()).then(res => {
      if (res.success && res.delivery) {
        setDeliveries(prev => prev.map(x => x.id === d.id ? { ...x, ...res.delivery } : x))
        setMsg(`✅ Delivery updated to ${STATUS_LABELS[nextStatus] || nextStatus}`)
      } else {
        setMsg(`❌ ${res.error || 'Failed to update delivery'}`)
      }
      setUpdating(u => ({ ...u, [d.id]: false }))
    }).catch(() => { setMsg('❌ Network error'); setUpdating(u => ({ ...u, [d.id]: false })) })
  }

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading deliveries...')
  )

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container' },
      React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' } }, '🚚 Delivery Management'),
      React.createElement('p', { style: { color: '#6b7280', margin: '0 0 24px 0', fontSize: '14px' } }, 'Track and update deliveries for your orders'),
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '20px' } }, error),
      msg && React.createElement('div', { className: msg.startsWith('✅') ? 'alert-success' : 'alert-error', style: { marginBottom: '20px' } }, msg),
      deliveries.length === 0 && !error && React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'empty-icon' }, '🚚'),
        React.createElement('h3', null, 'No deliveries yet'),
        React.createElement('p', null, 'Initialize a delivery from your Farmer Orders page when an order is confirmed.')
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
        deliveries.map(d => {
          const stepIdx = STATUS_STEPS.indexOf(d.status)
          const next = NEXT_STATUS[d.status]
          const m = meta[d.id] || {}
          return React.createElement('div', { key: d.id, className: 'card' },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' } },
              React.createElement('div', null,
                React.createElement('h3', { style: { margin: '0 0 4px 0', fontWeight: '700' } }, (d.cropName ? d.cropName + ' — ' : '') + `Order #${d.orderId ? d.orderId.slice(0, 8).toUpperCase() : 'N/A'}`),
                d.buyerName && React.createElement('p', { style: { margin: '0 0 2px 0', color: '#6b7280', fontSize: '13px' } }, `Buyer: ${d.buyerName}`),
                d.trackingNumber && React.createElement('p', { style: { margin: 0, color: '#6b7280', fontSize: '13px' } }, `Tracking: ${d.trackingNumber}`)
              ),
              React.createElement('span', { className: `badge ${DELIVERY_STATUS[d.status] || 'badge-gray'}` }, STATUS_LABELS[d.status] || d.status)
            ),
            d.status !== 'CANCELLED' && React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0', marginBottom: '16px', overflowX: 'auto' } },
              STATUS_STEPS.map((step, i) => {
                const done = i <= stepIdx
                return React.createElement('div', { key: step, style: { display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' } },
                  React.createElement('div', {
                    style: { width: '28px', height: '28px', borderRadius: '50%', background: done ? '#166534' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }
                  }, React.createElement('span', { style: { color: done ? '#fff' : '#9ca3af', fontSize: '12px', fontWeight: '700' } }, i + 1)),
                  i < STATUS_STEPS.length - 1 && React.createElement('div', { style: { height: '3px', flex: 1, background: i < stepIdx ? '#166534' : '#e5e7eb', transition: 'background 0.2s', minWidth: '20px' } })
                )
              })
            ),
            React.createElement('div', { style: { fontSize: '13px', color: '#6b7280', display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: next ? '14px' : '0' } },
              d.deliveryPartner && React.createElement('span', null, `Carrier: ${d.deliveryPartner}`),
              d.estimatedDeliveryDate && React.createElement('span', null, `ETA: ${new Date(d.estimatedDeliveryDate).toLocaleDateString('en-IN')}`),
              d.deliveredAt && React.createElement('span', { style: { color: '#166534', fontWeight: '600' } }, `Delivered: ${new Date(d.deliveredAt).toLocaleDateString('en-IN')}`),
              React.createElement('a', { href: `/orders/${d.orderId}/delivery`, style: { color: '#166534', fontWeight: '600', textDecoration: 'none' } }, 'View Timeline →')
            ),
            next && React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' } },
              !d.trackingNumber && React.createElement('input', {
                type: 'text', placeholder: 'Tracking # (optional)', value: m.trackingNumber || '',
                onChange: e => setMeta(prev => ({ ...prev, [d.id]: { ...prev[d.id], trackingNumber: e.target.value } })),
                style: { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }
              }),
              !d.deliveryPartner && React.createElement('input', {
                type: 'text', placeholder: 'Carrier (optional)', value: m.deliveryPartner || '',
                onChange: e => setMeta(prev => ({ ...prev, [d.id]: { ...prev[d.id], deliveryPartner: e.target.value } })),
                style: { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px' }
              }),
              React.createElement('button', {
                onClick: () => advanceDelivery(d, next), disabled: updating[d.id],
                style: { padding: '7px 14px', background: '#166534', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }
              }, updating[d.id] ? 'Updating...' : `→ Mark ${STATUS_LABELS[next]}`)
            )
          )
        })
      )
    )
  )
}

module.exports = FarmerDeliveryPage
