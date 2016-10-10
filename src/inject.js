import asap from 'asap';

import {generateCSS} from './generate';
import {flattenDeep, hashObject} from './util';

// The current <style> tag we are inserting into, or null if we haven't
// inserted anything yet. We could find this each time using
// `document.querySelector("style[data-aphrodite"])`, but holding onto it is
// faster.
let styleTag = null;

// This is the buffer of style rules which have not yet been flushed.
const injectionBuffer = [];

// externalized try/catch block allows the engine to optimize the caller
const tryInsertRule = (rule) => {
    try {
        styleTag.sheet.insertRule(rule, styleTag.sheet.rules.length);
    } catch(e) {
      // user-defined vendor-prefixed styles go here
    }

};
// Inject a string of styles into a <style> tag in the head of the document. This
// will automatically create a style tag and then continue to use it for
// multiple injections. It will also use a style tag with the `data-aphrodite`
// tag on it if that exists in the DOM. This could be used for e.g. reusing the
// same style tag that server-side rendering inserts.
const injectStyleTag = (cssRules) => {
    // Try to find a style tag with the `data-aphrodite` attribute first (SSR)
    styleTag = styleTag || document.querySelector("style[data-aphrodite]");

    if (styleTag) {
      for (let i = 0; i < cssRules.length; i++) {
        const {isDangerous, rule} = cssRules[i];
        if (isDangerous) {
            tryInsertRule(rule);
        } else if (rule) {
            styleTag.sheet.insertRule(rule, styleTag.sheet.rules.length);
        }
      }
    } else {
      // If that doesn't work, generate a new style tag.
      // Taken from
      // http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
      const head = document.head || document.getElementsByTagName('head')[0];
      styleTag = document.createElement('style');
      styleTag.type = 'text/css';
      styleTag.setAttribute("data-aphrodite", "");
      const cssContent = cssRules.map(c => c.rule).join('');
      styleTag.appendChild(document.createTextNode(cssContent));
      head.appendChild(styleTag);
    }
};

// Custom handlers for stringifying CSS values that have side effects
// (such as fontFamily, which can cause @font-face rules to be injected)
const stringHandlers = {
    // With fontFamily we look for objects that are passed in and interpret
    // them as @font-face rules that we need to inject. The value of fontFamily
    // can either be a string (as normal), an object (a single font face), or
    // an array of objects and strings.
    fontFamily: function fontFamily(val) {
      if (Array.isArray(val)) {
        return val.map(fontFamily).join(",");
      } else if (val && typeof val === "object") {
        const {fontFamily, fontStyle, fontWeight} = val;
        const key = `${fontFamily}-${fontWeight || 400}${fontStyle}`;
        injectStyleOnce(key, "@font-face", [val], false);
        return fontFamily;
      } else {
        return val;
      }
    },

    // With animationName we look for an object that contains keyframes and
    // inject them as an `@keyframes` block, returning a uniquely generated
    // name. The keyframes object should look like
    //  animationName: {
    //    from: {
    //      left: 0,
    //      top: 0,
    //    },
    //    '50%': {
    //      left: 15,
    //      top: 5,
    //    },
    //    to: {
    //      left: 20,
    //      top: 20,
    //    }
    //  }
    // TODO(emily): `stringHandlers` doesn't let us rename the key, so I have
    // to use `animationName` here. Improve that so we can call this
    // `animation` instead of `animationName`.
    animationName: (val) => {
        if (typeof val !== "object") {
            return val;
        }

        // Generate a unique name based on the hash of the object. We can't
        // just use the hash because the name can't start with a number.
        // TODO(emily): this probably makes debugging hard, allow a custom
        // name?
        const name = `keyframe_${hashObject(val)}`;

        // Since keyframes need 3 layers of nesting, we use `generateCSS` to
        // build the inner layers and wrap it in `@keyframes` ourselves.
        let anyIsDangerous = false;
        const rules = Object.keys(val).reduce((reduction,key) => {
            const {isDangerous, rule} = generateCSS(key, [val[key]], stringHandlers, false);
            anyIsDangerous = anyIsDangerous || isDangerous;
            return reduction + rule;
        },'');
        const finalVal = {
            rule: `@keyframes ${name}{${rules}}`,
            isDangerous: anyIsDangerous
        };
        injectGeneratedCSSOnce(name, [finalVal]);

        return name;
    }
};

// This is a map from Aphrodite's generated class names to `true` (acting as a
// set of class names)
let alreadyInjected = {};

// A flag to tell if we are already buffering styles. This could happen either
// because we scheduled a flush call already, so newly added styles will
// already be flushed, or because we are statically buffering on the server.
let isBuffering = false;

const injectGeneratedCSSOnce = (key, generatedCSS) => {
    if (!alreadyInjected[key]) {
        if (!isBuffering) {
            // We should never be automatically buffering on the server (or any
            // place without a document), so guard against that.
            if (typeof document === "undefined") {
                throw new Error(
                    "Cannot automatically buffer without a document");
            }

            // If we're not already buffering, schedule a call to flush the
            // current styles.
            isBuffering = true;
            asap(flushToStyleTag);
        }
        injectionBuffer.push(...generatedCSS);
        alreadyInjected[key] = true;
    }
}

export const injectStyleOnce = (key, selector, definitions, useImportant) => {
    if (!alreadyInjected[key]) {
        const generated = generateCSS(selector, definitions,
                                      stringHandlers, useImportant);

        injectGeneratedCSSOnce(key, generated);
    }
};

export const reset = () => {
    injectionBuffer.length = 0;
    alreadyInjected = {};
    isBuffering = false;
    styleTag = null;
};

export const startBuffering = () => {
    if (isBuffering) {
        throw new Error(
            "Cannot buffer while already buffering");
    }
    isBuffering = true;
};

export const flushToString = () => {
    isBuffering = false;
    const ret = injectionBuffer.slice();
    injectionBuffer.length = 0;
    return ret;
};

export const flushToStyleTag = () => {
    const cssRules = flushToString();
    if (cssRules.length > 0) {
        injectStyleTag(cssRules);
    }
};

export const getRenderedClassNames = () => {
    return Object.keys(alreadyInjected);
};

export const addRenderedClassNames = (classNames) => {
    classNames.forEach(className => {
        alreadyInjected[className] = true;
    });
};

/**
 * Inject styles associated with the passed style definition objects, and return
 * an associated CSS class name.
 *
 * @param {boolean} useImportant If true, will append !important to generated
 *     CSS output. e.g. {color: red} -> "color: red !important".
 * @param {(Object|Object[])[]} styleDefinitions style definition objects, or
 *     arbitrarily nested arrays of them, as returned as properties of the
 *     return value of StyleSheet.create().
 */
export const injectAndGetClassName = (useImportant, styleDefinitions) => {
    styleDefinitions = flattenDeep(styleDefinitions);

    // Filter out falsy values from the input, to allow for
    // `css(a, test && c)`
    const validDefinitions = styleDefinitions.filter((def) => def);

    // Break if there aren't any valid styles.
    if (validDefinitions.length === 0) {
        return "";
    }

    const className = validDefinitions.map(s => s._name).join("-o_O-");
    injectStyleOnce(className, `.${className}`,
        validDefinitions.map(d => d._definition),
        useImportant);

    return className;
}
