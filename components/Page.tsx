import * as React from 'react'
import Head from 'next/head'
import { Container } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

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
        <Container>{this.props.children}</Container>
      </div>
    )
  }
}

export default Page
