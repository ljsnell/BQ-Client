import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Quiz from "./Quiz";
import { COLORS } from './theme';

class App extends Component {
  render() {
    const { user_name, room_number, signed_in, current_quiz_number } = this.props;

    return (
      <div>
        <AppBar position="fixed" style={{ backgroundColor: COLORS.LIGHT_NAV }}>
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Bible Quiz 3.0
              </Typography>
            {signed_in && <Button color="inherit">{user_name} | Rm. #{room_number} | {current_quiz_number}</Button>}
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Container maxWidth={false} style={{ paddingTop: 5 }} style={{ backgroundColor: COLORS.WHITE, minHeight: '100vh', overflow: 'auto', width: '100%' }}>
          <Router>
            <div>
              <Switch>
                <Route exact path="/">
                  <Quiz />
                </Route>
              </Switch>
            </div>
          </Router>
        </Container>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { userName, roomNumber, signedIn, currentQuizNumber } = state
  return { user_name: userName, room_number: roomNumber, signed_in: signedIn, current_quiz_number: currentQuizNumber }
}

export default connect(mapStateToProps)(App)
