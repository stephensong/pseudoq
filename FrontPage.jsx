"use strict";

const React = require('react');
const oxiDate = require('./oxidate.js');

import {PseudoqBoard} from 'PseudoqBoard.jsx';
import { Hidato } from 'Hidato.jsx';

import { History, Link } from 'react-router';
const { Button, Input, NavItem, Nav } = require('react-bootstrap');

import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';

const FrontPage = React.createClass({displayName: 'FP',
    mixins: [History],

    componentWillMount: function() { 
        console.log("mounting FP");
        this.initComponent(this.props); 
    },

    componentWillReceiveProps: function(nextProps) { this.initComponent(nextProps); }, 
    initComponent: function(props) {  
        const { dayName } = props.params;
        if (!dayName || dayName === '_#_') {
            const firstDay = oxiDate.toFormat(props.date, 'DDDD');
            this.history.pushState(null, "/" + firstDay);
        }
    },

    render: function() {

        const { dayName } = this.props.params;
        //console.log("rendering FP for day : " + dayName);
        if (!dayName || dayName === '_#_') {
            return null;
        }
        let dt = this.props.date;
        let userName = localStorage.getItem('pseudoq.userName');
        let items = [];
        var i = 7;
        while (i > 0) {
            let cdt = oxiDate.toFormat(dt, 'yyyyMMdd');
            let dy = oxiDate.toFormat(dt, "DDDD");
            items.push( <LinkContainer key={ dy } to={ "/" + dy } ><NavItem>{ dy }</NavItem></LinkContainer> );
            dt = oxiDate.addDays(dt, -1);
            i = i - 1;
        }

        items.push( <LinkContainer key="challenge5" to="/challenge5"><NavItem>5 minute Challenge</NavItem></LinkContainer> );

        items.push( <LinkContainer key="challenge15" to="/challenge15"><NavItem>15 minute Challenge</NavItem></LinkContainer> );

        items.push( <LinkContainer key="hidato" to="/hidato"><NavItem>Hidato</NavItem></LinkContainer> );

        let prov = localStorage.getItem('pseudoq.authprov') ? null : (
                       <p>You are not currently signed in to psuedoq.net.  This means that your games in progress will not
                       be made available on other devices, and any solutions you submit will not appear on leaderboards.  
                       You can sign-in either by <a href="/auth/facebook">Facebook</a> or <a href="/auth/twitter">Twitter</a> 
                       </p>
                       );

        let anon = userName && userName.substring(0,10) !== 'anonymous_' ? null : (
                      <p>You are currently using an automatically assigned user-name (aka moniker).  
                       This only means that any solutions you submit will not be readily recognisable on leaderboards as having come from you.
                       You can change your moniker <LinkContainer key="monikerlink" to="/changeMoniker"><a>here</a></LinkContainer>  
                       </p>
                       );



        return ( 
              <div>
                <div className="row">
                  <div className="col-md-12">
                      <p>Welcome to PseudoQ.net.  Here we publish puzzles (mainly murderous Sudoku variants) that are playable online.
                      </p>
                      {anon}
                      {prov}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-2">
                      <Nav bsStyle='pills' stacked activeKey={ dayName } >
                           {items}
                      </Nav>
                  </div>
                  <div className="col-md-10">
                    {this.props.children}
                  </div>
                </div>
              </div>
        );

    }

});

export default FrontPage;