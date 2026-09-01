const React = require('react')

function RegisterPage() {
  const [form, setForm] = React.useState({ name: '', email: '', password: '', role: 'buyer' })
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const s = (f, v) => setForm(p => ({ ...p, [f]: v }))

  function submit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      .then(r => r.json()).then(d => {
        if (d.success) { alert('Account created! Please sign in.'); window.location.href = '/login' }
        else { setError(d.error || 'Registration failed'); setLoading(false) }
      }).catch(() => { setError('Network error'); setLoading(false) })
  }

  const inputStyle = { display: 'block', width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box' }

  return React.createElement('div', { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '40px 24px' } },
    React.createElement('div', { style: { width: '100%', maxWidth: '480px' } },
      React.createElement('div', { style: { textAlign: 'center', marginBottom: '32px' } },
        React.createElement('a', { href: '/', style: { fontSize: '22px', fontWeight: '900', color: '#166534', textDecoration: 'none', display: 'block', marginBottom: '16px' } }, '🌾 Krishify'),
        React.createElement('h2', { style: { fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' } }, 'Create your account'),
        React.createElement('p', { style: { color: '#64748b', fontSize: '15px', margin: 0 } }, 'Join the Digital Mandi')
      ),
      React.createElement('div', { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } },
        error && React.createElement('div', { style: { background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px' } }, '⚠️ ' + error),
        React.createElement('form', { onSubmit: submit },
          React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' } }, 'Full Name'),
            React.createElement('input', { type: 'text', value: form.name, onChange: e => s('name', e.target.value), required: true, placeholder: 'Ramesh Kumar', style: inputStyle,
              onFocus: e => e.target.style.borderColor = '#166534', onBlur: e => e.target.style.borderColor = '#e2e8f0' })
          ),
          React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' } }, 'Email address'),
            React.createElement('input', { type: 'email', value: form.email, onChange: e => s('email', e.target.value), required: true, placeholder: 'you@example.com', style: inputStyle,
              onFocus: e => e.target.style.borderColor = '#166534', onBlur: e => e.target.style.borderColor = '#e2e8f0' })
          ),
          React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' } }, 'Password'),
            React.createElement('input', { type: 'password', value: form.password, onChange: e => s('password', e.target.value), required: true, placeholder: 'Minimum 6 characters', style: inputStyle,
              onFocus: e => e.target.style.borderColor = '#166534', onBlur: e => e.target.style.borderColor = '#e2e8f0' })
          ),
          React.createElement('div', { style: { marginBottom: '24px' } },
            React.createElement('label', { style: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px' } }, 'I am a…'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } },
              [['buyer', '🛒', 'Buyer', 'Browse & bid on lots'],['farmer', '👨‍🌾', 'Farmer', 'List & auction crops']].map(([val, icon, label, desc]) =>
                React.createElement('label', { key: val, style: { border: '2px solid ' + (form.role === val ? '#166534' : '#e2e8f0'), background: form.role === val ? '#f0fdf4' : '#fff', borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.15s', display: 'block' } },
                  React.createElement('input', { type: 'radio', name: 'role', value: val, checked: form.role === val, onChange: () => s('role', val), style: { display: 'none' } }),
                  React.createElement('div', { style: { fontSize: '22px', marginBottom: '6px' } }, icon),
                  React.createElement('div', { style: { fontWeight: '700', fontSize: '14px', color: form.role === val ? '#166534' : '#374151' } }, label),
                  React.createElement('div', { style: { fontSize: '12px', color: '#64748b', marginTop: '2px' } }, desc)
                )
              )
            )
          ),
          React.createElement('button', { type: 'submit', disabled: loading, style: { width: '100%', padding: '13px', background: '#166534', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(22,101,52,0.3)' } },
            loading ? 'Creating account…' : 'Create Account →'
          )
        ),
        React.createElement('div', { style: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#64748b' } },
          'Already have an account? ',
          React.createElement('a', { href: '/login', style: { color: '#166534', fontWeight: '700', textDecoration: 'none' } }, 'Sign in')
        )
      )
    )
  )
}

module.exports = RegisterPage
