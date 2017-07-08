'use strict';

var rq = require('request');
var extd = require('deep-extend');

function Twiba (settings) {
    // Safe instance
    if(!(this instanceof Twiba)) {
        return new Twiba(settings);
    }

    // Merge config
    this.settings = extd({
        api_rest: 'https://api.twitter.com/1.1/', // Only REST API
    }, settings);
    this.rq = rq;
}

Twiba.prototype.get = function(resource, params) {
    var resource = resource;
    var url = this.settings.api_rest + resource;
    if(Object.keys(params).length > 0) {
        var idx = 0;
        for(var i in params) {
            if(idx == 0) {
                url += "?"+i+"="+ params[i];
                idx++;
            }else{
                url += "&"+i+"="+ params[i];
            }
        };
    }
    return new Promise((resolve, reject) => {
        this.rq.get({url: url, oauth: this.settings}, function(error, resp, body) {
            if(!error) {
                var _data = JSON.parse(body);
                resolve(_data);
            }else{
                reject(error);
            }
        });
    })
}

module.exports = Twiba;