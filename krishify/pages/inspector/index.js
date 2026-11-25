const React = require('react')

const STATUS_COLORS = {
  PENDING: ['#fef9c3', '#854d0e'],
  IN_PROGRESS: ['#dbeafe', '#1e40af'],
  APPROVED: ['#dcfce7', '#166534'],
  REJECTED: ['#fee2e2', '#991b1b'],
  REINSPECTION_REQUIRED: ['#f3e8ff', '#6d28d9'],
}

function InspectorDashboard() {
  const [queue, setQueue] = React.useState([])
  const [allInspections, setAllInspections] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [selected, setSelected] = React.useState(null)
  const [form, setForm] = React.useState({ grade: '', moisturePercentage: '', foreignMatterPercentage: '', damagedPercentage: '', weightKg: '', appearance: '', remarks: '' })
  const [submitting, setSubmitting] = React.useState(false)
  const [msg, setMsg] = React.useState('')
  const [tab, setTab] = React.useState('pending')

  React.useEffect(() => {
    fetch('/api/inspector/queue', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setQueue(d.inspections || [])
        else if (d.error && (d.error.includes('Inspector') || d.error.includes('auth'))) window.location.href = '/login'
        else setError(d.error || 'Failed to load')
        setLoading(false)
      }).catch(() => { setError('Network error'); setLoading(false) })
    // Load all inspections (approved/rejected history)
    fetch('/api/inspector/queue?all=true', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setAllInspections(d.inspections || []) })
      .catch(() => {})
  }, [])

  function openLot(inspection) {
    setSelected(inspection)
    setForm({ grade: inspection.grade || '', moisturePercentage: inspection.moisturePercentage || '', foreignMatterPercentage: inspection.foreignMatterPercentage || '', damagedPercentage: inspection.damagedPercentage || '', weightKg: inspection.weightKg || '', appearance: inspection.appearance || '', remarks: inspection.remarks || '' })
    setMsg('')
  }

  function submitInspection(status) {
    if (!selected) return
    setSubmitting(true); setMsg('')
    fetch('/api/inspector/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ inspectionId: selected.id, status, ...form })
    }).then(r => r.json()).then(d => {
      if (d.success) {
        setMsg('✅ Inspection ' + status.toLowerCase() + ' successfully.')
        setQueue(q => q.filter(i => i.id !== selected.id))
        setAllInspections(prev => {
          const exists = prev.some(i => i.id === selected.id)
          const updatedItem = d.inspection || { ...selected, status, ...form }
          return exists ? prev.map(i => i.id === selected.id ? updatedItem : i) : [updatedItem, ...prev]
        })
        setSelected(null)
      } else setMsg('❌ ' + (d.error || 'Failed'))
      setSubmitting(false)
    }).catch(() => { setMsg('❌ Network error'); setSubmitting(false) })
  }

  const pending = queue.filter(i => i.status === 'PENDING')
  const inProgress = queue.filter(i => i.status === 'IN_PROGRESS')
  const approved = allInspections.filter(i => i.status === 'APPROVED')
  const rejected = allInspections.filter(i => i.status === 'REJECTED')

  if (loading) return React.createElement('div', { style: { textAlign: 'center', padding: '80px' } },
    React.createElement('div', { className: 'spinner', style: { margin: '0 auto 16px' } }),
    React.createElement('p', { style: { color: '#6b7280' } }, 'Loading inspection queue...')
  )

  return React.createElement('div', { style: { background: '#f9fafb', minHeight: '100vh' } },
    // Header
    React.createElement('div', { style: { background: 'linear-gradient(135deg,#1e3a5f,#1e40af)', color: '#fff', padding: '28px 20px' } },
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto' } },
        React.createElement('h1', { style: { fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0' } }, '🔍 Inspector Dashboard'),
        React.createElement('p', { style: { opacity: 0.8, margin: 0, fontSize: '14px' } }, 'Physical quality inspection queue')
      )
    ),
    React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '28px 20px', display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '20px' } },
      // Left: queue
      React.createElement('div', null,
        error && React.createElement('div', { className: 'alert-error', style: { marginBottom: '16px' } }, error),
        // Stats
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' } },
          [['⏳', 'Pending', pending.length, '#854d0e'], ['🔄', 'In Progress', inProgress.length, '#1e40af'], ['✅', 'Approved', approved.length, '#166534'], ['❌', 'Rejected', rejected.length, '#991b1b']].map(([icon, label, val, col]) =>
            React.createElement('div', { key: label, style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: '20px' } }, icon),
              React.createElement('div', { style: { fontSize: '22px', fontWeight: '800', color: col } }, val),
              React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, label)
            )
          )
        ),
        // Tabs
        React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px' } },
          [['pending', '⏳ Pending (' + pending.length + ')'], ['inprogress', '🔄 In Progress (' + inProgress.length + ')'], ['approved', '✅ Approved'], ['rejected', '❌ Rejected']].map(([t, label]) =>
            React.createElement('button', { key: t, onClick: () => setTab(t), style: { padding: '6px 14px', borderRadius: '999px', border: '1.5px solid', cursor: 'pointer', fontSize: '12px', fontWeight: '600', borderColor: tab === t ? '#1e40af' : '#d1d5db', background: tab === t ? '#1e40af' : '#fff', color: tab === t ? '#fff' : '#374151' } }, label)
          )
        ),
        // List
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
          (tab === 'pending' ? pending : tab === 'inprogress' ? inProgress : tab === 'approved' ? approved : rejected).length === 0
            ? React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#9ca3af' } }, 'No inspections in this category.')
            : (tab === 'pending' ? pending : tab === 'inprogress' ? inProgress : tab === 'approved' ? approved : rejected).map(insp => {
                const [bg, col] = STATUS_COLORS[insp.status] || ['#f3f4f6', '#6b7280']
                return React.createElement('div', { key: insp.id, style: { background: '#fff', border: '2px solid ' + (selected && selected.id === insp.id ? '#1e40af' : '#e5e7eb'), borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s' }, onClick: () => openLot(insp) },
                  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
                    React.createElement('div', null,
                      React.createElement('h3', { style: { margin: '0 0 4px 0', fontWeight: '700', fontSize: '16px' } }, insp.cropName),
                      React.createElement('p', { style: { margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' } }, '👨‍🌾 ' + (insp.farmerName || '—')),
                      insp.quantityKg && React.createElement('p', { style: { margin: 0, fontSize: '13px', color: '#374151' } }, '📦 ' + Number(insp.quantityKg).toLocaleString('en-IN') + ' kg (' + (insp.quantityKg / 100).toFixed(1) + 'q)')
                    ),
                    React.createElement('div', { style: { textAlign: 'right' } },
                      React.createElement('span', { style: { background: bg, color: col, padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' } }, insp.status),
                      insp.location && React.createElement('p', { style: { margin: '6px 0 0', fontSize: '12px', color: '#9ca3af' } }, '📍 ' + insp.location)
                    )
                  )
                )
              })
        )
      ),
      // Right: inspection form
      selected && React.createElement('div', { style: { background: '#fff', border: '2px solid #1e40af', borderRadius: '14px', padding: '24px', height: 'fit-content' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('h2', { style: { fontSize: '18px', fontWeight: '800', margin: 0 } }, '🔍 Inspect: ' + selected.cropName),
          React.createElement('button', { onClick: () => setSelected(null), style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9ca3af' } }, '✕')
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' } },
          field('Grade', React.createElement('select', { className: 'input-field', value: form.grade, onChange: e => setForm(f => ({ ...f, grade: e.target.value })) }, React.createElement('option', { value: '' }, 'Select...'), ['A', 'B', 'C', 'D', 'F'].map(g => React.createElement('option', { key: g, value: g }, 'Grade ' + g)))),
          field('Moisture %', React.createElement('input', { type: 'number', className: 'input-field', step: '0.1', min: 0, max: 100, placeholder: '11.5', value: form.moisturePercentage, onChange: e => setForm(f => ({ ...f, moisturePercentage: e.target.value })) })),
          field('Foreign Matter %', React.createElement('input', { type: 'number', className: 'input-field', step: '0.1', min: 0, max: 100, placeholder: '0.8', value: form.foreignMatterPercentage, onChange: e => setForm(f => ({ ...f, foreignMatterPercentage: e.target.value })) })),
          field('Damaged %', React.createElement('input', { type: 'number', className: 'input-field', step: '0.1', min: 0, max: 100, placeholder: '1.2', value: form.damagedPercentage, onChange: e => setForm(f => ({ ...f, damagedPercentage: e.target.value })) })),
          field('Verified Weight (kg)', React.createElement('input', { type: 'number', className: 'input-field', min: 0, placeholder: '5000', value: form.weightKg, onChange: e => setForm(f => ({ ...f, weightKg: e.target.value })) })),
          field('Appearance', React.createElement('input', { type: 'text', className: 'input-field', placeholder: 'e.g. Good color, uniform size', value: form.appearance, onChange: e => setForm(f => ({ ...f, appearance: e.target.value })) }))
        ),
        React.createElement('div', { style: { marginBottom: '20px' } },
          React.createElement('label', { className: 'form-label' }, 'Remarks'),
          React.createElement('textarea', { className: 'input-field', rows: 3, placeholder: 'Inspection notes...', value: form.remarks, onChange: e => setForm(f => ({ ...f, remarks: e.target.value })), style: { resize: 'vertical' } })
        ),
        msg && React.createElement('div', { className: msg.startsWith('✅') ? 'alert-success' : 'alert-error', style: { marginBottom: '16px', fontSize: '13px' } }, msg),
        React.createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
          React.createElement('button', { onClick: () => submitInspection('APPROVED'), disabled: submitting, style: { flex: 1, padding: '11px', background: '#166534', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' } }, submitting ? '...' : '✅ Approve Lot'),
          React.createElement('button', { onClick: () => submitInspection('REJECTED'), disabled: submitting, style: { flex: 1, padding: '11px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' } }, submitting ? '...' : '❌ Reject Lot'),
          React.createElement('button', { onClick: () => submitInspection('REINSPECTION_REQUIRED'), disabled: submitting, style: { padding: '11px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' } }, '🔁 Reinspect')
        )
      )
    )
  )
}

function field(label, input) {
  return React.createElement('div', null,
    React.createElement('label', { className: 'form-label', style: { fontSize: '12px' } }, label),
    input
  )
}

module.exports = InspectorDashboard
