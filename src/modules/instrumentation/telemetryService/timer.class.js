import { Metric } from "./metric.class.js";
import { PercentileHistogram } from "./percentileHistogram.class.js";

/* proxy-compat-disable */

/**
 * Timer provides easy way to track execution time of block of code.
 */
export class Timer extends Metric {
    constructor(metricsKey) {
        super(metricsKey, Metric.TYPE_TIMER);
        this.histogram = new PercentileHistogram(metricsKey);
    }

    addDuration(valueInMs) {
        if (super.isValid(valueInMs)) {
            this.histogram.update(valueInMs);
            super.updateTs();
        }
    }

    time(callback) {
        const startTime = Date.now();
        try {
            return callback();
        } finally {
            this.addDuration(Date.now() - startTime);
        }
    }
    getValue() {
        return this.histogram.getValue();
    }

    reset() {
        super.reset();
        this.histogram.reset();
    }

    get() {
        return this.histogram.get();
    }
}