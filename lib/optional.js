/**
 * @template Value
 */
class Optional {
    /** @type {Value?} */
    #value;

    /**
     * 
     * @param {Value?} value 
     */
    constructor(value) {
        this.#value = value;
    }

    /**
     * @template Value
     * @param {Value} value 
     * @returns {Optional<Value>}
     */
    static some(value) {
        return new Optional(value);
    }

    /**
     * @returns {Optional<null>}
     */
    static empty() {
        return new Optional(null);
    }

    /**
     * 
     * @returns {boolean}
     */
    isEmpty() {
        return this.#value === null;
    }

    /**
     * 
     * @returns {boolean}
     */
    isSome() {
        return this.#value !== null;
    }

    /**
     * 
     * @returns {Value}
     */
    unwrap() {
        return this.#value;
    }
}

module.exports = Optional;
