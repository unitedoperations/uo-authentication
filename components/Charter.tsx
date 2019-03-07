import * as React from 'react'
import { Container, Message, Icon, Checkbox } from 'semantic-ui-react'
import { emitter } from '../pages/index'

export interface CharterState {
  charterClicked: boolean
  sopsClicked: boolean
  canAccept: boolean
  accepted: boolean
}

class Charter extends React.Component<{}, CharterState> {
  state = {
    charterClicked: false,
    sopsClicked: false,
    canAccept: false,
    accepted: false
  }

  handleLinkClicked = (link: string) => {
    if (link === 'charter') this.setState({ charterClicked: true }, this.enableAccept)
    else this.setState({ sopsClicked: true }, this.enableAccept)
  }

  enableAccept = () => {
    if (this.state.charterClicked && this.state.sopsClicked) this.setState({ canAccept: true })
  }

  handleAgreementClick = () => {
    this.setState(
      prev => ({ accepted: !prev.accepted }),
      () => {
        emitter.emit('agreement', this.state.accepted)
      }
    )
  }

  render() {
    return (
      <Container>
        <Message icon>
          <Icon name="file alternate outline" />
          <Message.Content>
            <Message.Header>Community Charter</Message.Header>
            All members of United Operations are required to read and adhere to the community
            charter and SOPs. Read both wiki documents and then click "I have read and agree" to
            enable to rest of the authentication process.
            <Message.List>
              <Message.Item>
                {this.state.charterClicked && <Icon name="check" color="green" />}
                <a
                  onClick={_e => this.handleLinkClicked('charter')}
                  href="https://wiki.unitedoperations.net/wiki/United_Operations_Charter"
                  target="_blank"
                >
                  Charter
                </a>
              </Message.Item>
              <Message.Item>
                {this.state.sopsClicked && <Icon name="check" color="green" />}
                <a
                  onClick={_e => this.handleLinkClicked('sops')}
                  href="https://wiki.unitedoperations.net/wiki/Category:Standard_Operating_Procedures"
                  target="_blank"
                >
                  SOPs
                </a>
              </Message.Item>
            </Message.List>
          </Message.Content>
        </Message>
        <div className="auth-charter--toggle">
          <Checkbox
            onClick={this.handleAgreementClick}
            checked={this.state.accepted}
            disabled={!this.state.canAccept}
            toggle
          />
          <span>I have read and agree to the charter and SOPs, and wish to continue.</span>
        </div>
      </Container>
    )
  }
}

export default Charter
