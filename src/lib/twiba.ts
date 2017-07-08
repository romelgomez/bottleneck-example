import * as config from 'config';
import * as Twit from 'twit';
import * as Bottleneck from 'bottleneck';
import * as moment from 'moment';
import * as colors from 'colors';
import * as _ from "lodash";
import * as utility from './utilities';


interface Parameters {
  screen_name?: string
  handle?: string
  user_id?: string
  id?: string
  cursor?: string
  count?: number
}

interface TwitTwitterUser extends Twit.Twitter.User {
  errors: any;
}

interface ListData {
  name: string,
  screen_name: string
}

interface ListResponse {
  screen_name?: string;
  handle?: string;
  user_id?: string;
  id?: string;
  friends?: ListData[];
  followers?: ListData[];
  following?: ListData[];
}

class TwibaClass {
    /**
     * Twit instance
     */
    protected twit: Twit;

    /**
     * Loger instance
     */
    protected loger: utility.Loger;

    /**
     * Timer instance
     */
    protected timer: utility.Timer;

    /**
     * Rate Limiter
     * Resource: https://github.com/SGrondin/bottleneck
     */
    protected limiter: Bottleneck;

    /**
     * How long to wait after launching a request before launching another one.
     *
     * NOTE: All the endpoints affected with the 'Rate limited' will use this restriction.
     *
     * Requests / 15-min window (app auth) 30. Means that only 2 request can be made in 1 min.
     */
    protected minTime: number;

    /**
     * The wait time for the schedule HTTP request
     */
    protected waitTime: number;

    /**
     * To off the first http request notification.
     */
    protected _switch: boolean;

    constructor(private settings: Twit.Options) {

      this.twit = new Twit(settings);

      this.loger = new utility.Loger('twiba');

      this.timer = new utility.Timer('twiba-timer');

      this.minTime = 60000; // 60 seconds

      this.waitTime = 0;

      this.limiter = new Bottleneck(1, this.minTime);

      this._switch = false;

    }

