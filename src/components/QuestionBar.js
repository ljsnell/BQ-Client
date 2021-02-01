import { Container, Divider, Paper, Typography } from '@material-ui/core';
import React from 'react';
import { QUIZ_STATE } from '../globals';
import { COLORS } from '../theme';

const googleyEye = () => <span role="img" aria-label="googley-eye">👀</span>

const QuestionBar = ({ question, state, type, style }) => {
    const started = state > QUIZ_STATE.WAITING;
    return (
        <div style={style}>
            <Paper style={QB_STYLE.root}>
                {!started &&
                    <Container align='center'>
                        <Typography variant="h4">Welcome!</Typography>
                        <br />
                        The Quiz Master has not yet started the quiz. Watch here for updates.
                    </Container>}
                {type &&
                    <div>
                        <Typography><strong>Type: </strong>{type}</Typography>
                        <Divider light style={QB_STYLE.divider} />
                    </div>
                }
                {started && !question &&
                    <Container align='center'>
                        <Typography variant="h5" style={{ color: COLORS.ACCENT }}>Quiz has started!</Typography>
                        <br />{googleyEye()}<br />
                        Watch for the question to appear here.
                    </Container>
                }
                {started && question &&
                    <Typography variant="h4">
                        {question}
                    </Typography>
                }
            </Paper>
        </div>
    )
}

export default QuestionBar

const QB_STYLE = {
    root: { padding: 15 },
    divider: { marginTop: 5, marginBottom: 10 }
}