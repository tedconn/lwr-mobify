/*  *******************************************************************************************
 *  ATTENTION!
 *  THIS IS A GENERATED FILE FROM https://github.com/salesforce/lds-lightning-platform
 *  If you would like to contribute to LDS, please follow the steps outlined in the git repo.
 *  Any changes made to this file in p4 will be automatically overwritten.
 *  *******************************************************************************************
 */
/* proxy-compat-disable */
import 'lwc';
import { percentileHistogram, counter, registerCacheStats, timer, perfStart, perfEnd, registerPeriodicLogger, interaction, mark as mark$1, registerPlugin, time, markStart, markEnd } from 'instrumentation/service';

// Copied from engine to avoid build time dependency
// BEGIN OF COPY BLOCK
var SnapshotState;
(function (SnapshotState) {
    SnapshotState["Fulfilled"] = "Fulfilled";
    SnapshotState["Unfulfilled"] = "Unfulfilled";
    SnapshotState["Error"] = "Error";
    SnapshotState["Pending"] = "Pending";
    SnapshotState["Stale"] = "Stale";
})(SnapshotState || (SnapshotState = {}));
// instrumentation keys to be imported by ldsInstrumentation
const REFRESH_ADAPTER_EVENT = 'refresh-adapter-event';
const ADAPTER_UNFULFILLED_ERROR = 'adapter-unfulfilled-error';

const ADAPTER_CACHE_HIT_COUNT_METRIC_NAME = 'cache-hit-count';
const ADAPTER_CACHE_HIT_DURATION_METRIC_NAME = 'cache-hit-duration';
const ADAPTER_CACHE_MISS_COUNT_METRIC_NAME = 'cache-miss-count';
const ADAPTER_CACHE_MISS_DURATION_METRIC_NAME = 'cache-miss-duration';
const ADAPTER_CACHE_MISS_OUT_OF_TTL_COUNT_METRIC_NAME = 'cache-miss-out-of-ttl-count';
const ADAPTER_CACHE_MISS_OUT_OF_TTL_DURATION_METRIC_NAME = 'cache-miss-out-of-ttl-duration';
const METRIC_KEY_OWNER = 'lds';
/**
 * Note: This implementation of Metric Keys is a workaround due to @salesforce imports not currently working within LDS context.
 * To be changed in the future if that is fixed. Approved by @relango from Instrumentation team.
 */
/**
 * W-8121791
 * Number of subqueries used when aggregateUi is invoked for getRecord
 */
const AGGREGATE_UI_CHUNK_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'aggregate-ui-chunk-count' };
    },
};
/**
 * W-6981216
 * Counter for overall LDS cache hits.
 * Note: This is also being recorded in AILTN logging.
 */
const CACHE_HIT_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: ADAPTER_CACHE_HIT_COUNT_METRIC_NAME };
    },
};
/**
 * W-6981216
 * Counter for overall LDS cache hits.
 * Note: This is also being recorded in AILTN logging.
 */
const CACHE_MISS_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: ADAPTER_CACHE_MISS_COUNT_METRIC_NAME };
    },
};
/**
 * W-8379680
 * Counter for number of getApex requests.
 */
const GET_APEX_CACHE_HIT_COUNT = {
    get() {
        return {
            owner: METRIC_KEY_OWNER,
            name: ADAPTER_CACHE_HIT_COUNT_METRIC_NAME + '.' + NORMALIZED_APEX_ADAPTER_NAME,
        };
    },
};
/**
 * W-8379680
 * Counter for number of getApex errors.
 */
const GET_APEX_CACHE_HIT_DURATION = {
    get() {
        return {
            owner: METRIC_KEY_OWNER,
            name: ADAPTER_CACHE_HIT_DURATION_METRIC_NAME + '.' + NORMALIZED_APEX_ADAPTER_NAME,
        };
    },
};
/**
 * W-8379680
 * Counter for number of getApex cache misses.
 */
const GET_APEX_CACHE_MISS_COUNT = {
    get() {
        return {
            owner: METRIC_KEY_OWNER,
            name: ADAPTER_CACHE_MISS_COUNT_METRIC_NAME + '.' + NORMALIZED_APEX_ADAPTER_NAME,
        };
    },
};
/**
 * W-8379680
 * Timer for duration of getApex cache misses.
 */
const GET_APEX_CACHE_MISS_DURATION = {
    get() {
        return {
            owner: METRIC_KEY_OWNER,
            name: ADAPTER_CACHE_MISS_DURATION_METRIC_NAME + '.' + NORMALIZED_APEX_ADAPTER_NAME,
        };
    },
};
/**
 * W-7667066
 * This count represents the number of times getRecord() was invoked, but not including
 * executeAggregateUi calls.  It can be represented as the sum of the Aura Action invocations
 * GetRecordWithLayouts and GetRecordWithFields.
 */
const GET_RECORD_NORMAL_INVOKE_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'get-record-normal-invoke-count' };
    },
};
/**
 * W-7667066
 * This count represents the number of times getRecord() was invoked, with a large enough payload
 * that executeAggregateUi was used.
 */
