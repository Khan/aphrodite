/* @flow */
import { hashString } from './util';
import { defaultSelectorHandlers } from './generate';
import { Inject } from './inject';

/* ::
import type { SelectorHandler } from './generate.js';
export type SheetDefinition = { [id:string]: any };
export type SheetDefinitions = SheetDefinition | SheetDefinition[];
type RenderFunction = () => string;
type Extension = {
    selectorHandler: SelectorHandler
};
export type MaybeSheetDefinition = SheetDefinition | false | null | void
*/

const unminifiedHashFn = (str/* : string */, key/* : string */) => `${key}_${hashString(str)}`;

// StyleSheet.create is in a hot path so we want to keep as much logic out of it
// as possible. So, we figure out which hash function to use once, and only
// switch it out via minify() as necessary.
//
// This is in an exported function to make it easier to test.
export const initialHashFn = () => process.env.NODE_ENV === 'production'
    ? hashString
    : unminifiedHashFn;

export class StyleSheet {
    /**
     * 
     * @param {Inject} inject 
     * @param {*} useImportant 
     * @param {*} selectorHandlers 
     */
    constructor(inject, useImportant, selectorHandlers = defaultSelectorHandlers) {
        this.inject = inject;
        this.useImportant = useImportant;
        this.selectorHandlers = selectorHandlers;
        this.hashFn = initialHashFn();
    }
    minify(shouldMinify /* : boolean */) {
        this.hashFn = shouldMinify ? hashString : unminifiedHashFn;
    }
    create(sheetDefinition /* : SheetDefinition */) /* : Object */ {
        const mappedSheetDefinition = {};
        const keys = Object.keys(sheetDefinition);

        for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            const val = sheetDefinition[key];
            const stringVal = JSON.stringify(val);

            mappedSheetDefinition[key] = {
                _len: stringVal.length,
                _name: this.hashFn(stringVal, key),
                _definition: val,
            };
        }

        return mappedSheetDefinition;
    }

    rehydrate(renderedClassNames /* : string[] */ = []) {
        this.inject.addRenderedClassNames(renderedClassNames);
    }

    css(...styleDefinitions /* : MaybeSheetDefinition[] */) {
        return this.inject.injectAndGetClassName(
            this.useImportant, styleDefinitions, this.selectorHandlers);
    }

    extend(extensions) {
        extensions;
        throw new Error('not implemented');
    }

}

/**
 * Utilities for using Aphrodite server-side.
 *
 * This can be minified out in client-only bundles by replacing `typeof window`
 * with `"object"`, e.g. via Webpack's DefinePlugin:
 *
 *   new webpack.DefinePlugin({
 *     "typeof window": JSON.stringify("object")
 *   })
 */
export class StyleSheetServer {
    /**
     * 
     * @param {Inject} inject 
     */
    constructor(inject) {
        this.inject = inject;
        this.processHtml = (html) => {
            const cssContent = this.inject.flushToString();

            return {
                html: html,
                css: {
                    content: cssContent,
                    renderedClassNames: this.inject.getRenderedClassNames(),
                },
            };
        }
    }

    renderStatic(renderFunc /* : RenderFunction */) {
        this.inject.reset();
        this.inject.startBuffering();
        return this.processHtml(renderFunc());
    }

    renderStaticAsync(renderFunc /* : RenderFunction */) {
        this.inject.reset();
        this.inject.startBuffering();
        return renderFunc().then(this.processHtml);
    }
}

/**
 * Utilities for using Aphrodite in tests.
 *
 * Not meant to be used in production.
 */
export class StyleSheetTestUtils {
    /**
     * 
     * @param {Inject} inject 
     */
    constructor(inject) {
        this.inject = inject;
    }
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
        this.inject.reset();
        this.inject.startBuffering();
    }

    /**
    * Opposite method of preventStyleInject.
    */
    clearBufferAndResumeStyleInjection() {
        this.inject.reset();
    }

    /**
    * Returns a string of buffered styles which have not been flushed
    *
    * @returns {string[]}  Buffer of styles which have not yet been flushed.
    */
    getBufferedStyles() {
        return this.inject.getBufferedStyles();
    }
}

export default function makeExports(useImportant, selectorHandlers = defaultSelectorHandlers) {

    const inject = new Inject();

    class StyleSheetWithExtend extends StyleSheet {
        /**
        * Returns a version of the exports of Aphrodite (i.e. an object
        * with `css` and `StyleSheet` properties) which have some
        * extensions included.
        *
        * @param {Array.<Object>} extensions: An array of extensions to
        *     add to this instance of Aphrodite. Each object should have a
        *     single property on it, defining which kind of extension to
        *     add.
        * @param {SelectorHandler} [extensions[].selectorHandler]: A
        *     selector handler extension. See `defaultSelectorHandlers` in
        *     generate.js.
        *
        * @returns {Object} An object containing the exports of the new
        *     instance of Aphrodite.
        */
        extend(extensions /* : Extension[] */) {
            const extensionSelectorHandlers = extensions
                // Pull out extensions with a selectorHandler property
                .map(extension => extension.selectorHandler)
                // Remove nulls (i.e. extensions without a selectorHandler property).
                .filter(handler => handler);


            return makeExports(useImportant, selectorHandlers.concat(extensionSelectorHandlers));
        }
    }

    const styleSheet = new StyleSheetWithExtend(inject, useImportant, selectorHandlers);
    return {
        StyleSheet: styleSheet,
        StyleSheetServer: new StyleSheetServer(inject),
        StyleSheetTestUtils: new StyleSheetTestUtils(inject),
        css: styleSheet.css.bind(styleSheet),
        minify: styleSheet.minify.bind(styleSheet),
        injectAndGetClassName: inject.injectAndGetClassName.bind(inject),
        flushToStyleTag: inject.flushToStyleTag.bind(inject),
        reset: inject.reset.bind(inject),
        resetInjectedStyle: inject.resetInjectedStyle.bind(inject),
    }

}