require("source-map-support").install();
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(65);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("babel-polyfill");

/***/ },
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */
/***/ function(module, exports) {

	module.exports = require("debug");

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var app = __webpack_require__(66);
	//const {hmr} = require('./hmr.js')
	//hmr(app);
	var port = parseInt(process.env.PORT, 10) || 8080;
	
	console.log("Listening at http://localhost:" + port);
	app.listen(port);

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	__webpack_require__(1);
	
	var _pgsql = __webpack_require__(67);
	
	var pg = _interopRequireWildcard(_pgsql);
	
	var _utils = __webpack_require__(73);
	
	var _middleware = __webpack_require__(74);
	
	var _middleware2 = _interopRequireDefault(_middleware);
	
	var _koaStatic = __webpack_require__(82);
	
	var _koaStatic2 = _interopRequireDefault(_koaStatic);
	
	var _gameserver = __webpack_require__(86);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	var bb = __webpack_require__(87);
	bb.config({ warnings: false });
	
	var fs = bb.promisifyAll(__webpack_require__(80));
	
	var koa = __webpack_require__(88);
	var bodyParser = __webpack_require__(89);
	var session = __webpack_require__(90);
	var router = __webpack_require__(91);
	
	var oxiDate = __webpack_require__(69);
	
	var uuid = __webpack_require__(92);
	var jwt = __webpack_require__(93);
	
	var jwt_secret = process.env.JWT_SECRET_KEY;
	
	var app = koa();
	
	function isMember(grp, ctx) {
	    var grps = ctx.userId.groups;
	    return grps && grps.indexOf(grp + ',') >= 0;
	}
	
	var strToDate = function strToDate(cdt) {
	    return oxiDate.parse(cdt, 'yyyyMMdd');
	};
	
	var pzlCache = {};
	
	var getPuzzle = function getPuzzle(j) {
	    if (!pzlCache[j]) {
	        //console.log("getting puzzle " + j);
	        pzlCache[j] = pg.get_puzzle(j);
	    }
	    return pzlCache[j];
	};
	
	var getUser = function getUser(id) {
	
	    return pg.users[id];
	};
	
	var getUserCount = function getUserCount() {
	    return pg.users.count;
	};
	
	var checkMonikerUsed = function checkMonikerUsed(newName) {
	    return Object.keys(pg.users).some(function (id) {
	        return pg.users[id].userName === newName;
	    });
	};
	
	var readFileThunk = function readFileThunk(src) {
	    return new Promise(function (resolve, reject) {
	        fs.readFile(src, { 'encoding': 'utf8' }, function (err, data) {
	            if (err) return reject(err);
	            resolve(data);
	        });
	    });
	};
	
	var solnsCache = {};
	
	var getSolutions = function getSolutions(j) {
	    if (!solnsCache[j]) {
	        var solns = pg.get_solutions(j).then(function (a) {
	            //console.log(a.length.toString() + " solutions found");
	            a.forEach(function (o) {
	                o.moves = o.doc.moves;delete o.doc;
	            });
	            a.sort(_utils.solutionSorter);
	            if (a.length > 10) a.length = 10;
	            return a;
	        });
	        solnsCache[j] = solns;
	    }
	    return solnsCache[j].then(function (a) {
	        var rslt = a.map(function (e) {
	            var uid = e.user; // userId
	            if (pg.users[uid]) e.userName = pg.users[uid].userName;
	            return e;
	        });
	        return rslt;
	    });
	};
	
	var challengeCache = {};
	
	var getChallenges = function getChallenges(j) {
	    if (!challengeCache[j]) {
	        var rslts = pg.get_challenges(j);
	        challengeCache[j] = rslts;
	    }
	    return challengeCache[j].then(function (a) {
	        var rslt = a.map(function (e) {
	            var uid = e.user; // userId
	            if (pg.users[uid]) e.userName = pg.users[uid].userName;
	            return e;
	        });
	        return rslt;
	    });
	};
	
	var dayCache = {};
	
	var getDay = function getDay(cdt) {
	    if (!dayCache[cdt]) {
	        dayCache[cdt] = pg.get_day(oxiDate.parse(cdt, 'yyyyMMdd'));
	    }
	    return dayCache[cdt];
	};
	
	var daysCache = {};
	
	var getDaily = function getDaily(cdt) {
	    if (!daysCache[cdt]) {
	        daysCache[cdt] = getDay(cdt).then(function (a) {
	            var brds = [];
	            a.forEach(function (j) {
	                brds.push(getPuzzle(j));
	            });
	            return Promise.all(brds);
	        });
	    }
	    return daysCache[cdt];
	};
	
	var getWeekly = function getWeekly(cdt) {
	    var ndays = 7;
	    var wk = {};
	    var dt = strToDate(cdt);
	    var tom = oxiDate.addDays(dt, 1);
	    wk['tomorrow'] = getDaily(oxiDate.toFormat(tom, 'YYYYMMDD'));
	    while (ndays > 0) {
	        var tdt = oxiDate.toFormat(dt, 'YYYYMMDD');
	        wk[tdt] = getDaily(tdt);
	        dt = oxiDate.addDays(dt, -1);
	        --ndays;
	    }
	    wk['tutorial'] = getPuzzle(604).then(function (brdjson) {
	        var b = "./puzzles/tutorial.moves";
	        return fs.readFileAsync(b).then(JSON.parse).then(function (mvs) {
	            brdjson.moves = mvs;
	            return brdjson;
	        });
	    });
	    return Promise.props(wk);
	};
	
	var getWeeklyUser = function getWeeklyUser(dt, uid) {
	
	    var p = pg.get_weekly_user(dt, uid).then(function (rows) {
	        var wk = {};
	        rows.forEach(function (r) {
	            var tdt = oxiDate.toFormat(r.date, 'yyyyMMdd');
	            var pzl = r.layout;
	            if (r.doc) pzl.moves = r.doc.moves;
	            pzl.pubID = r.puzzleId;
	            pzl.gameType = r.gameType;
	            if (!wk[tdt]) wk[tdt] = {};
	            wk[tdt][r.pos] = pzl;
	        });
	        return getPuzzle(604).then(function (brdjson) {
	            var b = "./puzzles/tutorial.moves";
	            return fs.readFileAsync(b).then(JSON.parse).then(function (doc) {
	                brdjson.moves = doc.moves;
	                wk['tutorial'] = brdjson;
	                return wk;
	            });
	        });
	    });
	    return p;
	};
	
	var createUser = function createUser(ctx) {
	    var userId = ctx.userId;
	    if (userId && pg.users[userId.id]) {
	        return Promise.resolve(userId);
	    }
	    var o = pg.users;
	    //console.log("user count : "+o.count);
	    //console.log(JSON.stringify(userId));
	    var i = o.count;
	    var nm = '';
	    while (true) {
	        nm = "anonymous_" + i;
	        if (!checkMonikerUsed(nm)) break;
	        ++i;
	    }
	    var id = uuid.generate();
	    console.log("creating user : " + nm + ", time : " + new Date().toString());
	    console.log(JSON.stringify(ctx));
	    return pg.insert_user(id, nm).then(function (user) {
	        console.log("created user : " + JSON.stringify(user));
	        o[user._id] = user;
	        var rslt = { id: id };
	        var tok = jwt.sign(rslt, jwt_secret); //{expiresInMinutes: 60*24*14});
	        ctx.cookies.set('psq_user', tok);
	        return rslt;
	    }).catch(function (err) {
	        console.log("error inserting user : " + err);
	        ctx.throw(err);
	    });
	};
	
	var authent = regeneratorRuntime.mark(function authent(ctx, prov, authId) {
	    var user, tok;
	    return regeneratorRuntime.wrap(function authent$(_context) {
	        while (1) {
	            switch (_context.prev = _context.next) {
	                case 0:
	                    console.log("authId : " + authId);
	
	                    if (authId) {
	                        _context.next = 5;
	                        break;
	                    }
	
	                    ctx.status = 401;
	                    _context.next = 23;
	                    break;
	
	                case 5:
	                    console.log("callback authenticated " + prov);
	                    user = pg.get_user_from_auth(prov, authId);
	
	                    if (!user) {
	                        _context.next = 13;
	                        break;
	                    }
	
	                    if (ctx.userId.id !== user.userId) {
	                        //yield pg.shift_solutions(ctx.userId.id, user.userId);
	                    }
	                    ctx.user = user;
	                    ctx.userId = { id: user.userId };
	                    _context.next = 16;
	                    break;
	
	                case 13:
	                    user = ctx.user;
	                    _context.next = 16;
	                    return pg.insert_auth(prov, authId, ctx.userId.id);
	
	                case 16:
	                    ctx.userId.auth = prov + ':' + authId;
	                    ctx.userId.groups = user.groups;
	                    tok = jwt.sign(ctx.userId, jwt_secret); //{expiresInMinutes: 60*24*14});
	
	                    ctx.cookies.set('psq_user', tok);
	                    _context.next = 22;
	                    return ctx.login(user);
	
	                case 22:
	                    //ctx.body = {ok: true};
	                    //ctx.redirect('/');
	                    ctx.redirect('/#/refresh');
	
	                case 23:
	                case "end":
	                    return _context.stop();
	            }
	        }
	    }, authent, this);
	});
	
	app.keys = ['foo'];
	//let serve = require('koa-static');
	//app.use(serve(".",{defer: true})); ///public"));
	
	app.use(bodyParser());
	app.use(session(app));
	
	var passport = __webpack_require__(96);
	app.use(passport.initialize());
	app.use(passport.session());
	//app.use(flash());
	
	app.use(jwt({ secret: jwt_secret, cookie: 'psq_user', ignoreExpiration: true, passthrough: true, key: 'userId' }));
	
	app.use(regeneratorRuntime.mark(function _callee(next) {
	    var auth, prov, grps;
	    return regeneratorRuntime.wrap(function _callee$(_context2) {
	        while (1) {
	            switch (_context2.prev = _context2.next) {
	                case 0:
	                    _context2.prev = 0;
	                    _context2.next = 3;
	                    return createUser(this);
	
	                case 3:
	                    this.userId = _context2.sent;
	                    _context2.next = 13;
	                    break;
	
	                case 6:
	                    _context2.prev = 6;
	                    _context2.t0 = _context2["catch"](0);
	
	                    console.log("error creating user : " + _context2.t0);
	                    console.log("retrying");
	                    _context2.next = 12;
	                    return createUser(this);
	
	                case 12:
	                    this.userId = _context2.sent;
	
	                case 13:
	                    //console.log("setting user")
	                    this.user = getUser(this.userId.id);
	                    //console.log("user set : "+JSON.stringify(this.user));
	                    _context2.next = 16;
	                    return next;
	
	                case 16:
	                    //console.log("setting moniker : "+ this.user.userName);
	                    this.set('X-psq-moniker', this.user.userName);
	                    if (this.userId.auth) {
	                        auth = this.userId.auth;
	                        prov = auth.slice(0, auth.indexOf(':'));
	                        grps = this.userId.groups || '';
	                        //console.log("setting provider : "+ prov);
	
	                        this.set('X-psq-authprov', prov);
	                        //console.log("setting groups : "+ grps);
	                        this.set('X-psq-groups', grps);
	                        pg.touch_user(this.userId.id);
	                    }
	
	                case 18:
	                case "end":
	                    return _context2.stop();
	            }
	        }
	    }, _callee, this, [[0, 6]]);
	}));
	
	app.use(router.get('/solutions/:id', regeneratorRuntime.mark(function _callee2(cid) {
	    var id;
	    return regeneratorRuntime.wrap(function _callee2$(_context3) {
	        while (1) {
	            switch (_context3.prev = _context3.next) {
	                case 0:
	                    console.log('solutions requested : ' + cid);
	                    id = parseInt(cid);
	                    _context3.next = 4;
	                    return getSolutions(id).then(function (solns) {
	                        //console.log('solutions found : '+solns.length);
	                        //solns.forEach(function (s) {console.log(s.lastPlay);});
	
	                        return { ok: true, pubID: id, solutions: solns };
	                    });
	
	                case 4:
	                    this.body = _context3.sent;
	
	                case 5:
	                case "end":
	                    return _context3.stop();
	            }
	        }
	    }, _callee2, this);
	})));
	
	app.use(router.get('/challenges/:id', regeneratorRuntime.mark(function _callee3(cid) {
	    var id;
	    return regeneratorRuntime.wrap(function _callee3$(_context4) {
	        while (1) {
	            switch (_context4.prev = _context4.next) {
	                case 0:
	                    console.log('challenges requested : ' + cid);
	                    id = parseInt(cid);
	                    _context4.next = 4;
	                    return getChallenges(id).then(function (rslts) {
	                        return { ok: true, results: rslts };
	                    });
	
	                case 4:
	                    this.body = _context4.sent;
	
	                case 5:
	                case "end":
	                    return _context4.stop();
	            }
	        }
	    }, _callee3, this);
	})));
	
	app.use(router.get('/puzzles/:cdt', regeneratorRuntime.mark(function _callee4(cdt) {
	    var dt, userId;
	    return regeneratorRuntime.wrap(function _callee4$(_context5) {
	        while (1) {
	            switch (_context5.prev = _context5.next) {
	                case 0:
	
	                    console.log("/puzzles called for : " + cdt);
	                    dt = oxiDate.parse(cdt, 'yyyyMMdd');
	                    userId = this.userId.id;
	                    _context5.next = 5;
	                    return getWeeklyUser(dt, userId).then(function (brds) {
	                        //console.log(brds);
	                        return { date: cdt, boards: brds };
	                    });
	
	                case 5:
	                    this.body = _context5.sent;
	
	                case 6:
	                case "end":
	                    return _context5.stop();
	            }
	        }
	    }, _callee4, this);
	})));
	
	app.use(router.get('/challenge5min', regeneratorRuntime.mark(function _callee5() {
	    return regeneratorRuntime.wrap(function _callee5$(_context6) {
	        while (1) {
	            switch (_context6.prev = _context6.next) {
	                case 0:
	
	                    console.log("/challenge5min called ");
	                    _context6.next = 3;
	                    return pg.get_random_killer();
	
	                case 3:
	                    this.body = _context6.sent;
	
	                case 4:
	                case "end":
	                    return _context6.stop();
	            }
	        }
	    }, _callee5, this);
	})));
	
	app.use(router.get('/challenge15min', regeneratorRuntime.mark(function _callee6() {
	    return regeneratorRuntime.wrap(function _callee6$(_context7) {
	        while (1) {
	            switch (_context7.prev = _context7.next) {
	                case 0:
	
	                    console.log("/challenge15min called ");
	                    _context7.next = 3;
	                    return pg.get_random_samurai();
	
	                case 3:
	                    this.body = _context7.sent;
	
	                case 4:
	                case "end":
	                    return _context7.stop();
	            }
	        }
	    }, _callee6, this);
	})));
	
	app.use(router.get('/hidato', regeneratorRuntime.mark(function _callee7() {
	    return regeneratorRuntime.wrap(function _callee7$(_context8) {
	        while (1) {
	            switch (_context8.prev = _context8.next) {
	                case 0:
	                    _context8.next = 2;
	                    return pg.get_random_hidato();
	
	                case 2:
	                    this.body = _context8.sent;
	
	                case 3:
	                case "end":
	                    return _context8.stop();
	            }
	        }
	    }, _callee7, this);
	})));
	
	//let b = "/media/sf_psq-site/puzzles/hidato.json" ;
	//let txt2 = fs.readFileSync(b, 'utf8')
	//console.log(txt2+". "+txt2.length);
	//console.log(txt2.charCodeAt(0));
	//this.body = yield JSON.parse(txt2);
	
	app.use(router.post('/solutions', regeneratorRuntime.mark(function _callee8() {
	    var body, id, p;
	    return regeneratorRuntime.wrap(function _callee8$(_context9) {
	        while (1) {
	            switch (_context9.prev = _context9.next) {
	                case 0:
	                    body = this.request.body; // from bodyparser
	
	                    body.user = this.userId.id;
	                    body.doc = { moves: body.moves };
	                    delete body.moves;
	                    id = body.puzzle;
	
	                    console.log('solution received : ' + id); // JSON.stringify(body));
	
	                    p = pg.upsert_solution(body).then(function () {
	                        solnsCache[id] = null;
	                        return getSolutions(id).then(function (solns) {
	                            return { ok: true, pubID: id, solutions: solns };
	                        });
	                    }).error(function (err) {
	                        var msg = 'Submit for ' + id + ' failed : ' + err.toString();
	                        console.log(msg);
	                        return { ok: false, msg: msg };
	                    });
	                    _context9.next = 9;
	                    return p;
	
	                case 9:
	                    this.body = _context9.sent;
	
	                case 10:
	                case "end":
	                    return _context9.stop();
	            }
	        }
	    }, _callee8, this);
	})));
	
	app.use(router.post('/challenges', regeneratorRuntime.mark(function _callee9() {
	    var body, id, p;
	    return regeneratorRuntime.wrap(function _callee9$(_context10) {
	        while (1) {
	            switch (_context10.prev = _context10.next) {
	                case 0:
	                    body = this.request.body; // from bodyparser
	
	                    body.user = this.userId.id;
	                    body.doc = { moves: body.moves };
	                    delete body.moves;
	                    id = body.timeOut;
	
	                    console.log('challenge result received : ' + id); // JSON.stringify(body));
	
	                    p = pg.upsert_challenge(body).then(function () {
	                        challengeCache[id] = null;
	                        return getChallenges(id).then(function (rslts) {
	                            return { ok: true, results: rslts };
	                        });
	                    }).error(function (err) {
	                        var msg = 'Submit for challenge ' + id + ' failed : ' + err.cause;
	                        console.log(msg);
	                        return { ok: false, msg: msg };
	                    });
	                    _context10.next = 9;
	                    return p;
	
	                case 9:
	                    this.body = _context10.sent;
	
	                case 10:
	                case "end":
	                    return _context10.stop();
	            }
	        }
	    }, _callee9, this);
	})));
	
	app.use(router.post('/newMoniker', regeneratorRuntime.mark(function _callee10() {
	    var newName, id, rslt;
	    return regeneratorRuntime.wrap(function _callee10$(_context11) {
	        while (1) {
	            switch (_context11.prev = _context11.next) {
	                case 0:
	                    newName = this.request.body.userName; // from bodyparser
	
	                    console.log("setting new Moniker : " + newName);
	                    console.log("for user " + JSON.stringify(this.user));
	                    id = this.userId.id;
	                    rslt = new Promise(function (resolve, reject) {
	                        if (checkMonikerUsed(newName)) resolve({ ok: false, msg: "taken" });else {
	                            var doc = pg.users[id];
	                            console.log("updating user : " + JSON.stringify(doc));
	                            pg.set_user_name(id, newName).then(function (updt) {
	                                console.log("user updated : " + JSON.stringify(updt));
	                                pg.users[id] = updt;
	                                resolve({ ok: true });
	                            });
	                        }
	                    });
	                    _context11.next = 7;
	                    return rslt;
	
	                case 7:
	                    this.body = _context11.sent;
	
	                case 8:
	                case "end":
	                    return _context11.stop();
	            }
	        }
	    }, _callee10, this);
	})));
	
	app.use(router.get('/userstats', regeneratorRuntime.mark(function _callee11() {
	    var id, rslt;
	    return regeneratorRuntime.wrap(function _callee11$(_context12) {
	        while (1) {
	            switch (_context12.prev = _context12.next) {
	                case 0:
	                    //console.log("getting stats for user " + JSON.stringify(this.user));
	                    id = this.userId.id;
	                    rslt = pg.get_user_stats(id).then(function (rows) {
	                        return { ok: true, rows: rows };
	                    });
	                    _context12.next = 4;
	                    return rslt;
	
	                case 4:
	                    this.body = _context12.sent;
	
	                case 5:
	                case "end":
	                    return _context12.stop();
	            }
	        }
	    }, _callee11, this);
	})));
	
	app.use(router.get('/logout', regeneratorRuntime.mark(function _callee12() {
	    var auth, _tok;
	
	    return regeneratorRuntime.wrap(function _callee12$(_context13) {
	        while (1) {
	            switch (_context13.prev = _context13.next) {
	                case 0:
	                    auth = this.userId.auth;
	                    //console.log("auth : "+auth);
	
	                    if (auth) {
	                        //pg.auths.destroy({auth, function (err,rslt) { });
	                        delete this.userId.auth;
	                        delete this.userId.groups;
	                        //console.log('changing token');
	                        _tok = jwt.sign(this.userId, jwt_secret); //{expiresInMinutes: 60*24*14});
	
	                        this.cookies.set('psq_user', _tok);
	                    }
	                    _context13.next = 4;
	                    return { ok: true };
	
	                case 4:
	                    this.body = _context13.sent;
	
	                case 5:
	                case "end":
	                    return _context13.stop();
	            }
	        }
	    }, _callee12, this);
	})));
	
	app.use(router.get('/auth/facebook', regeneratorRuntime.mark(function _callee14() {
	    var ctx;
	    return regeneratorRuntime.wrap(function _callee14$(_context15) {
	        while (1) {
	            switch (_context15.prev = _context15.next) {
	                case 0:
	                    console.log("/auth/facebook called");
	                    ctx = this;
	                    _context15.next = 4;
	                    return passport.authenticate('facebook', regeneratorRuntime.mark(function _callee13(err, authId, info) {
	                        return regeneratorRuntime.wrap(function _callee13$(_context14) {
	                            while (1) {
	                                switch (_context14.prev = _context14.next) {
	                                    case 0:
	                                        console.log("facebook called back");
	
	                                        if (!err) {
	                                            _context14.next = 3;
	                                            break;
	                                        }
	
	                                        throw err;
	
	                                    case 3:
	                                        if (info) console.log("info : " + info);
	                                        _context14.next = 6;
	                                        return authent(ctx, 'facebook', authId);
	
	                                    case 6:
	                                    case "end":
	                                        return _context14.stop();
	                                }
	                            }
	                        }, _callee13, this);
	                    })).call(this);
	
	                case 4:
	                case "end":
	                    return _context15.stop();
	            }
	        }
	    }, _callee14, this);
	})));
	
	app.use(router.get('/auth/google', regeneratorRuntime.mark(function _callee16() {
	    var ctx;
	    return regeneratorRuntime.wrap(function _callee16$(_context17) {
	        while (1) {
	            switch (_context17.prev = _context17.next) {
	                case 0:
	                    ctx = this;
	                    return _context17.delegateYield(passport.authenticate('google', regeneratorRuntime.mark(function _callee15(err, authId, info) {
	                        return regeneratorRuntime.wrap(function _callee15$(_context16) {
	                            while (1) {
	                                switch (_context16.prev = _context16.next) {
	                                    case 0:
	                                        console.log("google called back");
	
	                                        if (!err) {
	                                            _context16.next = 3;
	                                            break;
	                                        }
	
	                                        throw err;
	
	                                    case 3:
	                                        if (info) console.log("info : " + info);
	                                        return _context16.delegateYield(authent(ctx, 'google', authId), "t0", 5);
	
	                                    case 5:
	                                    case "end":
	                                        return _context16.stop();
	                                }
	                            }
	                        }, _callee15, this);
	                    })).call(this), "t0", 2);
	
	                case 2:
	                case "end":
	                    return _context17.stop();
	            }
	        }
	    }, _callee16, this);
	})));
	
	app.use(router.get('/auth/github', regeneratorRuntime.mark(function _callee18() {
	    var ctx;
	    return regeneratorRuntime.wrap(function _callee18$(_context19) {
	        while (1) {
	            switch (_context19.prev = _context19.next) {
	                case 0:
	                    ctx = this;
	                    return _context19.delegateYield(passport.authenticate('github', regeneratorRuntime.mark(function _callee17(err, authId, info) {
	                        return regeneratorRuntime.wrap(function _callee17$(_context18) {
	                            while (1) {
	                                switch (_context18.prev = _context18.next) {
	                                    case 0:
	                                        if (!err) {
	                                            _context18.next = 2;
	                                            break;
	                                        }
	
	                                        throw err;
	
	                                    case 2:
	                                        if (info) console.log("info : " + info);
	                                        return _context18.delegateYield(authent(ctx, 'github', authId), "t0", 4);
	
	                                    case 4:
	                                    case "end":
	                                        return _context18.stop();
	                                }
	                            }
	                        }, _callee17, this);
	                    })).call(this), "t0", 2);
	
	                case 2:
	                case "end":
	                    return _context19.stop();
	            }
	        }
	    }, _callee18, this);
	})));
	
	app.use(router.get('/auth/twitter', regeneratorRuntime.mark(function _callee20() {
	    var ctx;
	    return regeneratorRuntime.wrap(function _callee20$(_context21) {
	        while (1) {
	            switch (_context21.prev = _context21.next) {
	                case 0:
	                    ctx = this;
	                    return _context21.delegateYield(passport.authenticate('twitter', regeneratorRuntime.mark(function _callee19(err, authId, info) {
	                        return regeneratorRuntime.wrap(function _callee19$(_context20) {
	                            while (1) {
	                                switch (_context20.prev = _context20.next) {
	                                    case 0:
	                                        if (!err) {
	                                            _context20.next = 2;
	                                            break;
	                                        }
	
	                                        throw err;
	
	                                    case 2:
	                                        if (info) console.log("info : " + info);
	                                        return _context20.delegateYield(authent(ctx, 'twitter', authId), "t0", 4);
	
	                                    case 4:
	                                    case "end":
	                                        return _context20.stop();
	                                }
	                            }
	                        }, _callee19, this);
	                    })).call(this), "t0", 2);
	
	                case 2:
	                case "end":
	                    return _context21.stop();
	            }
	        }
	    }, _callee20, this);
	})));
	
	app.use(router.get('/blog/latest', regeneratorRuntime.mark(function _callee21() {
	    return regeneratorRuntime.wrap(function _callee21$(_context22) {
	        while (1) {
	            switch (_context22.prev = _context22.next) {
	                case 0:
	                    _context22.next = 2;
	                    return pg.query('select id,published,lastedit,title,body,tags from blog order by id desc limit 100');
	
	                case 2:
	                    this.body = _context22.sent;
	
	                case 3:
	                case "end":
	                    return _context22.stop();
	            }
	        }
	    }, _callee21, this);
	})));
	
	app.use(router.get('/blog/:id', regeneratorRuntime.mark(function _callee22(cid) {
	    var id;
	    return regeneratorRuntime.wrap(function _callee22$(_context23) {
	        while (1) {
	            switch (_context23.prev = _context23.next) {
	                case 0:
	                    id = parseInt(cid);
	                    _context23.next = 3;
	                    return pg.query('select id,published,lastedit,title,body,tags from blog where id = ' + id.toString());
	
	                case 3:
	                    this.body = _context23.sent;
	
	                case 4:
	                case "end":
	                    return _context23.stop();
	            }
	        }
	    }, _callee22, this);
	})));
	
	app.use(router.get('/blog/after/:id', regeneratorRuntime.mark(function _callee23(cid) {
	    var id;
	    return regeneratorRuntime.wrap(function _callee23$(_context24) {
	        while (1) {
	            switch (_context24.prev = _context24.next) {
	                case 0:
	                    id = parseInt(cid);
	                    _context24.next = 3;
	                    return pg.query('select id,published,lastedit,title,body,tags from blog where id > ' + id.toString());
	
	                case 3:
	                    this.body = _context24.sent;
	
	                case 4:
	                case "end":
	                    return _context24.stop();
	            }
	        }
	    }, _callee23, this);
	})));
	
	function getTags(url) {
	    var tags = [];
	    while (true) {
	        var i = url.indexOf('?tag=');
	        if (i < 0) break;
	        url = url.substring(i + 5);
	        var j = url.indexOf('?tag=');
	        var tag = j < 0 ? url : url.substring(0, j);
	        tags.push(tag);
	    }
	    if (tags.length === 0) {
	        console.log("no tags found");
	    }
	    return tags;
	}
	
	app.use(router.get('/blog/tags', regeneratorRuntime.mark(function _callee24() {
	    var url, tags;
	    return regeneratorRuntime.wrap(function _callee24$(_context25) {
	        while (1) {
	            switch (_context25.prev = _context25.next) {
	                case 0:
	                    //console.log('path: '+this.path);
	                    console.log('url: ' + this.url);
	                    url = this.url;
	                    tags = getTags(url);
	
	                    if (!(tags.length === 0)) {
	                        _context25.next = 9;
	                        break;
	                    }
	
	                    _context25.next = 6;
	                    return pg.query('select id,published,lastedit,title,body,tags from blog order by id desc limit 100');
	
	                case 6:
	                    this.body = _context25.sent;
	                    _context25.next = 12;
	                    break;
	
	                case 9:
	                    _context25.next = 11;
	                    return pg.query("select id,published,lastedit,title,body,tags from blog where ARRAY['" + tags.join("','") + "'] && tags::text[] order by id desc");
	
	                case 11:
	                    this.body = _context25.sent;
	
	                case 12:
	                case "end":
	                    return _context25.stop();
	            }
	        }
	    }, _callee24, this);
	})));
	
	app.use(router.post('/blog/save', regeneratorRuntime.mark(function _callee25() {
	    var post;
	    return regeneratorRuntime.wrap(function _callee25$(_context26) {
	        while (1) {
	            switch (_context26.prev = _context26.next) {
	                case 0:
	                    post = this.request.body;
	
	                    if (isMember('author', this)) {
	                        _context26.next = 7;
	                        break;
	                    }
	
	                    console.log('unauthorised attempt to save blog post: ' + post.id);
	                    _context26.next = 5;
	                    return { ok: false, error: "unauthorised" };
	
	                case 5:
	                    this.body = _context26.sent;
	                    return _context26.abrupt("return");
	
	                case 7:
	                    console.log('saving blog post: ' + post.id);
	                    if (!post.id) {
	                        post.published = new Date();
	                        delete post.id;
	                    }
	                    post.lastedit = new Date();
	                    _context26.next = 12;
	                    return pg.save(pg.db.blog, this.request.body).then(function (rslts) {
	                        //console.log("result : "+ JSON.stringify(rslts));
	                        return { ok: true, results: rslts };
	                    }).error(function (e) {
	                        console.log("error : " + JSON.stringify(e));
	                        return { ok: false, error: e };
	                    });
	
	                case 12:
	                    this.body = _context26.sent;
	
	                case 13:
	                case "end":
	                    return _context26.stop();
	            }
	        }
	    }, _callee25, this);
	})));
	
	app.use(router.get('/links', regeneratorRuntime.mark(function _callee26() {
	    return regeneratorRuntime.wrap(function _callee26$(_context27) {
	        while (1) {
	            switch (_context27.prev = _context27.next) {
	                case 0:
	                    console.log("/links called");
	                    _context27.next = 3;
	                    return pg.query('select id,published,lastedit,url,notes,tags from links order by id desc');
	
	                case 3:
	                    this.body = _context27.sent;
	
	                case 4:
	                case "end":
	                    return _context27.stop();
	            }
	        }
	    }, _callee26, this);
	})));
	
	app.use(router.get('/link/:id', regeneratorRuntime.mark(function _callee27(cid) {
	    var id;
	    return regeneratorRuntime.wrap(function _callee27$(_context28) {
	        while (1) {
	            switch (_context28.prev = _context28.next) {
	                case 0:
	                    id = parseInt(cid);
	                    _context28.next = 3;
	                    return pg.query('select id,published,lastedit,url,notes,tags from links where id = ' + id.toString());
	
	                case 3:
	                    this.body = _context28.sent;
	
	                case 4:
	                case "end":
	                    return _context28.stop();
	            }
	        }
	    }, _callee27, this);
	})));
	
	app.use(router.post('/link/delete', regeneratorRuntime.mark(function _callee28() {
	    return regeneratorRuntime.wrap(function _callee28$(_context29) {
	        while (1) {
	            switch (_context29.prev = _context29.next) {
	                case 0:
	                    if (isMember('author', this)) {
	                        _context29.next = 6;
	                        break;
	                    }
	
	                    console.log('unauthorised attempt to delete link(s)');
	                    _context29.next = 4;
	                    return { ok: false, error: "unauthorised" };
	
	                case 4:
	                    this.body = _context29.sent;
	                    return _context29.abrupt("return");
	
	                case 6:
	                    _context29.next = 8;
	                    return pg.destroy(pg.db.links, this.request.body);
	
	                case 8:
	                    this.body = _context29.sent;
	
	                case 9:
	                case "end":
	                    return _context29.stop();
	            }
	        }
	    }, _callee28, this);
	})));
	
	app.use(router.post('/link', regeneratorRuntime.mark(function _callee29() {
	    var link;
	    return regeneratorRuntime.wrap(function _callee29$(_context30) {
	        while (1) {
	            switch (_context30.prev = _context30.next) {
	                case 0:
	                    link = this.request.body;
	
	                    if (isMember('author', this)) {
	                        _context30.next = 7;
	                        break;
	                    }
	
	                    console.log('unauthorised attempt to save link');
	                    _context30.next = 5;
	                    return { ok: false, error: "unauthorised" };
	
	                case 5:
	                    this.body = _context30.sent;
	                    return _context30.abrupt("return");
	
	                case 7:
	
	                    console.log('saving link: ' + link.id);
	                    if (!link.id) {
	                        link.published = new Date();
	                        delete link.id;
	                    }
	                    link.lastedit = new Date();
	                    _context30.next = 12;
	                    return pg.save(pg.db.links, this.request.body).then(function (rslts) {
	                        //console.log("result : "+ JSON.stringify(rslts));
	                        return { ok: true, results: rslts };
	                    }).error(function (e) {
	                        console.log("error : " + JSON.stringify(e));
	                        return { ok: false, error: e };
	                    });
	
	                case 12:
	                    this.body = _context30.sent;
	
	                case 13:
	                case "end":
	                    return _context30.stop();
	            }
	        }
	    }, _callee29, this);
	})));
	app.use(router.post('/game/:gameid/move', regeneratorRuntime.mark(function _callee30(gameid) {
	    return regeneratorRuntime.wrap(function _callee30$(_context31) {
	        while (1) {
	            switch (_context31.prev = _context31.next) {
	                case 0:
	                case "end":
	                    return _context31.stop();
	            }
	        }
	    }, _callee30, this);
	})));
	
	/*
	app.use(router.get('*', function *(){
	    console.log('serving :' + this.path);
	    this.body = yield readFileThunk("./default.html" );
	}));
	*/
	
	//
	
	app.use((0, _middleware2.default)(app, { serveClientFile: false, heartbeat: true, heartbeatInterval: 5000 }));
	
	app.use((0, _koaStatic2.default)(".")); ///public"));  // last???
	
	console.log("executed");
	
	(0, _gameserver.init)(app.ws);
	
	module.exports = app;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.query = query;
	exports.where = where;
	exports.find = find;
	exports.findOne = findOne;
	exports.insert = insert;
	exports.update = update;
	exports.save = save;
	exports.destroy = destroy;
	exports.insert_user = insert_user;
	exports.insert_auth = insert_auth;
	exports.get_user_from_auth = get_user_from_auth;
	exports.set_user_name = set_user_name;
	exports.touch_user = touch_user;
	exports.upsert_solution = upsert_solution;
	exports.upsert_challenge = upsert_challenge;
	exports.shift_solutions = shift_solutions;
	exports.get_solutions = get_solutions;
	exports.get_challenges = get_challenges;
	exports.get_puzzle = get_puzzle;
	exports.get_day = get_day;
	exports.get_weekly_user = get_weekly_user;
	exports.get_random_killer = get_random_killer;
	exports.get_random_samurai = get_random_samurai;
	exports.get_random_hidato = get_random_hidato;
	exports.get_all_user_stats = get_all_user_stats;
	exports.get_gameType_stats = get_gameType_stats;
	exports.get_user_stats = get_user_stats;
	var url = process.env.DATABASE_URL;
	console.log('url : ' + url);
	var massive = __webpack_require__(68);
	var oxiDate = __webpack_require__(69);
	
	var pg = __webpack_require__(71);
	
	var deasync = __webpack_require__(72);
	
	var querySync = function querySync(sql, args) {
	    var rslt = null;
	    var fin = false;
	    var err = null;
	    pg.connect(url, function (e, client, done) {
	        if (e) err = e;else {
	            client.query(sql, args, function (e, res) {
	                done(); // return client to pool
	                if (err) err = e;else rslt = res;
	                fin = true;
	            });
	        }
	    });
	    while (!fin) {
	        deasync.runLoopOnce();
	    }if (err) throw err;
	    return rslt;
	};
	
	var db = exports.db = massive.loadSync({ connectionString: url });
	
	//db.tables.map( t => { console.log("table : "+t.name); });
	
	var userRows = querySync("select * from users").rows;
	var users = exports.users = Object.create(null);
	userRows.forEach(function (r) {
	    users[r.userId] = r;
	});
	users.count = userRows.length;
	
	var authRows = querySync("select * from auths").rows;
	var auths = exports.auths = Object.create(null);
	authRows.forEach(function (r) {
	    auths[r.authId] = r.userId;
	});
	
	function query(cmd, prms) {
	    return new Promise(function (resolve, reject) {
	        db.query(cmd, prms, function (err, rslt) {
	            if (err) reject(err);else resolve(rslt);
	        });
	    });
	};
	
	function where(tbl, cqry, prms) {
	    return new Promise(function (resolve, reject) {
	        tbl.where(cqry, prms, function (err, rslt) {
	            if (err) reject(err);else resolve(rslt);
	        });
	    });
	};
	
	function find(tbl, o) {
	    return new Promise(function (resolve, reject) {
	        tbl.find(o, function (err, rslt) {
	            if (err) reject(err);else resolve(rslt);
	        });
	    });
	};
	
	function findOne(tbl, o) {
	    return new Promise(function (resolve, reject) {
	        tbl.findOne(o, function (err, rslt) {
	            if (err) reject(err);else resolve(rslt);
	        });
	    });
	};
	
	function insert(tbl, o) {
	    return new Promise(function (resolve, reject) {
	        tbl.insert(o, function (err, rslt) {
	            if (err) reject(err);else resolve(rslt);
	        });
	    });
	};
	
	function update(tbl, o) {
	    return new Promise(function (resolve, reject) {
	        tbl.update(o, function (err, rslt) {
	            if (err) reject(err);else resolve(rslt);
	        });
	    });
	};
	
	function save(tbl, o) {
	    return new Promise(function (resolve, reject) {
	        tbl.save(o, function (err, rslt) {
	            if (err) reject(err);else resolve(rslt);
	        });
	    });
	};
	
	function destroy(tbl, o) {
	    return new Promise(function (resolve, reject) {
	        tbl.destroy(o, function (err, rslt) {
	            if (err) reject(err);else resolve(rslt);
	        });
	    });
	};
	
	function insert_user(id, userName) {
	    //console.log('Inserting user : ' + userName ) ;
	    var dt = new Date();
	    var usr = { userId: id, userName: userName, created: dt, updated: dt };
	    return insert(db.users, usr).then(function (rslt) {
	        users[id] = usr;
	        users.count = users.count + 1;
	        return rslt;
	    });
	};
	
	function insert_auth(prov, authId, userId) {
	    //console.log('Inserting auth for prov : ' + prov + ', user : ' + users[userId].userName  ) ;
	    var key = prov + ':' + authId;
	    var auth = { authId: key, userId: userId };
	    return insert(db.auths, auth).then(function (rslt) {
	        auths[key] = userId;
	        return rslt;
	    });
	};
	
	function get_user_from_auth(prov, authId) {
	    var rslt = auths[prov + ':' + authId];
	    if (rslt) rslt = users[rslt];
	    return rslt;
	};
	
	function set_user_name(userId, newName) {
	    var usr = users[userId];
	    if (!usr) return insert_user(id, newName);
	    if (usr.userName === newName) return;
	    var dt = new Date();
	    return query('update users set "userName" = $2, updated = $3 where "userId" = $1', [userId, newName, dt]).then(function (rslt) {
	        usr.userName = newName;
	        usr.updated = dt;
	        return usr;
	    });
	};
	
	function touch_user(userId) {
	    var usr = users[userId];
	    var dt = new Date();
	    return query('update users set updated = $2 where "userId" = $1', [userId, dt]).then(function (rslt) {
	        usr.updated = dt;
	        return usr;
	    });
	};
	
	function upsert_solution(soln) {
	    console.log('solution submitted, puzzle : ' + soln.puzzle + ", user : " + soln.user);
	    return where(db.solutions, 'puzzle=$1 and "user"=$2', [soln.puzzle, soln.user]).then(function (rslt) {
	        //console.log("solutions found : "+rslt.length);
	        if (rslt.length > 0) {
	            if (rslt[0].completed) return { ok: true, msg: 'already completed' };
	            soln.solnId = rslt[0].solnId;
	            return update(db.solutions, soln);
	        } else {
	            return insert(db.solutions, soln);
	        }
	    });
	};
	
	function upsert_challenge(chrslt) {
	    console.log('challenge submitted, timeOut : ' + chrslt.timeOut + ", user : " + chrslt.user);
	    if (chrslt.percentCompleted) delete chrslt.percentCompleted;
	    return where(db.challenges, '"timeOut"=$1 and "user"=$2', [chrslt.timeOut, chrslt.user]).then(function (rslt) {
	        //console.log("solutions found : "+rslt.length);
	        if (rslt.length > 0) {
	            rslt = rslt[0];
	            var strt = oxiDate.addDays(new Date(), -7);
	            console.log(chrslt.points.toString() + ", " + rslt.points);
	            if (strt > rslt.lastPlay || chrslt.points > rslt.points) {
	                console.log("saving challenge : " + chrslt.points);
	                chrslt.rsltId = rslt.rsltId;
	                return update(db.challenges, chrslt);
	            } else return { ok: true };
	        } else {
	            return insert(db.challenges, chrslt);
	        }
	    });
	};
	
	function shift_solutions(ufrom, uto) {
	    return new Promise(function (resolve, reject) {
	        db.query('update solutions set "user" = $2 where "user" = $1', [ufrom, uto], function (err, rslt) {
	            if (err) reject(err);else {
	                db.query('delete from users where "userId" = $1', [ufrom], function (err, rslt) {
	                    if (err) reject(err);else resolve(rslt);
	                });
	            }
	        });
	    });
	};
	
	function get_solutions(pzlId) {
	    //console.log("getting solutions for "+pzlId);
	    return where(db.solutions, "puzzle=$1 and completed=true", [pzlId]);
	};
	
	function get_challenges(tmOut) {
	    //console.log("getting solutions for "+pzlId);
	    var strt = oxiDate.toFormat(oxiDate.addDays(new Date(), -7), 'yyyyMMdd');
	    return query('select * from challenges where "timeOut"=$1 and "lastPlay" > $2 order by points desc limit 10', [tmOut, strt]);
	};
	
	function get_puzzle(pzlId) {
	    //console.log("getting puzzle "+pzlId);
	    return findOne(db.puzzles, pzlId).then(function (rslt) {
	        rslt.layout.pubID = pzlId;
	        return rslt.layout;
	    });
	};
	
	function get_day(dt) {
	    //console.log("getting day "+cdt);
	    return find(db.days, { date: dt }).then(function (rslt) {
	        var res = new Array(rslt.length);
	        rslt.forEach(function (r) {
	            res[r.pos] = r.puzzle;
	        });
	        return res;
	    });
	};
	
	function get_weekly_user(dt, uid) {
	
	    var csql = ' with pids as (' + '     select "date",pos,puzzle from days' + '     where "date" <= $1 and "date" > $2' + '     )' + ' select pids."date", pids.pos, p.*, s2.doc' + ' from pids ' + ' left join puzzles p on pids.puzzle = p."puzzleId"' + ' left join (select puzzle, doc from solutions s where s.user = $3) s2 on p."puzzleId" = s2.puzzle' + ' order by pids.date desc,pids.pos ';
	    var dt1 = oxiDate.toFormat(oxiDate.addDays(dt, 7), 'yyyyMMdd');
	    var dt2 = oxiDate.toFormat(oxiDate.addDays(dt, -8), 'yyyyMMdd');
	    return query(csql, [dt1, dt2, uid]);
	};
	
	var killerIds = querySync('select "puzzleId" from puzzles where "gameType" = \'Killer\' and rating = \'Easy\'').rows.map(function (o) {
	    return o.puzzleId;
	});
	
	function get_random_killer() {
	    var i = Math.floor(Math.random() * killerIds.length);
	    var pzl = killerIds[i];
	    return get_puzzle(pzl);
	};
	
	var samuraiIds = querySync('select "puzzleId" from puzzles where "gameType" = \'Samurai\' and rating = \'Easy\'').rows.map(function (o) {
	    return o.puzzleId;
	});
	
	function get_random_samurai() {
	    var i = Math.floor(Math.random() * samuraiIds.length);
	    var pzl = samuraiIds[i];
	    return get_puzzle(pzl);
	};
	
	var hidatoIds = querySync('select "puzzleId" from puzzles where "gameType" = \'Hidato\' ').rows.map(function (o) {
	    return o.puzzleId;
	});
	
	function get_random_hidato() {
	    var i = Math.floor(Math.random() * hidatoIds.length);
	    var pzl = hidatoIds[i];
	    return get_puzzle(pzl);
	};
	
	function get_all_user_stats() {
	    var csql = '\
	        with stats as ( \
	          select "gameType", "user",AVG("moveCount") as avgmoves ,count(*) as gamescompleted \
	          from solutions s \
	          join users u on s."user" = u."userId" \
	          join puzzles p on p."puzzleId" = s.puzzle \
	          where s.completed \
	          group by "user","gameType" \
	        ) \
	        select "gameType", user",avgmoves,gamescompleted, u."userName"  \
	        from stats s  \
	        join users u on s."user" = u."userId" ';
	    return query(csql);
	}
	
	function get_gameType_stats() {
	    var csql = '\
	      select "gameType", AVG("moveCount") as avgmoves ,count(*) as gamescompleted \
	      from solutions s \
	      join puzzles p on p."puzzleId" = s.puzzle \
	      where s.completed \
	      group by "gameType" ';
	    return query(csql);
	}
	
	function get_user_stats(uid) {
	    var csql = '\
	        with gamestats as ( \
	          select "gameType", round( AVG("moveCount") ) as avgmoves_all, count(*) as gamescompleted_all \
	          from solutions s \
	          join puzzles p on p."puzzleId" = s.puzzle \
	          where s.completed \
	          group by "gameType" \
	        ), userstats as ( \
	          select "gameType", round( AVG("moveCount") ) as avgmoves ,count(*) as gamescompleted \
	          from solutions s \
	          join puzzles p on p."puzzleId" = s.puzzle \
	          where s.completed and "user" = $1 \
	          group by "gameType" \
	        ) \
	        select g."gameType",avgmoves,gamescompleted,avgmoves_all,gamescompleted_all  \
	        from userstats u \
	        join gamestats g on u."gameType" = g."gameType" \
	        ';
	    return query(csql, [uid]);
	}
	
	//console.log = function(msg) { console.trace(msg) }

	//rslt.import_new_puzzles();
	//rslt.import_new_days();

/***/ },
/* 68 */
/***/ function(module, exports) {

	module.exports = require("massive");

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var timeSpan = __webpack_require__(70);
	
	var monthsAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
	var monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	
	var daysAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	
	var daysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	
	var dayNames = {
	    'su': 0,
	    'sun': 0,
	    'sunday': 0,
	    'mo': 1,
	    'mon': 1,
	    'monday': 1,
	    'tu': 2,
	    'tue': 2,
	    'tuesday': 2,
	    'we': 3,
	    'wed': 3,
	    'wednesday': 3,
	    'th': 4,
	    'thu': 4,
	    'thursday': 4,
	    'fr': 5,
	    'fri': 5,
	    'friday': 5,
	    'sa': 6,
	    'sat': 6,
	    'saturday': 6
	};
	var monthsAll = monthsFull.concat(monthsAbbr);
	var daysAll = ['su', 'sun', 'sunday', 'mo', 'mon', 'monday', 'tu', 'tue', 'tuesday', 'we', 'wed', 'wednesday', 'th', 'thu', 'thursday', 'fr', 'fri', 'friday', 'sa', 'sat', 'saturday'];
	
	var monthNames = {
	    'jan': 0,
	    'january': 0,
	    'feb': 1,
	    'february': 1,
	    'mar': 2,
	    'march': 2,
	    'apr': 3,
	    'april': 3,
	    'may': 4,
	    'jun': 5,
	    'june': 5,
	    'jul': 6,
	    'july': 6,
	    'aug': 7,
	    'august': 7,
	    'sep': 8,
	    'september': 8,
	    'oct': 9,
	    'october': 9,
	    'nov': 10,
	    'november': 10,
	    'dec': 11,
	    'december': 11
	};
	
	var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	
	function pad(str, length) {
	    str = String(str);
	    while (str.length < length) {
	        str = '0' + str;
	    }
	    return str;
	}
	
	var isInteger = function isInteger(str) {
	    if (str.match(/^(\d+)$/)) {
	        return true;
	    }
	    return false;
	};
	var getInt = function getInt(str, i, minlength, maxlength) {
	    for (var x = maxlength; x >= minlength; x--) {
	        var token = str.substring(i, i + x);
	        if (token.length < minlength) {
	            return null;
	        }
	        if (isInteger(token)) {
	            return token;
	        }
	    }
	    return null;
	};
	
	var origParse = Date.parse;
	// ------------------------------------------------------------------
	// getDateFromFormat( date_string , format_string )
	//
	// This function takes a date string and a format string. It matches
	// If the date string matches the format string, it returns the
	// getTime() of the date. If it does not match, it returns NaN.
	// Original Author: Matt Kruse <matt@mattkruse.com>
	// WWW: http://www.mattkruse.com/
	// Adapted from: http://www.mattkruse.com/javascript/date/source.html
	// ------------------------------------------------------------------
	
	var getDateFromFormat = function getDateFromFormat(val, format) {
	    val = val + "";
	    format = format + "";
	    var iVal = 0;
	    var iFormat = 0;
	    var c = "";
	    var token = "";
	    var token2 = "";
	    var x, y;
	    var now = new Date();
	    var year = now.getYear();
	    var month = now.getMonth() + 1;
	    var date = 1;
	    var hh = 0;
	    var mm = 0;
	    var ss = 0;
	    var ampm = "";
	
	    while (iFormat < format.length) {
	        // Get next token from format string
	        c = format.charAt(iFormat);
	        token = "";
	        while (format.charAt(iFormat) === c && iFormat < format.length) {
	            token += format.charAt(iFormat++);
	        }
	        // Extract contents of value based on format token
	        if (token === "yyyy" || token === "yy" || token === "y") {
	            if (token === "yyyy") {
	                x = 4;
	                y = 4;
	            }
	            if (token === "yy") {
	                x = 2;
	                y = 2;
	            }
	            if (token === "y") {
	                x = 2;
	                y = 4;
	            }
	            year = getInt(val, iVal, x, y);
	            if (year === null) {
	                return NaN;
	            }
	            iVal += year.length;
	            if (year.length === 2) {
	                if (year > 70) {
	                    year = 1900 + (year - 0);
	                } else {
	                    year = 2000 + (year - 0);
	                }
	            }
	        } else if (token === "MMM" || token === "NNN") {
	            month = 0;
	            for (var i = 0; i < monthsAll.length; i++) {
	                var monthName = monthsAll[i];
	                if (val.substring(iVal, iVal + monthName.length).toLowerCase() === monthName.toLowerCase()) {
	                    if (token === "MMM" || token === "NNN" && i > 11) {
	                        month = i + 1;
	                        if (month > 12) {
	                            month -= 12;
	                        }
	                        iVal += monthName.length;
	                        break;
	                    }
	                }
	            }
	            if (month < 1 || month > 12) {
	                return NaN;
	            }
	        } else if (token === "EE" || token === "E") {
	            for (var n = 0; n < daysAll.length; n++) {
	                var dayName = daysAll[n];
	                if (val.substring(iVal, iVal + dayName.length).toLowerCase() === dayName.toLowerCase()) {
	                    iVal += dayName.length;
	                    break;
	                }
	            }
	        } else if (token === "MM" || token === "M") {
	            month = getInt(val, iVal, token.length, 2);
	            if (month === null || month < 1 || month > 12) {
	                return NaN;
	            }
	            iVal += month.length;
	        } else if (token === "dd" || token === "d") {
	            date = getInt(val, iVal, token.length, 2);
	            if (date === null || date < 1 || date > 31) {
	                return NaN;
	            }
	            iVal += date.length;
	        } else if (token === "hh" || token === "h") {
	            hh = getInt(val, iVal, token.length, 2);
	            if (hh === null || hh < 1 || hh > 12) {
	                return NaN;
	            }
	            iVal += hh.length;
	        } else if (token === "HH" || token === "H") {
	            hh = getInt(val, iVal, token.length, 2);
	            if (hh === null || hh < 0 || hh > 23) {
	                return NaN;
	            }
	            iVal += hh.length;
	        } else if (token === "KK" || token === "K") {
	            hh = getInt(val, iVal, token.length, 2);
	            if (hh === null || hh < 0 || hh > 11) {
	                return NaN;
	            }
	            iVal += hh.length;
	        } else if (token === "kk" || token === "k") {
	            hh = getInt(val, iVal, token.length, 2);
	            if (hh === null || hh < 1 || hh > 24) {
	                return NaN;
	            }
	            iVal += hh.length;
	            hh--;
	        } else if (token === "mm" || token === "m") {
	            mm = getInt(val, iVal, token.length, 2);
	            if (mm === null || mm < 0 || mm > 59) {
	                return NaN;
	            }
	            iVal += mm.length;
	        } else if (token === "ss" || token === "s") {
	            ss = getInt(val, iVal, token.length, 2);
	            if (ss === null || ss < 0 || ss > 59) {
	                return NaN;
	            }
	            iVal += ss.length;
	        } else if (token === "a") {
	            if (val.substring(iVal, iVal + 2).toLowerCase() === "am") {
	                ampm = "AM";
	            } else if (val.substring(iVal, iVal + 2).toLowerCase() === "pm") {
	                ampm = "PM";
	            } else {
	                return NaN;
	            }
	            iVal += 2;
	        } else {
	            if (val.substring(iVal, iVal + token.length) !== token) {
	                return NaN;
	            } else {
	                iVal += token.length;
	            }
	        }
	    }
	    // If there are any trailing characters left in the value, it doesn't match
	    if (iVal !== val.length) {
	        return NaN;
	    }
	    // Is date valid for month?
	    if (month === 2) {
	        // Check for leap year
	        if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
	            // leap year
	            if (date > 29) {
	                return NaN;
	            }
	        } else {
	            if (date > 28) {
	                return NaN;
	            }
	        }
	    }
	    if (month === 4 || month === 6 || month === 9 || month === 11) {
	        if (date > 30) {
	            return NaN;
	        }
	    }
	    // Correct hours value
	    if (hh < 12 && ampm === "PM") {
	        hh = hh - 0 + 12;
	    } else if (hh > 11 && ampm === "AM") {
	        hh -= 12;
	    }
	    var newdate = new Date(year, month - 1, date, hh, mm, ss);
	    return newdate;
	};
	
	var oxiDate = {};
	var offsetMinutes = new Date().getTimezoneOffset();
	
	oxiDate.createUTC = function () {
	    return oxiDate.toUTC(new Date());
	};
	
	oxiDate.parse = function (cdt, format) {
	    return format ? getDateFromFormat(cdt, format) : new Date(cdt);
	};
	
	oxiDate.parseUTC = function (cdt, format) {
	    var rslt = oxiDate.parse(cdt, format);
	    rslt.isUTC = true;
	    return rslt;
	};
	
	oxiDate.toUTC = function (date) {
	    if (date.isUTC) return date;
	    var rslt = oxiDate.addMinutes(date, offsetMinutes);
	    rslt.isUTC = true;
	    return rslt;
	};
	
	oxiDate.fromUTC = function (date) {
	    if (!date.isUTC) return date;
	    var rslt = oxiDate.addMinutes(date, -offsetMinutes);
	    rslt.isUTC = false;
	    return rslt;
	};
	
	oxiDate.validateDay = function (day, year, month) {
	    var date = new Date(year, month, day);
	    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
	};
	
	oxiDate.validateYear = function (year) {
	    return year >= 0 && year <= 9999;
	};
	
	oxiDate.validateSecond = function (second) {
	    return second >= 0 && second < 60;
	};
	
	oxiDate.validateMonth = function (month) {
	    return month >= 0 && month < 12;
	};
	
	oxiDate.validateMinute = function (minute) {
	    return minute >= 0 && minute < 60;
	};
	
	oxiDate.validateMillisecond = function (milli) {
	    return milli >= 0 && milli < 1000;
	};
	
	oxiDate.validateHour = function (hour) {
	    return hour >= 0 && hour < 24;
	};
	
	oxiDate.compare = function (date1, date2) {
	    if (date1.valueOf() < date2.valueOf()) {
	        return -1;
	    } else if (date1.valueOf() > date2.valueOf()) {
	        return 1;
	    }
	    return 0;
	};
	
	oxiDate.equals = function (date1, date2) {
	    return date1.valueOf() === date2.valueOf();
	};
	
	oxiDate.getDayNumberFromName = function (name) {
	    return dayNames[name.toLowerCase()];
	};
	
	oxiDate.getMonthNumberFromName = function (name) {
	    return monthNames[name.toLowerCase()];
	};
	
	oxiDate.getMonthNameFromNumber = function (number) {
	    return monthsFull[number];
	};
	
	oxiDate.getMonthAbbrFromNumber = function (number) {
	    return monthsAbbr[number];
	};
	
	oxiDate.isLeapYear = function (year) {
	    return new Date(year, 1, 29).getDate() === 29;
	};
	
	oxiDate.getDaysInMonth = function (year, month) {
	    if (month === 1) {
	        return Date.isLeapYear(year) ? 29 : 28;
	    }
	    return daysInMonth[month];
	};
	
	oxiDate.add = function (date, ts) {
	    var ms = date.valueOf() + ts.totalMilliseconds();
	    return new Date(ms);
	};
	
	oxiDate.addDays = function (date, n) {
	    var dt = new Date(date.getTime());
	    dt.setDate(date.getDate() + n);
	    return dt;
	};
	
	oxiDate.addHours = function (date, n) {
	    return oxiDate.add(date, timeSpan.FromHours(n));
	};
	
	oxiDate.addMinutes = function (date, n) {
	    return oxiDate.add(date, timeSpan.FromMinutes(n));
	};
	
	oxiDate.addSeconds = function (date, n) {
	    return oxiDate.add(date, timeSpan.FromSeconds(n));
	};
	
	oxiDate.addMilliseconds = function (date, n) {
	    return oxiDate.add(date, new timeSpan(n));
	};
	
	oxiDate.getMonthAbbr = function (date) {
	    return monthsAbbr[date.getMonth()];
	};
	
	oxiDate.getMonthName = function (date) {
	    return monthsFull[date.getMonth()];
	};
	
	oxiDate.clearTime = function (dt) {
	    var dt = new Date(dt.getTime());
	    dt.setHours(0);
	    dt.setMinutes(0);
	    dt.setSeconds(0);
	    dt.setMilliseconds(0);
	    return dt;
	};
	
	oxiDate.today = function () {
	    return oxiDate.clearTime(new Date());
	};
	
	var toFormat = function toFormat(date, format, replaceMap) {
	    var f = [format],
	        i,
	        l,
	        s;
	    var replace = function replace(str, rep) {
	        var i = 0,
	            l = f.length,
	            j,
	            ll,
	            t,
	            n = [];
	        for (; i < l; i++) {
	            if (typeof f[i] == 'string') {
	                t = f[i].split(str);
	                for (j = 0, ll = t.length - 1; j < ll; j++) {
	                    n.push(t[j]);
	                    n.push([rep]); // replacement pushed as non-string
	                }
	                n.push(t[ll]);
	            } else {
	                // must be a replacement, don't process, just push
	                n.push(f[i]);
	            }
	        }
	        f = n;
	    };
	
	    for (i in replaceMap) {
	        replace(i, replaceMap[i]);
	    }
	
	    s = '';
	    for (i = 0, l = f.length; i < l; i++) {
	        s += typeof f[i] == 'string' ? f[i] : f[i][0];
	    }return f.join('');
	};
	
	oxiDate.toFormatUTC = function (date, format) {
	    return toFormat(date, format, date.isUTC ? getReplaceMap(date) : getUTCReplaceMap(date));
	};
	
	oxiDate.toFormat = function (date, format) {
	    return toFormat(date, format, getReplaceMap(date));
	};
	
	var getReplaceMap = function getReplaceMap(date) {
	    var hours = date.getHours() % 12 ? date.getHours() % 12 : 12;
	    return {
	        'YYYY': date.getFullYear(),
	        'yyyy': date.getFullYear(),
	        'YY': String(date.getFullYear()).slice(-2),
	        'MMMM': monthsFull[date.getMonth()],
	        'MMM': monthsAbbr[date.getMonth()],
	        'MM': pad(date.getMonth() + 1, 2),
	        'MI': pad(date.getMinutes(), 2),
	        'M': date.getMonth() + 1,
	        'DDDD': daysFull[date.getDay()],
	        'DDD': daysAbbr[date.getDay()],
	        'DD': pad(date.getDate(), 2),
	        'dd': pad(date.getDate(), 2),
	        'D': date.getDate(),
	        'HH': pad(date.getHours(), 2),
	        'hh': pad(hours, 2),
	        'H': hours,
	        'SS': pad(date.getSeconds(), 2),
	        'PP': date.getHours() >= 12 ? 'PM' : 'AM',
	        'P': date.getHours() >= 12 ? 'pm' : 'am',
	        'LL': pad(date.getMilliseconds(), 3)
	    };
	};
	
	var getUTCReplaceMap = function getUTCReplaceMap(date) {
	    var hours = date.getUTCHours() % 12 ? date.getUTCHours() % 12 : 12;
	    return {
	        'YYYY': date.getUTCFullYear(),
	        'yyyy': date.getUTCFullYear(),
	        'YY': String(date.getUTCFullYear()).slice(-2),
	        'MMMM': monthsFull[date.getUTCMonth()],
	        'MMM': monthsAbbr[date.getUTCMonth()],
	        'MM': pad(date.getUTCMonth() + 1, 2),
	        'MI': pad(date.getUTCMinutes(), 2),
	        'M': date.getUTCMonth() + 1,
	        'DDDD': daysFull[date.getUTCDay()],
	        'DDD': daysAbbr[date.getUTCDay()],
	        'DD': pad(date.getUTCDate(), 2),
	        'dd': pad(date.getUTCDate(), 2),
	        'D': date.getUTCDate(),
	        'HH': pad(date.getUTCHours(), 2),
	        'hh': pad(hours, 2),
	        'H': hours,
	        'SS': pad(date.getUTCSeconds(), 2),
	        'PP': date.getUTCHours() >= 12 ? 'PM' : 'AM',
	        'P': date.getUTCHours() >= 12 ? 'pm' : 'am',
	        'LL': pad(date.getUTCMilliseconds(), 3)
	    };
	};
	
	var pauseableTimer = function pauseableTimer(strt) {
	    var pstrt = new Date();
	    strt = strt || pstrt;
	    var rslt = { started: strt, paused: 0, pauseStarted: pstrt };
	
	    rslt.pause = function () {
	        if (!rslt.isPaused()) rslt.pauseStarted = new Date();
	    };
	
	    rslt.unPause = function () {
	        if (rslt.isPaused()) {
	            var diff = timeSpan.FromDates(rslt.pauseStarted, new Date()).totalMilliseconds();
	            rslt.paused += diff;
	            rslt.pauseStarted = null;
	        }
	    };
	
	    rslt.start = rslt.unPause;
	
	    rslt.isPaused = function () {
	        return rslt.pauseStarted === null;
	    };
	
	    rslt.elapsed = function () {
	        //console.log('elapsed called');
	        var now = rslt.isPaused() ? rslt.pauseStarted : new Date();
	        var msecs = timeSpan.FromDates(rslt.started, now).totalMilliseconds();
	        return msecs - rslt.paused;
	    };
	
	    return rslt;
	};
	
	oxiDate.pauseableTimer = pauseableTimer;
	
	module.exports = oxiDate;

