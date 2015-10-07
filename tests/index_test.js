/* @flow */

import {assert} from 'chai';

import StyleSheet from '../src/index.js';

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
