// Module with the same interface as the core aphrodite module,
// except that styles injected do not automatically have !important
// appended to them.
//
import {injectAndGetClassName} from './inject';

import {
    StyleSheet,
    StyleSheetServer,
    StyleSheetTestUtils,
} from './index.js'

const css = (...styleDefinitions) => {
    // Do not append !important to style definitions
    return injectAndGetClassName(false, styleDefinitions);
};

export {
    StyleSheet,
    StyleSheetServer,
    StyleSheetTestUtils,
    css
}
