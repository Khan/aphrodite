import {assert} from 'chai';

import {flattenDeep, recursiveMerge} from '../src/util.js';

describe('Utils', () => {
    describe('flattenDeep', () => {
        it('flattens arrays at any level', () => {
            assert.deepEqual(
                flattenDeep([[1, [2, 3, []]], 4, [[5], [6, [7]]]]),
                [1, 2, 3, 4, 5, 6, 7]);
        });
    });

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
});
