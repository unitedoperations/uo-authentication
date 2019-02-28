import * as React from 'react'
import Link from 'next/link'
import { Card, Image, Label, Icon, Button, SemanticCOLORS, SemanticICONS } from 'semantic-ui-react'

export interface AuthenticationPanelProps {
  name: string
  image: string
  enabled: boolean
  status: string
}

export interface AuthenticationPanelState {
  labelColor: SemanticCOLORS
  labelIcon: SemanticICONS
  clicked: boolean
}

class AuthenticationPanel extends React.Component<
  AuthenticationPanelProps,
  AuthenticationPanelState
> {
  state = {
    clicked: false,
    labelColor: 'red' as SemanticCOLORS,
    labelIcon: 'x' as SemanticICONS
  }

  static getDerivedStateFromProps(
    props: AuthenticationPanelProps,
    _state: AuthenticationPanelState
  ) {
    return {
      labelColor:
        props.status === 'unstarted' ? 'red' : props.status === 'pending' ? 'yellow' : 'green',
      labelIcon: props.status === 'unstarted' ? 'x' : props.status === 'pending' ? 'clock' : 'check'
    }
  }

  handleButtonClick = () => {
    this.setState({ clicked: true, labelColor: 'yellow', labelIcon: 'clock' })
  }

  render() {
    return (
      <Card className={`auth-method__panel auth-method--${this.props.name.toLowerCase()}`}>
        <Card.Content>
          <Label color={this.state.labelColor} circular floating>
            <Icon name={this.state.labelIcon} />
          </Label>
          <Card.Header>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingBottom: '1em',
                height: '4em'
              }}
            >
              <span style={{ flex: 1 }}>{this.props.name}</span>
              <Image src={`/static/${this.props.image}`} size="mini" />
            </div>
          </Card.Header>
          <Card.Content textAlign="center">
            <Link href={`/auth/${this.props.name.toLowerCase()}`}>
              <a target="_blank">
                <Button
                  onClick={this.handleButtonClick}
                  disabled={false}
                  labelPosition="left"
                  color="green"
                  icon
                  fluid
                >
                  <Icon name={this.props.enabled ? 'lock open' : 'lock'} />
                  Authenticate
                </Button>
              </a>
            </Link>
          </Card.Content>
        </Card.Content>
      </Card>
    )
  }
}

export default AuthenticationPanel
