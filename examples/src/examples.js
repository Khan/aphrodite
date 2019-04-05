/* @flow */
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { StyleSheet } from '../../lib/index.js';

import StyleTester from './StyleTester.js';

const root = document.getElementById('root');

StyleSheet.rehydrate(window.renderedClassNames);
if (root) {
    ReactDOM.render(
        <StyleTester />,
        root
    );
}
