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

```js
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

Creating custom font faces is a special case. Typically you need to define a global `@font-face` rule. In the case of aphrodite we only want to insert that rule if it's actually being referenced by a class that's in the page. We've made it so that the `fontFamily` property can accept a font-face object (either directly or inside an array). A global `@font-face` rule is then generated based on the font definition.

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
import { StyleSheetServer, css } from 'aphrodite';

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

# Tools

- [Aphrodite output tool](https://output.jsbin.com/qoseye) - Paste what you pass to `StyleSheet.create` and see the generated CSS

# TODO

- Add Flow annotations
- Add JSdoc
- Enable ESlint
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
