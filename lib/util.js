// {K1: V1, K2: V2, ...} -> [[K1, V1], [K2, V2]]
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var objectToPairs = function objectToPairs(obj) {
  return Object.keys(obj).map(function (key) {
    return [key, obj[key]];
  });
};

exports.objectToPairs = objectToPairs;
// [[K1, V1], [K2, V2]] -> {K1: V1, K2: V2, ...}
var pairsToObject = function pairsToObject(pairs) {
  var result = {};
  pairs.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var key = _ref2[0];
    var val = _ref2[1];

    result[key] = val;
  });
  return result;
};

var mapObj = function mapObj(obj, fn) {
  return pairsToObject(objectToPairs(obj).map(fn));
};

exports.mapObj = mapObj;
// Flattens an array one level
// [[A], [B, C, [D]]] -> [A, B, C, [D]]
var flatten = function flatten(list) {
  return list.reduce(function (memo, x) {
    return memo.concat(x);
  }, []);
};

exports.flatten = flatten;
var flattenDeep = function flattenDeep(list) {
  return list.reduce(function (memo, x) {
    return memo.concat(Array.isArray(x) ? flattenDeep(x) : x);
  }, []);
};

exports.flattenDeep = flattenDeep;
var UPPERCASE_RE = /([A-Z])/g;
var MS_RE = /^ms-/;

var kebabify = function kebabify(string) {
  return string.replace(UPPERCASE_RE, '-$1').toLowerCase();
};
var kebabifyStyleName = function kebabifyStyleName(string) {
  return kebabify(string).replace(MS_RE, '-ms-');
};

exports.kebabifyStyleName = kebabifyStyleName;
var recursiveMerge = function recursiveMerge(a, b) {
  // TODO(jlfwong): Handle malformed input where a and b are not the same
  // type.

  if (typeof a !== 'object') {
    return b;
  }

  var ret = _extends({}, a);

  Object.keys(b).forEach(function (key) {
    if (ret.hasOwnProperty(key)) {
      ret[key] = recursiveMerge(a[key], b[key]);
    } else {
      ret[key] = b[key];
    }
  });

  return ret;
};

exports.recursiveMerge = recursiveMerge;
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
  strokeWidth: true
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
Object.keys(isUnitlessNumber).forEach(function (prop) {
  prefixes.forEach(function (prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
  });
});

var stringifyValue = function stringifyValue(key, prop) {
  return typeof prop !== "number" || isUnitlessNumber[key] || prop === 0 ? prop : prop + 'px';
};

exports.stringifyValue = stringifyValue;
/**
 * JS Implementation of MurmurHash2
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} str ASCII only
 * @return {string} Base 36 encoded hash result
 */
function murmurhash2_32_gc(str) {
  var l = str.length;
  var h = l;
  var i = 0;
  var k = undefined;

  while (l >= 4) {
    k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;

    k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    k ^= k >>> 24;
    k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);

    h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16) ^ k;

    l -= 4;
    ++i;
  }

  /* eslint-disable no-fallthrough */ // forgive existing code
  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      h ^= str.charCodeAt(i) & 0xff;
      h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
  }
  /* eslint-enable no-fallthrough */

  h ^= h >>> 13;
  h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
  h ^= h >>> 15;

  return (h >>> 0).toString(36);
}

// Hash a javascript object using JSON.stringify. This is very fast, about 3
// microseconds on my computer for a sample object:
// http://jsperf.com/test-hashfnv32a-hash/5
//
// Note that this uses JSON.stringify to stringify the objects so in order for
// this to produce consistent hashes browsers need to have a consistent
// ordering of objects. Ben Alpert says that Facebook depends on this, so we
// can probably depend on this too.
var hashObject = function hashObject(object) {
  return murmurhash2_32_gc(JSON.stringify(object));
};

exports.hashObject = hashObject;
var IMPORTANT_RE = /^([^:]+:.*?)( !important)?;$/;

// Given a single style rule string like "a: b;", adds !important to generate
// "a: b !important;".
var importantify = function importantify(string) {
  return string.replace(IMPORTANT_RE, function (_, base) {
    return base + " !important;";
  });
};

exports.importantify = importantify;
var getBrowserProperties = function getBrowserProperties() {
  if (!getBrowserProperties.availableStyles) {
    getBrowserProperties.availableStyles = {};
    var styles = Object.keys(window.getComputedStyle(document.documentElement, ''));
    for (var i = 0; i < styles.length; i++) {
      var style = styles[i];
      if (isNaN(Number(style))) {
        getBrowserProperties.availableStyles[style] = style;
      }
    }
  }
  return getBrowserProperties.availableStyles;
};

var stylePrefixes = ['Moz', 'webkit', 'ms', 'O'];
var getVendorPrefix = function getVendorPrefix(property) {
  var validProperties = getBrowserProperties();

  var validatedProp = validProperties[property];
  if (validatedProp) {
    return validatedProp;
  }
  var capitalProp = property[0].toUpperCase() + property.substr(1);
  for (var i = 0; i < stylePrefixes.length; i++) {
    var prefix = stylePrefixes[i];
    var prefixedProperty = '' + prefix + capitalProp;
    if (validProperties[prefixedProperty]) {
      // learn which styles the browser likes
      validProperties[validatedProp] = prefixedProperty;
      return prefixedProperty;
    }
  }
  // swallow the prop (eg -moz-osx-font-smoothing)
  return undefined;
};

var prefixLocally = function prefixLocally(declarations, useImportant) {
  var prefixedRules = [];
  var properties = Object.keys(declarations);
  var isDangerous = false;
  for (var i = 0; i < properties.length; i++) {
    var property = properties[i];
    var value = declarations[property];
    var stringValue = stringifyValue(property, value);
    var prefixedProperty = getVendorPrefix(property);
    if (!prefixedProperty) {
      isDangerous = true;
    }
    var camelProp = prefixedProperty || property;
    var ret = kebabifyStyleName(camelProp) + ':' + stringValue + ';';
    prefixedRules.push(useImportant === false ? ret : importantify(ret));
  }
  return { ruleString: prefixedRules.join(''), isDangerous: isDangerous };
};
exports.prefixLocally = prefixLocally;