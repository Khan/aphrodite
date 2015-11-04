/* @flow */

import {assert} from 'chai';
import jsdom from 'jsdom';

import { StyleSheet, css, combine } from '../src/index.js';

describe('create', () => {
    it('assigns a name to stylesheet properties', () => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },
            blue: {
                color: 'blue'
            }
        });

        assert.ok(sheet.red._names);
        assert.ok(sheet.blue._names);
        assert.notDeepEqual(sheet.red._names, sheet.blue._names);
    });

    it('assign different names to two different create calls', () => {
        const sheet1 = StyleSheet.create({
            red: {
                color: 'red',
            }
        });

        const sheet2 = StyleSheet.create({
            red: {
                color: 'red',
            }
        });

        assert.notDeepEqual(sheet1.red._names, sheet2.red._names);
    });

    it('works for empty stylesheets and styles', () => {
        const emptySheet = StyleSheet.create({});

        const sheet = StyleSheet.create({
            empty: {}
        });

        assert.ok(sheet.empty._names);
    });
});

describe('css', () => {
    beforeEach(function() {
        global.document = jsdom.jsdom();
    });

    afterEach(function() {
        global.document.close();
        global.document = undefined;
    });

    it('generates class names', () => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },

            blue: {
                color: 'blue'
            }
        });

        assert.ok(css(sheet.red, sheet.blue));
    });

    it('filters out falsy inputs', () => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },
        });

        assert.equal(css(sheet.red), css(sheet.red, false));
        assert.equal(css(sheet.red), css(false, sheet.red));
    });

    it('succeeds for with empty args', () => {
        assert(css() != null);
        assert(css(false) != null);
    });
});

describe('combine', () => {
    it('combines styles', () => {
        const styles = StyleSheet.create({
            red: {
                color: 'red',
            },

            blue: {
                color: 'blue',
            },
        });

        const combined = combine(styles.red, styles.blue);

        assert.deepEqual(
            combined._names,
            styles.red._names.concat(styles.blue._names)
        );

        assert.equal(combined._definition.color, 'blue');
    });

    it('filters falsey values', () => {
        const styles = StyleSheet.create({
            red: {
                color: 'red',
            },
        });

        assert.deepEqual(
            combine(styles.red, null),
            combine(false, styles.red)
        );
    });

    it("doesn't fail with no values", () => {
        combine(null);
        combine();
    });
});