const GET_RECORD_AGGREGATE_INVOKE_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'get-record-aggregate-invoke-count' };
    },
};
/**
 * W-7301684
 * Counter for when getRecordNotifyChange api calls are allowed through.
 */
const GET_RECORD_NOTIFY_CHANGE_ALLOW_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'get-record-notify-change-allow-count' };
    },
};
/**
 * W-7301684
 * Counter for when getRecordNotifyChange api calls are dropped/throttled.
 */
const GET_RECORD_NOTIFY_CHANGE_DROP_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'get-record-notify-change-drop-count' };
    },
};
/**
 * W-8278006
 * Counter for rate limiting telemetry. Is updated whenever the network adapter hits the specified limit.
 */
const NETWORK_RATE_LIMIT_EXCEEDED_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'network-rate-limit-exceeded-count' };
    },
};
/**
 * W-6981216
 * Timer to measure performance for LDS.storeBroadcast() method.
 */
const STORE_BROADCAST_DURATION = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'store-broadcast-duration' };
    },
};
/**
 * W-6981216
 * Timer to measure performance for LDS.storeIngest() method.
 */
const STORE_INGEST_DURATION = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'store-ingest-duration' };
    },
};
/**
 * W-6981216
 * Timer to measure performance for LDS.storeLookup() method.
 */
const STORE_LOOKUP_DURATION = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'store-lookup-duration' };
    },
};
/**
 * W-6981216
 * Counter for number of records in LDS store. Is updated by periodicLogger invocations.
 * Note: This is also being recorded in AILTN logging.
 */
const STORE_SIZE_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'store-size-count' };
    },
};
/**
 * W-6981216
 * Counter for number of LDS snapshot subscription. Is updated by periodicLogger invocations.
 * Note: This is also being recorded in AILTN logging.
 */
const STORE_SNAPSHOT_SUBSCRIPTIONS_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'store-snapshot-subscriptions-count' };
    },
};
/**
 * W-6981216
 * Counter for number of LDS watch subscriptions. Is updated by periodicLogger invocations.
 * Note: This is also being recorded in AILTN logging.
 */
const STORE_WATCH_SUBSCRIPTIONS_COUNT = {
    get() {
        return { owner: METRIC_KEY_OWNER, name: 'store-watch-subscriptions-count' };
    },
};

/**
 * Observability / Critical Availability Program (230+)
 *
 * This file is intended to be used as a consolidated place for all definitions, functions,
 * and helpers related to "M1"[1].
 *
 * Below are the R.E.A.D.S. metrics for the Lightning Data Service, defined here[2].
 *
 * [1] https://salesforce.quip.com/NfW9AsbGEaTY
 * [2] https://salesforce.quip.com/1dFvAba1b0eq
 */
const OBSERVABILITY_NAMESPACE = 'LIGHTNING.lds.service';
const ADAPTER_INVOCATION_COUNT_METRIC_NAME = 'request';
const ADAPTER_ERROR_COUNT_METRIC_NAME = 'error';
/**
 * W-8379680
 * Counter for number of getApex requests.
 */
const GET_APEX_REQUEST_COUNT = {
    get() {
        return {
            owner: OBSERVABILITY_NAMESPACE,
            name: ADAPTER_INVOCATION_COUNT_METRIC_NAME + '.' + NORMALIZED_APEX_ADAPTER_NAME,
        };
    },
};
/**
 * W-8828410
 * Counter for the number of UnfulfilledSnapshotErrors the luvio engine has.
 */
const TOTAL_ADAPTER_ERROR_COUNT = {
    get() {
        return { owner: OBSERVABILITY_NAMESPACE, name: ADAPTER_ERROR_COUNT_METRIC_NAME };
    },
};
/**
 * W-8828410
 * Counter for the number of invocations made into LDS by a wire adapter.
 */
const TOTAL_ADAPTER_REQUEST_SUCCESS_COUNT = {
    get() {
        return { owner: OBSERVABILITY_NAMESPACE, name: ADAPTER_INVOCATION_COUNT_METRIC_NAME };
    },
};

const { keys } = Object;
const { isArray } = Array;
const { stringify } = JSON;

/**
 * Inspired by https://www.npmjs.com/package/hashlru
 */
class LRUCache {
    constructor(limit) {
        this.oldCache = new Map();
        this.newCache = new Map();
        this.size = 0;
        this.limit = limit;
    }
    checkSize() {
        if (this.size >= this.limit) {
            this.size = 0;
            this.oldCache = this.newCache;
            this.newCache = new Map();
        }
    }
    get(key) {
        if (this.newCache.has(key)) {
            return this.newCache.get(key);
        }
        else if (this.oldCache.has(key)) {
            const value = this.oldCache.get(key);
            this.oldCache.delete(key);
            this.newCache.set(key, value);
            this.size += 1;
            this.checkSize();
            return value;
        }
        return undefined;
    }
    set(key, value) {
        if (this.newCache.has(key)) {
            this.newCache.set(key, value);
        }
        else {
            this.newCache.set(key, value);
            this.size += 1;
            this.checkSize();
        }
    }
}

