import types from '../actions/types';

const INITIAL_STATE = {
    userName: "",
    roomNumber: 0,
    signedIn: false
};

const rootReducer = (state = INITIAL_STATE, action) => {
    let newState = state;
    switch (action.type) {
        case types.SIGN_IN:
            const { user_name, room_number } = action.payload;
            newState = { ...state, userName: user_name, roomNumber: room_number, signedIn: true }
            return newState
        case types.SET_USERNAME:
            newState = { ...state, userName: action.payload }
            return newState
        case types.SET_ROOM_NUMBER:
            newState = { ...state, roomNumber: action.payload }
            return newState
        default:
            return { ...state }
    }
};

export default rootReducer;