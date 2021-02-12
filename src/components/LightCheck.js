import { Select } from '@material-ui/core';
import React from 'react';

const options = [
    '1',
    '2',
    '3',
    '4',
    '5'
];

const LightCheck = () => {
    return (
        <>
            <div>
                <>Select Chair to Test: </>
                <Select>
                    <option key='1' value='1'>1</option>
                    <option key='2' value='2'>2</option>
                    <option key='3' value='3'>3</option>
                </Select >
            </div>
        </>
    )
    // <div>Choose a chair to send a jump to: </div>
}

export default LightCheck
