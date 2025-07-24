(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.aphrodite = {}));
}(this, (function (exports) { 'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithoutHoles(r) {
    if (Array.isArray(r)) return _arrayLikeToArray(r);
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[r] = t, e;
  }
  function _iterableToArray(r) {
    if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _toConsumableArray(r) {
    return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  function hash(str) {
    var hash = 5381,
        i    = str.length;

    while(i) {
      hash = (hash * 33) ^ str.charCodeAt(--i);
    }

    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
     * integers. Since we want the results to be always positive, convert the
     * signed int to an unsigned by doing an unsigned bitshift. */
    return hash >>> 0;
  }

  var stringHash = hash;

  /* @flow */

  /* ::
  type ObjectMap = { [id:string]: any };
  */

  var UPPERCASE_RE = /([A-Z])/g;
  var UPPERCASE_RE_TO_KEBAB = function UPPERCASE_RE_TO_KEBAB(match /* : string */) {
    return "-".concat(match.toLowerCase());
  } /* : string */;
  var kebabifyStyleName = function kebabifyStyleName(string /* : string */) {
    var result = string.replace(UPPERCASE_RE, UPPERCASE_RE_TO_KEBAB);
    if (result[0] === 'm' && result[1] === 's' && result[2] === '-') {
      return "-".concat(result);
    }
    return result;
  } /* : string */;

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
  var stringifyValue = function stringifyValue(key /* : string */, prop /* : any */) {
    if (typeof prop === "number") {
      if (isUnitlessNumber[key]) {
        return "" + prop;
      } else {
        return prop + "px";
      }
    } else {
      return '' + prop;
    }
  } /* : string */;
  var stringifyAndImportantifyValue = function stringifyAndImportantifyValue(key /* : string */, prop /* : any */) {
    return importantify(stringifyValue(key, prop));
  } /* : string */;

  // Turn a string into a hash string of base-36 values (using letters and numbers)
  // eslint-disable-next-line no-unused-vars
  var hashString = function hashString(string /* : string */, key /* : ?string */) {
    return stringHash(string).toString(36);
  } /* string */;

  // Hash a javascript object using JSON.stringify. This is very fast, about 3
  // microseconds on my computer for a sample object:
  // http://jsperf.com/test-hashfnv32a-hash/5
  //
  // Note that this uses JSON.stringify to stringify the objects so in order for
  // this to produce consistent hashes browsers need to have a consistent
  // ordering of objects. Ben Alpert says that Facebook depends on this, so we
  // can probably depend on this too.
  var hashObject = function hashObject(object /* : ObjectMap */) {
    return hashString(JSON.stringify(object));
  } /* : string */;

  // Given a single style value string like the "b" from "a: b;", adds !important
  // to generate "b !important".
  var importantify = function importantify(string /* : string */) {
    return (
      // Bracket string character access is very fast, and in the default case we
      // normally don't expect there to be "!important" at the end of the string
      // so we can use this simple check to take an optimized path. If there
      // happens to be a "!" in this position, we follow up with a more thorough
      // check.
      string[string.length - 10] === '!' && string.slice(-11) === ' !important' ? string : "".concat(string, " !important")
    );
  } /* : string */;

  /* @flow */
  var MAP_EXISTS = typeof Map !== 'undefined';
  var OrderedElements = /*#__PURE__*/function () {
    /* ::
    elements: {[string]: any};
    keyOrder: string[];
    */

    function OrderedElements() {
      this.elements = {};
      this.keyOrder = [];
    }
    var _proto = OrderedElements.prototype;
    _proto.forEach = function forEach(callback /* : (string, any) => void */) {
      for (var i = 0; i < this.keyOrder.length; i++) {
        // (value, key) to match Map's API
        callback(this.elements[this.keyOrder[i]], this.keyOrder[i]);
      }
    };
    _proto.set = function set(key /* : string */, value /* : any */, shouldReorder /* : ?boolean */) {
      if (!this.elements.hasOwnProperty(key)) {
        this.keyOrder.push(key);
      } else if (shouldReorder) {
        var index = this.keyOrder.indexOf(key);
        this.keyOrder.splice(index, 1);
        this.keyOrder.push(key);
      }
      if (value == null) {
        this.elements[key] = value;
        return;
      }
      if (MAP_EXISTS && value instanceof Map || value instanceof OrderedElements) {
        // We have found a nested Map, so we need to recurse so that all
        // of the nested objects and Maps are merged properly.
        var nested = this.elements.hasOwnProperty(key) ? this.elements[key] : new OrderedElements();
        value.forEach(function (value, key) {
          nested.set(key, value, shouldReorder);
        });
        this.elements[key] = nested;
        return;
      }
      if (!Array.isArray(value) && _typeof(value) === 'object') {
        // We have found a nested object, so we need to recurse so that all
        // of the nested objects and Maps are merged properly.
        var _nested = this.elements.hasOwnProperty(key) ? this.elements[key] : new OrderedElements();
        var keys = Object.keys(value);
        for (var i = 0; i < keys.length; i += 1) {
          _nested.set(keys[i], value[keys[i]], shouldReorder);
        }
        this.elements[key] = _nested;
        return;
      }
      this.elements[key] = value;
    };
    _proto.get = function get(key /* : string */) /* : any */{
      return this.elements[key];
    };
    _proto.has = function has(key /* : string */) /* : boolean */{
      return this.elements.hasOwnProperty(key);
    };
    _proto.addStyleType = function addStyleType(styleType /* : any */) /* : void */{
      var _this = this;
      if (MAP_EXISTS && styleType instanceof Map || styleType instanceof OrderedElements) {
        styleType.forEach(function (value, key) {
          _this.set(key, value, true);
        });
      } else {
        var keys = Object.keys(styleType);
        for (var i = 0; i < keys.length; i++) {
          this.set(keys[i], styleType[keys[i]], true);
        }
      }
    };
    return OrderedElements;
  }();

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var capitalizeString_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = capitalizeString;
  function capitalizeString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  });

  unwrapExports(capitalizeString_1);

  var prefixProperty_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = prefixProperty;



  var _capitalizeString2 = _interopRequireDefault(capitalizeString_1);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function prefixProperty(prefixProperties, property, style) {
    var requiredPrefixes = prefixProperties[property];

    if (requiredPrefixes && style.hasOwnProperty(property)) {
      var capitalizedProperty = (0, _capitalizeString2.default)(property);

      for (var i = 0; i < requiredPrefixes.length; ++i) {
        var prefixedProperty = requiredPrefixes[i] + capitalizedProperty;

        if (!style[prefixedProperty]) {
          style[prefixedProperty] = style[property];
        }
      }
    }

    return style;
  }
  });

  unwrapExports(prefixProperty_1);

  var prefixValue_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = prefixValue;
  function prefixValue(plugins, property, value, style, metaData) {
    for (var i = 0, len = plugins.length; i < len; ++i) {
      var processedValue = plugins[i](property, value, style, metaData);

      // we can stop processing if a value is returned
      // as all plugin criteria are unique
      if (processedValue) {
        return processedValue;
      }
    }
  }
  });

  unwrapExports(prefixValue_1);

  var addNewValuesOnly_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = addNewValuesOnly;
  function addIfNew(list, value) {
    if (list.indexOf(value) === -1) {
      list.push(value);
    }
  }

  function addNewValuesOnly(list, values) {
    if (Array.isArray(values)) {
      for (var i = 0, len = values.length; i < len; ++i) {
        addIfNew(list, values[i]);
      }
    } else {
      addIfNew(list, values);
    }
  }
  });

  unwrapExports(addNewValuesOnly_1);

  var isObject_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = isObject;
  function isObject(value) {
    return value instanceof Object && !Array.isArray(value);
  }
  });

  unwrapExports(isObject_1);

  var createPrefixer_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = createPrefixer;



  var _prefixProperty2 = _interopRequireDefault(prefixProperty_1);



  var _prefixValue2 = _interopRequireDefault(prefixValue_1);



  var _addNewValuesOnly2 = _interopRequireDefault(addNewValuesOnly_1);



  var _isObject2 = _interopRequireDefault(isObject_1);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function createPrefixer(_ref) {
    var prefixMap = _ref.prefixMap,
        plugins = _ref.plugins;

    return function prefix(style) {
      for (var property in style) {
        var value = style[property];

        // handle nested objects
        if ((0, _isObject2.default)(value)) {
          style[property] = prefix(value);
          // handle array values
        } else if (Array.isArray(value)) {
          var combinedValue = [];

          for (var i = 0, len = value.length; i < len; ++i) {
            var processedValue = (0, _prefixValue2.default)(plugins, property, value[i], style, prefixMap);

            (0, _addNewValuesOnly2.default)(combinedValue, processedValue || value[i]);
          }

          // only modify the value if it was touched
          // by any plugin to prevent unnecessary mutations
          if (combinedValue.length > 0) {
            style[property] = combinedValue;
          }
        } else {
          var _processedValue = (0, _prefixValue2.default)(plugins, property, value, style, prefixMap);

          // only modify the value if it was touched
          // by any plugin to prevent unnecessary mutations
          if (_processedValue) {
            style[property] = _processedValue;
          }

          style = (0, _prefixProperty2.default)(prefixMap, property, style);
        }
      }

      return style;
    };
  }
  });

  var createPrefixer = unwrapExports(createPrefixer_1);

  function _typeof$1(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }

  function _toConsumableArray$1(arr) { return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _unsupportedIterableToArray$1(arr) || _nonIterableSpread$1(); }

  function _nonIterableSpread$1() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

  function _iterableToArray$1(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

  function _arrayWithoutHoles$1(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$1(arr); }

  function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function filterUniqueArray(arr) {
    return arr.filter(function (val, index) {
      return arr.lastIndexOf(val) === index;
    });
  }

  function assignStyle(base) {
    for (var i = 0, len = arguments.length <= 1 ? 0 : arguments.length - 1; i < len; ++i) {
      var style = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];

      for (var property in style) {
        var value = style[property];
        var baseValue = base[property];

        if (baseValue && value) {
          if (Array.isArray(baseValue)) {
            base[property] = filterUniqueArray(baseValue.concat(value));
            continue;
          }

          if (Array.isArray(value)) {
            base[property] = filterUniqueArray([baseValue].concat(_toConsumableArray$1(value)));
            continue;
          }

          if (_typeof$1(value) === 'object') {
            base[property] = assignStyle({}, baseValue, value);
            continue;
          }
        }

        base[property] = value;
      }
    }

    return base;
  }

  var DASH = /-([a-z])/g;
  var MS = /^Ms/g;
  var cache = {};

  function toUpper(match) {
    return match[1].toUpperCase();
  }

  function camelCaseProperty(property) {
    if (cache.hasOwnProperty(property)) {
      return cache[property];
    }

    var camelProp = property.replace(DASH, toUpper).replace(MS, 'ms');
    cache[property] = camelProp;
    return camelProp;
  }

  /* eslint-disable no-var, prefer-template */
  var uppercasePattern = /[A-Z]/g;
  var msPattern = /^ms-/;
  var cache$1 = {};

  function toHyphenLower(match) {
    return '-' + match.toLowerCase()
  }

  function hyphenateStyleName(name) {
    if (cache$1.hasOwnProperty(name)) {
      return cache$1[name]
    }

    var hName = name.replace(uppercasePattern, toHyphenLower);
    return (cache$1[name] = msPattern.test(hName) ? '-' + hName : hName)
  }

  function hyphenateProperty(property) {
    return hyphenateStyleName(property);
  }

  function cssifyDeclaration(property, value) {
    return hyphenateProperty(property) + ':' + value;
  }

  function cssifyObject(style) {
    var css = '';

    for (var property in style) {
      var value = style[property];

      if (typeof value !== 'string' && typeof value !== 'number') {
        continue;
      } // prevents the semicolon after
      // the last rule declaration


      if (css) {
        css += ';';
      }

      css += cssifyDeclaration(property, value);
    }

    return css;
  }

  var RE = /^(Webkit|Moz|O|ms)/;
  function isPrefixedProperty(property) {
    return RE.test(property);
  }

  var RE$1 = /-webkit-|-moz-|-ms-/;
  function isPrefixedValue(value) {
    return typeof value === 'string' && RE$1.test(value);
  }

  var unitlessProperties = {
    borderImageOutset: true,
    borderImageSlice: true,
    borderImageWidth: true,
    fontWeight: true,
    lineHeight: true,
    opacity: true,
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
  var prefixedUnitlessProperties = ['animationIterationCount', 'boxFlex', 'boxFlexGroup', 'boxOrdinalGroup', 'columnCount', 'flex', 'flexGrow', 'flexPositive', 'flexShrink', 'flexNegative', 'flexOrder', 'gridColumn', 'gridColumnEnd', 'gridColumnStart', 'gridRow', 'gridRowEnd', 'gridRowStart', 'lineClamp', 'order'];
  var prefixes$1 = ['Webkit', 'ms', 'Moz', 'O'];

  function getPrefixedProperty(prefix, property) {
    return prefix + property.charAt(0).toUpperCase() + property.slice(1);
  } // add all prefixed properties to the unitless properties


  for (var i = 0, len = prefixedUnitlessProperties.length; i < len; ++i) {
    var property = prefixedUnitlessProperties[i];
    unitlessProperties[property] = true;

    for (var j = 0, jLen = prefixes$1.length; j < jLen; ++j) {
      unitlessProperties[getPrefixedProperty(prefixes$1[j], property)] = true;
    }
  } // add all hypenated properties as well


  for (var _property in unitlessProperties) {
    unitlessProperties[hyphenateProperty(_property)] = true;
  }

  function isUnitlessProperty(property) {
    return unitlessProperties.hasOwnProperty(property);
  }

  var RE$2 = /^(ms|Webkit|Moz|O)/;
  function unprefixProperty(property) {
    var propertyWithoutPrefix = property.replace(RE$2, '');
    return propertyWithoutPrefix.charAt(0).toLowerCase() + propertyWithoutPrefix.slice(1);
  }

  function normalizeProperty(property) {
    return unprefixProperty(camelCaseProperty(property));
  }

  function resolveArrayValue(property, value) {
    return value.join(';' + hyphenateProperty(property) + ':');
  }

  var RE$3 = /(-ms-|-webkit-|-moz-|-o-)/g;
  function unprefixValue(value) {
    if (typeof value === 'string') {
      return value.replace(RE$3, '');
    }

    return value;
  }



  var es = /*#__PURE__*/Object.freeze({
    __proto__: null,
    assignStyle: assignStyle,
    camelCaseProperty: camelCaseProperty,
    cssifyDeclaration: cssifyDeclaration,
    cssifyObject: cssifyObject,
    hyphenateProperty: hyphenateProperty,
    isPrefixedProperty: isPrefixedProperty,
    isPrefixedValue: isPrefixedValue,
    isUnitlessProperty: isUnitlessProperty,
    normalizeProperty: normalizeProperty,
    resolveArrayValue: resolveArrayValue,
    unprefixProperty: unprefixProperty,
    unprefixValue: unprefixValue
  });

  var calc_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = calc;



  var CALC_REGEX = /calc\(/g;
  var prefixes = ['-webkit-', '-moz-', ''];

  function calc(property, value) {
    if (typeof value === 'string' && !(0, es.isPrefixedValue)(value) && value.indexOf('calc(') !== -1) {
      return prefixes.map(function (prefix) {
        return value.replace(CALC_REGEX, prefix + 'calc(');
      });
    }
  }
  });

  var calc = unwrapExports(calc_1);

  var crossFade_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = crossFade;



  var CROSS_FADE_REGEX = /cross-fade\(/g;
  // http://caniuse.com/#search=cross-fade
  var prefixes = ['-webkit-', ''];

  function crossFade(property, value) {
    if (typeof value === 'string' && !(0, es.isPrefixedValue)(value) && value.indexOf('cross-fade(') !== -1) {
      return prefixes.map(function (prefix) {
        return value.replace(CROSS_FADE_REGEX, prefix + 'cross-fade(');
      });
    }
  }
  });

  var crossFade = unwrapExports(crossFade_1);

  var cursor_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = cursor;
  var prefixes = ['-webkit-', '-moz-', ''];

  var values = {
    'zoom-in': true,
    'zoom-out': true,
    grab: true,
    grabbing: true
  };

  function cursor(property, value) {
    if (property === 'cursor' && values.hasOwnProperty(value)) {
      return prefixes.map(function (prefix) {
        return prefix + value;
      });
    }
  }
  });

  var cursor = unwrapExports(cursor_1);

  var filter_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = filter;



  var FILTER_REGEX = /filter\(/g;
  // http://caniuse.com/#feat=css-filter-function
  var prefixes = ['-webkit-', ''];

  function filter(property, value) {
    if (typeof value === 'string' && !(0, es.isPrefixedValue)(value) && value.indexOf('filter(') !== -1) {
      return prefixes.map(function (prefix) {
        return value.replace(FILTER_REGEX, prefix + 'filter(');
      });
    }
  }
  });

  var filter = unwrapExports(filter_1);

  var flex_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = flex;
  var values = {
    flex: ['-webkit-box', '-moz-box', '-ms-flexbox', '-webkit-flex', 'flex'],
    'inline-flex': ['-webkit-inline-box', '-moz-inline-box', '-ms-inline-flexbox', '-webkit-inline-flex', 'inline-flex']
  };

  function flex(property, value) {
    if (property === 'display' && values.hasOwnProperty(value)) {
      return values[value];
    }
  }
  });

  var flex = unwrapExports(flex_1);

  var flexboxIE_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = flexboxIE;
  var alternativeValues = {
    'space-around': 'distribute',
    'space-between': 'justify',
    'flex-start': 'start',
    'flex-end': 'end'
  };
  var alternativeProps = {
    alignContent: 'msFlexLinePack',
    alignSelf: 'msFlexItemAlign',
    alignItems: 'msFlexAlign',
    justifyContent: 'msFlexPack',
    order: 'msFlexOrder',
    flexGrow: 'msFlexPositive',
    flexShrink: 'msFlexNegative',
    flexBasis: 'msFlexPreferredSize'

    // Full expanded syntax is flex-grow | flex-shrink | flex-basis.
  };var flexShorthandMappings = {
    auto: '1 1 auto',
    inherit: 'inherit',
    initial: '0 1 auto',
    none: '0 0 auto',
    unset: 'unset'
  };
  var isUnitlessNumber = /^\d+(\.\d+)?$/;
  var logTag = 'inline-style-prefixer.flexboxIE plugin';

  function flexboxIE(property, value, style) {
    if (alternativeProps.hasOwnProperty(property)) {
      style[alternativeProps[property]] = alternativeValues[value] || value;
    }

    if (property === 'flex') {
      // For certain values we can do straight mappings based on the spec
      // for the expansions.
      if (Object.prototype.hasOwnProperty.call(flexShorthandMappings, value)) {
        style.msFlex = flexShorthandMappings[value];
        return;
      }
      // Here we have no direct mapping, so we favor looking for a
      // unitless positive number as that will be the most common use-case.
      if (isUnitlessNumber.test(value)) {
        style.msFlex = value + ' 1 0%';
        return;
      }

      if (typeof value === 'number' && value < 0) {
        // ignore negative values;
        console.warn(logTag + ': "flex: ' + value + '", negative values are not valid and will be ignored.');
        return;
      }

      if (!value.split) {
        console.warn(logTag + ': "flex: ' + value + '", value format are not detected, it will be remain as is');
        style.msFlex = value;
        return;
      }

      // The next thing we can look for is if there are multiple values.
      var flexValues = value.split(/\s/);
      // If we only have a single value that wasn't a positive unitless
      // or a pre-mapped value, then we can assume it is a unit value.
      switch (flexValues.length) {
        case 1:
          style.msFlex = '1 1 ' + value;
          return;
        case 2:
          // If we have 2 units, then we expect that the first will
          // always be a unitless number and represents flex-grow.
          // The second unit will represent flex-shrink for a unitless
          // value, or flex-basis otherwise.
          if (isUnitlessNumber.test(flexValues[1])) {
            style.msFlex = flexValues[0] + ' ' + flexValues[1] + ' 0%';
          } else {
            style.msFlex = flexValues[0] + ' 1 ' + flexValues[1];
          }
          return;
        default:
          style.msFlex = value;
      }
    }
  }
  });

  var flexboxIE = unwrapExports(flexboxIE_1);

  var flexboxOld_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = flexboxOld;
  var alternativeValues = {
    'space-around': 'justify',
    'space-between': 'justify',
    'flex-start': 'start',
    'flex-end': 'end',
    'wrap-reverse': 'multiple',
    wrap: 'multiple'
  };

  var alternativeProps = {
    alignItems: 'WebkitBoxAlign',
    justifyContent: 'WebkitBoxPack',
    flexWrap: 'WebkitBoxLines',
    flexGrow: 'WebkitBoxFlex'
  };

  function flexboxOld(property, value, style) {
    if (property === 'flexDirection' && typeof value === 'string') {
      if (value.indexOf('column') > -1) {
        style.WebkitBoxOrient = 'vertical';
      } else {
        style.WebkitBoxOrient = 'horizontal';
      }
      if (value.indexOf('reverse') > -1) {
        style.WebkitBoxDirection = 'reverse';
      } else {
        style.WebkitBoxDirection = 'normal';
      }
    }
    if (alternativeProps.hasOwnProperty(property)) {
      style[alternativeProps[property]] = alternativeValues[value] || value;
    }
  }
  });

  var flexboxOld = unwrapExports(flexboxOld_1);

  var isPrefixedValue_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports["default"] = isPrefixedValue;
  var RE = /-webkit-|-moz-|-ms-/;

  function isPrefixedValue(value) {
    return typeof value === 'string' && RE.test(value);
  }
  });

  unwrapExports(isPrefixedValue_1);

  var gradient_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = gradient;



  var _isPrefixedValue2 = _interopRequireDefault(isPrefixedValue_1);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var prefixes = ['-webkit-', '-moz-', ''];
  var values = /linear-gradient|radial-gradient|repeating-linear-gradient|repeating-radial-gradient/gi;

  function gradient(property, value) {
    if (typeof value === 'string' && !(0, _isPrefixedValue2.default)(value) && values.test(value)) {
      return prefixes.map(function (prefix) {
        return value.replace(values, function (grad) {
          return prefix + grad;
        });
      });
    }
  }
  });

  var gradient = unwrapExports(gradient_1);

  var grid_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

  exports.default = grid;
  function isSimplePositionValue(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  function isComplexSpanValue(value) {
    return typeof value === 'string' && value.includes('/');
  }

  var alignmentValues = ['center', 'end', 'start', 'stretch'];

  var displayValues = {
    'inline-grid': ['-ms-inline-grid', 'inline-grid'],
    grid: ['-ms-grid', 'grid']
  };

  var propertyConverters = {
    alignSelf: function alignSelf(value, style) {
      if (alignmentValues.indexOf(value) > -1) {
        style.msGridRowAlign = value;
      }
    },

    gridColumn: function gridColumn(value, style) {
      if (isSimplePositionValue(value)) {
        style.msGridColumn = value;
      } else if (isComplexSpanValue(value)) {
        var _value$split = value.split('/'),
            _value$split2 = _slicedToArray(_value$split, 2),
            start = _value$split2[0],
            end = _value$split2[1];

        propertyConverters.gridColumnStart(+start, style);

        var _end$split = end.split(/ ?span /),
            _end$split2 = _slicedToArray(_end$split, 2),
            maybeSpan = _end$split2[0],
            maybeNumber = _end$split2[1];

        if (maybeSpan === '') {
          propertyConverters.gridColumnEnd(+start + +maybeNumber, style);
        } else {
          propertyConverters.gridColumnEnd(+end, style);
        }
      } else {
        propertyConverters.gridColumnStart(value, style);
      }
    },

    gridColumnEnd: function gridColumnEnd(value, style) {
      var msGridColumn = style.msGridColumn;

      if (isSimplePositionValue(value) && isSimplePositionValue(msGridColumn)) {
        style.msGridColumnSpan = value - msGridColumn;
      }
    },

    gridColumnStart: function gridColumnStart(value, style) {
      if (isSimplePositionValue(value)) {
        style.msGridColumn = value;
      }
    },

    gridRow: function gridRow(value, style) {
      if (isSimplePositionValue(value)) {
        style.msGridRow = value;
      } else if (isComplexSpanValue(value)) {
        var _value$split3 = value.split('/'),
            _value$split4 = _slicedToArray(_value$split3, 2),
            start = _value$split4[0],
            end = _value$split4[1];

        propertyConverters.gridRowStart(+start, style);

        var _end$split3 = end.split(/ ?span /),
            _end$split4 = _slicedToArray(_end$split3, 2),
            maybeSpan = _end$split4[0],
            maybeNumber = _end$split4[1];

        if (maybeSpan === '') {
          propertyConverters.gridRowEnd(+start + +maybeNumber, style);
        } else {
          propertyConverters.gridRowEnd(+end, style);
        }
      } else {
        propertyConverters.gridRowStart(value, style);
      }
    },

    gridRowEnd: function gridRowEnd(value, style) {
      var msGridRow = style.msGridRow;

      if (isSimplePositionValue(value) && isSimplePositionValue(msGridRow)) {
        style.msGridRowSpan = value - msGridRow;
      }
    },

    gridRowStart: function gridRowStart(value, style) {
      if (isSimplePositionValue(value)) {
        style.msGridRow = value;
      }
    },

    gridTemplateColumns: function gridTemplateColumns(value, style) {
      style.msGridColumns = value;
    },

    gridTemplateRows: function gridTemplateRows(value, style) {
      style.msGridRows = value;
    },

    justifySelf: function justifySelf(value, style) {
      if (alignmentValues.indexOf(value) > -1) {
        style.msGridColumnAlign = value;
      }
    }
  };

  function grid(property, value, style) {
    if (property === 'display' && value in displayValues) {
      return displayValues[value];
    }

    if (property in propertyConverters) {
      var propertyConverter = propertyConverters[property];
      propertyConverter(value, style);
    }
  }
  });

  var grid = unwrapExports(grid_1);

  var imageSet_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = imageSet;



  var _isPrefixedValue2 = _interopRequireDefault(isPrefixedValue_1);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // http://caniuse.com/#feat=css-image-set
  var prefixes = ['-webkit-', ''];

  function imageSet(property, value) {
    if (typeof value === 'string' && !(0, _isPrefixedValue2.default)(value) && value.indexOf('image-set(') > -1) {
      return prefixes.map(function (prefix) {
        return value.replace(/image-set\(/g, prefix + 'image-set(');
      });
    }
  }
  });

  var imageSet = unwrapExports(imageSet_1);

  var logical_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = logical;
  var alternativeProps = {
    marginBlockStart: ['WebkitMarginBefore'],
    marginBlockEnd: ['WebkitMarginAfter'],
    marginInlineStart: ['WebkitMarginStart', 'MozMarginStart'],
    marginInlineEnd: ['WebkitMarginEnd', 'MozMarginEnd'],
    paddingBlockStart: ['WebkitPaddingBefore'],
    paddingBlockEnd: ['WebkitPaddingAfter'],
    paddingInlineStart: ['WebkitPaddingStart', 'MozPaddingStart'],
    paddingInlineEnd: ['WebkitPaddingEnd', 'MozPaddingEnd'],
    borderBlockStart: ['WebkitBorderBefore'],
    borderBlockStartColor: ['WebkitBorderBeforeColor'],
    borderBlockStartStyle: ['WebkitBorderBeforeStyle'],
    borderBlockStartWidth: ['WebkitBorderBeforeWidth'],
    borderBlockEnd: ['WebkitBorderAfter'],
    borderBlockEndColor: ['WebkitBorderAfterColor'],
    borderBlockEndStyle: ['WebkitBorderAfterStyle'],
    borderBlockEndWidth: ['WebkitBorderAfterWidth'],
    borderInlineStart: ['WebkitBorderStart', 'MozBorderStart'],
    borderInlineStartColor: ['WebkitBorderStartColor', 'MozBorderStartColor'],
    borderInlineStartStyle: ['WebkitBorderStartStyle', 'MozBorderStartStyle'],
    borderInlineStartWidth: ['WebkitBorderStartWidth', 'MozBorderStartWidth'],
    borderInlineEnd: ['WebkitBorderEnd', 'MozBorderEnd'],
    borderInlineEndColor: ['WebkitBorderEndColor', 'MozBorderEndColor'],
    borderInlineEndStyle: ['WebkitBorderEndStyle', 'MozBorderEndStyle'],
    borderInlineEndWidth: ['WebkitBorderEndWidth', 'MozBorderEndWidth']
  };

  function logical(property, value, style) {
    if (Object.prototype.hasOwnProperty.call(alternativeProps, property)) {
      var alternativePropList = alternativeProps[property];
      for (var i = 0, len = alternativePropList.length; i < len; ++i) {
        style[alternativePropList[i]] = value;
      }
    }
  }
  });

  var logical = unwrapExports(logical_1);

  var position_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = position;
  function position(property, value) {
    if (property === 'position' && value === 'sticky') {
      return ['-webkit-sticky', 'sticky'];
    }
  }
  });

  var position = unwrapExports(position_1);

  var sizing_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = sizing;
  var prefixes = ['-webkit-', '-moz-', ''];

  var properties = {
    maxHeight: true,
    maxWidth: true,
    width: true,
    height: true,
    columnWidth: true,
    minWidth: true,
    minHeight: true
  };
  var values = {
    'min-content': true,
    'max-content': true,
    'fill-available': true,
    'fit-content': true,
    'contain-floats': true
  };

  function sizing(property, value) {
    if (properties.hasOwnProperty(property) && values.hasOwnProperty(value)) {
      return prefixes.map(function (prefix) {
        return prefix + value;
      });
    }
  }
  });

  var sizing = unwrapExports(sizing_1);

  var hyphenateProperty_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports["default"] = hyphenateProperty;



  var _hyphenateStyleName2 = _interopRequireDefault(hyphenateStyleName);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  function hyphenateProperty(property) {
    return (0, _hyphenateStyleName2["default"])(property);
  }
  });

  unwrapExports(hyphenateProperty_1);

  var transition_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = transition;



  var _hyphenateProperty2 = _interopRequireDefault(hyphenateProperty_1);



  var _isPrefixedValue2 = _interopRequireDefault(isPrefixedValue_1);



  var _capitalizeString2 = _interopRequireDefault(capitalizeString_1);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var properties = {
    transition: true,
    transitionProperty: true,
    WebkitTransition: true,
    WebkitTransitionProperty: true,
    MozTransition: true,
    MozTransitionProperty: true
  };

  var prefixMapping = {
    Webkit: '-webkit-',
    Moz: '-moz-',
    ms: '-ms-'
  };

  function prefixValue(value, propertyPrefixMap) {
    if ((0, _isPrefixedValue2.default)(value)) {
      return value;
    }

    // only split multi values, not cubic beziers
    var multipleValues = value.split(/,(?![^()]*(?:\([^()]*\))?\))/g);

    for (var i = 0, len = multipleValues.length; i < len; ++i) {
      var singleValue = multipleValues[i];
      var values = [singleValue];
      for (var property in propertyPrefixMap) {
        var dashCaseProperty = (0, _hyphenateProperty2.default)(property);

        if (singleValue.indexOf(dashCaseProperty) > -1 && dashCaseProperty !== 'order') {
          var prefixes = propertyPrefixMap[property];
          for (var j = 0, pLen = prefixes.length; j < pLen; ++j) {
            // join all prefixes and create a new value
            values.unshift(singleValue.replace(dashCaseProperty, prefixMapping[prefixes[j]] + dashCaseProperty));
          }
        }
      }

      multipleValues[i] = values.join(',');
    }

    return multipleValues.join(',');
  }

  function transition(property, value, style, propertyPrefixMap) {
    // also check for already prefixed transitions
    if (typeof value === 'string' && properties.hasOwnProperty(property)) {
      var outputValue = prefixValue(value, propertyPrefixMap);
      // if the property is already prefixed
      var webkitOutput = outputValue.split(/,(?![^()]*(?:\([^()]*\))?\))/g).filter(function (val) {
        return !/-moz-|-ms-/.test(val);
      }).join(',');

      if (property.indexOf('Webkit') > -1) {
        return webkitOutput;
      }

      var mozOutput = outputValue.split(/,(?![^()]*(?:\([^()]*\))?\))/g).filter(function (val) {
        return !/-webkit-|-ms-/.test(val);
      }).join(',');

      if (property.indexOf('Moz') > -1) {
        return mozOutput;
      }

      style['Webkit' + (0, _capitalizeString2.default)(property)] = webkitOutput;
      style['Moz' + (0, _capitalizeString2.default)(property)] = mozOutput;
      return outputValue;
    }
  }
  });

  var transition = unwrapExports(transition_1);

  var w = ["Webkit"];
  var m = ["Moz"];
  var ms = ["ms"];
  var wm = ["Webkit", "Moz"];
  var wms = ["Webkit", "ms"];
  var wmms = ["Webkit", "Moz", "ms"];
  var staticData = {
    plugins: [calc, crossFade, cursor, filter, flex, flexboxIE, flexboxOld, gradient, grid, imageSet, logical, position, sizing, transition],
    prefixMap: {
      "transform": w,
      "transformOrigin": w,
      "transformOriginX": w,
      "transformOriginY": w,
      "backfaceVisibility": w,
      "perspective": w,
      "perspectiveOrigin": w,
      "transformStyle": w,
      "transformOriginZ": w,
      "animation": w,
      "animationDelay": w,
      "animationDirection": w,
      "animationFillMode": w,
      "animationDuration": w,
      "animationIterationCount": w,
      "animationName": w,
      "animationPlayState": w,
      "animationTimingFunction": w,
      "appearance": wmms,
      "userSelect": wmms,
      "fontKerning": w,
      "textEmphasisPosition": wms,
      "textEmphasis": wms,
      "textEmphasisStyle": wms,
      "textEmphasisColor": wms,
      "boxDecorationBreak": wms,
      "clipPath": w,
      "maskImage": wms,
      "maskMode": wms,
      "maskRepeat": wms,
      "maskPosition": wms,
      "maskClip": wms,
      "maskOrigin": wms,
      "maskSize": wms,
      "maskComposite": wms,
      "mask": wms,
      "maskBorderSource": wms,
      "maskBorderMode": wms,
      "maskBorderSlice": wms,
      "maskBorderWidth": wms,
      "maskBorderOutset": wms,
      "maskBorderRepeat": wms,
      "maskBorder": wms,
      "maskType": wms,
      "textDecorationStyle": wm,
      "textDecorationSkip": wm,
      "textDecorationLine": wm,
      "textDecorationColor": wm,
      "filter": w,
      "fontFeatureSettings": wm,
      "breakAfter": wmms,
      "breakBefore": wmms,
      "breakInside": wmms,
      "columnCount": wm,
      "columnFill": wm,
      "columnGap": wm,
      "columnRule": wm,
      "columnRuleColor": wm,
      "columnRuleStyle": wm,
      "columnRuleWidth": wm,
      "columns": wm,
      "columnSpan": wm,
      "columnWidth": wm,
      "writingMode": w,
      "flex": w,
      "flexBasis": w,
      "flexDirection": w,
      "flexGrow": w,
      "flexFlow": w,
      "flexShrink": w,
      "flexWrap": w,
      "alignContent": w,
      "alignItems": w,
      "alignSelf": w,
      "justifyContent": w,
      "order": w,
      "transitionDelay": w,
      "transitionDuration": w,
      "transitionProperty": w,
      "transitionTimingFunction": w,
      "backdropFilter": w,
      "scrollSnapType": wms,
      "scrollSnapPointsX": wms,
      "scrollSnapPointsY": wms,
      "scrollSnapDestination": wms,
      "scrollSnapCoordinate": wms,
      "shapeImageThreshold": w,
      "shapeImageMargin": w,
      "shapeImageOutside": w,
      "hyphens": wmms,
      "flowInto": wms,
      "flowFrom": wms,
      "regionFragment": wms,
      "textOrientation": w,
      "boxSizing": m,
      "textAlignLast": m,
      "tabSize": m,
      "wrapFlow": ms,
      "wrapThrough": ms,
      "wrapMargin": ms,
      "textSizeAdjust": ["ms", "Webkit"],
      "borderImage": w,
      "borderImageOutset": w,
      "borderImageRepeat": w,
      "borderImageSlice": w,
      "borderImageSource": w,
      "borderImageWidth": w
    }
  };

  var prefixAll = createPrefixer(staticData);

  /* ::
  import type { SheetDefinition } from './index.js';
  type StringHandlers = { [id:string]: Function };
  type SelectorCallback = (selector: string) => string[];
  export type SelectorHandler = (
      selector: string,
      baseSelector: string,
      callback: SelectorCallback
  ) => string[] | string | null;
  */

  /**
   * `selectorHandlers` are functions which handle special selectors which act
   * differently than normal style definitions. These functions look at the
   * current selector and can generate CSS for the styles in their subtree by
   * calling the callback with a new selector.
   *
   * For example, when generating styles with a base selector of '.foo' and the
   * following styles object:
   *
   *   {
   *     ':nth-child(2n)': {
   *       ':hover': {
   *         color: 'red'
   *       }
   *     }
   *   }
   *
   * when we reach the ':hover' style, we would call our selector handlers like
   *
   *   handler(':hover', '.foo:nth-child(2n)', callback)
   *
   * Since our `pseudoSelectors` handles ':hover' styles, that handler would call
   * the callback like
   *
   *   callback('.foo:nth-child(2n):hover')
   *
   * to generate its subtree `{ color: 'red' }` styles with a
   * '.foo:nth-child(2n):hover' selector. The callback would return an array of CSS
   * rules like
   *
   *   ['.foo:nth-child(2n):hover{color:red !important;}']
   *
   * and the handler would then return that resulting CSS.
   *
   * `defaultSelectorHandlers` is the list of default handlers used in a call to
   * `generateCSS`.
   *
   * @name SelectorHandler
   * @function
   * @param {string} selector: The currently inspected selector. ':hover' in the
   *     example above.
   * @param {string} baseSelector: The selector of the parent styles.
   *     '.foo:nth-child(2n)' in the example above.
   * @param {function} generateSubtreeStyles: A function which can be called to
   *     generate CSS for the subtree of styles corresponding to the selector.
   *     Accepts a new baseSelector to use for generating those styles.
   * @returns {string[] | string | null} The generated CSS for this selector, or
   *     null if we don't handle this selector.
   */
  var defaultSelectorHandlers /* : SelectorHandler[] */ = [
  // Handle pseudo-selectors, like :hover and :nth-child(3n)
  function pseudoSelectors(selector, baseSelector, generateSubtreeStyles) {
    if (selector[0] !== ":") {
      return null;
    }
    return generateSubtreeStyles(baseSelector + selector);
  },
  // Handle media queries (or font-faces)
  function mediaQueries(selector, baseSelector, generateSubtreeStyles) {
    if (selector[0] !== "@") {
      return null;
    }
    // Generate the styles normally, and then wrap them in the media query.
    var generated = generateSubtreeStyles(baseSelector);
    return ["".concat(selector, "{").concat(generated.join(''), "}")];
  }];

  /**
   * Generate CSS for a selector and some styles.
   *
   * This function handles the media queries and pseudo selectors that can be used
   * in aphrodite styles.
   *
   * @param {string} selector: A base CSS selector for the styles to be generated
   *     with.
   * @param {Object} styleTypes: A list of properties of the return type of
   *     StyleSheet.create, e.g. [styles.red, styles.blue].
   * @param {Array.<SelectorHandler>} selectorHandlers: A list of selector
   *     handlers to use for handling special selectors. See
   *     `defaultSelectorHandlers`.
   * @param stringHandlers: See `generateCSSRuleset`
   * @param useImportant: See `generateCSSRuleset`
   *
   * To actually generate the CSS special-construct-less styles are passed to
   * `generateCSSRuleset`.
   *
   * For instance, a call to
   *
   *     generateCSS(".foo", [{
   *       color: "red",
   *       "@media screen": {
   *         height: 20,
   *         ":hover": {
   *           backgroundColor: "black"
   *         }
   *       },
   *       ":active": {
   *         fontWeight: "bold"
   *       }
   *     }], defaultSelectorHandlers);
   *
   * with the default `selectorHandlers` will make 5 calls to
   * `generateCSSRuleset`:
   *
   *     generateCSSRuleset(".foo", { color: "red" }, ...)
   *     generateCSSRuleset(".foo:active", { fontWeight: "bold" }, ...)
   *     // These 2 will be wrapped in @media screen {}
   *     generateCSSRuleset(".foo", { height: 20 }, ...)
   *     generateCSSRuleset(".foo:hover", { backgroundColor: "black" }, ...)
   */
  var _generateCSS = function generateCSS(selector /* : string */, styleTypes /* : SheetDefinition[] */, selectorHandlers /* : SelectorHandler[] */, stringHandlers /* : StringHandlers */, useImportant /* : boolean */) {
    var merged = new OrderedElements();
    for (var i = 0; i < styleTypes.length; i++) {
      merged.addStyleType(styleTypes[i]);
    }
    var plainDeclarations = new OrderedElements();
    var generatedStyles = [];

    // TODO(emily): benchmark this to see if a plain for loop would be faster.
    merged.forEach(function (val, key) {
      // For each key, see if one of the selector handlers will handle these
      // styles.
      var foundHandler = selectorHandlers.some(function (handler) {
        var result = handler(key, selector, function (newSelector) {
          return _generateCSS(newSelector, [val], selectorHandlers, stringHandlers, useImportant);
        });
        if (result != null) {
          // If the handler returned something, add it to the generated
          // CSS and stop looking for another handler.
          if (Array.isArray(result)) {
            generatedStyles.push.apply(generatedStyles, _toConsumableArray(result));
          } else {
            // eslint-disable-next-line
            console.warn('WARNING: Selector handlers should return an array of rules.' + 'Returning a string containing multiple rules is deprecated.', handler);
            generatedStyles.push("@media all {".concat(result, "}"));
          }
          return true;
        }
      });
      // If none of the handlers handled it, add it to the list of plain
      // style declarations.
      if (!foundHandler) {
        plainDeclarations.set(key, val, true);
      }
    });
    var generatedRuleset = generateCSSRuleset(selector, plainDeclarations, stringHandlers, useImportant, selectorHandlers);
    if (generatedRuleset) {
      generatedStyles.unshift(generatedRuleset);
    }
    return generatedStyles;
  } /* : string[] */;
  var runStringHandlers = function runStringHandlers(declarations /* : OrderedElements */, stringHandlers /* : StringHandlers */, selectorHandlers /* : SelectorHandler[] */) {
    if (!stringHandlers) {
      return;
    }
    var stringHandlerKeys = Object.keys(stringHandlers);
    for (var i = 0; i < stringHandlerKeys.length; i++) {
      var key = stringHandlerKeys[i];
      if (declarations.has(key)) {
        // A declaration exists for this particular string handler, so we
        // need to let the string handler interpret the declaration first
        // before proceeding.
        //
        // TODO(emily): Pass in a callback which generates CSS, similar to
        // how our selector handlers work, instead of passing in
        // `selectorHandlers` and have them make calls to `generateCSS`
        // themselves. Right now, this is impractical because our string
        // handlers are very specialized and do complex things.
        declarations.set(key, stringHandlers[key](declarations.get(key), selectorHandlers),
        // Preserve order here, since we are really replacing an
        // unprocessed style with a processed style, not overriding an
        // earlier style
        false);
      }
    }
  } /* : void */;
  var transformRule = function transformRule(key /* : string */, value /* : string */, transformValue /* : function */) {
    return "".concat(kebabifyStyleName(key), ":").concat(transformValue(key, value), ";");
  } /* : string */;
  var arrayToObjectKeysReducer = function arrayToObjectKeysReducer(acc, val) {
    acc[val] = true;
    return acc;
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
   * @returns {string} A string of raw CSS.
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
  var generateCSSRuleset = function generateCSSRuleset(selector /* : string */, declarations /* : OrderedElements */, stringHandlers /* : StringHandlers */, useImportant /* : boolean */, selectorHandlers /* : SelectorHandler[] */) {
    // Mutates declarations
    runStringHandlers(declarations, stringHandlers, selectorHandlers);
    var originalElements = Object.keys(declarations.elements).reduce(arrayToObjectKeysReducer, Object.create(null));

    // NOTE(emily): This mutates handledDeclarations.elements.
    var prefixedElements = prefixAll(declarations.elements);
    var elementNames = Object.keys(prefixedElements);
    if (elementNames.length !== declarations.keyOrder.length) {
      // There are some prefixed values, so we need to figure out how to sort
      // them.
      //
      // Loop through prefixedElements, looking for anything that is not in
      // sortOrder, which means it was added by prefixAll. This means that we
      // need to figure out where it should appear in the sortOrder.
      for (var i = 0; i < elementNames.length; i++) {
        if (!originalElements[elementNames[i]]) {
          // This element is not in the sortOrder, which means it is a prefixed
          // value that was added by prefixAll. Let's try to figure out where it
          // goes.
          var originalStyle = void 0;
          if (elementNames[i][0] === 'W') {
            // This is a Webkit-prefixed style, like "WebkitTransition". Let's
            // find its original style's sort order.
            originalStyle = elementNames[i][6].toLowerCase() + elementNames[i].slice(7);
          } else if (elementNames[i][1] === 'o') {
            // This is a Moz-prefixed style, like "MozTransition". We check
            // the second character to avoid colliding with Ms-prefixed
            // styles. Let's find its original style's sort order.
            originalStyle = elementNames[i][3].toLowerCase() + elementNames[i].slice(4);
          } else {
            // if (elementNames[i][1] === 's') {
            // This is a Ms-prefixed style, like "MsTransition".
            originalStyle = elementNames[i][2].toLowerCase() + elementNames[i].slice(3);
          }
          if (originalStyle && originalElements[originalStyle]) {
            var originalIndex = declarations.keyOrder.indexOf(originalStyle);
            declarations.keyOrder.splice(originalIndex, 0, elementNames[i]);
          } else {
            // We don't know what the original style was, so sort it to
            // top. This can happen for styles that are added that don't
            // have the same base name as the original style.
            declarations.keyOrder.unshift(elementNames[i]);
          }
        }
      }
    }
    var transformValue = useImportant === false ? stringifyValue : stringifyAndImportantifyValue;
    var rules = [];
    for (var _i = 0; _i < declarations.keyOrder.length; _i++) {
      var key = declarations.keyOrder[_i];
      var value = prefixedElements[key];
      if (Array.isArray(value)) {
        // inline-style-prefixer returns an array when there should be
        // multiple rules for the same key. Here we flatten to multiple
        // pairs with the same key.
        for (var j = 0; j < value.length; j++) {
          rules.push(transformRule(key, value[j], transformValue));
        }
      } else {
        rules.push(transformRule(key, value, transformValue));
      }
    }
    if (rules.length) {
      return "".concat(selector, "{").concat(rules.join(""), "}");
    } else {
      return "";
    }
  } /* : string */;

  /* ::
  import type { SheetDefinition, SheetDefinitions } from './index.js';
  import type { MaybeSheetDefinition } from './exports.js';
  import type { SelectorHandler } from './generate.js';
  */

  // The current <style> tag we are inserting into, or null if we haven't
  // inserted anything yet. We could find this each time using
  // `document.querySelector("style[data-aphrodite"])`, but holding onto it is
  // faster.
  var styleTag /* : ?HTMLStyleElement */ = null;

  // Inject a set of rules into a <style> tag in the head of the document. This
  // will automatically create a style tag and then continue to use it for
  // multiple injections. It will also use a style tag with the `data-aphrodite`
  // tag on it if that exists in the DOM. This could be used for e.g. reusing the
  // same style tag that server-side rendering inserts.
  var injectStyleTag = function injectStyleTag(cssRules /* : string[] */) {
    if (styleTag == null) {
      // Try to find a style tag with the `data-aphrodite` attribute first.
      styleTag = document.querySelector("style[data-aphrodite]") /* : any */ /* : ?HTMLStyleElement */;

      // If that doesn't work, generate a new style tag.
      if (styleTag == null) {
        // Taken from
        // http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
        var head = document.head || document.getElementsByTagName('head')[0];
        styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.setAttribute("data-aphrodite", "");
        head.appendChild(styleTag);
      }
    }

    // $FlowFixMe
    var sheet = styleTag.styleSheet || styleTag.sheet /* : any */ /* : CSSStyleSheet */;
    if (sheet.insertRule) {
      var numRules = sheet.cssRules.length;
      cssRules.forEach(function (rule) {
        try {
          sheet.insertRule(rule, numRules);
          numRules += 1;
        } catch (e) {
          // The selector for this rule wasn't compatible with the browser
        }
      });
    } else {
      styleTag.innerText = (styleTag.innerText || '') + cssRules.join('');
    }
  };

  // Custom handlers for stringifying CSS values that have side effects
  // (such as fontFamily, which can cause @font-face rules to be injected)
  var stringHandlers = {
    // With fontFamily we look for objects that are passed in and interpret
    // them as @font-face rules that we need to inject. The value of fontFamily
    // can either be a string (as normal), an object (a single font face), or
    // an array of objects and strings.
    fontFamily: function fontFamily(val) {
      if (Array.isArray(val)) {
        var nameMap = {};
        val.forEach(function (v) {
          nameMap[fontFamily(v)] = true;
        });
        return Object.keys(nameMap).join(",");
      } else if (_typeof(val) === "object") {
        injectStyleOnce(val.src, "@font-face", [val], false);
        return "\"".concat(val.fontFamily, "\"");
      } else {
        return val;
      }
    },
    // With animationName we look for an object that contains keyframes and
    // inject them as an `@keyframes` block, returning a uniquely generated
    // name. The keyframes object should look like
    //  animationName: {
    //    from: {
    //      left: 0,
    //      top: 0,
    //    },
    //    '50%': {
    //      left: 15,
    //      top: 5,
    //    },
    //    to: {
    //      left: 20,
    //      top: 20,
    //    }
    //  }
    // TODO(emily): `stringHandlers` doesn't let us rename the key, so I have
    // to use `animationName` here. Improve that so we can call this
    // `animation` instead of `animationName`.
    animationName: function animationName(val, selectorHandlers) {
      if (Array.isArray(val)) {
        return val.map(function (v) {
          return animationName(v, selectorHandlers);
        }).join(",");
      } else if (_typeof(val) === "object") {
        // Generate a unique name based on the hash of the object. We can't
        // just use the hash because the name can't start with a number.
        // TODO(emily): this probably makes debugging hard, allow a custom
        // name?
        var name = "keyframe_".concat(hashObject(val));

        // Since keyframes need 3 layers of nesting, we use `generateCSS` to
        // build the inner layers and wrap it in `@keyframes` ourselves.
        var finalVal = "@keyframes ".concat(name, "{");

        // TODO see if we can find a way where checking for OrderedElements
        // here is not necessary. Alternatively, perhaps we should have a
        // utility method that can iterate over either a plain object, an
        // instance of OrderedElements, or a Map, and then use that here and
        // elsewhere.
        if (val instanceof OrderedElements) {
          val.forEach(function (valVal, valKey) {
            finalVal += _generateCSS(valKey, [valVal], selectorHandlers, stringHandlers, false).join('');
          });
        } else {
          Object.keys(val).forEach(function (key) {
            finalVal += _generateCSS(key, [val[key]], selectorHandlers, stringHandlers, false).join('');
          });
        }
        finalVal += '}';
        injectGeneratedCSSOnce(name, [finalVal]);
        return name;
      } else {
        return val;
      }
    }
  };

  // This is a map from Aphrodite's generated class names to `true` (acting as a
  // set of class names)
  var alreadyInjected = {};

  // This is the buffer of styles which have not yet been flushed.
  var injectionBuffer /* : string[] */ = [];

  // A flag to tell if we are already buffering styles. This could happen either
  // because we scheduled a flush call already, so newly added styles will
  // already be flushed, or because we are statically buffering on the server.
  var isBuffering = false;
  var injectGeneratedCSSOnce = function injectGeneratedCSSOnce(key, generatedCSS) {
    var _injectionBuffer;
    if (alreadyInjected[key]) {
      return;
    }
    (_injectionBuffer = injectionBuffer).push.apply(_injectionBuffer, _toConsumableArray(generatedCSS));
    flushToStyleTag();
    alreadyInjected[key] = true;
  };
  var injectStyleOnce = function injectStyleOnce(key /* : string */, selector /* : string */, definitions /* : SheetDefinition[] */, useImportant /* : boolean */) {
    var selectorHandlers /* : SelectorHandler[] */ = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
    if (alreadyInjected[key]) {
      return;
    }
    var generated = _generateCSS(selector, definitions, selectorHandlers, stringHandlers, useImportant);
    injectGeneratedCSSOnce(key, generated);
  };
  var reset = function reset() {
    injectionBuffer = [];
    alreadyInjected = {};
    isBuffering = false;
    styleTag = null;
  };
  var resetInjectedStyle = function resetInjectedStyle(key /* : string */) {
    delete alreadyInjected[key];
  };
  var startBuffering = function startBuffering() {
    if (isBuffering) {
      throw new Error("Cannot buffer while already buffering");
    }
    isBuffering = true;
  };
  var flushToArray = function flushToArray() {
    isBuffering = false;
    var ret = injectionBuffer;
    injectionBuffer = [];
    return ret;
  };
  var flushToString = function flushToString() {
    return flushToArray().join('');
  };
  var flushToStyleTag = function flushToStyleTag() {
    var cssRules = flushToArray();
    if (cssRules.length > 0) {
      injectStyleTag(cssRules);
    }
  };
  var getRenderedClassNames = function getRenderedClassNames(/* : string[] */
  ) {
    return Object.keys(alreadyInjected);
  };
  var addRenderedClassNames = function addRenderedClassNames(classNames /* : string[] */) {
    classNames.forEach(function (className) {
      alreadyInjected[className] = true;
    });
  };
  var isValidStyleDefinition = function isValidStyleDefinition(def /* : Object */) {
    return "_definition" in def && "_name" in def && "_len" in def;
  };
  var _processStyleDefinitions = function processStyleDefinitions(styleDefinitions /* : any[] */, classNameBits /* : string[] */, definitionBits /* : Object[] */, length /* : number */) {
    for (var i = 0; i < styleDefinitions.length; i += 1) {
      // Filter out falsy values from the input, to allow for
      // `css(a, test && c)`
      if (styleDefinitions[i]) {
        if (Array.isArray(styleDefinitions[i])) {
          // We've encountered an array, so let's recurse
          length += _processStyleDefinitions(styleDefinitions[i], classNameBits, definitionBits, length);
        } else if (isValidStyleDefinition(styleDefinitions[i])) {
          classNameBits.push(styleDefinitions[i]._name);
          definitionBits.push(styleDefinitions[i]._definition);
          length += styleDefinitions[i]._len;
        } else {
          throw new Error("Invalid Style Definition: Styles should be defined using the StyleSheet.create method.");
        }
      }
    }
    return length;
  } /* : number */;

  /**
   * Inject styles associated with the passed style definition objects, and return
   * an associated CSS class name.
   *
   * @param {boolean} useImportant If true, will append !important to generated
   *     CSS output. e.g. {color: red} -> "color: red !important".
   * @param {(Object|Object[])[]} styleDefinitions style definition objects, or
   *     arbitrarily nested arrays of them, as returned as properties of the
   *     return value of StyleSheet.create().
   */
  var injectAndGetClassName = function injectAndGetClassName(useImportant /* : boolean */, styleDefinitions /* : MaybeSheetDefinition[] */, selectorHandlers /* : SelectorHandler[] */) {
    var classNameBits = [];
    var definitionBits = [];

    // Mutates classNameBits and definitionBits and returns a length which we
    // will append to the hash to decrease the chance of hash collisions.
    var length = _processStyleDefinitions(styleDefinitions, classNameBits, definitionBits, 0);

    // Break if there aren't any valid styles.
    if (classNameBits.length === 0) {
      return "";
    }
    var className;
    {
      className = classNameBits.length === 1 ? "_".concat(classNameBits[0]) : "_".concat(hashString(classNameBits.join())).concat((length % 36).toString(36));
    }
    injectStyleOnce(className, ".".concat(className), definitionBits, useImportant, selectorHandlers);
    return className;
  } /* : string */;

  /* ::
  import type { SelectorHandler } from './generate.js';
  export type SheetDefinition = { [id:string]: any };
  export type SheetDefinitions = SheetDefinition | SheetDefinition[];
  type RenderFunction = () => string;
  type Extension = {
      selectorHandler: SelectorHandler
  };
  export type MaybeSheetDefinition = SheetDefinition | false | null | void
  */

  var unminifiedHashFn = function unminifiedHashFn(str /* : string */, key /* : string */) {
    return "".concat(key, "_").concat(hashString(str));
  };

  // StyleSheet.create is in a hot path so we want to keep as much logic out of it
  // as possible. So, we figure out which hash function to use once, and only
  // switch it out via minify() as necessary.
  //
  // This is in an exported function to make it easier to test.
  var initialHashFn = function initialHashFn() {
    return  hashString ;
  };
  var hashFn = initialHashFn();
  var StyleSheet = {
    create: function create(sheetDefinition /* : SheetDefinition */) /* : Object */{
      var mappedSheetDefinition = {};
      var keys = Object.keys(sheetDefinition);
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        var val = sheetDefinition[key];
        var stringVal = JSON.stringify(val);
        mappedSheetDefinition[key] = {
          _len: stringVal.length,
          _name: hashFn(stringVal, key),
          _definition: val
        };
      }
      return mappedSheetDefinition;
    },
    rehydrate: function rehydrate() {
      var renderedClassNames /* : string[] */ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      addRenderedClassNames(renderedClassNames);
    }
  };

  /**
   * Utilities for using Aphrodite server-side.
   *
   * This can be minified out in client-only bundles by replacing `typeof window`
   * with `"object"`, e.g. via Webpack's DefinePlugin:
   *
   *   new webpack.DefinePlugin({
   *     "typeof window": JSON.stringify("object")
   *   })
   */
  var StyleSheetServer = typeof window !== 'undefined' ? null : {
    renderStatic: function renderStatic(renderFunc /* : RenderFunction */) {
      reset();
      startBuffering();
      var html = renderFunc();
      var cssContent = flushToString();
      return {
        html: html,
        css: {
          content: cssContent,
          renderedClassNames: getRenderedClassNames()
        }
      };
    }
  };

  /**
   * Utilities for using Aphrodite in tests.
   *
   * Not meant to be used in production.
   */
  var StyleSheetTestUtils =  null ;

  /**
   * Generate the Aphrodite API exports, with given `selectorHandlers` and
   * `useImportant` state.
   */
  function makeExports(useImportant /* : boolean */) {
    var selectorHandlers /* : SelectorHandler[] */ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSelectorHandlers;
    return {
      StyleSheet: _objectSpread2(_objectSpread2({}, StyleSheet), {}, {
        /**
         * Returns a version of the exports of Aphrodite (i.e. an object
         * with `css` and `StyleSheet` properties) which have some
         * extensions included.
         *
         * @param {Array.<Object>} extensions: An array of extensions to
         *     add to this instance of Aphrodite. Each object should have a
         *     single property on it, defining which kind of extension to
         *     add.
         * @param {SelectorHandler} [extensions[].selectorHandler]: A
         *     selector handler extension. See `defaultSelectorHandlers` in
         *     generate.js.
         *
         * @returns {Object} An object containing the exports of the new
         *     instance of Aphrodite.
         */
        extend: function extend(extensions /* : Extension[] */) {
          var extensionSelectorHandlers = extensions
          // Pull out extensions with a selectorHandler property
          .map(function (extension) {
            return extension.selectorHandler;
          })
          // Remove nulls (i.e. extensions without a selectorHandler property).
          .filter(function (handler) {
            return handler;
          });
          return makeExports(useImportant, selectorHandlers.concat(extensionSelectorHandlers));
        }
      }),
      StyleSheetServer: StyleSheetServer,
      StyleSheetTestUtils: StyleSheetTestUtils,
      minify: function minify(shouldMinify /* : boolean */) {
        hashFn = shouldMinify ? hashString : unminifiedHashFn;
      },
      css: function css() {
        for (var _len = arguments.length, styleDefinitions = new Array(_len), _key = 0; _key < _len; _key++) {
          styleDefinitions[_key] = arguments[_key];
        }
        return injectAndGetClassName(useImportant, styleDefinitions, selectorHandlers);
      },
      flushToStyleTag: flushToStyleTag,
      injectAndGetClassName: injectAndGetClassName,
      defaultSelectorHandlers: defaultSelectorHandlers,
      reset: reset,
      resetInjectedStyle: resetInjectedStyle
    };
  }

  var useImportant = true; // Add !important to all style definitions

  var Aphrodite = makeExports(useImportant);
  var StyleSheet$1 = Aphrodite.StyleSheet,
    StyleSheetServer$1 = Aphrodite.StyleSheetServer,
    StyleSheetTestUtils$1 = Aphrodite.StyleSheetTestUtils,
    css = Aphrodite.css,
    minify = Aphrodite.minify,
    flushToStyleTag$1 = Aphrodite.flushToStyleTag,
    injectAndGetClassName$1 = Aphrodite.injectAndGetClassName,
    defaultSelectorHandlers$1 = Aphrodite.defaultSelectorHandlers,
    reset$1 = Aphrodite.reset,
    resetInjectedStyle$1 = Aphrodite.resetInjectedStyle;

  exports.StyleSheet = StyleSheet$1;
  exports.StyleSheetServer = StyleSheetServer$1;
  exports.StyleSheetTestUtils = StyleSheetTestUtils$1;
  exports.css = css;
  exports.defaultSelectorHandlers = defaultSelectorHandlers$1;
  exports.flushToStyleTag = flushToStyleTag$1;
  exports.injectAndGetClassName = injectAndGetClassName$1;
  exports.minify = minify;
  exports.reset = reset$1;
  exports.resetInjectedStyle = resetInjectedStyle$1;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=aphrodite.umd.js.map
