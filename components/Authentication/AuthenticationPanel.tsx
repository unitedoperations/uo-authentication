import React from 'react'
import Link from 'next/link'
import { Card, Image, Label, Icon, Button, SemanticCOLORS, SemanticICONS } from 'semantic-ui-react'

export interface AuthenticationPanelProps {
  name: string
  image: string
  enabled: boolean
  status: string
  link: string
}

const labelMapping: Record<string, any> = {
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

const AuthenticationPanel: React.FunctionComponent<AuthenticationPanelProps> = props => {
  const [color, setColor] = React.useState('red' as SemanticCOLORS)
  const [icon, setIcon] = React.useState('x' as SemanticICONS)

  React.useEffect(() => {
    if (props.status) {
      setColor(labelMapping[props.status].color)
      setIcon(labelMapping[props.status].icon)
    }
  }, [])

  return (
    <Card className={`auth-method__panel auth-method--${props.name.toLowerCase()}`}>
      <Card.Content>
        <Label color={color} circular floating>
          <Icon name={icon} />
        </Label>
        <Card.Header>
          <div style={styles.headerWrapper}>
            <Link href={props.link}>
              <a target="_blank" style={{ flex: 1 }}>
                <span>{props.name}</span>
              </a>
            </Link>
            <Image src={`/${props.image}`} size="mini" />
          </div>
        </Card.Header>
        <Card.Content textAlign="center">
          {props.enabled && (
            <Link href={`/api/oauth2/${props.name.toLowerCase()}`}>
              <a target="_blank">
                <Button
                  onClick={() => {
                    setColor('yellow')
                    setIcon('clock')
                  }}
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
          {!props.enabled && (
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

const styles: Record<string, React.CSSProperties> = {
  headerWrapper: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '1em',
    height: '4em'
  }
}

export default AuthenticationPanel
