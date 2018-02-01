// Type definitions for Aphrodite 1.2.3
// Project: https://github.com/Khan/aphrodite

declare module "aphrodite" {
    import * as React from "react";

    /**
     * Aphrodite style declaration
     */
    export interface StyleDeclaration
    {
        [key: string]: React.CSSProperties;
    }

    interface StyleSheetStatic
    {
        /**
         * Create style sheet
         */
        create( styles: StyleDeclaration ): StyleDeclaration;
        create<T extends StyleDeclaration>( styles: T ): T;
        /**
         * Rehydrate class names from server renderer
         */
        rehydrate( renderedClassNames: string[] ): void;
    }

    export var StyleSheet: StyleSheetStatic;

    type CSSInputTypes = ( StyleDeclaration | false | null | void );

    /**
     * Get class names from passed styles
     */
    export function css( ...styles: CSSInputTypes[] ): string;

    interface StaticRendererResult
    {
        html: string;
        css: {
            content: string;
            renderedClassNames: string[];
        }
    }

    /**
     * Utilities for using Aphrodite server-side.
     */
    interface StyleSheetServerStatic
    {
        renderStatic( renderFunc: () => string ): StaticRendererResult;
    }

    export var StyleSheetServer: StyleSheetServerStatic;

    interface StyleSheetTestUtilsStatic
    {
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
        suppressStyleInjection(): void;
        /**
         * Opposite method of preventStyleInject.
        */
        clearBufferAndResumeStyleInjection(): void;
    }

    export var StyleSheetTestUtils: StyleSheetTestUtilsStatic;

    export interface SelectorHandler
    {
        ( selector: string, baseSelector: string, callback: ( selector: string ) => string ): string | null;
    }

    export interface Extension
    {
        selectorHandler?: SelectorHandler,
    }

    /**
     * Calling StyleSheet.extend() returns an object with each of the exported
     * properties on it.
     */
    interface Exports
    {
        css( ...styles: CSSInputTypes[] ): string;

        StyleSheet: StyleSheetStatic;
        StyleSheetServer: StyleSheetServerStatic;
        StyleSheetTestUtils: StyleSheetTestUtilsStatic;
    }

    interface StyleSheetStatic
    {
        extend( extensions: Extension[] ): Exports;
    }
}