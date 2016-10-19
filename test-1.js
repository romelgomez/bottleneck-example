const https = require('https');
let Buffer = require('buffer').Buffer;
var uuid = require('uuid');
let accounts = require('./accounts.json');

function getAccountData2(account){
  // http://stackoverflow.com/a/30531157/2513972
  var time = process.hrtime();
  let timestamp = Math.round( time[ 0 ] * 1e3 + time[ 1 ] / 1e6 );

  console.log('timestamp : ',timestamp);
  console.log('account.handle: ',account.handle);
  console.log('uuid.v1(): ',uuid.v1());
  console.log('new Buffer(uuid.v1()).toString(\'base64\')',new Buffer(uuid.v1()).toString('base64'));
}

function getAccountData (account){

  // http://stackoverflow.com/a/30531157/2513972
  var time = process.hrtime();
  let timestamp = Math.round( time[ 0 ] * 1e3 + time[ 1 ] / 1e6 );

  let options = {
    hostname: 'api.twitter.com',
    port: 443,
    path: '/1.1/users/show.json?include_entities=true&screen_name'+ account.handle,
    method: 'GET',
    headers:{
      oauth_consumer_key:'iTsZ0av5U2qL0QIYHYszDLycB',
      oauth_nonce: new Buffer(uuid.v1()).toString('base64'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp:timestamp,
      oauth_token:'192774776-Ffrt49fOwozi0WxytUsFqVlTPyX80wRA1J5i8m9j',
      oauth_version:'1.0'
    }
  };

  // https://dev.twitter.com/oauth/overview/creating-signatures
  options.headers.oauth_signature_method = 'GET';

  //https://api.twitter.com/1.1/users/show.json

  https.get('https://api.twitter.com/1.1/users/show.json?screen_name'+ account.handle, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      process.stdout.write(d);
    });

  }).on('error', (e) => {
    console.error(e);
  });

}

accounts.forEach(function (account){
  getAccountData2(account)
});

