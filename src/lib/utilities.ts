import * as fs from "fs"
import * as path from "path"
import * as bunyan from "bunyan"

export class Loger {

  /**
   * Bunyan log instance
   * Source: https://github.com/trentm/node-bunyan
   */
  log: bunyan.Logger;

  constructor(protected name: string){

      this.log = bunyan.createLogger({
        name: name
      });

  }

  /**
   * Set info message
   */
  info(message: string){
    this.log.info(message);
  }

  /**
   * Set error message
   */
   error(message: string){
     this.log.error(message);
   }

}

export class Timer extends Loger{

  /**
   * Timer - To log the elapsed time of the process
   * @source http://stackoverflow.com/questions/10617070/how-to-measure-execution-time-of-javascript-code-with-callbacks
   */
  protected timer:[number, number];

  constructor(name: string){
    super(name);
  }

  startProcess(){
    this.timer = process.hrtime();
  }

  endProcess(message: string, error?: boolean){

    /**
     * Timer - timer precision
     */
    let precision: number = 3; // 3 decimal places
    /**
     * Timer - elapsed time
     */
    let elapsed: number = process.hrtime(this.timer)[1] / 1000000; // divide by a million to get nano to milli

    /**
     * Timer - message
     */
    let timer: string = process.hrtime(this.timer)[0] + "s, " + elapsed.toFixed(precision) + "ms"; // print message + time

    /**
     * Timer - reset the timer
     */
    this.timer = process.hrtime(); // reset the timer

    if(error){
      this.error(message + ' After ' + timer);
    }else{
      this.info('*** Finished: ' + message + 'After' + timer + '***');
    }

  }

}

/**
 * Save as JSON file
 */
export function saveAsJSONFile (fileName: string, data: any, __path?: string){

  /**
   * File path
   */
  let filepath: string;

  /**
   * Create a directory if doesn't exist?
   * Source: http://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
   */
   if(typeof path !== 'undefined' && __path !== ''){
     if (!fs.existsSync(__path)){
       fs.mkdirSync(__path);
     }

     filepath = path.join(__path, fileName + '.json')
   }else{
     filepath = fileName + '.json';
   }

  /**
   * Create an empty file
   * Source: http://stackoverflow.com/questions/12809068/create-an-empty-file-in-nodejs
   */
  fs.closeSync(fs.openSync(filepath, 'w'));

  /**
   * Write File
   */
  fs.writeFile(filepath, JSON.stringify(data), 'utf8', (err) => {
    if(err){
      throw err;
    }
  });

}
