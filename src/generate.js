import prefixAll from 'inline-style-prefixer/static';

import {
    prefixLocally, objectToPairs, kebabifyStyleName, recursiveMerge,
    stringifyValue, importantify, flatten
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
    // if (Object.keys(merged).join().indexOf('placeholder') !== -1) debugger
    const genericRules = generateCSSRuleset(selector, declarations, stringHandlers, useImportant);
    const pseudoRules = Object.keys(pseudoStyles)
      .reduce((reduction, pseudoSelector) => {
        const ruleset = generateCSS(selector + pseudoSelector,
        [pseudoStyles[pseudoSelector]],
        stringHandlers, useImportant);
        const safeSelectors = [':visited', ':focus', ':active', ':hover'];
        const safeRuleset = safeSelectors.includes(pseudoSelector) ? ruleset :
          ruleset.map(set => ({...set, isDangerous: true}));
        reduction.push(...safeRuleset);
        return reduction;
      },[]);
    const mediaRules = Object.keys(mediaQueries)
      .reduce((reduction, mediaQuery) => {
        const ruleset = generateCSS(selector, [mediaQueries[mediaQuery]],
          stringHandlers, useImportant);
        const wrappedRuleset = ruleset.map(set => {
          return {
            ...set,
            rule: `${mediaQuery}{${set.rule}}`
          }
        });
        reduction.push(...wrappedRuleset);
        return reduction;
      },[]);
    return [...genericRules, ...pseudoRules, ...mediaRules];
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
 * @returns {Array} Array with 0-to-1 objects: rule: A string of raw CSS, isDangerous: boolean
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

    let rules;
    if (typeof window === 'undefined') {
      // prefix all if we're on the server
        const prefixedDeclarations = prefixAll(handledDeclarations);
        const prefixedRules = flatten(
            objectToPairs(prefixedDeclarations).map(([key, value]) => {
                if (Array.isArray(value)) {
                    // inline-style-prefix-all returns an array when there should be
                    // multiple rules, we will flatten to single rules

                    const prefixedValues = [];
                    const unprefixedValues = [];

                    value.forEach(v => {
                      if (v.indexOf('-') === 0) {
                        prefixedValues.push(v);
                      } else {
                        unprefixedValues.push(v);
                      }
                    });

                    prefixedValues.sort();
                    unprefixedValues.sort();

                    return prefixedValues
                      .concat(unprefixedValues)
                      .map(v => [key, v]);
                }
                return [[key, value]];
            })
        );
      const ruleString = prefixedRules.map(([key, value]) => {
        const stringValue = stringifyValue(key, value);
        const ret = `${kebabifyStyleName(key)}:${stringValue};`;
        return useImportant === false ? ret : importantify(ret);
      }).join("");
      rules = {isDangerous: false, ruleString};
    } else {
      rules = prefixLocally(handledDeclarations, useImportant);
    }
    if (rules.ruleString) {
      return [{
        // make it easy to detect empty blocks later
        rule: `${selector}{${rules.ruleString}}`,
        // protect against pseudo elements like ::moz-input-placeholder
        isDangerous: rules.isDangerous
      }];
    } else {
      return [];
    }
};
