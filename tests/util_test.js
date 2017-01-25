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
        it('replaces arrays rather than merging them', () => {
            assert.deepEqual(
                recursiveMerge({
                    a: [1],
                }, {
                    a: [2],
                }),
                {
                    a: [2],
                });
        });
        it('prefers the value from the override object if either property is not a true object', () => {
            assert.deepEqual(
                recursiveMerge({
                    a: { b: 2 },
                }, {
                    a: null,
                }),
                {
                    a: null,
                });
            assert.deepEqual(
                recursiveMerge({
                    a: null,
                }, {
                    a: { b: 2 },
                }),
                {
                    a: { b: 2 },
                });
        });
    });
});
