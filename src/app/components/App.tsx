import * as React from 'react';
import '../styles/ui.css';
import Button from '@material-ui/core/Button';
import {withStyles, useTheme} from '@material-ui/core/styles';

declare function require(path: string): any;

const styles = theme => ({
    main: {
        margin: theme.spacing(3),
    },
});

const App = ({classes}) => {
    const theme = useTheme();

    const textbox = React.useRef<HTMLInputElement>(undefined);

    const countRef = React.useCallback((element: HTMLInputElement) => {
        if (element) element.value = '5';
        textbox.current = element;
    }, []);

    const onCreate = React.useCallback(() => {
        const count = parseInt(textbox.current.value, 10);
        parent.postMessage({pluginMessage: {type: 'create-rectangles', count}}, '*');
    }, []);

    const onCancel = React.useCallback(() => {
        parent.postMessage({pluginMessage: {type: 'cancel'}}, '*');
    }, []);

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = event => {
            const {type, message} = event.data.pluginMessage;
            if (type === 'create-rectangles') {
                console.log(`Figma Says: ${message}`);
            }
        };
    }, []);

    return (
        <div className={classes.main}>
            <img src={require('../assets/logo.svg')} />
            <h2>Rectangle Creator</h2>
            <p>
                Count: <input ref={countRef} />
            </p>
            <Button style={{color: theme.palette.secondary.main}} onClick={onCancel}>
                Cancel
            </Button>
            <Button id="create" variant="contained" color="primary" onClick={onCreate}>
                Create
            </Button>
        </div>
    );
};

export default withStyles(styles)(App);
