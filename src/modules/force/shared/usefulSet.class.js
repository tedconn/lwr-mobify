/* LDS has proxy compat enabled */

export class UsefulSet {
    constructor() {
        if (Object.getPrototypeOf(this).constructor !== UsefulSet) {
            throw new Error("UsefulSet is final and cannot be extended.");
        }

        Object.defineProperties(this, {
            delegateSet: {
                value   : new Set(...arguments),
                writable: false
            }
        });
    }

    // Implement core Set methods
    get size() {
        return this.delegateSet.size;
    }

    add() {
        this.delegateSet.add(...arguments);

        return this; // chainable method
    }

    clear() {
        this.delegateSet.clear(...arguments);
    }

    delete() {
        return this.delegateSet.delete(...arguments);
    }

    entries() {
        return this.delegateSet.entries(...arguments);
    }

    forEach() {
        this.delegateSet.forEach(...arguments);
    }

    has() {
        return this.delegateSet.has(...arguments);
    }

    values() {
        return this.delegateSet.values(...arguments);
    }

    [Symbol.iterator]() { // Be iterable like the stock Set.
        return this.delegateSet.values();
    }

    // Implement extension methods to Set that make it more useful.

    /**
     * Check whether this set contains all specified values.
     * @param {Iterable} values - Iterable of values to see whether the set contains.
     * @return {boolean} true if set contains all values, else false
     */
    containsAll(values) {
        // TODO: use for...of w/ break once polyfill for it is supported.
        let containsAll = true;
        values.forEach((value) => {
            if (!containsAll) {
                return;
            }

            if (!this.has(value)) {
                containsAll = false;
            }
        });

        return containsAll;
    }

    /**
     * Add all values to a this Set.
     * @param {Iterable} values - Iterable of values to add to set.
     * @returns {Object} this UsefulSet for chaining calls, like with add().
     */
    addAll(values) {
        values.forEach((value) => {
            this.add(value);
        });

        return this;
    }

    /*
     * Return a new UsefulSet that contains all the values of this set combined with the values from the other set.
     * @param values: Iterable<?> - A collection of values to union with this set.
     * @returns UsefulSet<?> - A set of the values in this set that aren't also in the other set.
     */
    union(values) {
        const union = new UsefulSet(this);
        values.forEach(value => {
            union.add(value);
        });

        return union;
    }

    /**
     * Return any values in this set that aren't also in the other set.
     * @param {Iterable} values - Iterable of a collection of values to difference against this set.
     * @returns {Set} a set of the values in this set that aren't also in the other set.
     */
    difference(values) {
        const difference = new UsefulSet(this);
        values.forEach((value) => {
            difference.delete(value);
        });

        return difference;
    }
}