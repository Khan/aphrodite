import {
    objectToPairs, kebabifyStyleName, recursiveMerge, stringifyValue
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

export const generateCSSRuleset = (selector, declarations, stringHandlers,
        useImportant) => {
    const rules = objectToPairs(declarations).map(([key, value]) => {
        const stringValue = stringifyValue(key, value, stringHandlers);
        const important = (useImportant === false ? "" : " !important");
        return `${kebabifyStyleName(key)}:${stringValue}${important};`;
    }).join("");

    if (rules) {
        return `${selector}{${rules}}`;
    } else {
        return "";
    }
};
