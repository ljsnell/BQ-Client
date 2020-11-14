import React, { Component } from 'react';
import {
  Navbar,
  NavbarBrand,
  Button
} from 'reactstrap';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import './App.css';
import globals from './globals'
import { fetchQuestion } from './webserviceCalls';

const QUIZZES = globals.QUIZ_GLOBAL

// Websocket server
// var server = 'http://127.0.0.1:8000/'
var server = 'wss://mysterious-journey-90036.herokuapp.com'
const io = require('socket.io-client');
var user_room = prompt("Please enter your room #", "room");
var entered_username = prompt("Please enter your user name. E.G. 1-Jeff-Gnarwhals3.0", "Username");
var client = io.connect(server).emit('room', JSON.stringify({
  room: user_room,
  username: entered_username
}));

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: entered_username,
      jumper: null,
      q_text_to_display: "",
      i: 0,
      full_question_text: "*** Welcome to the quiz! ***",
      answer_question_text: "🤔",
      room: user_room,
      team1Score: 0,
      team2Score: 0,
      quizNumber: "practice",
      timer: 0,
      play_audio: false,
      quizzers_in_room: [],
      quiz_started: false
    };
  }

  handleChange(entered_username) {
    this.setState({ username: entered_username });
    this.showQuizMasterSection()
  }

  // Question iterators
  questionNumber = 0
  bonusQuestionNumber = 0

  // Quiz Questions    
  questionIDs = QUIZZES.quizpractice.qs
  bonusQuestionIDs = QUIZZES.quizpractice.bonus

  footer_style = {
    backgroundColor: "Black",
    borderTop: "1px solid #E7E7E7",
    textAlign: "center",
    padding: "20px",
    position: "fixed",
    left: "0",
    bottom: "0",
    height: "60px",
    width: "100%"
  }

  start_quiz_button_style = {
    backgroundColor: "Black"
  }

  /* When content changes, we send the
current content of the editor to the server. */
  sync = (q_text_to_display, full_question_text, room_id, jumper) => {
    client.emit('contentchange', JSON.stringify({
      content: q_text_to_display,
      full_question_text: full_question_text,
      room: room_id,
      jumper: jumper
    }));
  };

  syncJump = (i, room_id, username) => {
    client.emit('jump', JSON.stringify({
      username: username,
      i: i,
      room: room_id
    }));
  };

  mute() {
    this.setState({ play_audio: !this.state.play_audio })
  }

  componentWillMount() {
    var session = this;
    console.log('session')
    console.log(session)

    client.on('contentchange', function (message) {
      session.state.jumper = message.jumper
      if (session.state.jumper == null) {
        const dataFromServer = message
        const stateToChange = {};
        stateToChange.jumper = dataFromServer.jumper
        stateToChange.q_text_to_display = dataFromServer.question
        stateToChange.full_question_text = dataFromServer.full_question_text

        // Speaks the text aloud.
        if (session.state.play_audio === true) {
          var msg = new SpeechSynthesisUtterance();
          var voices = window.speechSynthesis.getVoices();
          msg.voice = voices[1]; // Note: some voices don't support altering params
          msg.voiceURI = 'native';
          msg.rate = 2.3; // 0.1 to 10
          var tts = dataFromServer.question.split(" ")
          msg.text = tts[tts.length - 2]
          msg.lang = 'en-US';
          speechSynthesis.speak(msg);
        }

        session.setState({
          ...stateToChange
        });
      }
    });

    client.on('jump', function (message) {
      const dataFromServer = message;
      const stateToChange = {};
      stateToChange.jumper = dataFromServer.username
      console.log(stateToChange.jumper)
      stateToChange.i = dataFromServer.i;

      session.setState({
        ...stateToChange
      });
    });

    client.on('score', function (message) {
      console.log('in score!')
      const dataFromServer = message;
      const stateToChange = {};
      stateToChange.team1Score = dataFromServer.team1Score
      stateToChange.team2Score = dataFromServer.team2Score

      session.setState({
        ...stateToChange
      });
    });

    client.on('joined', function (message) {
      console.log('Joined!')
      console.log(message)
      session.setState({ quizzers_in_room: message })
    });
  }

  startQuiz() {
    var {
      q_text_to_display,
      i,
      full_question_text,
      room,
      jumper
    } = this.state

    this.question_array = full_question_text.split(" ")
    if (i < this.question_array.length) {
      q_text_to_display = q_text_to_display.concat(this.question_array[i]).concat(' ')
      i++
      this.setState({ q_text_to_display: q_text_to_display, i: i, full_question_text: full_question_text, quiz_started: true })
      this.sync(q_text_to_display, full_question_text, room, jumper)
    }
  }

  jump() {
    var {
      full_question_text,
      username,
      jumper,
      room
    } = this.state
    if (username.length === 0) {
      alert("Please enter your username in the User Name box (top of the page). E.G. 1-Jeff");
    } // If jumper is null nobody has jumped on the question and we'll
    // allow an update.
    else {
      if (jumper == null) {        
        this.question_array = full_question_text.split(" ")
        this.setState({ username: username })
        this.i = this.question_array.length
        this.syncJump(this.i, room, username)
      }
    }
  }

  async nextQuestion(isBonus, questionNumber) {
    this.setState({ jumper: null })    
    let questionsList = isBonus ? this.bonusQuestionIDs : this.questionIDs
    if (questionNumber < questionsList.length) {
      var questionID = questionsList[questionNumber]
      console.log('question number:')
      console.log(questionNumber)
      await fetchQuestion(questionID)
        .then(res => res.json()).then((data) => {
          console.log('question from api!')
          console.log(data)
          this.i = 0
          if (isBonus) {
            this.bonusQuestionNumber++
            this.setState({
              full_question_text: data[0],
              answer_question_text: data[1],
              q_text_to_display: data[0],
              i: data[0].length
            })                // Add two spaces to ensure no words get read aloud.
            this.sync(data[0] + "  ", data[0], this.state.room, this.state.jumper)
          } else {
            this.questionNumber++
            this.setState({
              full_question_text: data[0],
              answer_question_text: data[1],
              q_text_to_display: " ",
              i: this.i
            })
          }
        });
    } else {
      this.setState({
        q_text_to_display: "*** Out of questions :/ ***",
        full_question_text: "*** Out of questions :/ ***"
      })
    }
  }

  addScore(teamNumber, pointsToAdd) {
    var { team1Score, team2Score, room } = this.state
    if (teamNumber === 1) {
      team1Score += pointsToAdd
      this.setState({ team1Score: team1Score })
    } else {
      team2Score += pointsToAdd
      this.setState({ team2Score: team2Score })
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
    this.setState({ quizNumber: selectedQuizNumber })

    let selected_quiz = QUIZZES[`quiz${selectedQuizNumber}`]

    this.questionIDs = selected_quiz.qs
    this.bonusQuestionIDs = selected_quiz.bonus
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
      this.setState({ timer: timer })
      if (timer > max_count) {
        clearInterval(interval);
        timer = "Time's up!"
        this.setState({ timer: timer })
      }
    }, 1000);
  }

  clearAttendeeList() {
    client.emit('clear_room', JSON.stringify({ room: this.state.room }))
  }

  showQuizMasterSection = () => {
    var { username, full_question_text, answer_question_text, timer, quiz_started } = this.state
    if (username === 'QM14') {
      return (
        <div className="main-content">
          <div>
            <h1>Full Question: {full_question_text}</h1>
          </div>
          <div>
            <h1>Answer: {answer_question_text}</h1>
            <h1>Question #: {this.questionNumber} </h1>
          </div>
          <Button onClick={() => this.nextQuestion(false, this.questionNumber)}>Next Question</Button>{' '}
          <Button onClick={() => this.nextQuestion(true, this.bonusQuestionNumber)}>Bonus Question</Button>{' '}
          <Button disabled={quiz_started} onClick={() => setInterval(() => this.startQuiz(), 1000)} style={this.start_quiz_button_style}>Start Quiz</Button>{' '}
          <label htmlFor="roundSelector">Choose a quiz number:</label>
          <select onChange={(e) => this.setQuizNumber(e.target.value)} name="quizSelector" id="quizSelector">
            <option value="practice">practice</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <h4>Quizzers in room: {this.state.quizzers_in_room.join(', ')}</h4>
          <Button onClick={() => this.clearAttendeeList()}>Clear Quizzer List</Button>{' '}
          <br></br>
        </div>
      )
    }
  }

  showQuizzerSection = () => {
    return (
      <div className="quizzer-section">
        <Button onClick={() => this.jump()} style={this.footer_style}>Jump</Button>{' '}
      </div>
    )
  }

  showScoringSection = () => {
    var { username } = this.state
    if (username === 'scorekeeper') {
      return (
        <div className="main-content">
          <h1>Scoring Section:</h1>
          <br></br>
          <Button onClick={() => this.addScore(1, 20)}>Team 1: 20</Button>{' '}
          <Button onClick={() => this.addScore(2, 20)}>Team 2: 20</Button>{' '}
          <br></br>
          <br></br>
          <Button onClick={() => this.addScore(1, 10)}>Team 1: 10</Button>{' '}
          <Button onClick={() => this.addScore(2, 10)}>Team 2: 10</Button>{' '}
          <br></br>
          <br></br>
          <Button onClick={() => this.addScore(1, -10)}>Team 1: -10</Button>{' '}
          <Button onClick={() => this.addScore(2, -10)}>Team 2: -10</Button>{' '}
          <br></br>
          <br></br>
        </div>
      )
    }
  }

  render() {
    const {
      q_text_to_display,
      team1Score,
      team2Score,
      room,
      username,
      jumper
    } = this.state;
    return (
      <React.Fragment>
        <Navbar color="light" light>
          <NavbarBrand href="/">Bible Quiz 1.9</NavbarBrand>
        </Navbar>
        <div>
          Current Room: <b>{room}</b>
        </div>
        <div>
          User Name: <b>{username}</b>
        </div>
        <br></br>
        <div>
          <h1>Question: {q_text_to_display}</h1>
        </div>
        <div className="container-fluid">
          <br></br>
          {this.showQuizzerSection()}
          {this.showQuizMasterSection()}
          <br></br>
        </div>
        <div>
          <h3>Current Jumper: {jumper}</h3>
        </div>
        <br></br>
        {/*<div>
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
        {this.showScoringSection()}*/}
        <Button onClick={() => this.mute()}>Mute Question Audio</Button>{' '}
        <h3>Audio Enabled: {this.state.play_audio.toString()}</h3>
      </React.Fragment>
    );
  }
}

export default App;
