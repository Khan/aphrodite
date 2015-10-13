# Aphrodite: Inline Styles (maybe) that work

### *WARNING!! This library is an experiment to try to solve inline styles at Khan Academy. It is a work in progress, and won't be supported for now.*

Support for colocating your styles with your React component.

- Supports media queries without window.matchMedia
- Supports pseudo-selectors like `:hover`, `:active`, etc. without needing to
  store hover or active state in components. `:visited` works just fine too.
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
                <span className={css([styles.red])}>
                    This is red.
                </span>
                <span className={css([styles.hover])}>
                    This turns red on hover.
                </span>
                <span className={css([styles.small])}>
                    This turns red when the browser is less than 600px width.
                </span>
                <span className={css([styles.red, styles.blue])}>
                    This is blue.
                </span>
                <span className={css([styles.blue, styles.small])}>
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

# TODO

- Examples in the repo
- Autoprefixing
- Batch styles in a single render cycle into a single style tag
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

# Other solutions

- [js-next/react-style](https://github.com/js-next/react-style)
- [dowjones/react-inline-style](https://github.com/dowjones/react-inline-style)
- [martinandert/react-inline](https://github.com/martinandert/react-inline)
