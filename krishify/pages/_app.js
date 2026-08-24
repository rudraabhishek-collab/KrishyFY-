const React = require('react')
const Navbar = require('../components/Navbar')
require('../styles/globals.css')

function MyApp({ Component, pageProps }) {
  return React.createElement(React.Fragment, null,
    React.createElement(Navbar),
    React.createElement('main', null,
      React.createElement(Component, pageProps)
    )
  )
}

module.exports = MyApp
