import React, { Component } from 'react';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Login from "./login/Login";
import Quiz from "./Quiz";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route exact path="/">
              <Login />
            </Route>
            <Route path="/quiz">
              <Quiz />
            </Route>
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;