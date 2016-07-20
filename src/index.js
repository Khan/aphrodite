import {mapObj, hashObject} from './util';
import {
    injectAndGetClassName,
    reset, startBuffering, flushToString,
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

    rehydrate(renderedClassNames=[]) {
        addRenderedClassNames(renderedClassNames);
    },
};

/**
 * Utilities for using Aphrodite server-side.
 */
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

/**
 * Utilities for using Aphrodite in tests.
 *
 * Not meant to be used in production.
 */
const StyleSheetTestUtils = {
    /**
     * Prevent styles from being injected into the DOM.
     *
     * This is useful in situations where you'd like to test rendering UI
     * components which use Aphrodite without any of the side-effects of
     * Aphrodite happening. Particularly useful for testing the output of
     * components when you have no DOM, e.g. testing in Node without a fake DOM.
     *
     * Should be paired with a subsequent call to
     * clearBufferAndResumeStyleInjection.
     */
    suppressStyleInjection() {
        reset();
        startBuffering();
    },

    /**
     * Opposite method of preventStyleInject.
     */
    clearBufferAndResumeStyleInjection() {
        reset();
    },
};

const css = (...styleDefinitions) => {
    const useImportant = true;   // Append !important to all style definitions
    return injectAndGetClassName(useImportant, styleDefinitions);
};

export default {
    StyleSheet,
    StyleSheetServer,
    StyleSheetTestUtils,
    css,
};
