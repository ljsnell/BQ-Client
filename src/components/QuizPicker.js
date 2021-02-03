import { FormControl, InputLabel, Select } from "@material-ui/core";
import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { QUIZ_GLOBAL } from "../globals";
import types from "../redux/actions/types";

export default () => {
    const quizNumber = useSelector(state => state.currentQuizNumber)

    const dispatch = useDispatch()
    const quizzes = Object.keys(QUIZ_GLOBAL)

    return (
        < FormControl variant="outlined" >
            <Select native value={quizNumber} onChange={(v) => dispatch({ type: types.SWITCH_QUIZ, payload: v.target.value }) } >
                {quizzes && quizzes.map((quizNumber, index) => (
                    <option key={`${quizNumber}-${index}`} value={quizNumber}>{quizNumber.toUpperCase()}</option>
                ))}
            </Select>
        </FormControl >
    )
}