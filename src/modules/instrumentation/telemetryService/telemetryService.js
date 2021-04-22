import { Counter } from "./counter.class.js";
import { Gauge } from "./gauge.class.js";
import { Timer } from "./timer.class.js";
import { NoopMetric } from "./noopMetric.class.js";
import { PercentileHistogram } from "./percentileHistogram.class.js";

/* proxy-compat-disable */

const metrics = [];
let telemetryEnabled = true;

export function counter(metricsKey) {
    return createMetric(() => {
        return new Counter(metricsKey);
    });
}

export function gauge(metricsKey) {
    return createMetric(() => {
        return new Gauge(metricsKey);
    });
}

export function timer(metricsKey) {
    return createMetric(() => {
        return new Timer(metricsKey);
    });
}

export function percentileHistogram(metricsKey) {
    return createMetric(() => {
        return new PercentileHistogram(metricsKey);
    });
}

export function getUpdatedMetrics(updateSinceTs) {
    const allMetrics = [];
    metrics.forEach((metric) => {
        if (metric.isUpdated(updateSinceTs || -1)) {
            allMetrics.push(metric.get());
            metric.reset();
        }
    });
    return allMetrics;
}

export function setEnabled(enabled) {
    telemetryEnabled = enabled;
}

function createMetric(supplier) {
    if (!telemetryEnabled) {
        return new NoopMetric();
    }
    const metric = supplier();
    metrics.push(metric);
    return metric;
}