    protected get (path: string, parameters: Twit.Params, message: string): Promise<Twit.PromiseResponse> {

      return new Promise((resolve, reject) => {

        let fn = function(__this: any, path: string, parameters: Twit.Params, message: string) {

          __this.loger.info('The http request schedule for: ' + message + ', ' + colors.yellow('START.'));

          // __this.

          return  __this.twit.get(path, parameters)
                              .then((data) => resolve(data))
                              .catch((err) => reject(err));

        };

        this.waitTime += this.minTime;

        if(this._switch){

          /**
           * Wait time in Seconds.
           */
          let startAt = moment().millisecond(this.waitTime).format('h:mm:ss');

          this.loger.info('A new http request has been schedule for: ' + message + ', start in aprox: ' + colors.green(startAt))

        }else{
          this._switch = true
        }

        this.limiter.schedule(fn, this, path, parameters, message);

      });

    }

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
     */
    protected parameterProvided(parameters: Parameters): Promise<string> {

     /**
      * kept the key used for get the data (screen_name|handle or user_id|id)
      */
     let searchParameterProvided: string = '';

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
    */
   getUser (parameters: Parameters): Promise<TwitTwitterUser> {
     return new Promise((resolve, reject) => {

       /**
        * Log message
        */
       let message: string = '';

       /**
        * kept the key used for get the user data (screen_name|handle or user_id|id)
        */
       let searchParameterProvided: string = '';

       /**
        * Search parameters for the http request
        */
       let searchParameters: Parameters = {};

       this.parameterProvided(parameters)
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

           this.get('users/show', searchParameters, message)
             .then((result)=>{
               resolve(result.data);
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
    */
   getUserByID (id: string): Promise<TwitTwitterUser> {
     return this.getUser({user_id:id});
   };

   /**
    * Get User By Handle
    */
   getUserByScreenName (screen_name: string): Promise<TwitTwitterUser>{
     return this.getUser({screen_name:screen_name});
   };

   /**
    * Get User By handle alias of screen_name
    */
   getUserByHandle (handle: string): Promise<TwitTwitterUser>{
     return this.getUser({handle: handle});
   };


   /**
    * Get followers or friends|following - Recursive function - Accept screen_name|handle or user_id|id parameters
    *
    * Resources:
    *  https://dev.twitter.com/rest/reference/get/followers/list
    *  https://dev.twitter.com/rest/reference/get/friends/list
    *
    */
   getList (listType: string, parameters: Parameters): Promise<ListResponse> {

     /**
      * All the friends|following or followers of the handle|screen_name
      */
     let list: ListData[] = [];

     /**
      * kept the key used for get the friends|following or followers (friends|followers), following is a Alias of friends.
      */
     let __listType: string = '';

     /**
      * The number of users to return per page, up to a maximum of 200. Defaults to 20.
      */
     let count: number = 200;

     /**
      * kept the key provided for get the friends|following or followers (screen_name|handle|user_id|id)
      */
     let searchParameterProvided: string = '';

     return new Promise((resolve, reject) => {

       function recursive (__this, __listType, __parameters) {

         /**
          * Log message
          */
         let message: string ='Get '+ _.upperFirst(listType) + ' list for {' + searchParameterProvided +': \'' + parameters[searchParameterProvided] + '\'}'; // Get <friends|following or followers> for {'screen_name': EducaEmpleoCOL}

         return __this.get( __listType + '/list', __parameters, message)
           .then((result) => {

             if(typeof result.data.users !== 'undefined'){

               if(result.data.users.length > 0){

                 result.data.users.forEach((user) => {
                   list.push({
                     name: user.name,
                     screen_name: user.screen_name
                   });
                 });

               }

               if(result.data.next_cursor_str !== '0'){

                 __parameters.cursor = result.data.next_cursor_str;
                 recursive(__this,__listType, __parameters);

               } else {

                 let response = {};
                 response[searchParameterProvided] = parameters[searchParameterProvided];
                 response[listType] = list;
                 resolve(response);

                 __this.timer.endProcess('Get '+ _.upperFirst(listType) + ' list for the {' + searchParameterProvided +': \'' + parameters[searchParameterProvided] + '\'} process end.')

               }

             } else {
               reject(result);
             }

           })
           .catch((err) => {
             reject(err);
           });

       }

       function main (__this) {

         /**
          * Search parameters for the first http request
          */
         let searchParameters : Parameters  = {
           cursor:'-1', // to get the first page, the next pages are calculated by twitter, and they are random numbers.
           count: count // The number of users to return per page
         };

         __this.parameterProvided(parameters)
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
           .then(() => {

             __this.loger.info('Get '+ _.upperFirst(listType) + ' list for the {' + searchParameterProvided +': \'' + parameters[searchParameterProvided]  + '\'} process start.');
             __this.timer.startProcess();

             recursive(__this,__listType,searchParameters);

           })
           .catch((err) => {

             reject(err);

           });

       }

       main(this);

     });

   };


   /**
    * Get followers - Accept screen_name|handle or user_id|id parameters
    *
    * Resource: https://dev.twitter.com/rest/reference/get/followers/list
    *
    */
   getFollowers (parameters: Parameters): Promise<ListResponse> {
     return this.getList('followers', parameters);
   };

   /**
    * Get friends|following - Recursive function - Accept screen_name|handle or user_id|id parameters
    *
    * Resource: https://dev.twitter.com/rest/reference/get/friends/list
    *
    */
   getFollowing (parameters: Parameters): Promise<ListResponse> {
     return this.getList('following', parameters);
   };

   /**
    * Get followers by handle
    */
   getFollowersByHandle (handle: string): Promise<ListResponse> {
     return this.getList('followers', {handle:handle})
   };

   /**
    * Get followers by user ID
    */
   getFollowersByUserID (user_id: string): Promise<ListResponse> {
     return this.getList('followers', {user_id:user_id});
   };


}



export let Twiba = new TwibaClass({
    consumer_key:         config.get('API.KEYS.CONSUMER_KEY').toString(),
    consumer_secret:      config.get('API.KEYS.CONSUMER_KEY_SECRET').toString(),
    access_token:         config.get('API.KEYS.ACCESS_TOKEN').toString(),
    access_token_secret:  config.get('API.KEYS.ACCESS_TOKEN_SECRET').toString(),
    timeout_ms: 120*1000  // optional HTTP request timeout to apply to all requests.
});
