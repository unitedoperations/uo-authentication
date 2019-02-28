import * as React from 'react'
import { Card, Image, Label, Icon } from 'semantic-ui-react'

export interface IAuthenticationPanelProps {
  name: string
  image: string
}

class AuthenticationPanel extends React.Component<IAuthenticationPanelProps> {
  render() {
    return (
      <Card className={`auth-method__panel auth-method--${this.props.name.toLowerCase()}`}>
        <Card.Content>
          <Label color="red" circular floating>
            <Icon name="x" />
          </Label>
          <Card.Header>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{this.props.name}</span>
              <Image src={`/static/${this.props.image}`} size="mini" />
            </div>
          </Card.Header>
        </Card.Content>
      </Card>
    )
  }
}

export default AuthenticationPanel
