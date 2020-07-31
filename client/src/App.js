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

const io = require('socket.io-client');
const client = io.connect('http://127.0.0.1:8000/');
// const client = io.connect('wss://mysterious-journey-90036.herokuapp.com');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      jumper: '',
      q_text_to_display: "",
      i: 0,
      full_question_text: "*** Welcome to the quiz! ***"
    };
  }
  // Question iterators
  questionNumber = 0
  bonusQuestionNumber = 0

  // Quiz Questions
  questionIDs = [252, 166, 3204, 277, 1, 108, 3268, 70, 188, 67, 95, 228, 218, 84, 197, 165, 3261, 230, 181, 198]
  bonusQuestionIDs = [3257, 171, 56, 256, 124, 3281, 3187, 3256, 3177, 76]

  /* When content changes, we send the
current content of the editor to the server. */
 sync = (q_text_to_display, full_question_text) => {
   client.emit('contentchange', JSON.stringify({
     content: q_text_to_display,
     full_question_text: full_question_text
   }));
 };

 syncJump = (i) => {
  client.emit('jump', JSON.stringify({
    username: this.state.username,
    i: i
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
      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      msg.voice = voices[1]; // Note: some voices don't support altering params
      msg.voiceURI = 'native';
      msg.volume = 1; // 0 to 1
      msg.rate = 1; // 0.1 to 10
      msg.pitch = 2; //0 to 2
      msg.text = dataFromServer.full_question_text;
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
      full_question_text,
      username,
      jumper
    } = this.state
    console.log('jumper:')
    console.log(jumper) 
    // If jumper is null nobody has jumped on the question and we'll\
    // allow an update.
    if(jumper == null) {
      this.question_array = full_question_text.split(" ")
      this.setState({username: username})
      this.i = this.question_array.length
      this.syncJump(this.i)
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

  showQuizMasterSection = () => {
    var { username} = this.state
    if(username === 'quizmaster') {
      return (
        <div className="main-content">
          <Button onClick={()=>this.nextQuestion()} variant="secondary">Next Question</Button>{' '}
          <Button onClick={()=>this.bonusQuestion()} variant="secondary">Bonus Question</Button>{' '}
          <Button onClick={()=>setInterval(() => this.startQuiz(),1000)} variant="secondary">Start Quiz</Button>{' '}
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

  handleChange(event) {
    this.setState({username: event.target.value});
    this.showQuizMasterSection()
  }

  render() {
    const {
      q_text_to_display
    } = this.state;

    return (
      <React.Fragment>
        <Navbar color="light" light>
          <NavbarBrand href="/">Bible Quiz 1.4</NavbarBrand>
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
