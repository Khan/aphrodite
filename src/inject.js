import {generateCSS} from './generate';

const injectStyleTag = (cssContents) => {
    // Taken from
    // http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = cssContents;
    } else {
        style.appendChild(document.createTextNode(cssContents));
    }

    head.appendChild(style);
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
        } else if (typeof val === "object") {
            injectStyleOnce(val.fontFamily, "@font-face", [val], false);
            return `"${val.fontFamily}"`;
        } else {
            return val;
        }
    },
};

// This is a map from Aphrodite's generated class names to `true` (acting as a
// set of class names)
let alreadyInjected = {};

// This is the buffer of styles which have not yet been flushed.
let injectionBuffer = "";

// We allow for concurrent calls to `renderBuffered`, this keeps track of which
// level of nesting we are currently at. 0 means no buffering, >0 means
// buffering.
let bufferLevel = 0;

// This tells us whether our previous request to buffer styles is from
// renderStatic or renderBuffered. We don't want to allow mixing of the two, so
// we keep track of which one we were in before. This only has meaning if
// bufferLevel > 0.
let inStaticBuffer = true;

export const injectStyleOnce = (key, selector, definitions, useImportant) => {
    if (!alreadyInjected[key]) {
        const generated = generateCSS(selector, definitions,
            stringHandlers, useImportant);
        if (bufferLevel > 0) {
            injectionBuffer += generated;
        } else {
            injectStyleTag(generated);
        }
        alreadyInjected[key] = true;
    }
};

export const reset = () => {
    injectionBuffer = "";
    alreadyInjected = {};
    bufferLevel = 0;
    inStaticBuffer = true;
};

export const startBuffering = (isStatic) => {
    if (bufferLevel > 0 && inStaticBuffer !== isStatic) {
        throw new Error(
            "Can't interleave server-side and client-side buffering.");
    }
    inStaticBuffer = isStatic;
    bufferLevel++;
};

export const flushToString = () => {
    bufferLevel--;
    if (bufferLevel > 0) {
        return "";
    } else if (bufferLevel < 0) {
        throw new Error(
            "Aphrodite tried to flush styles more often than it tried to " +
                "buffer them. Something is wrong!");
    }

    const ret = injectionBuffer;
    injectionBuffer = "";
    return ret;
};

export const flushToStyleTag = () => {
    const cssContent = flushToString();
    if (cssContent.length > 0) {
        injectStyleTag(cssContent);
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
