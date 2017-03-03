/* global Map */
import {assert} from 'chai';

import OrderedElements from '../src/ordered-elements';

import "es6-shim";

describe("OrderedElements", () => {
    it("generates from an object", () => {
        const orig = {
            a: 1,
            b: 2,
        };

        const elems = OrderedElements.from(orig);

        assert.deepEqual({
            elements: orig,
            keyOrder: ["a", "b"],
        }, elems);
    });

    it("generates from a Map", () => {
        const orig = new Map([
            ["a", 1],
            ["b", 2]
        ]);

        const elems = OrderedElements.from(orig);

        assert.deepEqual({
            elements: {
                a: 1,
                b: 2,
            },
            keyOrder: ["a", "b"],
        }, elems);
    });

    it("generates from a OrderedElements", () => {
        const orig = new OrderedElements();

        orig.set("a", 1);
        orig.set("b", 2);

        const elems = OrderedElements.from(orig);

        assert.deepEqual(orig, elems);
    });

    it("adds new elements in order", () => {
        const elems = new OrderedElements();

        elems.set("a", 1);
        elems.set("b", 2);

        assert.deepEqual({
            elements: {
                a: 1,
                b: 2,
            },
            keyOrder: ["a", "b"],
        }, elems);
    });

    it("overrides old elements but doesn't add to the key ordering", () => {
        const elems = new OrderedElements();

        elems.set("a", 1);
        elems.set("a", 2);

        assert.deepEqual({
            elements: {
                a: 2,
            },
            keyOrder: ["a"],
        }, elems);
    });

    it("iterates over the elements in the correct order", () => {
        const elems = new OrderedElements();

        elems.set("a", 1);
        elems.set("b", 2);
        elems.set("c", 3);

        const order = [];

        elems.forEach((key, value) => {
            order.push([key, value]);
        });

        assert.deepEqual([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ], order);
    });

    it("maps over the elements, making a new OrderedElements from the result", () => {
        const elems = new OrderedElements();

        elems.set("a", 1);
        elems.set("b", 2);
        elems.set("c", 3);

        const mapped = elems.map((key, value) => {
            return value + 1;
        });

        assert.deepEqual({
            elements: {
                a: 2,
                b: 3,
                c: 4,
            },
            keyOrder: ["a", "b", "c"],
        }, mapped);
    });
});
