var Twiba = require('../lib/twiba');
settings = {
    token: "265523339-8d2NvWjvkfQcd387OPyU1If7a1dq7y6pujL5CQkw",
    token_secret: "xziUwo5DVdxr0aKobnngppebf20QUoSKoQaIfMWQJ8HlH",
    consumer_key: "CtULP6F36zU5FjinLjOuXNGpu",
    consumer_secret: "05HwMizdYt6iYhXeqPmTMzi8xgNP11DDJmXLK5dS6BGVDZHyEc"
}; // Custom config

var tw = new Twiba(settings);

tw.get('users/show.json', {screen_name: 'osen_10112'}).then(resp => {
    console.log("User ID: "+resp.id+"\n\n");
}).catch(err => {
    console.log(err);
});