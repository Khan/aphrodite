import {mapObj, hashObject} from './util';
import {
    injectStyleOnce,
    reset, startBuffering, flushToString,
    addRenderedClassNames, getRenderedClassNames
} from './inject';

const StyleSheet = {
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

const css = (...styleDefinitions) => {
    // Filter out falsy values from the input, to allow for
    // `css(a, test && c)`
    const validDefinitions = styleDefinitions.filter((def) => def);

    // Break if there aren't any valid styles.
    if (validDefinitions.length === 0) {
        return "";
    }

    const className = validDefinitions.map(s => `_${hashObject(s)}`).join(
        "-o_O-");
    injectStyleOnce(className, `.${className}`, validDefinitions);

    return className;
};

export default {
    StyleSheet,
    StyleSheetServer,
    css,
};
