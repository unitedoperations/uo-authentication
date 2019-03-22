import * as React from 'react'
import App, { Container } from 'next/app'
import io from 'socket.io-client'

export interface UOAuthenticationAppState {
  socket: SocketIOClient.Socket
}

class UOAuthenticationApp extends App<any, UOAuthenticationAppState> {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    return { pageProps }
  }

  state = {
    socket: null
  }

  componentDidMount() {
    const socket = io('https://auth.unitedoperations.net', {
      autoConnect: false
    })
    this.setState({ socket })
  }

  componentWillUnmount() {
    this.state.socket.close()
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <Container>
        <Component {...pageProps} socket={this.state.socket} />
      </Container>
    )
  }
}

export default UOAuthenticationApp
