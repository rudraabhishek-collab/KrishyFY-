const React = require('react')

const CATEGORIES = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Oilseeds', 'Other']

function NewLotPage() {
  const [form, setForm] = React.useState({ cropName: '', category: 'Grains', description: '', quantityKg: '', expectedPricePerQuintal: '', location: '', harvestDate: '' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))
  const qKg = Number(form.quantityKg) || 0
  const quintals = (qKg / 100).toFixed(1)
  const tonnes = (qKg / 1000).toFixed(2)
  const priceQ = Number(form.expectedPricePerQuintal) || 0
  const estTotal = qKg && priceQ ? Math.round(qKg / 100 * priceQ) : 0

  function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.cropName) { setError('Crop name is required'); return }
    if (!form.quantityKg || qKg < 100) { setError('Minimum lot quantity is 100 kg'); return }
    if (!form.expectedPricePerQuintal || priceQ <= 0) { setError('Expected price per quintal is required'); return }
    if (!form.location) { setError('Location is required'); return }
    setLoading(true)
    fetch('/api/crops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cropName: form.cropName, category: form.category, description: form.description, quantity: form.quantityKg, unit: 'kg', expectedPrice: form.expectedPricePerQuintal, expectedPricePerQuintal: form.expectedPricePerQuintal, location: form.location, harvestDate: form.harvestDate || null })
    }).then(r => r.json()).then(d => {
      if (d.success) { setSuccess('✅ Lot created! Redirecting...'); setTimeout(() => { window.location.href = '/farmer/crops' }, 1200) }
      else { if (d.error?.includes('Unauthenticated')) window.location.href = '/login'; setError(d.error || 'Failed'); setLoading(false) }
    }).catch(() => { setError('Network error'); setLoading(false) })
  }

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    React.createElement('div', { className: 'page-container', style: { maxWidth: '680px' } },
      React.createElement('a', { href: '/farmer/crops', style: { color: '#166534', textDecoration: 'none', fontSize: '14px', fontWeight: '600' } }, '← My Lots'),
      React.createElement('div', { style: { background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e5e7eb', marginTop: '20px' } },
        React.createElement('div', { style: { marginBottom: '28px' } },
          React.createElement('h1', { style: { fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0 0 6px 0' } }, '🌾 List a New Mandi Lot'),
          React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', margin: 0 } }, 'Submit your crop lot for physical inspection, then proceed to auction.')
        ),
        error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '16px' } }, error),
        success && React.createElement('div', { className: 'alert-success', style: { marginBottom: '16px' } }, success),
        React.createElement('form', { onSubmit: handleSubmit },
          row('Crop Name *', React.createElement('input', { type: 'text', className: 'input-field', placeholder: 'e.g. Wheat, Tomatoes, Mangoes', value: form.cropName, onChange: e => set('cropName', e.target.value), required: true })),
          row('Category *', React.createElement('select', { className: 'input-field', value: form.category, onChange: e => set('category', e.target.value) }, CATEGORIES.map(c => React.createElement('option', { key: c, value: c }, c)))),
          row('Description', React.createElement('textarea', { className: 'input-field', rows: 3, placeholder: 'Variety, growing method, quality notes...', value: form.description, onChange: e => set('description', e.target.value), style: { resize: 'vertical' } })),

          // Quantity section with live calculation
          React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { className: 'form-label' }, 'Total Lot Quantity (kg) *'),
            React.createElement('input', { type: 'number', className: 'input-field', placeholder: 'e.g. 5000', min: 100, value: form.quantityKg, onChange: e => set('quantityKg', e.target.value), required: true }),
            qKg >= 100 && React.createElement('div', { style: { marginTop: '8px', background: '#f0fdf4', borderRadius: '8px', padding: '10px 14px', display: 'flex', gap: '20px', fontSize: '13px' } },
              React.createElement('span', { style: { color: '#166534', fontWeight: '700' } }, qKg.toLocaleString('en-IN') + ' kg'),
              React.createElement('span', { style: { color: '#6b7280' } }, '= ' + quintals + ' quintals'),
              React.createElement('span', { style: { color: '#6b7280' } }, '= ' + tonnes + ' tonnes')
            )
          ),

          // Price with live total
          React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { className: 'form-label' }, 'Expected Price (₹ per quintal) *'),
            React.createElement('input', { type: 'number', className: 'input-field', placeholder: 'e.g. 2500', min: 1, step: '0.01', value: form.expectedPricePerQuintal, onChange: e => set('expectedPricePerQuintal', e.target.value), required: true }),
            estTotal > 0 && React.createElement('div', { style: { marginTop: '8px', background: '#f0fdf4', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' } },
              React.createElement('span', { style: { color: '#6b7280' } }, 'Estimated lot value: '),
              React.createElement('span', { style: { color: '#166534', fontWeight: '800', fontSize: '15px' } }, '₹' + estTotal.toLocaleString('en-IN')),
              React.createElement('span', { style: { color: '#9ca3af', marginLeft: '6px' } }, '(' + quintals + 'q × ₹' + Number(form.expectedPricePerQuintal).toLocaleString('en-IN') + '/q)')
            )
          ),

          row('Location *', React.createElement('input', { type: 'text', className: 'input-field', placeholder: 'e.g. Nashik, Maharashtra', value: form.location, onChange: e => set('location', e.target.value), required: true })),
          row('Harvest Date', React.createElement('input', { type: 'date', className: 'input-field', value: form.harvestDate, onChange: e => set('harvestDate', e.target.value) })),

          // Submit info box
          React.createElement('div', { style: { background: '#fef9c3', border: '1px solid #fcd34d', borderRadius: '10px', padding: '14px', marginBottom: '20px', fontSize: '13px', color: '#92400e' } },
            React.createElement('strong', null, '📋 What happens next:'),
            React.createElement('ol', { style: { margin: '8px 0 0', paddingLeft: '18px', lineHeight: '1.8' } },
              React.createElement('li', null, 'Your lot will be submitted for physical inspection'),
              React.createElement('li', null, 'An authorized inspector will verify the quality'),
              React.createElement('li', null, 'After approval, AI assessment runs automatically'),
              React.createElement('li', null, 'Your lot goes live for auction — buyers bid ₹/quintal')
            )
          ),

          React.createElement('div', { style: { display: 'flex', gap: '12px' } },
            React.createElement('button', { type: 'submit', disabled: loading, style: { flex: 1, padding: '13px', background: '#166534', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' } }, loading ? 'Creating lot...' : '🌾 Submit Lot for Inspection'),
            React.createElement('a', { href: '/farmer/crops', style: { padding: '13px 20px', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center' } }, 'Cancel')
          )
        )
      )
    )
  )
}

function row(label, input) {
  return React.createElement('div', { style: { marginBottom: '18px' } },
    React.createElement('label', { className: 'form-label' }, label),
    input
  )
}

module.exports = NewLotPage
