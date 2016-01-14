import asap from 'asap';
import {assert} from 'chai';
import jsdom from 'jsdom';

import { StyleSheet, StyleSheetServer, css } from '../src/index.js';
import { reset } from '../src/inject.js';

describe('css', () => {
    beforeEach(() => {
        global.document = jsdom.jsdom();
        reset();
    });

    afterEach(() => {
        global.document.close();
        global.document = undefined;
    });

    it('generates class names', () => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },

            blue: {
                color: 'blue'
            }
        });

        assert.ok(css(sheet.red, sheet.blue));
    });

    it('filters out falsy inputs', () => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },
        });

        assert.equal(css(sheet.red), css(sheet.red, false));
        assert.equal(css(sheet.red), css(false, sheet.red));
    });

    it('succeeds for with empty args', () => {
        assert(css() != null);
        assert(css(false) != null);
    });

    it('adds styles to the DOM', () => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },
        });

        css(sheet.red);

        const styleTags = global.document.getElementsByTagName("style");
        const lastTag = styleTags[styleTags.length - 1];

        assert.include(lastTag.textContent, `${sheet.red._name}{`);
        assert.match(lastTag.textContent, /color:red/);
    });

    it('only ever creates one style tag', done => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },
            blue: {
                color: 'blue',
            },
        });

        css(sheet.red);

        asap(() => {
            const styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 1);

            css(sheet.blue);

            asap(() => {
                const styleTags = global.document.getElementsByTagName("style");
                assert.equal(styleTags.length, 1);
                done();
            });
        });
    });

    it('automatically uses a style tag with the data-aphrodite attribute', done => {
        const style = document.createElement("style");
        style.setAttribute("data-aphrodite", "");
        document.head.appendChild(style);

        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },
            blue: {
                color: 'blue',
            },
        });

        css(sheet.red);

        asap(() => {
            const styleTags = global.document.getElementsByTagName("style");
            assert.equal(styleTags.length, 1);
            const styles = styleTags[0].textContent;

            assert.include(styles, `${sheet.red._name}{`);
            assert.include(styles, 'color:red');

            done();
        });
    });
});

describe('StyleSheet.create', () => {
    it('assigns a name to stylesheet properties', () => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },
            blue: {
                color: 'blue'
            }
        });

        assert.ok(sheet.red._name);
        assert.ok(sheet.blue._name);
        assert.notEqual(sheet.red._name, sheet.blue._name);
    });

    it('assign different names to two different create calls', () => {
        const sheet1 = StyleSheet.create({
            red: {
                color: 'blue',
            },
        });

        const sheet2 = StyleSheet.create({
            red: {
                color: 'red',
            },
        });

        assert.notEqual(sheet1.red._name, sheet2.red._name);
    });

    it('assigns the same name to identical styles from different create calls', () => {
        const sheet1 = StyleSheet.create({
            red: {
                color: 'red',
                height: 20,

                ':hover': {
                    color: 'blue',
                    width: 40,
                },
            },
        });

        const sheet2 = StyleSheet.create({
            red: {
                color: 'red',
                height: 20,

                ':hover': {
                    color: 'blue',
                    width: 40,
                },
            },
        });

        assert.equal(sheet1.red._name, sheet2.red._name);
    });

    it('hashes style names correctly', () => {
        const sheet = StyleSheet.create({
            test: {
                color: 'red',
                height: 20,

                ':hover': {
                    color: 'blue',
                    width: 40,
                },
            },
        });

        assert.equal(sheet.test._name, 'test_y60qhp');
    });

    it('works for empty stylesheets and styles', () => {
        const emptySheet = StyleSheet.create({});

        const sheet = StyleSheet.create({
            empty: {}
        });

        assert.ok(sheet.empty._name);
    });
});