/***/ },
/* 70 */
/***/ function(module, exports) {

	'use strict';
	
	function pad(str, length) {
	    str = String(str);
	    while (str.length < length) {
	        str = '0' + str;
	    }
	    return str;
	}
	
	var TimeSpan = function TimeSpan(milliseconds) {
	    var msecPerSecond = 1000;
	    var msecPerMinute = 60000;
	    var msecPerHour = 3600000;
	    var msecPerDay = 86400000;
	    var msecs = milliseconds;
	
	    var isNumeric = function isNumeric(input) {
	        return !isNaN(parseFloat(input)) && isFinite(input);
	    };
	
	    this.addMilliseconds = function (milliseconds) {
	        if (!isNumeric(milliseconds)) {
	            return;
	        }
	        return new TimeSpan(msecs = milliseconds);
	    };
	    this.addSeconds = function (seconds) {
	        if (!isNumeric(seconds)) {
	            return;
	        }
	        return new TimeSpan(msecs + seconds * msecPerSecond);
	    };
	    this.addMinutes = function (minutes) {
	        if (!isNumeric(minutes)) {
	            return;
	        }
	        return new TimeSpan(msecs + minutes * msecPerMinute);
	    };
	    this.addHours = function (hours) {
	        if (!isNumeric(hours)) {
	            return;
	        }
	        return new TimeSpan(msecs + hours * msecPerHour);
	    };
	    this.addDays = function (days) {
	        if (!isNumeric(days)) {
	            return;
	        }
	        return new TimeSpan(msecs + days * msecPerDay);
	    };
	
	    this.add = function (otherTimeSpan) {
	        return new TimeSpan(msecs + otherTimeSpan.totalMilliseconds());
	    };
	    this.subtract = function (otherTimeSpan) {
	        return new TimeSpan(msecs - otherTimeSpan.totalMilliseconds());
	    };
	    this.equals = function (otherTimeSpan) {
	        return msecs === otherTimeSpan.totalMilliseconds();
	    };
	
	    // Getters
	    this.totalMilliseconds = function () {
	        return msecs;
	    };
	    this.totalSeconds = function () {
	        var result = msecs / msecPerSecond;
	        return result;
	    };
	    this.totalMinutes = function () {
	        var result = msecs / msecPerMinute;
	        return result;
	    };
	    this.totalHours = function () {
	        var result = msecs / msecPerHour;
	        return result;
	    };
	    this.totalDays = function () {
	        var result = msecs / msecPerDay;
	        return result;
	    };
	
	    this.milliseconds = function () {
	        return msecs % msecPerSecond;
	    };
	    this.seconds = function () {
	        var ms = msecs % msecPerMinute;
	        return Math.floor(ms / msecPerSecond);
	    };
	    this.minutes = function () {
	        var ms = msecs % msecPerHour;
	        return Math.floor(ms / msecPerMinute);
	    };
	    this.hours = function () {
	        var ms = msecs % msecPerDay;
	        return Math.floor(ms / msecPerHour);
	    };
	    this.days = function () {
	        return Math.floor(msecs / msecPerHour);
	    };
	    this.toString = function () {
	        return this.toFormat("H:MI:SS");
	    };
	    this.toFormat = function (format) {
	        var replaceMap = {
	            'hh': pad(this.hours(), 2),
	            'H': this.hours(),
	            'MI': pad(this.minutes(), 2),
	            'SS': pad(this.seconds(), 2),
	            'LLL': pad(this.milliseconds(), 3)
	        };
	        var f = [format],
	            i,
	            l,
	            s;
	        var replace = function replace(str, rep) {
	            var i = 0,
	                l = f.length,
	                j,
	                ll,
	                t,
	                n = [];
	            for (; i < l; i++) {
	                if (typeof f[i] == 'string') {
	                    t = f[i].split(str);
	                    for (j = 0, ll = t.length - 1; j < ll; j++) {
	                        n.push(t[j]);
	                        n.push([rep]); // replacement pushed as non-string
	                    }
	                    n.push(t[ll]);
	                } else {
	                    // must be a replacement, don't process, just push
	                    n.push(f[i]);
	                }
	            }
	            f = n;
	        };
	
	        for (i in replaceMap) {
	            replace(i, replaceMap[i]);
	        }
	
	        s = '';
	        for (i = 0, l = f.length; i < l; i++) {
	            s += typeof f[i] == 'string' ? f[i] : f[i][0];
	        }return f.join('');
	    };
	};
	
	// "Static Constructors"
	TimeSpan.FromSeconds = function (n) {
	    return new TimeSpan(0).addSeconds(n);
	};
	TimeSpan.FromMinutes = function (n) {
	    return new TimeSpan(0).addMinutes(n);
	};
	TimeSpan.FromHours = function (n) {
	    return new TimeSpan(0).addHours(n);
	};
	TimeSpan.FromDays = function (n) {
	    return new TimeSpan(0).addDays(n);
	};
	TimeSpan.FromDates = function (firstDate, secondDate) {
	    var diff = secondDate.valueOf() - firstDate.valueOf();
	    return new TimeSpan(diff, 0, 0, 0, 0);
	};
	
	module.exports = TimeSpan;

/***/ },
/* 71 */
/***/ function(module, exports) {

	module.exports = require("pg");

/***/ },
/* 72 */
/***/ function(module, exports) {

	module.exports = require("deasync");

/***/ },
/* 73 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.solutionSorter = solutionSorter;
	exports.isMember = isMember;
	exports.isCellActive = isCellActive;
	function solutionSorter(a, b) {
	    var ma = a.moves;
	    var mb = b.moves;
	    var acnt = ma[ma.length - 1].moveCount;
	    var bcnt = mb[mb.length - 1].moveCount;
	    return acnt > bcnt;
	};
	
	function isMember(grp) {
	    var grps = localStorage.getItem('pseudoq.groups');
	    return grps && grps.indexOf(grp + ',') >= 0;
	}
	
	var inactives = ["J1", "K1", "L1", "J2", "K2", "L2", "J3", "K3", "L3", "J4", "K4", "L4", "J5", "K5", "L5", "J6", "K6", "L6", "J16", "K16", "L16", "J17", "K17", "L17", "J18", "K18", "L18", "J19", "K19", "L19", "J20", "K20", "L20", "J21", "K21", "L21", "A10", "B10", "C10", "D10", "E10", "F10", "P10", "Q10", "R10", "S10", "T10", "U10", "A11", "B11", "C11", "D11", "E11", "F11", "P11", "Q11", "R11", "S11", "T11", "U11", "A12", "B12", "C12", "D12", "E12", "F12", "P12", "Q12", "R12", "S12", "T12", "U12"];
	
	function isCellActive(id) {
	    return inactives.indexOf(id) < 0;
	};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	exports.default = function (app) {
	    var passedOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    // Default options
	    var options = _extends({
	        serveClientFile: true,
	        clientFilePath: '/koaws.js',
	        heartbeat: true,
	        heartbeatInterval: 5000
	    }, passedOptions);
	
	    var oldListen = app.listen;
	    app.listen = function () {
	        debug('Attaching server...');
	        app.server = oldListen.apply(app, arguments);
	        app.ws.listen(app.server);
	        return app;
	    };
	
	    app.ws = new _server2.default(app, options);
	
	    return regeneratorRuntime.mark(function _callee(next) {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	            while (1) {
	                switch (_context.prev = _context.next) {
	                    case 0:
	                        if (this.session && this.session.id) {
	                            if (typeof app.ws.sockets[this.session.id] === 'undefined') {
	                                ws.sockets[this.session.id] = [];
	                            }
	                            app.ws.sessions[this.session.id] = this.session;
	                            this.sockets = app.ws.sockets[this.session.id];
	                        }
	                        _context.next = 3;
	                        return next;
	
	                    case 3:
	                    case 'end':
	                        return _context.stop();
	                }
	            }
	        }, _callee, this);
	    });
	};
	
	var _server = __webpack_require__(75);
	
	var _server2 = _interopRequireDefault(_server);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var fs = __webpack_require__(80);
	var path = __webpack_require__(81);
	var debug = __webpack_require__(64)('ws-koa');
	
	;

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	// Request object
	
	// Protocol
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = KoaWebSocketServer;
	
	var _co = __webpack_require__(76);
	
	var _co2 = _interopRequireDefault(_co);
	
	var _ws = __webpack_require__(77);
	
	var _request = __webpack_require__(78);
	
	var _request2 = _interopRequireDefault(_request);
	
	var _jsonrpc = __webpack_require__(79);
	
	var _jsonrpc2 = _interopRequireDefault(_jsonrpc);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Debug output
	var debug = console.log.bind(console); // require('debug')('koa-ws:server');
	
	/**
	 * KoaWebSocketServer object
	 * @param app
	 * @param options
	 */
	function KoaWebSocketServer(app, options) {
	    // Save ref to app
	    this.app = app;
	
	    // Container for options
	    this._options = options || {};
	
	    // Container for methods
	    this._methods = {};
	
	    // Container for sockets
	    this._sockets = {};
	
	    // Session to socket mapping
	    this._sessions = {};
	
	    // Callback container for results
	    this._awaitingResults = {};
	}
	
	KoaWebSocketServer.prototype.listen = function (server) {
	    // Create WebSocketServer
	    this.server = new _ws.Server({
	        server: server
	    });
	
	    // Listen to connection
	    this.server.on('connection', this.onConnection.bind(this));
	};
	
	/**
	 * On new connection
	 * @param socket
	 */
	KoaWebSocketServer.prototype.onConnection = function (socket) {
	    var server = this._server;
	    var methods = this._methods;
	    var sockets = this._sockets;
	    var sessions = this._sessions;
	    var awaitingResults = {};
	
	    console.log("socket connection");
	
	    socket.method = function () {
	        var cb = null;
	        var payload = {
	            jsonrpc: '2.0',
	            method: arguments[0],
	            id: Math.random().toString(36).substr(2, 9) // Generate random id
	        };
	
	        if (typeof arguments[1] !== 'function' && typeof arguments[1] !== 'undefined') {
	            payload.params = arguments[1];
	            if (typeof arguments[2] === 'function') {
	                cb = arguments[2];
	            }
	        } else if (typeof arguments[1] === 'function') {
	            cb = arguments[1];
	        }
	
	        if (cb) {
	            this._awaitingResults[payload.id] = function () {
	                cb.apply(this, arguments);
	                delete this._awaitingResults[payload.id];
	            }.bind(this);
	        }
	
	        try {
	            debug('→ (%s) %s: %o', payload.id, payload.method, payload.params);
	            socket.send(JSON.stringify(payload));
	        } catch (e) {
	            console.error('Something went wrong: ', e.stack);
	            if (cb) {
	                cb.call(this, e);
	            }
	        }
	    }.bind(this);
	
	    socket.result = function (result) {
	        try {
	            var payload = {
	                jsonrpc: '2.0',
	                result: result,
	                id: this.currentId
	            };
	            debug('→ (%s) Result: %o', payload.id, payload.result);
	            socket.send(JSON.stringify(payload));
	        } catch (e) {
	            console.error('Something went wrong: ', e.stack);
	        }
	    }.bind(this);
	
	    socket.error = function (code, message) {
	        try {
	            var payload = {
	                jsonrpc: '2.0',
	                error: {
	                    code: code,
	                    message: message
	                },
	                id: this.currentId
	            };
	            if (payload.id) {
	                debug('→ (%s) Error %s: %s', payload.id, payload.error.code, payload.error.message);
	            } else {
	                debug('→ Error %s: %s', payload.id, payload.error.code, payload.error.message);
	            }
	            socket.send(JSON.stringify(payload));
	        } catch (e) {
	            console.error('Something went wrong: ', e.stack);
	        }
	    };
	
	    socket.on('close', function () {
	        debug('Client disconnected');
	        if (socket.session && Array.isArray(sockets[socket.session.id])) {
	            sockets[socket.session.id].splice(sockets[socket.session.id].indexOf(socket), 1);
	        }
	    });
	
	    socket.on('error', function (err) {
	        debug('Error occurred:', err);
	    });
	
	    socket.on('message', function (message) {
	        _jsonrpc2.default.apply(this, [debug, socket, message]);
	    }.bind(this));
	
	    // Send options
	    socket.method('options', this._options);
	
	    // Send initial thump
	    if (this._options.heartbeat) {
	        socket.send('--thump--');
	    }
	
	    // Let's try and connect the socket to session
	    var sessionId = cookieHelper.get(socket, 'koa.sid', this.app.keys);
	    if (sessionId) {
	        if (typeof this._sockets[sessionId] === 'undefined') {
	            this._sockets[sessionId] = [];
	        }
	        this._sockets[sessionId].push(socket);
	
	        if (this.app.sessionStore) {
	            var _this = this;
	            _co2.default.wrap(regeneratorRuntime.mark(function _callee() {
	                return regeneratorRuntime.wrap(function _callee$(_context) {
	                    while (1) {
	                        switch (_context.prev = _context.next) {
	                            case 0:
	                                _context.next = 2;
	                                return _this.app.sessionStore.get('koa:sess:' + sessionId);
	
	                            case 2:
	                                socket.session = _context.sent;
	
	                                socket.method('session', socket.session);
	
	                            case 4:
	                            case 'end':
	                                return _context.stop();
	                        }
	                    }
	                }, _callee, this);
	            }))();
	        }
	    }
	};
	
	/**
	 * Register a method for server-side
	 * @param method
	 * @param generator
	 * @param expose
	 */
	KoaWebSocketServer.prototype.register = function (method, generator, expose) {
	    if ((typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'object') {
	        for (var m in method) {
	            this.register(m, method[m]);
	        }
	    } else if ((typeof generator === 'undefined' ? 'undefined' : _typeof(generator)) === 'object') {
	        for (var m in generator) {
	            this.register(method + ':' + m, generator[m]);
	        }
	    } else if (typeof method === 'string') {
	        debug('Registering method: %s', method);
	        generator.expose = expose || false;
	        this._methods[method] = _co2.default.wrap(generator);
	    }
	};
	
	/**
	 * Broadcast to all connected sockets
	 * @param method string
	 * @param params object
	 */
	KoaWebSocketServer.prototype.broadcast = function (method, params) {
	    if (this.server && this.server.clients) {
	        for (var i in this.server.clients) {
	            this.server.clients[i].method(method, params, function (err) {
	                debug('Could not send message', data, err);
	            });
	        }
	    }
	};

/***/ },
/* 76 */
/***/ function(module, exports) {

	module.exports = require("co");

/***/ },
/* 77 */
/***/ function(module, exports) {

	module.exports = require("ws");

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var debug = __webpack_require__(64)('koa-ws:request');
	
	function Request(socket, payload) {
	    this.socket = socket;
	    this.currentId = payload.id;
	    this.method = payload.method;
	    this.params = payload.params;
	    this.session = socket.session;
	};
	
	Request.prototype.error = function (code, message) {
	    try {
	        var payload = {
	            jsonrpc: '2.0',
	            error: {
	                code: code,
	                message: message
	            },
	            id: this.currentId
	        };
	        debug('→ Error %s: %o', payload.error.code, payload.error.message);
	        this.socket.send(JSON.stringify(payload));
	    } catch (e) {
	        console.error('Something went wrong: ', e.stack);
	    }
	};
	
	Request.prototype.result = function (result) {
	    try {
	        var payload = {
	            jsonrpc: '2.0',
	            result: result,
	            id: this.currentId
	        };
	        debug('→ (%s) Result: %o', payload.id, payload.result);
	        this.socket.send(JSON.stringify(payload));
	    } catch (e) {
	        console.error('Something went wrong: ', e.stack);
	    }
	};
	
	module.exports = Request;

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	exports.default = function (debug, socket, data) {
	    // If heartbeat, respond
	    if (data === '--thump--') {
	        //debug('← Thump!');
	        setTimeout(function () {
	            if (socket.readyState === socket.OPEN) socket.send('--thump--');
	        }, this._options.heartbeatInterval || 5000);
	        return;
	    }
	
	    // Try to parse data to JSON
	    try {
	        var payload = JSON.parse(data);
	    } catch (e) {
	        debug('Parse error: %s', e.stack);
	        socket.error(-32700, 'Parse error');
	        return;
	    }
	
	    // Create request object
	    var request = new _request2.default(socket, payload);
	
	    // Check if valid JSON-RPC 2.0 request
	    if (!payload.jsonrpc && payload.jsonrpc !== '2.0') {
	        debug('Wrong protocol: %s', payload.jsonrpc);
	        socket.error.apply(request, [-32600, 'Invalid request']);
	        return;
	    }
	
	    // We got a result
	    if (payload.result && payload.id) {
	        // Check if error
	        if (payload.error) {
	            debug('← (%s) Error %s: %o', payload.id, payload.error.code, payload.error.message);
	            if (typeof this._awaitingResults[payload.id] === 'function') {
	                this._awaitingResults[payload.id].apply(this, [payload.error]);
	            }
	            return;
	        }
	        // Everything seems fine
	        debug('← (%s) Result: %o', payload.id, payload.result);
	        if (typeof this._awaitingResults[payload.id] === 'function') {
	            this._awaitingResults[payload.id].apply(this, [null, payload.result]);
	        }
	        return;
	    }
	
	    // We got an error
	    if (payload.error) {
	        // Check if error
	        debug('← (%s) Error %s: %o', payload.id, payload.error.code, payload.error.message);
	        if (typeof this._awaitingResults[payload.id] === 'function') {
	            this._awaitingResults[payload.id].apply(this, [payload.error]);
	        }
	        return;
	    }
	
	    // Check if there's a valid method (if no result was supplied)
	    if (!payload.method) {
	        debug('Missing method: %o', payload);
	        socket.error.apply(request, [-32600, 'Invalid request']);
	        return;
	    }
	
	    // Make sure params are object or array
	    if (typeof payload.params !== 'undefined' && _typeof(payload.params) !== 'object' && !Array.isArray(payload.params)) {
	        debug('Invalid params: %o', payload.params);
	        socket.error.apply(request, [-32602, 'Invalid params']);
	        return;
	    }
	
	    // Check if method exists
	    if (typeof this._methods[payload.method] === 'function') {
	        debug('← (%s) %s: %o', payload.id, payload.method, payload.params);
	        try {
	            this._methods[payload.method].apply(request);
	        } catch (e) {
	            debug('Internal error: %s', e.stack);
	            socket.error.apply(request, [-32603, 'Internal error']);
	        }
	    } else {
	        debug('← (%s) Error %s: %o', payload.id, -32601, 'Method not found');
	        socket.error.apply(request, [-32601, 'Method not found']);
	    }
	};
	
	var _request = __webpack_require__(78);
	
	var _request2 = _interopRequireDefault(_request);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	;

/***/ },
/* 80 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 81 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	/**
	 * Module dependencies.
	 */
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = serve;
	
	var _koaSend = __webpack_require__(83);
	
	var _koaSend2 = _interopRequireDefault(_koaSend);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var resolve = __webpack_require__(81).resolve;
	var assert = __webpack_require__(85);
	var debug = __webpack_require__(64)('koa-static');
	
	/**
	 * Serve static files from `root`.
	 *
	 * @param {String} root
	 * @param {Object} [opts]
	 * @return {Function}
	 * @api public
	 */
	
	function serve(root) {
	  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	  assert(root, 'root directory is required to serve files');
	
	  // options
	  debug('static "%s" %j', root, opts);
	  opts.root = resolve(root);
	  opts.index = opts.index || 'index.html';
	
	  if (!opts.defer) {
	    return regeneratorRuntime.mark(function serve(next) {
	      return regeneratorRuntime.wrap(function serve$(_context) {
	        while (1) {
	          switch (_context.prev = _context.next) {
	            case 0:
	              if (!(this.method == 'HEAD' || this.method == 'GET')) {
	                _context.next = 6;
	                break;
	              }
	
	              console.log('static serving : ' + this.path);
	              _context.next = 4;
	              return (0, _koaSend2.default)(this, this.path, opts);
	
	            case 4:
	              if (!_context.sent) {
	                _context.next = 6;
	                break;
	              }
	
	              return _context.abrupt('return');
	
	            case 6:
	              return _context.delegateYield(next, 't0', 7);
	
	            case 7:
	            case 'end':
	              return _context.stop();
	          }
	        }
	      }, serve, this);
	    });
	  }
	
	  return regeneratorRuntime.mark(function serve(next) {
	    return regeneratorRuntime.wrap(function serve$(_context2) {
	      while (1) {
	        switch (_context2.prev = _context2.next) {
	          case 0:
	            return _context2.delegateYield(next, 't0', 1);
	
	          case 1:
	            if (!(this.method != 'HEAD' && this.method != 'GET')) {
	              _context2.next = 3;
	              break;
	            }
	
	            return _context2.abrupt('return');
	
	          case 3:
	            if (!(this.body != null || this.status != 404)) {
	              _context2.next = 5;
	              break;
	            }
	
	            return _context2.abrupt('return');
	
	          case 5:
	            _context2.next = 7;
	            return (0, _koaSend2.default)(this, this.path, opts);
	
	          case 7:
	          case 'end':
	            return _context2.stop();
	        }
	      }
	    }, serve, this);
	  });
	}

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = send;
	/**
	 * Module dependencies.
	 */
	
	var debug = __webpack_require__(64)('koa-send');
	var resolvePath = __webpack_require__(84);
	var assert = __webpack_require__(85);
	var path = __webpack_require__(81);
	var normalize = path.normalize;
	var basename = path.basename;
	var extname = path.extname;
	var resolve = path.resolve;
	var parse = path.parse;
	var sep = path.sep;
	var fs = __webpack_require__(80);
	var co = __webpack_require__(76);
	
	/**
	 * Send file at `path` with the
	 * given `options` to the koa `ctx`.
	 *
	 * @param {Context} ctx
	 * @param {String} path
	 * @param {Object} [opts]
	 * @return {Function}
	 * @api public
	 */
	
	function send(ctx, path) {
	  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	
	  return co(regeneratorRuntime.mark(function _callee() {
	    var root, trailingSlash, index, maxage, hidden, format, gzip, encoding, stats, notfound;
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	
	            assert(ctx, 'koa context required');
	            assert(path, 'pathname required');
	
	            // options
	            debug('send "%s" %j', path, opts);
	            root = opts.root ? normalize(resolve(opts.root)) : '';
	            trailingSlash = '/' == path[path.length - 1];
	
	            path = path.substr(parse(path).root.length);
	            index = opts.index;
	            maxage = opts.maxage || opts.maxAge || 0;
	            hidden = opts.hidden || false;
	            format = opts.format === false ? false : true;
	            gzip = opts.gzip === false ? false : true;
	            encoding = ctx.acceptsEncodings('gzip', 'deflate', 'identity');
	
	            // normalize path
	
	            path = decode(path);
	
	            if (!(-1 == path)) {
	              _context.next = 15;
	              break;
	            }
	
	            return _context.abrupt('return', ctx.throw('failed to decode', 400));
	
	          case 15:
	
	            // index file support
	            if (index && trailingSlash) path += index;
	
	            path = resolvePath(root, path);
	
	            // hidden file support, ignore
	
	            if (!(!hidden && isHidden(root, path))) {
	              _context.next = 19;
	              break;
	            }
	
	            return _context.abrupt('return', null);
	
	          case 19:
	            _context.prev = 19;
	            _context.next = 22;
	            return fs.statAsync(path);
	
	          case 22:
	            stats = _context.sent;
	
	            if (true) {
	              _context.next = 32;
	              break;
	            }
	
	            if (!(format && index)) {
	              _context.next = 31;
	              break;
	            }
	
	            path += '/' + index;
	            _context.next = 28;
	            return fs.stat(path);
	
	          case 28:
	            stats = _context.sent;
	            _context.next = 32;
	            break;
	
	          case 31:
	            return _context.abrupt('return');
	
	          case 32:
	            _context.next = 41;
	            break;
	
	          case 34:
	            _context.prev = 34;
	            _context.t0 = _context['catch'](19);
	            notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
	
	            if (! ~notfound.indexOf(_context.t0.code)) {
	              _context.next = 39;
	              break;
	            }
	
	            return _context.abrupt('return');
	
	          case 39:
	            _context.t0.status = 500;
	            throw _context.t0;
	
	          case 41:
	
	            // stream
	            ctx.set('Last-Modified', stats.mtime.toUTCString());
	            ctx.set('Content-Length', stats.size);
	            ctx.set('Cache-Control', 'max-age=' + (maxage / 1000 | 0));
	            ctx.type = type(path);
	            ctx.body = fs.createReadStream(path);
	
	            return _context.abrupt('return', path);
	
	          case 47:
	          case 'end':
	            return _context.stop();
	        }
	      }
	    }, _callee, this, [[19, 34]]);
	  }));
	}
	
	/**
	 * Check if it's hidden.
	 */
	
	function isHidden(root, path) {
	  path = path.substr(root.length).split(sep);
	  for (var i = 0; i < path.length; i++) {
	    if (path[i][0] === '.') return true;
	  }
	  return false;
	}
	
	/**
	 * File type.
	 */
	
	function type(file) {
	  return extname(basename(file, '.gz'));
	}
	
	/**
	 * Decode `path`.
	 */
	
	function decode(path) {
	  try {
	    return decodeURIComponent(path);
	  } catch (err) {
	    return -1;
	  }
	}

