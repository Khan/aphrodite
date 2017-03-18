// @flow
import React, { Component } from 'react';
import asap from 'asap';

/* ::
  type styleObject = {
    _definition: Object,
    _name: string,
  };
  type sos = styleObject | Array<styleObject>;
  type F<T, R> = (props: T) => R;
  export type criticals = sos | F<Object, sos>;
*/

export const criticalStylesCreator = (css/* : function */, ...styles /* : Array<criticals> */) => {
    const calcs = [];

    if (typeof document === 'undefined') return clean;

    styles.forEach((s) => {
        if (typeof s === 'function') {
            // its a function that caculates based off of props
            // $FlowFixMe Not sure what its upset about ¯\_(ツ)_/¯
            calcs[calcs.length] = props => css(...[].concat(s(props)));
        } else {
            // its a style or an array of styles
            css(...[].concat(s));
        }
    });

    if (calcs.length) return (WrappedComponent /*: ReactClass<*> */) => critical(calcs, WrappedComponent);

    return clean;
};

// eslint-disable-next-line one-var
const clean = (WrappedComponent /* : ReactClass<*> */) => WrappedComponent;

// eslint-disable-next-line one-var
const critical = (calcs, WrappedComponent /* : ReactClass<*> */) =>
class extends Component {

    /* ::
    state: {
        ready: bool,
    }
    */

    constructor(props /* : Object */) {
        super(props);
        this.state = {
            ready: false,
        }
    }

    componentWillMount() {
        calcs.forEach(sty => sty({ ...WrappedComponent.defaultProps, ...this.props }));
        asap(() => this.setState({
            ready: true,
        }));
    }

    render() {
        if (!this.state.ready) return null;

        return (
            <WrappedComponent {...this.props} />
        );
    }
};
