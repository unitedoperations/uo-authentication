import * as React from 'react'
import * as EventEmitter from 'events'
import { Header, Icon } from 'semantic-ui-react'
import Page from '../components/Page'
import Charter from '../components/Charter'
import AuthenticationPanelList from '../components/AuthenticationPanelList'
import 'semantic-ui-css/semantic.min.css'
import '../static/styles.css'

export const emitter = new EventEmitter()

export interface IndexPageProps {
  socket: SocketIO.Socket
}

export interface IndexPageState {
  charterComplete: boolean
}

class Home extends React.Component<IndexPageProps, IndexPageState> {
  state = {
    charterComplete: false
  }

  constructor(props: IndexPageProps) {
    super(props)

    emitter.on('agreement', accepted => {
      this.setState({ charterComplete: accepted })
    })
  }

  render() {
    return (
      <Page title="UO Member Authentication">
        <Header as="h3" textAlign="center" icon>
          <Icon name="users" circular />
          <Header.Content>United Operations User Authentication</Header.Content>
        </Header>
        <Charter />
        <AuthenticationPanelList enabled={this.state.charterComplete} socket={this.props.socket} />
      </Page>
    )
  }
}

export default Home
