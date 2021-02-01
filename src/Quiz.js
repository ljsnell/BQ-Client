import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import React, { Component } from 'react';
import './App.css';
import Login from './screens/LoginComponent';
import { connect } from "react-redux";
import QuizComponent from './screens/QuizComponent';
// import Quiz_backup from './Quiz_backup';

class Quiz extends Component {
    render() {
        const { signed_in } = this.props
        return <div>
            {!signed_in && < Login />}
            {signed_in && < QuizComponent />}
            {/* {signed_in && < Quiz_backup />} */}
        </div>
    }
}

function mapStateToProps(state) {
    const { userName, roomNumber, signedIn } = state
    return { user_name: userName, room_number: roomNumber, signed_in: signedIn }
}

export default connect(mapStateToProps)(Quiz)
