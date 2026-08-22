const React = require('react')

function AdminReviewsPage() {
  return React.createElement(
    'div',
    { className: 'admin-page' },
    React.createElement('h1', null, 'Review Moderation'),
    React.createElement('p', null, 'Moderate and manage user reviews'),
    React.createElement(
      'div',
      { className: 'reviews-table' },
      React.createElement('table', null,
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'User'),
            React.createElement('th', null, 'Rating'),
            React.createElement('th', null, 'Title'),
            React.createElement('th', null, 'Status'),
            React.createElement('th', null, 'Created'),
            React.createElement('th', null, 'Actions')
          )
        ),
        React.createElement('tbody', null,
          React.createElement('tr', null,
            React.createElement('td', null, 'John Doe'),
            React.createElement('td', null, '5/5'),
            React.createElement('td', null, 'Great product!'),
            React.createElement('td', null, 'PENDING'),
            React.createElement('td', null, '2024-01-20'),
            React.createElement('td', null,
              React.createElement('select', null,
                React.createElement('option', null, 'Approve'),
                React.createElement('option', null, 'Reject'),
                React.createElement('option', null, 'Flag')
              ),
              React.createElement('input', { type: 'text', className: 'moderator-response', placeholder: 'Response...' }),
              React.createElement('button', { className: 'btn-moderate' }, 'Moderate')
            )
          ),
          React.createElement('tr', null,
            React.createElement('td', null, 'Jane Smith'),
            React.createElement('td', null, '3/5'),
            React.createElement('td', null, 'Could be better'),
            React.createElement('td', null, 'APPROVED'),
            React.createElement('td', null, '2024-01-18'),
            React.createElement('td', null, '-')
          )
        )
      )
    )
  )
}

module.exports = AdminReviewsPage
