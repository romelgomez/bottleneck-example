/**
 * Goal: Retrieve meta data for twitter handles
 *
 * Resource: https://dev.twitter.com/rest/reference/get/users/show
 */

const Twiba = require('../lib/twiba');
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

  Twiba.getUserByHandle(account.handle)
    .then(result => {

      if(typeof result.id_str !== "undefined"){
        console.log();
        console.log({
          'handle': result.screen_name,
          'id': result.id_str,
          'Date of the last tweet': result.status.created_at,
          'Total number of tweets for this account': result.statuses_count,
          'Total of followers does this account have': result.followers_count,
          'Total of accounts does this account follow': result.friends_count,
          'Description:': result.description,
          'Location:': result.location
        });
        console.log();
        console.log('******************************************************************');
      } else {
        console.log(result.errors);
      }

      if(accounts.length > 0){
        main();
      }

    })
    .catch(err =>{
      console.log(err);

      // Try again after 60 Seconds
      setTimeout(() => {
        main(account);
      }, 60000);

    });

}

main();