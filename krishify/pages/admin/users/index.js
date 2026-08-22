const React = require('react')

function AdminUsersPage() {
  return React.createElement(
    'div',
    { className: 'admin-page' },
    React.createElement('h1', null, 'User Management'),
    React.createElement('p', null, 'Admin dashboard for managing users'),
    React.createElement(
      'div',
      { className: 'users-table' },
      React.createElement('table', null,
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Name'),
            React.createElement('th', null, 'Email'),
            React.createElement('th', null, 'Role'),
            React.createElement('th', null, 'Joined'),
            React.createElement('th', null, 'Actions')
          )
        ),
        React.createElement('tbody', null,
          React.createElement('tr', null,
            React.createElement('td', null, 'Farmer John'),
            React.createElement('td', null, 'john@farms.com'),
            React.createElement('td', null, 'farmer'),
            React.createElement('td', null, '2024-01-15'),
            React.createElement('td', null,
              React.createElement('button', { className: 'btn-edit' }, 'Edit'),
              React.createElement('button', { className: 'btn-delete' }, 'Delete')
            )
          ),
          React.createElement('tr', null,
            React.createElement('td', null, 'Buyer Jane'),
            React.createElement('td', null, 'jane@buy.com'),
            React.createElement('td', null, 'buyer'),
            React.createElement('td', null, '2024-02-20'),
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

module.exports = AdminUsersPage