/**
 * A deterministic JSON stringify implementation. Heavily adapted from https://github.com/epoberezkin/fast-json-stable-stringify.
 * This is needed because insertion order for JSON.stringify(object) affects output:
 * JSON.stringify({a: 1, b: 2})
 *      "{"a":1,"b":2}"
 * JSON.stringify({b: 2, a: 1})
 *      "{"b":2,"a":1}"
 * Modified from the apex implementation to sort arrays non-destructively.
 * @param data Data to be JSON-stringified.
 * @returns JSON.stringified value with consistent ordering of keys.
 */
function stableJSONStringify(node) {
    // This is for Date values.
    if (node && node.toJSON && typeof node.toJSON === 'function') {
        // eslint-disable-next-line no-param-reassign
        node = node.toJSON();
    }
    if (node === undefined) {
        return;
    }
    if (typeof node === 'number') {
        return isFinite(node) ? '' + node : 'null';
    }
    if (typeof node !== 'object') {
        return stringify(node);
    }
    let i;
    let out;
    if (isArray(node)) {
        // copy any array before sorting so we don't mutate the object.
        // eslint-disable-next-line no-param-reassign
        node = node.slice(0).sort();
        out = '[';
        for (i = 0; i < node.length; i++) {
            if (i) {
                out += ',';
            }
            out += stableJSONStringify(node[i]) || 'null';
        }
        return out + ']';
    }
    if (node === null) {
        return 'null';
    }
    const keys$1 = keys(node).sort();
    out = '';
    for (i = 0; i < keys$1.length; i++) {
        const key = keys$1[i];
        const value = stableJSONStringify(node[key]);
        if (!value) {
            continue;
        }
        if (out) {
            out += ',';
        }
        out += stringify(key) + ':' + value;
    }
    return '{' + out + '}';
}

