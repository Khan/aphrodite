// {K1: V1, K2: V2, ...} -> [[K1, V1], [K2, V2]]
export const objectToPairs = (obj) => Object.keys(obj).map(key => [key, obj[key]]);

// [[K1, V1], [K2, V2]] -> {K1: V1, K2: V2, ...}
const pairsToObject = (pairs) => {
    const result = {};
    pairs.forEach(([key, val]) => {
        result[key] = val;
    });
    return result;
};

export const mapObj = (obj, fn) => pairsToObject(objectToPairs(obj).map(fn))

const UPPERCASE_RE = /([A-Z])/g;
const MS_RE = /^ms-/;

const kebabify = (string) => string.replace(UPPERCASE_RE, '-$1').toLowerCase();
export const kebabifyStyleName = (string) => kebabify(string).replace(MS_RE, '-ms-');

// Return a monotonically increasing counter
export const nextID = (function() {
    let x = 0;
    return () => {
        x += 1;
        return x;
    };
})();

export const recursiveMerge = (a, b) => {
    // TODO(jlfwong): Handle malformed input where a and b are not the same
    // type.

    if (typeof a !== 'object') {
        return b;
    }

    const ret = {...a};

    Object.keys(b).forEach(key => {
        if (ret.hasOwnProperty(key)) {
            ret[key] = recursiveMerge(a[key], b[key]);
        } else {
            ret[key] = b[key];
        }
    });

    return ret;
};
