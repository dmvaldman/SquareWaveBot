let Image = require('./src/Image');

function saveToDisk(img, params, path='out.png'){
  require("fs").writeFile(path, img, 'base64', function(err) {
    console.log(params);
    if (err !== null)
      console.log(err);
    else
      console.log('Success!');
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