const RECORD_API_NAME_CHANGE_EVENT = 'record-api-name-change-event';
const APEX_ADAPTER_NAME = 'getApex';
const NORMALIZED_APEX_ADAPTER_NAME = `Apex.${APEX_ADAPTER_NAME}`;
const REFRESH_APEX_KEY = 'refreshApex';
const REFRESH_UIAPI_KEY = 'refreshUiApi';
const SUPPORTED_KEY = 'refreshSupported';
const UNSUPPORTED_KEY = 'refreshUnsupported';
const REFRESH_EVENTSOURCE = 'lds-refresh-summary';
const REFRESH_EVENTTYPE = 'system';
const REFRESH_PAYLOAD_TARGET = 'adapters';
const REFRESH_PAYLOAD_SCOPE = 'lds';
const REFRESH_API_CALL_EVENT = 'refresh-api-call-event';
const INCOMING_WEAKETAG_0_KEY = 'incoming-weaketag-0';
const EXISTING_WEAKETAG_0_KEY = 'existing-weaketag-0';
const NAMESPACE = 'lds';
const STORE_STATS_MARK_NAME = 'store-stats';
const RUNTIME_PERF_MARK_NAME = 'runtime-perf';
const NETWORK_TRANSACTION_NAME = 'lds-network';
const CACHE_STATS_OUT_OF_TTL_MISS_POSTFIX = 'out-of-ttl-miss';
const RECORD_API_NAME_CHANGE_COUNT_METRIC_NAME = 'record-api-name-change-count';
const aggregateUiChunkCountMetric = percentileHistogram(AGGREGATE_UI_CHUNK_COUNT);
const cacheHitMetric = counter(CACHE_HIT_COUNT);
const cacheMissMetric = counter(CACHE_MISS_COUNT);
const getRecordAggregateInvokeMetric = counter(GET_RECORD_AGGREGATE_INVOKE_COUNT);
const getRecordNormalInvokeMetric = counter(GET_RECORD_NORMAL_INVOKE_COUNT);
const getRecordNotifyChangeAllowMetric = counter(GET_RECORD_NOTIFY_CHANGE_ALLOW_COUNT);
const getRecordNotifyChangeDropMetric = counter(GET_RECORD_NOTIFY_CHANGE_DROP_COUNT);
const networkRateLimitExceededCountMetric = counter(NETWORK_RATE_LIMIT_EXCEEDED_COUNT);
const storeSizeMetric = percentileHistogram(STORE_SIZE_COUNT);
const storeWatchSubscriptionsMetric = percentileHistogram(STORE_WATCH_SUBSCRIPTIONS_COUNT);
const storeSnapshotSubscriptionsMetric = percentileHistogram(STORE_SNAPSHOT_SUBSCRIPTIONS_COUNT);
// Aggregate Cache Stats and Metrics for all getApex invocations
const getApexCacheStats = registerLdsCacheStats(NORMALIZED_APEX_ADAPTER_NAME);
const getApexTtlCacheStats = registerLdsCacheStats(NORMALIZED_APEX_ADAPTER_NAME + ':' + CACHE_STATS_OUT_OF_TTL_MISS_POSTFIX);
const getApexRequestCountMetric = counter(GET_APEX_REQUEST_COUNT);
const getApexCacheHitCountMetric = counter(GET_APEX_CACHE_HIT_COUNT);
const getApexCacheHitDurationMetric = timer(GET_APEX_CACHE_HIT_DURATION);
const getApexCacheMissCountMetric = counter(GET_APEX_CACHE_MISS_COUNT);
const getApexCacheMissDurationMetric = timer(GET_APEX_CACHE_MISS_DURATION);
const totalAdapterRequestSuccessMetric = counter(TOTAL_ADAPTER_REQUEST_SUCCESS_COUNT);
const totalAdapterErrorMetric = counter(TOTAL_ADAPTER_ERROR_COUNT);
class Instrumentation {
    constructor() {
        this.recordApiNameChangeCounters = {};
        this.adapterUnfulfilledErrorCounters = {};
        this.refreshAdapterEvents = {};
        this.refreshApiCallEventStats = {
            [REFRESH_APEX_KEY]: 0,
            [REFRESH_UIAPI_KEY]: 0,
            [SUPPORTED_KEY]: 0,
            [UNSUPPORTED_KEY]: 0,
        };
        this.lastRefreshApiCall = null;
        this.weakEtagZeroEvents = {};
        this.adapterCacheMisses = new LRUCache(250);
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('beforeunload', () => {
                if (keys(this.weakEtagZeroEvents).length > 0) {
                    perfStart(NETWORK_TRANSACTION_NAME);
                    perfEnd(NETWORK_TRANSACTION_NAME, this.weakEtagZeroEvents);
                }
            });
        }
        registerPeriodicLogger(NAMESPACE, this.logRefreshStats.bind(this));
    }
    /**
     * Instruments an existing adapter to log argus metrics and cache stats.
     * @param adapter The adapter function.
     * @param metadata The adapter metadata.
     * @param wireConfigKeyFn Optional function to transform wire configs to a unique key.
     * @returns The wrapped adapter.
     */
    instrumentAdapter(adapter, metadata) {
        // We are consolidating all apex adapter instrumentation calls under a single key
        const { apiFamily, name, ttl } = metadata;
        const adapterName = normalizeAdapterName(name, apiFamily);
        const isGetApexAdapter = isApexAdapter(name);
        const stats = isGetApexAdapter ? getApexCacheStats : registerLdsCacheStats(adapterName);
        const ttlMissStats = isGetApexAdapter
            ? getApexTtlCacheStats
            : registerLdsCacheStats(adapterName + ':' + CACHE_STATS_OUT_OF_TTL_MISS_POSTFIX);
        /**
         * W-8076905
         * Dynamically generated metric. Simple counter for all requests made by this adapter.
         */
        const wireAdapterRequestMetric = isGetApexAdapter
            ? getApexRequestCountMetric
            : counter(createMetricsKey(OBSERVABILITY_NAMESPACE, ADAPTER_INVOCATION_COUNT_METRIC_NAME, adapterName));
        /**
         * W-6981216
         * Dynamically generated metric. Simple counter for cache hits by adapter name.
         */
        const cacheHitCountByAdapterMetric = isGetApexAdapter
            ? getApexCacheHitCountMetric
            : counter(createMetricsKey(NAMESPACE, ADAPTER_CACHE_HIT_COUNT_METRIC_NAME, adapterName));
        /**
         * W-7404607
         * Dynamically generated metric. Timer for cache hits by adapter name.
         */
        const cacheHitDurationByAdapterMetric = isGetApexAdapter
            ? getApexCacheHitDurationMetric
            : timer(createMetricsKey(NAMESPACE, ADAPTER_CACHE_HIT_DURATION_METRIC_NAME, adapterName));
        /**
         * W-6981216
         * Dynamically generated metric. Simple counter for cache misses by adapter name.
         */
        const cacheMissCountByAdapterMetric = isGetApexAdapter
            ? getApexCacheMissCountMetric
            : counter(createMetricsKey(NAMESPACE, ADAPTER_CACHE_MISS_COUNT_METRIC_NAME, adapterName));
        /**
         * W-7404607
         * Dynamically generated metric. Timer for cache hits by adapter name.
         */
        const cacheMissDurationByAdapterMetric = isGetApexAdapter
            ? getApexCacheMissDurationMetric
            : timer(createMetricsKey(NAMESPACE, ADAPTER_CACHE_MISS_DURATION_METRIC_NAME, adapterName));
        /**
         * W-7376275
         * Dynamically generated metric. Measures the amount of time it takes for LDS to get another cache miss on
         * a request we've made in the past.
         * Request Record 1 -> Record 2 -> Back to Record 1 outside of TTL is an example of when this metric will fire.
         */
        const cacheMissOutOfTtlDurationByAdapterMetric = ttl !== undefined
            ? timer(createMetricsKey(NAMESPACE, ADAPTER_CACHE_MISS_OUT_OF_TTL_DURATION_METRIC_NAME, adapterName))
            : undefined;
        const cacheMissOutOfTtlCountByAdapterMetric = ttl !== undefined
            ? counter(createMetricsKey(NAMESPACE, ADAPTER_CACHE_MISS_OUT_OF_TTL_COUNT_METRIC_NAME, adapterName))
            : undefined;
        const instrumentedAdapter = (config) => {
            const startTime = Date.now();
            this.incrementAdapterRequestMetric(wireAdapterRequestMetric);
            const result = adapter(config);
            // In the case where the adapter returns a Snapshot it is constructed out of the store
            // (cache hit) whereas a Promise<Snapshot> indicates a network request (cache miss).
            //
            // Note: we can't do a plain instanceof check for a promise here since the Promise may
            // originate from another javascript realm (for example: in jest test). Instead we use a
            // duck-typing approach by checking if the result has a then property.
            //
            // For adapters without persistent store:
            //  - total cache hit ratio:
            //      [in-memory cache hit count] / ([in-memory cache hit count] + [in-memory cache miss count])
            // For adapters with persistent store:
            //  - in-memory cache hit ratio:
            //      [in-memory cache hit count] / ([in-memory cache hit count] + [in-memory cache miss count])
            //  - total cache hit ratio:
            //      ([in-memory cache hit count] + [store cache hit count]) / ([in-memory cache hit count] + [in-memory cache miss count])
            // if result === null then config is insufficient/invalid so do not log
            if (result !== null && 'then' in result) {
                result.then((_snapshot) => {
                    timerMetricAddDuration(cacheMissDurationByAdapterMetric, Date.now() - startTime);
                });
                stats.logMisses();
                cacheMissMetric.increment(1);
                cacheMissCountByAdapterMetric.increment(1);
                if (cacheMissOutOfTtlDurationByAdapterMetric !== undefined &&
                    cacheMissOutOfTtlCountByAdapterMetric !== undefined &&
                    ttl !== undefined) {
                    this.logAdapterCacheMissOutOfTtlDuration(adapterName, config, cacheMissOutOfTtlDurationByAdapterMetric, cacheMissOutOfTtlCountByAdapterMetric, ttlMissStats, Date.now(), ttl);
                }
            }
            else if (result !== null) {
                stats.logHits();
                cacheHitMetric.increment(1);
                cacheHitCountByAdapterMetric.increment(1);
                timerMetricAddDuration(cacheHitDurationByAdapterMetric, Date.now() - startTime);
            }
            return result;
        };
        // Set the name property on the function for debugging purposes.
        Object.defineProperty(instrumentedAdapter, 'name', {
            value: name + '__instrumented',
        });
        return instrumentedAdapter;
    }
    incrementAdapterRequestMetric(wireRequestCounter) {
        wireRequestCounter.increment(1);
        totalAdapterRequestSuccessMetric.increment(1);
    }
    /**
     * Logs when adapter requests come in. If we have subsequent cache misses on a given config, beyond its TTL then log the duration to metrics.
     * Backed by an LRU Cache implementation to prevent too many record entries from being stored in-memory.
     * @param name The wire adapter name.
     * @param config The config passed into wire adapter.
     * @param durationMetric The argus timer metric for tracking cache miss durations.
     * @param counterMetric The argus counter metric for tracking cache misses out of TTL.
     * @param ttlMissStats CacheStatsLogger to log misses out of TTL.
     * @param currentCacheMissTimestamp Timestamp for when the request was made.
     * @param ttl TTL for the wire adapter.
     */
    logAdapterCacheMissOutOfTtlDuration(name, config, durationMetric, counterMetric, ttlMissStats, currentCacheMissTimestamp, ttl) {
        const configKey = `${name}:${stableJSONStringify(config)}`;
        const existingCacheMissTimestamp = this.adapterCacheMisses.get(configKey);
        this.adapterCacheMisses.set(configKey, currentCacheMissTimestamp);
        if (existingCacheMissTimestamp !== undefined) {
            const duration = currentCacheMissTimestamp - existingCacheMissTimestamp;
            if (duration > ttl) {
                durationMetric.addDuration(duration);
                counterMetric.increment(1);
                ttlMissStats.logMisses();
            }
        }
    }
    /**
     * Add a network transaction to the metrics service.
     * Injected to LDS for network handling instrumentation.
     *
     * @param context The transaction context.
     */
    instrumentNetwork(context) {
        if (this.isWeakETagEvent(context)) {
            this.aggregateWeakETagEvents(context);
        }
        else if (this.isRefreshAdapterEvent(context)) {
            this.aggregateRefreshAdapterEvents(context);
        }
        else if (this.isRecordApiNameChangeEvent(context)) {
            this.incrementRecordApiNameChangeCount(context);
        }
        else if (this.isRefreshApiEvent(context)) {
            this.handleRefreshApiCall(context);
        }
        else if (this.isAdapterUnfulfilledError(context)) {
            this.incrementAdapterRequestErrorCount(context);
        }
        else {
            perfStart(NETWORK_TRANSACTION_NAME);
            perfEnd(NETWORK_TRANSACTION_NAME, context);
        }
    }
    /**
     * Returns whether or not this is a recordApiNameChangeEvent.
     * @param context The transaction context.
     * @returns Whether or not this is a recordApiNameChangeEvent.
     */
    isRecordApiNameChangeEvent(context) {
        return context[RECORD_API_NAME_CHANGE_EVENT] === true;
    }
    /**
     * Returns whether or not this is a RefreshAdapterEvent.
     * @param context The transaction context.
     * @returns Whether or not this is a RefreshAdapterEvent.
     */
    isRefreshAdapterEvent(context) {
        return context[REFRESH_ADAPTER_EVENT] === true;
    }
    /**
     * Returns whether or not this is an AdapterUnfulfilledError.
     * @param context The transaction context.
     * @returns Whether or not this is an AdapterUnfulfilledError.
     */
    isAdapterUnfulfilledError(context) {
        return context[ADAPTER_UNFULFILLED_ERROR] === true;
    }
    /**
     * Returns whether or not this is a RefreshApiCallEvent.
     * @param context The transaction context.
     * @returns Whether or not this is a RefreshApexEvent.
     */
    isRefreshApiEvent(context) {
        return context[REFRESH_API_CALL_EVENT] === true;
    }
    /**
     * Returns via duck-typing whether or not this is a weakETagZeroEvent.
     * @param context The transaction context.
     * @returns Whether or not this is a weakETagZeroEvent.
     */
    isWeakETagEvent(context) {
        return (typeof context[EXISTING_WEAKETAG_0_KEY] === 'boolean' &&
            typeof context[INCOMING_WEAKETAG_0_KEY] === 'boolean');
    }
    /**
     * Parses and aggregates weakETagZero events to be sent in summarized log line.
     * @param context The transaction context.
     */
    aggregateWeakETagEvents(context) {
        const { apiName } = context;
        const key = 'weaketag-0-' + apiName;
        if (this.weakEtagZeroEvents[key] === undefined) {
            this.weakEtagZeroEvents[key] = {
                [EXISTING_WEAKETAG_0_KEY]: 0,
                [INCOMING_WEAKETAG_0_KEY]: 0,
            };
        }
        if (context[EXISTING_WEAKETAG_0_KEY] !== undefined) {
            this.weakEtagZeroEvents[key][EXISTING_WEAKETAG_0_KEY] += 1;
        }
        if (context[INCOMING_WEAKETAG_0_KEY] !== undefined) {
            this.weakEtagZeroEvents[key][INCOMING_WEAKETAG_0_KEY] += 1;
        }
    }
    /**
     * Aggregates refresh adapter events to be sent in summarized log line.
     *   - how many times refreshApex is called
     *   - how many times refresh from lightning/uiRecordApi is called
     *   - number of supported calls: refreshApex called on apex adapter
     *   - number of unsupported calls: refreshApex on non-apex adapter
     *          + any use of refresh from uiRecordApi module
     *   - count of refresh calls per adapter
     * @param context The refresh adapter event.
     */
    aggregateRefreshAdapterEvents(context) {
        // We are consolidating all apex adapter instrumentation calls under a single key
        // Adding additional logging that getApex adapters can invoke? Read normalizeAdapterName ts-doc.
        const adapterName = normalizeAdapterName(context.adapterName);
        if (this.lastRefreshApiCall === REFRESH_APEX_KEY) {
            if (isApexAdapter(adapterName)) {
                this.refreshApiCallEventStats[SUPPORTED_KEY] += 1;
            }
            else {
                this.refreshApiCallEventStats[UNSUPPORTED_KEY] += 1;
            }
        }
        else if (this.lastRefreshApiCall === REFRESH_UIAPI_KEY) {
            this.refreshApiCallEventStats[UNSUPPORTED_KEY] += 1;
        }
        if (this.refreshAdapterEvents[adapterName] === undefined) {
            this.refreshAdapterEvents[adapterName] = 0;
        }
        this.refreshAdapterEvents[adapterName] += 1;
        this.lastRefreshApiCall = null;
    }
    /**
     * Increments call stat for incoming refresh api call, and sets the name
     * to be used in {@link aggregateRefreshCalls}
     * @param from The name of the refresh function called.
     */
    handleRefreshApiCall(context) {
        const { apiName } = context;
        this.refreshApiCallEventStats[apiName] += 1;
        // set function call to be used with aggregateRefreshCalls
        this.lastRefreshApiCall = apiName;
    }
    /**
     * W-7302241
     * Logs refresh call summary stats as a LightningInteraction.
     */
    logRefreshStats() {
        if (keys(this.refreshAdapterEvents).length > 0) {
            interaction(REFRESH_PAYLOAD_TARGET, REFRESH_PAYLOAD_SCOPE, this.refreshAdapterEvents, REFRESH_EVENTSOURCE, REFRESH_EVENTTYPE, this.refreshApiCallEventStats);
            this.resetRefreshStats();
        }
    }
    /**
     * Resets the stat trackers for refresh call events.
     */
    resetRefreshStats() {
        this.refreshAdapterEvents = {};
        this.refreshApiCallEventStats = {
            [REFRESH_APEX_KEY]: 0,
            [REFRESH_UIAPI_KEY]: 0,
            [SUPPORTED_KEY]: 0,
            [UNSUPPORTED_KEY]: 0,
        };
        this.lastRefreshApiCall = null;
    }
    /**
     * W-7801618
     * Counter for occurrences where the incoming record to be merged has a different apiName.
     * Dynamically generated metric, stored in an {@link RecordApiNameChangeCounters} object.
     *
     * @param context The transaction context.
     *
     * Note: Short-lived metric candidate, remove at the end of 230
     */
    incrementRecordApiNameChangeCount(context) {
        const { existingApiName: apiName } = context;
        let apiNameChangeCounter = this.recordApiNameChangeCounters[apiName];
        if (apiNameChangeCounter === undefined) {
            apiNameChangeCounter = counter(createMetricsKey(NAMESPACE, RECORD_API_NAME_CHANGE_COUNT_METRIC_NAME, apiName));
            this.recordApiNameChangeCounters[apiName] = apiNameChangeCounter;
        }
        apiNameChangeCounter.increment(1);
    }
    /**
     * W-8620679
     * Increment the counter for an UnfulfilledSnapshotError coming from luvio
     *
     * @param context The transaction context.
     */
    incrementAdapterRequestErrorCount(context) {
        // We are consolidating all apex adapter instrumentation calls under a single key
        const adapterName = normalizeAdapterName(context.adapterName);
        let adapterRequestErrorCounter = this.adapterUnfulfilledErrorCounters[adapterName];
        if (adapterRequestErrorCounter === undefined) {
            adapterRequestErrorCounter = counter(createMetricsKey(OBSERVABILITY_NAMESPACE, ADAPTER_ERROR_COUNT_METRIC_NAME, adapterName));
            this.adapterUnfulfilledErrorCounters[adapterName] = adapterRequestErrorCounter;
        }
        adapterRequestErrorCounter.increment(1);
        totalAdapterErrorMetric.increment(1);
    }
}
/**
 * Aura Metrics Service plugin in charge of aggregating all the LDS performance marks before they
 * get sent to the server. All the marks are summed by operation type and the aggregated result
 * is then stored an a new mark.
 */
