import { Button, Paper, Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import types from '../redux/actions/types';
import { COLORS } from '../theme';

const LOGIN_STYLE = {
    card: { marginTop: 15, paddingTop: 15, paddingBottom: 15 },
    title: { marginBottom: 15 },
    input: { marginBottom: 10, marginRight: 5, marginLeft: 5 },
    submit: { backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE }
}

class LoginForm extends Component {

    state = { un: '', rm: 0 }

    updateLogin = (val, key) => { this.setState({ [key]: val }); }

    submitLogin = () => {
        const { un, rm } = this.state;
        if (un === "" || rm === 0) return
        this.props.setLogin({ user_name: un, room_number: parseInt(rm) })
    }

    render() {
        return (
            <Paper elevation={3} style={LOGIN_STYLE.card}>
                <Typography align="center" variant="h5" style={LOGIN_STYLE.title}>Please Sign In</Typography>
                <form noValidate autoComplete="off" style={{ margin: 5 }} align="center">
                    <TextField onChange={({ target }) => this.updateLogin(target.value, "rm")} id="outlined-basic" label="Room Number" type="number" variant="outlined" helperText="Enter a number" style={LOGIN_STYLE.input} />
                    <TextField onChange={({ target }) => this.updateLogin(target.value, "un")} id="outlined-basic" label="Your Username" variant="outlined" helperText="E.G. 1-Jeff-G3" style={LOGIN_STYLE.input} />
                    <br />
                    <Button variant="contained" style={LOGIN_STYLE.submit} onClick={this.submitLogin}>
                        Submit
                    </Button>
                </form>
            </Paper>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setLogin: (payload) => { console.log("dispatching ... "); return dispatch({ type: types.SIGN_IN, payload: payload }) },
    }
}

export default connect(null, mapDispatchToProps)(LoginForm);

