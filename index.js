let Twit = require('twit');
let T = new Twit(require('./config.js'));
let Image = require('./src/Image');

class Lambda {
  static getRandomParams(){
    const iterations = 500 + Math.floor(5000 * Math.random());
    const radius = 10 + Math.floor(20 * Math.random());
    const damping = .01 * Math.random();

    return {
      iterations: iterations,
      radius: radius,
      damping: damping,
      speed: .7,
      size: [500, 500],
      scale: 4
    };
  }

  static async createRandomImage(){
    const params = Lambda.getRandomParams();

    try {
      let image = new Image(params.size, params.scale);
      let img = await image.create(params);
      img = img.replace(/^data:image\/png;base64,/, "");
      return [img, params]
    }
    catch (err){
      console.log(err);
      return err;
    }
  }

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

  static saveToDisk(img, params, path='out.png'){
    require("fs").writeFile(path, img, 'base64', function(err) {
      console.log(params);
      if (err !== null)
        console.log(err);
      else
        console.log('Success!');
    });
  }

  static async run_save(){
    let timeStart = Date.now();

    try {
      let [img, params] = await Lambda.createRandomImage();
      Lambda.saveToDisk(img, params);
    }
    catch (err){
      console.log(err);
    }

    let duration = Date.now() - timeStart;
    console.log('Duration', duration / 1000, 'seconds');
  }

  static async run_twitter(callback){
    let timeStart = Date.now();

    try {
      let [img, params] = await Lambda.createRandomImage();
      Lambda.postToTwitter(img, params);
      callback(null, params);
    }
    catch (err){
      callback(err);
    }

    let duration = Date.now() - timeStart;
    console.log('Duration', duration / 1000, 'seconds');
  }
}

// Uncomment this to run locally and save image to disk.
// Lambda.run_save();

exports.handler = function myBot(event, context, callback) {
  Lambda.run_twitter(callback);
};
