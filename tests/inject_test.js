import {assert} from 'chai';
import jsdom from 'jsdom';

import { StyleSheet, css } from '../src/index.js';
import {
    startBuffering, flushToStyleTag, flushToString, reset,
    getRenderedClassNames, addRenderedClassNames,
} from '../src/inject.js';

const sheet = StyleSheet.create({
    red: {
        color: 'red',
    },

    blue: {
        color: 'blue',
    },

    green: {
        color: 'green',
    },
});

describe('injection', () => {
    beforeEach(() => {
        global.document = jsdom.jsdom();
        reset();
    });

    afterEach(() => {
        global.document.close();
        global.document = undefined;
    });

    describe('startBuffering', () => {
        it('causes styles to not be added immediately', () => {
            startBuffering(false);

            css(sheet.red);

            const styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 0);
        });
    });

    describe('flushToStyleTag', () => {
        it('adds a style tag with all the buffered styles', () => {
            startBuffering(false);

            css(sheet.red);
            css(sheet.blue);

            flushToStyleTag();

            const styleTags = global.document.getElementsByTagName("style");
            const lastTag = styleTags[styleTags.length - 1];

            assert.include(lastTag.textContent, `.${sheet.red._name}{`);
            assert.include(lastTag.textContent, `.${sheet.blue._name}{`);
            assert.match(lastTag.textContent, /color:red/);
            assert.match(lastTag.textContent, /color:blue/);
        });

        it('clears the injection buffer', () => {
            startBuffering(false);

            css(sheet.red);
            css(sheet.blue);

            flushToStyleTag();

            let styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 1);
            let styleContentLength = styleTags[0].textContent.length;

            startBuffering(false);
            flushToStyleTag();

            styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 1);
            assert.equal(styleTags[0].textContent.length, styleContentLength);
        });
    });

    describe('flushToString', () => {
        it('returns the buffered styles', () => {
            startBuffering(true);

            css(sheet.red);
            css(sheet.blue);

            const styles = flushToString();

            assert.include(styles, `.${sheet.red._name}{`);
            assert.include(styles, `.${sheet.blue._name}{`);
            assert.match(styles, /color:red/);
            assert.match(styles, /color:blue/);
        });

        it('clears the injection buffer', () => {
            startBuffering(true);

            css(sheet.red);
            css(sheet.blue);

            assert.notEqual(flushToString(), "");

            startBuffering(true);
            assert.equal(flushToString(), "");
        });
    });

    describe('getRenderedClassNames', () => {
        it('returns classes that have been rendered', () => {
            css(sheet.red);
            css(sheet.blue);

            const classNames = getRenderedClassNames();

            assert.include(classNames, sheet.red._name);
            assert.include(classNames, sheet.blue._name);
            assert.notInclude(classNames, sheet.green._name);
        });
    });

    describe('addRenderedClassNames', () => {
        it('doesn\'t render classnames that were added', () => {
            addRenderedClassNames([sheet.red._name, sheet.blue._name]);

            css(sheet.red);
            css(sheet.blue);
            css(sheet.green);

            const styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 1);
            const styles = styleTags[0].textContent;

            assert.include(styles, `.${sheet.green._name}{`);
            assert.notInclude(styles, `.${sheet.red._name}{`);
            assert.notInclude(styles, `.${sheet.blue._name}{`);
            assert.match(styles, /color:green/);
            assert.notMatch(styles, /color:red/);
            assert.notMatch(styles, /color:blue/);
        });
    });
});
