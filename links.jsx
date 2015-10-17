"use strict";

window.jQuery = require('jquery');

require('./css/bootstrap-flatly.css');
require('./css/psq.css');
require('bootstrap');
let oxiDate = require('./oxidate.js');
let utils = require('./utils.js');

const timeSpan = require('timeSpan');

const React = require('react');
const ReactDOM = require('react-dom')
const ReactBootStrap = require('react-bootstrap');
const Flex = require('flex.jsx');

const { Button, Input } = ReactBootStrap;

const Remarkable = require('remarkable');
const md = new Remarkable({html: true});

import { connect } from 'react-redux';

export function blankLink() {
    return {id: 0,
            published: null,
            lastedit: oxiDate.createUTC(),
            url: '',
            notes: '',
            tags: [],
            expanded: false,
            editing: false
           };
}

const LOAD = 'link/LOAD';
const SELECT = 'link/SELECT';
const UPDATE = 'link/UPDATE';
const STARTEDIT = 'link/STARTEDIT';
const STOPEDIT = 'link/STOPEDIT';
const EDITNEW = 'link/EDITNEW';
const EXPAND = 'link/EXPAND';
const UNEXPAND = 'link/UNEXPAND';

let initState = {
    links: [],
    currentLink: null,
    editing: false
}

export function linksReducer(state = initState, action) {
    console.log("linksReducer called");
    switch (action.type) {

        case LOAD:
            if (action.links.length === 0) return state;
            let rslt = {... state, currentLink: action.links[0], links: action.links};
            return rslt;

        case SELECT:
            return {...state, currentLink: action.link};

        case EDITNEW:
            return {...state, currentLink: {...blankLink(), editing: true} };

        case EXPAND:
            return {...state, currentLink: {...state.currentLink, expanded: true} };

        case UNEXPAND:
            return {...state, currentLink: {...state.currentLink, expanded: false} };

        case STARTEDIT:
            return {...state, currentLink: {...currentLink, editing: true} };

        case STOPEDIT:
            return {...state, currentLink: {...currentLink, editing: false} };

        case UPDATE:
            let links = state.links
            let i = links.findIndex(p => p.id === action.link.id);
            let newlinks = i > 0 ? links.map(p => p.id === i ? action.link : p)
                                 : [action.link, ...links];
            return {...state, currentLink: {...action.link, editing: false}, links: newlinks};

        default: 
            return state;
    }
}

let LinkEntry = React.createClass({

    save() {
        let url = this.refs.url.getValue();
        let tags = this.refs.tags.getValue().split(/[\s,]+/);
        let notes = this.refs.notes.getValue();
        let xhr = new XMLHttpRequest();   
        let link = {...this.props.link, url, notes, tags};
        xhr.open("link", "/link");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = () => { 
            let rslt = JSON.parse(xhr.responseText);        
            if (rslt.ok) {
                let {id, lastedit, published} = rslt.results;     
                let newlink = {...link, id, lastedit: oxiDate.parseUTC(lastedit), published: oxiDate.parseUTC(published)};
                this.props.dispatch({type: UPDATE, link: newlink});
            }
        };
        xhr.send(JSON.stringify(link));
    },

    startEdit() { this.props.dispatch({type: STARTEDIT}) },
    stopEdit() { this.props.dispatch({type: STOPEDIT}) },
    editNew() { this.props.dispatch({type: EDITNEW}) },

    render() {
        let link = this.props.link; 
        if (!link) return null;
        let tags = link.tags.join(' ');
    	if (link.editing) {
            return (
                <Flex row >
                  <Flex column style={{flex: '1 1 auto',  marginRight: 20 }}>
                        <Input type="text" style={{height: 40, width: '100%'}} ref="url" label='Title' defaultValue={ link.url }  />                  
                        <Input type="textarea" style={{width: '100%', height: 400}} ref="notes" label='Notes' defaultValue={ link.notes } />
                        <Input type="text" style={{height: 40, width: '100%'}} ref="tags" label='Tags' defaultValue={ tags } />
                  </Flex>
                  <Flex column style={{justifyContent: 'flex-start', flex: '0 0 100px' }}>
                    <Button key='save' bsSize='small' onClick={this.save} block >Save</Button> 
                    <Button key='stop' bsSize='small' onClick={this.stopEdit} block >Cancel</Button> 
                  </Flex>  
                </Flex> );
        } else {
            let h = null;
            let edits = null;
            let expBtn = ( <Button bsSize='small' block onClick={ () => dispatch({type: link.expanded ? UNEXPAND : EXPAND, link: link})}>{link.expanded ? '-' : '+'}</Button> );
            if (link.expanded) {
                let lstedit = link.lastedit ? oxiDate.toFormat(link.lastedit, 'DDDD, MMMM D @ HH:MIP') : '';
                let pub = link.published ? oxiDate.toFormat(link.published, 'DDDD, MMMM D @ HH:MIP') : '';
	            let userName = localStorage.getItem('pseudoq.userName');
	            if (process.env.NODE_ENV !== 'production' || userName === 'gary2') {
	                edits = ( <Flex row style={{justifyContent: 'flex-start', alignItems: 'stretch', height: 30}}>
	                           <Button key='edit' bsSize='small' style={{width: 100, height: '100%', marginTop: 0, marginRight: 10}} onClick={this.startEdit} block >Edit</Button> 
	                           <Button key='new' bsSize='small' style={{width: 100, height: '100%', marginTop: 0, marginRight: 10}} onClick={this.editNew} block >New</Button> 
	                        </Flex> );
                }
            	h = ( <Flex row>
            	       <div dangerouslySetInnerHTML={{__html: md.render(link.notes)}} /> 
	                   <Flex row style={{justifyContent: 'space-between' }}>
	                      <div>Id: {link.id}</div>
	                      <div>Published: {pub}</div>
	                      <div>Last Edit: {lstedit}</div>
	                   </Flex>
	                   { edits }
	                 </Flex> 
	                );
	        }

            return (
              <div>
                <Flex row key={ link.id } onClick={ () => dispatch({type: SELECT, link}) }>
                    <Flex col style={{flex: '5 1 auto'}}><a >{ link.url.trim() }</a></Flex>
                    <Flex col style={{flex: '1 0 auto'}}>{ expBtn }</Flex> 
                </Flex>
                {h}
              </div>  );
        }
    }
});

let _links = React.createClass({

    componentWillMount() {
        let xhr = new XMLHttpRequest();   
        xhr.open("GET", "/links");
        xhr.onload = () => { 
            let links = JSON.parse(xhr.responseText);   
            links = links.map(p => { return {...p, lastedit: oxiDate.parseUTC(p.lastedit), published: oxiDate.parseUTC(p.published) } } );
            this.props.dispatch({type: LOAD, links});
        };
        xhr.send();
    },

    render() {
        let {links, dispatch} = this.props;
        if (links.length === 0) return null;
        let entries = links.map( link => {
        	return <LinkEntry key={link.id} dispatch={ dispatch } link={ link } />
        });

        return (
            <div>
                <h2>Links</h2> 
                <p/>
                {entries}
                <p/>
            </div>
            );
    }
});


export let Links = connect(state => {
    //console.log("blog connect called");
    return state ? state.links : null;
})(_links);

