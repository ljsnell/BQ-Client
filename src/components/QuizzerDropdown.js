import { Accordion, AccordionDetails, AccordionSummary, List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PersonIcon from '@material-ui/icons/Person';
import React from 'react';

const QuizzerDropdown = ({ quizzers, room, style }) => {
    if (!quizzers || !(typeof quizzers[0] === "string")) return null
    return (
        <Accordion style={style}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" >
                <Typography>Quizzers In Room #{room}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <List dense aria-label="quizzers">
                    {quizzers && quizzers.map((un, i) => (
                        <ListItem key={`${un}-${i}`}>
                            <ListItemIcon><PersonIcon /></ListItemIcon>
                            <ListItemText primary={un} />
                        </ListItem>
                    ))}
                </List>
            </AccordionDetails>
        </Accordion >
    )
}

export default QuizzerDropdown