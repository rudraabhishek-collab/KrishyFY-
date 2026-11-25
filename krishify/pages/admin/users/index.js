const React = require('react')

const ROLE_COLOR = { admin: ['#dbeafe','#1e40af'], farmer: ['#dcfce7','#166534'], buyer: ['#fef9c3','#854d0e'], inspector: ['#ede9fe','#6d28d9'] }

function AdminUsersPage() {
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState(null)

  function load(p, s, r) {
    setLoading(true)
    const q = new URLSearchParams({ page: p, limit: 20 })
    if (s) q.append('search', s)
    if (r) q.append('role', r)
    fetch('/api/admin/users?' + q, { credentials: 'include' })
      .then(res => res.json())
      .then(d => {
        if (d.success) { setUsers(d.users || []); setPagination(d.pagination) }
        else { setError(d.error || 'Failed'); if (d.error && (d.error.includes('Admin') || d.error.includes('auth'))) window.location.href = '/login' }
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
  }

  React.useEffect(() => { load(1, '', '') }, [])

  function handleSearch(e) { e.preventDefault(); setPage(1); load(1, search, roleFilter) }

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    // Header
    React.createElement('div', { style: { background: 'linear-gradient(135deg,#1e3a5f,#1e40af)', color: '#fff', padding: '28px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('a', { href: '/admin', style: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', display: 'block', marginBottom: '6px' } }, '← Dashboard'),
        React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0' } }, '👥 User Management'),
        React.createElement('p', { style: { opacity: 0.8, margin: 0, fontSize: '14px' } }, 'All registered users')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' } },
      // Search bar
      React.createElement('form', { onSubmit: handleSearch, style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' } },
        React.createElement('input', {
          type: 'text', placeholder: '🔍 Search name or email...', value: search,
          onChange: e => setSearch(e.target.value),
          style: { flex: 1, minWidth: '200px', padding: '9px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: '#fff' }
        }),
        React.createElement('select', {
          value: roleFilter, onChange: e => setRoleFilter(e.target.value),
          style: { padding: '9px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: '#fff' }
        },
          React.createElement('option', { value: '' }, 'All Roles'),
          React.createElement('option', { value: 'farmer' }, 'Farmer'),
          React.createElement('option', { value: 'buyer' }, 'Buyer'),
          React.createElement('option', { value: 'inspector' }, 'Inspector'),
          React.createElement('option', { value: 'admin' }, 'Admin')
        ),
        React.createElement('button', { type: 'submit', style: { padding: '9px 20px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' } }, 'Search')
      ),
      error && React.createElement('div', { style: { background: '#fee2e2', color: '#991b1b', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px' } }, error),
      pagination && React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '12px' } }, pagination.total + ' users'),
      loading
        ? React.createElement('div', { style: { textAlign: 'center', padding: '60px', color: '#9ca3af' } }, 'Loading...')
        : React.createElement('div', { style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflowX: 'auto' } },
            React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' } },
              React.createElement('thead', null,
                React.createElement('tr', { style: { background: '#f9fafb' } },
                  ['Name', 'Email', 'Role', 'Joined'].map(h =>
                    React.createElement('th', { key: h, style: { padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' } }, h)
                  )
                )
              ),
              React.createElement('tbody', null,
                users.length === 0
                  ? React.createElement('tr', null, React.createElement('td', { colSpan: 4, style: { textAlign: 'center', padding: '40px', color: '#9ca3af' } }, 'No users found'))
                  : users.map(u => {
                      const [bg, col] = ROLE_COLOR[u.role] || ['#f3f4f6', '#6b7280']
                      return React.createElement('tr', { key: u.id, style: { borderTop: '1px solid #f3f4f6' } },
                        React.createElement('td', { style: { padding: '12px 16px', fontWeight: '600', fontSize: '14px' } }, u.name),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '14px', color: '#6b7280' } }, u.email),
                        React.createElement('td', { style: { padding: '12px 16px' } },
                          React.createElement('span', { style: { background: bg, color: col, padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' } }, u.role.toUpperCase())
                        ),
                        React.createElement('td', { style: { padding: '12px 16px', fontSize: '13px', color: '#9ca3af' } }, new Date(u.createdAt).toLocaleDateString('en-IN'))
                      )
                    })
              )
            )
          ),
      // Pagination
      pagination && pagination.totalPages > 1 && React.createElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' } },
        page > 1 && React.createElement('button', { onClick: () => { const p = page - 1; setPage(p); load(p, search, roleFilter) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, '← Prev'),
        React.createElement('span', { style: { padding: '7px 14px', fontSize: '14px', color: '#6b7280' } }, 'Page ' + page + ' of ' + pagination.totalPages),
        page < pagination.totalPages && React.createElement('button', { onClick: () => { const p = page + 1; setPage(p); load(p, search, roleFilter) }, style: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' } }, 'Next →')
      )
    )
  )
}

module.exports = AdminUsersPage
