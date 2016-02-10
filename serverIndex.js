"use strict";

import "babel-polyfill";
const bb = require("bluebird")
bb.config({warnings: false});

const fs = bb.promisifyAll(require('fs'));

import * as pg from './pgsql.js';

const koa = require("koa");
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const router = require('koa-route');

const oxiDate = require('./oxidate.js');

import {solutionSorter} from './utils.js';
const uuid = require('./uuid.js');
const jwt = require('./jwt.js');

const jwt_secret = process.env.JWT_SECRET_KEY;

import koaws from './ws-koa/middleware.js';
import koastatic from './koa-static.js';
import clientIP from './clientIP.js';

const app = koa();

function isMember(grp, ctx) {
    let grps = ctx.user.groups;
    return grps && grps.indexOf(grp+',') >= 0;
}

let strToDate = function (cdt) {
    return oxiDate.parse(cdt, 'yyyyMMdd');
};

let pzlCache = {};

let getPuzzle = function(j) {
    if (!pzlCache[j]) {
        //console.log("getting puzzle " + j);
        pzlCache[j] = pg.get_puzzle(j);
    }
    return pzlCache[j];
};

let getUser = function (id) {

    return pg.users[id];
};

let getUserCount = function () {
    return pg.users.count;
};

let checkMonikerUsed = function (newName) {
    return Object.keys(pg.users).some( function(id) {
            return pg.users[id].userName === newName; 
    });
};

var readFileThunk = function(src) {
  return new Promise(function (resolve, reject) {
    fs.readFile(src, {'encoding': 'utf8'}, function (err, data) {
      if(err) return reject(err);
      resolve(data);
    });
  });
}


let solnsCache = {};

let getSolutions = function (j) {
    if (!solnsCache[j]) {
        let solns = pg.get_solutions(j)
                    .then( function(a ) { 
                        //console.log(a.length.toString() + " solutions found");
                        a.forEach(o => { o.moves = o.doc.moves; delete o.doc});
                        a.sort(solutionSorter); 
                        if (a.length > 10) a.length = 10;
                        return a;
                    });
        solnsCache[j] = solns;
    }
    return solnsCache[j].then( (a) => {
        let rslt = a.map( function (e) {
            let uid = e.user;  // userId
            if (pg.users[uid]) e.userName = pg.users[uid].userName;
            return e;
        });
        return rslt;
    });
};

let challengeCache = {};

let getChallenges = function (j) {
    if (!challengeCache[j]) {
        let rslts = pg.get_challenges(j)
        challengeCache[j] = rslts;
    }
    return challengeCache[j].then( (a) => {
        let rslt = a.map( function (e) {
            let uid = e.user;  // userId
            if (pg.users[uid]) e.userName = pg.users[uid].userName;
            return e;
        });
        return rslt;
    });
};

let dayCache = {};

let getDay = function (cdt) {
    if (!dayCache[cdt]) {
        dayCache[cdt] = pg.get_day(oxiDate.parse(cdt,'yyyyMMdd'));
    }
    return dayCache[cdt];
};

let daysCache = {};

let getDaily = function(cdt) {
    if (!daysCache[cdt]) {
        daysCache[cdt] = (
            getDay(cdt).then(function (a) {
                let brds = [];
                a.forEach(function(j) {
                    brds.push( getPuzzle(j) );
                });
                return Promise.all(brds);
            })
        );
    } 
    return daysCache[cdt];
};

let getWeekly = function(cdt) {
    let ndays = 7;
    let wk = {};
    let dt = strToDate(cdt);
    let tom = oxiDate.addDays(dt,1);
    wk['tomorrow'] = getDaily(oxiDate.toFormat(tom, 'YYYYMMDD'));
    while (ndays > 0) {
        let tdt = oxiDate.toFormat(dt, 'YYYYMMDD');
        wk[tdt] = getDaily(tdt);
        dt = oxiDate.addDays(dt, -1);
        --ndays;
    }
    wk['tutorial'] = getPuzzle(604).then( function (brdjson) {
        let b = "./puzzles/tutorial.moves" ;
        return fs.readFileAsync(b).then(JSON.parse).then( function (mvs) {
            brdjson.moves = mvs;
            return brdjson;
        });
        
    });
    return Promise.props(wk);
};

