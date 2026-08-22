const React = require('react')

function NewReviewPage() {
  const [orderId, setOrderId] = React.useState(null)
  const [order, setOrder] = React.useState(null)
  const [rating, setRating] = React.useState(5)
  const [comment, setComment] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState(false)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oid = params.get('orderId')
    if (!oid) { setError('No order specified'); setLoading(false); return }
    setOrderId(oid)
    fetch(`/api/orders/${oid}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setOrder(d.order)
        else setError(d.error || 'Order not found')
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }, [])

  function submit(e) {
    e.preventDefault()
    setError(''); setSubmitting(true)
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ orderId, rating, comment })
    }).then(r => r.json()).then(d => {
      if (d.success) { setSuccess(true); setTimeout(() => { window.location.href = '/orders' }, 2000) }
      else setError(d.error || 'Failed to submit')
      setSubmitting(false)
    }).catch(() => { setError('Network error'); setSubmitting(false) })
  }

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px', color: '#9ca3af' } }, 'Loading...')

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' } },
    React.createElement('div', { style: { background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '460px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' } },
      React.createElement('div', { style: { textAlign: 'center', marginBottom: '28px' } },
        React.createElement('div', { style: { fontSize: '36px', marginBottom: '8px' } }, '⭐'),
        React.createElement('h1', { style: { fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0' } }, 'Leave a Review'),
        order && React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', margin: 0 } }, 'For: ' + order.cropName + ' from ' + order.farmerName)
      ),
      error && React.createElement('div', { style: { background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px' } }, error),
      success && React.createElement('div', { style: { background: '#dcfce7', border: '1px solid #86efac', color: '#166534', borderRadius: '8px', padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600' } }, '✅ Review submitted! Redirecting...'),
      !success && !error && React.createElement('form', { onSubmit: submit },
        React.createElement('div', { style: { marginBottom: '20px' } },
          React.createElement('label', { style: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '10px' } }, 'Rating'),
          React.createElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center' } },
            [1, 2, 3, 4, 5].map(n => React.createElement('button', {
              key: n, type: 'button',
              onClick: () => setRating(n),
              style: { fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= rating ? 1 : 0.3, transition: 'opacity 0.15s' }
            }, '★'))
          ),
          React.createElement('p', { style: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '6px' } }, rating + ' out of 5')
        ),
        React.createElement('div', { style: { marginBottom: '24px' } },
          React.createElement('label', { style: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' } }, 'Comment (optional)'),
          React.createElement('textarea', {
            rows: 4, value: comment, onChange: e => setComment(e.target.value),
            maxLength: 1000, placeholder: 'Share your experience...',
            style: { width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }
          }),
          React.createElement('p', { style: { fontSize: '12px', color: '#9ca3af', textAlign: 'right', marginTop: '4px' } }, comment.length + '/1000')
        ),
        React.createElement('button', {
          type: 'submit', disabled: submitting,
          style: { width: '100%', padding: '12px', background: '#166534', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }
        }, submitting ? 'Submitting...' : '⭐ Submit Review'),
        React.createElement('a', { href: '/orders', style: { display: 'block', textAlign: 'center', marginTop: '12px', color: '#6b7280', fontSize: '14px', textDecoration: 'none' } }, 'Cancel')
      )
    )
  )
}

module.exports = NewReviewPage
