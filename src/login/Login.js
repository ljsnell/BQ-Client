import React, { useState } from "react";
import { Button, Form, Label, Input, FormGroup } from 'reactstrap';
import { useHistory } from "react-router-dom";
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import '../App.css';

export default function Login() {
    const [room, setRoom] = useState("");
    const [username, setUsername] = useState("");

    const history = useHistory();

    function validateForm() {
        return room.length > 0 && username.length > 0;
    }

    function handleSubmit(event) {
        let validInput = validateForm();
        console.log(validInput);
        let path = `quiz`;
        history.push(path);        
    }

    return ( // https://reactstrap.github.io/components/form/
        <Form>
            <FormGroup>
                <Label for="roomNumber">Room #</Label>
                <Input type="roomNum" name="roomNum" id="roomNumID" placeholder="room"
                    onChange={event => setRoom(event.target.value)} />
            </FormGroup>
            <FormGroup>
                <Label for="username">Username</Label>
                <Input type="userName" name="userName" id="userNameID" placeholder="E.G. 1-Jeff-Gnarwhals3.0"
                    onChange={event => setUsername(event.target.value)} />
            </FormGroup>
            <div className="footerButton" ><Button onClick={() => handleSubmit()}><h2>Login</h2></Button>{' '}</div>
        </Form>);
}