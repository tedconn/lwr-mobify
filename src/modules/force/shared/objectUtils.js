import { typeUtils } from "./typeUtils.class.js";

export class ObjectUtils {
    /**
     * Deep clone a plain JS object with only direct properties (and non-symbol properties)
     * NOTE: This will not clone nested arrays, nor will it preserve an object's type
     *
     * @static
     * @param {object} obj The object to deeply clone
     * @returns {object} The object's clone
     * @memberof ObjectUtils
     */
    static deepCloneObject(obj) {
        return Object.getOwnPropertyNames(obj).reduce((acc, key) => {
            const val = obj[key];
            if (typeUtils.isObject(val)) {
                acc[key] = this.deepCloneObject(val);
            } else {
                acc[key] = val;
            }
            return acc;
        }, {});
    }
}
