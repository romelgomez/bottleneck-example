const Twit = require('twit');
const config = require('config');
const extd = require('deep-extend');
const Bottleneck = require('bottleneck');
const utility = require('./utilities');
const moment = require('moment');
const colors = require('colors');
const _ = require('lodash');


let tw = new Twiba({
  consumer_key:         config.get('API.KEYS.CONSUMER_KEY'),
  consumer_secret:      config.get('API.KEYS.CONSUMER_KEY_SECRET'),
  access_token:         config.get('API.KEYS.ACCESS_TOKEN'),
  access_token_secret:  config.get('API.KEYS.ACCESS_TOKEN_SECRET')
});

/**
 * Twiba Class
 * @param {Object} settings
 * @returns {Twiba}
 * @constructor
 */
function Twiba (settings) {
  // Safe instance
  if(!(this instanceof Twiba)) {
    return new Twiba(settings);
  }

  // Merge config
  this.settings = extd({
    timeout_ms: 60*1000  // optional HTTP request timeout to apply to all requests.
  }, settings);

  // Twit instance
  this.T = new Twit(this.settings);
}

/**
 * How long to wait after launching a request before launching another one.
 *
 * NOTE: All the endpoints affected with the 'Rate limited' will use this restriction.
 *
 * Requests / 15-min window (app auth) 30. Means that only 2 request can be made in 1 min.
 *
 * @type {number}
 */
let minTime = 60000; // 60 seconds

/**
 * The wait time for the schedule HTTP request
 * @type {number}
 */
let waitTime = 0;

/**
 * Rate Limiter
 * Resource: https://github.com/SGrondin/bottleneck
 * @type {Bottleneck}
 */
let limiter = new Bottleneck(1, minTime);

/**
 * To off the first http request notification.
 * @type {boolean}
 */
let _switch = false;

/**
 * Get Account Data - HTTP Request Rate limited
 * Resources:
 *  https://www.npmjs.com/package/twit
 * @param {String} path - Endpoint path e.g: (users/show, followers/list)
 * @param {Object} parameters
 * @param {String} message
 * @return {Promise<Object>}
 */
Twiba.prototype.get = function  (path, parameters, message){

  return new Promise((resolve, reject) => {

    let fn = function(instance, path, parameters, message) {

      utility.info('The http request schedule for: ' + message + ', ' + colors.yellow('START.'));

      return  instance.T.get(path, parameters, (error, data) => {
        if(typeof err !== 'undefined'){
          reject(error);
        }else{
          resolve(data);
        }
      });

    };

    waitTime += minTime;

    if(_switch){

      /**
       * Wait time in Seconds.
       */
      let startAt = moment().millisecond(waitTime).format('h:mm:ss');

      utility.info('A new http request has been schedule for: ' + message + ', start in aprox: ' + colors.green(startAt));

    }else{
      _switch = true
    }

    limiter.schedule(fn, this, path, parameters, message);

  });

};

/**
 * Process Parameters of getUser and getList functions, the idea of this function is get the screen_name|handle or user_id|id, to return the response with that key
 * so can be use like this:
 *
 * In case of use the key <screen_name> to getList of followers, the response will looks as follows:
 *  {screen_name:  EducaEmpleoCOL, followers: [{ name: 'CAROL RENGIFO', screen_name: 'pinkcanache' },...]  }
 *
 * In case of use the key <handle> to getList of followers, the response will looks as follows:
 *  {handle:  EducaEmpleoCOL, followers: [{ name: 'CAROL RENGIFO', screen_name: 'pinkcanache' },...]  }
 *
 * In case of use the key <user_id> to getList of followers, the response will looks as follows:
 *  {user_id:  3354898635, followers: [{ name: 'CAROL RENGIFO', screen_name: 'pinkcanache' },...]  }
 *
 *  * In case of use the key <id> to getList of followers, the response will looks as follows:
 *  {id:  3354898635, followers: [{ name: 'CAROL RENGIFO', screen_name: 'pinkcanache' },...]  } *
 *
 *
 * @param {Object} parameters
 * @param {String} [parameters.screen_name]
 * @param {String} [parameters.handle] Alias of screen_name
 * @param {String} [parameters.user_id]
 * @param {String} [parameters.id] Alias of user_id
 * @returns {Promise<String>}
 */
