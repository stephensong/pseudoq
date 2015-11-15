"use strict";

window.jQuery = require('jquery');
const $ = jQuery;

require('./css/bootstrap-flatly.css');
require('bootstrap');


const oxiDate = require('./oxidate.js');
const { isMember } = require('./utils.js');
const grph = require('graphics');

const React = require('react');

const ReactBootStrap = require('react-bootstrap');
const { Button, Input } = ReactBootStrap;

const NavItem = ReactBootStrap.NavItem;
const Nav = ReactBootStrap.Nav;

export const About = require('PseudoqAbout.jsx');
const PseudoqHelp = require('PseudoqHelp.jsx');
import {psqReducer, PseudoqBoard} from 'PseudoqBoard.jsx';

import { connect } from 'react-redux';
import { History, Link } from 'react-router';
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';

import { hidatoReducer, Hidato } from 'Hidato.jsx';

const LOADCONTENTS = 'main/LOADCONTENTS';

const today = oxiDate.toUTC(new Date());
const firstDay = oxiDate.toFormat(today, 'DDDD');

function loadContents( current, o ) {
    console.log('loadContents called');
    let brds = o.boards;
    let dt = today;
    let days = {...current};
    let diff = false;

    let brdsDiffer = (o1,o2) => {
        //console.log("differ called");
        if (!o2) {diff = true; return true; };
        let ks1 = Object.keys(o1);
        let ks2 = Object.keys(o2);
        if (ks1.length != ks2.length) { diff = true; return true; }
        return ks1.some( ky => { 
            let b1 = o1[ky];
            let b2 = o2[ky];
            if (!b2 || b1.pubID !== b2.pubID) {diff = true; return true; }
            return false;
        });

    }

    var i = 7;
    while (i > 0) {
        let cdt = oxiDate.toFormat(dt, 'yyyyMMdd');
        //console.log('cdt :'+cdt);
        let dy = oxiDate.toFormat(dt, "DDDD");
        let boards = brds[cdt];
        if (brdsDiffer(days[dy].boards,boards)) days[dy].boards = boards;
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
    if (brdsDiffer(days.tomorrow.boards,brds[days.tomorrow.date])) days.tomorrow.boards = brds[days.tomorrow.date];
    if (brdsDiffer(days.tutorial.boards,{0: brds.tutorial})) {
        diff = true; 
        days.tutorial.boards[0] = brds.tutorial; 
    }
    return diff ? days : current;
};

function initDays() {
    console.log("initDays called");
    let dt = today;
    var o = Object.create(null);
    o.date =  oxiDate.toFormat(dt, 'YYYYMMDD');

    var i = 7;
    while (i > 0) {
        let cdt = oxiDate.toFormat(dt, 'yyyyMMdd');
        let dy = oxiDate.toFormat(dt, "DDDD");
        o[dy] = {dayName: dy, date: cdt, boards: {} };
        dt = oxiDate.addDays(dt, -1);
        i = i - 1;
    }
    dt = oxiDate.addDays(today, 1);
    o.tomorrow = {date: oxiDate.toFormat(dt, 'yyyyMMdd'), boards: {0: {}} }; 
    o.tutorial = {dayName: 'tutorial', boards: {0: {}} };
    o.hidato = {dayName: 'hidato', boards: {0: {}} };
    o.challenge5 = {dayName: 'challenge5', boards: {0: {}} };
    o.challenge15 = {dayName: 'challenge15', boards: {0: {}} };


    let stg = localStorage.getItem('pseudoq.boards');

    if (stg) {
        try {
            let t = JSON.parse(stg);
            o = loadContents(o,t);

        }
        catch (e) {
            console.log("error parsing local storage : "+e);
            localStorage.removeItem('pseudoq.boards');
        }
    }

    return o;
};

// should get called exactly once for each mount of the app
let fetchDone = false
function fetchContents() {
    console.log("fetchcontents called");

    return function (dispatch) {
        if (fetchDone) return;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", '/puzzles');
        xhr.onload = () => {
            localStorage.setItem('pseudoq.userName', xhr.getResponseHeader('X-psq-moniker'));
            let prov = xhr.getResponseHeader('X-psq-authprov')
            if (prov)  localStorage.setItem('pseudoq.authprov', prov);
            else localStorage.removeItem('pseudoq.authprov');

            let grps = xhr.getResponseHeader('X-psq-groups') || '';
            grps = grps.replace('}',',');
            localStorage.setItem('pseudoq.groups', grps);

            if (xhr.status == 200) {
                try { 
                    let t = JSON.parse(xhr.responseText);
                    localStorage.setItem('pseudoq.boards', xhr.responseText);
                    dispatch({type: LOADCONTENTS, contents: t});
                    fetchDone = true;
                } catch (e) {
                    console.log("error (parsing response?) : "+e);
                }
            }
        };
        xhr.send();
    }
};

export function daysReducer(st, action) {
    if (!st) return initDays(today);

    let typ = action.type;
    if (typ === LOADCONTENTS) {
        return loadContents(st, action.contents);
    }

    let {dayName,pos} = action;
    if (dayName) {
        let boards = st[dayName].boards;
        if (!boards) return st;
        let brd = boards[pos];
        if (!brd) return st;
        if (dayName === 'hidato' || brd.gameType === 'Hidato') brd = hidatoReducer(brd, action);
        else brd = psqReducer(brd, action);
        if (brd !== boards[pos]) {
            let brds = {...boards, [pos]: brd};
            let day = {...st[dayName], boards: brds }
            return {...st, [dayName]: day};
        }
    }

    return st;
}

const _app = React.createClass({displayName: 'App',

    handleDoubleClick: function(e) {
        e.preventDefault;
    },

    componentDidMount: function() { 
        this.props.dispatch(fetchContents());
    },

    render: function () {
        let userName = localStorage.getItem('pseudoq.userName');
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
                      <li><Link to='/changeMoniker' >User : { userName } </Link></li>
                  </ul>
                </div>
              </div>
              {this.props.children}
            </div>
        );
    }
});