const markAggregatorPlugin = {
    name: NAMESPACE,
    enabled: true,
    initialize() {
        /* noop */
    },
    postProcess(marks) {
        const postProcessedMarks = [];
        let shouldLogAggregated = false;
        const startTs = {};
        const aggregated = {};
        for (let i = 0, len = marks.length; i < len; i++) {
            const mark = marks[i];
            const { name, phase, ts } = mark;
            if (phase === 'start') {
                startTs[name] = ts;
            }
            else if (phase === 'end') {
                if (aggregated[name] === undefined) {
                    aggregated[name] = 0;
                }
                shouldLogAggregated = true;
                aggregated[name] += ts - startTs[name];
            }
            else {
                postProcessedMarks.push(mark);
            }
        }
        if (shouldLogAggregated) {
            postProcessedMarks.push({
                ns: NAMESPACE,
                name: RUNTIME_PERF_MARK_NAME,
                phase: 'stamp',
                ts: time(),
                context: aggregated,
            });
        }
        return postProcessedMarks;
    },
};
function instrumentMethod(obj, methods) {
    for (let i = 0, len = methods.length; i < len; i++) {
        const method = methods[i];
        const methodName = method.methodName;
        const originalMethod = obj[methodName];
        const methodTimer = timer(method.metricKey);
        obj[methodName] = function (...args) {
            markStart(NAMESPACE, methodName);
            const startTime = Date.now();
            const res = originalMethod.call(this, ...args);
            timerMetricAddDuration(methodTimer, Date.now() - startTime);
            markEnd(NAMESPACE, methodName);
            return res;
        };
    }
}
function createMetricsKey(owner, name, unit) {
    let metricName = name;
    if (unit) {
        metricName = metricName + '.' + unit;
    }
    return {
        get() {
            return { owner: owner, name: metricName };
        },
    };
}
function timerMetricAddDuration(timer, duration) {
    // Guard against negative values since it causes error to be thrown by MetricsService
    if (duration >= 0) {
        timer.addDuration(duration);
    }
}
function getStoreStats(store) {
    const { records, snapshotSubscriptions, watchSubscriptions } = store;
    const recordCount = keys(records).length;
    const snapshotSubscriptionCount = keys(snapshotSubscriptions).length;
    const watchSubscriptionCount = keys(watchSubscriptions).length;
    const subscriptionCount = snapshotSubscriptionCount + watchSubscriptionCount;
    return {
        recordCount,
        subscriptionCount,
        snapshotSubscriptionCount,
        watchSubscriptionCount,
    };
}
/**
 * Returns whether adapter is an Apex one or not.
 * @param adapterName The name of the adapter.
 */
