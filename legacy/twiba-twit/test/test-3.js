"use strict";

/**
 * Goal: Retrieve information of followers
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

const Twiba = require('../lib/twiba');
const utilities = require('../lib/utilities');
const accounts = require('../accounts.json');


/**
 * Main function
 * @param {Object} [_account_] - In case err, to try again.
 */
function main(_account_){

  /**
   * Create a queue to run one at the time
   * Resource: http://stackoverflow.com/questions/1590247/how-do-you-implement-a-stack-and-a-queue-in-javascript
   */
  let account = typeof _account_ !== "undefined"? _account_ : accounts.shift();

  Twiba.getFollowers({handle: account.handle})
    .then(result => {

      console.log('result', result);

      utilities.saveArrayListsAsJSONFile('followers', result.handle, result.followers);

      if(accounts.length > 0){
        main();
      }

    })
    .catch(err => {

      console.log(err);

      // Try again after 60 Seconds
      setTimeout(() => {
        main(account);
      }, 60000);

    });

}

main();