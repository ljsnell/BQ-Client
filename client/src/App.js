import React, { Component } from 'react';
import {
  Navbar,
  NavbarBrand,
  Button
} from 'reactstrap';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import './App.css';
// https://cloud.google.com/community/tutorials/deploy-react-nginx-cloud-run
// Deploy commands
// 1. gcloud config set project promising-lamp-284223
// 2. gcloud app deploy

// Websocket server
// var server = 'http://127.0.0.1:8000/'
var server = 'wss://mysterious-journey-90036.herokuapp.com'
const io = require('socket.io-client');
var user_room = prompt("Please enter your room #", "room");
var client = io.connect(server).emit('room', user_room);
// const client = io.connect('wss://mysterious-journey-90036.herokuapp.com');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      jumper: '',
      q_text_to_display: "",
      i: 0,
      full_question_text: "*** Welcome to the quiz! ***",
      room: user_room,
      team1Score: 0,
      team2Score: 0,
      quizNumber: 1
    };
  }
  // Question iterators
  questionNumber = 0
  bonusQuestionNumber = 0

  // Quiz Questions
  questionIDs1 = [252, 166, 3204, 277, 1, 108, 3268, 70, 188, 67, 95, 228, 218, 84, 197, 165, 3261, 230, 181, 198]
  bonusQuestionIDs1 = [3257, 171, 56, 256, 124, 3281, 3187, 3256, 3177, 76]

  questionIDs2 = [253, 166, 3204, 277, 1, 108, 3268, 70, 188, 67, 95, 228, 218, 84, 197, 165, 3261, 230, 181, 198]
  bonusQuestionIDs2 = [3258, 171, 56, 256, 124, 3281, 3187, 3256, 3177, 76]

  questionIDs3 = [254, 166, 3204, 277, 1, 108, 3268, 70, 188, 67, 95, 228, 218, 84, 197, 165, 3261, 230, 181, 198]
  bonusQuestionIDs3 = [3259, 171, 56, 256, 124, 3281, 3187, 3256, 3177, 76]

  questionIDs4 = [255, 166, 3204, 277, 1, 108, 3268, 70, 188, 67, 95, 228, 218, 84, 197, 165, 3261, 230, 181, 198]
  bonusQuestionIDs4 = [3260, 171, 56, 256, 124, 3281, 3187, 3256, 3177, 76]

  questionIDs = this.questionIDs1
  bonusQuestionIDs = this.bonusQuestionIDs1

  /* When content changes, we send the
current content of the editor to the server. */
 sync = (q_text_to_display, full_question_text, room_id) => {
   client.emit('contentchange', JSON.stringify({
     content: q_text_to_display,
     full_question_text: full_question_text,
     room: room_id
   }));
 };

 syncJump = (i, room_id) => {
  client.emit('jump', JSON.stringify({
    username: this.state.username,
    i: i,
    room: room_id
  }));
};

 componentWillMount() {
   var session = this;
   
   client.on('contentchange', function(message) {
      const dataFromServer = message
      const stateToChange = {};
      stateToChange.jumper = dataFromServer.username
      stateToChange.q_text_to_display = dataFromServer.question
      stateToChange.full_question_text = dataFromServer.full_question_text
      
      // Speaks the text aloud.
      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      msg.voice = voices[1]; // Note: some voices don't support altering params
      msg.voiceURI = 'native';
      msg.rate = 2.3; // 0.1 to 10
      var tts = dataFromServer.question.split(" ")
      msg.text = tts[tts.length-2]
      msg.lang = 'en-US';
      speechSynthesis.speak(msg);
      session.setState({
        ...stateToChange
      });
  });

  client.on('jump', function(message) {
    const dataFromServer = message;
    const stateToChange = {};    
    stateToChange.jumper = dataFromServer.username    
    console.log(stateToChange.jumper)
    stateToChange.i = dataFromServer.i;

    session.setState({
      ...stateToChange
    });
  });

  client.on('score', function(message) {
    console.log('in score!')
    const dataFromServer = message;
    const stateToChange = {};    
    stateToChange.team1Score = dataFromServer.team1Score
    stateToChange.team2Score = dataFromServer.team2Score

    session.setState({
      ...stateToChange
    });
  });
}
 
  startQuiz() {
    var {
      q_text_to_display,
      i,
      full_question_text,
      room
    } = this.state

    this.question_array = full_question_text.split(" ")
    if (i < this.question_array.length) {
        q_text_to_display = q_text_to_display.concat(this.question_array[i]).concat(' ')
        i++
        this.setState({ q_text_to_display: q_text_to_display, i: i })
        this.setState({full_question_text: full_question_text})
        this.sync(q_text_to_display, full_question_text, room)
      }
  }

  jump() {
    var {
      full_question_text,
      username,
      jumper,
      room
    } = this.state
    console.log('jumper:')
    console.log(jumper) 
    // If jumper is null nobody has jumped on the question and we'll\
    // allow an update.
    if(jumper == null) {
      this.question_array = full_question_text.split(" ")
      this.setState({username: username})
      this.i = this.question_array.length
      this.syncJump(this.i, room)
    }    
  }

  nextQuestion() {
    if(this.questionNumber < this.questionIDs.length) {
      var questionID = this.questionIDs[this.questionNumber]
      console.log('question number:')
      console.log(this.questionNumber)
      fetch('https://bq-questions-api.uc.r.appspot.com/?QID='+questionID)
        .then(res => res.json()).then((data) => {
          console.log('question from api!')
          console.log(data)
          this.setState({full_question_text: data})
          this.i = 0
          this.setState({q_text_to_display: " "})
          this.setState({i:this.i})
          this.questionNumber++
        });
    } else {
      this.setState({q_text_to_display: "*** End of the quiz! "})
      this.setState({full_question_text: "*** End of the quiz! ***"})
    }    
  }

  bonusQuestion() {
    if(this.bonusQuestionNumber < this.bonusQuestionIDs.length) {
      var bonusQuestionID = this.bonusQuestionIDs[this.bonusQuestionNumber]
      console.log('bonus question number:')
      console.log(this.bonusQuestionNumber)
      fetch('https://bq-questions-api.uc.r.appspot.com/?QID='+bonusQuestionID)
        .then(res => res.json()).then((data) => {
          console.log('question from api!')
          console.log(data)
          this.setState({full_question_text: data})
          this.i = 0
          this.setState({q_text_to_display: " "})
          this.setState({i:this.i})
          this.bonusQuestionNumber++
        });
    } else {
      this.setState({q_text_to_display: "*** Out of bonus questions :/ ***"})
      this.setState({full_question_text: "*** Out of bonus questions :/ ***"})
    }    
  }

  addScore(teamNumber, pointsToAdd) {
    var { team1Score, team2Score, room } = this.state
    if(teamNumber===1) {
      team1Score += pointsToAdd
      this.setState({team1Score: team1Score})
    } else {
      team2Score +=pointsToAdd
      this.setState({team2Score: team2Score})      
    }
    client.emit('score', JSON.stringify({
      team1Score: team1Score,
      team2Score: team2Score,
      room: room
    }));
  }

  setQuizNumber(selectedQuizNumber) {
    console.log('selectedQuizNumber')
    console.log(selectedQuizNumber)
    this.setState({quizNumber: selectedQuizNumber})

    if(selectedQuizNumber==="1") {
      this.questionIDs = this.questionIDs1
      this.bonusQuestionIDs = this.bonusQuestionIDs1
    }
    else if(selectedQuizNumber==="2") {
      this.questionIDs = this.questionIDs2
      this.bonusQuestionIDs = this.bonusQuestionIDs2
    }
    else if(selectedQuizNumber==="3") {
      this.questionIDs = this.questionIDs3
      this.bonusQuestionIDs = this.bonusQuestionIDs3
    }
    else if(selectedQuizNumber==="4") {
      this.questionIDs = this.questionIDs4
      this.bonusQuestionIDs = this.bonusQuestionIDs4
    }
  }

  showQuizMasterSection = () => {
    var {username} = this.state
    if(username === 'quizmaster') {
      return (
        <div className="main-content">
          <Button onClick={()=>this.nextQuestion()} variant="secondary">Next Question</Button>{' '}
          <Button onClick={()=>this.bonusQuestion()} variant="secondary">Bonus Question</Button>{' '}
          <Button onClick={()=>setInterval(() => this.startQuiz(),1000)} variant="secondary">Start Quiz</Button>{' '}
          <label htmlFor="roundSelector">Choose a quiz number:</label>
          <select onChange={(e) => this.setQuizNumber(e.target.value)} name="quizSelector" id="quizSelector">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
      )
    }
  }

  showQuizzerSection = () => {    
    return (
      <div className="quizzer-section">
        <Button onClick={()=>this.jump()} variant="secondary">Jump</Button>{' '}        
      </div>
    )
  }
  
  showScoringSection = () => {
    var {username} = this.state
    if(username === 'scorekeeper') {
      return (
        <div className="main-content">
          <h1>Scoring Section:</h1>
          <br></br>
          <Button onClick={()=>this.addScore(1, 20)} variant="secondary">Team 1: 20</Button>{' '}
          <Button onClick={()=>this.addScore(2, 20)} variant="secondary">Team 2: 20</Button>{' '}
          <br></br>
          <br></br>
          <Button onClick={()=>this.addScore(1, 10)} variant="secondary">Team 1: 10</Button>{' '}
          <Button onClick={()=>this.addScore(2, 10)} variant="secondary">Team 2: 10</Button>{' '}
          <br></br>
          <br></br>
          <Button onClick={()=>this.addScore(1, -10)} variant="secondary">Team 1: -10</Button>{' '}
          <Button onClick={()=>this.addScore(2, -10)} variant="secondary">Team 2: -10</Button>{' '}
          <br></br>
          <br></br>
        </div>
      )
    }
  }

  handleChange(event) {
    this.setState({username: event.target.value});
    this.showQuizMasterSection()
  }

  render() {
    const {
      q_text_to_display,
      team1Score,
      team2Score
    } = this.state;

    return (
      <React.Fragment>
        <Navbar color="light" light>
          <NavbarBrand href="/">Bible Quiz 1.5</NavbarBrand>
        </Navbar>
        <div>
          User Name:
          <input onChange={evt =>this.handleChange(evt)} />
        </div>
        <br></br>
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
        <br></br>
        <div>
          <h3>Score Board:</h3>
        </div>
        <table border = "1" style={{width: '50%'}}>
          <tbody>
            <tr>
              <th>Team 1</th>
              <th>Team 2</th>
            </tr>
            <tr>
              <td>{ team1Score }</td>
              <td>{ team2Score }</td>
            </tr>
          </tbody>
        </table>
        <br></br>
        {this.showScoringSection()}
      </React.Fragment>
    );
  }
}

export default App;
