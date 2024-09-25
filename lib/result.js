
/**
 * @template Left, Right
 */
class Result {
    /** @type {Left?} */
    #left;

    /** @type {Right?} */
    #right;

    /**
     * 
     * @param {Left} left 
     * @param {Right} right 
     */
    constructor(left, right) {
        this.#left = left;
        this.#right = right;
    }

    /**
     * @template {Right}
     * @param {Right} right 
     * @returns {Result<null, Right>}
     */
    static ok(right) {
        return new Result(null, right);
    }
    
    /**
     * @teplate Left
     * @param {Left} left 
     * @returns {Result<Left, null>}
     */
    static error(left) {
        return new Result(left, null);
    }

    isError() {
        return this.#left !== null;
    }

    isOk() {
        return this.#right !== null;
    }

    /**
     * 
     * @returns {Right}
     */
    getRight() {
        return this.#right;
    }
    
    /**
     * 
     * @returns {Left}
     */
    getLeft() {
        return this.#left;
    }
}


module.exports = Result;
