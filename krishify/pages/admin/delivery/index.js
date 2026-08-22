const React = require('react')

function AdminDeliveryPage() {
  return React.createElement(
    'div',
    { className: 'admin-page' },
    React.createElement('h1', null, 'Delivery Management'),
    React.createElement('p', null, 'Track delivery status'),
    React.createElement(
      'div',
      { className: 'delivery-table' },
      React.createElement('table', null,
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Order'),
            React.createElement('th', null, 'Recipient'),
            React.createElement('th', null, 'Address'),
            React.createElement('th', null, 'Status'),
            React.createElement('th', null, 'Created'),
            React.createElement('th', null, 'Actions')
          )
        ),
        React.createElement('tbody', null,
          React.createElement('tr', null,
            React.createElement('td', null, '#ORD-001'),
            React.createElement('td', null, 'John Doe'),
            React.createElement('td', null, '123 Farm St'),
            React.createElement('td', null, 'IN_TRANSIT'),
            React.createElement('td', null, '2024-01-20'),
            React.createElement('td', null,
              React.createElement('button', { className: 'btn-track' }, 'Track')
            )
          ),
          React.createElement('tr', null,
            React.createElement('td', null, '#ORD-002'),
            React.createElement('td', null, 'Jane Smith'),
            React.createElement('td', null, '456 Buy Ave'),
            React.createElement('td', null, 'DELIVERED'),
            React.createElement('td', null, '2024-01-18'),
            React.createElement('td', null, '-')
          )
        )
      )
    )
  )
}

module.exports = AdminDeliveryPage
