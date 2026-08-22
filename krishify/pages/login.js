const React = require('react')

function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const role = data.role
          if (role === 'admin') window.location.href = '/admin'
          else if (role === 'farmer') window.location.href = '/farmer/crops'
          else window.location.href = '/marketplace'
        } else {
          setError(data.error || 'Login failed')
          setLoading(false)
        }
      })
      .catch(() => { setError('Network error. Please try again.'); setLoading(false) })
  }

  return React.createElement('div', {
    style: { minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
  },
    React.createElement('div', {
      style: { background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }
    },
      React.createElement('div', { style: { textAlign: 'center', marginBottom: '32px' } },
        React.createElement('div', { style: { fontSize: '36px', marginBottom: '8px' } }, '🌾'),
        React.createElement('h1', { style: { fontSize: '24px', fontWeight: '800', color: '#166534', margin: '0 0 4px 0' } }, 'Welcome back'),
        React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', margin: 0 } }, 'Sign in to your Krishify account')
      ),
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '20px' } }, error),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { className: 'form-label', htmlFor: 'email' }, 'Email address'),
          React.createElement('input', {
            id: 'email', type: 'email', className: 'input-field',
            placeholder: 'you@example.com', value: email,
            onChange: e => setEmail(e.target.value), required: true
          })
        ),
        React.createElement('div', { style: { marginBottom: '24px' } },
          React.createElement('label', { className: 'form-label', htmlFor: 'password' }, 'Password'),
          React.createElement('input', {
            id: 'password', type: 'password', className: 'input-field',
            placeholder: '••••••••', value: password,
            onChange: e => setPassword(e.target.value), required: true
          })
        ),
        React.createElement('button', {
          type: 'submit', className: 'btn-primary',
          style: { width: '100%', padding: '12px', fontSize: '15px' },
          disabled: loading
        }, loading ? 'Signing in...' : 'Sign In')
      ),
      React.createElement('p', {
        style: { textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '24px' }
      },
        "Don't have an account? ",
        React.createElement('a', { href: '/register', style: { color: '#166534', fontWeight: '600', textDecoration: 'none' } }, 'Register here')
      )
    )
  )
}

module.exports = LoginPage
