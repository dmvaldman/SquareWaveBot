// A 2-dimensional array backed by a Float64 typed array.

class Grid{
    constructor(size){
        this.Nrows = size[0];
        this.Ncols = size[1];
        this.array = new Float64Array(size[0] * size[1]);
    }

    index(row, col){
        return row * this.Ncols + col;
    }

    set(row, col, val){
        this.array[this.index(row, col)] = val;
    }

    get (row, col){
        return this.array[this.index(row, col)];
    }

    getArray(){
        return this.array;
    }

    setArray(){
        this.array = array;
    }
}

module.exports = Grid;