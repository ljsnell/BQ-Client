import { Container, Paper, Typography } from '@material-ui/core';
import React from 'react';
import { COLORS } from '../theme'

const googleyEye = () => <span role="img" aria-label="googley-eye">👀</span>

const QuestionBar = ({ question, started, style }) => {
    return (
        <div style={style}>
            <Paper style={QB_STYLE.root}>
                {!started &&
                    <Container align='center'>
                        <Typography variant="h4">Welcome!</Typography>
                        <br />
                        The Quiz Master has not yet started the quiz. Watch here for updates.
                    </Container>}
                {started && !question &&
                    <Container align='center'>
                        <Typography variant="h5" style={{ color: COLORS.ACCENT }}>Quiz has started!</Typography>
                        <br />{googleyEye()}<br />
                        Watch for the question to appear here.
                </Container>}
                <Typography variant="h4">
                    {question}
                </Typography>
            </Paper>
        </div>
    )
}

export default QuestionBar

const QB_STYLE = {
    root: { padding: 15 }
}