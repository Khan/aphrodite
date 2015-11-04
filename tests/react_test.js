/**
 * Tests that check React integration.
 */
import {assert} from 'chai';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { StyleSheet, propType } from '../src/index.js';

describe('The propType', () => {
    const TestComponent = React.createClass({
        propTypes: {
            style: propType,
        },

        render() {
            return React.createElement('div');
        },
    });

    // React calls `console.error` when it encounters problems, so we mock that
    // out and store the errors ourselves.
    let oldError;
    let warnings;

    beforeEach(() => {
        oldError = console.error;
        warnings = [];
        console.error = (warning) => warnings.push(warning);
    });

    afterEach(() => {
        console.error = oldError;
    });

    it('should allow valid props', () => {
        const styles = StyleSheet.create({
            myStyle: {
                color: "red",
            },
        });

        ReactDOMServer.renderToString(
            React.createElement(TestComponent, { style: styles.myStyle })
        );

        assert.equal(warnings.length, 0);
    });

    it('should fail invalid props', () => {
        const fakeStyles = {
            reallyBadStyle: "blah",

            missingProperties: {
                _definition: {},
            },

            badStyleTypes: {
                _names: ["hello"],
                _definition: {
                    color: function() {},
                },
            },
        };

        ReactDOMServer.renderToString(
            React.createElement(
                TestComponent,
                { style: fakeStyles.reallyBadStyle }
            )
        );

        ReactDOMServer.renderToString(
            React.createElement(
                TestComponent,
                { style: fakeStyles.missingProperties }
            )
        );

        ReactDOMServer.renderToString(
            React.createElement(
                TestComponent,
                { style: fakeStyles.badStyleTypes }
            )
        );

        assert.equal(warnings.length, 3);
        assert.include(warnings[0], "expecting object");
        assert.include(warnings[1], "Missing _name");
        assert.include(warnings[2], "Invalid style type");
    });
});
