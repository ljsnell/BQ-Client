import { Button } from '@material-ui/core';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AnswerBar, QuestionBar, QuizzerDropdown } from '../components';
import { chapters } from '../constants';
import globals from '../globals';
import BQClient from '../services/client';
import { COLORS } from '../theme';
import { fetchQuestion } from '../webserviceCalls';

const QUIZZES = globals.QUIZ_GLOBAL
const client = BQClient();
const QUESTION_INTERVAL = 1000;
// const bonusQuestionIDs = QUIZZES.quiz1.bonus
// const selectedRandomQuestionType = 1;
// const bonusQuestionNumber = 0
// const showMoreOpions = true;

class Quiz extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // IN USE
            quiz_started: false,
            question_asked: false,
            all_question_ids: QUIZZES.quiz1.qs,
            iterator_index: 0,
            current_display_text: null,
            current_question_number: 0,
            current_question_type: null,
            current_question_text: null,
            current_question_answer: null,
            current_question_reference: null,

            // LUKE
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
            quizNumber: "1",
            play_audio: false,
            quizzers_in_room: [],
            selectedChapters: chapters,
            chair_to_test: 1,
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
            quiz_started,
            quizzers_in_room,
            current_display_text,
            current_question_number,
            current_question_type,
            current_question_text,
            current_question_answer,
            current_question_reference
        } = this.state;
        const { room_number } = this.props;

        return (
            <div style={QUIZ_STYLE.root}>
                <QuestionBar question={current_display_text} started={quiz_started} style={QUIZ_STYLE.questions} />
                {quiz_started && <AnswerBar
                    type={current_question_type}
                    question={current_question_text}
                    answer={current_question_answer}
                    reference={current_question_reference}
                    questionNumber={current_question_number < 1 ? 1 : current_question_number}
                    style={QUIZ_STYLE.questions}
                />}
                {!quiz_started && <Button fullWidth onClick={() => this.startQuiz()} style={QUIZ_STYLE.button}>Start Quiz</Button>}
                <Button fullWidth onClick={() => this.nextQuestion()} style={QUIZ_STYLE.button}>{current_question_number === 0 ? 'Ask' : 'Next'} Question</Button>
                <Button fullWidth onClick={() => this.nextQuestion()} style={QUIZ_STYLE.button}>Announce Type</Button>
                <Button fullWidth onClick={() => this.nextQuestion()} style={QUIZ_STYLE.button}>Bonus</Button>
                <QuizzerDropdown quizzers={quizzers_in_room} room={room_number} style={QUIZ_STYLE.quizzers} />
            </div>
        )
    }

    async startQuiz() {
        const { all_question_ids, current_question_number } = this.state;
        const question = all_question_ids && all_question_ids[current_question_number]

        setInterval(() => this.iterativeSync(), QUESTION_INTERVAL);
        this.getNextQuestionFromServer(question)
        await this.setState({ quiz_started: true })
        this.sync()
    }

    async iterativeSync() {
        const { question_asked, current_index, current_display_text, current_question_list } = this.state

        if (question_asked && current_question_list && current_index < current_question_list.length) {
            const updateDisplay = current_display_text.concat(`${current_question_list[current_index]} `)
            await this.setState({ current_display_text: updateDisplay, current_index: current_index + 1 })
            this.sync()
        } else if (question_asked) {
            this.setState({ question_asked: false })
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

    nextQuestion = async () => {
        const { all_question_ids, current_question_number } = this.state;

        const nextQuestionNumber = current_question_number + 1
        const question = all_question_ids && all_question_ids[nextQuestionNumber]

        if (current_question_number !== 0) this.getNextQuestionFromServer(question) //first q is retrieved on start

        await this.setState({ question_asked: true, current_question_number: nextQuestionNumber })
        this.sync()
    }

    sync = () => {
        const { room_number } = this.props
        const { quiz_started, question_asked, current_display_text, current_question_text, current_question_list, current_question_type, current_question_number } = this.state
        client.emit(client.CLIENT_CODES.CONTENTCHANGE, JSON.stringify({
            room_number: room_number,
            current_display_text: current_display_text,
            current_question_text: current_question_text,
            current_question_list: current_question_list,
            current_question_number: current_question_number,
            current_question_type: current_question_type,
            quiz_started: quiz_started,
            question_asked: question_asked,
        }));
    };

    _quizzerJoined = (res) => {
        // console.log('Joined!', res)
        this.setState({ quizzers_in_room: res })
    }

    _contentChange = (res) => {
        const { current_display_text, current_question_text, current_question_list, current_question_number, current_question_type, room_number, quiz_started, question_asked, } = res
        this.setState({
            current_display_text: current_display_text,
            current_question_text: current_question_text,
            current_question_list: current_question_list,
            current_question_number: current_question_number,
            current_question_type: current_question_type,
            room_number: room_number,
            quiz_started: quiz_started,
            question_asked: question_asked,
        })
    }
    _questionJumped = (res) => {
        console.log('Jumped!', res)
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
    const { userName, roomNumber, signedIn, qm } = state
    return { quiz_master: qm, user_name: userName, room_number: roomNumber, signed_in: signedIn }
}

export default connect(mapStateToProps)(Quiz)

const QUIZ_STYLE = {
    root: { paddingBottom: 20 },
    quizzers: { marginTop: 20 },
    questions: { marginTop: 10 },
    button: { marginTop: 10, backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE }
}