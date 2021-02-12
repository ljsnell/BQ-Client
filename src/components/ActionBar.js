import { AppBar, Button, Container, Toolbar } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import WbIncandescent from '@material-ui/icons/WbIncandescent';
import React from 'react';
import { QuizzerPopup } from '.';
import { ACTION_BAR_HEIGHT, QUIZ_STATE } from '../globals';
import { COLORS } from '../theme';
import ToolBox from './ToolBox';

class ActionBar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showToolbox: false,
            showQuizzers: false
        }
    }
    render() {
        const { isQuizMaster, state, questionNumber, startAction, nextAction, announceAction, bonusAction, jumpAction, completeAction, resetRoom, allQuizzers } = this.props

        return (
            <div>
                {isQuizMaster &&
                    <Container align="center">
                        <Button variant="outlined" onClick={() => this.setState({ showQuizzers: true })} style={ACTION_STYLE.viewButton}>View Quizzers</Button>
                        <QuizzerPopup open={this.state.showQuizzers} onClose={() => this.setState({ showQuizzers: false })} quizzers={allQuizzers} style={ACTION_STYLE.quizzers} />
                        <br />
                        <Button variant="text" onClick={resetRoom} style={ACTION_STYLE.resetButton}>Reset Room</Button>
                    </Container>
                }
                <AppBar position="fixed" style={ACTION_STYLE.appBar}>
                    <Toolbar>
                        <MoreVertIcon onClick={() => this.setState({ showToolbox: true })} />
                        <ToolBox resetRoom={resetRoom} open={this.state.showToolbox} onClose={() => this.setState({ showToolbox: false })} />
                        {!isQuizMaster && state === QUIZ_STATE.ASKED && <Button variant="contained" onClick={jumpAction} style={ACTION_STYLE.fabButton} startIcon={<WbIncandescent style={ACTION_STYLE.jump} />}>Jump!</Button>}

                        {isQuizMaster &&
                            <Container align="center">
                                {state === QUIZ_STATE.WAITING && <Button variant="outlined" onClick={startAction} style={ACTION_STYLE.fabButton} startIcon={<PlayCircleOutlineIcon style={ACTION_STYLE.jump} />}>Start Quiz</Button>}

                                {state === QUIZ_STATE.ASKED && <Button variant="outlined" onClick={jumpAction} style={ACTION_STYLE.secondaryButton}>Pause</Button>}

                                {state === QUIZ_STATE.PAUSED && <Button onClick={completeAction} style={ACTION_STYLE.mainButton}>Complete</Button>}

                                {state === QUIZ_STATE.ANNOUNCED && <Button onClick={nextAction} style={ACTION_STYLE.mainButton}>{questionNumber === 1 ? 'Ask' : 'Next'} Question</Button>}
                                {state === QUIZ_STATE.STARTED && < Button onClick={announceAction} style={ACTION_STYLE.mainButton}>Announce Type</Button>}
                                {state === QUIZ_STATE.STARTED && <Button variant="outlined" onClick={bonusAction} style={ACTION_STYLE.secondaryButton}>Bonus</Button>}
                            </Container >
                        }
                    </Toolbar>
                </AppBar>
            </div>
        )
    }
}

export default ActionBar

const ACTION_STYLE = {
    resetButton: { marginTop: 10, color: COLORS.WARNING },
    viewButton: { marginTop: 15, color: COLORS.GREY },
    jump: { color: COLORS.PRIMARY },
    appBar: {
        height: ACTION_BAR_HEIGHT,
        backgroundColor: COLORS.PRIMARY,
        top: 'auto',
        bottom: 0,
    },
    mainButton: { backgroundColor: COLORS.SECONDARY, color: COLORS.DARKTEXT, marginLeft: 5, marginRight: 5 },
    secondaryButton: { backgroundColor: 'transparent', color: COLORS.WHITE, borderColor: 'white', marginLeft: 5, marginRight: 5 },
    fabButton: {
        position: 'absolute',
        zIndex: 1,
        top: -10,
        paddingTop: 10,
        paddingBottom: 10,
        left: 0,
        right: 0,
        margin: '0 auto',
        border: '3px solid',
        borderColor: COLORS.SECONDARY,
        backgroundColor: COLORS.LIGHTTEXT,
        color: COLORS.DARKTEXT
    },
}