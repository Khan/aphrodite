/* @flow */
import makeExports from './exports';

import type { Export } from './exports';

const useImportant = true; // Add !important to all style definitions

const Aphrodite: Export = makeExports(useImportant);

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
