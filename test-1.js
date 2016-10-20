const https = require('https');
var Buffer = require('buffer').Buffer;
var uuid = require('uuid');
var config = require('config');
const strictUriEncode = require('strict-uri-encode');
var hmacsha1 = require('hmacsha1');
var OAuth2 = require('oauth').OAuth2;
var Q = require('q');
var accounts = require('./accounts.json');

/**
 * Creating a signature
 * Resource https://dev.twitter.com/oauth/overview/creating-signatures
 * @param headers {Object}
 * @param accountHandle {string}
 * @returns {string}
 */
function getSignature (headers,accountHandle){

  /**
   * Http Method to form <signatureBaseString>
   * @type {string}
   */
  let httpMethod = 'GET';

  /**
   * Base URL to form <signatureBaseString>
   * @type {string}
   */
  let baseURL = 'https://api.twitter.com/1.1/users/show.json';

  /**
   * Parameters String to form <signatureBaseString>
   * @type {string}
   */
  let parametersString =
    'oauth_consumer_key=' + headers.oauth_consumer_key +
    '&oauth_nonce=' + headers.oauth_nonce +
    '&oauth_signature_method=' + headers.oauth_signature_method +
    '&oauth_timestamp=' + headers.oauth_timestamp +
    '&oauth_token=' + headers.oauth_token +
    '&oauth_version=' + headers.oauth_version +
    '&screen_name=' + accountHandle;

  /**
   * Signature base string
   * @type {string}
   */
  let signatureBaseString =
    httpMethod +
    '&' +
    strictUriEncode(baseURL) +
    '&' +
    strictUriEncode(parametersString);

  /**
   * Signing Key
   * @type {string}
   */
  let signingKey =
    strictUriEncode(config.get('API.KEYS.CONSUMER_KEY_SECRET')) +
    '&' +
    strictUriEncode(config.get('API.KEYS.ACCESS_TOKEN_SECRET'));

  return hmacsha1(signingKey,signatureBaseString);
}

/**
 * Get Timestamp
 * Source http://stackoverflow.com/a/30531157/2513972
 * @returns {number}
 */
function getTimestamp(){
  let time = process.hrtime();
  return  Math.round( time[ 0 ] * 1e3 + time[ 1 ] / 1e6 );
}

/**
 * Application-only authentication
 *
 * Resources:
 *  https://dev.twitter.com/oauth/application-only
 *  https://coderwall.com/p/3mcuxq/twitter-and-node-js-application-auth
 *
 * @return {Promise<Object>}
 */
function getBearerToken(){
  var deferred = Q.defer();

  var oauth2 = new OAuth2(config.get('API.KEYS.CONSUMER_KEY'), config.get('API.KEYS.CONSUMER_KEY_SECRET'), 'https://api.twitter.com/', null, 'oauth2/token', null);

  oauth2.getOAuthAccessToken('', {
    'grant_type': 'client_credentials'
  }, function (e, access_token) {
    if(typeof access_token !== 'undefined'){
      deferred.resolve({access_token: access_token});
    }else{
      deferred.reject(e);
    }
  });

  return deferred.promise;
}

/**
 * Get Account Data
 * Resource: https://nodejs.org/api/https.html
 * @param handle {string}
 * @param bearerToken {string}
 */
function getAccountData (handle, bearerToken){

  /**
   * Https request options
   */
  let options = {
    hostname: 'api.twitter.com',
    method: 'GET',
    port: 443,
    path: '/1.1/users/show.json?screen_name='+ handle,
    headers:{
      Connection:'Keep-Alive',
      'X-Target-URI':'https://api.twitter.com',
      oauth_consumer_key:  config.get('API.KEYS.CONSUMER_KEY'),
      oauth_nonce: new Buffer(uuid.v1()).toString('base64'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: getTimestamp(),
      oauth_token: config.get('API.KEYS.ACCESS_TOKEN'),
      oauth_version:'1.0',
      Authorization: 'Bearer '+ bearerToken
    }
  };

  options.headers.oauth_signature = getSignature(options.headers, handle);

  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });
  req.end();

}

function main(){

  /**
   * bearer token
   * @type {string}
   */
  let bearerToken = '';

  getBearerToken()
    .then(function(the){

      bearerToken = the.access_token;

      accounts.forEach(function (account){
        getAccountData( account.handle, bearerToken);
      });

    });

}

main();