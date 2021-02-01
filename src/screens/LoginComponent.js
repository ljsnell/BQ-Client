import { Button, Checkbox, FormControlLabel, Paper, TextField, Typography } from '@material-ui/core';
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

    state = { un: '', rm: 0, qm: false, tm: '', ch: 0 }

    updateLogin = (val, key) => { this.setState({ [key]: val }); }

    submitLogin = () => {
        const { un, rm, tm, ch, qm } = this.state;
        if (!qm && un === "") return alert("Please specify a username")
        if (rm === 0) return alert("Please specify a room number")
        if (!qm && ch === 0) return alert("Please specify a chair number")

        const username = !qm ? `${ch}-${un}${tm && '-' + tm}` : `QM${un && '-' + un}`

        this.props.setLogin({ user_name: username, room_number: parseInt(rm) })
    }

    render() {
        return (
            <Paper elevation={3} style={LOGIN_STYLE.card}>
                <Typography align="center" variant="h5" style={LOGIN_STYLE.title}>Please Sign In</Typography>
                <form noValidate autoComplete="off" style={{ margin: 5 }} align="center">
                    <FormControlLabel
                        control={<Checkbox checked={this.state.qm} onChange={() => this.updateLogin(!this.state.qm, "qm")} inputProps={{ 'aria-label': 'primary checkbox' }} />}
                        label="Quiz Master"
                    />
                    <br />
                    <TextField onChange={({ target }) => this.updateLogin(target.value, "rm")} id="outlined-basic" label="Room Number" type="number" variant="outlined" helperText="Enter a number" style={LOGIN_STYLE.input} />
                    <TextField onChange={({ target }) => this.updateLogin(target.value, "un")} id="outlined-basic" label="Your Username" variant="outlined" helperText="E.G. LukeIsCool" style={LOGIN_STYLE.input} />
                    <br />
                    <TextField onChange={({ target }) => this.updateLogin(target.value, "tm")} id="outlined-basic" label="Team" variant="outlined" helperText="E.G. Unicorns" style={LOGIN_STYLE.input} />
                    <TextField onChange={({ target }) => this.updateLogin(target.value, "ch")} id="outlined-basic" label="Chair Number" type="number" variant="outlined" helperText="Enter a number" style={LOGIN_STYLE.input} />
                    <br />
                    <Button variant="contained" style={LOGIN_STYLE.submit} onClick={this.submitLogin}>Submit</Button>
                </form>
            </Paper>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setLogin: (payload) => dispatch({ type: types.SIGN_IN, payload: payload }),
    }
}

export default connect(null, mapDispatchToProps)(LoginForm);

