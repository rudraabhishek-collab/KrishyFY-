const React = require('react')

function AdminAuctionsPage() {
  return React.createElement(
    'div',
    { className: 'admin-page' },
    React.createElement('h1', null, 'Auction Monitoring'),
    React.createElement('p', null, 'Monitor active and completed auctions'),
    React.createElement(
      'div',
      { className: 'auction-table' },
      React.createElement('table', null,
        React.createElement('thead', null,
          React.createElement('tr', null,
            React.createElement('th', null, 'Title'),
            React.createElement('th', null, 'Starting Price'),
            React.createElement('th', null, 'Current Price'),
            React.createElement('th', null, 'Highest Bidder'),
            React.createElement('th', null, 'Status'),
            React.createElement('th', null, 'Ends At'),
            React.createElement('th', null, 'Actions')
          )
        ),
        React.createElement('tbody', null,
          React.createElement('tr', null,
            React.createElement('td', null, 'Organic Tomatoes'),
            React.createElement('td', null, '$25.00'),
            React.createElement('td', null, '$32.50'),
            React.createElement('td', null, 'john@farms.com'),
            React.createElement('td', null, 'ACTIVE'),
            React.createElement('td', null, '2024-01-30 14:00'),
            React.createElement('td', null,
              React.createElement('button', { className: 'btn-view' }, 'View'),
              React.createElement('button', { className: 'btn-end' }, 'End Auction')
            )
          ),
          React.createElement('tr', null,
            React.createElement('td', null, 'Free-range Eggs'),
            React.createElement('td', null, '$30.00'),
            React.createElement('td', null, '$45.00'),
            React.createElement('td', null, 'jane@buy.com'),
            React.createElement('td', null, 'COMPLETED'),
            React.createElement('td', null, '2024-01-28 18:00'),
            React.createElement('td', null, '-')
          )
        )
      )
    )
  )
}

module.exports = AdminAuctionsPage
