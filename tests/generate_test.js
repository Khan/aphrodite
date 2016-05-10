import {assert} from 'chai';

import {generateCSSRuleset, generateCSS} from '../src/generate';

describe('generateCSSRuleset', () => {
    const assertCSSRuleset = (selector, declarations, expected) => {
        const actual = generateCSSRuleset(selector, declarations);
        assert.equal(actual, expected.split('\n').map(x => x.trim()).join(''));
    };
    it('returns a CSS string for a single property', () => {
        assertCSSRuleset('.foo', {
            color: 'red'
        }, '.foo{color:red !important;}');
    });

    it('returns a CSS string for multiple property', () => {
        assertCSSRuleset('.foo', {
            color: 'red',
            background: 'blue'
        }, `.foo{
            color:red !important;
            background:blue !important;
        }`);
    });

    it('converts camelCase to kebab-case', () => {
        assertCSSRuleset('.foo', {
            backgroundColor: 'red'
        }, '.foo{background-color:red !important;}');
    });

    it('prefixes vendor props with a dash', () => {
        assertCSSRuleset('.foo', {
            transition: 'none'
        }, '.foo{transition:none !important;'+
           '-webkit-transition:none !important;' +
           '}');
    });

    it('converts ms prefix to -ms-', () => {
        assertCSSRuleset('.foo', {
            MsTransition: 'none'
        }, '.foo{-ms-transition:none !important;}');
    });

    it('returns an empty string if no props are set', () => {
        assertCSSRuleset('.foo', {}, '');
    });

    it('correctly adds px to number units', () => {
        assertCSSRuleset('.foo', {
            width: 10,
            zIndex: 5
        }, '.foo{width:10px !important;z-index:5 !important;}');
    });
});
describe('generateCSS', () => {
    const assertCSS = (className, styleTypes, expected, stringHandlers,
            useImportant) => {
        const actual = generateCSS(className, styleTypes, stringHandlers,
            useImportant);
        assert.equal(actual, expected.split('\n').map(x => x.trim()).join(''));
    };

    it('returns a CSS string for a single property', () => {
        assertCSS('.foo', [{
            color: 'red'
        }], '.foo{color:red !important;}');
    });

    it('implements override logic', () => {
        assertCSS('.foo', [{
            color: 'red'
        }, {
            color: 'blue'
        }], '.foo{color:blue !important;}');
    });

    it('supports pseudo selectors', () => {
        assertCSS('.foo', [{
            ':hover': {
                color: 'red'
            }
        }], '.foo:hover{color:red !important;}');
    });

    it('supports media queries', () => {
        assertCSS('.foo', [{
            "@media (max-width: 400px)": {
                    color: "blue"
            }
        }], `@media (max-width: 400px){
            .foo{color:blue !important;}
        }`);
    });

    it('supports pseudo selectors inside media queries', () => {
        assertCSS('.foo', [{
            "@media (max-width: 400px)": {
                ":hover": {
                    color: "blue"
                }
            }
        }], `@media (max-width: 400px){
            .foo:hover{color:blue !important;}
        }`);
    });

    it('supports custom string handlers', () => {
        assertCSS('.foo', [{
            fontFamily: ["Helvetica", "sans-serif"]
        }], '.foo{font-family:Helvetica, sans-serif !important;}', {
            fontFamily: (val) => val.join(", "),
        });
    });

    it('make it possible to disable !important', () => {
        assertCSS('@font-face', [{
            fontFamily: ["FontAwesome"],
            fontStyle: "normal",
        }], '@font-face{font-family:FontAwesome;font-style:normal;}', {
            fontFamily: (val) => val.join(", "),
        }, false);
    });

    it('adds browser prefixes', () => {
        assertCSS('.foo', [{
            display: 'flex',
        }], '.foo{display:-webkit-box !important;display:-moz-box !important;display:-ms-flexbox !important;display:-webkit-flex !important;display:flex !important;}');
    });

    it('generates descendant styles', () => {
        assertCSS('.foo', [{
            color: 'red',
            '>>blue': {
                color: 'blue',
                '>>green': {
                    color: 'green',
                    _names: {
                        'foo__green': true,
                    },
                },
                _names: {
                    'foo__blue': true,
                },
            }
        }], '.foo{color:red !important;}' +
                  '.foo .foo__blue{color:blue !important;}' +
                  '.foo .foo__blue .foo__green{color:green !important;}');
    });

    it('handles merging of descendant styles', () => {
        assertCSS('.foo', [{
            '>>blue': {
                color: 'blue',
                _names: {
                    'foo_abcdef__blue': true,
                },
            },
        }, {
            '>>blue': {
                color: 'green',
                _names: {
                    'foo_123456__blue': true,
                },
            },
        }], '.foo .foo_abcdef__blue,' +
                  '.foo .foo_123456__blue{color:green !important;}');
    });

    it('handles multiples of the same descendant name', () => {
        assertCSS('.foo', [{
            '>>blue': {
                color: 'blue',
                _names: {
                    'foo__blue': true,
                },
            },
            ':hover': {
                '>>blue': {
                    color: 'green',
                    _names: {
                        'foo__blue': true,
                    },
                },
            },
        }], '.foo:hover .foo__blue{color:green !important;}' +
                  '.foo .foo__blue{color:blue !important;}');
    });

    it('handles merging and multiples for descenant styles', () => {
        assertCSS('.foo', [{
            '>>child': {
                color: 'blue',
                _names: {
                    'foo_abcdef__child': true,
                },
            },
            ':hover': {
                '>>child': {
                    color: 'green',
                    _names: {
                        'foo_abcdef__child': true,
                    },
                },
            },
        }, {
            ':hover': {
                '>>child': {
                    color: 'red',
                    _names: {
                        'foo_123456__child': true,
                    },
                },
            },
        }], '.foo:hover .foo_abcdef__child,' +
                  '.foo:hover .foo_123456__child{color:red !important;}' +
                  '.foo .foo_abcdef__child,' +
                  '.foo .foo_123456__child{color:blue !important;}');
    });

    it('generates descendant styles with @media queries', () => {
        assertCSS('.foo', [{
            '@media screen': {
                '>>blue': {
                    color: 'blue',
                    _names: {
                        'foo__blue': true,
                    },
                }
            }
        }], '@media screen{.foo .foo__blue{color:blue !important;}}');
    });

    it('generates descendant styles with pseudo-styles', () => {
        assertCSS('.foo', [{
            ':hover': {
                '>>blue': {
                    color: 'blue',
                    _names: {
                        'foo__blue': true,
                    },
                }
            }
        }], '.foo:hover .foo__blue{color:blue !important;}');
    });
});
