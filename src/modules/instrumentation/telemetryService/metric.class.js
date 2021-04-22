import { isProdMode } from "./isProdMode";

/* proxy-compat-disable */
/**
 * Metric is base class for all Metric Types and contains shared methods.
 */
export class Metric {
    static OWNER = 'owner';
    static NAME = 'name';
    static TYPE = 'type';
    static TIMESTAMP = 'ts';
    static VALUE = 'value';
    static NAME_DELIMITER = '.';

    static TYPE_COUNTER = 'Counter';
    static TYPE_GAUGE = 'Gauge';
    static TYPE_PERCENTILE_HISTOGRAM = 'PercentileHistogram';
    static TYPE_TIMER = 'Timer';

    constructor(metricsKey, type) {
        this.metricsKey = metricsKey;
        this.type = type;
        this.ts = -1;
    }

    updateTs(ts) {
        const tsValue = ts || Date.now();
        this.ts = tsValue;
    }

    isUpdated(sinceTs) {
        return this.ts > sinceTs;
    }

    reset() {
        this.updateTs(-1);
    }

    isValid(value) {
        if (!(typeof value == "number" && value >= 0)) {
            if (!isProdMode()) {
                throw new Error(value + " is not valid metric value. Please provide non-negative number for metric value.");
            }
            return false;
        }
        return true;
    }

    get() {
        const data = this.metricsKey.get();
        data[Metric.TYPE] = this.type;
        data[Metric.TIMESTAMP] = this.ts;
        return data;
    }
}