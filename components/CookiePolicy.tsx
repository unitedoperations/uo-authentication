import * as React from 'react'
import { Card, Sticky, Button } from 'semantic-ui-react'

export interface CookiePolicyState {
  visible: boolean
}

class CookiePolicy extends React.Component<{}, CookiePolicyState> {
  state = {
    visible: true
  }

  handleAcceptClick = () => {
    this.setState({ visible: false })
  }

  render() {
    return (
      <Sticky
        bottomOffset={10}
        styleElement={{ position: 'absolute', bottom: 10, left: 10, maxWidth: '30em' }}
      >
        {this.state.visible && (
          <Card fluid>
            <Card.Content>
              <Card.Header>🍪 Cookie Policy &amp; Usage</Card.Header>
              <Card.Description>
                In this application, United Operations uses cookies for the sole purpose of tracking
                and maintaining the state of your authentication session. No personal information is
                stored or accessible from with the cookie's that are enabled and are only reachable
                from a secure TLS connection to the UO Authenticator's server.
              </Card.Description>
              <Button onClick={this.handleAcceptClick} color="blue" floated="right">
                Accept Cookies
              </Button>
            </Card.Content>
          </Card>
        )}
      </Sticky>
    )
  }
}

export default CookiePolicy
