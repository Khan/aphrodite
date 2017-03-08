/* @flow */
/* global Map */

export default class OrderedElements {
    /* ::
    elements: {[string]: any};
    keyOrder: string[];

    static fromObject: ({[string]: any}) => OrderedElements;
    static fromMap: (Map<string,any>) => OrderedElements;
    static from: (Map<string,any> | {[string]: any} | OrderedElements) =>
        OrderedElements;
    */

    constructor(
        elements /* : {[string]: any} */ = {},
        keyOrder /* : string[] */ = []
    ) {
        this.elements = elements;
        this.keyOrder = keyOrder;
    }

    forEach(callback /* : (string, any) => void */) {
        for (let i = 0; i < this.keyOrder.length; i++) {
            callback(this.keyOrder[i], this.elements[this.keyOrder[i]]);
        }
    }

    map(callback /* : (string, any) => any */) /* : OrderedElements */ {
        const results = new OrderedElements();
        for (let i = 0; i < this.keyOrder.length; i++) {
            results.set(
                this.keyOrder[i],
                callback(this.keyOrder[i], this.elements[this.keyOrder[i]])
            );
        }
        return results;
    }

    set(key /* : string */, value /* : any */) {
        if (!this.elements.hasOwnProperty(key)) {
            this.keyOrder.push(key);
        }
        this.elements[key] = value;
    }

    get(key /* : string */) /* : any */ {
        return this.elements[key];
    }

    has(key /* : string */) /* : boolean */ {
        return this.elements.hasOwnProperty(key);
    }
}

OrderedElements.fromObject = (obj) => {
    return new OrderedElements(obj, Object.keys(obj));
};

OrderedElements.fromMap = (map) => {
    const ret = new OrderedElements();
    map.forEach((val, key) => {
        ret.set(key, val);
    });
    return ret;
};

OrderedElements.from = (obj) => {
    if (obj instanceof OrderedElements) {
        // NOTE(emily): This makes a shallow copy of the previous elements, so
        // if the elements are deeply modified it will affect all copies.
        return new OrderedElements({...obj.elements}, obj.keyOrder.slice());
    } else if (
        // For some reason, flow complains about a plain
        // `typeof Map !== "undefined"` check. Casting `Map` to `any` solves
        // the problem.
        typeof /*::(*/ Map /*: any)*/ !== "undefined" &&
        obj instanceof Map
    ) {
        return OrderedElements.fromMap(obj);
    } else {
        return OrderedElements.fromObject(obj);
    }
};
