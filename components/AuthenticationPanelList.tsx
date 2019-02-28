import * as React from 'react'
import { Card } from 'semantic-ui-react'
import AuthenticationPanel from './AuthenticationPanel'
import { AuthenticationProvider, AuthenticationAttempt } from '../server'

export interface AuthenticationPanelListProps {
  socket: any
}

export type AuthMethod = {
  name: string
  image: string
  enabled: boolean
  status: string
}

export interface AuthenticationPanelListState {
  subscribed: boolean
  methods: Record<AuthenticationProvider, AuthMethod>
}

class AuthenticationPanelList extends React.Component<
  AuthenticationPanelListProps,
  AuthenticationPanelListState
> {
  state = {
    subscribed: false,
    methods: {
      discord: {
        name: 'Discord',
        image: 'Discord-Logo-Color.png',
        enabled: false,
        status: 'unstarted'
      },
      forums: {
        name: 'Forums',
        image: 'uo-logo.png',
        enabled: false,
        status: 'unstarted'
      },
      teamspeak: {
        name: 'TeamSpeak',
        image: 'ts_stacked_blueblack.png',
        enabled: false,
        status: 'unstarted'
      }
    }
  }

  subscribe = () => {
    if (!this.state.subscribed) {
      this.props.socket.on('auth_attempt', this.handleAuthAttempt)
      this.setState({ subscribed: true })
    }
  }

  handleAuthAttempt = (data: AuthenticationAttempt) => {
    if (!data.success) {
      this.setState(prev => ({
        methods: {
          ...prev.methods,
          [data.provider]: { status: 'unstarted', ...prev.methods[data.provider] }
        }
      }))
    }
  }

  render() {
    return (
      <Card.Group className="auth-method--group">
        {Object.values(this.state.methods).map((m: AuthMethod, i: number) => (
          <AuthenticationPanel
            key={i}
            enabled={true}
            status={m.status}
            name={m.name}
            image={m.image}
          />
        ))}
      </Card.Group>
    )
  }
}

export default AuthenticationPanelList