let getWeeklyUser = function(dt,uid) {

    let p =
        pg.get_weekly_user(dt,uid).then( function (rows) {
            let wk = {};
            rows.forEach( function (r) {
                let tdt = oxiDate.toFormat(r.date, 'yyyyMMdd');
                let pzl = r.layout;
                if (r.doc) pzl.moves = r.doc.moves;
                pzl.pubID = r.puzzleId;  
                pzl.gameType = r.gameType;        
                if (!wk[tdt]) wk[tdt] = {};
                wk[tdt][r.pos] = pzl;
            });
            return getPuzzle(604).then( function (brdjson) {
                let b = "./puzzles/tutorial.moves" ;
                return fs.readFileAsync(b).then(JSON.parse).then( function (doc) {
                    brdjson.moves = doc.moves;
                    wk['tutorial'] =  brdjson;
                    return wk;
                });
            })
        });
    return p;
};

let createUser = function (ctx) {
    let o = pg.users;
    //console.log("user count : "+o.count);
    //console.log(JSON.stringify(userId));
    let i = o.count;
    let nm = ''
    while (true) {
        nm = "anonymous_" + i ;
        if (!checkMonikerUsed(nm)) break;
        ++i;
    }
    let id = uuid.generate();
    console.log("creating user : " + nm + ", time : " + (new Date()).toString());
    console.log(JSON.stringify(ctx));
    return pg.insert_user(id, nm).then( function (user) {
        console.log("created user : " + JSON.stringify(user));
        let rslt =  {id: id};
        ctx.userId = rslt;
        ctx.user = user;
        let tok = jwt.sign(rslt, jwt_secret); //{expiresInMinutes: 60*24*14});
        ctx.cookies.set('psq_user', tok);
        return rslt;
    });
};

let authent =  function *(ctx, prov, authId) {
    console.log("authId : "+authId);
    if (!authId) {
        ctx.status = 401
    } else {
        console.log("callback authenticated "+prov);
        let user = pg.get_user_from_auth(prov, authId);
        if (user) {
            //if (ctx.userId.id !== user.userId) {
                //yield pg.shift_solutions(ctx.userId.id, user.userId);
            //}
            ctx.user = user;
            ctx.userId = {id: user.userId};
            if (prov !== 'ip') {
                let ip = clientIP(ctx.req);
                console.log("uuid : "+ctx.userId.id);
                yield pg.upsert_auth('ip',ip,ctx.userId.id);
            }
            else pg.touch_auth(prov, authId)
        } else {
            if (!ctx.user) {
                if (prov !== 'ip') console.log("authentication problem - no previous user"); // return;  // ???
                yield createUser(ctx);
            }
            user = ctx.user;
            console.log("create auth for : " + user.userName);
            yield pg.insert_auth(prov,authId,ctx.userId.id);
        }
        if (prov === 'ip') delete ctx.userId.auth;
        else ctx.userId.auth = prov + ':' + authId;

        let tok = jwt.sign(ctx.userId, jwt_secret); //{expiresInMinutes: 60*24*14});
        ctx.cookies.set('psq_user', tok);
        yield ctx.login(user);
        //ctx.body = {ok: true};
        //ctx.redirect('/');

    }
};
 
app.keys = ['foo'];
//let serve = require('koa-static');
//app.use(serve(".",{defer: true})); ///public"));

app.use(bodyParser());
app.use(session(app));

var passport = require('./auth.js');
app.use(passport.initialize());
app.use(passport.session());
//app.use(flash());

app.use(jwt({secret: jwt_secret, cookie: 'psq_user', ignoreExpiration: true, passthrough: true, key: 'userId'}));

app.use(function *(next) {
    //console.log(this.path + " requested");

    let userId = this.userId;
    if (!userId) {
        let ip = clientIP(this.req);
        yield authent(this,'ip', ip);
    } 
    else this.user = getUser(this.userId.id) ;

    yield next;
    //console.log("setting moniker : "+ this.user.userName);
    this.set('X-psq-moniker', this.user ? this.user.userName : 'anonymous');
    if (this.userId.auth)
    {
        let auth = this.userId.auth;
        let prov = auth.slice(0,auth.indexOf(':'));
        let grps = this.user.groups || '';
        //console.log("setting provider : "+ prov);
        this.set('X-psq-authprov', prov);
        //console.log("setting groups : "+ grps);
        this.set('X-psq-groups', grps);
        pg.touch_user(this.userId.id);
    }
    
});

app.use(router.get('/solutions/:id', function *(cid) {
    console.log('solutions requested : '+cid);
    let id = parseInt(cid);
    this.body = yield getSolutions(id).then( (solns) => { 
        //console.log('solutions found : '+solns.length);
        //solns.forEach(function (s) {console.log(s.lastPlay);});
       
        return {ok: true, pubID: id, solutions: solns } 
    } );
}));

app.use(router.get('/challenges/:id', function *(cid) {
    console.log('challenges requested : '+cid);
    let id = parseInt(cid);
    this.body = yield getChallenges(id).then( (rslts) => { 
        return {ok: true, results: rslts } 
    } );
}));

