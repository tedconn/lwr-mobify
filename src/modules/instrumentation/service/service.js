export {
    perfStart,
    perfEnd,
    mark,
    markStart,
    markEnd,
    time,
    interaction,
    registerCacheStats,
    error,
    registerPeriodicLogger,
    removePeriodicLogger,
    registerPlugin,
    enablePlugin,
    disablePlugin
} from "aura-instrumentation";

export { counter, gauge, percentileHistogram, timer } from "instrumentation/telemetryService";