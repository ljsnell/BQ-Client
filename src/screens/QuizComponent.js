import React, { Component } from 'react';
import { connect } from "react-redux";

class App extends Component {
    render() {
        const { user_name, room_number, signed_in } = this.props;

        return (
            <div style={{ flexGrow: 1 }}>
                <h1>Authenticated!</h1>
                <h3>Username: {user_name}</h3>
                <h3>room_number: {room_number}</h3>
                <h3>signed_in: {signed_in}</h3>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { userName, roomNumber, signedIn } = state
    return { user_name: userName, room_number: roomNumber, signed_in: signedIn }
}

export default connect(mapStateToProps)(App)
