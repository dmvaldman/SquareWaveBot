let Grid = require('./Grid');

class BilinearInterpolation {
    static interpQuad(tl, tr, bl, br, x, y){
        let interpXTop = tr * x + tl * (1 - x);
        let interpXBot = br * x + bl * (1 - x);
        return interpXBot * y + interpXTop * (1 - y);
    }

    static interpGrid(grid, scale){
        const Nrows = grid.Nrows;
        const Ncols = grid.Ncols;
        const sizeHD = [Nrows * scale, Ncols * scale];

        let gridHD = new Grid(sizeHD)

        let max = -Infinity
        for (let row = 0; row < Nrows - 1; row++){
            let HDrow = row * scale;
            for (let col = 0; col < Ncols - 1; col++){
                let HDcol = col * scale;

                let tl = grid.get(row + 0, col + 0),
                    tr = grid.get(row + 0, col + 1),
                    bl = grid.get(row + 1, col + 0),
                    br = grid.get(row + 1, col + 1);

                //interior interpolated points
                for (let i = 1; i <= scale; i++){
                    let dx = i / (scale + 1);
                    for (let j = 1; j <= scale; j++){
                        let dy = j / (scale + 1);
                        let interp = BilinearInterpolation.interpQuad(tl, tr, bl, br, dx, dy);
                        if (interp > max) max = interp
                        gridHD.set(HDrow + j, HDcol + i, interp);
                    };
                };

                //corners
                gridHD.set(HDrow,         HDcol,         tl);
                gridHD.set(HDrow + scale + 1, HDcol,         bl);
                gridHD.set(HDrow,         HDcol + scale + 1, tr);
                gridHD.set(HDrow + scale + 1, HDcol + scale + 1, br);
            }
        }

        return [gridHD, max];
    }
}

module.exports = BilinearInterpolation