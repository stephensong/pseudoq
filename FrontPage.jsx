"use strict";


require('./css/bootstrap-flatly.css');
require('bootstrap');

let oxiDate = require('oxidate');

var React = require('react');

var { Nav, NavItem } = require('react-bootstrap');

var Router = require('react-router'); 

var {DefaultRoute, Link, RouteHandler, Route, State, Navigation} = Router;

//var { NavItemLink } = require('react-router-bootstrap');

var Utils = require('utils');

var FrontPage = React.createClass({displayName: 'FrontPage',
    mixins: [State, Navigation],
    
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            focusDate: '',
        };
    },

    componentWillMount: function() { 
        //this.setState({focusDate: this.props.date});
        console.log('FrontPage will mount');
    },

    componentDidMount: function() { 
        console.log('FrontPage did mount');
    },

    handleSelect: function (ky) {
        this.setState({focusDate: ky})
    },

    render: function() {
        console.log("rendering Frontpage for date " + this.props.date);
        var dt = oxiDate.parse(this.props.date,'yyyyMMdd') ;
        var items = [];
        var i = 7;
        while (i > 0) {
            let cdt = dt.toFormat('yyyyMMdd');
            let dy = dt.toFormat("DDDD");
            console.log(dy);
            let prms = { dayName: dy };
            let href = this.makeHref("daily",prms);
            items.push( <NavItem key={ dy } href={ href } >{ dy }</NavItem> );
            dt = dt.addDays(-1);
            i = i - 1;
        }
        return ( 
              <div>
                <div className="row">
                  <div className="col-md-12">
                      <p>Welcome to PseudoQ.net.  Here we publish puzzles (currently only Sudoku variants) that are playable online.
                      </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-2">
                      <Nav bsStyle='pills' stacked activeKey={this.state.focusDate} >
                           {items}
                      </Nav>
                    <RouteHandler/>
                  </div>
                  <div className="col-md-10">
                  </div>
                </div>
              </div>
        );
    }
});

module.exports = FrontPage;