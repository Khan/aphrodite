# Aphrodite: Inline Styles that work

[![npm version](https://badge.fury.io/js/aphrodite.svg)](https://badge.fury.io/js/aphrodite) [![Build Status](https://travis-ci.org/Khan/aphrodite.svg?branch=master)](https://travis-ci.org/Khan/aphrodite) [![Gitter chat](https://img.shields.io/gitter/room/Khan/aphrodite.svg)](https://gitter.im/Khan/aphrodite)

Support for colocating your styles with your JavaScript component.

- Works great with and without React
- Supports media queries without window.matchMedia
- Supports pseudo-selectors like `:hover`, `:active`, etc. without needing to
  store hover or active state in components. `:visited` works just fine too.
- Supports automatic global `@font-face` detection and insertion.
- Respects precedence order when specifying multiple styles
- Requires no AST transform
- Injects only the exact styles needed for the render into the DOM.
- Can be used for server rendering
- Few dependencies, small (20k, 6k gzipped)
- No external CSS file generated for inclusion
- Autoprefixes styles

# Installation

Aphrodite is distributed via [npm](https://www.npmjs.com/):

```
npm install --save aphrodite
```

# API

If you'd rather watch introductory videos, you can find them [here](https://www.youtube.com/playlist?list=PLo4Zh55ZzNSBP78pCD0dZJi9zf8CA72_M).

```jsx
import React, { Component } from 'react';
import { StyleSheet, css } from 'aphrodite';

class App extends Component {
    render() {
        return <div>
            <span className={css(styles.red)}>
                This is red.
            </span>
            <span className={css(styles.hover)}>
                This turns red on hover.
            </span>
            <span className={css(styles.small)}>
                This turns red when the browser is less than 600px width.
            </span>
            <span className={css(styles.red, styles.blue)}>
                This is blue.
            </span>
            <span className={css(styles.blue, styles.small)}>
                This is blue and turns red when the browser is less than
                600px width.
            </span>
        </div>;
    }
}

const styles = StyleSheet.create({
    red: {
        backgroundColor: 'red'
    },

    blue: {
        backgroundColor: 'blue'
    },

    hover: {
        ':hover': {
            backgroundColor: 'red'
        }
    },

    small: {
        '@media (max-width: 600px)': {
            backgroundColor: 'red',
        }
    }
});
```

## Conditionally Applying Styles

Note: If you want to conditionally use styles, that is simply accomplished via:

```jsx
const className = css(
  shouldBeRed() ? styles.red : styles.blue,
  shouldBeResponsive() && styles.small,
  shouldBeHoverable() && styles.hover
)

<div className={className}>Hi</div>
```

This is possible because any falsey arguments will be ignored.

## Combining Styles

To combine styles, pass multiple styles or arrays of styles into `css()`. This is common when combining styles from an owner component:

```jsx
class App extends Component {
    render() {
        return <Marker styles={[styles.large, styles.red]} />;
    }
}

class Marker extends Component {
    render() {
        // css() accepts styles, arrays of styles (including nested arrays),
        // and falsy values including undefined.
        return <div className={css(styles.marker, this.props.styles)} />;
    }
}

const styles = StyleSheet.create({
    red: {
        backgroundColor: 'red'
    },

    large: {
        height: 20,
        width: 20
    },

    marker: {
        backgroundColor: 'blue'
    }
};
```

## Server-side rendering

To perform server-side rendering, make a call to `StyleSheetServer.renderStatic`, which takes a callback. Do your rendering inside of the callback and return the generated HTML. All of the calls to `css()` inside of the callback will be collected and the generated css as well as the generated HTML will be returned.

To perform rehydration, call `StyleSheet.rehydrate` with the list of generated class names returned to you by `StyleSheetServer.renderStatic`.

As an example:

```js
import { StyleSheetServer } from 'aphrodite';

// Contains the generated html, as well as the generated css and some
// rehydration data.
var {html, css} = StyleSheetServer.renderStatic(() => {
    return ReactDOMServer.renderToString(<App/>);
});

// Return the base HTML, which contains your rendered HTML as well as a
// simple rehydration script.
return `
    <html>
        <head>
            <style data-aphrodite>${css.content}</style>
        </head>
        <body>
            <div id='root'>${html}</div>
            <script src="./bundle.js"></script>
            <script>
                StyleSheet.rehydrate(${JSON.stringify(css.renderedClassNames)});
                ReactDOM.render(<App/>, document.getElementById('root'));
            </script>
        </body>
    </html>
`;
```

## Disabling `!important`

By default, Aphrodite will append `!important` to style definitions. This is
intended to make integrating with a pre-existing codebase easier. If you'd like
to avoid this behaviour, then instead of importing `aphrodite`, import
`aphrodite/no-important`. Otherwise, usage is the same:

```js
import { StyleSheet, css } from 'aphrodite/no-important';
```

## Font Faces

Creating custom font faces is a special case. Typically you need to define a global `@font-face` rule. In the case of Aphrodite we only want to insert that rule if it's actually being referenced by a class that's in the page. We've made it so that the `fontFamily` property can accept a font-face object (either directly or inside an array). A global `@font-face` rule is then generated based on the font definition.

```js
const coolFont = {
    fontFamily: "CoolFont",
    fontStyle: "normal",
    fontWeight: "normal",
    src: "url('coolfont.woff2') format('woff2')"
};

const styles = StyleSheet.create({
    headingText: {
        fontFamily: coolFont,
        fontSize: 20
    },
    bodyText: {
        fontFamily: [coolFont, "sans-serif"]
        fontSize: 12
    }
});
```

Aphrodite will ensure that the global `@font-face` rule for this font is only inserted once, no matter how many times it's referenced.

## Animations

Similar to [Font Faces](#font-faces), Aphrodite supports keyframe animations, but it's treated as a special case. Once we find an instance of the animation being referenced, a global `@keyframes` rule is created and appended to the page.

Animations are provided as objects describing the animation, in typical `@keyframes` fashion. Using the `animationName` property, you can supply a single animation object, or an array of animation objects. Other animation properties like `animationDuration` can be provided as strings.

```js
const translateKeyframes = {
    '0%': {
        transform: 'translateX(0)',
    },

    '50%': {
        transform: 'translateX(100px)',
    },

    '100%': {
        transform: 'translateX(0)',
    },
};

const opacityKeyframes = {
    'from': {
        opacity: 0,
    },

    'to': {
        opacity: 1,
    }
};

const styles = StyleSheet.create({
    zippyHeader: {
        animationName: [translateKeyframes, opacityKeyframes],
        animationDuration: '3s, 1200ms',
        animationIterationCount: 'infinite',
    },
});
```

Aphrodite will ensure that `@keyframes` rules are never duplicated, no matter how many times a given rule is referenced.

# Use without React

Aphrodite was built with React in mind, but does not depend on React. Here, you can see it
used with [Web Components][webcomponents]:

```js
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
    red: {
        backgroundColor: 'red'
    }
});

class App extends HTMLElement {
    attachedCallback() {
        this.innerHTML = `
            <div class="${css(styles.red)}">
                This is red.
            </div>
        `;
    }
}

document.registerElement('my-app', App);
```

# Caveats

## Style injection and buffering

Aphrodite will automatically attempt to create a `<style>` tag in the document's `<head>` element to put its generated styles in. Aphrodite will only generate one `<style>` tag and will add new styles to this over time. If you want to control which style tag Aphrodite uses, create a style tag yourself with the `data-aphrodite` attribute and Aphrodite will use that instead of creating one for you.

To speed up injection of styles, Aphrodite will automatically try to buffer writes to this `<style>` tag so that minimum number of DOM modifications happen.

Aphrodite uses [asap](https://github.com/kriskowal/asap) to schedule buffer flushing. If you measure DOM elements' dimensions in `componentDidMount` or `componentDidUpdate`, you can use `setTimeout` function to ensure all styles are injected.

```js
import { StyleSheet, css } from 'aphrodite';

class Component extends React.Component {
    render() {
        return <div ref="root" className={css(styles.div)} />;
    }

    componentDidMount() {
        // At this point styles might not be injected yet.
        this.refs.root.offsetHeight; // 0 or 10

        setTimeout(() => {
            this.refs.root.offsetHeight; // 10
        }, 0);
    }
}

const styles = StyleSheet.create({
    div: {
        height: 10,
    },
});
```

## Assigning a string to a content property for a pseudo-element

When assigning a string to the `content` property it requires double or single quotes in CSS.
Therefore with Aphrodite you also have to provide the quotes within the value string for `content` to match how it will be represented in CSS.

As an example:

```javascript
const styles = StyleSheet.create({
  large: {
      ':after': {
        content: '"Aphrodite"',
      },
    },
  },
  small: {
      ':before': {
        content: "'Aphrodite'",
      },
    },
  });
```
The generated css will be:

```css
  .large_im3wl1:after {
      content: "Aphrodite" !important;
  }

  .small_ffd5jf:before {
      content: 'Aphrodite' !important;
  }
```

## Overriding styles

When combining multiple aphrodite styles, you are strongly recommended to merge all of your styles into a single call to `css()`, and should not combine the generated class names that aphrodite outputs (via string concatenation, `classnames`, etc.).
For example, if you have a base style of `foo` which you are trying to override with `bar`:

### Do this:

```js
const styles = StyleSheet.create({
  foo: {
    color: 'red'
  },

  bar: {
    color: 'blue'
  }
});

// ...

const className = css(styles.foo, styles.bar);
```

### Don't do this:

```js
const styles = StyleSheet.create({
  foo: {
    color: 'red'
  },

  bar: {
    color: 'blue'
  }
});

// ...

const className = css(styles.foo) + " " + css(styles.bar);
```

Why does it matter? Although the second one will produce a valid class name, it cannot guarantee that the `bar` styles will override the `foo` ones.
The way the CSS works, it is not the *class name that comes last on a element* that matters, it is specificity. When we look at the generated CSS though, we find that all of the class names have the same specificity, since they are all a single class name:

```css
.foo_im3wl1 {
  color: red;
}
```

```css
.bar_hxfs3d {
  color: blue;
}
```

In the case where the specificity is the same, what matters is *the order that the styles appear in the stylesheet*. That is, if the generated stylesheet looks like

```css
.foo_im3wl1 {
  color: red;
}
.bar_hxfs3d {
  color: blue;
}
```

then you will get the appropriate effect of the `bar` styles overriding the `foo` ones, but if the stylesheet looks like

```css
.bar_hxfs3d {
  color: blue;
}
.foo_im3wl1 {
  color: red;
}
```

then we end up with the opposite effect, with `foo` overriding `bar`! The way to solve this is to pass both of the styles into aphrodite's `css()` call. Then, it will produce a single class name, like `foo_im3wl1-o_O-bar_hxfs3d`, with the correctly overridden styles, thus solving the problem:

```css
.foo_im3wl1-o_O-bar_hxfs3d {
  color: blue;
}
```

## Advanced: Extensions

Extra features can be added to Aphrodite using extensions.

To add extensions to Aphrodite, call `StyleSheet.extend` with the extensions
you are adding. The result will be an object containing the usual exports of
Aphrodite (`css`, `StyleSheet`, etc.) which will have your extensions included.
For example:

```js
// my-aphrodite.js
import {StyleSheet} from "aphrodite";

export default StyleSheet.extend([extension1, extension2]);

// styled.js
import {StyleSheet, css} from "my-aphrodite.js";

const styles = StyleSheet.create({
    ...
});
```

**Note**: Using extensions may cause Aphrodite's styles to not work properly.
Plain Aphrodite, when used properly, ensures that the correct styles will
always be applied to elements. Due to CSS specificity rules, extensions might
allow you to generate styles that conflict with each other, causing incorrect
styles to be shown. See the global extension below to see what could go wrong.

### Creating extensions

Currently, there is only one kind of extension available: selector handlers.
These kinds of extensions let you look at the selectors that someone specifies
and generate new selectors based on them. They are used to handle pseudo-styles
and media queries inside of Aphrodite. See the
[`defaultSelectorHandlers` docs](src/generate.js?L8) for information about how
to create a selector handler function.

To use your extension, create an object containing a key of the kind of
extension that you created, and pass that into `StyleSheet.extend()`:

```js
const mySelectorHandler = ...;

const myExtension = {selectorHandler: mySelectorHandler};

StyleSheet.extend([myExtension]);
```

As an example, you could write an extension which generates global styles like

```js
const globalSelectorHandler = (selector, _, generateSubtreeStyles) => {
    if (selector[0] !== "*") {
        return null;
    }

    return generateSubtreeStyles(selector.slice(1));
};

const globalExtension = {selectorHandler: globalSelectorHandler};
```

This might cause problems when two places try to generate styles for the same
global selector however! For example, after

```js
const styles = StyleSheet.create({
    globals: {
        '*div': {
            color: 'red',
        },
    }
});

const styles2 = StyleSheet.create({
    globals: {
        '*div': {
            color: 'blue',
        },
    },
});

css(styles.globals);
css(styles2.globals);
```

It isn't determinate whether divs will be red or blue.

# Changelog

## 1.1.0

- Animations now support multiple animations per style ([see section on Animations](https://github.com/khan/aphrodite#animations)) ([PR #167](https://github.com/Khan/aphrodite/pull/167))

## 1.0.0
- Syntax extensions ([see section on Advanced extensions](https://github.com/Khan/aphrodite#advanced-extensions)) ([PR #95](https://github.com/Khan/aphrodite/pull/95))

## 0.6.0
- `css()` will now accept arbitrarily nested arrays. i.e. instead of `css(styles.a, styles.b)`, you can now do `css([styles.a, [styles.b, styles.c]])`. ([PR #154](https://github.com/Khan/aphrodite/pull/154))
- Support for multiple font styles with the same font-family. ([PR #82](https://github.com/Khan/aphrodite/pull/82))

# Tools

- [Aphrodite output tool](https://output.jsbin.com/qoseye) - Paste what you pass to `StyleSheet.create` and see the generated CSS

# TODO

- Add Flow annotations
- Add JSdoc
- Consider removing !important from everything.

# Other solutions

- [js-next/react-style](https://github.com/js-next/react-style)
- [dowjones/react-inline-style](https://github.com/dowjones/react-inline-style)
- [martinandert/react-inline](https://github.com/martinandert/react-inline)

# License (MIT)

Copyright (c) 2016 Khan Academy

Includes works from https://github.com/garycourt/murmurhash-js, which is MIT licensed with the following copyright:

Copyright (c) 2011 Gary Court

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[webcomponents]: http://w3c.github.io/webcomponents/spec/custom
