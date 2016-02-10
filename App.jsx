"use strict";

window.jQuery = require('jquery');

require('./css/bootstrap-flatly.css');
require('bootstrap');

const React = require('react');

import { Link } from 'react-router';
import { fetchContents } from './main.jsx';

const { isMember } = require('./utils.js');

function cacheStatus() {
    var sCacheStatus = "Not supported";
    if (window.applicationCache) 
    {
        var oAppCache = window.applicationCache;
        switch ( oAppCache.status ) {
        case oAppCache.UNCACHED : 
           sCacheStatus = "Not cached"; 
           break;
        case oAppCache.IDLE : 
           sCacheStatus = "Idle"; 
           break;
        case oAppCache.CHECKING : 
           sCacheStatus = "Checking"; 
           break;
        case oAppCache.DOWNLOADING : 
           sCacheStatus = "Downloading"; 
           break;
        case oAppCache.UPDATEREADY : 
           sCacheStatus = "Update ready"; 
           break;
        case oAppCache.OBSOLETE : 
           sCacheStatus = "Obsolete"; 
           break;
        default : 
          sCacheStatus = "Unexpected Status ( " + 
                         oAppCache.status.toString() + ")";
          break;
        }
    }
    return sCacheStatus;
}

const _app = React.createClass({displayName: 'App',

    handleDoubleClick(e) {
        e.preventDefault;
    },

    componentDidMount() { 
        this.props.dispatch(fetchContents(this.props.today));
        let cachestat = cacheStatus(); 
        console.log("cache : "+cachestat);
        if (cachestat !== 'Idle' && cachestat !== 'Not cached' && cachestat !== 'Not supported') {
            var oCache = window.applicationCache;
            oCache.addEventListener("updateready", (e) => { 
                console.log('cache updated'); 
                oCache.swapCache();
                this.props.dispatch({type: 'FORCEREFRESH'}) 
            }, true);
        }
    },

    render() {
        console.log("app render");
        let cachestat = cacheStatus(); 
        if (cachestat !== 'Idle' && cachestat !== 'Not cached') {
            console.log("Waiting for cache : current status is : " + cachestat);
            //return null;
        }
        let userName = this.props.user.moniker; //localStorage.getItem('pseudoq.userName');
        if (userName !== localStorage.getItem('pseudoq.userName')) console.log("userName farked : ");
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
