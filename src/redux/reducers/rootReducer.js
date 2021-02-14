import { QUIZ_GLOBAL } from '../../globals';
import types from '../actions/types';

// const INITIAL_STATE = {
//     currentQuiz: QUIZ_GLOBAL.quiz1.qs,
//     currentQuizNumber: "quiz1",
//     userName: "QM-sergei",
//     roomNumber: 1,
//     signedIn: true,
//     qm: true,
//     volume_on: false
// };

const INITIAL_STATE = {
    currentQuiz: QUIZ_GLOBAL.quiz1.qs,
    currentQuizNumber: "quiz1",
    userName: "",
    roomNumber: 0,
    signedIn: false,
    qm: false
};

const rootReducer = (state = INITIAL_STATE, action) => {
    let newState = state;
    switch (action.type) {
        case types.SIGN_IN:
            const { user_name, room_number, qm } = action.payload;
            newState = { ...state, qm: qm, userName: user_name, roomNumber: room_number, signedIn: true }
            return newState
        case types.SET_USERNAME:
            newState = { ...state, userName: action.payload }
            return newState
        case types.SET_ROOM_NUMBER:
            newState = { ...state, roomNumber: action.payload }
            return newState
        case types.VOLUME_TOGGLE:
            newState = { ...state, volumeOn: action.payload }
            return newState
        case types.SWITCH_QUIZ:
            const allQuestionIds = QUIZ_GLOBAL[action.payload].qs

            newState = { ...state, currentQuiz: allQuestionIds, currentQuizNumber: action.payload }
            return newState
        default:
            return { ...state }
    }
};

export default rootReducer;