import { Metric } from "./metric.class.js";

/* proxy-compat-disable */

/**
 * Gauge is an instantaneous measurement of a value. For eg. current size of a queue.
 */
export class Gauge extends Metric {
    constructor(metricsKey) {
        super(metricsKey, Metric.TYPE_GAUGE);
        this.value = 0;
    }

    setValue(value) {
        if (super.isValid(value)) {
            this.value = Math.round(value);
            super.updateTs();
        }
    }

    getValue() {
        return this.value;
    }

    reset() {
        super.reset();
        this.value = 0;
    }

    get() {
        const data = super.get();
        data[Metric.VALUE] = this.value;
        return data;
    }
}