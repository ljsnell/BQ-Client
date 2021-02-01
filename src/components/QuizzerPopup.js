import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import React from 'react';

const QuizzerDropdown = ({ open, onClose, quizzers, room, style }) => {
    if (!quizzers || !(typeof quizzers[0] === "string")) return null
    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description" style={style}>
            <DialogTitle id="scroll-dialog-title">Quizzers In Room #{room}</DialogTitle>
            <DialogContent>
                <List dense aria-label="quizzers">
                    {quizzers && quizzers.map((un, i) => (
                        <ListItem key={`${un}-${i}`}>
                            {/* <ListItemIcon><PersonIcon /></ListItemIcon> */}
                            <ListItemText primary={un} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default QuizzerDropdown

const QUIZZER_STYLE = {
    root: {
        width: '80%',
        maxWidth: '80vw',
        maxHeight: '80vh',
        position: 'fixed',
        top: '50%',
        left: '10%',
        transform: 'translate(0, -50%)',
        overflowY: 'auto'
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
}