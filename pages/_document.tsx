import * as React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'

class SpireDocument extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <meta name="theme-color" content="#b19e71" />
          <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
          <meta
            name="description"
            content="United Operations gaming community user authentcation system"
          />
          <link rel="manifest" href="/static/manifest.json" />
          <link rel="shortcut icon" href="/static/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}

export default SpireDocument
