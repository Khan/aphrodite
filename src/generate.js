import prefixAll from 'inline-style-prefix-all';

import {
    objectToPairs, kebabifyStyleName, recursiveMerge, stringifyValue,
    importantify, uniquify, mapObj,
} from './util';

/**
 * Generate a map from descendant selector names to all of the classnames that
 * could be used for that selector.
 *
 * In StyleSheet.create, we add a special `_names` object to each place where a
 * descendant style is used containing the classname associated with that
 * descenant. Here, we traverse the styles and make a map from the descendant
 * selectors to all of the classnames in those `_names` objects. (Since we
 * merge together many styles that come out of StyleSheet.create, and we store
 * the classnames as keys on the `_names` object, the classnames that we want
 * all end up as keys on the final merged object.)
 *
 * For example, given styles looking like:
 * ```
 * {
 *   ">>child": {
 *     _names: { "parent1_child_x": true, "parent2_child_y": true },
 *     color: "red"
 *   },
 *   ":hover": {
 *     ">>child": {
 *       _names: { "parent2_child_z": true },
 *       color: "blue",
 *     },
 *     ">>otherchild": {
 *       _names: { "parent1_otherchild_w": true },
 *       color: "green"
 *     }
 *   }
 * }
 * ```
 * this will generate the mapping
 * ```
 * {
 *   ">>child": ["parent1_child_x", "parent2_child_y", "parent2_child_z"],
 *   ">>otherchild": ["parent1_otherchild_w"]
 * }
 *
 * @returns {Object.<string, string[]>}
 */
const findNamesForDescendants = (styles, names={}) => {
    Object.keys(styles).forEach(key => {
        if (key[0] === ':' || key[0] === '@') {
            // Recurse for pseudo or @media styles
            findNamesForDescendants(styles[key], names);
        } else if (key[0] === '>' && key[1] === '>') {
            // Recurse for descendant styles
            findNamesForDescendants(styles[key], names);

            // Pluck out all of the names in the _names object.
            Object.keys(styles[key]._names).forEach(name => {
                names[key] = names[key] || [];
                names[key].push(name);
            });
        }
    });

    return names;
};

export const generateCSS = (selector, styleTypes, stringHandlers,
                            useImportant) => {
    const merged = styleTypes.reduce(recursiveMerge);
    const classNamesForDescendant = findNamesForDescendants(merged);
    const uniqueClassNamesForDescendant = mapObj(
        classNamesForDescendant, ([k, v]) => [k, uniquify(v)]);

    return generateCSSInner(
        selector, merged, stringHandlers, useImportant,
        uniqueClassNamesForDescendant);
}

/**
 * Generate CSS for a selector and some styles.
 *
 * This function handles the media queries, pseudo selectors, and descendant
 * styles that can be used in aphrodite styles. To actually generate the CSS,
 * special-construct-less styles are passed to `generateCSSRuleset`.
 *
 * For instance, a call to
 * ```
 * generateCSSInner(".foo", {
 *   color: "red",
 *   "@media screen": {
 *     height: 20,
 *     ":hover": {
 *       backgroundColor: "black"
 *     }
 *   },
 *   ":active": {
 *     fontWeight: "bold",
 *     ">>bar": {
 *       _names: { "foo_bar": true },
 *       height: 10,
 *     }
 *   }
 * }, ...);
 * ```
 * will make 5 calls to `generateCSSRuleset`:
 * ```
 * generateCSSRuleset(".foo", { color: "red" }, ...)
 * generateCSSRuleset(".foo:active", { fontWeight: "bold" }, ...)
 * generateCSSRuleset(".foo:active .foo_bar", { height: 10 }, ...)
 * // These 2 will be wrapped in @media screen {}
 * generateCSSRuleset(".foo", { height: 20 }, ...)
 * generateCSSRuleset(".foo:hover", { backgroundColor: "black" }, ...)
 * ```
 *
 * @param {string} selector: A base CSS selector for the styles to be generated
 *     with.
 * @param {Object} style: An object containing aphrodite styles to be
 *     generated.
 * @param stringHandlers: See `generateCSSRuleset`
 * @param useImportant: See `generateCSSRuleset`
 * @param {Object.<string, string[]>} classNamesForDescendant: A map from
 *     descendent selectors in the styles to a list of classnames that are used
 *     to identify that descendant. See `findNamesForDescendants`.
 */
const generateCSSInner = (selector, style, stringHandlers,
                          useImportant, classNamesForDescendant) => {
    const declarations = {};
    const mediaQueries = {};
    const descendants = {};
    const pseudoStyles = {};

    Object.keys(style).forEach(key => {
        if (key[0] === ':') {
            pseudoStyles[key] = style[key];
        } else if (key[0] === '@') {
            mediaQueries[key] = style[key];
        } else if (key[0] === '>' && key[1] === '>') {
            // So we don't generate weird "_names: [Object object]" styles,
            // pull the `_names` value out of the styles.
            const { _names, ...stylesWithoutNames } = style[key];

            descendants[key] = {
                styles: stylesWithoutNames,
                classNames: classNamesForDescendant[key],
            };
        } else {
            declarations[key] = style[key];
        }
    });

    return (
        generateCSSRuleset(selector, declarations, stringHandlers,
            useImportant) +
        Object.keys(pseudoStyles).map(pseudoSelector => {
            return generateCSSInner(
                selector + pseudoSelector, pseudoStyles[pseudoSelector],
                stringHandlers, useImportant, classNamesForDescendant);
        }).join("") +
        Object.keys(mediaQueries).map(mediaQuery => {
            const ruleset = generateCSSInner(
                selector, mediaQueries[mediaQuery], stringHandlers,
                useImportant, classNamesForDescendant);
            return `${mediaQuery}{${ruleset}}`;
        }).join("") +
        Object.keys(descendants).map(key => {
            // Since our child might have many different names, combine all of
            // the possible selectors together with a comma.
            const descendantSelector = descendants[key].classNames
                .map(d => `${selector} .${d}`)
                .join(",");

            return generateCSSInner(
                descendantSelector, descendants[key].styles,
                stringHandlers, useImportant, classNamesForDescendant);
        }).join("")
    );
};

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
 * Example:
 * ```
 * generateCSSRuleset(".blah", { color: "red" });
 * // -> ".blah{color: red !important;}"
 * ```
 *
 * @param {string} selector: the selector associated with the ruleset
 * @param {Object} declarations: a map from camelCased CSS property name to CSS
 *     property value.
 * @param {Object.<string, function>} stringHandlers: a map from camelCased CSS
 *     property name to a function which will map the given value to the value
 *     that is output.
 * @param {bool} useImportant: A boolean saying whether to append "!important"
 *     to each of the CSS declarations.
 */
export const generateCSSRuleset = (selector, declarations, stringHandlers,
        useImportant) => {
    const handledDeclarations = runStringHandlers(
        declarations, stringHandlers);

    const prefixedDeclarations = prefixAll(handledDeclarations);

    const rules = objectToPairs(prefixedDeclarations).map(([key, value]) => {
        const stringValue = stringifyValue(key, value);
        const ret = `${kebabifyStyleName(key)}:${stringValue};`;
        return useImportant === false ? ret : importantify(ret);
    }).join("");

    if (rules) {
        return `${selector}{${rules}}`;
    } else {
        return "";
    }
};