/***/ },
/* 84 */
/***/ function(module, exports) {

	module.exports = require("resolve-path");

/***/ },
/* 85 */
/***/ function(module, exports) {

	module.exports = require("assert");

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
					value: true
	});
	exports.init = init;
	
	var _utils = __webpack_require__(73);
	
	var vals = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
	var secondsPerMove = 120;
	
	var games = {};
	
	function newModel(cols, rows) {
					var mdl = Object.create(null);
					cols.forEach(function (c) {
									rows.forEach(function (r) {
													var trues = Object.create(null);
													vals.forEach(function (v) {
																	return trues[v] = '';
													});
													mdl[c + r] = trues;
									});
					});
					return mdl;
	};
	
	function isCompleted(mdl, board) {
					var soln = board.solution;
					return board.cols.every(function (c) {
									return board.rows.every(function (r) {
													var id = c + r;
													var ps = mdl[id];
													var chk = soln[id];
													return !(0, _utils.isCellActive)(id) || vals.every(function (c) {
																	return c === chk ? ps[c] !== '' : ps[c] === '';
													});
									});
					});
	};
	
	// phases : setup ; inprogress ; completed
	function newgame(table) {
					var gameType = arguments.length <= 1 || arguments[1] === undefined ? 'Killer' : arguments[1];
	
					//let id = uuid.generate();
					if (games[table]) throw new Error("game already created");
					var g = { type: gameType, table: table, board: undefined, model: undefined, players: [], phase: 'setup', tricks: [], trick: {} };
					games[table] = g;
					return g;
	}
	
	function applyMoveToGame(table, m, moniker) {
					var game = games[table];
					var mdl = game.model;
					var rmv = [];
					var vld = true;
					var soln = board.solution;
	
					Object.keys(m).forEach(function (cid) {
									if (mdl[cid]) {
													(function () {
																	var oks = m[cid];
																	var ps = mdl[cid];
																	vals.forEach(function (v) {
																					if (vld && ps[v] === '' && oks.indexOf(v) < 0) {
																									if (soln[cid] === v) vld = false;else rmv.push({ cid: cid, v: v });
																					}
																	});
													})();
									}
					});
					if (vld) rmv.forEach(function (_ref) {
									var cid = _ref.cid;
									var v = _ref.v;
									return mdl[cid][v] = moniker;
					});else rmv = [];
					game.trick[moniker] = rmv;
	};
	
	function init(ws) {
	
					var selectSockets = function selectSockets(filter) {
									var rslt = [];
									if (ws.server && ws.server.clients) {
													for (var i in ws.server.clients) {
																	var socket = ws.server.clients[i];
																	if (filter(socket)) rslt.push(socket);
													}
									}
									return rslt;
					};
	
					var narrowcast = function narrowcast(method, params, filter) {
									if (ws.server && ws.server.clients) {
													for (var i in ws.server.clients) {
																	var socket = ws.server.clients[i];
																	if (filter(socket)) {
																					socket.method(method, params, function (err) {
																									return console.log('Could not send message');
																					});
																	};
													}
									}
					};
	
					var tablecast = function tablecast(table, method, params) {
									narrowcast(method, params, function (s) {
													return s.table === table;
									});
					};
	
					var socketsInGame = function socketsInGame(table) {
									return selectSockets(function (s) {
													return s.table === table;
									});
					};
	
					var startTrick = function startTrick(table) {
									var game = games[table];
									var sockets = socketsInGame(table);
									game.socketsToMove = sockets;
									var tmout = setTimeout(function () {
													// this should never actually happen. 
													// clients should time themselves out
													sockets.forEach(function (s) {
																	return s.method('game:timedout');
													});
													endTrick(table);
									}, (secondsPerMove + 10) * 1000);
									game.timeout = tmout;
									tablecast(table, 'game:starttrick', game.trick);
									game.trick = {};
					};
	
					var endTrick = function endTrick(table) {
									var game = games[table];
									tablecast(table, 'game:endtrick', game.trick);
									game.tricks.push(game.trick);
									cancelTimeout(game.timeout);
									if (!isCompleted(game)) {
													setTimeout(function () {
																	return startTrick(table);
													}, 5000);
									}
					};
	
					ws.register('game', {
	
									create: regeneratorRuntime.mark(function create() {
													var _params, table, moniker, game;
	
													return regeneratorRuntime.wrap(function create$(_context) {
																	while (1) {
																					switch (_context.prev = _context.next) {
																									case 0:
																													console.log("creating table");
																													_params = this.params;
																													table = _params.table;
																													moniker = _params.moniker;
	
																													console.log("creating table " + table);
	
																													if (!games[table]) {
																																	_context.next = 8;
																																	break;
																													}
	
																													this.error("table already exists");
																													return _context.abrupt('return');
	
																									case 8:
																													this.table = table;
																													this.moniker = moniker;
																													game = newgame(table);
	
																													game.owner = moniker;
																													game.players.push(moniker);
																													this.result(game);
	
																									case 14:
																									case 'end':
																													return _context.stop();
																					}
																	}
													}, create, this);
									}),
	
									join: regeneratorRuntime.mark(function join() {
													var _params2, table, moniker, game, players;
	
													return regeneratorRuntime.wrap(function join$(_context2) {
																	while (1) {
																					switch (_context2.prev = _context2.next) {
																									case 0:
																													_params2 = this.params;
																													table = _params2.table;
																													moniker = _params2.moniker;
																													game = games[table];
	
																													if (!(!game || game.phase !== 'setup')) {
																																	_context2.next = 7;
																																	break;
																													}
	
																													err("game closed");return _context2.abrupt('return');
	
																									case 7:
																													this.table = table;
																													players = game.players;
	
																													players.push(moniker);
																													this.result("ok");
																													tablecast(table, 'game:joined', game);
	
																									case 12:
																									case 'end':
																													return _context2.stop();
																					}
																	}
													}, join, this);
									}),
	
									getavailable: regeneratorRuntime.mark(function getavailable() {
													var rslt;
													return regeneratorRuntime.wrap(function getavailable$(_context3) {
																	while (1) {
																					switch (_context3.prev = _context3.next) {
																									case 0:
																													rslt = [];
	
																													games['Bernie'] = { table: 'Bernie', owner: 'Bernie', players: ['Bernie', 'Joe', 'Kevin'], secondsPerMove: secondsPerMove, phase: 'setup' };
																													games['Emma'] = { table: 'Emma', owner: 'Emma', players: ['Emma', 'Bob', 'Sam'], secondsPerMove: secondsPerMove, phase: 'setup' };
	
																													Object.keys(games).forEach(function (table) {
																																	var g = games[table];
																																	if (g.phase === 'setup') {
																																					rslt.push(g);
																																	}
																													});
																													this.result(rslt);
	
																									case 5:
																									case 'end':
																													return _context3.stop();
																					}
																	}
													}, getavailable, this);
									}),
	
									start: regeneratorRuntime.mark(function start() {
													var _params3, table, moniker, game, board, mdl;
	
													return regeneratorRuntime.wrap(function start$(_context4) {
																	while (1) {
																					switch (_context4.prev = _context4.next) {
																									case 0:
																													_params3 = this.params;
																													table = _params3.table;
																													moniker = _params3.moniker;
																													game = games[table];
	
																													if (!(game.phase !== 'setup')) {
																																	_context4.next = 7;
																																	break;
																													}
	
																													err("game has already started");return _context4.abrupt('return');
	
																									case 7:
																													if (!(game.owner !== moniker)) {
																																	_context4.next = 10;
																																	break;
																													}
	
																													err("Only game owner can start game");return _context4.abrupt('return');
	
																									case 10:
																													game.phase = 'inprogress';
	
																													board = pg.get_random_killer();
																													mdl = newModel(board.cols, board.rows);
	
																													board.solution = board.solution.map(function (i) {
																																	return i.toString();
																													});
																													game.board = board;
																													this.result("ok");
																													tablecast(table, 'game:started', game);
	
																									case 17:
																									case 'end':
																													return _context4.stop();
																					}
																	}
													}, start, this);
									}),
	
									submitMove: regeneratorRuntime.mark(function submitMove() {
													var _params4, table, move, moniker, game, socks, i;
	
													return regeneratorRuntime.wrap(function submitMove$(_context5) {
																	while (1) {
																					switch (_context5.prev = _context5.next) {
																									case 0:
																													_params4 = this.params;
																													table = _params4.table;
																													move = _params4.move;
																													moniker = _params4.moniker;
																													game = games[table];
	
																													applyMoveToGame(table, m, moniker);
																													socks = game.socketsToMove;
																													i = socks.indexOf(this);
	
																													if (!(i < 0)) {
																																	_context5.next = 11;
																																	break;
																													}
	
																													err("wtf???");return _context5.abrupt('return');
	
																									case 11:
																													this.result("ok");
																													if (socks.length > 1) {
																																	socks.splice(i, 1);
																																	tablecast(table, 'game:moved', { moniker: moniker });
																													} else endTrick(table);
	
																									case 13:
																									case 'end':
																													return _context5.stop();
																					}
																	}
													}, submitMove, this);
									})
	
					});
	}

