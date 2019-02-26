import * as React from 'react'
import Link from 'next/link'
import Page from '../components/Page'

class Home extends React.Component {
  render() {
    return (
      <Page>
        <div>
          <Link href="/auth/discord">
            <div>Discord Authentication</div>
          </Link>
          <span>Home Page</span>
        </div>
      </Page>
    )
  }
}

export default Home
