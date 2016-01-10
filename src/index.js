import {generateCSS} from './generate';
import {mapObj, hashObject} from './util';

const injectStyles = (cssContents) => {
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

const alreadyInjected = {};
let injectionBuffer = "";
let injectionMode = 'IMMEDIATE';

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

const injectStyleOnce = (key, selector, definitions, useImportant) => {
    if (!alreadyInjected[key]) {
        const generated = generateCSS(selector, definitions,
            stringHandlers, useImportant);
        if (injectionMode === 'BUFFER') {
            injectionBuffer += generated;
        } else {
            injectStyles(generated);
        }
        alreadyInjected[key] = true;
    }
};

const StyleSheet = {
    create(sheetDefinition) {
        return mapObj(sheetDefinition, ([key, val]) => {
            return [key, {
                // TODO(emily): Make a 'production' mode which doesn't prepend
                // the class name here, to make the generated CSS smaller.
                _name: `${key}_${hashObject(val)}`,
                _definition: val
            }];
        });
    },

    startBuffering() {
        injectionMode = 'BUFFER';
    },

    flush() {
        if (injectionMode !== 'BUFFER') {
            return;
        }
        if (injectionBuffer.length > 0) {
            injectStyles(injectionBuffer);
        }
        injectionMode = 'IMMEDIATE';
        injectionBuffer = "";
    },
};

const css = (...styleDefinitions) => {
    // Filter out falsy values from the input, to allow for
    // `css(a, test && c)`
    const validDefinitions = styleDefinitions.filter((def) => def);

    // Break if there aren't any valid styles.
    if (validDefinitions.length === 0) {
        return "";
    }

    const className = validDefinitions.map(s => s._name).join("-o_O-");
    injectStyleOnce(className, `.${className}`,
        validDefinitions.map(d => d._definition));

    return className;
};

export default {
    StyleSheet,
    css
};
