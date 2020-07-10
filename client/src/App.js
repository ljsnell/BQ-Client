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
      minutes: 3,
      seconds: 0
    };
  }

  /* When content changes, we send the
current content of the editor to the server. */
 onEditorStateChange = (text) => {
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
      <Button variant="secondary">Jump</Button>{' '}
    </div>
  )

  bonusQuestion = () => {
    // https://medium.com/better-programming/building-a-simple-countdown-timer-with-react-4ca32763dda7
    this.myInterval = setInterval(() => {
      const { seconds, minutes } = this.state
      if (seconds > 0) {
        this.setState(({ seconds }) => ({
          seconds: seconds - 1
        }))
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(this.myInterval)
        } else {
          this.setState(({ minutes }) => ({
            minutes: minutes - 1,
            seconds: 59
          }))
        }
      }
    }, 1000)
  }

  showQuizMasterSection = () => {    
      return (
        <div className="main-content">
          <Button variant="secondary">Next Question</Button>{' '}
          <Button onClick={()=>this.bonusQuestion()} variant="secondary">Bonus Question</Button>{' '}
        </div>
      )
    }

  render() {
    const {
      minutes, seconds
    } = this.state;
    
    return (
      <React.Fragment>
        <Navbar color="light" light>
          <NavbarBrand href="/">Bible Quiz Zone</NavbarBrand>
        </Navbar>
        <div className="container-fluid">
          {this.showEditorSection()}
          <br></br>
          {this.showQuizMasterSection()}
        </div>
      <div>
        <h1>Time Remaining: { minutes }:{ seconds < 10 ? `0${ seconds }` : seconds }</h1>
      </div>
      </React.Fragment>
    );
  }
}

export default App;
