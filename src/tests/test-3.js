"use strict";
var twiba_1 = require("../lib/twiba");
var utility = require("../lib/utilities");
var accounts = [
    {
        "id": "3354898635",
        "handle": "EducaEmpleoCOL"
    },
    {
        "id": "1471026043",
        "handle": "TalentBulk"
    }
];
function main(__account) {
    var account = typeof __account !== "undefined" ? __account : accounts.shift();
    twiba_1.Twiba.getFollowers({ handle: account.handle })
        .then(function (result) {
        utility.saveAsJSONFile(result.handle, result.followers, 'followers');
        if (accounts.length > 0) {
            main();
        }
    })
        .catch(function (err) {
        console.log('*** Error: ', err);
        setTimeout(function () {
            main(account);
        }, 60000);
    });
}
main();
