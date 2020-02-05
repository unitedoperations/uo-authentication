import React from 'react'
import Head from 'next/head'

interface PageProps {
  title?: string
  children: React.ReactNode
}

const Page: React.FunctionComponent<PageProps> = props => (
  <div style={{ marginTop: '2em' }}>
    <Head>
      <title>{props.title || 'United Operations'}</title>
    </Head>
    {props.children}
  </div>
)

export default Page
