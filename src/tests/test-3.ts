"use strict";

/**
 * Goal: Retrieve information of followers
 *
 *  Run: node test-2.js | ./../../node_modules/.bin/bunyan
 *
 * - Find the names of the accounts that are followers
 * - Save these names in a JSON-file on disk, per account a separate file.
 *
 * Resources:
 * https://dev.twitter.com/rest/reference/get/followers/list
 * https://dev.twitter.com/overview/api/cursoring
 *
*
 */

 import {Twiba} from '../lib/twiba';
 import * as utility from '../lib/utilities';

// const utilities = require('../lib/utilities');
// const accounts = require('../accounts.json');

let accounts: Account[]  = [
  {
    "id": "3354898635",
    "handle": "EducaEmpleoCOL"
  },
  {
    "id": "1471026043",
    "handle": "TalentBulk"
  }];


  interface Account {
      id: string;
      handle: string;
  }

 function main(__account?: Account){

  /**
   * Create a queue to run one at the time
   * Resource: http://stackoverflow.com/questions/1590247/how-do-you-implement-a-stack-and-a-queue-in-javascript
   */
  let account = typeof __account !== "undefined"? __account : accounts.shift();

  Twiba.getFollowers({handle: account.handle})
    .then(result => {

      utility.saveAsJSONFile(result.handle, result.followers, 'followers');

      if(accounts.length > 0){
        main();
      }

    })
    .catch(err => {

      console.log('*** Error: ',err);

      // Try again after 60 Seconds
      setTimeout(() => {
        main(account);
      }, 60000);

    });

}

main();
