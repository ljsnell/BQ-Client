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
    const { user_name, room_number, signed_in } = this.props;

    return (
      <Container maxWidth={false} style={{ backgroundColor: COLORS.WHITE, height: '100vh', width: '100%' }}>
        <AppBar position="fixed" style={{ backgroundColor: COLORS.LIGHT_NAV }}>
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Bible Quiz
              </Typography>
            {signed_in && <Button color="inherit">{user_name} | Rm. #{room_number}</Button>}
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Container maxWidth={false} style={{ paddingTop: 5 }}>
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
      </Container>
    )
  }
}

function mapStateToProps(state) {
  const { userName, roomNumber, signedIn } = state
  return { user_name: userName, room_number: roomNumber, signed_in: signedIn }
}

export default connect(mapStateToProps)(App)
