import React from 'react'
import { Container, Message, Icon, Checkbox } from 'semantic-ui-react'
import { emitter } from '../pages/index'

const Charter: React.FunctionComponent = () => {
  const [charterClicked, setCharterClicked] = React.useState(false)
  const [sopsClicked, setSOPsClicked] = React.useState(false)
  const [canAccept, setCanAccept] = React.useState(false)
  const [accepted, setAccepted] = React.useState(false)

  React.useEffect(() => {
    emitter.emit('agreement', accepted)
  }, [accepted])

  React.useEffect(() => {
    if (charterClicked && sopsClicked) setCanAccept(true)
  }, [charterClicked, sopsClicked])

  return (
    <Container>
      <Message icon>
        <Icon name="file alternate outline" />
        <Message.Content>
          <Message.Header>Community Charter</Message.Header>
          All members of United Operations are required to read and adhere to the community charter and SOPs. Read both
          wiki documents and then click "I have read and agree" to enable the rest of the authentication process.
          <Message.List>
            <Message.Item>
              {charterClicked && <Icon name="check" color="green" />}
              <a
                onClick={() => setCharterClicked(true)}
                href="https://wiki.unitedoperations.net/wiki/United_Operations_Charter"
                rel="noreferrer"
                target="_blank"
              >
                Charter
              </a>
            </Message.Item>
            <Message.Item>
              {sopsClicked && <Icon name="check" color="green" />}
              <a
                onClick={() => setSOPsClicked(true)}
                href="https://wiki.unitedoperations.net/wiki/Category:Standard_Operating_Procedures"
                rel="noreferrer"
                target="_blank"
              >
                SOPs
              </a>
            </Message.Item>
          </Message.List>
          <br />
          <em>(The toggle will remain disabled until you have visited both websites via the provided links)</em>
        </Message.Content>
      </Message>
      <div className="auth-charter--toggle">
        <Checkbox onClick={() => setAccepted(!accepted)} checked={accepted} disabled={!canAccept} toggle />
        <span>I have read and agree to the charter and SOPs, and wish to continue.</span>
      </div>
    </Container>
  )
}

export default Charter
