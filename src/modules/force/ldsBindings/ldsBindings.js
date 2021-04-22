/*  *******************************************************************************************
 *  ATTENTION!
 *  THIS IS A GENERATED FILE FROM https://github.com/salesforce/lds-lightning-platform
 *  If you would like to contribute to LDS, please follow the steps outlined in the git repo.
 *  Any changes made to this file in p4 will be automatically overwritten.
 *  *******************************************************************************************
 */
/* proxy-compat-disable */
import { unwrap } from 'lwc';
import { luvio } from 'force/ldsEngine';
import { instrumentation, refreshApiEvent } from 'force/ldsInstrumentation';

const { freeze, keys } = Object;
const { isArray } = Array;
const { stringify } = JSON;

class Sanitizer {
    constructor(obj) {
        this.obj = obj;
        this.copy = {};
        this.currentPath = {
            key: '',
            value: obj,
            parent: null,
            data: this.copy,
        };
    }
    sanitize() {
        const sanitizer = this;
        stringify(this.obj, function (key, value) {
            if (key === '') {
                return value;
            }
            const parent = this;
            if (parent !== sanitizer.currentPath.value) {
                sanitizer.exit(parent);
            }
            if (typeof value === 'object' && value !== null) {
                sanitizer.enter(key, value);
                return value;
            }
            sanitizer.currentPath.data[key] = value;
            return value;
        });
        return this.copy;
    }
    enter(key, value) {
        const { currentPath: parentPath } = this;
        const data = (parentPath.data[key] = isArray(value) ? [] : {});
        this.currentPath = {
            key,
            value,
            parent: parentPath,
            data,
        };
    }
    exit(parent) {
        while (this.currentPath.value !== parent) {
            this.currentPath = this.currentPath.parent || this.currentPath;
        }
    }
}
/**
 * Returns a sanitized version of an object by recursively unwrapping the Proxies.
 *
 * In order to keep luvio performance optimal on IE11, we need to make sure that luvio code gets
 * transformed by the es5-proxy-compat. At the same time we need to ensure that no ProxyCompat leaks
 * into the luvio engine code nor into the adapters. All the data coming from LWC-land need to be
 * sanitized first.
 */
function sanitize(obj) {
    return new Sanitizer(obj).sanitize();
}

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
function isErrorSnapshot(snapshot) {
    return snapshot.state === SnapshotState.Error;
}
function isFulfilledSnapshot(snapshot) {
    return snapshot.state === SnapshotState.Fulfilled;
}
function isStaleSnapshot(snapshot) {
    return snapshot.state === SnapshotState.Stale;
}
function isUnfulfilledSnapshot(snapshot) {
    return snapshot.state === SnapshotState.Unfulfilled;
}
// END OF COPY BLOCK
const USERLAND_PROVISION_ERROR_MESSAGE = "LWC component's @wire target property or method threw an error during value provisioning. Original error:";
const ADAPTER_SNAPSHOT_REJECTED_MESSAGE = 'Luvio wire adapter Promise<Snapshot> rejected. Original error:';
// map of emitted object -> [ adapter name, snapshot ]; snapshot is only undefined for the
// initially-emitted { data: undefined, error: undefined } value
const dataToTupleWeakMap = new WeakMap();
function bindWireRefresh(luvio) {
    return function refresh(data) {
        return refreshData(data, dataToTupleWeakMap, luvio);
    };
}
// instrumentation keys to be imported by ldsInstrumentation
const REFRESH_ADAPTER_EVENT = 'refresh-adapter-event';
const ADAPTER_UNFULFILLED_ERROR = 'adapter-unfulfilled-error';
function refreshData(data, dataToTuple, luvio) {
    const tuple = dataToTuple.get(unwrap(data));
    if (tuple === undefined) {
        if (process.env.NODE_ENV !== 'production') {
            throw new Error('Refresh failed because resolved configuration is not available.');
        }
        return;
    }
    const [adapterName, snapshot] = tuple;
    luvio.instrument(() => {
        return {
            [REFRESH_ADAPTER_EVENT]: true,
            adapterName,
        };
    });
    // snapshot is undefined when a caller refreshes the initial
    // { data: undefined, error: undefined } object that we emitted
    if (snapshot === undefined) {
        return Promise.resolve(undefined);
    }
    return luvio.refreshSnapshot(snapshot).then(refreshed => {
        if (isErrorSnapshot(refreshed)) {
            throw refreshed.error;
        }
        if (process.env.NODE_ENV !== 'production') {
            if (isUnfulfilledSnapshot(refreshed)) {
                throw new Error('Refresh resulted in unfulfilled snapshot');
            }
        }
        return undefined;
    });
}
function isPromise(value) {
    // check for Thenable due to test frameworks using custom Promise impls
    return value.then !== undefined;
}
/**
 * Transform a Snapshot into a payload suitable for passing to a DataCallback.
 *
 * @param snapshot Snapshot
 */
