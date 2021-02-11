import { useSelector } from "react-redux";
import React, { useState } from 'react';

let msg = new SpeechSynthesisUtterance();
let voices = window.speechSynthesis.getVoices();
msg.voice = voices[1]; // Note: some voices don't support altering params
msg.voiceURI = 'native';
msg.lang = 'en-US';
msg.rate = 2.3;

export const QuestionReader = ({ word_to_read, volumeOn }) => {
    if (word_to_read != null && word_to_read.length > 0) {
        var word = word_to_read.split(" ");
        msg.text = word[word.length - 2]
        if (volumeOn) return speechSynthesis.speak(msg)
        else return
    }
    else return
}

export default QuestionReader