export let App = connect(state => state )(_app);

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

export let Login = React.createClass({displayName: 'Login',
    render: function () {
        return (
            <div>
      <ul>
        <li><a href="/auth/facebook">Sign in via Facebook</a></li>
        <li><a href="/auth/twitter">Sign in via Twitter</a></li> 
      </ul> 
      <p/>       
      <h3>Security Policy</h3>
      <p>This site refuses to ask you for a password.  This means we don&apos;t have to store, encrypt or otherwise
      concern ourselves with any of your personal data.  Currently, the <strong>only</strong> thing we store about you
      is your moniker, along with games in progress, solutions submitted etc.</p>
      <p>In order to still reliably identify you, allowing e.g. for games in progress to be accessed across multiple devices, we
      ask that you identify yourself using a "social login", currently either Facebook or Twitter.  Essentially, this means that we rely on you
      identifying yourself to a third party, who then vouches for your identity to us.  If you would prefer to use another social
      login provider (Google, LinkedIn, Pinterest, ...) please email your request, and we will endeavour to accomodate you.  
      </p>
           </div>
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

var _help = React.createClass({displayName: 'Help',

    render() {
        let {tutorial, dispatch} = this.props;
        if (!tutorial) return null;
        return (<PseudoqHelp board={ tutorial } dispatch={ dispatch } />);
    }
});

export let Help = connect(state => { return  {tutorial: state.days.tutorial.boards[0]}; } )(_help);


let _challenge5min = React.createClass({displayName: 'Challenge5min',

    componentDidMount() {
        this.newGame()
    },

    newGame() {
        var xhr = new XMLHttpRequest();
        console.log("challenge5min puzzle requested");
        xhr.open("GET", '/challenge5min');
        xhr.onload = () => {
            let json = JSON.parse(xhr.responseText);
            console.log("challenge5min puzzle received");
            json = grph.Transformer(json).randomTransform();
            this.dispatch({type: 'psq/LOAD', props: json});
        };
        xhr.send();
    },

    render: function () { 
        if (!this.props.allRegions) return null;
        console.log("rendering challenge5");

        return ( <PseudoqBoard key={ 'challenge5:play' } dayName={ 'challenge5' } pos={ 0 }  dispatch={this.dispatch} newGame={ this.newGame } {...this.props } mode={ 'play' } random={ true } timeOut={ 300 } /> );
    },

});

export let Challenge5min = connect((state,props) => {
    return {board: state.days.challenge5.boards[0] };
})(_challenge5min);


let _challenge15min = React.createClass({displayName: 'Challenge15min',

    componentDidMount() {
        this.newGame()
    },

    newGame() {
        var xhr = new XMLHttpRequest();
        console.log("challenge15min puzzle requested");
        xhr.open("GET", '/challenge15min');
        xhr.onload = () => {
            let json = JSON.parse(xhr.responseText);
            console.log("challenge15min puzzle received");
            json = grph.Transformer(json).randomTransform();
            this.dispatch({type: 'psq/LOAD', props: json});
        };
        xhr.send();
    },

    render: function () { 
        if (!this.props.allRegions) return null;
        console.log("rendering challenge5");

        return ( <PseudoqBoard key={ 'challenge15:play' } dayName={ 'challenge15' } pos={ 0 }  dispatch={this.dispatch} newGame={ this.newGame } {...this.props } mode={ 'play' } random={ true } timeOut={ 300 } /> );
    },

});

export let Challenge15min = connect((state,props) => {
    return {board: state.days.challenge15.boards[0] };
})(_challenge15min);


const _hidatoApp = React.createClass({displayName: 'HidatoApp',

    render: function () { 
        let dayName = 'hidato';
        let pos = 0;
        return (<Hidato { ...this.props }  key={ 'hidato:play' } dayName={ dayName } pos={ pos } dispatch={ this.props.dispatch } mode='play' /> );
    },
})

export let HidatoApp = connect( state => { return state.days['hidato'].boards[0];  }
                              )(_hidatoApp);

var _fp = React.createClass({displayName: 'FP',
    mixins: [History],

    componentWillMount: function() { 
        console.log("mounting FP");
        //this.props.dispatch(fetchContents());
        this.initComponent(this.props); 
    },

    componentWillReceiveProps: function(nextProps) { this.initComponent(nextProps); }, 
    initComponent: function(props) {  
        var { dayName } = props.params;
        //console.log("day :" + dayName);
        if (!dayName || dayName === '_#_') {
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
export let FP = connect(state => {
        let date = state.today;
        return { date }; 
    } )(_fp);


var _daily = React.createClass({displayName: 'Daily',

    render() {
        let {dayName, date, boards, dispatch} = this.props;
        if (dayName !== this.props.params.dayName) console.log("Something farked");
        let rslt = [];
        let dt = oxiDate.parseUTC(date, 'yyyyMMdd');
        let cdt = oxiDate.toFormat(dt, "DDDD, MMMM D");

        Object.keys(boards).forEach( pos => {
            let brd = boards[pos];
            if (brd) {
                let pzl = dayName + "/" + pos;
                if (brd.gameType === 'Hidato') {
                    rslt.push( <Hidato       key={ pzl+':view' } dayName={ dayName } pos={ pos } dispatch={ dispatch } {...brd} mode='view' /> );
                }
                else {
                    rslt.push( <PseudoqBoard key={ pzl+':view' } dayName={ dayName } pos={ pos } dispatch={ dispatch } {...brd} mode='view'  /> );
                }
            }
        });

        return ( 
          <div>
            <h2>Puzzles for  { cdt } </h2>
            <div>{ rslt }</div>
          </div>
        );

    }    
});

export let Daily = connect((state,props) => {
        //console.log(JSON.stringify(props.params));
        let {dayName} = props.params;
        return state.days[dayName]; 
    })(_daily);

var _playPage = React.createClass({

    render() {
        //console.log('rendering PlayPage');
        const {dayName, pos, board, dispatch} = this.props;
        if (!board) return null;
        const puzzle = dayName + "/" + pos;
        let mode = board.mode || 'play';
        if (mode === 'view') mode = 'play';

        if (board.gameType && board.gameType === 'Hidato') {
            return ( <Hidato       key={ puzzle+':play' } {...board} dispatch={ dispatch } dayName={ dayName } pos={ pos } mode={ mode } /> );
        } else {
            return ( <PseudoqBoard key={ puzzle+':play' } {...board} dispatch={ dispatch } dayName={ dayName } pos={ pos } mode={ mode } /> );
        }
    }
});

export let PlayPage = connect((state,props) => {
    const { dayName, pos } = props.params;
    return {dayName, pos, board: state.days[dayName].boards[pos] };
})(_playPage);



function tests() {
    console.log('running tests');
    let xhr = new XMLHttpRequest();   
    xhr.open("POST", "/blog/save");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = () => { console.log("got here"); };
    let post = {title: 'This is a test', body: 'move along, nothing to see here', tags: ['tag1', 'tag2', 'thirdOne']};
    xhr.send(JSON.stringify(post));
};

