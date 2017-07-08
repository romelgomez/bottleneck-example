/**
 * Goal: Retrieve id's for twitter handles
 *
 * node test-1.js | ./../../node_modules/.bin/bunyan
 *
 * Resource: https://dev.twitter.com/rest/reference/get/users/show
 */
import {Twiba} from '../lib/twiba';

// const accounts: Object[] = require('./../accounts.json');

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


/**
 * Main function
 */
function main(_account_?: Account){

  /**
   * Create a queue to run one at the time
   * Resource: http://stackoverflow.com/questions/1590247/how-do-you-implement-a-stack-and-a-queue-in-javascript
   */
  let account: Account = typeof _account_ !== "undefined"? _account_ : accounts.shift();

  Twiba.getUserByHandle(account.handle)
    .then((result) => {

      if(typeof result.id_str !== "undefined"){
        console.log();
        console.log({
          screen_name: result.screen_name,
          user_id: result.id_str
        });
        console.log();
        console.log('******************************************************************');
      } else {
        console.log('result.errors: ',result.errors);
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
