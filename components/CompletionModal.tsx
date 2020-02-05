import React from 'react'
import { Modal, Header, Button, Icon } from 'semantic-ui-react'

export interface CompletionModalProps {
  open: boolean
  username: string
}

/**
 * Save the user session
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setClosed
 */
async function submitForUserStorage(setClosed: React.Dispatch<React.SetStateAction<boolean>>) {
  setClosed(true)
  await fetch('/api/save', { method: 'PUT' })
}

const CompletionModal: React.FunctionComponent<CompletionModalProps> = props => {
  const [closed, setClosed] = React.useState(false)

  return (
    <Modal open={props.open && !closed} size="small" basic>
      <Header icon="unlock" content="Authentication Complete" />
      <Modal.Content>
        {props.username}, you're now authenticated in the United Operations system! You will have access to use the
        Discord server, Teamspeak server, and the forums shortly. Be sure to contact a United Operations officer to have
        any non-transferred user groups manually reassigned to you on the respective platforms. Click the 'Finish'
        button and you can close this page.
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => submitForUserStorage(setClosed)} color="green" basic inverted>
          <Icon name="check" />
          Finish
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default CompletionModal