function isApexAdapter(adapterName) {
    return adapterName.indexOf(APEX_ADAPTER_NAME) > -1;
}
/**
 * Normalizes getApex adapter names to `Apex.getApex`. Non-Apex adapters will be prefixed with
 * API family, if supplied. Example: `UiApi.getRecord`.
 *
 * Note: If you are adding additional logging that can come from getApex adapter contexts that provide
 * the full getApex adapter name (i.e. getApex_[namespace]_[class]_[function]_[continuation]),
 * ensure to call this method to normalize all logging to 'getApex'. This
 * is because Argus has a 50k key cardinality limit. More context: W-8379680.
 *
 * @param adapterName The name of the adapter.
 * @param apiFamily The API family of the adapter.
 */
function normalizeAdapterName(adapterName, apiFamily) {
    if (isApexAdapter(adapterName)) {
        return NORMALIZED_APEX_ADAPTER_NAME;
    }
    return apiFamily ? `${apiFamily}.${adapterName}` : adapterName;
}
/**
 * Add a mark to the metrics service.
 *
 * @param name The mark name.
 * @param content The mark content.
 */
function mark(name, content) {
    mark$1(NAMESPACE, name, content);
}
/**
 * Create a new instrumentation cache stats and return it.
 *
 * @param name The cache logger name.
 */
