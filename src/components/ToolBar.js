import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { COLORS } from '../theme';

export default () => (
    <AppBar align="center" position="relative" style={{ backgroundColor: COLORS.WHITE, color: COLORS.GREY }}>
        <Toolbar >
            <Typography variant="h6" style={{ flexGrow: 1 }}>
                Bible Quiz
            </Typography>
        </Toolbar>
    </AppBar>
)