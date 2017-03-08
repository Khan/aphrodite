/* @flow */
import prefixAll from 'inline-style-prefixer/static';

import OrderedElements from './ordered-elements';
import {
    objectToPairs, kebabifyStyleName, recursiveMerge, stringifyValue,
    importantify, flatten
} from './util';

/* ::
import type { SheetDefinition } from './index.js';
type StringHandlers = { [id:string]: Function };
type SelectorCallback = (selector: string) => any;
export type SelectorHandler = (
    selector: string,
    baseSelector: string,
    callback: SelectorCallback
) => string | null;
*/

/**
 * `selectorHandlers` are functions which handle special selectors which act
 * differently than normal style definitions. These functions look at the
 * current selector and can generate CSS for the styles in their subtree by
 * calling the callback with a new selector.
 *
 * For example, when generating styles with a base selector of '.foo' and the
 * following styles object:
 *
 *   {
 *     ':nth-child(2n)': {
 *       ':hover': {
 *         color: 'red'
 *       }
 *     }
 *   }
 *
 * when we reach the ':hover' style, we would call our selector handlers like
 *
 *   handler(':hover', '.foo:nth-child(2n)', callback)
 *
 * Since our `pseudoSelectors` handles ':hover' styles, that handler would call
 * the callback like
 *
 *   callback('.foo:nth-child(2n):hover')
 *
 * to generate its subtree `{ color: 'red' }` styles with a
 * '.foo:nth-child(2n):hover' selector. The callback would return CSS like
 *
 *   '.foo:nth-child(2n):hover{color:red !important;}'
 *
 * and the handler would then return that resulting CSS.
 *
 * `defaultSelectorHandlers` is the list of default handlers used in a call to
 * `generateCSS`.
 *
 * @name SelectorHandler
 * @function
 * @param {string} selector: The currently inspected selector. ':hover' in the
 *     example above.
 * @param {string} baseSelector: The selector of the parent styles.
 *     '.foo:nth-child(2n)' in the example above.
 * @param {function} generateSubtreeStyles: A function which can be called to
 *     generate CSS for the subtree of styles corresponding to the selector.
 *     Accepts a new baseSelector to use for generating those styles.
 * @returns {?string} The generated CSS for this selector, or null if we don't
 *     handle this selector.
 */
export const defaultSelectorHandlers = [
    // Handle pseudo-selectors, like :hover and :nth-child(3n)
    function pseudoSelectors(
        selector /* : string */,
        baseSelector /* : string */,
        generateSubtreeStyles /* : Function */
    ) /* */ {
        if (selector[0] !== ":") {
            return null;
        }
        return generateSubtreeStyles(baseSelector + selector);
    },

    // Handle media queries (or font-faces)
    function mediaQueries(
        selector /* : string */,
        baseSelector /* : string */,
        generateSubtreeStyles /* : Function */
    ) /* */ {
        if (selector[0] !== "@") {
            return null;
        }
        // Generate the styles normally, and then wrap them in the media query.
        const generated = generateSubtreeStyles(baseSelector);
        return `${selector}{${generated}}`;
    },
];

/**
 * Generate CSS for a selector and some styles.
 *
 * This function handles the media queries and pseudo selectors that can be used
 * in aphrodite styles.
 *
 * @param {string} selector: A base CSS selector for the styles to be generated
 *     with.
 * @param {Object} styleTypes: A list of properties of the return type of
 *     StyleSheet.create, e.g. [styles.red, styles.blue].
 * @param {Array.<SelectorHandler>} selectorHandlers: A list of selector
 *     handlers to use for handling special selectors. See
 *     `defaultSelectorHandlers`.
 * @param stringHandlers: See `generateCSSRuleset`
 * @param useImportant: See `generateCSSRuleset`
 *
 * To actually generate the CSS special-construct-less styles are passed to
 * `generateCSSRuleset`.
 *
 * For instance, a call to
 *
 *     generateCSS(".foo", [{
 *       color: "red",
 *       "@media screen": {
 *         height: 20,
 *         ":hover": {
 *           backgroundColor: "black"
 *         }
 *       },
 *       ":active": {
 *         fontWeight: "bold"
 *       }
 *     }], defaultSelectorHandlers);
 *
 * with the default `selectorHandlers` will make 5 calls to
 * `generateCSSRuleset`:
 *
 *     generateCSSRuleset(".foo", { color: "red" }, ...)
 *     generateCSSRuleset(".foo:active", { fontWeight: "bold" }, ...)
 *     // These 2 will be wrapped in @media screen {}
 *     generateCSSRuleset(".foo", { height: 20 }, ...)
 *     generateCSSRuleset(".foo:hover", { backgroundColor: "black" }, ...)
 */
