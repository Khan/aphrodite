import {
    objectToPairs, kebabifyStyleName, recursiveMerge, stringifyValue
} from './util';

export const generateCSS = (selector, styleTypes) => {
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
        generateCSSRuleset(selector, declarations) +
        Object.keys(pseudoStyles).map(pseudoSelector => {
            return generateCSSRuleset(selector + pseudoSelector,
                                      pseudoStyles[pseudoSelector]);
        }).join("") +
        Object.keys(mediaQueries).map(mediaQuery => {
            const ruleset = generateCSS(selector, [mediaQueries[mediaQuery]]);
            return `${mediaQuery}{${ruleset}}`;
        }).join("")
    );
};

export const generateCSSRuleset = (selector, declarations) => {
    const rules = objectToPairs(declarations).map(([key, value]) => (
        `${kebabifyStyleName(key)}:${stringifyValue(key, value)} !important;`
    )).join("");

    if (rules) {
        return `${selector}{${rules}}`;
    } else {
        return "";
    }
};
