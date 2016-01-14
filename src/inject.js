import asap from 'asap';

import {generateCSS} from './generate';

// The current <style> tag we are inserting into, or null if we haven't
// inserted anything yet. We could find this each time using
// `document.querySelector("style[data-aphrodite"])`, but holding onto it is
// faster.
let styleTag = null;

// Inject a string of styles into a <style> tag in the head of the document. This
// will automatically create a style tag and then continue to use it for
// multiple injections. It will also use a style tag with the `data-aphrodite`
// tag on it if that exists in the DOM. This could be used for e.g. reusing the
// same style tag that server-side rendering inserts.
const injectStyleTag = (cssContents) => {
    if (styleTag == null) {
        // Try to find a style tag with the `data-aphrodite` attribute first.
        styleTag = document.querySelector("style[data-aphrodite]");

        // If that doesn't work, generate a new style tag.
        if (styleTag == null) {
            // Taken from
            // http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
            const head = document.head || document.getElementsByTagName('head')[0];
            styleTag = document.createElement('style');

            styleTag.type = 'text/css';
            styleTag.setAttribute("data-aphrodite", "");
            head.appendChild(styleTag);
        }
    }

    if (styleTag.styleSheet) {
        styleTag.styleSheet.cssText += cssContents;
    } else {
        styleTag.appendChild(document.createTextNode(cssContents));
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

// A flag to tell if we are already buffering styles. This could happen either
// because we scheduled a flush call already, so newly added styles will
// already be flushed, or because we are statically buffering on the server.
let isBuffering = false;

export const injectStyleOnce = (key, selector, definitions, useImportant) => {
    if (!alreadyInjected[key]) {
        const generated = generateCSS(selector, definitions,
            stringHandlers, useImportant);

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

        injectionBuffer += generated;
        alreadyInjected[key] = true;
    }
};

export const reset = () => {
    injectionBuffer = "";
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
