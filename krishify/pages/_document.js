const React = require('react')
const { Html, Head, Main, NextScript } = require('next/document')
const Document = require('next/document').default

class MyDocument extends Document {
  render() {
    return React.createElement(
      Html,
      { lang: 'en' },
      React.createElement(Head),
      React.createElement(
        'body',
        null,
        React.createElement(Main),
        React.createElement(NextScript)
      )
    )
  }
}

module.exports = MyDocument
