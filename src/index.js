import makeExports from './exports';

const useImportant = true; // Add !important to all style definitions

const Aphrodite = makeExports(useImportant);

const {
    StyleSheet,
    StyleSheetServer,
    StyleSheetTestUtils,
    css,
    minify,
    flushToStyleTag,
    injectAndGetClassName,
    defaultSelectorHandlers,
    reset,
    resetInjectedStyle,
} = Aphrodite;

export {
    StyleSheet,
    StyleSheetServer,
    StyleSheetTestUtils,
    css,
    minify,
    flushToStyleTag,
    injectAndGetClassName,
    defaultSelectorHandlers,
    reset,
    resetInjectedStyle,
};