/***/ },
/* 87 */
/***/ function(module, exports) {

	module.exports = require("bluebird");

/***/ },
/* 88 */
/***/ function(module, exports) {

	module.exports = require("koa");

/***/ },
/* 89 */
/***/ function(module, exports) {

	module.exports = require("koa-bodyparser");

/***/ },
/* 90 */
/***/ function(module, exports) {

	module.exports = require("koa-session");

/***/ },
/* 91 */
/***/ function(module, exports) {

	module.exports = require("koa-route");

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.generate = generate;
	exports.validate = validate;
	var crypto = __webpack_require__(55);
	
	var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
	
	var _proc = function _proc(rnd) {
	    rnd[6] = rnd[6] & 0x0f | 0x40;
	    rnd[8] = rnd[8] & 0x3f | 0x80;
	    rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
	    rnd.shift();
	    return rnd.join('-');
	};
	
	function generate() {
	    return _proc(crypto.randomBytes(16));
	}
	
	function validate(uuid) {
	    return uuidPattern.test(uuid);
	}

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assert = __webpack_require__(85);
	var thunkify = __webpack_require__(94);
	var _JWT = __webpack_require__(95);
	
	// Make verify function play nice with co/koa
	var JWT = { decode: _JWT.decode, sign: _JWT.sign, verify: thunkify(_JWT.verify) };
	
	module.exports = function (opts) {
	  opts = opts || {};
	  opts.key = opts.key || 'user';
	
	  assert(opts.secret, '"secret" option is required');
	
	  return regeneratorRuntime.mark(function jwt(next) {
	    var token, msg, user, parts, scheme, credentials, ignoreExp;
	    return regeneratorRuntime.wrap(function jwt$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	
	            if (opts.cookie) {
	              token = this.cookies.get(opts.cookie);
	              if (!token && !opts.passthrough) this.throw(401, "Missing cookie");
	            } else if (this.header.authorization) {
	              parts = this.header.authorization.split(' ');
	              if (parts.length == 2) {
	                scheme = parts[0];
	                credentials = parts[1];
	
	                if (/^Bearer$/i.test(scheme)) {
	                  token = credentials;
	                }
	              } else this.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"\n');
	            } else this.throw(401, 'No Authorization header found\n');
	
	            _context.prev = 1;
	            _context.next = 4;
	            return JWT.verify(token, opts.secret, opts);
	
	          case 4:
	            user = _context.sent;
	            _context.next = 10;
	            break;
	
	          case 7:
	            _context.prev = 7;
	            _context.t0 = _context['catch'](1);
	
	            msg = 'Invalid token : ' + _context.t0.message;
	
	          case 10:
	            if (!(user || opts.passthrough)) {
	              _context.next = 16;
	              break;
	            }
	
	            this[opts.key] = user;
	            _context.next = 14;
	            return next;
	
	          case 14:
	            _context.next = 17;
	            break;
	
	          case 16:
	            this.throw(401, msg);
	
	          case 17:
	          case 'end':
	            return _context.stop();
	        }
	      }
	    }, jwt, this, [[1, 7]]);
	  });
	};
	
	// Export JWT methods as a convenience
	module.exports.sign = JWT.sign;
	module.exports.verify = JWT.verify;
	module.exports.decode = JWT.decode;