function parameterProvided(parameters){

  /**
   * kept the key used for get the data (screen_name|handle or user_id|id)
   * @type {string}
   */
  let searchParameterProvided = '';

  return new Promise((resolve, reject) => {

    if(typeof parameters.screen_name !== 'undefined' || typeof parameters.handle !== 'undefined'){

      if(typeof parameters.screen_name !== 'undefined'){
        searchParameterProvided = 'screen_name';
      }else{
        searchParameterProvided = 'handle';
      }

      resolve(searchParameterProvided);

    } else
    if (typeof parameters.user_id !== 'undefined' || typeof parameters.id !== 'undefined'){

      if(typeof parameters.user_id !== 'undefined'){
        searchParameterProvided = 'user_id';
      }else{
        searchParameterProvided = 'id';
      }

      resolve(searchParameterProvided);

    } else {
      reject('Either an screen_name|handle or user_id|id is required for this method.');
    }

  });

}


/**
 * Get User by screen_name|handle or user_id|id
 * @param {Object} parameters
 * @param {String} [parameters.screen_name]
 * @param {String} [parameters.handle] Alias of screen_name
 * @param {String} [parameters.user_id]
 * @param {String} [parameters.id] Alias of user_id
 * @returns {Promise<Object>}
 */
Twiba.prototype.getUser = function(parameters){
  return new Promise((resolve, reject) => {

    /**
     * Log message
     * @type {string}
     */
    let message = '';

    /**
     * kept the key used for get the user data (screen_name|handle or user_id|id)
     * @type {string}
     */
    let searchParameterProvided = '';

    /**
     * Search parameters for the http request
     * @type {Object}
     */
    let searchParameters = {};

    parameterProvided(parameters)
      .then((_searchParameterProvided_) => {

        searchParameterProvided = _searchParameterProvided_;

        switch(_searchParameterProvided_) {
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
      .then(() => {

        message = 'Get users data of {\'' + searchParameterProvided + '\' : ' + parameters[searchParameterProvided] + ' }' ;

        tw.get('users/show', searchParameters, message)
          .then((result)=>{
            resolve(result);
          },(err)=>{
            reject(err)
          });

      })
      .catch((err) => {

        reject(err);

      });

  });

};

/**
 * Get User By ID
 * @param {String} id
 * @returns {Promise.<Object>}
 */
Twiba.prototype.getUserByID = function(id){
  return tw.getUser({user_id:id});
};

/**
 * Get User By Handle
 * @param {String} screen_name
 * @returns {Promise.<Object>}
 */
Twiba.prototype.getUserByScreenName = function(screen_name){
  return tw.getUser({screen_name:screen_name});
};

/**
 * Get User By handle alias of screen_name
 * @param {String} handle
 * @returns {Promise.<Object>}
 */
Twiba.prototype.getUserByHandle = function(handle){
  return tw.getUser({handle: handle});
};


/**
 * Get followers or friends|following - Recursive function - Accept screen_name|handle or user_id|id parameters
 *
 * Resources:
 *  https://dev.twitter.com/rest/reference/get/followers/list
 *  https://dev.twitter.com/rest/reference/get/friends/list
 *
 * @param {String} listType friends|following or followers
 * @param {Object} parameters
 * @param {String} [parameters.screen_name]
 * @param {String} [parameters.handle] Alias of screen_name
 * @param {String} [parameters.user_id]
 * @param {String} [parameters.id] Alias of user_id
 * @returns {Promise<Object>}
 */
Twiba.prototype.getList = function (listType, parameters) {

  /**
   * All the friends|following or followers of the handle|screen_name
   * @type {Array}
   */
  let list = [];

  /**
   * kept the key used for get the friends|following or followers (friends|followers), following is a Alias of friends.
   * @type {string}
   */
  let _listType_ = '';

  /**
   * The number of users to return per page, up to a maximum of 200. Defaults to 20.
   * @type {number}
   */
  let count = 200;

  /**
   * kept the key provided for get the friends|following or followers (screen_name|handle|user_id|id)
   * @type {string}
   */
  let searchParameterProvided = '';

  return new Promise((resolve, reject) => {

    function recursive (_listType_, _parameters_) {

      /**
       * Log message
       * @type {string}
       */
      let message ='Get '+ _.upperFirst(listType) + ' list for {' + searchParameterProvided +': \'' + parameters[searchParameterProvided] + '\'}'; // Get <friends|following or followers> for {'screen_name': EducaEmpleoCOL}

      return tw.get( _listType_ + '/list', _parameters_, message)
        .then((result) => {

          if(typeof result.users !== 'undefined'){

            if(result.users.length > 0){

              result.users.forEach((user) => {
                list.push({
                  name: user.name,
                  screen_name: user.screen_name
                });
              });

            }

            if(result.next_cursor_str !== '0'){

              _parameters_.cursor = result.next_cursor_str;
              recursive(_listType_, _parameters_);

            } else {

              let response = {};
              response[searchParameterProvided] = parameters[searchParameterProvided];
              response[listType] = list;
              resolve(response);

              utility.endProcess('Get '+ _.upperFirst(listType) + ' list for the {' + searchParameterProvided +': \'' + parameters[searchParameterProvided] + '\'} process end.');

            }

          } else {
            reject(result);
          }

        })
        .catch((err) => {
          reject(err);
        });

    }

    function main () {

      /**
       * Search parameters for the first http request
       * @type {{cursor: string, count: number}}
       */
      let searchParameters = {
        cursor:'-1', // to get the first page, the next pages are calculated by twitter, and they are random numbers.
        count: count // The number of users to return per page
      };

      parameterProvided(parameters)
        .then((_searchParameterProvided_) => {

          searchParameterProvided = _searchParameterProvided_;

          switch(_searchParameterProvided_) {
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

          switch(listType) {
            case 'friends':
              _listType_ = 'friends';
              break;
            case 'following':
              _listType_ = 'friends';
              break;
            case 'followers':
              _listType_ = 'followers';
              break;
            default:
              reject('Either an friends|following or followers listType is required for this method.');
          }

        })
        .then(() => {

          utility.startProcess('Get '+ _.upperFirst(listType) + ' list for the {' + searchParameterProvided +': \'' + parameters[searchParameterProvided]  + '\'} process start.');

          recursive(_listType_,searchParameters);

        })
        .catch((err) => {

          reject(err);

        });

    }

    main();

  });

};


/**
 * Get followers - Accept screen_name|handle or user_id|id parameters
 *
 * Resource: https://dev.twitter.com/rest/reference/get/followers/list
 *
 * @param {Object} parameters
 * @param {String} [parameters.screen_name]
 * @param {String} [parameters.handle] Alias of screen_name
 * @param {String} [parameters.user_id]
 * @param {String} [parameters.id] Alias of user_id
 * @returns {Promise<Object>}
 */
Twiba.prototype.getFollowers = function (parameters) {
  return tw.getList('followers', parameters);
};

/**
 * Get friends|following - Recursive function - Accept screen_name|handle or user_id|id parameters
 *
 * Resource: https://dev.twitter.com/rest/reference/get/friends/list
 *
 * @param {Object} parameters
 * @param {String} [parameters.screen_name]
 * @param {String} [parameters.handle] Alias of screen_name
 * @param {String} [parameters.user_id]
 * @param {String} [parameters.id] Alias of user_id
 * @returns {Promise<Object>}
 */
Twiba.prototype.getFollowing = function (parameters) {
  return tw.getList('following', parameters);
};

/**
 * Get followers by handle
 * @param handle
 * @returns {Promise.<Object>}
 */
Twiba.prototype.getFollowersByHandle = function (handle) {

  // "Here we could do the conversion from handle -> user_id and call in to the getFollowersByUserID"
  // https://github.com/beeman/twiba-test-1-analyze-twitter-accounts/pull/2/files/9d37e2f3aa49a987329f2c26de2102c8a0301769#diff-32db4ea1280e35eb0703c275665c7a05

  tw.getUserByHandle(handle)
    .then((result) => {
      return tw.getFollowersByUserID(result.id_str);
    })
    .catch((error) => {
      console.error(error);
    });

  //return tw.getList('followers', {handle:handle})
};

/**
 * Get followers by user ID
 * @param user_id
 * @returns {Promise.<Object>}
 */
Twiba.prototype.getFollowersByUserID = function (user_id) {
  return tw.getList('followers', {user_id:user_id});
};


module.exports = tw;