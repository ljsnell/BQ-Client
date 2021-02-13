import { Select } from '@material-ui/core';
import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import types from '../redux/actions/types';

class LightCheck extends Component {
    handleChanges = (event) => {
        const question_text = "Chair: " + event.target.value + " Jump!"
        this.props.setLightCheck({ question_text: question_text })
    }

    render() {
        return (
            <>
                <div>
                    <>Select Chair to Test: </>
                    <Select native={true} onChange={this.handleChanges}>
                        <option key='1' value='1'>1</option>
                        <option key='2' value='2'>2</option>
                        <option key='3' value='3'>3</option>
                        <option key='4' value='4'>4</option>
                        <option key='5' value='5'>5</option>
                    </Select >
                </div>
            </>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setLightCheck: (payload) => dispatch({ type: types.LIGHT_CHECK, payload: payload }),
    }
}

export default connect(null, mapDispatchToProps)(LightCheck);
