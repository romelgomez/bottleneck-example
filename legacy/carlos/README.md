# Twiba for node

Analysis of Twitter Accounts for the Twitter [REST APIs](https://dev.twitter.com/rest/public)

## Installation

Clone the repository

`git clone git@github.com:carlos-meneses/twiba-node.git`

Get into twiba-node directory and install dependencies

`cd twiba-node && npm install`

 and run examples

`npm run test_1`...

## Usage

```javascript
var Twiba = require('twiba');
```

## Example

```javascript
var Twiba = require('twiba');

var settings = { 
    token: "OAUTH_TOKEN",
    token_secret: "OAUTH_TOKEN_SECRET",
    consumer_key: "CONSUMER_KEY",
    consumer_secret: "CONSUMER_SECRET"
} // Create a app in https://apps.twitter.com/ and create tokens

var tw = new Twiba(settings); // Instance Twiba

// Get data user 'osen_10112'
tw.get('users/show.json', { screen_name: 'osen_10112' }).then(user => {
    console.log("User ID: "+user.id+"\n\n");
}).catch(err => {
    console.log(err);
}); // Use promise
```

## Repository 
https://github.com/carlos-meneses/twiba-node

