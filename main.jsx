"use strict";

window.jQuery = require('jquery');
var $ = jQuery;

require('./css/bootstrap-flatly.css');
require('bootstrap');


let oxiDate = require('./oxidate.js');
let utils = require('./utils.js');
let grph = require('graphics');

var React = require('react');

var ReactBootStrap = require('react-bootstrap');
const { Button, Input } = ReactBootStrap;

var NavItem = ReactBootStrap.NavItem;
var Nav = ReactBootStrap.Nav;

var Utils = require('utils');

export let About = require('PseudoqAbout.jsx');
var PseudoqHelp = require('PseudoqHelp.jsx');
var Board = require('PseudoqBoard.jsx');

import { connect } from 'react-redux';
import { History, Link } from 'react-router';
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';

import { Hidato } from 'Hidato.jsx';


var today = oxiDate.toUTC(new Date());
var firstDay = oxiDate.toFormat(today, 'DDDD');

var initDays = function() {
    console.log("initDays called");
    let dt = today;
    var o = Object.create(null);
    o.date =  oxiDate.toFormat(dt, 'YYYYMMDD');
    o.pos = 0;

    var i = 7;
    while (i > 0) {
        let cdt = oxiDate.toFormat(dt, 'yyyyMMdd');
        let dy = oxiDate.toFormat(dt, "DDDD");
        o[dy] = {date: cdt, boards: {} };
        dt = oxiDate.addDays(dt, -1);
        i = i - 1;
    }
    dt = oxiDate.addDays(today, 1);
    o.tomorrow = {date: oxiDate.toFormat(dt, 'yyyyMMdd'), boards: {} }; 
    o.tutorial = null;
    return o;
};

var findPuzzle = function ( days, dayName, pos ) {
    return days[dayName].boards[pos];
};


var loadContents = function ( o ) {
    console.log('loadContents called');
    let days = initDays();
    let brds = o.boards;
    let dt = today;

    var i = 7;
    while (i > 0) {
        let cdt = oxiDate.toFormat(dt, 'yyyyMMdd');
        //console.log('cdt :'+cdt);
        let dy = oxiDate.toFormat(dt, "DDDD");
        let boards = brds[cdt] || {};
        //console.log('cdt :'+cdt+", day : "+dy+", boards : "+Object.keys(boards).length);
        days[dy].boards = boards;
        dt = oxiDate.addDays(dt, -1);
        i = i - 1;
    }

    let cdt = oxiDate.toFormat(dt, 'yyyyMMdd');
    let fnd = false;
    Object.keys(brds).forEach(function (k) {
        if (k < cdt) {
            fnd = true;
            delete brds.k
        }
    });  
    days.tomorrow.boards = brds[days.tomorrow.date];
    days.tutorial = brds.tutorial;
    return days;
};

