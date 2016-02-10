"use strict";

const React = require('react');

const { Button } = require('react-bootstrap');

const Tag = (props) => {
    return (<Button bsSize='small' bsStyle='success' style={{marginLeft: 3, marginRight: 3}} {...props} >{props.children}</Button> );
};

export default Tag;
  