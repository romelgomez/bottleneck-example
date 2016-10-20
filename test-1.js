const https = require('https');
var Buffer = require('buffer').Buffer;
var uuid = require('uuid');
var config = require('config');
const strictUriEncode = require('strict-uri-encode');
var hmacsha1 = require('hmacsha1');
var OAuth2 = require('oauth').OAuth2;
var accounts = require('./accounts.json');

/**
 * Creating a signature - https://dev.twitter.com/oauth/overview/creating-signatures
 */
function getSignature (headers,accountHandle){
  let httpMethod = 'GET';
  let baseURL = 'https://api.twitter.com/1.1/users/show.json';

  let parametersString =
    'oauth_consumer_key=' + headers.oauth_consumer_key +
    '&oauth_nonce=' + headers.oauth_nonce +
    '&oauth_signature_method=' + headers.oauth_signature_method +
    '&oauth_timestamp=' + headers.oauth_timestamp +
    '&oauth_token=' + headers.oauth_token +
    '&oauth_version=' + headers.oauth_version +
    '&screen_name=' + accountHandle;

  //console.log('');
  //console.log('parametersString:',parametersString);
  //console.log('');

  let signatureBaseString =
    httpMethod +
    '&' +
    strictUriEncode(baseURL) +
    '&' +
    strictUriEncode(parametersString);

  //console.log('');
  //console.log('strictUriEncode(parametersString)',strictUriEncode(parametersString))
  //console.log('');

  console.log('');
  console.log('signatureBaseString',signatureBaseString)
  console.log('');

  let signingKey =
    strictUriEncode(config.get('API.KEYS.CONSUMER_KEY_SECRET')) +
    '&' +
    strictUriEncode(config.get('API.KEYS.ACCESS_TOKEN_SECRET'));

  console.log('config.get(\'API.KEYS.CONSUMER_KEY_SECRET\'): ',config.get('API.KEYS.CONSUMER_KEY_SECRET'));
  console.log('config.get(\'API.KEYS.ACCESS_TOKEN_SECRET\'): ',config.get('API.KEYS.ACCESS_TOKEN_SECRET'));
  console.log('signingKey: ',signingKey)

  //return hmacsha1('MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98&J6zix3FfA9LofH0awS24M3HcBYXO5nI1iYe8EfBA',signatureBaseString);
  return hmacsha1(signingKey,signatureBaseString);
}

function getAccountData2(){
  console.log('getTimestamp',getTimestamp());
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

/*
  https://dev.twitter.com/oauth/application-only
  https://coderwall.com/p/3mcuxq/twitter-and-node-js-application-auth
 */
function getBearerToken(){

  var oauth2 = new OAuth2(config.get('API.KEYS.CONSUMER_KEY'), config.get('API.KEYS.CONSUMER_KEY_SECRET'), 'https://api.twitter.com/', null, 'oauth2/token', null);

  oauth2.getOAuthAccessToken('', {
    'grant_type': 'client_credentials'
  }, function (e, access_token) {
    console.log('e',e);
    console.log('access_token',access_token); //string that we can use to authenticate request
  });

}

function getAccountData (account){

  let options = {
    hostname: 'api.twitter.com',
    method: 'GET',
    port: 443,
    path: '/1.1/users/show.json?screen_name='+ account.handle,
    headers:{
      Connection:'Keep-Alive',
      'X-Target-URI':'https://api.twitter.com',
      oauth_consumer_key:  config.get('API.KEYS.CONSUMER_KEY'),
      oauth_nonce: new Buffer(uuid.v1()).toString('base64'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: getTimestamp(),
      oauth_token: config.get('API.KEYS.ACCESS_TOKEN'),
      oauth_version:'1.0',
      Authorization:'Bearer AAAAAAAAAAAAAAAAAAAAACc1xgAAAAAA4lXKdN1TjGrNHrWQP4fJ3Fj1TpU%3DizrUx6bQsFSkWAinQreaMsvuf1Q9n4ow1i2OcCb1lCtzGlUsRh'
    }
  };

  //Authorization:OAuth oauth_consumer_key="DC0sePOBbQ8bYdC8r4Smg",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1476961551",oauth_nonce="-561730464",oauth_version="1.0",oauth_token="192774776-IfH6tdFfbwzlVs6Ub1obkTDefvhQFMs2xMeprzip",oauth_signature="rWDotSYOBt1i6DHo4AIrtCVvnWw%3D"

  let signature = getSignature(options.headers, account.handle);
  console.log('signature',signature);
  options.headers.oauth_signature = signature;

  let bearerToken

  //options.headers.Authorization =
  //  'OAuth ' +
  //  'oauth_consumer_key="' + options.headers.oauth_consumer_key + '",' +
  //  'oauth_signature_method="' + options.headers.oauth_signature_method + '",' +
  //  'oauth_timestamp="' + options.headers.oauth_timestamp + '",' +
  //  'oauth_nonce="' + options.headers.oauth_nonce + '",' +
  //  'oauth_version="' + options.headers.oauth_version + '",' +
  //  'oauth_token="' + options.headers.oauth_token + '",' +
  //  'oauth_signature="' + options.headers.oauth_signature + '",';

  //console.log('options', options);

  //https.get(options, (res) => {
  //  //console.log('res:', res);
  //  console.log('statusCode:', res.statusCode);
  //  console.log('headers:', res.headers);
  //
  //  res.on('data', (d) => {
  //    process.stdout.write(d);
  //  });
  //
  //}).on('error', (e) => {
  //  console.error(e);
  //});

  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });
  req.end();

}

accounts.forEach(function (account){
  getAccountData(account)
  //getBearerToken();
});
