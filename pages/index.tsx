import * as React from 'react'
import Page from '../components/Page'
import AuthenticationPanelList from '../components/AuthenticationPanelList'
import 'semantic-ui-css/semantic.min.css'
import '../static/styles.css'

export interface IndexPageProps {
  socket: SocketIO.Socket
}

class Home extends React.Component<IndexPageProps> {
  render() {
    return (
      <Page title="UO Member Authentication">
        <AuthenticationPanelList enabled={true} socket={this.props.socket} />
      </Page>
    )
  }
}

export default Home
