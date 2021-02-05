import { useSelector } from "react-redux";
import React, { useState } from 'react';

let msg = new SpeechSynthesisUtterance();
let voices = window.speechSynthesis.getVoices();
msg.voice = voices[1]; // Note: some voices don't support altering params
msg.voiceURI = 'native';
msg.lang = 'en-US';
msg.rate = 2.3;

export const QuestionReader = ({ word_to_read, volumeOn }) => {
    msg.text = word_to_read
    if (volumeOn) return speechSynthesis.speak(msg)
    else return    
}

export default QuestionReader