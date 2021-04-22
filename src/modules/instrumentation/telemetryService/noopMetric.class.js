import { Metric } from "./metric.class.js";

/* proxy-compat-disable */

/**
 * Represents a Noop Metric. It is used when telemetry is disabled.
 *
 */
export class NoopMetric extends Metric {
    increment() { }

    decrement() { }

    setValue() { }

    update() { }

    addDuration() { }

    time() { }

    get() {
        return {};
    }
}