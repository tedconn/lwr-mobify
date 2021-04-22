/* LDS has proxy compat enabled */

/*
 * Contains general utility functions around types.
 */
class TypeUtils {
    /*
     * Returns true if the provided value is a function, else false.
     * @param value: any - The value with which to determine if it is a function.
     * @return : boolean - See description.
     */
    isFunction(value) {
        const type = typeof value;
        if (type === 'function') {
            return true;
        }
        return false;
    }

    /*
     * Returns true if the given value is a plain object, else false. A plain object has the following properties:
     * 1. Is not null
     * 2. Has a prototype with a constructor that is "Object".
     * @param value: any - The value with which to determine if it is a plain object.
     * @return : boolean - See description.
     */
    isPlainObject(value) {
        const objectProto = value !== null && typeof value === "object" && Object.getPrototypeOf(value);
        return value !== null && typeof value === "object" &&
            ((value.constructor && value.constructor.name === "Object") || (objectProto && objectProto.constructor && objectProto.constructor.name === "Object"));
    }

    /**
     * Checks whether the argument is a valid object
     * A valid object: Is not a DOM element, is not a native browser class (XMLHttpRequest)
     * is not falsey, and is not an array, error, function, string, or number.
     *
     * @param {Object} value The object to check for
     * @returns {Boolean} True if the value is an object and not an array, false otherwise
     */
    isObject(value) {
        return typeof value === "object" && value !== null && !this.isArray(value);
    }

    /**
     * Checks whether the specified object is an array.
     *
     * @param {Object} value The object to check for.
     * @returns {Boolean} True if the object is an array, or false otherwise.
     */
    isArray(value) {
        return Array.isArray(value);
    }

    /**
     * Checks if the object is of type string.
     *
     * @param {Object} value The object to check for.
     * @returns {Boolean} True if the object is of type string, or false otherwise.
     */
    isString(value) {
        return typeof value === 'string';
    }

    /**
     * Checks if the object is of type number.
     *
     * @param {Object} value The object to check for.
     * @returns {Boolean} True if the object is of type number, or false otherwise.
     */
    isNumber(value) {
        return typeof value === 'number';
    }


    /* WARNING: This must be used inside asserts only. If you are using this for class check for custom(non native) classes, then you must use an explicit check along with it.
     * e.g. thenables/Promises can be checked by using .then method
     * Returns true if the given value is an instance of the given type, else false. Unlike the built-in javascript instanceof operator, this
     * function treats cross frame/window instances as the same.
     * @param value: Object - The value with which to determine if it is of the given type.
     * @param type: Function - A constructor function to check the value against.
     * @return : boolean - See description.
     */
    isInstanceOf(value, type) {
        // Do native operation first. If it is true we don't need to do the cross frame algorithm. Adding this check results
        // in significant perf improvement when evaluating to true, and only a small perf decrease when evaluating to false.
        if (value instanceof type) {
            return true;
        }

        // Fallback to cross frame algorithm.
        if (type === null || type === undefined) {
            throw new Error("type must be defined");
        }
        if (!this.isFunction(type)) {
            throw new Error("type must be callable");
        }
        if (typeof type.prototype !== "object" && typeof type.prototype !== "function") {
            throw new Error("type has non-object prototype " + typeof type.prototype);
        }
        if (value === null || (typeof value !== "object" && typeof value !== "function")) {
            return false;
        }

        const prototypeOfValue = Object.getPrototypeOf(value);
        // There may be no prototype if an object is created with Object.create(null).
        if (prototypeOfValue) {
            if (prototypeOfValue.constructor.name === type.name) {
                return true;
            } else if (prototypeOfValue.constructor.name !== "Object") {
                // Recurse down the prototype chain.
                return this.isInstanceOf(prototypeOfValue, type);
            }
        }

        // No match!
        return false;
    }
}

/*
 * The singleton instance of the class.
 */
export const typeUtils = new TypeUtils();