export const generateCSS = (
    selector /* : string */,
    styleTypes /* : SheetDefinition[] */,
    selectorHandlers /* : SelectorHandler[] */,
    stringHandlers /* : StringHandlers */,
    useImportant /* : boolean */
) /* : string */ => {
    const merged /* : OrderedElements */ = styleTypes.reduce(
        recursiveMerge,
        new OrderedElements());

    const plainDeclarations = new OrderedElements();
    let generatedStyles = "";

    // TODO(emily): benchmark this to see if a plain for loop would be faster.
    merged.forEach((key, val) => {
        // For each key, see if one of the selector handlers will handle these
        // styles.
        const foundHandler = selectorHandlers.some(handler => {
            const result = handler(key, selector, (newSelector) => {
                return generateCSS(
                    newSelector, [val], selectorHandlers,
                    stringHandlers, useImportant);
            });
            if (result != null) {
                // If the handler returned something, add it to the generated
                // CSS and stop looking for another handler.
                generatedStyles += result;
                return true;
            }
        });
        // If none of the handlers handled it, add it to the list of plain
        // style declarations.
        if (!foundHandler) {
            plainDeclarations.set(key, val);
        }
    });

    return (
        generateCSSRuleset(
            selector, plainDeclarations, stringHandlers, useImportant,
            selectorHandlers) +
        generatedStyles
    );
};

/**
 * Helper method of generateCSSRuleset to facilitate custom handling of certain
 * CSS properties. Used for e.g. font families.
 *
 * See generateCSSRuleset for usage and documentation of paramater types.
 */
const runStringHandlers = (
    declarations /* : OrderedElements */,
    stringHandlers /* : StringHandlers */,
    selectorHandlers /* : SelectorHandler[] */
) /* */ => {
    const hasStringHandlers = !!stringHandlers;
    return declarations.map((key, val) => {
        // If a handler exists for this particular key, let it interpret
        // that value first before continuing
        if (hasStringHandlers && stringHandlers.hasOwnProperty(key)) {
            // TODO(emily): Pass in a callback which generates CSS, similar to
            // how our selector handlers work, instead of passing in
            // `selectorHandlers` and have them make calls to `generateCSS`
            // themselves. Right now, this is impractical because our string
            // handlers are very specialized and do complex things.
            return stringHandlers[key](val, selectorHandlers);
        } else {
            return val;
        }
    });
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
export const generateCSSRuleset = (
    selector /* : string */,
    declarations /* : OrderedElements */,
    stringHandlers /* : StringHandlers */,
    useImportant /* : boolean */,
    selectorHandlers /* : SelectorHandler[] */
) /* : string */ => {
    const handledDeclarations /* : OrderedElements */ = runStringHandlers(
        declarations, stringHandlers, selectorHandlers);

    // Calculate the order that we want to each element in `prefixedRules` to
    // be in, based on its index in the original key ordering. We have to do
    // this before the prefixing, because prefixAll mutates
    // handledDeclarations.elements.
    const sortOrder = {};
    for (let i = 0; i < handledDeclarations.keyOrder.length; i++) {
        const key = handledDeclarations.keyOrder[i];
        sortOrder[key] = i;

        // In order to keep most prefixed versions of keys in about the same
        // order that the original keys were in but placed before the
        // unprefixed version, we generate the prefixed forms of the keys and
        // set their order to the same as the original key minus a little bit.
        const capitalizedKey = `${key[0].toUpperCase()}${key.slice(1)}`;
        const prefixedKeys = [
            `Webkit${capitalizedKey}`,
            `Moz${capitalizedKey}`,
            `ms${capitalizedKey}`,
        ];
        for (let j = 0; j < prefixedKeys.length; ++j) {
            if (!handledDeclarations.elements.hasOwnProperty(prefixedKeys[j])) {
                sortOrder[prefixedKeys[j]] = i - 0.5;
            }
        }
    }

    // NOTE(emily): This mutates handledDeclarations.elements.
    const prefixedDeclarations = prefixAll(handledDeclarations.elements);

    const prefixedRules = flatten(
        objectToPairs(prefixedDeclarations).map(([key, value]) => {
            if (Array.isArray(value)) {
                // inline-style-prefixer returns an array when there should be
                // multiple rules for the same key. Here we flatten to multiple
                // pairs with the same key.
                return value.map(v => [key, v]);
            }
            return [[key, value]];
        })
    );

    // Sort the prefixed rules according to the order that the keys were
    // in originally before we prefixed them. New, prefixed versions
    // of the rules aren't in the original list, so we set their order to -1 so
    // they sort to the top.
    prefixedRules.sort((a, b) => {
        const aOrder = sortOrder.hasOwnProperty(a[0]) ? sortOrder[a[0]] : -1;
        const bOrder = sortOrder.hasOwnProperty(b[0]) ? sortOrder[b[0]] : -1;
        return aOrder - bOrder;
    });

    const transformValue = (useImportant === false)
        ? stringifyValue
        : (key, value) => importantify(stringifyValue(key, value));

    const rules = prefixedRules
        .map(([key, value]) => `${kebabifyStyleName(key)}:${transformValue(key, value)};`)
        .join("");

    if (rules) {
        return `${selector}{${rules}}`;
    } else {
        return "";
    }
};
