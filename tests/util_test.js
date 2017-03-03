/* global Map */
import {assert} from 'chai';

import {flattenDeep, kebabifyStyleName, recursiveMerge} from '../src/util.js';

import "es6-shim";

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
                    elements: {
                        a: 2,
                    },
                    keyOrder: ["a"],
                });

            assert.deepEqual(
                recursiveMerge({
                    a: 1,
                }, {
                    b: 2,
                }),
                {
                    elements: {
                        a: 1,
                        b: 2,
                    },
                    keyOrder: ["a", "b"],
                });
        });

        it('merges maps together', () => {
            assert.deepEqual(
                recursiveMerge(
                    new Map([['a', 1], ['b', 2]]),
                    new Map([['a', 3], ['c', 4]])
                ),
                {
                    elements: {
                        a: 3,
                        b: 2,
                        c: 4,
                    },
                    keyOrder: ["a", "b", "c"],
                });
        });

        it('merges maps and objects together', () => {
            assert.deepEqual(
                [
                    new Map([['a', 1]]),
                    {a: 2, b: 3},
                    new Map([['b', 4], ['c', 5]]),
                ].reduce(recursiveMerge),
                {
                    elements: {
                        a: 2,
                        b: 4,
                        c: 5,
                    },
                    keyOrder: ["a", "b", "c"],
                });
        });

        it('generates OrderedElements from merging an object into a non-object', () => {
            assert.deepEqual(
                recursiveMerge(
                    1,
                    {a: 1},
                ),
                {
                    elements: {
                        a: 1,
                    },
                    keyOrder: ["a"],
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
                    elements: {
                        a: [2],
                    },
                    keyOrder: ["a"],
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
                    elements: {
                        a: null,
                    },
                    keyOrder: ["a"],
                });

            assert.deepEqual(
                recursiveMerge({
                    a: null,
                }, {
                    a: { b: 2 },
                }),
                {
                    elements: {
                        a: {
                            elements: {
                                b: 2,
                            },
                            keyOrder: ["b"],
                        },
                    },
                    keyOrder: ["a"],
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
