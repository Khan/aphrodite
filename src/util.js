/* @flow */
import stringHash from 'string-hash';

/* ::
type Pair = [ string, any ];
type Pairs = Pair[];
type PairsMapper = (pair: Pair) => Pair;
type ObjectMap = { [id:string]: any };
*/

// {K1: V1, K2: V2, ...} -> [[K1, V1], [K2, V2]]
export const objectToPairs = (obj /* : ObjectMap */) /* : Pairs */ => Object.keys(obj).map(key => [key, obj[key]]);

export const mapObj = (
    obj /* : ObjectMap */,
    fn /* : PairsMapper */
) /* : ObjectMap */ => {
    const keys = Object.keys(obj);
    const mappedObj = {};
    for (let i = 0; i < keys.length; i += 1) {
        const [newKey, newValue] = fn([keys[i], obj[keys[i]]]);
        mappedObj[newKey] = newValue;
    }
    return mappedObj;
}

// Flattens an array one level
// [[A], [B, C, [D]]] -> [A, B, C, [D]]
export const flatten = (list /* : any[] */) /* : any[] */ => list.reduce((memo, x) => memo.concat(x), []);

export const flattenDeep = (list /* : any[] */) /* : any[] */ =>
    list.reduce((memo, x) => memo.concat(Array.isArray(x) ? flattenDeep(x) : x), []);

const UPPERCASE_RE = /([A-Z])/g;
const UPPERCASE_RE_TO_KEBAB = (match /* : string */)  /* : string */ => `-${match.toLowerCase()}`;

export const kebabifyStyleName = (string /* : string */) /* : string */ => {
    const result = string.replace(UPPERCASE_RE, UPPERCASE_RE_TO_KEBAB);
    if (result[0] === 'm' && result[1] === 's' && result[2] === '-') {
        return `-${result}`;
    }
    return result;
};

const isNotObject = (
  x/* : ObjectMap | any */
) /* : boolean */ => typeof x !== 'object' || Array.isArray(x) || x === null;

export const recursiveMerge = (
    a /* : ObjectMap | any */,
    b /* : ObjectMap */
) /* : ObjectMap */ => {
    // TODO(jlfwong): Handle malformed input where a and b are not the same
    // type.

    if (isNotObject(a) || isNotObject(b)) {
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

/**
 * CSS properties which accept numbers but are not in units of "px".
 * Taken from React's CSSProperty.js
 */
var isUnitlessNumber = {
    animationIterationCount: true,
    borderImageOutset: true,
    borderImageSlice: true,
    borderImageWidth: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridRow: true,
    gridColumn: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,

    // SVG-related properties
    fillOpacity: true,
    floodOpacity: true,
    stopOpacity: true,
    strokeDasharray: true,
    strokeDashoffset: true,
    strokeMiterlimit: true,
    strokeOpacity: true,
    strokeWidth: true,
};

/**
 * Taken from React's CSSProperty.js
 *
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 * Taken from React's CSSProperty.js
 */
var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
// Taken from React's CSSProperty.js
Object.keys(isUnitlessNumber).forEach(function(prop) {
  prefixes.forEach(function(prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
  });
});

export const stringifyValue = (
    key /* : string */,
    prop /* : any */
) /* : string */ => {
    if (typeof prop === "number") {
        if (isUnitlessNumber[key]) {
            return "" + prop;
        } else {
            return prop + "px";
        }
    } else {
        return prop;
    }
};

// Hash a javascript object using JSON.stringify. This is very fast, about 3
// microseconds on my computer for a sample object:
// http://jsperf.com/test-hashfnv32a-hash/5
//
// Note that this uses JSON.stringify to stringify the objects so in order for
// this to produce consistent hashes browsers need to have a consistent
// ordering of objects. Ben Alpert says that Facebook depends on this, so we
// can probably depend on this too.
export const hashObject = (object /* : ObjectMap */) /* : string */ => stringHash(JSON.stringify(object)).toString(36);


// Given a single style value string like the "b" from "a: b;", adds !important
// to generate "b !important".
export const importantify = (string /* : string */) /* : string */ => (
    // Bracket string character access is very fast, and in the default case we
    // normally don't expect there to be "!important" at the end of the string
    // so we can use this simple check to take an optimized path. If there
    // happens to be a "!" in this position, we follow up with a more thorough
    // check.
    (string[string.length - 10] === '!' && string.slice(-11) === ' !important')
        ? string
        : `${string} !important`
);
