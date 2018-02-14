import {defaultSelectorHandlers} from './generate';
import makeExports from './exports';

const useImportant = true; // Add !important to all style definitions

const Aphrodite = makeExports(
    useImportant,
    defaultSelectorHandlers
);

const {
    StyleSheet,
    StyleSheetServer,
    StyleSheetTestUtils,
    css,
} = Aphrodite;

export {
    StyleSheet,
    StyleSheetServer,
    StyleSheetTestUtils,
    css,
};
