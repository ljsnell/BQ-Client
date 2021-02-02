import { useSelector } from "react-redux";

let msg = new SpeechSynthesisUtterance();
let voices = window.speechSynthesis.getVoices();
msg.voice = voices[1]; // Note: some voices don't support altering params
msg.voiceURI = 'native';
msg.lang = 'en-US';

const QuestionReader = (word_to_read) => {
    const volumeOn = useSelector(state => state.volumeOn);
    if(volumeOn) return speechSynthesis.speak(word_to_read)
    else return
};

export default QuestionReader