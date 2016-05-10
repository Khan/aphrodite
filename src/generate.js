import prefixAll from 'inline-style-prefix-all';

import {
    objectToPairs, kebabifyStyleName, recursiveMerge, stringifyValue,
    importantify, flatten
} from './util';

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

export const generateCSSRuleset = (selector, declarations, stringHandlers,
        useImportant) => {
    const handledDeclarations = runStringHandlers(
        declarations, stringHandlers);

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

    const rules = prefixedRules.map(([key, value]) => {
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
