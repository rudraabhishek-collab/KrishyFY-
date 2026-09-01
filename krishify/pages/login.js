const React = require('react')

function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  function submit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) })
      .then(r => r.json()).then(d => {
        if (d.success) {
          if (d.role === 'admin') window.location.href = '/admin'
          else if (d.role === 'farmer') window.location.href = '/farmer'
          else if (d.role === 'inspector') window.location.href = '/inspector'
          else window.location.href = '/marketplace'
        } else { setError(d.error || 'Invalid credentials'); setLoading(false) }
      }).catch(() => { setError('Network error. Please try again.'); setLoading(false) })
  }

  return React.createElement('div', { style: { minHeight: '100vh', display: 'flex', background: '#f8fafc' } },
    // Left panel
    React.createElement('div', { style: { flex: '1', background: 'linear-gradient(160deg, #052e16 0%, #166534 60%, #16a34a 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', minHeight: '100vh' }, className: 'hidden-mobile' },
      React.createElement('div', { style: { maxWidth: '420px' } },
        React.createElement('div', { style: { fontSize: '42px', marginBottom: '20px' } }, '🌾'),
        React.createElement('h1', { style: { fontSize: '36px', fontWeight: '900', color: '#fff', margin: '0 0 16px 0', lineHeight: '1.1', letterSpacing: '-1px' } }, 'Krishify Digital Mandi'),
        React.createElement('p', { style: { color: 'rgba(255,255,255,0.75)', fontSize: '16px', lineHeight: '1.7', marginBottom: '48px' } }, 'The wholesale agricultural auction platform connecting farmers with verified government and private buyers.'),
        ['Verified crop lot auctions', 'Physical quality inspection', 'AI-assisted quality scoring', 'Secure Razorpay TEST payments'].map(f =>
          React.createElement('div', { key: f, style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' } },
            React.createElement('div', { style: { width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
              React.createElement('span', { style: { color: '#4ade80', fontSize: '11px', fontWeight: '900' } }, '✓')
            ),
            React.createElement('span', { style: { color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '500' } }, f)
          )
        )
      )
    ),
    // Right panel (form)
    React.createElement('div', { style: { flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minHeight: '100vh' } },
      React.createElement('div', { style: { width: '100%', maxWidth: '400px' } },
        React.createElement('div', { style: { marginBottom: '36px' } },
          React.createElement('a', { href: '/', style: { fontSize: '20px', fontWeight: '900', color: '#166534', textDecoration: 'none', display: 'block', marginBottom: '32px' } }, '🌾 Krishify'),
          React.createElement('h2', { style: { fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' } }, 'Welcome back'),
          React.createElement('p', { style: { color: '#64748b', fontSize: '15px', margin: 0 } }, 'Sign in to your account')
        ),
        error && React.createElement('div', { style: { background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' } },
          React.createElement('span', null, '⚠️'), error
        ),
        React.createElement('form', { onSubmit: submit },
          React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' } }, 'Email address'),
            React.createElement('input', { type: 'email', value: email, onChange: e => setEmail(e.target.value), required: true, placeholder: 'you@example.com', style: { display: 'block', width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', color: '#0f172a', background: '#fff', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' },
              onFocus: e => e.target.style.borderColor = '#166534',
              onBlur: e => e.target.style.borderColor = '#e2e8f0'
            })
          ),
          React.createElement('div', { style: { marginBottom: '24px' } },
            React.createElement('label', { style: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' } }, 'Password'),
            React.createElement('input', { type: 'password', value: password, onChange: e => setPassword(e.target.value), required: true, placeholder: '••••••••', style: { display: 'block', width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', color: '#0f172a', background: '#fff', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' },
              onFocus: e => e.target.style.borderColor = '#166534',
              onBlur: e => e.target.style.borderColor = '#e2e8f0'
            })
          ),
          React.createElement('button', { type: 'submit', disabled: loading, style: { width: '100%', padding: '13px', background: loading ? '#86efac' : '#166534', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(22,101,52,0.3)' } },
            loading ? 'Signing in…' : 'Sign In →'
          )
        ),
        React.createElement('div', { style: { marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', color: '#64748b' } },
          "Don't have an account?",
          React.createElement('a', { href: '/register', style: { color: '#166534', fontWeight: '700', textDecoration: 'none' } }, 'Register free')
        ),
        React.createElement('div', { style: { marginTop: '24px', background: '#f1f5f9', borderRadius: '10px', padding: '14px', fontSize: '12px', color: '#64748b' } },
          React.createElement('strong', { style: { display: 'block', marginBottom: '6px', color: '#374151' } }, '🔑 Demo accounts:'),
          ['farmer@test.com • test123', 'buyer@test.com • test123', 'inspector@krishify.com • Inspector@123', 'admin@krishify.com • Inspector@123'].map(a =>
            React.createElement('div', { key: a, style: { marginBottom: '3px', fontFamily: 'monospace', fontSize: '11px' } }, a)
          )
        )
      )
    )
  )
}

module.exports = LoginPage
