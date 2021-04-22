import { Metric } from "./metric.class.js";
import { isProdMode } from "./isProdMode";

/* proxy-compat-disable */

/**
 * A counter is a simple incrementing and decrementing metric.
 */
export class Counter extends Metric {
    constructor(metricsKey) {
        super(metricsKey, Metric.TYPE_COUNTER);
        this.count = 0;
    }

    increment(delta) {
        const value = delta || ((delta === 0) ? 0 : 1);
        if (super.isValid(value)) {
            this.count += Math.round(value);
            super.updateTs();
        }
    }

    decrement(delta) {
        const value = delta === undefined ? 1 : Math.round(delta);
        const updatedCount = this.count - value;
        if (super.isValid(value) && updatedCount >= 0) {
            this.count = updatedCount;
            super.updateTs();
        } else if (!isProdMode()) {
            throw new Error("Counter cannot be decreased below 0");
        }
    }

    reset() {
        super.reset();
        this.count = 0;
    }

    getValue() {
        return this.count;
    }

    get() {
        const data = super.get();
        data[Metric.VALUE] = this.count;
        return data;
    }
}