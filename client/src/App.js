import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import Identicon from 'react-identicons';
import {
  Navbar,
  NavbarBrand,
  UncontrolledTooltip,
  Button
} from 'reactstrap';
import Editor from 'react-medium-editor';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import './App.css';

const client = new W3CWebSocket('ws://127.0.0.1:8000');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUsers: [],
      userActivity: [],
      username: null,
      text: '',
      q_text_to_display: ""
    };
  }
 
  full_question_test = "For God so Loved the World"
  /* When content changes, we send the
current content of the editor to the server. */
 onEditorStateChange = (text) => {
   console.log('text')
   console.log(text)
   client.send(JSON.stringify({
     type: "contentchange",
     username: this.state.username,
     content: text
   }));
 };

 componentWillMount() {
   client.onopen = () => {
     console.log('WebSocket Client Connected');
   };
   client.onmessage = (message) => {
     const dataFromServer = JSON.parse(message.data);
     const stateToChange = {};
     if (dataFromServer.type === "userevent") {
       stateToChange.currentUsers = Object.values(dataFromServer.data.users);
     } else if (dataFromServer.type === "contentchange") {
       stateToChange.text = dataFromServer.data.editorContent;
      }
      stateToChange.userActivity = dataFromServer.data.userActivity;
      this.setState({
        ...stateToChange
      });
    };
  }
  
  componentWillUnmount() {
    clearInterval(this.myInterval)
  }

  showEditorSection = () => (
    <div className="main-content">
      <div className="document-holder">
        <div className="currentusers">
          {this.state.currentUsers.map(user => (
            <React.Fragment>
              <span id={user.username} className="userInfo" key={user.username}>
                <Identicon className="account__avatar" style={{ backgroundColor: user.randomcolor }} size={40} string={user.username} />
              </span>
              <UncontrolledTooltip placement="top" target={user.username}>
                {user.username}
              </UncontrolledTooltip>
            </React.Fragment>
          ))}
        </div>
        <Editor          
          className="body-editor"
          text={this.state.text}
          onChange={this.onEditorStateChange}
          />
      </div>
      <Button onClick={()=>this.jump()} variant="secondary">Jump</Button>{' '}
    </div>
  )
  
  i = 0
  startQuiz() {    
    // https://medium.com/better-programming/building-a-simple-countdown-timer-with-react-4ca32763dda7
    var {
      q_text_to_display
    } = this.state
    this.question_array = this.full_question_test.split(" ")
    if (this.i < this.question_array.length) {
        q_text_to_display = q_text_to_display.concat(this.question_array[this.i]).concat(' ')
        this.setState({ q_text_to_display: q_text_to_display })
        console.log(q_text_to_display)
        this.i++
      }
  }

  jump() {
    this.i = this.question_array.length
    console.log('in jump')
  }

  nextQuestion() {
    this.i = 0
    this.setState({q_text_to_display: " "})
  }

  showQuizMasterSection = () => {    
      return (
        <div className="main-content">
          <Button onClick={()=>this.nextQuestion()} variant="secondary">Next Question</Button>{' '}
          <Button onClick={()=>setInterval(() => this.startQuiz(),1000)} variant="secondary">Start Quiz</Button>{' '}
        </div>
      )
    }

  render() {
    const {
      q_text_to_display
    } = this.state;
    
    return (
      <React.Fragment>
        <Navbar color="light" light>
          <NavbarBrand href="/">Bible Quiz Zone</NavbarBrand>
        </Navbar>
        <div>
          <h1>Question: { q_text_to_display }</h1>
        </div>
        <div className="container-fluid">
          {this.showEditorSection()}
          <br></br>
          {this.showQuizMasterSection()}
        </div>
      </React.Fragment>
    );
  }
}

export default App;
