const React = require('react')

function RegisterPage() {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [role, setRole] = React.useState('buyer')
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!name || !email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSuccess('Account created! Redirecting to login...')
          setTimeout(() => { window.location.href = '/login' }, 1500)
        } else {
          setError(data.error || 'Registration failed')
          setLoading(false)
        }
      })
      .catch(() => { setError('Network error. Please try again.'); setLoading(false) })
  }

  return React.createElement('div', {
    style: { minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
  },
    React.createElement('div', {
      style: { background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }
    },
      React.createElement('div', { style: { textAlign: 'center', marginBottom: '32px' } },
        React.createElement('div', { style: { fontSize: '36px', marginBottom: '8px' } }, '🌾'),
        React.createElement('h1', { style: { fontSize: '24px', fontWeight: '800', color: '#166534', margin: '0 0 4px 0' } }, 'Join Krishify'),
        React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', margin: 0 } }, 'Create your account to get started')
      ),
      error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '20px' } }, error),
      success && React.createElement('div', { className: 'alert-success', style: { marginBottom: '20px' } }, success),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { className: 'form-label', htmlFor: 'name' }, 'Full Name'),
          React.createElement('input', {
            id: 'name', type: 'text', className: 'input-field',
            placeholder: 'Ramesh Kumar', value: name,
            onChange: e => setName(e.target.value), required: true
          })
        ),
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { className: 'form-label', htmlFor: 'email' }, 'Email address'),
          React.createElement('input', {
            id: 'email', type: 'email', className: 'input-field',
            placeholder: 'you@example.com', value: email,
            onChange: e => setEmail(e.target.value), required: true
          })
        ),
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { className: 'form-label', htmlFor: 'password' }, 'Password'),
          React.createElement('input', {
            id: 'password', type: 'password', className: 'input-field',
            placeholder: 'Minimum 6 characters', value: password,
            onChange: e => setPassword(e.target.value), required: true
          })
        ),
        React.createElement('div', { style: { marginBottom: '24px' } },
          React.createElement('label', { className: 'form-label' }, 'I am a...'),
          React.createElement('div', { style: { display: 'flex', gap: '12px' } },
            React.createElement('label', {
              style: {
                flex: 1, border: `2px solid ${role === 'buyer' ? '#166534' : '#d1d5db'}`,
                borderRadius: '10px', padding: '14px', cursor: 'pointer', textAlign: 'center',
                background: role === 'buyer' ? '#f0fdf4' : '#fff', transition: 'all 0.15s'
              }
            },
              React.createElement('input', { type: 'radio', name: 'role', value: 'buyer', checked: role === 'buyer', onChange: () => setRole('buyer'), style: { display: 'none' } }),
              React.createElement('div', { style: { fontSize: '24px' } }, '🛒'),
              React.createElement('div', { style: { fontWeight: '600', fontSize: '14px', marginTop: '4px', color: role === 'buyer' ? '#166534' : '#374151' } }, 'Buyer'),
              React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' } }, 'Browse & buy crops')
            ),
            React.createElement('label', {
              style: {
                flex: 1, border: `2px solid ${role === 'farmer' ? '#166534' : '#d1d5db'}`,
                borderRadius: '10px', padding: '14px', cursor: 'pointer', textAlign: 'center',
                background: role === 'farmer' ? '#f0fdf4' : '#fff', transition: 'all 0.15s'
              }
            },
              React.createElement('input', { type: 'radio', name: 'role', value: 'farmer', checked: role === 'farmer', onChange: () => setRole('farmer'), style: { display: 'none' } }),
              React.createElement('div', { style: { fontSize: '24px' } }, '👨‍🌾'),
              React.createElement('div', { style: { fontWeight: '600', fontSize: '14px', marginTop: '4px', color: role === 'farmer' ? '#166534' : '#374151' } }, 'Farmer'),
              React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' } }, 'List & sell crops')
            )
          )
        ),
        React.createElement('button', {
          type: 'submit', className: 'btn-primary',
          style: { width: '100%', padding: '12px', fontSize: '15px' },
          disabled: loading
        }, loading ? 'Creating account...' : 'Create Account')
      ),
      React.createElement('p', {
        style: { textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '24px' }
      },
        'Already have an account? ',
        React.createElement('a', { href: '/login', style: { color: '#166534', fontWeight: '600', textDecoration: 'none' } }, 'Sign in')
      )
    )
  )
}

module.exports = RegisterPage
