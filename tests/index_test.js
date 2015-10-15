/* @flow */

import {assert} from 'chai';
import jsdom from 'jsdom';

import { StyleSheet, css } from '../src/index.js';

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

        assert.ok(sheet.red._name);
        assert.ok(sheet.blue._name);
        assert.notEqual(sheet.red._name, sheet.blue._name);
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

        assert.notEqual(sheet1.red._name, sheet2.red._name);
    });

    it('works for empty stylesheets and styles', () => {
        const emptySheet = StyleSheet.create({});

        const sheet = StyleSheet.create({
            empty: {}
        });

        assert.ok(sheet.empty._name);
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
