const io = require('socket.io-client');

// Websocket server
const server = 'http://127.0.0.1:8000/'
// const server = 'wss://mysterious-journey-90036.herokuapp.com'

const CLIENT_CODES = {
    ROOM: "room",
    CONTENTCHANGE: "contentchange",
    JUMP: "jump",
    JOINED: "joined",
    NEXTQUESTIONTYPE: "next_question_type"
}

const BQClient = () => {
    const client = io.connect(server)

    const emit = (code, payload) => client.emit(code, payload)
    const on = (code, func) => client.on(code, func)

    return { CLIENT_CODES, on, emit }
};

export default BQClient