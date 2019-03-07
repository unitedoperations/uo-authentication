import * as React from 'react'
import * as EventEmitter from 'events'
import { Container, Header, Icon, Message } from 'semantic-ui-react'
import Page from '../components/Page'
import Charter from '../components/Charter'
import AuthenticationPanelList from '../components/AuthenticationPanelList'
import CompletionModal from '../components/CompletionModal'
import 'semantic-ui-css/semantic.min.css'
import '../static/styles.css'

export const emitter = new EventEmitter()

export interface IndexPageProps {
  socket: SocketIO.Socket
}

export interface IndexPageState {
  charterComplete: boolean
  authenticationDone: boolean
  username: string
}

class Home extends React.Component<IndexPageProps, IndexPageState> {
  state = {
    charterComplete: false,
    authenticationDone: false,
    username: ''
  }

  setCharterComplete = (accepted: boolean) => this.setState({ charterComplete: accepted })

  setAuthenticationDone = (username: string) => {
    this.setState({ authenticationDone: true, username })
  }

  componentDidMount() {
    emitter.on('agreement', this.setCharterComplete)
    emitter.on('done', this.setAuthenticationDone)
  }

  componentWillUnmount() {
    emitter.off('agreement', this.setCharterComplete)
    emitter.off('done', this.setAuthenticationDone)
  }

  render() {
    return (
      <Page title="UO Member Authentication">
        <Header as="h3" textAlign="center" icon>
          <Icon name="users" circular />
          <Header.Content>United Operations User Authentication</Header.Content>
        </Header>
        <Charter />
        <Container>
          {this.state.charterComplete && (
            <>
              <Message icon>
                <Icon name="warning" />
                <Message.Content>
                  <Message.Header>Note</Message.Header>
                  Prior to executing the Teamspeak authentication provider, be sure that you are
                  currently logged into the United Operations Teamspeak server!
                </Message.Content>
              </Message>
              <AuthenticationPanelList
                enabled={this.state.charterComplete}
                socket={this.props.socket}
              />
            </>
          )}
          <CompletionModal open={this.state.authenticationDone} username={this.state.username} />
        </Container>
      </Page>
    )
  }
}

export default Home
