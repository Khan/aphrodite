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
    }
};

const css = (function() {
    const classNameAlreadyInjected = {};
    return (styleDefinitions) => {
        const className = styleDefinitions.map(s => s._name).join("-o_O-");
        if (!classNameAlreadyInjected[className]) {
            const generated = generateCSS(
                `.${className}`,
                styleDefinitions.map(d => d._definition));
            injectStyles(generated);
            classNameAlreadyInjected[className] = true;
        }
        return className;
    }
})();

export default {
    StyleSheet,
    css
};
