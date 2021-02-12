import { Snackbar } from '@material-ui/core';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Alert from 'reactstrap/lib/Alert';
import { ActionBar, AnswerPanel, QuestionBar, QuizPicker, ToolBox } from '../components';
import { ACTION_BAR_HEIGHT, QUIZ_STATE, TOOLBOX_HEIGHT } from '../globals';
import BQClient from '../utils/client';
import QuestionReader from '../components/QuestionReader';
import { COLORS } from '../theme';
import { fetchQuestion } from '../webserviceCalls';

const client = BQClient();
const QUESTION_INTERVAL = 1000;

const INITIAL_STATE = {
    quiz_state: QUIZ_STATE.WAITING,
    question_asked: false,
    iterator_index: 0,
    jumper_user_name: null,
    current_display_text: null,
    current_question_number: 0,
    current_question_type: null,
    current_question_text: null,
    current_question_answer: null,
    current_question_reference: null,
    volume_on: false
}

class Quiz extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // IN USE
            ...INITIAL_STATE
        }
        this.interval = null;
    }

    componentDidMount() {
        const { user_name, room_number, qm } = this.props
        client.emit(client.CLIENT_CODES.ROOM, JSON.stringify({ room: room_number, username: qm ? 'QM' : user_name }));

        client.on(client.CLIENT_CODES.JOINED, this._quizzerJoined);
        client.on(client.CLIENT_CODES.CONTENTCHANGE, this._contentChange);
        client.on(client.CLIENT_CODES.JUMP, this._questionJumped);
        client.on(client.CLIENT_CODES.NEXTQUESTIONTYPE, this._nextQuestionTypePressed);
    }

    render() {
        const {
            quiz_state,
            quizzers_in_room,
            current_display_text,
            current_question_number,
            current_question_type,
            current_question_text,
            current_question_answer,
            current_question_reference,
            jumper_user_name
        } = this.state;

        const { quiz_master, current_quiz_number, volume_on } = this.props;

        return (
            <div style={QUIZ_STYLE.root}>
                <QuestionBar type={current_question_type} question={current_display_text} state={quiz_state} style={QUIZ_STYLE.questions} />
                {quiz_master && quiz_state > QUIZ_STATE.WAITING &&
                    <AnswerPanel
                        type={current_question_type}
                        question={current_question_text}
                        answer={current_question_answer}
                        reference={current_question_reference}
                        questionNumber={current_question_number < 1 ? 1 : current_question_number}
                        style={QUIZ_STYLE.questions}
                    />
                }
                <ActionBar
                    allQuizzers={quizzers_in_room}
                    isQuizMaster={quiz_master}
                    state={quiz_state}
                    questionNumber={current_question_number}
                    currentQuizNumber={current_quiz_number}
                    startAction={this.startQuiz}
                    announceAction={this.announceQuestion}
                    nextAction={this.nextQuestion}
                    bonusAction={this.startQuiz}
                    jumpAction={this.jumpQuestion}
                    completeAction={this.completeQuestion}
                    resetRoom={this.resetRoom}
                />
                <Snackbar open={jumper_user_name ? true : false} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} style={{ marginBottom: ACTION_BAR_HEIGHT - 15 }}>
                    <Alert severity="info">Jumped by {jumper_user_name}!</Alert>
                </Snackbar>
            </div>
        )
    }

    resetRoom = async () => {
        clearInterval(this.interval);
        await this.setState({ ...INITIAL_STATE })
        this.syncQuiz()
    }

    startQuiz = async () => {
        this.interval = setInterval(() => this.iterativeSyncQuiz(), QUESTION_INTERVAL);
        await this.setState({ quiz_state: QUIZ_STATE.STARTED })
        this.syncQuiz()
    }

    announceQuestion = async () => {
        const { all_question_ids } = this.props;
        const { current_question_number } = this.state;

        const question = all_question_ids && all_question_ids[current_question_number]

        await this.getNextQuestionFromServer(question)

        await this.setState({
            quiz_state: QUIZ_STATE.ANNOUNCED,
            current_question_number: current_question_number + 1,
            jumper_user_name: null
        })
        this.syncQuiz()
    }

    nextQuestion = async () => {
        await this.setState({ quiz_state: QUIZ_STATE.ASKED, current_index: 0 })
        this.syncQuiz()
    }

    jumpQuestion = async () => {
        await this.setState({ quiz_state: QUIZ_STATE.PAUSED })
        this.syncJump()
    }

    completeQuestion = async () => {
        const { current_question_text, current_question_list } = this.state
        await this.setState({
            jumper_user_name: null,
            quiz_state: QUIZ_STATE.ASKED,
            current_index: current_question_list.length + 1,
            current_display_text: current_question_text
        })
        this.syncQuiz()
    }

    async iterativeSyncQuiz() {
        const { quiz_state, current_index, current_display_text, current_question_list, volumeOn } = this.state

        const ASKED = quiz_state === QUIZ_STATE.ASKED;
        const PAUSED = quiz_state === QUIZ_STATE.PAUSED;

        if (PAUSED) { return }
        else if (ASKED && current_question_list && current_index < current_question_list.length) {
            const next_word = current_question_list[current_index]

            const updateDisplay = current_display_text.concat(`${next_word} `)
            await this.setState({ current_display_text: updateDisplay, current_index: current_index + 1 })
            this.syncQuiz()
        } else if (ASKED) {
            this.setState({ quiz_state: QUIZ_STATE.STARTED })
        }
    }

    async getNextQuestionFromServer(question) {
        await fetchQuestion(question)
            .then(res => res.json())
            .then((data) => {
                const [type, question, answer, reference] = data;
                this.setState({
                    current_index: 0,
                    current_display_text: "",
                    current_question_type: type,
                    current_question_text: question,
                    current_question_list: question.split(" "),
                    current_question_answer: answer,
                    current_question_reference: reference,
                })
            });
    }

    syncQuiz = () => {
        const { room_number } = this.props
        const { quiz_state, jumper_user_name, current_display_text, current_question_text, current_question_list, current_question_type, current_question_number } = this.state
        client.emit(client.CLIENT_CODES.CONTENTCHANGE, JSON.stringify({
            room_number: room_number,
            current_display_text: current_display_text,
            current_question_text: current_question_text,
            current_question_list: current_question_list,
            current_question_number: current_question_number,
            current_question_type: current_question_type,
            quiz_state: quiz_state,
            jumper_user_name: jumper_user_name
        }));
    };

    syncJump = () => {
        const { room_number, user_name } = this.props
        const { current_index, quiz_state } = this.state
        client.emit(client.CLIENT_CODES.JUMP, JSON.stringify({
            quiz_state: quiz_state,
            jumper_user_name: user_name,
            room_number: room_number,
            current_index: current_index
        }));
    };

    _quizzerJoined = (res) => {
        // console.log('Joined!', res)
        this.setState({ quizzers_in_room: res })
    }

    _contentChange = (res) => {
        const { jumper_user_name, current_display_text, current_question_text, current_question_list, current_question_number, current_question_type, room_number, quiz_state } = res
        const { volume_on } = this.props

        QuestionReader({ word_to_read: current_display_text, volumeOn: volume_on })
        this.setState({
            current_display_text: current_display_text,
            current_question_text: current_question_text,
            current_question_list: current_question_list,
            current_question_number: current_question_number,
            current_question_type: current_question_type,
            room_number: room_number,
            quiz_state: quiz_state,
            jumper_user_name: jumper_user_name
        })
    }

    _questionJumped = (res) => {
        const { jumper_user_name } = this.state;
        this.setState({
            quiz_state: res.quiz_state,
            jumper_user_name: jumper_user_name || res.jumper_user_name,
            current_index: res.current_index
        })
    }

    _nextQuestionTypePressed = (res) => {
        console.log('Next Question!', res)
        this.setState({
            question_type: res.question_type,
            question_number: res.question_number,
            q_text_to_display: "",
            full_question_text: "",
            jumper: "",
            question_reference: "",
            answer_question_text: "",
            futureQuestionType: "",
            is_bonus: false
        })
    }
}


function mapStateToProps(state) {
    const { userName, roomNumber, signedIn, qm, currentQuiz, currentQuizNumber, volumeOn } = state
    return { quiz_master: qm, user_name: userName, room_number: roomNumber, signed_in: signedIn, all_question_ids: currentQuiz, current_quiz_number: currentQuizNumber, volume_on: volumeOn }
}

export default connect(mapStateToProps)(Quiz)

const QUIZ_STYLE = {
    root: { paddingBottom: 20, marginTop: TOOLBOX_HEIGHT + 10, marginBottom: ACTION_BAR_HEIGHT },
    questions: { marginTop: 10 },
}