import { Button, Container, Dialog, DialogActions, DialogContent, Typography } from '@material-ui/core';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { QuizPicker } from '.';
import types from '../redux/actions/types';

const ToolBox = ({ open, onClose, style }) => {
    const { volumeOn, qm } = useSelector(state => state);

    const dispatch = useDispatch();

    if (qm) {
        return (
            <Dialog open={open} onClose={onClose} aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description" style={style}>
                <Container align="center">
                    <Typography variant="h5" style={{ padding: 15 }}>More Settings:</Typography>
                </Container>
                <DialogContent>
                    <Container align="center">
                        <Typography variant="h2" style={TOOLBOX_STYLE.title}>Volume:</Typography>
                        <Button variant="outlined" color="primary" size="large" onClick={() => dispatch({ type: types.VOLUME_TOGGLE, payload: !volumeOn })} startIcon={volumeOn ? <VolumeUpIcon /> : <VolumeOffIcon />}>
                            {volumeOn ? "ON" : "OFF"}
                        </Button>
                        <Typography variant="h2" style={TOOLBOX_STYLE.title}>Change Quiz:</Typography>
                        <QuizPicker />
                    </Container>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">Done</Button>
                </DialogActions>
            </Dialog>
        )
    } else {
        return (
            <Dialog open={open} onClose={onClose} aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description" style={style}>
                <Container align="center">
                    <Typography variant="h5" style={{ padding: 15 }}>More Settings:</Typography>
                </Container>
                <DialogContent>
                    <Container align="center">
                        <Typography variant="h2" style={TOOLBOX_STYLE.title}>Volume:</Typography>
                        <Button variant="outlined" color="primary" size="large" onClick={() => dispatch({ type: types.VOLUME_TOGGLE, payload: !volumeOn })} startIcon={volumeOn ? <VolumeUpIcon /> : <VolumeOffIcon />}>
                            {volumeOn ? "ON" : "OFF"}
                        </Button>
                    </Container>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">Done</Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default ToolBox

const TOOLBOX_STYLE = {
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
    title: { marginBottom: 10, marginTop: 15, fontSize: 12 },
    divider: { marginBottom: 10 }
}
