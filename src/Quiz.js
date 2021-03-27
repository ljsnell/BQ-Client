import React, { Component } from 'react';
import {
  Navbar,
  NavbarBrand,
  Button
} from 'reactstrap';
import VolumeUpOutlinedIcon from '@material-ui/icons/VolumeUpOutlined';
import VolumeOffOutlinedIcon from '@material-ui/icons/VolumeOffOutlined';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Select from 'react-select';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import './App.css';
import globals from './globals'
import { fetchQuestion, fetchQuestionType, fetchRandomQuestion } from './webserviceCalls';
import { chapters, questionTypes } from './constants';

const QUIZZES = globals.QUIZ_GLOBAL

// Websocket server
// let server = 'http://127.0.0.1:8000/'
let server = 'wss://mysterious-journey-90036.herokuapp.com'
const io = require('socket.io-client');
let user_room = prompt("Please enter your room #", "room");
let entered_username = prompt("Please enter your user name. E.G. 1-Jeff-G3", "1-Username");

let client = io.connect(server).emit('room', JSON.stringify({
  room: user_room,
  username: entered_username
}));

class Quiz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: entered_username,
      jumper: null,
      q_text_to_display: "",
      question_reference: "",
      question_number: 0,
      question_type: "",
      is_bonus: false,
      i: 0,
      futureQuestionType: "",
      full_question_text: "",
      answer_question_text: "🤔",
      room: user_room,
      quizNumber: "1",
      play_audio: false,
      quizzers_in_room: [],
      quiz_started: false,
      selectedChapters: chapters,
      chair_to_test: 1
    };
  }

  // Question iterators
  bonusQuestionNumber = 0
  showMoreOpions = true;

  // Quiz Questions
  questionIDs = QUIZZES.quiz1.qs
  bonusQuestionIDs = QUIZZES.quiz1.bonus
  selectedRandomQuestionType = 1;

  /* When content changes, we send the
current content of the editor to the server. */
  sync = (room_id) => {
    let {
      q_text_to_display,
      question_number,
      question_type,
      is_bonus,
      full_question_text,
      quiz_started
    } = this.state
    client.emit('contentchange', JSON.stringify({
      content: q_text_to_display,
      full_question_text: full_question_text,
      question_number: question_number,
      question_type: question_type,
      is_bonus: is_bonus,
      room: room_id,
      quiz_started: quiz_started
    }));
  };

  syncNextQuestionType = (room_id, nextQuestiontype, nextQuestionNumber) => {
    client.emit('next_question_type', JSON.stringify({
      question_type: nextQuestiontype,
      room: room_id,
      question_number: nextQuestionNumber
    }));
  }

  syncJump = (i, room_id, username) => {
    client.emit('jump', JSON.stringify({
      username: username,
      i: i,
      room: room_id
    }));
  };

  mute() {
    let audioOn = document.getElementById("audio-on");
    let audioOff = document.getElementById("audio-off");
    if (!this.state.play_audio) {
      audioOn.style.display = "block";
      audioOff.style.display = "none";
    } else {
      audioOff.style.display = "block";
      audioOn.style.display = "none";
    }
    this.setState({ play_audio: !this.state.play_audio })
  }

  spectatorText() {
    return (
      <div className="spectator">
        Spectator Mode. If you are a quizzer who needs the jump button please start your name with a  chair number. E.G. 1-Jeff
      </div>)
  }
  // Similar option for Full Question Text.
  showMoreQuizOptions() {
    let showMore = document.getElementById("showMore");
    let showLess = document.getElementById("showLess");
    let moreQuizOptions = document.getElementById("moreQuizOptions");
    this.showMoreOpions = !this.showMoreOpions;
    if (this.showMoreOpions) {
      showLess.style.display = "block";
      showMore.style.display = "none";
      moreQuizOptions.style.display = "block";
    } else {
      showMore.style.display = "block";
      showLess.style.display = "none";
      moreQuizOptions.style.display = "none";
    }
  }

  showQuizInfo() {
    let showMore = document.getElementById("showQuizInfo");
    let showLess = document.getElementById("hideQuizInfo");
    let moreQuizOptions = document.getElementById("quizInfo");
    this.showMoreOpions = !this.showMoreOpions;
    if (this.showMoreOpions) {
      showLess.style.display = "block";
      showMore.style.display = "none";
      moreQuizOptions.style.display = "block";
    } else {
      showMore.style.display = "block";
      showLess.style.display = "none";
      moreQuizOptions.style.display = "none";
    }
  }

  componentWillMount() {
    client.on('contentchange', function (message) {
      const dataFromServer = message
      const stateToChange = {};
      stateToChange.jumper = dataFromServer.jumper
      stateToChange.q_text_to_display = dataFromServer.question
      stateToChange.full_question_text = dataFromServer.full_question_text
      stateToChange.question_number = dataFromServer.question_number
      stateToChange.question_type = dataFromServer.question_type
      stateToChange.is_bonus = dataFromServer.is_bonus
      stateToChange.quiz_started = dataFromServer.quiz_started

      // Speaks the text aloud.
      if (this.state.play_audio === true) {
        try {
          let msg = new SpeechSynthesisUtterance();
          let voices = window.speechSynthesis.getVoices();
          msg.voice = voices[1]; // Note: some voices don't support altering params
          msg.voiceURI = 'native';
          msg.lang = 'en-US';
          if (dataFromServer.is_bonus) {
            msg.rate = 1; // 0.1 to 10
            msg.text = dataFromServer.question
          } else {
            msg.rate = 2.3; // 0.1 to 10
            let tts = dataFromServer.question.split(" ")
            msg.text = tts[tts.length - 2]
          }
          speechSynthesis.speak(msg);
        } catch {
          alert("Audio does not work on this device.")
          this.mute();
          let audiobutton = document.getElementById("audioButton");
          audiobutton.disabled = true;
        }
      }

      this.setState({
        ...stateToChange
      });
    }.bind(this));

    client.on('jump', function (message) {
      const dataFromServer = message;
      const stateToChange = {};
      console.log('Jumper!', this.state.jumper)

      if (this.state.jumper == null) {
        stateToChange.jumper = dataFromServer.username
        console.log('Jumper in state update: ', stateToChange.jumper)
        stateToChange.i = dataFromServer.i;

        this.setState({
          ...stateToChange
        });
      }
    }.bind(this));

    client.on('joined', function (message) {
      console.log('Joined!', message)
      this.setState({ quizzers_in_room: message })
    }.bind(this));

    client.on('next_question_type', function (message) {
      this.setState({
        question_type: message.question_type,
        question_number: message.question_number,
        q_text_to_display: "",
        full_question_text: "",
        jumper: "",
        question_reference: "",
        answer_question_text: "",
        futureQuestionType: "",
        is_bonus: false
      })
    }.bind(this));
  }

  startQuiz() {
    setInterval(() => this.iterativeSync(), 1000);
    this.nextQuestionType(true)
  }

  iterativeSync() {
    let {
      q_text_to_display,
      question_number,
      question_type,
      i,
      full_question_text,
      room,
    } = this.state
    this.question_array = full_question_text.split(" ")
    if (i < this.question_array.length) {
      q_text_to_display = q_text_to_display.concat(this.question_array[i]).concat(' ')
      i++
      this.setState({
        q_text_to_display: q_text_to_display, i: i, question_number: question_number,
        question_type: question_type, full_question_text: full_question_text, quiz_started: true
      })
      this.sync(room)
    }
  }

  jump() {
    let {
      full_question_text,
      username,
      jumper,
      room
    } = this.state
    if (jumper == null) {
      console.log('full_question_text', full_question_text)
      this.question_array = full_question_text.split(" ")
      this.setState({ username: username }, () => {
        this.i = this.question_array.length
        this.syncJump(this.i, room, username)
      })
    }
  }

  async nextQuestion(isNextBonus) {
    this.setState({ jumper: null, is_bonus: isNextBonus })
    let { question_number } = this.state
    let questionsList = isNextBonus ? this.bonusQuestionIDs : this.questionIDs
    let questionNUMTemp = isNextBonus ? this.bonusQuestionNumber : question_number
    if (questionNUMTemp < questionsList.length) {
      let questionID = questionsList[questionNUMTemp]
      await fetchQuestion(questionID)
        .then(res => res.json()).then((data) => {
          console.log('question from api!', data)
          this.i = 0
          if (isNextBonus) {
            this.bonusQuestionNumber++
            this.setState({
              question_type: data[0],
              full_question_text: data[1],
              q_text_to_display: data[1],
              answer_question_text: data[2],
              question_reference: data[3],
              question_number: question_number,
              i: data[1].length
            }) // Add two spaces to ensure no words get read aloud.
            this.sync(this.state.room)
          } else {
            this.setState({
              question_type: data[0],
              full_question_text: data[1],
              answer_question_text: data[2],
              question_reference: data[3],
              q_text_to_display: " ",
              question_number: question_number,
              i: this.i
            })
          }
          this.nextQuestionType()
        });
    } else {
      this.setState({
        q_text_to_display: "*** Out of questions :/ ***",
        full_question_text: "*** Out of questions :/ ***"
      })
    }
  }

  async nextQuestionType(isNewQuiz, selectedQuiz) {
    let { question_number } = this.state
    if (typeof selectedQuiz !== undefined && selectedQuiz === 'practice') {
      this.setState({ futureQuestionType: questionTypes[0] })
    } else {
      const nextQuestionNumTemp = isNewQuiz ? 0 : question_number + 1;
      if (nextQuestionNumTemp < this.questionIDs.length) {
        let nextQuestionID = this.questionIDs[nextQuestionNumTemp]
        await fetchQuestionType(nextQuestionID)
          .then(res => res.json()).then((data) => {
            console.log('Next question type from api:', data)
            this.setState({ futureQuestionType: data })
          });
      }
    }
  }

  async randomQuestion() {
    this.setState({ jumper: null })
    let { question_number, quiz_started } = this.state
    let selectedRandomChaptersList = []
    if (this.state.selectedChapters !== null && this.state.selectedChapters.length > 0) {
      for (let i = 0; this.state.selectedChapters.length > i; i++) {
        selectedRandomChaptersList.push(this.state.selectedChapters[i].value);
      }
    }
    await fetchRandomQuestion(this.selectedRandomQuestionType, 1, selectedRandomChaptersList)
      .then(res => res.json()).then((data) => {
        this.i = 0
        if (data != null) {
          console.log('random_question', data)
          this.setState({
            full_question_text: data[0],
            question_type: data[1],
            answer_question_text: data[2],
            question_reference: data[3],
            q_text_to_display: " ",
            question_number: question_number + 1,
            i: this.i
          })
        } else {
          this.setState({
            q_text_to_display: "*** No question found for selected criteria :/ ***",
            full_question_text: "*** No question found for selected criteria :/ ***"
          })
        }
        if (!quiz_started) {
          this.startQuiz()
        }
      });
  }

  async testChair() {
    this.setState({ jumper: null })
    let { quiz_started, chair_to_test } = this.state
    this.i = 0
    let result = chair_to_test + " Jump"
    this.setState({
      full_question_text: result,
      question_reference: result,
      question_type: result,
      answer_question_text: result,
      q_text_to_display: " ",
      question_number: 1,
      i: this.i
    })
    if (!quiz_started) {
      this.startQuiz()
    }
  };

  setQuizNumber(selectedQuizNumber) {
    this.setState({
      quizNumber: selectedQuizNumber,
      question_number: 0,
    })
    let selected_quiz = QUIZZES[`quiz${selectedQuizNumber}`]
    this.questionIDs = selected_quiz.qs
    this.bonusQuestionIDs = selected_quiz.bonus
    this.bonusQuestionNumber = 0
    this.nextQuestionType(true, selectedQuizNumber);
  }

  setTestChairNumber(selectedChair) {
    this.setState({
      chair_to_test: selectedChair
    })
  }

  updateRandomQuestionType = (e) => {
    this.selectedRandomQuestionType = e.target.value
    this.setState({ futureQuestionType: questionTypes[e.target.value - 1] })
  }

  displayNextQuestionType() {
    let { question_number, futureQuestionType, room } = this.state
    this.setState({
      question_number: question_number++
    })
    this.syncNextQuestionType(room, futureQuestionType, question_number)
  }

  showMoreQuizControls = () => {
    if (this.state.quizNumber === 'practice') {
      return (
        <div>
          <label htmlFor="questionTypeLabel">Choose a question type:</label>
          <select onChange={(e) => this.updateRandomQuestionType(e)} name="questionType" id="questionType">
            <option value="1">{questionTypes[0]}</option>
            <option value="2">{questionTypes[1]}</option>
            <option value="3">{questionTypes[2]}</option>
            <option value="4">{questionTypes[3]}</option>
            <option value="5">{questionTypes[4]}</option>
            <option value="6">{questionTypes[5]}</option>
            <option value="7">{questionTypes[6]}</option>
            <option value="8">{questionTypes[7]}</option>
            <option value="9">{questionTypes[8]}</option>
          </select>
          <div>
            <label htmlFor="questionChaptersLabel">Choose Chapters:</label>
            <Select
              defaultValue={[chapters[0], chapters[1], chapters[2], chapters[3], chapters[4], chapters[5], chapters[6], chapters[7], chapters[8], chapters[9], chapters[10], chapters[11], chapters[12], chapters[13], chapters[14], chapters[15], chapters[16], chapters[17], chapters[18], chapters[19], chapters[20], chapters[21], chapters[22], chapters[23], chapters[24], chapters[25], chapters[26], chapters[27]]}
              isMulti
              name="questionchapters"
              options={chapters}
              onChange={(e) => this.setState({ selectedChapters: e })}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>
        </div>
      )
    }
    if (this.state.quizNumber === 'lightcheck') {
      return (
        <div>
          <label htmlFor="chairSelector">Choose a chair to send a jump to: </label>
          <select onChange={(e) => this.setTestChairNumber(e.target.value)} name="chairSelector" id="chairSelector">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>)
    }
    return ""
  }

  showQuizMasterSection = () => {
    let { username, full_question_text, answer_question_text, question_number, question_reference, is_bonus, futureQuestionType } = this.state
    if (username === 'QMM2') {
      let questionNumTemp;
      if (is_bonus) {
        questionNumTemp = <h6 className="quizMasterBody"><b>Question:</b> Bonus</h6>
      } else {
        questionNumTemp = <h6 className="quizMasterBody"><b>Question:</b> #{question_number} </h6>
      }
      return (
        <div className="quiz_master_content">
          <div className="flex">
            <Button id="showMoreButton" onClick={() => this.showQuizInfo()}>
              <ExpandLessIcon id="showQuizInfo" style={{ display: 'none' }} />
              <ExpandMoreIcon id="hideQuizInfo" style={{ display: 'block' }} />
            </Button>
            <h6>Quiz Master Info</h6>
          </div>
          <div className="flex" id="quizInfo">
            <h4 className="quizMasterBody" style={{ flex: '1 100%', 'textAlign': 'left' }}><b>Full Question:</b> {full_question_text}</h4>
            <h4 className="quizMasterBody" style={{ flex: '1 100%', 'textAlign': 'left' }}><b>Answer:</b> {answer_question_text}</h4>
            <div className="quizMasterBody flex" style={{ flex: '1 100%' }}>
              <h6 className="quizMasterBody"><b>Quiz:</b> {this.state.quizNumber}</h6>
              {questionNumTemp}
              <h6 className="quizMasterBody"><b>Question Reference:</b> {question_reference}</h6>
            </div>
            <h6 className="quizMasterBody"><b>Next Question Type: </b>{futureQuestionType}</h6>
            <h6 className="quizMasterBody wrap_around"><b>Quizzers in room:</b> {this.state.quizzers_in_room.join(', ')}</h6>
          </div>
          <div className="flex">
            <Button id="showMoreButton" onClick={() => this.showMoreQuizOptions()}>
              <ExpandLessIcon id="showLess" />
              <ExpandMoreIcon id="showMore" style={{ display: 'none' }} />
            </Button>
            <h6>More Quiz Options</h6>
          </div>
          <div id="moreQuizOptions" className="flex">
            <label htmlFor="roundSelector">Choose a quiz number: </label>
            <select onChange={(e) => this.setQuizNumber(e.target.value)} name="quizSelector" id="quizSelector">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="practice">practice</option>
              <option value="lightcheck">light check</option>
            </select>
            <this.showMoreQuizControls></this.showMoreQuizControls>
          </div>
        </div>
      )
    }
    return ""
  }
  // Update Quiz master view to be collapsible for practice.
  footerButtons = () => {
    let { username, quiz_started } = this.state
    if (username === 'QMM2') {
      if (this.state.quizNumber === 'practice') {
        return (
          <div id="practiceQuiz" className="footerButton">
            <Button onClick={() => this.randomQuestion()}><h3>Next Random Question</h3></Button>{' '}
          </div>
        )
      }
      else if (this.state.quizNumber === 'lightcheck') {
        return (
          <div id="practiceQuiz" className="footerButton">
            <Button onClick={() => this.testChair()}><h3>Test Chair</h3></Button>{' '}
          </div>
        )
      } else {
        let nextQuestionType = <div className="threeFooterButtons" ><Button style={{ 'left': '0' }} onClick={() => this.displayNextQuestionType(false)}>Announce Question</Button></div>
        let startQuizORnextQuestion = <div className="threeFooterButtons" ><Button style={{ 'left': '33%' }} onClick={() => this.nextQuestion(false)}>Ask Question</Button></div>
        let bonusQuestion = <div className="threeFooterButtons" ><Button style={{ 'left': '66%' }} onClick={() => this.nextQuestion(true, this.bonusQuestionNumber)}>Bonus Question</Button></div>
        if (!quiz_started) {
          startQuizORnextQuestion = <div className="footerButton"><Button onClick={() => this.startQuiz()}><h2>Start Quiz</h2></Button></div>
          bonusQuestion = ""
        }
        return (
          <div id="realQuiz">
            { nextQuestionType}{' '}
            {startQuizORnextQuestion}{' '}
            {bonusQuestion}{' '}
          </div>
        )
      }
    } else if (username != null) {
      // Quizzer needs a username which starts with a chair #.
      if (!isNaN(username.charAt(0))) {
        return (
          <div className="footerButton">
            <Button onClick={() => this.jump()}><h2>Jump</h2></Button>
          </div>
        )
      } else {
        return this.spectatorText()
      }
    } else {
      return this.spectatorText()
    }
  }

  render() {
    const {
      q_text_to_display,
      question_number,
      question_type,
      is_bonus,
      room,
      username,
      quiz_started,
      jumper
    } = this.state;
    let quizzerQuestionInformation;
    let quizzerQuestion = <h2>{q_text_to_display}</h2>
    if (is_bonus) {
      quizzerQuestionInformation = <h4 className="question_information">Bonus Question: {question_type}</h4>
    } else if (question_number > 0 || quiz_started) {
      quizzerQuestionInformation = <h4 className="question_information">#{question_number}: {question_type}</h4>
    } else {
      quizzerQuestion = <h2><span role="img" aria-label="eyes">👀</span> Watch for the question to appear here. <span role="img" aria-label="eyes">👀</span></h2>
      quizzerQuestionInformation = <h4 className="question_information">Quiz Master has not started the quiz.</h4>
      if (quiz_started) {
        quizzerQuestionInformation = <h4 className="question_information">Welcome to the Quiz!</h4>
      }
    }
    let jumpTemp;
    if (jumper !== "" && jumper !== null && typeof jumper !== "undefined") {
      jumpTemp = <div><h3 className="jump_in_page_alert"><b>{jumper}</b> has won the Jump!</h3></div>
    }
    return (
      <React.Fragment>
        <Navbar color="light" light>
          <span className="wrap_around">Welcome <b>{username}</b> to room <b>{room}</b>! </span>
          <NavbarBrand href="/">Bible Quiz 2.0</NavbarBrand>
        </Navbar>
        {jumpTemp}
        <div className="flex" style={{ 'justifyContent': 'center' }}>
          <div>
            <Button id="audioButton" onClick={() => this.mute()}>
              <VolumeUpOutlinedIcon id="audio-on" style={{ display: 'none' }} />
              <VolumeOffOutlinedIcon id="audio-off" />
            </Button>
          </div>
          {quizzerQuestionInformation}
        </div>
        <div className="question">
          <div>
            {quizzerQuestion}
          </div>
        </div>
        <br></br>
        <div className="container-fluid">
          <this.showQuizMasterSection></this.showQuizMasterSection>
        </div>
        <this.footerButtons></this.footerButtons>
        <div style={{ height: "60px" }}></div>{/* To enable the page to scroll and show all content due to footer buttons */}
      </React.Fragment>
    )
  }
}

export default Quiz;
