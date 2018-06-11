let Image = require('./src/Image');
let fs = require("fs");

function saveToDisk(img, params, path='out.png'){
  console.log('Parameters used: ', params);
  fs.writeFile(path, img, 'base64', function(err) {
    if (err !== null)
      console.log(err.message);
    else
      console.log('Success! Image saved to', path);
  });
}

async function run(){
  let timeStart = Date.now();

  try {
    let [img, params] = await Image.createRandom();
    saveToDisk(img, params);
  }
  catch (err){
    console.log(err);
  }

  let duration = (Date.now() - timeStart) / 1000;
  console.log('Duration', duration, 'seconds');
}

run();