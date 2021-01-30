import React, { Component } from 'react';
import { connect } from 'react-redux';
import globals from '../globals';
import BQClient from '../services/client';

const QUIZZES = globals.QUIZ_GLOBAL
const client = BQClient();

class Quiz extends Component {
    constructor(props) {
        super(props);
        this.state = {
            muted: true
        }
    }

    componentDidMount() {
        const { user_name, room_number } = this.props
        client.emit(client.CLIENT_CODES.ROOM, JSON.stringify({ room: room_number, username: user_name }));

        client.on(client.CLIENT_CODES.JOINED, this.quizzerJoined);
        client.on(client.CLIENT_CODES.CONTENTCHANGE, this.contentChange);
        client.on(client.CLIENT_CODES.JUMP, this.questionJumped);
        client.on(client.CLIENT_CODES.NEXTQUESTIONTYPE, this.nextQuestionTypePressed);
    }

    render() {
        const { volume, quizzers_in_room } = this.state;
        const { user_name, room_number, signed_in } = this.props;

        return (
            <div>
                <h4>Volume: {volume ? 'Loud' : 'Muted'}</h4>
                <h4>user_name: {user_name}</h4>
                <h4>room_number: {room_number}</h4>
                <h4>signed_in: {signed_in}</h4>
                {quizzers_in_room && < h4 > inRoom: {quizzers_in_room.toString()}</h4>}
            </div>
        )
    }

    quizzerJoined = (res) => {
        console.log('Joined!', res)
        this.setState({ quizzers_in_room: res })
    }
    contentChange = (res) => {
        console.log('Content Changed!', res)
        this.setState({ quizzers_in_room: res })
    }
    questionJumped = (res) => {
        console.log('Jumped!', res)
    }
    nextQuestionTypePressed = (res) => {
        console.log('Next Question!', res)
        this.setState({ quizzers_in_room: res })
    }
}


function mapStateToProps(state) {
    const { userName, roomNumber, signedIn } = state
    return { user_name: userName, room_number: roomNumber, signed_in: signedIn }
}

export default connect(mapStateToProps)(Quiz)
