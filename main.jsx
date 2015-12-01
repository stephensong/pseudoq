"use strict";

window.jQuery = require('jquery');
const $ = jQuery;

require('./css/bootstrap-flatly.css');
require('bootstrap');


const oxiDate = require('./oxidate.js');
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


function loadContents( current, o ) {
    console.log('loadContents called');
    let brds = o.boards;
    let dt = current.today;
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

export function initDays(dt) {
    console.log("initDays called");
    const today = dt;
    var o = Object.create(null);
    o.date =  oxiDate.toFormat(dt, 'yyyyMMdd');
    o.today = dt;

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
export function fetchContents(today) {
    console.log("fetchcontents called");

    return function (dispatch) {
        if (fetchDone) return;
        let xhr = new XMLHttpRequest();
        let cdt = oxiDate.toFormat(today, 'yyyyMMdd');

        xhr.open("GET", '/puzzles/'+cdt);
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
    if (!st) throw new Error("initDays not called");  //.return initDays(today);

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
            this.props.dispatch({type: 'psq/LOAD', props: json, dayName: 'challenge5', pos: 0 });
        };
        xhr.send();
    },

    render: function () {
        let {board, dispatch} = this.props; 
        if (!board.allRegions) return null;
        console.log("rendering challenge5");

        return ( <PseudoqBoard key={ 'challenge5:play' } dayName={ 'challenge5' } pos={ 0 } dispatch={ dispatch } newGame={ this.newGame } {...board} mode={ 'play' } random={ true } timeOut={ 300 } /> );
    },

});

export let Challenge5min = connect(state => {
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
            this.props.dispatch({type: 'psq/LOAD', props: json, dayName: 'challenge15', pos: 0 });
        };
        xhr.send();
    },

    render: function () { 
        let {board, dispatch} = this.props; 
        if (!board.allRegions) return null;
        console.log("rendering challenge15");

        return ( <PseudoqBoard key={ 'challenge15:play' } dayName={ 'challenge15' } pos={ 0 }  dispatch={ dispatch } newGame={ this.newGame } {...board } mode={ 'play' } random={ true } timeOut={ 300 } /> );
    },

});

export let Challenge15min = connect(state => {
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
export let FP = connect(state => {
        let date = state.today;
        return { date }; 
    } )(_fp);


var _daily = React.createClass({displayName: 'Daily',

    render() {
        let {dayName, date, boards, dispatch} = this.props;
        if (dayName !== this.props.params.dayName) console.log("Something farked");
        if (!boards) return null;
        let rslt = [];
        let dt = oxiDate.parse(date, 'yyyyMMdd');
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

