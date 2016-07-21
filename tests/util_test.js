import {assert} from 'chai';

import {recursiveMerge} from '../src/util.js';

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
        it('handles null', () => {
            assert.deepEqual(
                recursiveMerge({
                    a: null,
                }, {
                    a: 2,
                }),
                {
                    a: 2,
                });
        });
    });
});
