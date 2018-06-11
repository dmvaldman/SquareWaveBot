let Twit = require('twit');
let T = new Twit(require('./config.js'));
let Image = require('./src/Image');

class Lambda {
  static postToTwitter(img, params){
    T.post('media/upload', { media_data: img }, function (err, data, response) {
      let mediaIdStr = data.media_id_string;
      let altText = JSON.stringify(params);
      let meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

      T.post('media/metadata/create', meta_params, function (err, data, response) {
        if (err !== null) {
          let params = { status: '', media_ids: [mediaIdStr] };
          T.post('statuses/update', params, function (err, data, response) {
            if (err)
              console.log(err)
            else
              console.log('Success!')
          });
        }
      });
    });
  }

  static async run(callback){
    let timeStart = Date.now();

    try {
      let [img, params] = await Image.createRandom();
      Lambda.postToTwitter(img, params);
      callback(null, params);
    }
    catch (err){
      callback(err.message);
    }

    let duration = (Date.now() - timeStart) / 1000;
    console.log('Duration', duration, 'seconds');
  }
}

exports.handler = function SquareWaveBot(event, context, callback) {
  Lambda.run(callback);
};
