import {assert} from 'chai';

import {generateCSSRuleset, generateCSS} from '../src/generate';

describe('generateCSSRuleset', () => {
    const assertCSSRuleset = (selector, declarations, expected) => {
        const actual = generateCSSRuleset(selector, declarations);
        assert.deepEqual(actual, expected);
    };
    it('returns a CSS string for a single property', () => {
        assertCSSRuleset('.foo', {
            color: 'red'
        }, [{isDangerous: false, rule: ".foo{color:red !important;}"}]);
    });

    it('returns a CSS string for multiple property', () => {
        assertCSSRuleset('.foo', {
            color: 'red',
            background: 'blue'
        }, [{
            isDangerous: false,
            rule: '.foo{color:red !important;background:blue !important;}'
        }]);
    });

    it('converts camelCase to kebab-case', () => {
        assertCSSRuleset('.foo', {
            backgroundColor: 'red'
        }, [{
            isDangerous: false,
            rule: '.foo{background-color:red !important;}'
        }]);
    });

    it('prefixes vendor props with a dash', () => {
        assertCSSRuleset('.foo', {
            transition: 'none'
        }, [{
            isDangerous: false,
            rule: '.foo{transition:none !important;' +
            '-webkit-transition:none !important;}'
        }]);
    });

    it('converts ms prefix to -ms-', () => {
        assertCSSRuleset('.foo', {
            MsTransition: 'none'
        }, [{
            isDangerous: false,
            rule: '.foo{-ms-transition:none !important;}'
        }]);
    });

    it('returns an empty array if no props are set', () => {
        assertCSSRuleset('.foo', {}, []);
    });

    it('correctly adds px to non-0 number units', () => {
        assertCSSRuleset('.foo', {
            width: 10,
            zIndex: 5
        }, [{
            isDangerous: false,
            rule: '.foo{width:10px !important;z-index:5 !important;}'
        }]);
    });

    it('doesn\'t add px when the unit is 0', () => {
        assertCSSRuleset('.foo', {
            width: 0,
            zIndex: 5
        }, [{
            isDangerous: false,
            rule: '.foo{width:0 !important;z-index:5 !important;}'
        }]);
    });

    it("doesn't break content strings which contain semicolons during importantify", () => {
        assertCSSRuleset('.foo', {
            content: '"foo;bar"'
        }, [{
            isDangerous: false,
            rule: '.foo{content:"foo;bar" !important;}'
        }]);
    });

    it("doesn't break quoted url() arguments during importantify", () => {
        assertCSSRuleset('.foo', {
            background: 'url("data:image/svg+xml;base64,myImage")'
        }, [{
            isDangerous: false,
            rule: '.foo{background:url("data:image/svg+xml;base64,myImage") !important;}'
        }]);
    });

    it("doesn't break unquoted url() arguments during importantify", () => {
        assertCSSRuleset('.foo', {
            background: 'url(data:image/svg+xml;base64,myImage)'
        }, [{
            isDangerous: false,
            rule: '.foo{background:url(data:image/svg+xml;base64,myImage) !important;}'
        }]);
    });

    it("doesn't importantify rules that are already !important", () => {
        assertCSSRuleset('.foo', {
            color: 'blue !important',
        }, [{
            isDangerous: false,
            rule: '.foo{color:blue !important;}'
        }]);
    });
});
describe('generateCSS', () => {
    const assertCSS = (className, styleTypes, expected, stringHandlers,
                       useImportant) => {
        const actual = generateCSS(className, styleTypes, stringHandlers,
            useImportant);
        assert.deepEqual(actual, expected);
    };

    it('returns a CSS string for a single property', () => {
        assertCSS('.foo', [{
            color: 'red'
        }], [{
            isDangerous: false,
            rule: '.foo{color:red !important;}'
        }]);
    });

    it('implements override logic', () => {
        assertCSS('.foo', [{
            color: 'red'
        }, {
            color: 'blue'
        }], [{
            isDangerous: false,
            rule: '.foo{color:blue !important;}'
        }]);
    });

    it('supports pseudo selectors', () => {
        assertCSS('.foo', [{
            ':hover': {
                color: 'red'
            }
        }], [{
            isDangerous: false,
            rule: '.foo:hover{color:red !important;}'
        }]);
    });

    it('supports media queries', () => {
        assertCSS('.foo', [{
            "@media (max-width: 400px)": {
                color: "blue"
            }
        }], [{
            isDangerous: false,
            rule: `@media (max-width: 400px){.foo{color:blue !important;}}`
        }]);
    });

    it('supports pseudo selectors inside media queries', () => {
        assertCSS('.foo', [{
            "@media (max-width: 400px)": {
                ":hover": {
                    color: "blue"
                }
            }
        }], [{
            isDangerous: false,
            rule: '@media (max-width: 400px){.foo:hover{color:blue !important;}}'
        }]);
    });

    it('supports custom string handlers', () => {
        assertCSS('.foo', [{
            fontFamily: ["Helvetica", "sans-serif"]
        }], [{
            isDangerous: false,
            rule: '.foo{font-family:Helvetica, sans-serif !important;}'
        }], {fontFamily: (val) => val.join(", ")});
    });

    it('make it possible to disable !important', () => {
        assertCSS('@font-face', [{
            fontFamily: ["FontAwesome"],
            fontStyle: "normal",
        }], [{
            isDangerous: false,
            rule: '@font-face{font-family:FontAwesome;font-style:normal;}'
        }], {fontFamily: (val) => val.join(", ")}, false);
    });

    it('adds browser prefixes', () => {
        assertCSS('.foo', [{
            display: 'flex',
        }], [{
            isDangerous: false,
            rule: '.foo{display:-moz-box !important;display:-ms-flexbox !important;display:-webkit-box !important;display:-webkit-flex !important;display:flex !important;}'
        }]);
    });
    it('correctly prefixes border-color transition properties', () => {
        assertCSS('.foo', [{
            'transition': 'border-color 200ms linear'
        }], [{
            isDangerous: false,
            rule: '.foo{transition:border-color 200ms linear !important;-webkit-transition:border-color 200ms linear !important;}'
        }]);
    });
    it('supports pseudo elements inside pseudo selectors', () => {
        assertCSS('.foo', [{
            ':hover': {
                '::-webkit-input-placeholder': {
                    color: 'rebeccapurple'
                }
            }
        }], [{
            isDangerous: true,
            rule: '.foo:hover::-webkit-input-placeholder{color:rebeccapurple !important;}'
        }]);
    })
});
