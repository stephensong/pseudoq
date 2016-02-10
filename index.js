"use strict";

window.jQuery = require('jquery');

var main = require('./main.jsx');

/* global __DEVTOOLS__ */
//import '../assets/stylesheets/index.css'

import oxiDate from './oxidate.js';


import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Redirect, Router, Route, IndexRoute } from 'react-router';
import { Provider, connect } from 'react-redux';
//import { IntlProvider } from 'react-intl'
import createBrowserHistory from 'history/lib/createBrowserHistory';
import createHashHistory from 'history/lib/createHashHistory';
//import configureStore from './utils/configure-store'
//import * as storage from './persistence/storage'
//import * as components from './components'
//import * as constants from './constants'
//import * as i18n from './i18n'

import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { compose, createStore, applyMiddleware, combineReducers } from 'redux';

//import { devTools, persistState } from 'redux-devtools';

const {
    daysReducer,
    About,
    Help,
    Daily,
    PlayPage,
    FP,
    HidatoApp,
    Challenge5min,
    Challenge15min,
    initDays
} = main;

import { User, Login, Logout, userReducer, initUser } from 'user.jsx';

import _app from 'App.jsx';
export let App = connect(state => state )(_app);

import { blogReducer, Blog, BlogEntry} from 'blog.jsx';
import { linksReducer, Links} from 'links.jsx';
import { multiPlayReducer, MultiPlayerGame} from 'gameclient.jsx';

const history = createHashHistory({queryKey: false});

const loggerMiddleware = createLogger();

/*
const enhCreateStore = compose(
  devTools(),
  // Lets you write ?debug_session=<name> in address bar to persist debug sessions
  //persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
)(createStore);
*/

const _refresh = React.createClass({displayName: 'Refresh',

    componentDidMount() {
        history.go(-2);
        this.props.dispatch({type: 'user/LOAD'});
    },
    render() { return null; },
});

const Refresh = connect(state => state)(_refresh);

const finalCreateStore =  applyMiddleware(thunkMiddleware 
                  //,loggerMiddleware
                  )(createStore); 

const today = new Date();

const initialState = {
    today,
    days: initDays(today),     // keyed by dayName/pos
    blog: undefined,
    links: undefined,
    user: initUser(),
    multi: undefined,
    seq: 0,
};

/*
let combReducer = combineReducers({
        days: daysReducer, 
        blog: blogReducer, 
        links: linksReducer, 
        user: userReducer, 
        multi: multiPlayReducer
    });
*/

function reducer(state = initialState, action) {
    let days = daysReducer(state.days, action);
    let blog = blogReducer(state.blog, action);
    let links = linksReducer(state.links, action);
    let user = userReducer(state.user, action);
    let multi = multiPlayReducer(state.multi, action);
    //if (days === state.days && blog === state.blog && links === state.links && user === state.user && multi === state.multi) return state;
    let seq = state.seq;
    if (action === 'FORCEREFRESH') seq = seq + 1;
    let rslt = {...state, days, blog, links, user, multi, seq };
    return rslt;
}

function renderRoutes (history) {
    //console.log("renderRoutes called");

    return (
    <Router key='router' history={history}>
      <Route component={App}>
        <Route path="/help" component={Help}/>
        <Route path="/about" component={About}/>
        <Route path="/login" component={Login} />
        <Route path="/logout" component={Logout} />
        <Route path="/user" component={User}/>
        <Route path="/multi" component={MultiPlayerGame} />
        <Route path="/challenge5" component={Challenge5min} />
        <Route path="/challenge15" component={Challenge15min} />
        <Route path="/blog/:id" component={BlogEntry} />
        <Route path="/blog" component={Blog} />
        <Route path="/links" component={Links} />
        <Route path="/hidato" component={HidatoApp} />
        <Route path="/:dayName/:pos" component={PlayPage}/>
        <Route path="/refresh" component={Refresh}>
            <Route path="_=_" component={Refresh} />
        </Route>
        <Redirect from="/_=_" to="/" />
        <Route path="/" component={FP} >
          <Route path=":dayName" component={Daily}/>
        </Route>
      </Route>
    </Router>
  );
}



function getRootChildren (props) {
       // console.log("getRootChildren called");

  const rootChildren = [
      renderRoutes(props.history)
  ];
/*
  if (process.env.NODE_ENV !== 'production' ) {
    const { DevTools, DebugPanel, LogMonitor } = require('redux-devtools/lib/react');
    rootChildren.push(
      <DebugPanel key="debug-panel" top right bottom>
        <DevTools store={store} monitor={LogMonitor} />
      </DebugPanel>
    );
  }
  */
  return rootChildren;
}

const store = finalCreateStore(reducer, initialState);

class _root extends React.Component {

  render () {
    //console.log("rendering Root");
    return (
      <div>{getRootChildren(this.props)}</div>
    )
  };

}

_root.propTypes = {
    history: PropTypes.object.isRequired
  };


let Root = connect(state => state)(_root);


ReactDOM.render(
  <Provider store={store}>
    <Root history={history} />
  </Provider>
, document.getElementById('page-body'))


