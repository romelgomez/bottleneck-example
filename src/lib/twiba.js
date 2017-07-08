"use strict";
var config = require("config");
var Twit = require("twit");
var Bottleneck = require("bottleneck");
var moment = require("moment");
var colors = require("colors");
var _ = require("lodash");
var utility = require("./utilities");
var TwibaClass = (function () {
    function TwibaClass(settings) {
        this.settings = settings;
        this.twit = new Twit(settings);
        this.loger = new utility.Loger('twiba');
        this.timer = new utility.Timer('twiba-timer');
        this.minTime = 60000;
        this.waitTime = 0;
        this.limiter = new Bottleneck(1, this.minTime);
        this._switch = false;
    }
    TwibaClass.prototype.get = function (path, parameters, message) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fn = function (__this, path, parameters, message) {
                __this.loger.info('The http request schedule for: ' + message + ', ' + colors.yellow('START.'));
                return __this.twit.get(path, parameters)
                    .then(function (data) { return resolve(data); })
                    .catch(function (err) { return reject(err); });
            };
            _this.waitTime += _this.minTime;
            if (_this._switch) {
                var startAt = moment().millisecond(_this.waitTime).format('h:mm:ss');
                _this.loger.info('A new http request has been schedule for: ' + message + ', start in aprox: ' + colors.green(startAt));
            }
            else {
                _this._switch = true;
            }
            _this.limiter.schedule(fn, _this, path, parameters, message);
        });
    };
    TwibaClass.prototype.parameterProvided = function (parameters) {
        var searchParameterProvided = '';
        return new Promise(function (resolve, reject) {
            if (typeof parameters.screen_name !== 'undefined' || typeof parameters.handle !== 'undefined') {
                if (typeof parameters.screen_name !== 'undefined') {
                    searchParameterProvided = 'screen_name';
                }
                else {
                    searchParameterProvided = 'handle';
                }
                resolve(searchParameterProvided);
            }
            else if (typeof parameters.user_id !== 'undefined' || typeof parameters.id !== 'undefined') {
                if (typeof parameters.user_id !== 'undefined') {
                    searchParameterProvided = 'user_id';
                }
                else {
                    searchParameterProvided = 'id';
                }
                resolve(searchParameterProvided);
            }
            else {
                reject('Either an screen_name|handle or user_id|id is required for this method.');
            }
        });
    };
    TwibaClass.prototype.getUser = function (parameters) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var message = '';
            var searchParameterProvided = '';
            var searchParameters = {};
            _this.parameterProvided(parameters)
                .then(function (_searchParameterProvided_) {
                searchParameterProvided = _searchParameterProvided_;
                switch (_searchParameterProvided_) {
                    case 'screen_name':
                        searchParameters.screen_name = parameters[_searchParameterProvided_];
                        break;
                    case 'handle':
                        searchParameters.screen_name = parameters[_searchParameterProvided_];
                        break;
                    case 'user_id':
                        searchParameters.user_id = parameters[_searchParameterProvided_];
                        break;
                    case 'id':
                        searchParameters.user_id = parameters[_searchParameterProvided_];
                        break;
                }
            })
                .then(function () {
                message = 'Get users data of {\'' + searchParameterProvided + '\' : ' + parameters[searchParameterProvided] + ' }';
                _this.get('users/show', searchParameters, message)
                    .then(function (result) {
                    resolve(result.data);
                }, function (err) {
                    reject(err);
                });
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    ;
    TwibaClass.prototype.getUserByID = function (id) {
        return this.getUser({ user_id: id });
    };
    ;
    TwibaClass.prototype.getUserByScreenName = function (screen_name) {
        return this.getUser({ screen_name: screen_name });
    };
    ;
    TwibaClass.prototype.getUserByHandle = function (handle) {
        return this.getUser({ handle: handle });
    };
    ;
    TwibaClass.prototype.getList = function (listType, parameters) {
        var _this = this;
        var list = [];
        var __listType = '';
        var count = 200;
        var searchParameterProvided = '';
        return new Promise(function (resolve, reject) {
            function recursive(__this, __listType, __parameters) {
                var message = 'Get ' + _.upperFirst(listType) + ' list for {' + searchParameterProvided + ': \'' + parameters[searchParameterProvided] + '\'}';
                return __this.get(__listType + '/list', __parameters, message)
                    .then(function (result) {
                    if (typeof result.data.users !== 'undefined') {
                        if (result.data.users.length > 0) {
                            result.data.users.forEach(function (user) {
                                list.push({
                                    name: user.name,
                                    screen_name: user.screen_name
                                });
                            });
                        }
                        if (result.data.next_cursor_str !== '0') {
                            __parameters.cursor = result.data.next_cursor_str;
                            recursive(__this, __listType, __parameters);
                        }
                        else {
                            var response = {};
                            response[searchParameterProvided] = parameters[searchParameterProvided];
                            response[listType] = list;
                            resolve(response);
                            __this.timer.endProcess('Get ' + _.upperFirst(listType) + ' list for the {' + searchParameterProvided + ': \'' + parameters[searchParameterProvided] + '\'} process end.');
                        }
                    }
                    else {
                        reject(result);
                    }
                })
                    .catch(function (err) {
                    reject(err);
                });
            }
            function main(__this) {
                var searchParameters = {
                    cursor: '-1',
                    count: count
                };
                __this.parameterProvided(parameters)
                    .then(function (_searchParameterProvided_) {
                    searchParameterProvided = _searchParameterProvided_;
                    switch (_searchParameterProvided_) {
                        case 'screen_name':
                            searchParameters.screen_name = parameters[_searchParameterProvided_];
                            break;
                        case 'handle':
                            searchParameters.screen_name = parameters[_searchParameterProvided_];
                            break;
                        case 'user_id':
                            searchParameters.user_id = parameters[_searchParameterProvided_];
                            break;
                        case 'id':
                            searchParameters.user_id = parameters[_searchParameterProvided_];
                            break;
                    }
                    switch (listType) {
                        case 'friends':
                            __listType = 'friends';
                            break;
                        case 'following':
                            __listType = 'friends';
                            break;
                        case 'followers':
                            __listType = 'followers';
                            break;
                        default:
                            reject('Either an friends|following or followers listType is required for this method.');
                    }
                })
                    .then(function () {
                    __this.loger.info('Get ' + _.upperFirst(listType) + ' list for the {' + searchParameterProvided + ': \'' + parameters[searchParameterProvided] + '\'} process start.');
                    __this.timer.startProcess();
                    recursive(__this, __listType, searchParameters);
                })
                    .catch(function (err) {
                    reject(err);
                });
            }
            main(_this);
        });
    };
    ;
    TwibaClass.prototype.getFollowers = function (parameters) {
        return this.getList('followers', parameters);
    };
    ;
    TwibaClass.prototype.getFollowing = function (parameters) {
        return this.getList('following', parameters);
    };
    ;
    TwibaClass.prototype.getFollowersByHandle = function (handle) {
        return this.getList('followers', { handle: handle });
    };
    ;
    TwibaClass.prototype.getFollowersByUserID = function (user_id) {
        return this.getList('followers', { user_id: user_id });
    };
    ;
    return TwibaClass;
}());
exports.Twiba = new TwibaClass({
    consumer_key: config.get('API.KEYS.CONSUMER_KEY').toString(),
    consumer_secret: config.get('API.KEYS.CONSUMER_KEY_SECRET').toString(),
    access_token: config.get('API.KEYS.ACCESS_TOKEN').toString(),
    access_token_secret: config.get('API.KEYS.ACCESS_TOKEN_SECRET').toString(),
    timeout_ms: 120 * 1000
});
