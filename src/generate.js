import prefixAll from 'inline-style-prefixer/static';

import {
    objectToPairs, kebabifyStyleName, recursiveMerge, stringifyValue,
    importantify, flatten
} from './util';
/**
 * Generate CSS for a selector and some styles.
 *
 * This function handles the media queries, pseudo selectors, and descendant
 * styles that can be used in aphrodite styles.
 *
 * @param {string} selector: A base CSS selector for the styles to be generated
 *     with.
 * @param {Object} styleTypes: A list of properties of the return type of
 *     StyleSheet.create, e.g. [styles.red, styles.blue].
 * @param stringHandlers: See `generateCSSRuleset`
 * @param useImportant: See `generateCSSRuleset`
 *
 * To actually generate the CSS special-construct-less styles are passed to
 * `generateCSSRuleset`.
 *
 * For instance, a call to
 *
 *     generateCSSInner(".foo", {
 *       color: "red",
 *       "@media screen": {
 *         height: 20,
 *         ":hover": {
 *           backgroundColor: "black"
 *         }
 *       },
 *       ":active": {
 *         fontWeight: "bold",
 *         ">>bar": {
 *           _names: { "foo_bar": true },
 *           height: 10,
 *         }
 *       }
 *     });
 *
 * will make 5 calls to `generateCSSRuleset`:
 *
 *     generateCSSRuleset(".foo", { color: "red" }, ...)
 *     generateCSSRuleset(".foo:active", { fontWeight: "bold" }, ...)
 *     generateCSSRuleset(".foo:active .foo_bar", { height: 10 }, ...)
 *     // These 2 will be wrapped in @media screen {}
 *     generateCSSRuleset(".foo", { height: 20 }, ...)
 *     generateCSSRuleset(".foo:hover", { backgroundColor: "black" }, ...)
 */
export const generateCSS = (selector, styleTypes, stringHandlers,
        useImportant) => {
    const merged = styleTypes.reduce(recursiveMerge);

    const declarations = {};
    const mediaQueries = {};
    const pseudoStyles = {};

    Object.keys(merged).forEach(key => {
        if (key[0] === ':') {
            pseudoStyles[key] = merged[key];
        } else if (key[0] === '@') {
            mediaQueries[key] = merged[key];
        } else {
            declarations[key] = merged[key];
        }
    });

    return (
        generateCSSRuleset(selector, declarations, stringHandlers,
            useImportant) +
        Object.keys(pseudoStyles).map(pseudoSelector => {
            return generateCSSRuleset(selector + pseudoSelector,
                                      pseudoStyles[pseudoSelector],
                                      stringHandlers, useImportant);
        }).join("") +
        Object.keys(mediaQueries).map(mediaQuery => {
            const ruleset = generateCSS(selector, [mediaQueries[mediaQuery]],
                stringHandlers, useImportant);
            return `${mediaQuery}{${ruleset}}`;
        }).join("")
    );
};

/**
 * Helper method of generateCSSRuleset to facilitate custom handling of certain
 * CSS properties. Used for e.g. font families.
 *
 * See generateCSSRuleset for usage and documentation of paramater types.
 */
const runStringHandlers = (declarations, stringHandlers) => {
    const result = {};

    Object.keys(declarations).forEach(key => {
        // If a handler exists for this particular key, let it interpret
        // that value first before continuing
        if (stringHandlers && stringHandlers.hasOwnProperty(key)) {
            result[key] = stringHandlers[key](declarations[key]);
        } else {
            result[key] = declarations[key];
        }
    });

    return result;
};

/**
 * Generate a CSS ruleset with the selector and containing the declarations.
 *
 * This function assumes that the given declarations don't contain any special
 * children (such as media queries, pseudo-selectors, or descendant styles).
 *
 * Note that this method does not deal with nesting used for e.g.
 * psuedo-selectors or media queries. That responsibility is left to  the
 * `generateCSS` function.
 *
 * @param {string} selector: the selector associated with the ruleset
 * @param {Object} declarations: a map from camelCased CSS property name to CSS
 *     property value.
 * @param {Object.<string, function>} stringHandlers: a map from camelCased CSS
 *     property name to a function which will map the given value to the value
 *     that is output.
 * @param {bool} useImportant: A boolean saying whether to append "!important"
 *     to each of the CSS declarations.
 * @returns {string} A string of raw CSS.
 *
 * Examples:
 *
 *    generateCSSRuleset(".blah", { color: "red" })
 *    -> ".blah{color: red !important;}"
 *    generateCSSRuleset(".blah", { color: "red" }, {}, false)
 *    -> ".blah{color: red}"
 *    generateCSSRuleset(".blah", { color: "red" }, {color: c => c.toUpperCase})
 *    -> ".blah{color: RED}"
 *    generateCSSRuleset(".blah:hover", { color: "red" })
 *    -> ".blah:hover{color: red}"
 */
export const generateCSSRuleset = (selector, declarations, stringHandlers,
        useImportant) => {
    const handledDeclarations = runStringHandlers(
        declarations, stringHandlers);

    const prefixedDeclarations = objectToPairs(
      prefixAll(handledDeclarations)
    ).map(([key, val]) => [key, kebabifyStyleName(key), val]);

    // After we've applied prefixing, we now have an array of [key,
    // kebabKey, value] triples, where the kebabKey is the maybe
    // vendor-prefixed css property name (e.g."transition" or
    // "-webkit-transition")
    //
    // We want to sort this list of triples to ensure that vendor prefixed keys
    // come before the unprefixed keys. Since vendor prefixes always start with
    // a dash, and '-' comes before any letters, we can just use a regular sort
    // on the kebabified keys.
    prefixedDeclarations.sort((a, b) => a[1] < b[1] ? -1 : 1);

    const prefixedRules = flatten(prefixedDeclarations.map(
        ([key, kebabKey, value]) => {
            if (Array.isArray(value)) {
                // inline-style-prefix-all returns an array when there should be
                // multiple rules. Here, we'll flatten to single rules.
                //
                // We intentionally do not sort the values here.
                return value.map(v => [key, kebabKey, v]);
            }
            return [[key, kebabKey, value]];
        }
    ));

    const rules = prefixedRules.map(([key, kebabKey, value]) => {
        const stringValue = stringifyValue(key, value);
        const ret = `${kebabKey}:${stringValue};`;
        return useImportant === false ? ret : importantify(ret);
    }).join("");

    if (rules) {
        return `${selector}{${rules}}`;
    } else {
        return "";
    }
};
