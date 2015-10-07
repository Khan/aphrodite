// {K1: V1, K2: V2, ...} -> [[K1, V1], [K2, V2]]
const objectToPairs = (obj) => Object.keys(obj).map(key => [key, obj[key]]);

// [[K1, V1], [K2, V2]] -> {K1: V1, K2: V2, ...}
const pairsToObject = (pairs) => pairs.reduce((res, cur) => {
    return {
        ...res,
        [cur[0]]: cur[1]
    };
}, {});

const mapObj = (obj, fn) => pairsToObject(objectToPairs(obj).map(fn))

const UPPERCASE_RE = /([A-Z])/g;
const MS_RE = /^ms-/;

const kebabify = (string) => string.replace(UPPERCASE_RE, '-$1').toLowerCase();
const kebabifyStyleName = (string) => kebabify(string).replace(MS_RE, '-ms-');

// Return a monotonically increasing counter
const nextID = (function() {
    let x = 0;
    return () => {
        x += 1;
        return x;
    };
})();

const recursiveMerge = (a, b) => {
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

export default {
    mapObj,
    kebabifyStyleName,
    nextID,
    recursiveMerge,
    objectToPairs
};
