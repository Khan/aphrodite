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
            WebkitTransition: 'none'
        }, '.foo{-webkit-transition:none !important;}');
    });

    it('converts ms prefix to -ms-', () => {
        assertCSSRuleset('.foo', {
            msTransition: 'none'
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
    const assertCSS = (className, styleTypes, expected) => {
        const actual = generateCSS(className, styleTypes);
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
});