describe('StyleSheet.renderBuffered', () => {
    beforeEach(() => {
        global.document = jsdom.jsdom();
        reset();
    });

    afterEach(() => {
        global.document.close();
        global.document = undefined;
    });

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

    it('injects a style tag with the correct data', () => {
        const render = (done) => {
            css(sheet.red);
            css(sheet.blue);

            done();
        };

        StyleSheet.renderBuffered(render);

        const styleTags = global.document.getElementsByTagName("style");
        assert.equal(styleTags.length, 1);
        const styles = styleTags[0].textContent;

        assert.include(styles, `.${sheet.red._name}{`);
        assert.include(styles, `.${sheet.blue._name}{`);
        assert.match(styles, /color:red/);
        assert.match(styles, /color:blue/);
    });

    it('doesn\'t render styles in the renderedClassNames arg', () => {
        const render = (done) => {
            css(sheet.red);
            css(sheet.blue);
            css(sheet.green);

            done();
        };

        StyleSheet.renderBuffered(render, [sheet.red._name, sheet.blue._name]);

        const styleTags = global.document.getElementsByTagName("style");
        assert.equal(styleTags.length, 1);
        const styles = styleTags[0].textContent;

        assert.notInclude(styles, `.${sheet.red._name}{`);
        assert.notInclude(styles, `.${sheet.blue._name}{`);
        assert.include(styles, `.${sheet.green._name}{`);
        assert.notMatch(styles, /color:blue/);
        assert.notMatch(styles, /color:red/);
        assert.match(styles, /color:green/);
    });

    it('succeeds if called recursively', () => {
        const render = (done) => {
            css(sheet.blue);

            done();
        };

        const recursiveRender = (done) => {
            css(sheet.red);

            StyleSheet.renderBuffered(render);
            done();
        };

        StyleSheet.renderBuffered(recursiveRender);

        const styleTags = global.document.getElementsByTagName("style");
        assert.equal(styleTags.length, 1);
        const styles = styleTags[0].textContent;

        assert.include(styles, `.${sheet.red._name}{`);
        assert.include(styles, `.${sheet.blue._name}{`);
        assert.include(styles, 'color:red');
        assert.include(styles, 'color:blue');
    });

    it('fails if renderStatic is called during the render method', () => {
        const badRender = (done) => {
            StyleSheetServer.renderStatic(() => "html!");
            done();
        };

        assert.throws(() => {
            StyleSheet.renderBuffered(badRender);
        }, "Aphrodite tried to flush styles");
        // TODO(emily): figure out how to make that ^^^ throw the "Can't
        // interlave" error
    });

    it('succeeds if render is actually async', (done) => {
        const asyncRender = (d) => {
            setTimeout(() => {
                css(sheet.red);

                d();

                const styleTags = global.document.getElementsByTagName("style");
                assert.equal(styleTags.length, 1);
                const styles = styleTags[0].textContent;

                assert.include(styles, `.${sheet.red._name}{`);
                assert.include(styles, 'color:red');

                done();
            }, 10);
        };

        StyleSheet.renderBuffered(asyncRender);
    });

    it('doesn\'t inject anything if called a second time.', () => {
        const render = (done) => {
            css(sheet.red);
            css(sheet.blue);

            done();
        };

        const emptyRender = (done) => {
            done();
        };

        StyleSheet.renderBuffered(render);

        let styleTags = global.document.getElementsByTagName("style");
        assert.equal(styleTags.length, 1);
        const styles = styleTags[0].textContent;

        StyleSheet.renderBuffered(emptyRender);

        styleTags = global.document.getElementsByTagName("style");
        assert.equal(styleTags.length, 1);
        assert.equal(styles.length, styleTags[0].textContent.length);
    });
});

describe('StyleSheetServer.renderStatic', () => {
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

    it('returns the correct data', () => {
        const render = () => {
            css(sheet.red);
            css(sheet.blue);

            return "html!";
        };

        const ret = StyleSheetServer.renderStatic(render);

        assert.equal(ret.html, "html!");

        assert.include(ret.css.content, `.${sheet.red._name}{`);
        assert.include(ret.css.content, `.${sheet.blue._name}{`);
        assert.match(ret.css.content, /color:red/);
        assert.match(ret.css.content, /color:blue/);

        assert.include(ret.css.renderedClassNames, sheet.red._name);
        assert.include(ret.css.renderedClassNames, sheet.blue._name);
    });

    it('succeeds even if a previous renderStatic crashed', () => {
        const badRender = () => {
            css(sheet.red);
            css(sheet.blue);
            throw new Error("boo!");
        };

        const goodRender = () => {
            css(sheet.blue);
            return "html!";
        };

        assert.throws(() => {
            StyleSheetServer.renderStatic(badRender);
        }, "boo!");

        const ret = StyleSheetServer.renderStatic(goodRender);

        assert.equal(ret.html, "html!");

        assert.include(ret.css.content, `.${sheet.blue._name}{`);
        assert.notInclude(ret.css.content, `.${sheet.red._name}{`);
        assert.include(ret.css.content, 'color:blue');
        assert.notInclude(ret.css.content, 'color:red');

        assert.include(ret.css.renderedClassNames, sheet.blue._name);
        assert.notInclude(ret.css.renderedClassNames, sheet.red._name);
    });

    it('fails if renderBuffered is called inside', () => {
        const badRender = () => {
            StyleSheet.renderBuffered(done => done());
            return "html!";
        };

        assert.throws(() => {
            StyleSheetServer.renderStatic(badRender);
        }, "Can't interleave server-side and client-side buffering.");
    });

    it('fails if called recursively', () => {
        const badRender = () => {
            StyleSheetServer.renderStatic(() => "html!");
            return "html!";
        };

        assert.throws(() => {
            StyleSheetServer.renderStatic(badRender);
        }, 'Aphrodite tried to flush styles');
        // TODO(emily): figure out how to make that ^^^ throw the "Can't
        // interlave" error
    });

    it('doesn\'t mistakenly return styles if called a second time', () => {
        const render = () => {
            css(sheet.red);
            css(sheet.blue);

            return "html!";
        };

        const emptyRender = () => {
            return "";
        };

        const ret = StyleSheetServer.renderStatic(render);
        assert.notEqual(ret.css.content, "");

        const newRet = StyleSheetServer.renderStatic(emptyRender);
        assert.equal(newRet.css.content, "");
    });
});
