'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _inlineStylePrefixerStatic = require('inline-style-prefixer/static');

var _inlineStylePrefixerStatic2 = _interopRequireDefault(_inlineStylePrefixerStatic);

var _util = require('./util');

/**
 * Generate CSS for a selector and some styles.
 *
 * This function handles the media queries, pseudo selectors, and descendant
 * styles that can be used in aphrodite styles.
 *
 * @param {string} selector: A base CSS selector for the styles to be generated
 *     with.
 * @param {Object} styleTypes: A list of properties of the return type of
 *     StyleSheet.create, e.g. [styles.red, styles.blue].
 * @param stringHandlers: See `generateCSSRuleset`
 * @param useImportant: See `generateCSSRuleset`
 *
 * To actually generate the CSS special-construct-less styles are passed to
 * `generateCSSRuleset`.
 *
 * For instance, a call to
 *
 *     generateCSSInner(".foo", {
 *       color: "red",
 *       "@media screen": {
 *         height: 20,
 *         ":hover": {
 *           backgroundColor: "black"
 *         }
 *       },
 *       ":active": {
 *         fontWeight: "bold",
 *         ">>bar": {
 *           _names: { "foo_bar": true },
 *           height: 10,
 *         }
 *       }
 *     });
 *
 * will make 5 calls to `generateCSSRuleset`:
 *
 *     generateCSSRuleset(".foo", { color: "red" }, ...)
 *     generateCSSRuleset(".foo:active", { fontWeight: "bold" }, ...)
 *     generateCSSRuleset(".foo:active .foo_bar", { height: 10 }, ...)
 *     // These 2 will be wrapped in @media screen {}
 *     generateCSSRuleset(".foo", { height: 20 }, ...)
 *     generateCSSRuleset(".foo:hover", { backgroundColor: "black" }, ...)
 */
var generateCSS = function generateCSS(selector, styleTypes, stringHandlers, useImportant) {
  var merged = styleTypes.reduce(_util.recursiveMerge);
  var declarations = {};
  var mediaQueries = {};
  var pseudoStyles = {};

  Object.keys(merged).forEach(function (key) {
    if (key[0] === ':') {
      pseudoStyles[key] = merged[key];
    } else if (key[0] === '@') {
      mediaQueries[key] = merged[key];
    } else {
      declarations[key] = merged[key];
    }
  });
  var genericRules = generateCSSRuleset(selector, declarations, stringHandlers, useImportant);
  var pseudoRules = Object.keys(pseudoStyles).reduce(function (reduction, pseudoSelector) {
    var ruleset = generateCSS(selector + pseudoSelector, [pseudoStyles[pseudoSelector]], stringHandlers, useImportant);
    var safeSelectors = [':visited', ':focus', ':active', ':hover'];
    var safeRuleset = safeSelectors.includes(pseudoSelector) ? ruleset : ruleset.map(function (set) {
      return _extends({}, set, { isDangerous: true });
    });
    reduction.push.apply(reduction, _toConsumableArray(safeRuleset));
    return reduction;
  }, []);
  var mediaRules = Object.keys(mediaQueries).reduce(function (reduction, mediaQuery) {
    var ruleset = generateCSS(selector, [mediaQueries[mediaQuery]], stringHandlers, useImportant);
    var wrappedRuleset = ruleset.map(function (set) {
      return _extends({}, set, {
        rule: mediaQuery + '{' + set.rule + '}'
      });
    });
    reduction.push.apply(reduction, _toConsumableArray(wrappedRuleset));
    return reduction;
  }, []);
  return [].concat(_toConsumableArray(genericRules), _toConsumableArray(pseudoRules), _toConsumableArray(mediaRules));
};

exports.generateCSS = generateCSS;
/**
 * Helper method of generateCSSRuleset to facilitate custom handling of certain
 * CSS properties. Used for e.g. font families.
 *
 * See generateCSSRuleset for usage and documentation of paramater types.
 */
