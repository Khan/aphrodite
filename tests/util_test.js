import {assert} from 'chai';

import {recursiveMerge, uniquify} from '../src/util.js';

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

    describe('uniquify', () => {
        it('uniquifies an array', () => {
            assert.deepEqual(
                uniquify([1, 2, 3, 1]),
                [1, 2, 3]);

            assert.deepEqual(
                uniquify(["My Font", "My Font"]),
                ["My Font"]);
        });

        it('does not uniquify by string', () => {
            assert.deepEqual(
                uniquify([1, 2, "2"]),
                [1, 2, "2"]);
        });
    });
});
