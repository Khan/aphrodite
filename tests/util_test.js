import {assert} from 'chai';

import {recursiveMerge, setConfig, getConfig, shouldUseImportant} from '../src/util.js';

describe('Utils', () => {
    describe('recursiveMerge', () => {
        it('merges two objects', () => {
            assert.deepEqual(
                recursiveMerge({
                    a: 1,
                }, {
                    a: 2,
                }),
                {
                    a: 2,
                });

            assert.deepEqual(
                recursiveMerge({
                    a: 1,
                }, {
                    b: 2,
                }),
                {
                    a: 1,
                    b: 2,
                });
        });
    });
    describe('setConfig', () => {
        it('sets and gets options', () => {
            setConfig('useImportant', false);
            assert.strictEqual(getConfig('useImportant'), false);
            setConfig('useImportant', true);
            assert.strictEqual(getConfig('useImportant'), true);
        });
    });
    describe('shouldUseImportant', () => {
        it('applies !important when config.useImportant is true', () => {
            setConfig('useImportant', true);
            assert.strictEqual(shouldUseImportant(), true);
        });
        it('does not apply !important when config.useImportant is false', () => {
            setConfig('useImportant', false);
            assert.strictEqual(shouldUseImportant(), false);
        });
        it('allows the useImportant argument to override config', () => {
            setConfig('useImportant', true);
            assert.strictEqual(shouldUseImportant(false), false);
        });
    });
});
