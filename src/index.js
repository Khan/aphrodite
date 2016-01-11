import {mapObj, hashObject} from './util';
import {
    injectStyleOnce,
    reset, startBuffering, flushToString, flushToStyleTag,
    addRenderedClassNames, getRenderedClassNames
} from './inject';

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

    renderBuffered(renderFunc, renderedClassNames=[]) {
        addRenderedClassNames(renderedClassNames);
        startBuffering(false);
        renderFunc(flushToStyleTag);
    },
};

const StyleSheetServer = {
    renderStatic(renderFunc) {
        reset();
        startBuffering(true);
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
    StyleSheetServer,
    css,
};