var fetchContents = function() {
    //console.log("fetchcontents called");

    return function (dispatch, getState) {

        let stg = localStorage.getItem('pseudoq.boards');
        let o = null;

        if (stg) {
            try {
                o = JSON.parse(stg);
            }
            catch (e) {
                console.log("error parsing local storage : "+e);
                localStorage.removeItem('pseudoq.boards');
            }
            dispatch({type: 'loadContents', contents: o});
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", '/puzzles');
        xhr.onload = () => {
            localStorage.setItem('pseudoq.userName', xhr.getResponseHeader('X-psq-moniker'));
            let prov = xhr.getResponseHeader('X-psq-authprov')
            if (prov)  localStorage.setItem('pseudoq.authprov', prov);
            else localStorage.removeItem('pseudoq.authprov');

            if (xhr.status == 200) {
                try { 
                    let t = JSON.parse(xhr.responseText);
                    localStorage.setItem('pseudoq.boards', xhr.responseText);
                    return dispatch({type: 'loadContents', contents: t});
                } catch (e) {
                    console.log("error (parsing response?) : "+e);
                }
            }
        };
        xhr.send();
    }
};

export let App = React.createClass({displayName: 'App',

    handleDoubleClick: function(e) {
        e.preventDefault;
    },

    render: function () {
        //console.log('rendering app')
        let userName = localStorage.getItem('pseudoq.userName');
        let prov = localStorage.getItem('pseudoq.authprov')
        let lis = prov ? (<Link to='/logout'>Sign Out ({prov})</Link>)
                       : (<Link to='/login'>Sign In</Link>) ;

        // how should this really be done??
        let lis2 = (userName === 'gary2' ) ? [ <li key='blog' ><Link to="/blog">Blog</Link></li>, <li key='links' ><Link to="/links">Links</Link></li> ]
                                           : [];
        return (
            <div onDoubleClick={this.handleDoubleClick} >
              <div className="navbar navbar-default" width='100%'>
                <div className="navbar-header">
                  <Link className="navbar-brand" to="/">PseudoQ</Link>
                </div>
                <div className="navbar-collapse collapse navbar-responsive-collapse">
                  <ul className="nav navbar-nav navbar-right">
                      <li><Link to="/help">How to Play</Link></li>
                      <li><Link to="/about">About</Link></li>
                      { lis2 }
                      <li><a href="mailto:stephensong2@gmail.com">Contact Us</a></li>
                      <li>{ lis }</li>
                      <li><Link to='/changeMoniker' >User : { userName } </Link></li>
                  </ul>
                </div>
              </div>
              {this.props.children}
            </div>
        );
/*
      <NavBar>
        <Nav>
          <NavItem><Link to="app">PseudoQ</Link></NavItem>
          <NavItem><Link to="about">About</Link></NavItem>
          <NavItem href="mailto:stephensong2@gmail.com">Contact Us</NavItem>
          <RouteHandler/>
        </Nav>
      </NavBar>
*/
    }
});

export let Login = React.createClass({displayName: 'Login',
    /*
    mixins: [History],

    authFacebook() {
        var xhr = new XMLHttpRequest();
        //console.log("auth facebook requested");
        xhr.open("GET", '/auth/facebook');
        xhr.onload = () => {
            this.history.goBack();
        };
        xhr.send();

    },

    authTwitter() {
        var xhr = new XMLHttpRequest();
        //console.log("auth facebook requested");
        xhr.open("GET", '/auth/facebook');
        xhr.onload = () => {
            this.history.goBack();
        };
        xhr.send();

    },
*/
    render: function () {
        return (
      <ul>
        <li><a href="/auth/facebook">Sign in via Facebook</a></li>
        <li><a href="/auth/twitter">Sign in via Twitter</a></li> 
      </ul>        
      );
        //<li><a href="/auth/google">Sign in via Google</a></li>
    }
});

export let Logout = React.createClass({displayName: 'Logout',
    mixins: [History],

    componentDidMount: function() {
        var xhr = new XMLHttpRequest();
        console.log("logout requested");
        xhr.open("GET", '/logout');
        xhr.onload = () => {
            localStorage.removeItem('pseudoq.authprov');
            this.history.goBack();
        };
        xhr.send();
    },

    render: function () { return null; },
});


export let Challenge5min = React.createClass({displayName: 'Challenge5min',

    getInitialState: function() {
        return {
            brdJson: null
        }
    },

    componentDidMount: function() {
        var xhr = new XMLHttpRequest();
        //console.log("challenge5min puzzle requested");
        xhr.open("GET", '/challenge5min');
        xhr.onload = () => {
            let json = JSON.parse(xhr.responseText);
            json = grph.Transformer(json).randomTransform();
            this.setState({brdJson: json});
        };
        xhr.send();
    },

    render: function () { 
        const brdJson = this.state.brdJson;

        return brdJson ? (<Board key={ 'challenge5:play' } dayName={ 'challenge5' } pos={brdJson.puzzleId}  brdJson={ brdJson } initmode={ 'play' } random={ true } timeOut={ 300 } /> )
                       : null;
    },

});

export let Challenge15min = React.createClass({displayName: 'Challenge15min',

    getInitialState: function() {
        return {
            brdJson: null
        }
    },

    componentDidMount: function() {
        var xhr = new XMLHttpRequest();
        //console.log("challenge15min puzzle requested");
        xhr.open("GET", '/challenge15min');
        xhr.onload = () => {
            let json = JSON.parse(xhr.responseText);
            json = grph.Transformer(json).randomTransform();
            this.setState({brdJson: json});
        };
        xhr.send();
    },

    render: function () { 
        const brdJson = this.state.brdJson;

        return brdJson ? (<Board key={ 'challenge15:play' } dayName={ 'challenge15' } pos={brdJson.puzzleId}  brdJson={ brdJson } initmode={ 'play' } random={ true } timeOut={ 900 } /> )
                       : null;
    },

});


var _hidatoApp = React.createClass({displayName: 'HidatoApp',

    componentDidMount: function() {
        var xhr = new XMLHttpRequest();
        //console.log("hidato puzzle requested");
        xhr.open("GET", '/hidato');
        xhr.onload = () => {
            let json = JSON.parse(xhr.responseText);
            //console.log("puzzle received : "+json.pubID);
            this.props.dispatch({type: 'loadHidatoBoard', json: json, side: 30})
        }
        xhr.send();
    },

    render: function () { 
        return this.props.cells ? (<Hidato key={ 'hidato:play' } dispatch={ this.props.dispatch } board={ this.props }  /> )
                       : null;
    },
})

export let HidatoApp = connect(state => {
        //console.log("connect called :" + (state && state.hidato ? state.hidato.toString() : "no state") );
        return (state ? state.hidato : null); 
    } )(_hidatoApp);

var _fp = React.createClass({displayName: 'FP',
    mixins: [History],

    componentWillMount: function() { 
        //console.log("mounting FP");
        this.props.dispatch(fetchContents());
        this.initComponent(this.props); 
    },

    componentWillReceiveProps: function(nextProps) { this.initComponent(nextProps); }, 
    initComponent: function(props) {  
        var { dayName } = props.params;
        //console.log("day :" + dayName);
        if (!dayName || dayName === '_#_') {
            //console.log("pushState : /"+firstDay);
            this.history.pushState(null, "/" + firstDay);
            //return null;
        }


    },

    render: function() {

        var { dayName } = this.props.params;
        var { date } = this.props;
        //console.log("rendering FP for day : " + dayName);
        if (!dayName || dayName === '_#_') {
            //console.log("pushState : /"+firstDay);
            //this.history.pushState(null, "/" + firstDay);
            return null;
            //dayName = firstDay;
        }
        let userName = localStorage.getItem('pseudoq.userName');
        let dt = oxiDate.parse(date, 'yyyyMMdd');
        let items = [];
        var i = 7;
        while (i > 0) {
            let cdt = oxiDate.toFormat(dt, 'yyyyMMdd');
            let dy = oxiDate.toFormat(dt, "DDDD");
            //console.log(dy);
            items.push( <LinkContainer key={ dy } to={ "/" + dy } ><NavItem>{ dy }</NavItem></LinkContainer> );
            dt = oxiDate.addDays(dt, -1);
            i = i - 1;
        }

        items.push( <LinkContainer key="challenge5" to="/challenge5"><NavItem>5 minute Challenge</NavItem></LinkContainer> );

        items.push( <LinkContainer key="challenge15" to="/challenge15"><NavItem>15 minute Challenge</NavItem></LinkContainer> );

        items.push( <LinkContainer key="hidato" to="/hidato"><NavItem>Hidato</NavItem></LinkContainer> );

        return ( 
              <div>
                <div className="row">
                  <div className="col-md-12">
                      <p>Welcome to PseudoQ.net.  Here we publish puzzles (mainly murderous Sudoku variants) that are playable online.
                      </p>
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

export let FP = connect(state => {
        //console.log("connect called :" + (state && state.hidato ? state.hidato.toString() : "no state") );
        //if (!state) return null;
        return (state ? state.days : null); 
    } )(_fp);



var _help = React.createClass({displayName: 'Help',

    render: function() {
        return (<PseudoqHelp board={ this.props.tutorial } />);
    }
});

export let Help = connect(state => { return  {tutorial: state.days.tutorial}; } )(_help);

var _daily = React.createClass({displayName: 'Daily',

    render: function() {
        let { dayName } = this.props.params;
        let rslt = [];
        let o = this.props[dayName];
        let dt = oxiDate.parseUTC(o.date, 'yyyyMMdd');
        let cdt = oxiDate.toFormat(dt, "DDDD, MMMM D");
        let brds = o.boards;
        var pos = 0;
        for (var j in brds) {
            if (brds.hasOwnProperty(j)) {
                let js = brds[j];
                let pzl = dayName + "/" + pos;
                let _dispatch = this.props.dispatch;
                let dispatch = function (act) {
                    act.dayName = dayName;
                    act.pos = pos;
                    return _dispatch(act);
                }
                if (js.gameType === 'Hidato') {
                    rslt.push( <Hidato key={ pzl+':view' } dayName={ dayName } pos={ pos } dispatch={ dispatch } brdJson={ js } mode='view'  /> );
                }
                else {
                    rslt.push( <Board key={ pzl+':view' } dayName={ dayName } pos={ pos } brdJson={ js } initmode='view'  /> );
                }
                pos++;
            }
        }
        return ( 
          <div>
            <h2>Puzzles for  { cdt } </h2>
            <div>{ rslt }</div>
          </div>
        );

    }    
});

export let Daily = connect(state => state.days)(_daily);

var _playPage = React.createClass({

    componentWillMount: function() {
        //console.log("mounting PlayPage");
        this.props.dispatch(fetchContents());
    },

    render: function() {
        //console.log('rendering PlayPage');
        const { dayName, pos } = this.props.params;
        const js = findPuzzle(this.props, dayName, pos);
        const puzzle = dayName + "/" + pos;

        if (!js) return null;

        if (js.gameType === 'Hidato') {
            let _dispatch = this.props.dispatch;
            let dispatch = function (act) {
                act.dayName = dayName;
                act.pos = pos;
                return _dispatch(act);
            }
            return ( <Hidato key={ puzzle+':play' } dayName={ dayName } pos={ pos } board={ js } dispatch={ dispatch }  mode='play'  /> );
        } else {
            return (<Board key={ puzzle+':play' } dayName={ dayName } pos={ pos}  brdJson={ js } initmode={ 'play' }/> )
        }
    }
});

export let PlayPage = connect(state => state.days)(_playPage);

export let ChangeMoniker = React.createClass({
    mixins: [ History ],

    getInitialState: function() {
        return {
            response: {ok: true},
            moniker: localStorage.getItem('pseudoq.userName')
        };
    },

    changeMoniker: function() {
        this.setState({moniker: this.refs.moniker.getValue()});
    },

    saveMoniker: function() {
        let newName = this.state.moniker;
        //console.log("saving moniker : "+newName);

        let xhr = new XMLHttpRequest();   
        xhr.open("POST", "/newMoniker");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xhr.onload = () => {
            let rsptxt = xhr.responseText;
            console.log("response received : "+rsptxt);           
            if(xhr.status !== 200) { 
                let msg = 'failed : ' + xhr.status + " - " + rsptxt;
                alert(msg);
            } else {
                let rsp = JSON.parse(rsptxt);
                if (rsp.ok) {
                    localStorage.setItem('pseudoq.userName', newName);
                    this.history.goBack();
                }
                else this.setState({response: rsp}); 
            }
        };
        xhr.send(JSON.stringify({userName: newName}));

    },

    render: function() {
        let xtra = this.state.response.ok ? <div/> : ( <div className="row">The moniker you requested is already taken.  You may wish to try another.</div> );
        return (
            <div>
              <div className="row">
                 <p>Enter new moniker, then press Save</p> 
              </div>
              <div className="row">
                <div className="col-md-4">
                  <Input type="textarea" ref="moniker" value={ this.state.moniker } onChange={this.changeMoniker} />   
                </div>
                <Button onClick={this.saveMoniker} >Save</Button>
              </div>
              { xtra }
            </div>               
        )
    }
});


export function daysReducer(st, action) {
    if (!st) return initDays(today);
    
    if (action.dayName) {
        let {dayName,pos} = action;
        let brd = st[dayName][pos];
        if (brd.gameType === 'Hidato') {
            brd = hidatoReducer(brd, action);
            let brds = st[dayName].slice(0);
            brds[pos] = brd;
            return Objectassign({}, st, {[dayName]: brds});
        }
    }

    switch (action.type) {
    case 'loadContents':
        return loadContents(action.contents);
    default:
        return st;
    };
}


function tests() {
    console.log('running tests');
    let xhr = new XMLHttpRequest();   
    xhr.open("POST", "/blog/save");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = () => { console.log("got here"); };
    let post = {title: 'This is a test', body: 'move along, nothing to see here', tags: ['tag1', 'tag2', 'thirdOne']};
    xhr.send(JSON.stringify(post));
};

//tests();


/*
var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="help" path="/help" handler={Help}/>
    <Route name="about" path="/about" handler={About}/>
    <Route name="login" path="/login" handler={Login} />
    <Route name="logout" path="/logout" handler={Logout} />
    <Route name="changeMoniker" path="/changeMoniker" handler={ChangeMoniker}/>
    <Route name="challenge5" path="/challenge5" handler={Challenge5min} />
    <Route name="challenge15" path="/challenge15" handler={Challenge15min} />
    <Route name="hidato" path="/hidato" handler={HidatoApp} />
    <Route name="frontpage" path="/" handler={FP}>
      <Redirect from="/_=_" to="frontpage" />
      <Route name="daily" path="/:dayName" handler={Daily}/>
    </Route>
    <Route name="play" path="/:dayName/:pos" handler={PlayPage}/>
  </Route>
);

function daysReducer(st, action) {
    if (!st) {
        //console.log ('no state');
        st = initDays(today);
    } else if (action.dayName) {
        let {dayName,pos} = action;
        let brd = st[dayName][pos];
        if (brd.gameType === 'Hidato') {
            brd = hidatoReducer(brd, action);
            let brds = st[dayName].slice(0);
            brds[pos] = brd;
            return Objectassign({}, st, {[dayName]: brds});
        }
    }

    switch (action.type) {
    case 'loadContents':
        return loadContents(action.contents);
    default:
        return st;
    };
}


function reducer(state, action) {
    return {
        hidato: hidatoReducer(state ? state.hidato : null, action),
        days: daysReducer(state ? state.days : null, action),
    };
}

const loggerMiddleware = createLogger();

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware // lets us dispatch() functions
  //,loggerMiddleware // neat middleware that logs actions
)(createStore);

const store = createStoreWithMiddleware(reducer);

var main = function() {
    //document.addEventListener('DOMContentLoaded', function() {
    $(function() {
        Router.run(routes, (Handler, routerState) => {
            React.render(
                <Provider store={store}>
                    {() => <Handler routerState={routerState} /> }
                </Provider> , 
                document.getElementById("page-body")
            );
        });

    });
};

module.exports = main;

*/


