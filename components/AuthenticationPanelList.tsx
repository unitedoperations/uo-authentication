import * as React from 'react'
import { Card } from 'semantic-ui-react'
import AuthenticationPanel from './AuthenticationPanel'

const methods = [
  {
    name: 'Discord',
    image: 'Discord-Logo-Color.png'
  },
  {
    name: 'Forums',
    image: 'uo-logo.png'
  },
  {
    name: 'TeamSpeak',
    image: 'ts_stacked_blueblack.png'
  }
]

class AuthenticationPanelList extends React.Component {
  render() {
    return (
      <Card.Group className="auth-method--group">
        {methods.map((m, i) => (
          <AuthenticationPanel key={i} name={m.name} image={m.image} />
        ))}
      </Card.Group>
    )
  }
}

export default AuthenticationPanelList
