import {generateCSS} from './generate';
import {mapObj, nextID} from './util';

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

const classNameAlreadyInjected = {};
let injectionBuffer = "";
let injectionMode = 'IMMEDIATE';

const StyleSheet = {
    create(sheetDefinition) {
        return mapObj(sheetDefinition, ([key, val]) => {
            // TODO(jlfwong): Figure out a way (probably an AST transform) to
            // make the ID stable here to enable server -> client rehydration.
            // Probably just use a large random number (but one that's
            // determined at build time instead of runtime).
            return [key, {
                _name: `${key}_${nextID()}`,
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

// Write our own propType validator so we don't depend on React.
const propType = function(props, propName, component) {
    const styleProp = props[propName];

    if (typeof styleProp !== "object") {
        return new Error(
            `Invalid type '${typeof styleProp}', expecting object`);
    }

    if (typeof styleProp._name !== "string") {
        return new Error("Missing _name value");
    }

    if (typeof styleProp._definition !== "object") {
        return new Error("Missing _definition value");
    }

    for (let key in styleProp._definition) {
        if (Object.prototype.hasOwnProperty.call(styleProp._definition, key)) {
            let value = styleProp._definition[key];
            if (typeof value !== "number" && typeof value !== "string") {
                return new Error(
                    `Invalid style type '${typeof value}' for key ${key}, ` +
                        "expecting string or number");
            }
        }
    }
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
    if (!classNameAlreadyInjected[className]) {
        const generated = generateCSS(
            `.${className}`,
            validDefinitions.map(d => d._definition));
        if (injectionMode === 'BUFFER') {
            injectionBuffer += generated;
        } else {
            injectStyles(generated);
        }
        classNameAlreadyInjected[className] = true;
    }
    return className;
};

export default {
    StyleSheet,
    css,
    propType,
};
