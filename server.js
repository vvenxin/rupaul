/* Setup */
var path = require('path'),
    request = require('request'),
    express = require('express'),
    app = express(),   
    Twit = require('twit'),
    fs = require('fs'),
    config = {
    /* Be sure to update the .env file with your API keys. See how to get them: https://botwiki.org/tutorials/how-to-create-a-twitter-app */      
      twitter: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
      }
    },

T = new Twit(config.twitter);

/* Download gif function */
const download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

/* Pick random gif */
const randomize = function(){ 
  request.get({
  url: 'http://api.giphy.com/v1/gifs/random',
  qs: 
   { tag: 'rupauls drag race',
     api_key: 'Sro1T2VLOIydEKg6comTKXjn1GdVLXR0' },
  body: '{}'
  },
function (error, response, body) {
  if (error) throw new Error(error);
  console.log(body);
    let json = JSON.parse(body);
    const imgUrl = json.data.image_url; // get url of gif
    console.log(json.data.image_url);
    download(imgUrl, 'img', function(){
        console.log('img saved to img');
    });
});
}

/* Tweeting function */
const tweet = function() {
 const b64content = fs.readFileSync('./img', { encoding: 'base64' });
  T.post('media/upload', { media_data: b64content }, function (err, data, response) {
    var mediaIdStr = data.media_id_string;
    var meta_params = { media_id: mediaIdStr};
    T.post('media/metadata/create', meta_params, function (err, data, response) {
          if (!err) {
              var params = {media_ids: [mediaIdStr] };
              T.post('statuses/update', params, function (err, data, response) {
                  console.log(data);
              });
          }
      })
  });
};

/* Run program with cron job */
app.all("/" + process.env.BOT_ENDPOINT, function (req, res) {
  randomize();
  tweet();
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});