/***/ },
/* 94 */
/***/ function(module, exports) {

	module.exports = require("thunkify");

/***/ },
/* 95 */
/***/ function(module, exports) {

	module.exports = require("jsonwebtoken");

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var passport = __webpack_require__(97);
	var pg = __webpack_require__(67);
	
	var isDev = process.env.NODE_ENV === 'development';
	
	var root = isDev ? 'http://localhost:8080/' : 'http://www.pseudoq.net/';
	
	console.log("auth callback root : " + root);
	
	passport.serializeUser(function (user, done) {
	  //console.log('serialize : '+JSON.stringify(user));
	  done(null, user.userId);
	});
	
	passport.deserializeUser(function (id, done) {
	  var user = pg.users[id];
	  //console.log('deserialize : ' + id + ', user : ' +JSON.stringify(user));
	  done(null, user);
	});
	
	var LocalStrategy = __webpack_require__(98).Strategy;
	passport.use(new LocalStrategy(function (username, password, done) {
	  // retrieve user ...
	  if (username === 'test' && password === 'test') {
	    done(null, user);
	  } else {
	    done(null, false);
	  }
	}));
	
	var FacebookStrategy = __webpack_require__(99).Strategy;
	passport.use(new FacebookStrategy({
	  clientID: process.env.FACEBOOK_ID,
	  clientSecret: process.env.FACEBOOK_SECRET,
	  callbackURL: root + 'auth/facebook'
	}, function (token, tokenSecret, profile, done) {
	  console.log('facebook callback hot called');
	  done(null, profile.id);
	}));
	
	if (!isDev) {
	
	  var GitHubStrategy = __webpack_require__(100).Strategy;
	  passport.use(new GitHubStrategy({
	    clientID: process.env.GITHUB_CLIENT_ID,
	    clientSecret: process.env.GITHUB_CLIENT_SECRET,
	    callbackURL: root + 'auth/github'
	  }, function (accessToken, refreshToken, profile, done) {
	    done(null, profile.id);
	  }));
	
	  var TwitterStrategy = __webpack_require__(101).Strategy;
	  passport.use(new TwitterStrategy({
	    consumerKey: process.env.TWITTER_ID,
	    consumerSecret: process.env.TWITTER_SECRET,
	    callbackURL: root + 'auth/twitter'
	  }, function (token, tokenSecret, profile, done) {
	    done(null, profile.id);
	  }));
	
	  var GoogleStrategy = __webpack_require__(102).OAuth2Strategy;
	  passport.use(new GoogleStrategy({
	    clientId: process.env.GOOGLE_ID,
	    clientSecret: process.env.GOOGLE_SECRET,
	    callbackURL: root + 'auth/google'
	  }, function (accessToken, refreshToken, profile, done) {
	    done(null, profile.id);
	  }));
	}
	
	module.exports = passport;

/***/ },
/* 97 */
/***/ function(module, exports) {

	module.exports = require("koa-passport");

/***/ },
/* 98 */
/***/ function(module, exports) {

	module.exports = require("passport-local");

/***/ },
/* 99 */
/***/ function(module, exports) {

	module.exports = require("passport-facebook");

/***/ },
/* 100 */
/***/ function(module, exports) {

	module.exports = require("passport-github");

/***/ },
/* 101 */
/***/ function(module, exports) {

	module.exports = require("passport-twitter");

/***/ },
/* 102 */
/***/ function(module, exports) {

	module.exports = require("passport-google-oauth");

/***/ }
/******/ ]);
//# sourceMappingURL=server.js.map