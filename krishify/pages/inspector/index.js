const React = require('react')

function InspectorDashboardPage() {
  return React.createElement(
    'div',
    { className: 'admin-page' },
    React.createElement('h1', null, 'Inspection Queue'),
    React.createElement('p', null, 'Manage physical quality inspections'),
    React.createElement(
      'div',
      { className: 'inspection-queue' },
      React.createElement('table', null,
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Crop'),
            React.createElement('th', null, 'Farmer'),
            React.createElement('th', null, 'Quantity'),
            React.createElement('th', null, 'Status'),
            React.createElement('th', null, 'Actions')
          )
        ),
        React.createElement('tbody', null,
          React.createElement('tr', null,
            React.createElement('td', null, 'Wheat Lot #KRF-001'),
            React.createElement('td', null, 'Rudraabhishek'),
            React.createElement('td', null, '5,000 kg'),
            React.createElement('td', null, 'Pending'),
            React.createElement('td', null,
              React.createElement('button', { className: 'btn-open' }, 'Open')
            )
          ),
          React.createElement('tr', null,
            React.createElement('td', null, 'Wheat Lot #KRF-002'),
            React.createElement('td', null, 'Jane Farmer'),
            React.createElement('td', null, '3,000 kg'),
            React.createElement('td', null, 'In Progress'),
            React.createElement('td', null,
              React.createElement('button', { className: 'btn-open' }, 'Open')
            )
          )
        )
      )
    )
  )
}

module.exports = InspectorDashboardPage
