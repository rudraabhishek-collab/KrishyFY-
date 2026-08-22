const React = require('react')

function AdminCropsPage() {
  return React.createElement(
    'div',
    { className: 'admin-page' },
    React.createElement('h1', null, 'Crop Management'),
    React.createElement('p', null, 'Manage crop listings'),
    React.createElement(
      'div',
      { className: 'crop-table' },
      React.createElement('table', null,
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Name'),
            React.createElement('th', null, 'Category'),
            React.createElement('th', null, 'Price'),
            React.createElement('th', null, 'Quantity'),
            React.createElement('th', null, 'Status'),
            React.createElement('th', null, 'Actions')
          )
        ),
        React.createElement('tbody', null,
          React.createElement('tr', null,
            React.createElement('td', null, 'Organic Tomatoes'),
            React.createElement('td', null, 'Vegetables'),
            React.createElement('td', null, '$2.50'),
            React.createElement('td', null, '100 kg'),
            React.createElement('td', null, 'ACTIVE'),
            React.createElement('td', null,
              React.createElement('button', { className: 'btn-edit' }, 'Edit'),
              React.createElement('button', { className: 'btn-delete' }, 'Delete')
            )
          ),
          React.createElement('tr', null,
            React.createElement('td', null, 'Free-range Eggs'),
            React.createElement('td', null, 'Poultry'),
            React.createElement('td', null, '$3.00'),
            React.createElement('td', null, '50 doz'),
            React.createElement('td', null, 'ACTIVE'),
            React.createElement('td', null,
              React.createElement('button', { className: 'btn-edit' }, 'Edit'),
              React.createElement('button', { className: 'btn-delete' }, 'Delete')
            )
          )
        )
      )
    )
  )
}

module.exports = AdminCropsPage
