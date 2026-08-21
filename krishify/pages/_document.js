const React = require('react')
const Document = require('next/document')

function MyDocument({ children }) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      'html',
      null,
      React.createElement(
        'body',
        null,
        React.createElement('div', { id: '__next' }, children)
      )
    )
  )
}

MyDocument.getInitialProps = Document.getInitialProps

module.exports = MyDocument