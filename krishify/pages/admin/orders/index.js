const React = require('react')

function AdminOrdersPage() {
  return React.createElement(
    'div',
    { className: 'admin-page' },
    React.createElement('h1', null, 'Order Management'),
    React.createElement('p', null, 'View and manage customer orders'),
    React.createElement(
      'div',
      { className: 'order-table' },
      React.createElement('table', null,
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Order ID'),
            React.createElement('th', null, 'Customer'),
            React.createElement('th', null, 'Total'),
            React.createElement('th', null, 'Status'),
            React.createElement('th', null, 'Created'),
            React.createElement('th', null, 'Actions')
          )
        ),
        React.createElement('tbody', null,
          React.createElement('tr', null,
            React.createElement('td', null, '#ORD-001'),
            React.createElement('td', null, 'John Doe'),
            React.createElement('td', null, '$45.50'),
            React.createElement('td', null, 'PROCESSING'),
            React.createElement('td', null, '2024-01-20'),
            React.createElement('td', null,
              React.createElement('button', { className: 'btn-view' }, 'View'),
              React.createElement('button', { className: 'btn-update' }, 'Update Status')
            )
          ),
          React.createElement('tr', null,
            React.createElement('td', null, '#ORD-002'),
            React.createElement('td', null, 'Jane Smith'),
            React.createElement('td', null, '$89.99'),
            React.createElement('td', null, 'PENDING'),
            React.createElement('td', null, '2024-01-18'),
            React.createElement('td', null,
              React.createElement('button', { className: 'btn-view' }, 'View'),
              React.createElement('button', { className: 'btn-update' }, 'Update Status')
            )
          )
        )
      )
    )
  )
}

module.exports = AdminOrdersPage