function snapshotToPayload(snapshot) {
    if (snapshot === undefined) {
        return {
            data: undefined,
            error: undefined,
        };
    }
    if (isErrorSnapshot(snapshot)) {
        return {
            data: undefined,
            error: snapshot.error,
        };
    }
    // fulfilled or stale
    return {
        data: snapshot.data,
        error: undefined,
    };
}
/**
 * (Re)throws an error after adding a prefix to the message.
 *
 * @param error Error
 * @param messagePrefix prefix to add to error's message
 */
function throwAnnotatedError(error, messagePrefix) {
    if (error instanceof Error) {
        error.message = `${messagePrefix}\n[${error.message}]`;
        throw error;
    }
    throw new Error(`${messagePrefix}\n[${stringify(error)}]`);
}
class LWCLuvioWireAdapter {
    /**
     * Constructs a new wire adapter instance for the given adapter.
     *
     * @param callback callback to be invoked with new values
     */
    constructor(adapter, name, luvio, callback) {
        // a component can be connected-disconnected-reconnected multiple times during its
        // life but we only want to keep subscriptions active while it is connected; the
        // connect/disconnect methods below keep this value updated to reflect the current
        // state
        this.connected = false;
        this.adapter = adapter;
        this.name = name;
        this.luvio = luvio;
        this.callback = callback;
        // initialize the wired property with a properly shaped object so cmps can use <template if:true={wiredProperty.data}>
        this.emit();
    }
    // WireAdapter interface methods
    /**
     * Called when the component associated with the wire adapter is connected.
     */
    connect() {
        this.connected = true;
        this.callAdapter();
    }
    /**
     * Called when the component associated with the wire adapter is disconnected.
     */
    disconnect() {
        this.unsubscribe();
        this.connected = false;
    }
    /**
     * Called when new or updated config is supplied to the wire adapter.
     *
     * @param config new config parameters for the wire adapter
     * @param _context not used
     */
    update(config, _context) {
        this.unsubscribe();
        this.config = sanitize(config);
        this.callAdapter();
    }
    // private utility methods
    /**
     * Calls the adapter if config has been set and the component is connected.
     */
    callAdapter() {
        if (!this.connected || this.config === undefined) {
            return;
        }
        const snapshotOrPromise = this.adapter(this.config);
        // insufficient config, wait for new config from component
        if (snapshotOrPromise === null) {
            return;
        }
        const configForSnapshot = this.config;
        const emitAndSubscribe = (snapshot) => {
            // adapters leveraging adapter context could asynchronously
            // return null (due to invalid config)
            if (snapshot === null) {
                return;
            }
            // We should never broadcast an unfulfilled snapshot to a component
            if (isUnfulfilledSnapshot(snapshot)) {
                if (process.env.NODE_ENV !== 'production') {
                    throw new Error(`Unfulfilled snapshot emitted to component from subscription, missingPaths: ${keys(snapshot.missingPaths)}`);
                }
                // Instrument as a failed request
                this.luvio.instrument(() => {
                    return {
                        [ADAPTER_UNFULFILLED_ERROR]: true,
                        adapterName: this.adapter.name,
                        missingPaths: snapshot.missingPaths,
                        missingLinks: snapshot.missingLinks,
                    };
                });
                return;
            }
            // if config has changed before the snapshot arrives then ignore snapshot
            if (this.config !== configForSnapshot) {
                return;
            }
            // emit unless snapshot is pending
            if (isFulfilledSnapshot(snapshot) ||
                isErrorSnapshot(snapshot) ||
                isStaleSnapshot(snapshot)) {
                this.emit(snapshot);
            }
            // subscribe to the new snapshot
            this.subscribe(snapshot);
        };
        // Data resolved sync
        if (!isPromise(snapshotOrPromise)) {
            emitAndSubscribe(snapshotOrPromise);
        }
        else {
            // We want to let errors from this promise propagate to the app container,
            // which is why we do not have a reject handler here.
            // If an error is thrown here, it means that there was an error somewhere
            // inside an adapter which means that there was a mistake by the implementor.
            // Errors that come from the network should never hit this block because
            // they are treated like regular snapshots, not true error paths.
            snapshotOrPromise.then(emitAndSubscribe, error => throwAnnotatedError(error, ADAPTER_SNAPSHOT_REJECTED_MESSAGE));
        }
    }
    /**
     * Emits new values to the callback.
     *
     * @param snapshot Snapshot to be emitted, if omitted then undefineds will be emitted
     */
    emit(snapshot) {
        const payload = snapshotToPayload(snapshot);
        dataToTupleWeakMap.set(payload, [this.name, snapshot]);
        try {
            this.callback(payload);
        }
        catch (error) {
            if (error instanceof Error) {
                throwAnnotatedError(error, USERLAND_PROVISION_ERROR_MESSAGE);
            }
        }
    }
    /**
     * Subscribes this wire adapter to future changes to the specified snapshot. Any changes
     * to the snapshot will be automatically emitted to the component.
     *
     * @param snapshot Snapshot
     * @param subscriptionCallback callback
     */
    subscribe(snapshot) {
        // always clean up any old subscription that we might have
        this.unsubscribe();
        // but only subscribe if component is currently connected
        if (this.connected) {
            this.unsubscriber = this.luvio.storeSubscribe(snapshot, this.emit.bind(this));
        }
    }
    /**
     * Deletes this wire adapter's snapshot subscription (if any).
     */
    unsubscribe() {
        // clean up subscription
        if (this.unsubscriber !== undefined) {
            this.unsubscriber();
            this.unsubscriber = undefined;
        }
    }
}
/**
 * Wraps a luvio Adapter in a WireAdapterConstructor that conforms to https://rfcs.lwc.dev/rfcs/lwc/0000-wire-reform#wire-adapter-protocol.
 *
 * @param adapter Adapter
 * @param name name to assign to the generated constructor
 * @param luvio Luvio
 */
function createWireAdapterConstructor(adapter, name, luvio) {
    const constructor = function (callback) {
        const delegate = new LWCLuvioWireAdapter(adapter, name, luvio, callback);
        this.connect = () => delegate.connect();
        this.disconnect = () => delegate.disconnect();
        this.update = (config, context) => delegate.update(config, context);
    };
    Object.defineProperty(constructor, 'name', { value: name });
    return constructor;
}

function createWireAdapterConstructor$1(factory, metadata) {
    const { apiFamily, name } = metadata;
    const adapter = instrumentation.instrumentAdapter(createLDSAdapter(name, factory), metadata);
    return createWireAdapterConstructor(adapter, `${apiFamily}.${name}`, luvio);
}
function createLDSAdapter(name, factory) {
    return factory(luvio);
}
const wireRefresh = bindWireRefresh(luvio);
function refresh(data, apiFamily) {
    luvio.instrument(refreshApiEvent(apiFamily));
    return wireRefresh(data);
}

export { createLDSAdapter, createWireAdapterConstructor$1 as createWireAdapterConstructor, refresh };
// version: 1.11.3-03778f23
