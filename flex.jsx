"use strict";

var React = require('react');
var autoprefix = require('auto-prefixer');

const flexStyle = {
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'nowrap',
  flex: '1 0 auto',
  justifyContent: 'space-between',
  alignContent: 'space-between',
  alignItems: 'stretch'
};

function mixProps(props) {
  const divStyle = {};

  if (props.row) {
    divStyle.flexDirection = 'row';
  } else if (props.column) {
    divStyle.flexDirection = 'column';
  }

//  if (typeof props.width === 'number') {
//    divStyle.flexGrow = props.width;
//  } else if (props.width) {
  if (props.width) {
    divStyle.flexBasis = 'auto';
    divStyle.flexGrow = 0;
    divStyle.flexShrink = 0;
    divStyle.width = props.width;
  }

  if (props.height) {
    divStyle.flexBasis = 'auto';
    divStyle.flexGrow = 0;
    divStyle.flexShrink = 0;
    divStyle.height = props.height;
  }

  let pStyle = props.style || {};

  let rslt = {...flexStyle, ...divStyle, ...pStyle};

  if (props.auto) rslt.flex = '0 0 auto';
  
  return autoprefix(rslt);
  //return rslt;
}

let Flex = React.createClass({displayName: 'Flex',
  render() {
    const style = mixProps(this.props);
    return <div {...this.props} style={style}>{this.props.children}</div>;
  }
});

module.exports = Flex;

