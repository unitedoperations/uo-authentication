import * as React from 'react'
import Page from '../../../components/Page'

class Complete extends React.PureComponent {
  componentDidMount() {
    window.close()
  }

  render() {
    return (
      <Page>
        <div />
      </Page>
    )
  }
}

export default Complete
