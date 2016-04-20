import {mapObj, hashObject} from './util';
import {
    injectStyleOnce,
    reset, startBuffering, flushToString,
    addRenderedClassNames, getRenderedClassNames
} from './inject';

// TODO(emily): Make a 'production' mode which doesn't prepend the class name
// here, to make the generated CSS smaller.
const makeClassName = (key, vals) => `${key}_${hashObject(vals)}`;

// Find all of the references to descendant styles in a given definition,
// generates a class name for each of them based on the class name of the
// parent, and stores that name in a special `_names` object on the style.
const findAndTagDescendants = (styles, base, names={}) => {
    Object.keys(styles).forEach(key => {
        if (key[0] === ':' || key[0] === '@') {
            findAndTagDescendants(styles[key], base, names);
        } else if (key[0] === '>' && key[1] === '>') {
            findAndTagDescendants(styles[key], base, names);

            const name = `${base}__${key.slice(2)}`;

            names[key.slice(2)] = {
                _isPlainClassName: true,
                _className: name,
            };

            styles[key]._names = { [name]: true };
        }
    });

    return names;
};

const StyleSheet = {
    create(sheetDefinition) {
        return mapObj(sheetDefinition, ([key, val]) => {
            const name = makeClassName(key, val);

            return [key, {
                _name: name,
                _definition: val,
                ...findAndTagDescendants(val, name),
            }];
        });
    },

    rehydrate(renderedClassNames=[]) {
        addRenderedClassNames(renderedClassNames);
    },
};

const StyleSheetServer = {
    renderStatic(renderFunc) {
        reset();
        startBuffering();
        const html = renderFunc();
        const cssContent = flushToString();

        return {
            html: html,
            css: {
                content: cssContent,
                renderedClassNames: getRenderedClassNames(),
            },
        };
    },
};

const isPlainClassName = (def) => def._isPlainClassName;

const css = (...styleDefinitions) => {
    // Filter out falsy values from the input, to allow for
    // `css(a, test && c)`
    const validDefinitions = styleDefinitions.filter((def) => def);

    // Break if there aren't any valid styles.
    if (validDefinitions.length === 0) {
        return "";
    }

    // Filter out "plain class name" arguments, which just want us to add a
    // classname to the end result, instead of generating styles.
    const plainClassNames = validDefinitions.filter(isPlainClassName).map(def => def._className);

    const otherDefinitions = validDefinitions.filter(
        def => !isPlainClassName(def));

    // If there are only plain class names, just join those.
    if (otherDefinitions.length === 0) {
        return plainClassNames.join(" ");
    }

    const className = otherDefinitions.map(s => s._name).join("-o_O-");
    injectStyleOnce(className, `.${className}`,
        otherDefinitions.map(d => d._definition));

    return [className, ...plainClassNames].join(" ");
};

export default {
    StyleSheet,
    StyleSheetServer,
    css,
};
