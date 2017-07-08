"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fs = require("fs");
var path = require("path");
var bunyan = require("bunyan");
var Loger = (function () {
    function Loger(name) {
        this.name = name;
        this.log = bunyan.createLogger({
            name: name
        });
    }
    Loger.prototype.info = function (message) {
        this.log.info(message);
    };
    Loger.prototype.error = function (message) {
        this.log.error(message);
    };
    return Loger;
}());
exports.Loger = Loger;
var Timer = (function (_super) {
    __extends(Timer, _super);
    function Timer(name) {
        return _super.call(this, name) || this;
    }
    Timer.prototype.startProcess = function () {
        this.timer = process.hrtime();
    };
    Timer.prototype.endProcess = function (message, error) {
        var precision = 3;
        var elapsed = process.hrtime(this.timer)[1] / 1000000;
        var timer = process.hrtime(this.timer)[0] + "s, " + elapsed.toFixed(precision) + "ms";
        this.timer = process.hrtime();
        if (error) {
            this.error(message + ' After ' + timer);
        }
        else {
            this.info('*** Finished: ' + message + 'After' + timer + '***');
        }
    };
    return Timer;
}(Loger));
exports.Timer = Timer;
function saveAsJSONFile(fileName, data, __path) {
    var filepath;
    if (typeof path !== 'undefined' && __path !== '') {
        if (!fs.existsSync(__path)) {
            fs.mkdirSync(__path);
        }
        filepath = path.join(__path, fileName + '.json');
    }
    else {
        filepath = fileName + '.json';
    }
    fs.closeSync(fs.openSync(filepath, 'w'));
    fs.writeFile(filepath, JSON.stringify(data), 'utf8', function (err) {
        if (err) {
            throw err;
        }
    });
}
exports.saveAsJSONFile = saveAsJSONFile;
