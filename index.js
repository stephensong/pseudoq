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
import { compose, createStore, applyMiddleware } from 'redux';

//import { devTools, persistState } from 'redux-devtools';

const {
    daysReducer,
    App,
    About,
    Help,
    Login,
    Logout,
    Daily,
    PlayPage,
    FP,
    ChangeMoniker,
    HidatoApp,
    Challenge5min,
    Challenge15min
} = main;

let { blogReducer, Blog, BlogPost, BlogEntry} = require('./blog.jsx');
let { linksReducer, Links} = require('./links.jsx');

const history = createHashHistory({queryKey: false});

const loggerMiddleware = createLogger();

/*
const enhCreateStore = compose(
  devTools(),
  // Lets you write ?debug_session=<name> in address bar to persist debug sessions
  //persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
)(createStore);
*/

const finalCreateStore =  applyMiddleware(thunkMiddleware 
                  //,loggerMiddleware
                  )(createStore); 

var today = new Date();

const initialState = {
    today,
    days: undefined,     // keyed by dayName/pos
    blog: undefined,
    links: undefined
};


function reducer(state = initialState, action) {
    let days = daysReducer(state.days, action);
    let blog = blogReducer(state.blog, action);
    let links = linksReducer(state.links, action);
    let rslt = {...state, days, blog, links  };
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
        <Route path="/changeMoniker" component={ChangeMoniker}/>
        <Route path="/challenge5" component={Challenge5min} />
        <Route path="/challenge15" component={Challenge15min} />
        <Route path="/blog/:id" component={BlogEntry} />
        <Route path="/blog" component={Blog} />
        <Route path="/links" component={Links} />
        <Route path="/hidato" component={HidatoApp} />
        <Route path="/:dayName/:pos" component={PlayPage}/>
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

@connect(state => state)
class Root extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  }

  render () {
    //console.log("rendering Root");
    return (
      <div>{getRootChildren(this.props)}</div>
    )
  }
}



ReactDOM.render(
  <Provider store={store}>
    <Root history={history} />
  </Provider>
, document.getElementById('page-body'))


