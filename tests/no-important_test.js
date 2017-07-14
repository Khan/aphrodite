import asap from 'asap';
import {assert} from 'chai';
import jsdom from 'jsdom';

import {
  StyleSheet,
  css
} from '../src/no-important.js';
import { reset, startBuffering, flushToStyleTag } from '../src/inject.js';

describe('css', () => {
    beforeEach(() => {
        global.document = jsdom.jsdom();
        reset();
    });

    afterEach(() => {
        global.document.close();
        global.document = undefined;
    });

    it('adds styles to the DOM', done => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },
        });

        css(sheet.red);

        asap(() => {
            const styleTags = global.document.getElementsByTagName("style");
            const lastTag = styleTags[styleTags.length - 1];

            assert.include(lastTag.textContent, `${sheet.red._name}{`);
            assert.match(lastTag.textContent, /color:red/);
            assert.notMatch(lastTag.textContent, /!important/);
            done();
        });
    });
});

describe('String handlers with no !important', () => {
    beforeEach(() => {
        global.document = jsdom.jsdom();
        reset();
    });

    afterEach(() => {
        global.document.close();
        global.document = undefined;
    });

    function assertStylesInclude(str) {
        const styleTags = global.document.getElementsByTagName("style");
        const styles = styleTags[0].textContent;

        assert.include(styles, str);
    }

    describe('fontFamily', () => {
        it('leaves plain strings alone', () => {
            const sheet = StyleSheet.create({
                base: {
                    fontFamily: "Helvetica",
                },
            });

            startBuffering();
            css(sheet.base);
            flushToStyleTag();

            assertStylesInclude('font-family:Helvetica');
        });

        it('concatenates arrays', () => {
            const sheet = StyleSheet.create({
                base: {
                    fontFamily: ["Helvetica", "sans-serif"],
                },
            });

            startBuffering();
            css(sheet.base);
            flushToStyleTag();

            assertStylesInclude('font-family:Helvetica,sans-serif');
        });

        it('adds @font-face rules for objects', () => {
            const fontface = {
                fontFamily: "CoolFont",
                src: "url('coolfont.ttf')",
            };

            const sheet = StyleSheet.create({
                base: {
                    fontFamily: [fontface, "sans-serif"],
                },
            });

            startBuffering();
            css(sheet.base);
            flushToStyleTag();

            assertStylesInclude('font-family:"CoolFont",sans-serif');
            assertStylesInclude('font-family:CoolFont;');
            assertStylesInclude("src:url('coolfont.ttf');");
        });
    });

    describe('animationName', () => {
        it('leaves plain strings alone', () => {
            const sheet = StyleSheet.create({
                animate: {
                    animationName: "boo",
                },
            });

            startBuffering();
            css(sheet.animate);
            flushToStyleTag();

            assertStylesInclude('animation-name:boo;');
        });

        it('generates css for keyframes', () => {
            const sheet = StyleSheet.create({
                animate: {
                    animationName: {
                        'from': {
                            left: 10,
                        },
                        '50%': {
                            left: 20,
                        },
                        'to': {
                            left: 40,
                        },
                    },
                },
            });

            startBuffering();
            css(sheet.animate);
            flushToStyleTag();

            assertStylesInclude('@keyframes keyframe_tmjr6');
            assertStylesInclude('from{left:10px;}');
            assertStylesInclude('50%{left:20px;}');
            assertStylesInclude('to{left:40px;}');
            assertStylesInclude('animation-name:keyframe_tmjr6');
        });
    });
});
