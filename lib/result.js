
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

    /**
     * @template RightPrime
     * @param {(value: Right) => RightPrime} callback 
     * @returns {Result<Left, RightPrime>}
     */
    then(callback) {
        if (this.isOk()) {
            const value = this.getRight();
            const newValue = callback(value);
            return Result.ok(newValue);
        }
        return this;
    }

    /**
     * @template RightPrime
     * @param {async (value: Right) => RightPrime} callback 
     * @returns {Promise<Result<Left, RightPrime>>}
     */
    async asyncThen(callback) {
        if (this.isOk()) {
            const value = this.getRight();
            return callback(value)
                .then(result => Result.ok(result))
                .catch(reason => Result.error(reason))
            ;
        }
        return this;
    }
}


module.exports = Result;
