import React, { useState } from "react";
import { Button, Form, Label, Input, FormGroup } from 'reactstrap';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import '../App.css';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function validateForm() {
        return email.length > 0 && password.length > 0;
    }

    function handleSubmit(event) {
        event.preventDefault();
    }

    return ( // https://reactstrap.github.io/components/form/
        <Form>
            <FormGroup>
                <Label for="roomNumber">Room #</Label>
                <Input type="roomNum" name="roomNum" id="roomNumID" placeholder="room"/>
            </FormGroup>
            <FormGroup>
                <Label for="username">Room #</Label>
                <Input type="userName" name="userName" id="userNameID" placeholder="E.G. 1-Jeff-Gnarwhals3.0"/>
            </FormGroup>
            <div className="footerButton" ><Button onClick={() => this.handleSubmit()}><h2>Login</h2></Button>{' '}</div>
        </Form>
        // <div className="Login">
        //     <h2>Hi</h2>
        //     <div className="footerButton" ><Button onClick={() => this.handleSubmit()}><h2>Login</h2></Button>{' '}</div>
        // </div>
        // var user_room = prompt("Please enter your room #", "room");
        // var entered_username = prompt("Please enter your user name. E.G. 1-Jeff-Gnarwhals3.0", "Username");
    );
}