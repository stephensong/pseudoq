"use strict";

window.jQuery = require('jquery');

require('./css/bootstrap-flatly.css');
require('bootstrap');

const React = require('react');

const ReactBootStrap = require('react-bootstrap');
const { Button, Input, Table } = ReactBootStrap;
import { History, Link } from 'react-router';
const Flex = require('flex.jsx');


export function initUser() {
    return {
        moniker: localStorage.getItem('pseudoq.userName'),
        stats: undefined
    };
}

const NEWMONIKER = 'user/NEWMONIKER'
const INITSTATS = 'user/INITSTATS'

export function userReducer(state, action) {
    switch (action.type) {
        case INITSTATS:
            return {...state, stats: action.stats};

        case NEWMONIKER:
            return {...state, moniker: action.newMoniker};

        default: 
            return state;
    }
}

const UserStats = React.createClass({displayName: 'UserStats',

    componentWillMount() {
        //if (this.props.stats) return;
        let xhr = new XMLHttpRequest();   
        xhr.open("GET", "/userstats");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = () => {
            let rsp = JSON.parse(xhr.responseText);
            if (rsp.ok) this.props.dispatch({type: INITSTATS, stats: rsp.rows});
        };
        xhr.send();
    },

    render() {
        if (!this.props.stats) return null;
        let rows = [];
        this.props.stats.forEach(function (r) {
            rows.push( 
                <tr key={ r.gameType } >
                     <td>{ r.gameType }</td>
                     <td>{ r.gamescompleted }</td>
                     <td>{ r.avgmoves }</td>
                     <td>{ r.avgmoves_all }</td>
                </tr>
            );
        });


        return (
            <div>
              <p>Your current stats:</p>
              <Table striped bordered condensed hover>
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th># completed</th>
                      <th>Average moves</th>
                      <th>Average moves - all users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows}
                  </tbody>
              </Table>
            </div>    
            )
    }


})

export const Login = React.createClass({displayName: 'Login',
    render() {
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

export const Logout = React.createClass({displayName: 'Logout',
    mixins: [History],

    componentDidMount() {
        var xhr = new XMLHttpRequest();
        console.log("logout requested");
        xhr.open("GET", '/logout');
        xhr.onload = () => {
            localStorage.removeItem('pseudoq.authprov');
            this.history.goBack();
        };
        xhr.send();
    },

    render() { return null; },
});


const ChangeMoniker = React.createClass({

    getInitialState() {
        return {
            response: {ok: true},
            newMoniker: this.props.moniker,
        };
    },

    changeMoniker() {
        this.setState({newMoniker: this.refs.moniker.getValue()});
    },

    saveMoniker() {
        let newName = this.state.newMoniker;
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
                this.setState({response: rsp}); 
                if (rsp.ok) {
                    localStorage.setItem('pseudoq.userName', newName);
                    this.props.dispatch({type: NEWMONIKER, newMoniker: newName})
                }
            }
        };
        xhr.send(JSON.stringify({userName: newName}));

    },

    render() {
        console.log("rendering ChangeMoniker");
        let xtra = this.state.response.ok ? null : ( <div className="row">The moniker you requested is already taken.  Please try another.</div> );
        return (
            <div>
              <p>You can change your moniker, by editing below, then pressing Save.</p>
              <Flex row style={{ justifyContent: 'flex-start' }} >
                  <Input type="text" ref="moniker" value={ this.state.newMoniker } onChange={this.changeMoniker} style={{width: 300, height: 30 }} />   
                  <Button bsSize='small' onClick={this.saveMoniker} style={{ height: 30 }} >Save</Button>
              </Flex>
              <p>{ xtra }</p>
            </div>               
        )
    }
});

export const UserDetails = React.createClass({
    render() {
        const {dispatch, stats, moniker} = this.props;
        return (
            <div>
                <UserStats stats={ stats }  dispatch={ dispatch } />
                <ChangeMoniker dispatch={ dispatch } moniker={ moniker } />
            </div>
            );
    }
});

