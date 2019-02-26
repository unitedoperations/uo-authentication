import * as React from 'react'
import Head from 'next/head'

interface IPageProps {
  title?: string
  children: React.ReactNode
}

class Page extends React.PureComponent<IPageProps> {
  render() {
    return (
      <div>
        <Head>
          <title>{this.props.title || 'United Operations'}</title>
        </Head>
        {this.props.children}
      </div>
    )
  }
}

export default Page
