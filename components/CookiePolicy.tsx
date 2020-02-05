import React from 'react'
import { Card, Sticky, Button } from 'semantic-ui-react'

const CookiePolicy: React.FunctionComponent = () => {
  const [visible, setVisible] = React.useState(true)

  return (
    <Sticky bottomOffset={10} styleElement={stickyStyle}>
      {visible && (
        <Card fluid>
          <Card.Content>
            <Card.Header>🍪 Cookie Policy &amp; Usage</Card.Header>
            <Card.Description>
              In this application, United Operations uses cookies for the sole purpose of tracking and maintaining the
              state of your authentication session. No personal information is stored or accessible from with the
              cookie's that are enabled and are only reachable from a secure TLS connection to the UO Authenticator's
              server.
            </Card.Description>
            <Button onClick={() => setVisible(false)} color="blue" floated="right">
              Accept Cookies
            </Button>
          </Card.Content>
        </Card>
      )}
    </Sticky>
  )
}

const stickyStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 10,
  left: 10,
  maxWidth: '30em'
}

export default CookiePolicy
