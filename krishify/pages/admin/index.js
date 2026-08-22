const React = require('react')

function AdminDashboardPage() {
  return React.createElement(
    'div',
    { className: 'admin-dashboard' },
    React.createElement(
      'h1',
      null,
      'Admin Dashboard'
    ),
    React.createElement(
      'div',
      { className: 'dashboard-stats' },
      React.createElement('div', { className: 'stat-card' },
        React.createElement('h3', null, 'Total Users'),
        React.createElement('p', null, '1,247')
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('h3', null, 'Active Crops'),
        React.createElement('p', null, '342')
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('h3', null, 'Open Auctions'),
        React.createElement('p', null, '12')
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('h3', null, 'Pending Orders'),
        React.createElement('p', null, '28')
      )
    ),
    React.createElement(
      'div',
      { className: 'dashboard-recent' },
      React.createElement('h2', null, 'Recent Activity'),
      React.createElement('ul', { className: 'activity-list' },
        React.createElement('li', null, 'New user registered: Jane Smith'),
        React.createElement('li', null, 'Crop listing updated: Organic Tomatoes'),
        React.createElement('li', null, 'Order #ORD-002 shipped'),
        React.createElement('li', null, 'New review submitted')
      )
    )
  )
}

module.exports = AdminDashboardPage
