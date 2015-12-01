"use strict";

window.jQuery = require('jquery');

require('./css/bootstrap-flatly.css');
require('bootstrap');

const React = require('react');

import { Link } from 'react-router';
import { fetchContents } from './main.jsx';

const { isMember } = require('./utils.js');


const _app = React.createClass({displayName: 'App',

    handleDoubleClick(e) {
        e.preventDefault;
    },

    componentDidMount() { 
        this.props.dispatch(fetchContents(this.props.today));
    },

    render() {
        let userName = this.props.user.moniker; //localStorage.getItem('pseudoq.userName');
        let prov = localStorage.getItem('pseudoq.authprov')
        let lis = prov ? (<Link to='/logout'>Sign Out ({prov})</Link>)
                       : (<Link to='/login'>Sign In</Link>) ;

        let lis2 = (isMember('member')) ? [ <li key='blog' ><Link to="/blog">Blog</Link></li>, <li key='links' ><Link to="/links">Links</Link></li> ]
                                           : [];
        return (
            <div onDoubleClick={this.handleDoubleClick} >
              <div className="navbar navbar-default" width='100%'>
                <div className="navbar-header">
                  <div className="navbar-brand"><a href='/'>PseudoQ</a></div>
                </div>
                <div className="navbar-collapse collapse navbar-responsive-collapse">
                  <ul className="nav navbar-nav navbar-right">
                      <li><Link to="/help">How to Play</Link></li>
                      <li><Link to="/about">About</Link></li>
                      { lis2 }
                      <li><a href="mailto:stephensong2@gmail.com">Contact Us</a></li>
                      <li>{ lis }</li>
                      <li><Link to='/user' >User : { userName } </Link></li>
                  </ul>
                </div>
              </div>
              {this.props.children}
            </div>
        );
    }
});

export default _app;
