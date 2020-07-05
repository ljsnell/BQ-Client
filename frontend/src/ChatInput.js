import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button} from 'react-bootstrap';

class ChatInput extends React.Component {
  static propTypes = {
    onSubmitMessage: PropTypes.func.isRequired,
  }
  state = {
    message: '',
  }  

  render() {
    return (
      <form
        action="."
        onSubmit={e => {
          e.preventDefault()
          this.props.onSubmitMessage(this.state.message)
          this.setState({ message: '' })
        }}
      >
        <input
          type="text"
          placeholder={'Enter message...'}
          value={this.state.message}
          onChange={e => this.setState({ message: e.target.value })}
        />
        <input type="submit" value={'Send'} />
        <Button onClick={nextQuestion}>Next Question</Button>{' '}
      </form>
    )
  }
}

function nextQuestion(){
  console.log('button clicked')
}

export default ChatInput