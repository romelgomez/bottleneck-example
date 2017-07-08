"use strict";
var twiba_1 = require("../lib/twiba");
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
function main(_account_) {
    var account = typeof _account_ !== "undefined" ? _account_ : accounts.shift();
    twiba_1.Twiba.getUserByHandle(account.handle)
        .then(function (result) {
        if (typeof result.id_str !== "undefined") {
            console.log();
            console.log({
                screen_name: result.screen_name,
                user_id: result.id_str
            });
            console.log();
            console.log('******************************************************************');
        }
        else {
            console.log('result.errors: ', result.errors);
        }
        if (accounts.length > 0) {
            main();
        }
    })
        .catch(function (err) {
        console.log(err);
        setTimeout(function () {
            main(account);
        }, 60000);
    });
}
main();
