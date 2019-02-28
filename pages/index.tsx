import * as React from 'react'
import Page from '../components/Page'
import AuthenticationPanelList from '../components/AuthenticationPanelList'
import 'semantic-ui-css/semantic.min.css'
import '../static/styles.css'

class Home extends React.Component {
  render() {
    return (
      <Page title="UO Member Authentication">
        <AuthenticationPanelList />
      </Page>
    )
  }
}

export default Home
