const React = require('react')

function stars(n) {
  return '★'.repeat(Math.min(5, Math.max(0, n))) + '☆'.repeat(Math.max(0, 5 - n))
}

function AdminReviewsPage() {
  const [reviews, setReviews] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState(null)

  function load(p) {
    setLoading(true)
    fetch('/api/admin/reviews?page=' + p + '&limit=20', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setReviews(d.reviews || []); setPagination(d.pagination) }
        else { setError(d.error || 'Failed'); if (d.error && (d.error.includes('Admin') || d.error.includes('auth'))) window.location.href = '/login' }
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { load(1) }, [])

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg,#1e3a5f,#1e40af)', color: '#fff', padding: '28px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('a', { href: '/admin', style: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', display: 'block', marginBottom: '6px' } }, '← Dashboard'),
        React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0' } }, '⭐ Review Moderation'),
        React.createElement('p', { style: { opacity: 0.8, margin: 0, fontSize: '14px' } }, 'All user reviews on the platform')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' } },
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px' } }, error),
      pagination && React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '12px' } }, pagination.total + ' reviews'),
      loading
        ? React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#9ca3af' } }, 'Loading...')
        : reviews.length === 0
          ? React.createElement('div', { style: { textAlign: 'center', padding: '60px' } },
              React.createElement('div', { style: { fontSize: '48px', marginBottom: '12px' } }, '⭐'),
              React.createElement('p', { style: { color: '#9ca3af' } }, 'No reviews yet.')
            )
          : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
              reviews.map(r => React.createElement('div', { key: r.id, style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 20px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' } },
                  React.createElement('div', null,
                    React.createElement('span', { style: { color: '#f59e0b', fontSize: '18px', letterSpacing: '2px' } }, stars(r.rating)),
                    React.createElement('span', { style: { marginLeft: '8px', fontWeight: '700', color: '#111827', fontSize: '15px' } }, r.rating + '/5'),
                    React.createElement('span', { style: { marginLeft: '12px', fontSize: '13px', color: '#6b7280' } }, 'By: ' + (r.buyerName || '—')),
                    React.createElement('span', { style: { marginLeft: '8px', fontSize: '13px', color: '#6b7280' } }, '• Crop: ' + (r.cropName || '—')),
                    React.createElement('span', { style: { marginLeft: '8px', fontSize: '13px', color: '#6b7280' } }, '• Farmer: ' + (r.farmerName || '—'))
                  ),
                  React.createElement('span', { style: { fontSize: '12px', color: '#9ca3af' } }, new Date(r.createdAt).toLocaleDateString('en-IN'))
                ),
                r.comment && React.createElement('p', { style: { margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.6' } }, r.comment)
              ))
            ),
      pagination && pagination.totalPages > 1 && React.createElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' } },
        page > 1 && React.createElement('button', { onClick: () => { const p = page-1; setPage(p); load(p) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, '← Prev'),
        React.createElement('span', { style: { padding: '7px 14px', fontSize: '14px', color: '#6b7280' } }, 'Page ' + page + ' of ' + pagination.totalPages),
        page < pagination.totalPages && React.createElement('button', { onClick: () => { const p = page+1; setPage(p); load(p) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, 'Next →')
      )
    )
  )
}

module.exports = AdminReviewsPage
