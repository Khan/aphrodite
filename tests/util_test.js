import {assert} from 'chai';

import {flattenDeep, kebabifyStyleName, recursiveMerge} from '../src/util.js';

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

    describe('kebabifyStyleName', () => {
        it('kebabifies camelCase', () => {
            assert.equal(kebabifyStyleName('fooBarBaz'), 'foo-bar-baz');
        });
        it('kebabifies PascalCase', () => {
            assert.equal(kebabifyStyleName('FooBarBaz'), '-foo-bar-baz');
        });
        it('does not force -webkit-', () => {
            assert.equal(kebabifyStyleName('webkitFooBarBaz'), 'webkit-foo-bar-baz');
        });
        it('forces -ms-', () => {
            assert.equal(kebabifyStyleName('msFooBarBaz'), '-ms-foo-bar-baz');
        });
    });
});