app.use(router.get('/puzzles/:cdt', function *(cdt) { 
    
    console.log("/puzzles called for : " + cdt);
    let dt = oxiDate.parse(cdt,'yyyyMMdd');
    let userId = this.userId.id;
    this.body = yield getWeeklyUser(dt,userId).then(function (brds) { 
        //console.log(brds);
        return {date: cdt, boards: brds}; 
    }); 
}));

app.use(router.get('/challenge5min', function *() { 
    
    console.log("/challenge5min called ");
    this.body = yield pg.get_random_killer(); 
}));

app.use(router.get('/challenge15min', function *() { 
    
    console.log("/challenge15min called ");
    this.body = yield pg.get_random_samurai(); 
}));

app.use(router.get('/hidato', function *() { 
    
    //console.log("/hidato called ");
    this.body = yield pg.get_random_hidato(); 
    //let b = "/media/sf_psq-site/puzzles/hidato.json" ;
    //let txt2 = fs.readFileSync(b, 'utf8')
    //console.log(txt2+". "+txt2.length);
    //console.log(txt2.charCodeAt(0));
    //this.body = yield JSON.parse(txt2);

}));

app.use(router.post('/solutions', function *() {
    let body = this.request.body;  // from bodyparser 
    body.user = this.userId.id;
    body.doc = {moves: body.moves};
    delete body.moves;
    let id = body.puzzle;

    console.log('solution received : '+ id); // JSON.stringify(body));

    var p = pg.upsert_solution(body)
            .then( () => {
                solnsCache[id] = null;
                return getSolutions(id).then( (solns) => { 
                    return {ok: true, pubID: id, solutions: solns}; 
                });
            })
            .catch( (err) => {
                var msg = 'Submit for ' + id + ' failed : ' + err.toString();
                console.log(msg);
                return {ok: false, msg: msg};
            }); 
    this.body = yield p;
}));

app.use(router.post('/challenges', function *() {
    let body = this.request.body;  // from bodyparser 
    body.user = this.userId.id;
    body.doc = {moves: body.moves};
    delete body.moves;
    let id = body.timeOut;
    console.log('challenge result received : '+ id); // JSON.stringify(body));

    var p = pg.upsert_challenge(body)
            .then( () => {
                challengeCache[id] = null;
                return getChallenges(id).then( (rslts) => { 
                    return {ok: true, results: rslts}; 
                });
            })
            .catch( (err) => {
                var msg = 'Submit for challenge ' + id + ' failed : ' + err.cause;
                console.log(msg);
                return {ok: false, msg: msg};
            }); 
    this.body = yield p;
}));

app.use(router.post('/newMoniker', function *() {
    let newName = this.request.body.userName;  // from bodyparser 
    console.log("setting new Moniker : " + newName);
    console.log("for user " + JSON.stringify(this.user));
    let id = this.userId.id;
    let rslt = new Promise( function(resolve,reject) {
        if (checkMonikerUsed(newName)) resolve({ok: false, msg: "taken"});
        else {
            let doc = pg.users[id];
            console.log("updating user : "+JSON.stringify(doc));    
            pg.set_user_name(id, newName).then( (updt) => {
                console.log("user updated : "+ JSON.stringify(updt));
                pg.users[id] = updt;
                resolve({ok: true});
            }); 
        }
    });
    this.body = yield rslt;

}));

app.use(router.get('/userstats', function *() {
    //console.log("getting stats for user " + JSON.stringify(this.user));
    let id = this.userId.id;
    let rslt =   pg.get_user_stats(id).then( rows => {
        return {ok: true, rows}
    }); 
    this.body = yield rslt;

}));

app.use(router.get('/logout', function *() {
    let auth = this.userId.auth;
    if (auth) {
        yield authent(this, 'ip', clientIP(this.req));
    }
    this.body = yield {ok: true};
}));

app.use(router.get('/auth/facebook', function *() {
    console.log("/auth/facebook called");
    var ctx = this
    yield passport.authenticate('facebook', function*(err, authId, info) {
        console.log("facebook called back");
        if (err) throw err
        if (info) console.log("info : "+info);
        yield authent(ctx, 'facebook', authId);
        ctx.redirect('/#/refresh');
    }).call(this);
}));

app.use(router.get('/auth/google', function *() {
    var ctx = this
    yield passport.authenticate('google', function *(err, authId, info) {
        console.log("google called back");
        if (err) throw err
        if (info) console.log("info : "+info);
        yield authent(ctx, 'google', authId);
        ctx.redirect('/#/refresh');
    }).call(this);
}));

