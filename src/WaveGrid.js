// Solver for the wave equation.
let Grid = require('./Grid');

class WaveGrid {
    constructor(size, {speed, damping}) {
        this.speed = speed;
        this.damping = damping;
        this.size = size;

        this.u = new Grid(size);
        this.uOld = new Grid(size);
        this.uNew = new Grid(size);

        this.dt = 1;
    }

    setIC(pos, vel) {
        // Set initial conditions.
        let w = this.size[0];
        let h = this.size[1];
        let dt = this.dt;
        let u = this.u;
        let uOld = this.uOld;

        if (pos instanceof Function){
            for (let i = 0; i < w; i++){
                for (let j = 0; j < h; j++){
                    u.set(i,j,pos(i,j));
                    uOld.set(i,j, pos(i,j) - dt * vel(i,j));
                };
            };
        }
        else if (pos.length){
            u.setArray(pos);
            uOld.setArray(pos);
        }
    }

    initGaussian(size, radius){
        // Initialize with a Gaussian.
        function pos(i, j){
            let x = j - size[1] / 2;
            let y = i - size[0] / 2;
            let dist2 = x * x + y * y;
            let scale = 1;
            return scale * Math.exp(-dist2 / radius);
        }

        function vel(i, j){
            return 0;
        }

        this.setIC(pos, vel);
    }

    centeredX(i, j){
        // Symmetric difference scheme for finite differences in the x-axis.
        let u = this.u;
        let w = this.size[0];

        if (i == 0)
            return u.get(i + 1, j) - 2 * u.get(i, j);
        else if (i == w - 1)
            return -2 * u.get(i, j) + u.get(i - 1, j);
        else
            return u.get(i + 1, j) - 2 * u.get(i, j) + u.get(i - 1, j);
    }

    centeredY(i, j){
        // Symmetric difference scheme for finite differences in the y-axis.
        let u = this.u;
        let h = this.size[1];

        if (j == 0)
            return  u.get(i, j + 1) - 2 * u.get(i, j);
        else if (j == h - 1)
            return -2 * u.get(i, j) + u.get(i, j - 1);
        else
            return u.get(i, j + 1) - 2 * u.get(i, j) + u.get(i, j - 1);
    }

    // Convert solution to Uint8ClampedArray for drawing.
    toUint8(array, max, colormap){
        let data = new Uint8ClampedArray(4 * array.length);

        for (let i = 0; i < array.length; i++){
            let val = array[i];
            let color = colormap(val / max);
            data[4 * i + 0] = color[0];
            data[4 * i + 1] = color[1];
            data[4 * i + 2] = color[2];
            data[4 * i + 3] = 255;
        }

        return data;
    }

    update(){
        // Iterate the PDE solver one step.
        let u = this.u;
        let uOld = this.uOld;
        let uNew = this.uNew;
        let c = this.speed;
        let w = this.size[0];
        let h = this.size[1];
        let dt = this.dt;
        let dtc2 = (dt * c) * (dt * c);
        let k = this.damping;

        const mult = 1 / (1 + k * dt);
        let max = -Infinity;

        // Exploit 4-fold symmetry by only computing 1/4 of the points
        const w_max = Math.floor(w / 2) + 1;
        const h_max = Math.floor(h / 2) + 1;
        for (let i = 0; i < w_max; i++){
            for (let j = 0; j < h_max; j++){
                let val = mult * ( (2 + k * dt) * u.get(i, j) - uOld.get(i, j) +
                    dtc2 * ( this.centeredX(i, j) + this.centeredY(i, j)) );

                if (val > max) max = val;

                uNew.set(i + 0, j + 0, val);
                uNew.set(i + 0, h - j, val);
                uNew.set(w - i, j + 0, val);
                uNew.set(w - i, h - j, val);
            }
        }

        uOld.getArray().set(u.getArray());
        u.getArray().set(uNew.getArray());

        return [u, max];
    }

    solve(iterations){
        // Iterate the PDE solver one many steps.
        for (let i = 0; i < iterations - 1; i++)
            this.update();
        return this.update();
    }
}

module.exports = WaveGrid;
