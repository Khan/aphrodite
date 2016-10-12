import asap from 'asap';
import {assert} from 'chai';
import jsdom from 'jsdom';

import {StyleSheet, css} from '../src/index.js';
import {css as cssNoImportant} from '../src/no-important.js';
import {
    injectStyleOnce,
    reset, startBuffering, flushToString, flushToStyleTag,
    addRenderedClassNames, getRenderedClassNames
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

    describe('injectStyleOnce', () => {
        it('causes styles to automatically be added', done => {
            injectStyleOnce("x", ".x", [{color: "red"}], false);

            asap(() => {
                const styleTags = global.document.getElementsByTagName("style");
                assert.equal(styleTags.length, 1);
                const styles = styleTags[0].textContent;

                assert.include(styles, ".x{");
                assert.include(styles, "color:red");

                done();
            });
        });

        it('causes styles to be added async, and buffered', done => {
            injectStyleOnce("x", ".x", [{color: "red"}], false);

            const styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 0);

            injectStyleOnce("y", ".y", [{color: "blue"}], false);

            asap(() => {
                const styleTags = global.document.getElementsByTagName("style");
                assert.equal(styleTags.length, 1);
                const styles = styleTags[0].textContent;

                assert.include(styles, ".x{");
                assert.include(styles, ".y{");
                assert.include(styles, "color:red");
                assert.include(styles, "color:blue");

                done();
            });
        });

        it('doesn\'t inject the same style twice', done => {
            injectStyleOnce("x", ".x", [{color: "red"}], false);
            injectStyleOnce("x", ".x", [{color: "blue"}], false);

            asap(() => {
                const styleTags = global.document.getElementsByTagName("style");
                assert.equal(styleTags.length, 1);
                const styles = styleTags[0].textContent;

                assert.include(styles, ".x{");
                assert.include(styles, "color:red");
                assert.notInclude(styles, "color:blue");
                assert.equal(styles.match(/\.x{/g).length, 1);

                done();
            });
        });

        it('throws an error if we\'re not buffering and on the server', () => {
            const oldDocument = global.document;
            global.document = undefined;

            assert.throws(() => {
                injectStyleOnce("x", ".x", [{color: "red"}], false);
            }, "Cannot automatically buffer");

            global.document = oldDocument;
        });

        // browser-specific tests
        it('adds a rule if the stylesheet already exists', done => {
            const styleTag = global.document.createElement("style");
            styleTag.setAttribute("data-aphrodite", "");
            document.head.appendChild(styleTag);

            injectStyleOnce("x", ".x", [{color: "red"}], false);

            asap(() => {
                assert.equal(styleTag.sheet.cssRules[0].cssText, '.x {color: red;}');
                done();
            });
        });

        it('uses document.getElementsByTagName without document.head', done => {
            Object.defineProperty(global.document, "head", {
                value: null,
            });

            injectStyleOnce("x", ".x", [{color: "red"}], false);

            asap(() => {
                const styleTags = global.document.getElementsByTagName("style");
                assert.equal(styleTags.length, 1);
                const styles = styleTags[0].textContent;

                assert.include(styles, ".x{");
                assert.include(styles, "color:red");

                done();
            });
        });
    });

    describe('startBuffering', () => {
        it('causes styles to not be added automatically', done => {
            startBuffering();

            css(sheet.red);

            asap(() => {
                const styleTags = global.document.getElementsByTagName("style");
                assert.equal(styleTags.length, 0);
                done();
            });
        });

        it('throws an error if we try to buffer twice', () => {
            startBuffering();

            assert.throws(() => {
                startBuffering();
            }, "already buffering");
        });
    });

    describe('flushToStyleTag', () => {
        it('adds a style tag with all the buffered styles', () => {
            startBuffering();

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
            startBuffering();

            css(sheet.red);
            css(sheet.blue);

            flushToStyleTag();

            let styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 1);
            let styleContentLength = styleTags[0].textContent.length;

            startBuffering();
            flushToStyleTag();

            styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 1);
            assert.equal(styleTags[0].textContent.length, styleContentLength);
        });
    });

    describe('flushToString', () => {
        it('returns the buffered styles', () => {
            startBuffering();

            css(sheet.red);
            css(sheet.blue);

            const styles = flushToString();

            assert.equal(styles[0].rule, '.red_im3wl1{color:red !important;}');
            assert.equal(styles[1].rule, '.blue_hxfs3d{color:blue !important;}');
        });

        it('clears the injection buffer', () => {
            startBuffering();

            css(sheet.red);
            css(sheet.blue);

            assert.notEqual(flushToString(), "");

            startBuffering();
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
            startBuffering();
            addRenderedClassNames([sheet.red._name, sheet.blue._name]);

            css(sheet.red);
            css(sheet.blue);
            css(sheet.green);

            flushToStyleTag();

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

describe('String handlers', () => {
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

            assertStylesInclude('font-family:Helvetica !important');
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

            assertStylesInclude('font-family:Helvetica,sans-serif !important');
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

            assertStylesInclude('font-family:"CoolFont",sans-serif !important');
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

            assertStylesInclude('animation-name:boo !important');
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

            assertStylesInclude('@keyframes keyframe_1ptfkz1');
            assertStylesInclude('from{left:10px;}');
            assertStylesInclude('50%{left:20px;}');
            assertStylesInclude('to{left:40px;}');
            assertStylesInclude('animation-name:keyframe_1ptfkz1');
        });

        it('doesn\'t add the same keyframes twice', () => {
            const keyframes = {
                'from': {
                    left: 10,
                },
                '50%': {
                    left: 20,
                },
                'to': {
                    left: 40,
                },
            };

            const sheet = StyleSheet.create({
                animate: {
                    animationName: keyframes,
                },
                animate2: {
                    animationName: keyframes,
                },
            });

            startBuffering();
            css(sheet.animate);
            css(sheet.animate2);
            flushToStyleTag();

            const styleTags = global.document.getElementsByTagName("style");
            const styles = styleTags[0].textContent;

            assert.include(styles, '@keyframes keyframe_1ptfkz1');
            assert.equal(styles.match(/@keyframes/g).length, 1);
        });
    });
});

describe('dangerous injections', () => {
    beforeEach(() => {
        global.document = jsdom.jsdom();
        global.window = {
            getComputedStyle: () => ({1: 'overflow', overflow: 'overflow', webkitUserSelect: 'webkitUserSelect'})
        };
        reset();
    });

    afterEach(() => {
        global.document.close();
        global.document = undefined;
        global.window = undefined;
    });

    it('injects a dangerous style when a tag does not exist', (done) => {
        const sheet = StyleSheet.create({
            root: {
                overflow: 'visible',
                userSelect: 'none'
            },
        });

        cssNoImportant(sheet.root);
        asap(() => {
            const styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 1);
            const rule = styleTags[0].sheet.cssRules[0].cssText;
            assert.equal(rule, '.root_15wj8v9 {overflow: visible; webkit-user-select: none;}');
            done();
        });
    });
    it('enters a dangerous rule when a tag does exist', done => {
        const style = document.createElement("style");
        style.setAttribute("data-aphrodite", "");
        global.document.head.appendChild(style);
        const sheet = StyleSheet.create({
            root: {
                boxSizing: 'border-box',
            },
        });
        css(sheet.root);
        asap(() => {
            const styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 1);
            const rule = styleTags[0].sheet.cssRules[0].cssText;
            assert.equal(rule, '.root_1gwnft1 {box-sizing: border-box !important;}');
            done();
        });
    });
})
