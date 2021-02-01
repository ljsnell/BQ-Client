import React from 'react';
import { Button } from '@material-ui/core';
import { COLORS } from '../theme';
import { QUIZ_STATE } from '../globals';

class ActionBar extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const { isQuizMaster, state, questionNumber, startAction, nextAction, announceAction, bonusAction, jumpAction, resumeAction, completeAction } = this.props

        return (
            <div>
                {state === QUIZ_STATE.ASKED && <Button fullWidth onClick={jumpAction} style={ACTION_STYLE.button}>JUMP!</Button>}

                {isQuizMaster &&
                    <div>
                        {state === QUIZ_STATE.WAITING && <Button fullWidth onClick={startAction} style={ACTION_STYLE.button}>Start Quiz</Button>}
                        {state === QUIZ_STATE.PAUSED && <Button fullWidth onClick={completeAction} style={ACTION_STYLE.button}>Complete Question</Button>}
                        {state === QUIZ_STATE.PAUSED && <Button fullWidth onClick={resumeAction} style={ACTION_STYLE.button}>Resume Question</Button>}
                        {state === QUIZ_STATE.ANNOUNCED && <Button fullWidth onClick={nextAction} style={ACTION_STYLE.button}>{questionNumber === 1 ? 'Ask' : 'Next'} Question</Button>}
                        {state === QUIZ_STATE.STARTED && < Button fullWidth onClick={announceAction} style={ACTION_STYLE.button}>Announce Type</Button>}
                        {(state === QUIZ_STATE.WAITING || state === QUIZ_STATE.STARTED) && <Button fullWidth onClick={bonusAction} style={ACTION_STYLE.button}>Bonus</Button>}
                    </div >
                }
            </div >
        )

    }
}

export default ActionBar

const ACTION_STYLE = {
    button: { marginTop: 10, backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE }
}