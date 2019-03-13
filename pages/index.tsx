import * as React from 'react'
import * as EventEmitter from 'events'
import { Container, Header, Icon, Message, Label } from 'semantic-ui-react'
import Page from '../components/Page'
import Charter from '../components/Charter'
import AuthenticationPanelList from '../components/AuthenticationPanelList'
import CompletionModal from '../components/CompletionModal'
import CookiePolicy from '../components/CookiePolicy'
import 'semantic-ui-css/semantic.min.css'
import '../static/styles.css'

export const emitter = new EventEmitter()

export interface IndexPageProps {
  socket: SocketIOClient.Socket
}

export interface IndexPageState {
  charterComplete: boolean
  authenticationDone: boolean
  username: string
  showGroups: boolean
  willTransfer: string[]
  wontTransfer: string[]
}

class Home extends React.Component<IndexPageProps, IndexPageState> {
  state = {
    charterComplete: false,
    authenticationDone: false,
    username: '',
    showGroups: false,
    willTransfer: [],
    wontTransfer: []
  }

  setCharterComplete = (accepted: boolean) => this.setState({ charterComplete: accepted })

  setAuthenticationDone = (username: string) => {
    this.setState({ authenticationDone: true, username })
  }

  handleGroupTransfers = ({ will, wont }: { will: string[]; wont: string[] }) => {
    this.setState({ showGroups: true, willTransfer: will, wontTransfer: wont })
  }

  componentDidMount() {
    emitter.on('agreement', this.setCharterComplete)
    emitter.on('done', this.setAuthenticationDone)
    emitter.on('groups', this.handleGroupTransfers)
  }

  componentWillUnmount() {
    emitter.off('agreement', this.setCharterComplete)
    emitter.off('done', this.setAuthenticationDone)
    emitter.off('groups', this.handleGroupTransfers)
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
              {this.state.showGroups && (
                <Message icon>
                  <Icon name="id card" />
                  <Message.Content>
                    <Message.Header>Platform Groups</Message.Header>
                    The following green groups <em>will</em> be assigned on their respective
                    platforms, and the red groups <em>will not</em> be automatically reassigned on
                    the supported platforms due to risk and security purposes. Please contact and
                    officer to be manually reassigned to the groups indicated by the red labels on
                    each supporting platform.
                    <br />
                    <br />
                    <Label.Group color="green">
                      {this.state.willTransfer.map((g: string, i: number) => (
                        <Label key={i}>{g}</Label>
                      ))}
                    </Label.Group>
                    <Label.Group color="red">
                      {this.state.wontTransfer.map((g: string, i: number) => (
                        <Label key={i}>{g}</Label>
                      ))}
                    </Label.Group>
                  </Message.Content>
                </Message>
              )}
            </>
          )}
          <CompletionModal open={this.state.authenticationDone} username={this.state.username} />
        </Container>
        <CookiePolicy />
      </Page>
    )
  }
}

export default Home
