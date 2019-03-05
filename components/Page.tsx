import * as React from 'react'
import Head from 'next/head'
import 'semantic-ui-css/semantic.min.css'

interface IPageProps {
  title?: string
  children: React.ReactNode
}

class Page extends React.PureComponent<IPageProps> {
  render() {
    return (
      <div style={{ marginTop: '2em' }}>
        <Head>
          <title>{this.props.title || 'United Operations'}</title>
        </Head>
        {this.props.children}
      </div>
    )
  }
}

export default Page
