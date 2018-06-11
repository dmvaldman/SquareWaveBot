let Jimp = require('jimp');
let WaveGrid = require('./WaveGrid');
let BilinearInterpolation = require('./BilinearInterpolation');

class Image{
    constructor(size=[500, 500], interpScale=4){
        this.size = size;
        this.sizeHD = [size[0] * interpScale, size[1] * interpScale];
        this.interpScale = interpScale;
    }

    static getRandomParams(){
        const iterations = 500 + Math.floor(4500 * Math.random());
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

    static async createRandom(){
        const params = Image.getRandomParams();

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

    async create({speed, damping, iterations, radius}){
        return new Promise(function(resolve, reject){
            let pde = new WaveGrid(this.size, {speed, damping});
            pde.initGaussian(this.size, radius);

            let [data, max] = pde.solve(iterations);
            [data, max] = this.iterpolate(data, this.interpScale);

            let array = pde.toUint8(data.getArray(), max, Image.colormap);

            let image = new Jimp(this.sizeHD[0], this.sizeHD[1], function (err, img) {
                let buffer = img.bitmap.data
                buffer.set(array)
            });

            image.getBase64(Jimp.MIME_PNG, function(err, img){
                if (err !== null) return reject(err);
                else resolve(img);
            });
        }.bind(this));
    }

    iterpolate(data, scale){
        return BilinearInterpolation.interpGrid(data, scale);
    }

    static colormap(value){
        // Map values between 0, 1 to an RGB color
        let h = (value * 360) % 360
        let s = (value * 100) % 100
        let l = (value * 100) % 100
        return Image.hsl2rgb(h, s, l);
    }

    static hsl2rgb(h, s, l){
        // Map HSL color values to RGB
        if (s == 0) return [l, l, l];
        let temp2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let temp1 = 2 * l - temp2;
        h /= 360;
        let rtemp = (h + 1 / 3) % 1,
            gtemp = h,
            btemp = (h + 2 / 3) % 1,
            rgb = [rtemp, gtemp, btemp],
            i = 0;
        for (; i < 3; ++i) rgb[i] = rgb[i] < 1 / 6 ? temp1 + (temp2 - temp1) * 6 * rgb[i] : rgb[i] < 1 / 2 ? temp2 : rgb[i] < 2 / 3 ? temp1 + (temp2 - temp1) * 6 * (2 / 3 - rgb[i]) : temp1;
        return rgb;
    }
}

module.exports = Image;