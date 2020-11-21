import React, { Component } from 'react';
import {
  Navbar,
  NavbarBrand,
  Button
} from 'reactstrap';
import Select from 'react-select';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import './App.css';
import globals from './globals'
import { fetchQuestion, fetchRandomQuestion } from './webserviceCalls';
import chapters from './constants';

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
      quizNumber: "1",
      play_audio: false,
      quizzers_in_room: [],
      quiz_started: false,
      selectedChapters: chapters
    };
  }

  // Question iterators
  questionNumber = 0
  bonusQuestionNumber = 0

  // Quiz Questions
  questionIDs = QUIZZES.quiz1.qs
  bonusQuestionIDs = QUIZZES.quiz1.bonus
  selectedRandomQuestionType = 1;

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
      room: room_id
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
    });

    client.on('jump', function (message) {
      const dataFromServer = message;
      const stateToChange = {};
      console.log('Jumper!')
      console.log(session.state.jumper)
      if (session.state.jumper == null) {
        stateToChange.jumper = dataFromServer.username
        console.log(stateToChange.jumper)
        stateToChange.i = dataFromServer.i;

        session.setState({
          ...stateToChange
        });
      }
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
    if (jumper == null) {
      this.question_array = full_question_text.split(" ")
      this.setState({ username: username })
      this.i = this.question_array.length
      this.syncJump(this.i, room, username)
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

  async randomQuestion() {
    this.setState({ jumper: null })    
    var selectedRandomChaptersList = []
    console.log('selectedChapters!!!')
    console.log(this.state.selectedChapters)
    if (this.state.selectedChapters !== null && this.state.selectedChapters.length > 0) {     
      for (var i = 0; this.state.selectedChapters.length > i; i++) {
        selectedRandomChaptersList.push(this.state.selectedChapters[i].value);
      }
    }
    await fetchRandomQuestion(this.selectedRandomQuestionType, 1, selectedRandomChaptersList)
      .then(res => res.json()).then((data) => {
        console.log('random question from api!')
        console.log(data)
        this.i = 0
        if (data != null) {
          this.setState({
            full_question_text: data[18] + ' : ' + data[15],
            answer_question_text: data[11],
            q_text_to_display: " ",
            i: this.i
          })
        } else {
          this.setState({
            q_text_to_display: "*** No question found for selected criteria :/ ***",
            full_question_text: "*** No question found for selected criteria :/ ***"
          })
        }
        if (!this.state.quiz_started) {
          setInterval(() => this.startQuiz(), 1000);
        }
        this.questionNumber++
      });
  }

  setQuizNumber(selectedQuizNumber) {
    console.log('selectedQuizNumber')
    console.log(selectedQuizNumber)

    this.questionNumber = 0
    this.setState({ quizNumber: selectedQuizNumber })

    let selected_quiz = QUIZZES[`quiz${selectedQuizNumber}`]

    this.questionIDs = selected_quiz.qs
    this.bonusQuestionIDs = selected_quiz.bonus
    this.showQuestionControls()
  }

  showQuestionControls = () => {
    console.log('selectedQuizNumber')
    console.log(this.state.quizNumber)
    if (this.state.quizNumber === 'practice') {
      return (<div id="practiceQuiz">
        <Button onClick={() => this.randomQuestion()} style={this.start_quiz_button_style}>Random Question</Button>{' '}
        <label htmlFor="questionTypeLabel">Choose a question type:</label>
        <select onChange={(e) => this.selectedRandomQuestionType = e.target.value} name="questionType" id="questionType">
          <option value="1">General</option>
          <option value="2">Two Part</option>
          <option value="3">Three Part</option>
          <option value="4">Four Part</option>
          <option value="5">Five Part</option>
          <option value="6">Multiple Part</option>
          <option value="7">FTV</option>
          <option value="8">Reference</option>
          <option value="9">Situation</option>
        </select>
        <div>
          <label htmlFor="questionChaptersLabel">Choose Chapters:</label>
          <Select
            defaultValue={[chapters[0], chapters[1], chapters[2], chapters[3], chapters[4], chapters[5], chapters[6], chapters[7], chapters[8], chapters[9], chapters[10], chapters[11], chapters[12], chapters[13], chapters[14], chapters[15], chapters[16], chapters[17], chapters[18], chapters[19], chapters[20], chapters[21], chapters[22], chapters[23], chapters[24], chapters[25], chapters[26], chapters[27]]}
            isMulti
            name="questionchapters"
            options={chapters}
            onChange={(e) => this.state.selectedChapters = e}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
      </div>)
    } else {
      return (<div id="realQuiz">
        <Button onClick={() => this.nextQuestion(false, this.questionNumber)}>Next Question</Button>{' '}
        <Button onClick={() => this.nextQuestion(true, this.bonusQuestionNumber)}>Bonus Question</Button>{' '}
        <Button disabled={this.state.quiz_started} onClick={() => setInterval(() => this.startQuiz(), 1000)} style={this.start_quiz_button_style}>Start Quiz</Button>{' '}
      </div>)
    }
  }

  showQuizMasterSection = () => {
    var { username, full_question_text, answer_question_text } = this.state
    if (username === 'QM') {
      return (
        <div className="main-content">
          <div>
            <h1>Full Question: {full_question_text}</h1>
          </div>
          <div>
            <h1>Answer: {answer_question_text}</h1>
            <h1>Question #: {this.questionNumber} </h1>
          </div>
          <div>
            <label htmlFor="roundSelector">Choose a quiz number:</label>
            <select onChange={(e) => this.setQuizNumber(e.target.value)} name="quizSelector" id="quizSelector">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="practice">practice</option>
            </select>
          </div>
          <this.showQuestionControls></this.showQuestionControls>
          <h4>Quizzers in room: {this.state.quizzers_in_room.join(', ')}</h4>
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

  render() {
    const {
      q_text_to_display,
      room,
      username,
      jumper
    } = this.state;
    return (
      <React.Fragment>
        <Navbar color="light" light>
          <NavbarBrand href="/">Bible Quiz 2.0</NavbarBrand>
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
        <Button onClick={() => this.mute()}>Mute Question Audio</Button>{' '}
        <h3>Audio Enabled: {this.state.play_audio.toString()}</h3>
      </React.Fragment>
    );
  }
}

export default App;
