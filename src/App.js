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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      jumper: '',
      q_text_to_display: "",
      i: 0,
      full_question_text: "*** Welcome to the quiz! ***",
      answer_question_text: "🤔",
      room: user_room,
      team1Score: 0,
      team2Score: 0,
      quizNumber: 1,
      timer: 0
    };
  }
  // Question iterators
  questionNumber = 0
  bonusQuestionNumber = 0

  // Quiz Questions
  questionIDs1 = [184, 97, 115, 152, 3193, 3268, 88, 110, 277, 3206, 238, 47, 160, 50, 3277, 95, 63, 49, 17, 190]
  bonusQuestionIDs1 = [76, 226, 83, 217, 3200, 261, 3258, 199, 56, 79]

  questionIDs2 = [67, 223, 3271, 3261, 236, 108, 133, 253, 89, 136, 75, 3259, 174, 3207, 228, 266, 247, 275, 116, 105]
  bonusQuestionIDs2 = [94, 3187, 245, 256, 187, 51, 151, 280, 46, 3254]

  questionIDs3 = [3186, 209, 140, 175, 264, 113, 204, 197, 201, 98, 3263, 3214, 72, 163, 3183, 104, 252, 65, 177, 248]
  bonusQuestionIDs3 = [260, 3179, 3256, 3197, 3184, 229, 246, 278, 3262, 3265]

  questionIDs4 = [225, 3195, 165, 3176, 187, 277, 3117, 169, 66, 273, 263, 74, 131, 246, 92, 3261, 3208, 99, 59, 3]
  bonusQuestionIDs4 = [281, 18, 3191, 137, 265, 119, 93, 3260, 106, 198]

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
    // If jumper is null nobody has jumped on the question and we'll
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
      fetch('https://bible-questions-api.herokuapp.com/?QID='+questionID)
        .then(res => res.json()).then((data) => {
          console.log('question from api!')
          console.log(data)
          this.setState({full_question_text: data[0]})
          this.setState({answer_question_text: data[1]})
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
      fetch('https://bible-questions-api.herokuapp.com/?QID='+bonusQuestionID)
        .then(res => res.json()).then((data) => {
          console.log('question from api!')
          console.log(data)
          this.setState({full_question_text: data[0]})
          this.setState({answer_question_text: data[1]})
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
  
  startCountUp() {
    var { timer, full_question_text } = this.state
    timer = 0;
    var max_count = 30
    if (full_question_text.includes('Finish the Verse') || 
      full_question_text.includes('Multiple Part Answer')) {
      max_count = 45
    }
    const interval = setInterval(() => {
      timer++;
      this.setState({timer: timer})
      if (timer > max_count) {
        clearInterval(interval);
        timer = "Time's up!"
        this.setState({timer: timer})
      }
    }, 1000);
  }

  showQuizMasterSection = () => {    
    var { username, full_question_text, answer_question_text, timer } = this.state
    if(username === 'quizmaster') {
      return (
        <div className="main-content">
          <div>
            <h1>Full Question: { full_question_text }</h1>
          </div>
          <div>
            <h1>Answer: { answer_question_text }</h1>
          </div>
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
          <br></br>
          <br></br>
          <Button onClick={()=>this.startCountUp()} variant="secondary">Start Timer</Button>{' '}          
          <h1>{ timer }</h1>
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
          <NavbarBrand href="/">Bible Quiz 1.7</NavbarBrand>
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
