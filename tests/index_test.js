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
});

describe('css', () => {
    it('generates class names', (done) => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },

            blue: {
                color: 'blue'
            }
        });

        jsdom.env('<html><head></head></html>', (err, window) => {
            assert.ok(!err);

            global.document = window.document;

            assert.ok(css([sheet.red, sheet.blue]));

            done();
        });
    });

    it('filters out falsy inputs', (done) => {
        const sheet = StyleSheet.create({
            red: {
                color: 'red',
            },
        });

        jsdom.env('<html><head></head></html>', (err, window) => {
            assert.ok(!err);

            global.document = window.document;

            assert.equal(css([sheet.red]), css([sheet.red, false]));
            assert.equal(css([sheet.red]), css([false, sheet.red]));

            done();
        });
    });
});
