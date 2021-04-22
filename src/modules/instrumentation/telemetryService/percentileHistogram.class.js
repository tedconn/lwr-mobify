import { Metric } from "./metric.class.js";

/* proxy-compat-disable */

/**
 * PercentileHistogram will calculate the min, mean, max, and also quantiles (http://en.wikipedia.org/wiki/Quantile) like the median or 95th percentile.
 */
export class PercentileHistogram extends Metric {
    constructor(metricsKey) {
        super(metricsKey, Metric.TYPE_PERCENTILE_HISTOGRAM);
        this.values = [];
    }

    update(value) {
        if (super.isValid(value)) {
            this.values.push(Math.round(value));
            super.updateTs();
        }
    }

    getValue() {
        return this.values;
    }

    reset() {
        super.reset();
        this.values = [];
    }

    get() {
        const data = super.get();
        data[Metric.VALUE] = this.values;
        return data;
    }
}