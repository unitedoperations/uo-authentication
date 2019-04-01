import * as React from 'react'
import Link from 'next/link'
import { Card, Image, Label, Icon, Button, SemanticCOLORS, SemanticICONS } from 'semantic-ui-react'

export interface AuthenticationPanelProps {
  name: string
  image: string
  enabled: boolean
  status: string
  link: string
}

export interface AuthenticationPanelState {
  labelColor: SemanticCOLORS
  labelIcon: SemanticICONS
  clicked: boolean
}

const labelMapping = {
  unstarted: {
    color: 'red',
    icon: 'x'
  },
  failed: {
    color: 'red',
    icon: 'x'
  },
  pending: {
    color: 'yellow',
    icon: 'clock'
  },
  success: {
    color: 'green',
    icon: 'check'
  }
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
    if (props.status === 'unstarted') return null
    return {
      labelColor: labelMapping[props.status].color,
      labelIcon: labelMapping[props.status].icon
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
              <Link href={this.props.link}>
                <a target="_blank" style={{ flex: 1 }}>
                  <span>{this.props.name}</span>
                </a>
              </Link>
              <Image src={`/static/${this.props.image}`} size="mini" />
            </div>
          </Card.Header>
          <Card.Content textAlign="center">
            {this.props.enabled && (
              <Link href={`/api/oauth2/${this.props.name.toLowerCase()}`}>
                <a target="_blank">
                  <Button
                    onClick={this.handleButtonClick}
                    labelPosition="left"
                    color="green"
                    icon
                    fluid
                  >
                    <Icon name="lock open" />
                    Authenticate
                  </Button>
                </a>
              </Link>
            )}
            {!this.props.enabled && (
              <Button disabled={true} labelPosition="left" icon fluid>
                <Icon name="lock" />
                Authenticate
              </Button>
            )}
          </Card.Content>
        </Card.Content>
      </Card>
    )
  }
}

export default AuthenticationPanel
