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

const Remarkable = require('remarkable');
const md = new Remarkable({html: true});

const { Button, Input } = ReactBootStrap;

import { connect } from 'react-redux';

export function blankPost() {
    return {id: 0,
            published: null,
            lastedit: oxiDate.createUTC(),
            title: '',
            body: '',
            tags: []
           };
}

const LOAD = 'blog/LOAD';
const LOADENTRY = 'blog/LOADENTRY';
const SELECT = 'blog/SELECT';
const UPDATE = 'blog/UPDATE';
const STARTEDIT = 'blog/STARTEDIT';
const STOPEDIT = 'blog/STOPEDIT';
const EDITNEW = 'blog/EDITNEW';

let initState = {
    posts: [],
    currentPost: null,
    editing: false
}

export function blogReducer(state = initState, action) {
    console.log("blogReducer called");
    switch (action.type) {

        case LOAD:
            if (action.posts.length === 0) return state;
            return {... state, currentPost: action.posts[0], posts: action.posts};

        case LOADENTRY:
            return {...state, currentPost: action.post};

        case SELECT:
            return {...state, currentPost: action.post};

        case EDITNEW:
            return {...state, currentPost: blankPost(), editing: true};

        case STARTEDIT:
            return {...state, editing: true};

        case STOPEDIT:
            return {...state, editing: false};

        case UPDATE:
            let posts = state.posts
            let i = posts.findIndex(p => p.id === action.post.id);
            let newposts = i > 0 ? posts.map(p => p.id === i ? action.post : p)
                                 : [action.post, ...posts];
            return {...state, currentPost: action.post, posts: newposts, editing: false};

        default: 
            return state;
    }
}

let BlogPost = React.createClass({

    save() {
        let title = this.refs.title.getValue();
        let tags = this.refs.tags.getValue().split(/[\s,]+/);
        let body = this.refs.body.getValue();
        let xhr = new XMLHttpRequest();   
        let post = {...this.props.post, title, body, tags};
        xhr.open("POST", "/blog/save");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = () => { 
            let rslt = JSON.parse(xhr.responseText);        
            if (rslt.ok) {
                let {id, lastedit, published} = rslt.results;     
                let newpost = {...post, id, lastedit: oxiDate.parseUTC(lastedit), published: oxiDate.parseUTC(published)};
                this.props.dispatch({type: UPDATE, post: newpost});
            }
        };
        xhr.send(JSON.stringify(post));
    },

    startEdit() { this.props.dispatch({type: STARTEDIT}) },
    stopEdit() { this.props.dispatch({type: STOPEDIT}) },
    editNew() { this.props.dispatch({type: EDITNEW}) },

    render() {
        let post = this.props.post; 
        if (!post) return null;
        let tags = post.tags.join(' ');
        if (this.props.editing) {
            return (
                <Flex row >
                  <Flex column style={{flex: '1 1 auto',  marginRight: 20 }}>
                        <Input type="text" style={{height: 40, width: '100%'}} ref="title" label='Title' defaultValue={ post.title }  />                  
                        <Input type="textarea" style={{width: '100%', height: 400}} ref="body" label='Body' defaultValue={ post.body } />
                        <Input type="text" style={{height: 40, width: '100%'}} ref="tags" label='Tags' defaultValue={ tags } />
                  </Flex>
                  <Flex column style={{justifyContent: 'flex-start', flex: '0 0 100px' }}>
                    <Button key='save' bsSize='small' onClick={this.save} block >Save</Button> 
                    <Button key='stop' bsSize='small' onClick={this.stopEdit} block >Cancel</Button> 
                  </Flex>  
                </Flex> );
        } else {
            let h = {__html: md.render(post.body)};
            let lstedit = post.lastedit ? oxiDate.toFormat(post.lastedit, "DDDD, MMMM D @ HH:MIP") : '';
            let pub = post.published ? oxiDate.toFormat(post.published, "DDDD, MMMM D @ HH:MIP") : '';
            let edits = null;
            let userName = localStorage.getItem('pseudoq.userName');
            if (process.env.NODE_ENV !== 'production' || userName === 'gary2') {
                edits = ( <Flex row style={{justifyContent: 'flex-start', alignItems: 'stretch', height: 30}}>
                           <Button key='edit' bsSize='small' style={{width: 100, height: '100%', marginTop: 0, marginRight: 10}} onClick={this.startEdit} block >Edit</Button> 
                           <Button key='new' bsSize='small' style={{width: 100, height: '100%', marginTop: 0, marginRight: 10}} onClick={this.editNew} block >New</Button> 
                        </Flex> );
            }

            return (
                <div>
                   <h2>{post.title}</h2>
                   <p/>
                   <div dangerouslySetInnerHTML={h} />
                   <div>Id: {post.id}, Tags: {tags}</div>
                   <Flex row style={{justifyContent: 'space-between' }}>
                      <div>Published: {pub}</div>
                      <div>Last Edit: {lstedit}</div>
                   </Flex>
                   { edits }
                </div>   
                 );
        }
    }
});

let _blog = React.createClass({

    componentWillMount() {
        let xhr = new XMLHttpRequest();   
        xhr.open("GET", "/blog/latest");
        xhr.onload = () => { 
            let posts = JSON.parse(xhr.responseText);   
            posts = posts.map(p => { return {...p, lastedit: oxiDate.parseUTC(p.lastedit), published: oxiDate.parseUTC(p.published) } } );
            this.props.dispatch({type: LOAD, posts});
        };
        xhr.send();
    },

    render() {
        let {currentPost, posts, editing, dispatch} = this.props;
        if (!currentPost) return null;
        let others = null;
        if (!editing) {        

            let links = posts.filter( post => post.id !== currentPost.id )
                             .map( post => {
                  return (<li key={ post.id } onClick={ () => dispatch({type: SELECT, post}) }><a>{ post.title.trim() }</a></li> );
              });
            others = ( <div>Other Posts: <ul>{links}</ul></div> );
        }

        return (
            <div>
                <h1>The Soapbox on the Nullarbor</h1>
                <BlogPost dispatch={ dispatch } post={ currentPost } editing={ editing } /> 
                <p/>
                <p/>
                {others}
            </div>
            );
    }
})

export let Blog = connect(state => {
    //console.log("blog connect called");
    return state ? state.blog : null;
})(_blog);


let _blogEntry = React.createClass({

    componentWillMount() {
        let xhr = new XMLHttpRequest();   
        let {id} = this.props.params;
        xhr.open("GET", "/blog/:"+id);
        xhr.onload = () => { 
            let p = JSON.parse(xhr.responseText);   
            let post = ( {...p, lastedit: oxiDate.parseUTC(p.lastedit), published: oxiDate.parseUTC(p.published) } );
            this.props.dispatch({type: LOADENTRY, post});
        };
        xhr.send();
    },

    render() {
        let {currentPost, dispatch} = this.props;
        if (!currentPost) return null;
        return (
                <BlogPost dispatch={ dispatch } post={ currentPost } editing={ false } /> 
            );
    }
})

export let BlogEntry = connect(state => {
    //console.log("blog connect called");
    return state ? state.blog : null;
})(_blog);



