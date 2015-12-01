"use strict";

const { Button } = require('react-bootstrap');

const Tag = (props) => (
	<Button bsSize='small' bsStyle='success' style={{marginLeft: 3, marginRight: 3}} {...props} >{props.children}</Button>
);

export default Tag;
  