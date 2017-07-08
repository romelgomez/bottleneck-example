// Type definitions for twit 1.15.0S
// Project: https://github.com/SGrondin/bottleneck
// Definitions by: Romel Gomez <https://github.com/romelgomez>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped


declare module 'bottleneck' {

  namespace Bottleneck {
    export interface Fn {
      (...args: any[]): any
    }
  }

  class Bottleneck {

    /**
     * @see https://github.com/SGrondin/bottleneck#constructor
     */
    constructor(maxNb?: number, minTime?: number, highWater?: number, strategy?: number, rejectOnDrop?: boolean);

    /**
     * @see https://github.com/SGrondin/bottleneck#submit
     */
    submit(fn: Bottleneck.Fn, ...args: any[]);

    /**
     * @see https://github.com/SGrondin/bottleneck#schedule
     */
    schedule(fn: Bottleneck.Fn, ...args: any[]);

    /**
     * @see https://github.com/SGrondin/bottleneck#submitpriority
     */
    submitPriority(priority:number, fn: Bottleneck.Fn, ...args: any[]);

    /**
     * @see https://github.com/SGrondin/bottleneck#schedulepriority
     */
    schedulePriority(priority:number, fn: Bottleneck.Fn, ...args: any[]);

  }

  export = Bottleneck;

}
