import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import {blue} from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
        primary: blue,
    },
});

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>,
    document.getElementById('react-page')
);
