# Aphrodite: Inline Styles (maybe) that work

### *WARNING!! This library is an experiment to try to solve inline styles at Khan Academy. It is a work in progress, and won't be supported for now.*

Support for colocating your styles with your React component.

- Supports media queries without window.matchMedia
- Supports pseudo-selectors like `:hover`, `:active`, etc. without needing to
  store hover or active state in components. `:visited` works just fine too.
- Supports automatic global `@font-face` detection and insertion.
- Respects precedence order when specifying multiple styles
- Requires no AST transform (though you can have one to replace
  `StyleSheet.create` with a pre-computed value at compile time if you'd like).
- Injects only the exact styles needed for the render into the DOM.
- Can be used for server rendering (this is TODO at the moment).
- No dependencies, tiny
- No external CSS file generated for inclusion

# API

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

# Buffering

To avoid making a new style tag for each individual call to `css`, you can use 
buffering. A similar technique will enable server rendering.

On the client, instead of just this:

    ReactDOM.render(<App/>, document.getElementById('root'));

You can do this:

    StyleSheet.startBuffering();
    ReactDOM.render(<App/>,
                    document.getElementById('root'),
                    StyleSheet.flush);

Note that this is an optimization, and the first option will work just fine.

Once implemented, server rendering will look roughly like this:

    StyleSheet.clearClassNameCache();
    StyleSheet.startBuffering();

    // Contains the markup with references to generated class names
    var html = ReactDOMServer.renderToString(<App/>);

    // Contains the CSS referenced by the html string above, and the references 
    // to the classNames generated during the rendering of html above.
    var {styleContents, classNames} = StyleSheet.collect();

    return `
        <html>
            <head>
                <style>{styleContents}</style>
            </head>
            <body>
                <div id='root'>{html}</div>
                <script src="./bundle.js"></script>
                <script>
                    StyleSheet.markInjected({classNames});
                    ReactDOM.render(<App/>, document.getElementById('root'));
                </script>
            </body>
        </html>
    `;

# Font Faces

Creating custom font faces is a special case. Typically you need to define a global `@font-face` rule. In the case of aphrodite we only want to insert that rule if it's actually being referenced by a class that's in the page. We've made it so that the `fontFamily` property can accept a font-face object (either directly or inside an array). A global `@font-face` rule is then generated based on the font definition.

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

Aphrodite will ensure that the global `@font-face` rule for this font is only inserted once, no matter how many times it's referenced.

# TODO

- Autoprefixing
- Serverside rendering
- Optional AST transformation to replace StyleSheet.create with an object
  literal.
- Add Flow annotations
- Add JSdoc
- Enable ESlint
- Automatic conversion of numbers to strings for properties where we know what
  the unit is. See
  [CSSProperty.js](https://github.com/facebook/react/blob/master/src/renderers/dom/shared/CSSProperty.js)
  in React.
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