app.use(router.get('/auth/github', function *() {
    var ctx = this
    yield passport.authenticate('github', function*(err, authId, info) {
        if (err) throw err
        if (info) console.log("info : "+info);
        yield authent(ctx, 'github', authId);
        ctx.redirect('/#/refresh');
    }).call(this);
}));

app.use(router.get('/auth/twitter', function *() {
    var ctx = this
    yield passport.authenticate('twitter', function*(err, authId, info) {
        if (err) throw err
        if (info) console.log("info : "+info);
        yield authent(ctx, 'twitter', authId);
        ctx.redirect('/#/refresh');
    }).call(this);
}));

app.use(router.get('/blog/latest', function *() {
    this.body = yield pg.query('select id,published,lastedit,title,body,tags from blog order by id desc limit 100')
}));


app.use(router.get('/blog/:id', function *(cid) {
    let id = parseInt(cid);
    this.body = yield pg.query('select id,published,lastedit,title,body,tags from blog where id = '+id.toString());
}));

app.use(router.get('/blog/after/:id', function *(cid) {
    let id = parseInt(cid);
    this.body = yield pg.query('select id,published,lastedit,title,body,tags from blog where id > '+id.toString());
}));

function getTags(url) {
    let tags = []
    while (true) {
        let i = url.indexOf('?tag=');
        if (i < 0) break;
        url = url.substring(i+5);
        let j = url.indexOf('?tag=');
        let tag = j < 0 ? url : url.substring(0,j);
        tags.push(tag); 
    }
    if (tags.length === 0) {
        console.log("no tags found")
    }
    return tags
}

app.use(router.get('/blog/tags', function *() {
    //console.log('path: '+this.path);
    console.log('url: '+this.url);
    let url = this.url;
    let tags = getTags(url);
    if (tags.length === 0) {
        this.body = yield pg.query('select id,published,lastedit,title,body,tags from blog order by id desc limit 100');
    } else {
        this.body = yield pg.query("select id,published,lastedit,title,body,tags from blog where ARRAY['"+ tags.join("','") +"'] && tags::text[] order by id desc");
    }
}));

app.use(router.post('/blog/save', function *() {
    let post = this.request.body;
    if (!isMember('author', this)) {
        console.log('unauthorised attempt to save blog post: '+post.id);
        this.body = yield {ok: false, error: "unauthorised"};
        return;
    }
    console.log('saving blog post: '+post.id);
    if (!post.id) {
        post.published = new Date();
        delete post.id;
    }
    post.lastedit = new Date();
    this.body = yield pg.save(pg.db.blog, this.request.body)
                        .then( rslts => { 
                                //console.log("result : "+ JSON.stringify(rslts));
                                return {ok: true, results: rslts };
                            })
                        .catch( e => { 
                                console.log("error : "+ JSON.stringify(e));
                                return {ok: false, error: e };
                            });
}));

app.use(router.get('/links', function *() {
    console.log("/links called");
    this.body = yield pg.query('select id,published,lastedit,url,notes,tags from links order by id desc')
}));

app.use(router.get('/link/:id', function *(cid) {
    let id = parseInt(cid);
    this.body = yield pg.query('select id,published,lastedit,url,notes,tags from links where id = '+id.toString())
}));

app.use(router.post('/link/delete', function *() {
    if (!isMember('author', this)) {
        console.log('unauthorised attempt to delete link(s)');
        this.body = yield {ok: false, error: "unauthorised"};
        return;
    }

    this.body = yield pg.destroy(pg.db.links,this.request.body);
}));

app.use(router.post('/link', function *() {
    let link = this.request.body;
    if (!isMember('author', this)) {
        console.log('unauthorised attempt to save link');
        this.body = yield {ok: false, error: "unauthorised"};
        return;
    }

    console.log('saving link: '+link.id);
    if (!link.id) {
        link.published = new Date();
        delete link.id;
    }
    link.lastedit = new Date();
    this.body = yield pg.save(pg.db.links, this.request.body)
                        .then( rslts => { 
                                //console.log("result : "+ JSON.stringify(rslts));
                                return {ok: true, results: rslts };
                            })
                        .catch( e => { 
                                console.log("error : "+ JSON.stringify(e));
                                return {ok: false, error: e };
                            });
}));
app.use(router.post('/game/:gameid/move', function *(gameid) {
    // 
}));

/*
app.use(router.get('*', function *(){
    console.log('serving :' + this.path);
    this.body = yield readFileThunk("./default.html" );
}));
*/

import {init as gsInit} from './gameserver.js';

app.use(koaws(app, { serveClientFile: false, heartbeat: true, heartbeatInterval: 5000 }));

app.use(koastatic(".")); ///public"));  // last???

console.log("executed");

gsInit(app.ws);

module.exports = app;