var runStringHandlers = function runStringHandlers(declarations, stringHandlers) {
  var result = {};

  Object.keys(declarations).forEach(function (key) {
    // If a handler exists for this particular key, let it interpret
    // that value first before continuing
    if (stringHandlers && stringHandlers.hasOwnProperty(key)) {
      result[key] = stringHandlers[key](declarations[key]);
    } else {
      result[key] = declarations[key];
    }
  });

  return result;
};

/**
 * Generate a CSS ruleset with the selector and containing the declarations.
 *
 * This function assumes that the given declarations don't contain any special
 * children (such as media queries, pseudo-selectors, or descendant styles).
 *
 * Note that this method does not deal with nesting used for e.g.
 * psuedo-selectors or media queries. That responsibility is left to  the
 * `generateCSS` function.
 *
 * @param {string} selector: the selector associated with the ruleset
 * @param {Object} declarations: a map from camelCased CSS property name to CSS
 *     property value.
 * @param {Object.<string, function>} stringHandlers: a map from camelCased CSS
 *     property name to a function which will map the given value to the value
 *     that is output.
 * @param {bool} useImportant: A boolean saying whether to append "!important"
 *     to each of the CSS declarations.
 * @returns {Array} Array with 0-to-1 objects: rule: A string of raw CSS, isDangerous: boolean
 *
 * Examples:
 *
 *    generateCSSRuleset(".blah", { color: "red" })
 *    -> ".blah{color: red !important;}"
 *    generateCSSRuleset(".blah", { color: "red" }, {}, false)
 *    -> ".blah{color: red}"
 *    generateCSSRuleset(".blah", { color: "red" }, {color: c => c.toUpperCase})
 *    -> ".blah{color: RED}"
 *    generateCSSRuleset(".blah:hover", { color: "red" })
 *    -> ".blah:hover{color: red}"
 */
var generateCSSRuleset = function generateCSSRuleset(selector, declarations, stringHandlers, useImportant) {
  var handledDeclarations = runStringHandlers(declarations, stringHandlers);

  var rules = undefined;
  if (typeof window === 'undefined') {
    // prefix all if we're on the server
    var prefixedDeclarations = (0, _inlineStylePrefixerStatic2['default'])(handledDeclarations);
    var prefixedRules = (0, _util.flatten)((0, _util.objectToPairs)(prefixedDeclarations).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var key = _ref2[0];
      var value = _ref2[1];

      if (Array.isArray(value)) {
        var _ret = (function () {
          // inline-style-prefix-all returns an array when there should be
          // multiple rules, we will flatten to single rules

          var prefixedValues = [];
          var unprefixedValues = [];

          value.forEach(function (v) {
            if (v.indexOf('-') === 0) {
              prefixedValues.push(v);
            } else {
              unprefixedValues.push(v);
            }
          });

          prefixedValues.sort();
          unprefixedValues.sort();

          return {
            v: prefixedValues.concat(unprefixedValues).map(function (v) {
              return [key, v];
            })
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
      return [[key, value]];
    }));
    var ruleString = prefixedRules.map(function (_ref3) {
      var _ref32 = _slicedToArray(_ref3, 2);

      var key = _ref32[0];
      var value = _ref32[1];

      var stringValue = (0, _util.stringifyValue)(key, value);
      var ret = (0, _util.kebabifyStyleName)(key) + ':' + stringValue + ';';
      return useImportant === false ? ret : (0, _util.importantify)(ret);
    }).join("");
    rules = { isDangerous: false, ruleString: ruleString };
  } else {
    rules = (0, _util.prefixLocally)(handledDeclarations, useImportant);
  }
  if (rules.ruleString) {
    return [{
      // make it easy to detect empty blocks later
      rule: selector + '{' + rules.ruleString + '}',
      // protect against pseudo elements like ::moz-input-placeholder
      isDangerous: rules.isDangerous
    }];
  } else {
    return [];
  }
};
exports.generateCSSRuleset = generateCSSRuleset;