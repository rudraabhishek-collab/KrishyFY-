const React = require('react')
const Navbar = require('../components/Navbar')
require('../styles/globals.css')

function MyApp({ Component, pageProps, router }) {
  const path = (router && router.pathname) || '/'
  const hideNav = path === '/'

  return React.createElement(React.Fragment, null,
    !hideNav && React.createElement(Navbar),
    React.createElement('main', null,
      React.createElement(Component, pageProps)
    )
  )
}

module.exports = MyApp
