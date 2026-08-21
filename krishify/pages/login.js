const React = require('react')

function LoginPage() {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-background px-6 py-12 md:px-12 lg:px-20' },
    React.createElement(
      'div',
      { className: 'max-w-md mx-auto bg-white rounded-lg p-8 shadow-md' },
      React.createElement('h2', { className: 'text-3xl font-bold text-primary mb-6 text-center' }, 'Welcome back to Krishify'),
      React.createElement(
        'form',
        { className: 'space-y-6' },
        React.createElement('p', { className: 'text-sm text-center text-gray-500 mt-3' }, 'Simple login page')
      )
    ),
  )
}

module.exports = LoginPage
