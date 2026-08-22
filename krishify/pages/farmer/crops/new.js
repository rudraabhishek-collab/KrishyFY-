const React = require('react')

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Oilseeds', 'Other']
const UNITS = ['kg', 'quintal', 'ton', 'dozen', 'piece', 'litre', 'bag']

function NewCropPage() {
  const [form, setForm] = React.useState({ cropName: '', category: 'Vegetables', description: '', quantity: '', unit: 'kg', expectedPrice: '', location: '', harvestDate: '' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.cropName || !form.quantity || !form.unit || !form.location) { setError('Please fill all required fields.'); return }
    setLoading(true)
    fetch('/api/crops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...form, quantity: String(form.quantity), expectedPrice: form.expectedPrice || null })
    }).then(r => r.json()).then(data => {
      if (data.success) {
        setSuccess('✅ Crop listed successfully! Redirecting...')
        setTimeout(() => { window.location.href = '/farmer/crops' }, 1500)
      } else {
        if (data.error?.includes('Unauthenticated')) window.location.href = '/login'
        setError(data.error || 'Failed to create listing')
        setLoading(false)
      }
    }).catch(() => { setError('Network error'); setLoading(false) })
  }

  const field = (label, node, required = false) => React.createElement('div', { style: { marginBottom: '16px' } },
    React.createElement('label', { className: 'form-label' }, label, required && React.createElement('span', { style: { color: '#dc2626' } }, ' *')),
    node
  )

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container', style: { maxWidth: '700px' } },
      React.createElement('a', { href: '/farmer/crops', style: { color: '#166534', textDecoration: 'none', fontSize: '14px', fontWeight: '500' } }, '← Back to My Crops'),
      React.createElement('div', { className: 'card', style: { marginTop: '20px' } },
        React.createElement('h1', { style: { fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' } }, '🌾 List a New Crop'),
        React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '24px' } }, 'Fill in the details to list your produce on the marketplace.'),
        error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '16px' } }, error),
        success && React.createElement('div', { className: 'alert-success', style: { marginBottom: '16px' } }, success),
        React.createElement('form', { onSubmit: handleSubmit },
          field('Crop Name', React.createElement('input', { type: 'text', className: 'input-field', placeholder: 'e.g. Tomatoes, Wheat, Mangoes', value: form.cropName, onChange: e => set('cropName', e.target.value), required: true }), true),
          field('Category', React.createElement('select', { className: 'input-field', value: form.category, onChange: e => set('category', e.target.value) },
            CATEGORIES.map(c => React.createElement('option', { key: c, value: c }, c))
          ), true),
          field('Description', React.createElement('textarea', { className: 'input-field', rows: 3, placeholder: 'Describe the crop quality, variety, growing conditions...', value: form.description, onChange: e => set('description', e.target.value), style: { resize: 'vertical' } })),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' } },
            React.createElement('div', null,
              React.createElement('label', { className: 'form-label' }, 'Quantity ', React.createElement('span', { style: { color: '#dc2626' } }, '*')),
              React.createElement('input', { type: 'number', className: 'input-field', placeholder: '100', min: 1, value: form.quantity, onChange: e => set('quantity', e.target.value), required: true })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'form-label' }, 'Unit ', React.createElement('span', { style: { color: '#dc2626' } }, '*')),
              React.createElement('select', { className: 'input-field', value: form.unit, onChange: e => set('unit', e.target.value) },
                UNITS.map(u => React.createElement('option', { key: u, value: u }, u))
              )
            )
          ),
          field('Expected Price (₹ per unit)', React.createElement('input', { type: 'number', className: 'input-field', placeholder: 'e.g. 25 (leave blank if negotiable)', min: 0, step: '0.01', value: form.expectedPrice, onChange: e => set('expectedPrice', e.target.value) })),
          field('Location / Village', React.createElement('input', { type: 'text', className: 'input-field', placeholder: 'e.g. Nashik, Maharashtra', value: form.location, onChange: e => set('location', e.target.value), required: true }), true),
          field('Harvest Date', React.createElement('input', { type: 'date', className: 'input-field', value: form.harvestDate, onChange: e => set('harvestDate', e.target.value) })),
          React.createElement('div', { style: { display: 'flex', gap: '12px', marginTop: '8px' } },
            React.createElement('button', { type: 'submit', className: 'btn-primary', style: { flex: 1, padding: '12px', fontSize: '15px' }, disabled: loading }, loading ? 'Creating listing...' : '🌾 List My Crop'),
            React.createElement('a', { href: '/farmer/crops', className: 'btn-outline', style: { padding: '12px 20px', textAlign: 'center' } }, 'Cancel')
          )
        )
      )
    )
  )
}

module.exports = NewCropPage
