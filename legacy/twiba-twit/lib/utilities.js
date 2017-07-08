const fs = require('fs');
const bunyan = require('bunyan');

/**
 * Bunyan log instance
 * Source: https://github.com/trentm/node-bunyan
 */
let log = bunyan.createLogger({
  name: 'twiba',
  pid: false
});

module.exports = {
  startProcess: startProcess,
  endProcess: endProcess,
  info: info,
  saveArrayListsAsJSONFile: saveArrayListsAsJSONFile
};

/**
 * Set message to notify the process start
 * @param {String} taskTitle
 */
function startProcess(taskTitle){
  log.info(taskTitle);
}

/**
 * Set info message
 * @param {String} taskTitle
 */
function info(taskTitle){
  log.info(taskTitle);
}

/**
 * Timer - To log the elapsed time of the process
 * @source http://stackoverflow.com/questions/10617070/how-to-measure-execution-time-of-javascript-code-with-callbacks
 */
let start = process.hrtime();

/**
 * Set message to notify the process end
 * @param {String} taskTitle
 * @param {boolean} [error]
 */
function endProcess(taskTitle, error){

  /**
   * Timer - timer precision
   * @type {number}
   */
  let precision = 3; // 3 decimal places
  /**
   * Timer - elapsed time
   * @type {number}
   */
  let elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli

  /**
   * Timer - message
   * @type {string}
   */
  let timer = process.hrtime(start)[0] + "s, " + elapsed.toFixed(precision) + "ms"; // print message + time

  /**
   * Timer - reset the timer
   */
  start = process.hrtime(); // reset the timer

  if(error){
    log.error(taskTitle,'After',timer);
  }else{
    log.info('*** Finished:',taskTitle,'After',timer,'***');
  }

}

/**
 * Save Array list as JSON file
 * @param {String} directory
 * @param {String} handle - Alias of screen_name
 * @param {Array} list
 */
function saveArrayListsAsJSONFile (directory, handle, list){

  /**
   * Create a directory if doesn't exist?
   * Source: http://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
   */
  if (!fs.existsSync(directory)){
    fs.mkdirSync(directory);
  }

  /**
   * File path
   * @type {string}
   */
  let filepath = directory + '/'+ handle +'.json';

  /**
   * Create an empty file
   * Source: http://stackoverflow.com/questions/12809068/create-an-empty-file-in-nodejs
   */
  fs.closeSync(fs.openSync(filepath, 'w'));

  /**
   * Write File
   */
  fs.writeFile(filepath, JSON.stringify(list), 'utf8', (err) => {
    if(err){
      throw err;
    }
  });

}