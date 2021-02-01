import { Accordion, AccordionDetails, AccordionSummary, List, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from 'react';

const AnswerBar = ({ question, type, answer, reference, questionNumber, style }) => {
    return (
        <Accordion style={style}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="qm-panel-content" id="qm-panel-header" >
                <Typography>Quiz Master Panel</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <List dense aria-label="quizmaster-panel">
                    <Typography><strong>Full Question #{questionNumber}:</strong> {question}</Typography><br />
                    <Typography><strong>Answer: </strong>{answer}</Typography><br />
                    <Typography><strong>Type: </strong>{type}</Typography><br />
                    <Typography><strong>Reference: </strong>{reference}</Typography><br />
                </List>
            </AccordionDetails>
        </Accordion >
    )
}

export default AnswerBar