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
      username: '',
      jumper: '',
      q_text_to_display: "",
      i: 0,
      full_question_text: "Welcome to the quiz!"
    };
  }
  
  questionNumber = 0
  bonusQuestionNumber = 0

  questionIDs = [1, 2, 3]
  bonusQuestionIDs = [4, 5, 6]
  

  /* When content changes, we send the
current content of the editor to the server. */
 sync = (q_text_to_display, full_question_text) => {
   client.send(JSON.stringify({
     type: "contentchange",     
     content: q_text_to_display,
     full_question_text: full_question_text
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
      stateToChange.jumper = dataFromServer.username

      if (dataFromServer.type === 'contentchange') {
        stateToChange.q_text_to_display = dataFromServer.question
        stateToChange.full_question_text = dataFromServer.full_question_text
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
      i,
      full_question_text
    } = this.state

    this.question_array = full_question_text.split(" ")
    if (i < this.question_array.length) {
        q_text_to_display = q_text_to_display.concat(this.question_array[i]).concat(' ')
        i++
        this.setState({ q_text_to_display: q_text_to_display, i: i })
        this.setState({full_question_text: full_question_text})
        this.sync(q_text_to_display, full_question_text)
      }
  }

  jump() {
    var {
      full_question_text
    } = this.state
    this.question_array = full_question_text.split(" ")
    this.setState({username: this.state.username})
    this.i = this.question_array.length
    this.syncJump(this.i)
  }

  nextQuestion() {
    var questionID = this.questionIDs[this.questionNumber]
    console.log('questionID')
    console.log(questionID)
    fetch('http://localhost:5000/question_by_id/?QID='+questionID)
      .then(res => res.json()).then((data) => {
        this.setState({full_question_text: data})        
      });
    this.i = 0
    this.setState({q_text_to_display: " "})
    this.setState({i:this.i})
    this.questionNumber++
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

  handleChange(event) {
    this.setState({username: event.target.value});
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
          User Name:
          <input onChange={evt =>this.handleChange(evt)} />
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
        <div>
          <h3>Current Jumper: {this.state.jumper}</h3>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
