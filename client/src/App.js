import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import {
  Navbar,
  NavbarBrand,
  Button
} from 'reactstrap';
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
      username: 'QuizMaster',
      q_text_to_display: "",
      i: 0
    };
  }
 
  full_question_test = "For God so Loved the World"

  /* When content changes, we send the
current content of the editor to the server. */
 sync = (q_text_to_display) => {
   client.send(JSON.stringify({
     type: "contentchange",
     username: this.state.username,
     content: q_text_to_display
   }));
 };

 syncJump = (i) => {
  client.send(JSON.stringify({
    type: "jump",
    username: this.state.username,
    i: i
  }));
};

 componentWillMount() {
   client.onopen = () => {
     console.log('WebSocket Client Connected');
   };
   client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      const stateToChange = {};

      if (dataFromServer.type === 'contentchange') {
        stateToChange.q_text_to_display = dataFromServer.question;
      }
      if (dataFromServer.type === 'jump') {
        stateToChange.i = dataFromServer.i;        
      }
      
      this.setState({
        ...stateToChange
      });
    };
  }

  startQuiz() {
    var {
      q_text_to_display,
      i
    } = this.state

    this.question_array = this.full_question_test.split(" ")
    if (i < this.question_array.length) {
        q_text_to_display = q_text_to_display.concat(this.question_array[i]).concat(' ')
        i++
        this.setState({ q_text_to_display: q_text_to_display, i: i })
        this.sync(q_text_to_display)
      }
  }

  jump() {
    this.question_array = this.full_question_test.split(" ")
    this.i = this.question_array.length
    this.syncJump(this.i)
  }

  nextQuestion() {
    this.i = 0
    this.setState({q_text_to_display: " "})
    this.setState({i:this.i})
  }

  showQuizMasterSection = () => {    
      return (
        <div className="main-content">
          <Button onClick={()=>this.nextQuestion()} variant="secondary">Next Question</Button>{' '}
          <Button onClick={()=>setInterval(() => this.startQuiz(),1000)} variant="secondary">Start Quiz</Button>{' '}
        </div>
      )
    }

  showQuizzerSection = () => {
    return (
      <div className="quizzer-section">
        <Button onClick={()=>this.jump()} variant="secondary">Jump</Button>{' '}
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
          <label for="username">User name:</label>
          <input type="text" id="username" name="user_name"></input>
        </div>
        <div>
          <h1>Question: { q_text_to_display }</h1>
        </div>
        <div className="container-fluid">
          <br></br>
          {this.showQuizMasterSection()}
          <br></br>
          {this.showQuizzerSection()}
        </div>
      </React.Fragment>
    );
  }
}

export default App;