function registerLdsCacheStats(name) {
    return registerCacheStats(`${NAMESPACE}:${name}`);
}
/**
 * Initialize the instrumentation and instrument the LDS instance and the Store.
 *
 * @param luvio The Luvio instance to instrument.
 * @param store The Store to instrument.
 */
function setupInstrumentation(luvio, store) {
    registerPlugin({
        name: NAMESPACE,
        plugin: markAggregatorPlugin,
    });
    instrumentMethod(luvio, [
        { methodName: 'storeBroadcast', metricKey: STORE_BROADCAST_DURATION },
        { methodName: 'storeIngest', metricKey: STORE_INGEST_DURATION },
        { methodName: 'storeLookup', metricKey: STORE_LOOKUP_DURATION },
    ]);
    registerPeriodicLogger(NAMESPACE, () => {
        const storeStats = getStoreStats(store);
        mark$1(NAMESPACE, STORE_STATS_MARK_NAME, storeStats);
        storeSizeMetric.update(storeStats.recordCount);
        storeSnapshotSubscriptionsMetric.update(storeStats.snapshotSubscriptionCount);
        storeWatchSubscriptionsMetric.update(storeStats.watchSubscriptionCount);
    });
}
function setAggregateUiChunkCountMetric(chunkCount) {
    aggregateUiChunkCountMetric.update(chunkCount);
}
function incrementGetRecordNormalInvokeCount() {
    getRecordNormalInvokeMetric.increment(1);
}
function incrementGetRecordAggregateInvokeCount() {
    getRecordAggregateInvokeMetric.increment(1);
}
function incrementGetRecordNotifyChangeAllowCount() {
    getRecordNotifyChangeAllowMetric.increment(1);
}
function incrementGetRecordNotifyChangeDropCount() {
    getRecordNotifyChangeDropMetric.increment(1);
}
function incrementNetworkRateLimitExceededCount() {
    networkRateLimitExceededCountMetric.increment(1);
}
/**
 * Note: locator.scope is set to 'force_record' in order for the instrumentation gate to work, which will
 * disable all crud operations if it is on.
 * @param eventSource - Source of the logging event.
 * @param attributes - Free form object of attributes to log.
 */
function logCRUDLightningInteraction(eventSource, attributes) {
    interaction(eventSource, 'force_record', null, eventSource, 'crud', attributes);
}
/**
 * @returns The builder function for specified api call.
 */
function refreshApiEvent(apiName) {
    return () => {
        return {
            [REFRESH_API_CALL_EVENT]: true,
            apiName,
        };
    };
}
const instrumentation = new Instrumentation();

export { APEX_ADAPTER_NAME, Instrumentation, NORMALIZED_APEX_ADAPTER_NAME, REFRESH_APEX_KEY, REFRESH_UIAPI_KEY, SUPPORTED_KEY, UNSUPPORTED_KEY, incrementGetRecordAggregateInvokeCount, incrementGetRecordNormalInvokeCount, incrementGetRecordNotifyChangeAllowCount, incrementGetRecordNotifyChangeDropCount, incrementNetworkRateLimitExceededCount, instrumentation, logCRUDLightningInteraction, mark, refreshApiEvent, registerLdsCacheStats, setAggregateUiChunkCountMetric, setupInstrumentation, timerMetricAddDuration };
// version: 1.11.3-03778f23
