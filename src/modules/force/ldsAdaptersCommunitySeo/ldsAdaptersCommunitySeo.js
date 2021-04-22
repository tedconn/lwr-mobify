/*  *******************************************************************************************
 *  ATTENTION!
 *  THIS IS A GENERATED FILE FROM https://github.com/salesforce/lds-lightning-platform
 *  If you would like to contribute to LDS, please follow the steps outlined in the git repo.
 *  Any changes made to this file in p4 will be automatically overwritten.
 *  *******************************************************************************************
 */
/* proxy-compat-disable */
import { createWireAdapterConstructor } from 'force/ldsBindings';

const { hasOwnProperty: ObjectPrototypeHasOwnProperty } = Object.prototype;
const { keys: ObjectKeys, freeze: ObjectFreeze } = Object;
const { isArray: ArrayIsArray } = Array;
/**
 * Validates an adapter config is well-formed.
 * @param config The config to validate.
 * @param adapter The adapter validation configuration.
 * @param oneOf The keys the config must contain at least one of.
 * @throws A TypeError if config doesn't satisfy the adapter's config validation.
 */
function validateConfig(config, adapter, oneOf) {
    const { displayName } = adapter;
    const { required, optional, unsupported } = adapter.parameters;
    if (config === undefined ||
        required.every(req => ObjectPrototypeHasOwnProperty.call(config, req)) === false) {
        throw new TypeError(`adapter ${displayName} configuration must specify ${required.sort().join(', ')}`);
    }
    if (oneOf && oneOf.some(req => ObjectPrototypeHasOwnProperty.call(config, req)) === false) {
        throw new TypeError(`adapter ${displayName} configuration must specify one of ${oneOf.sort().join(', ')}`);
    }
    if (unsupported !== undefined &&
        unsupported.some(req => ObjectPrototypeHasOwnProperty.call(config, req))) {
        throw new TypeError(`adapter ${displayName} does not yet support ${unsupported.sort().join(', ')}`);
    }
    const supported = required.concat(optional);
    if (ObjectKeys(config).some(key => !supported.includes(key))) {
        throw new TypeError(`adapter ${displayName} configuration supports only ${supported.sort().join(', ')}`);
    }
}
function untrustedIsObject(untrusted) {
    return typeof untrusted === 'object' && untrusted !== null && ArrayIsArray(untrusted) === false;
}
function areRequiredParametersPresent(config, configPropertyNames) {
    return configPropertyNames.parameters.required.every(req => req in config);
}
const SNAPSHOT_STATE_UNFULFILLED = 'Unfulfilled';
const snapshotRefreshOptions = {
    headers: {
        'Cache-Control': 'no-cache',
    },
};
const keyPrefix = 'CommunitiesSeo::';

const { freeze: ObjectFreeze$1, keys: ObjectKeys$1 } = Object;
const { isArray: ArrayIsArray$1 } = Array;
const { stringify: JSONStringify } = JSON;
function createLink(ref) {
    return {
        __ref: ref,
    };
}

const TTL = 3600000;
function validate(obj, path = 'RecordSeoPropertiesRepresentation') {
    const v_error = (() => {
        if (typeof obj !== 'object' || ArrayIsArray$1(obj) || obj === null) {
            return new TypeError('Expected "object" but received "' + typeof obj + '" (at "' + path + '")');
        }
        const obj_fields = obj.fields;
        const path_fields = path + '.fields';
        if (typeof obj_fields !== 'object' || ArrayIsArray$1(obj_fields) || obj_fields === null) {
            return new TypeError('Expected "object" but received "' + typeof obj_fields + '" (at "' + path_fields + '")');
        }
        const obj_fields_keys = ObjectKeys$1(obj_fields);
        for (let i = 0; i < obj_fields_keys.length; i++) {
            const key = obj_fields_keys[i];
            const obj_fields_prop = obj_fields[key];
            const path_fields_prop = path_fields + '["' + key + '"]';
            if (typeof obj_fields_prop !== 'string') {
                return new TypeError('Expected "string" but received "' + typeof obj_fields_prop + '" (at "' + path_fields_prop + '")');
            }
        }
        const obj_objectName = obj.objectName;
        const path_objectName = path + '.objectName';
        if (typeof obj_objectName !== 'string') {
            return new TypeError('Expected "string" but received "' + typeof obj_objectName + '" (at "' + path_objectName + '")');
        }
        const obj_recordId = obj.recordId;
        const path_recordId = path + '.recordId';
        if (typeof obj_recordId !== 'string') {
            return new TypeError('Expected "string" but received "' + typeof obj_recordId + '" (at "' + path_recordId + '")');
        }
        const obj_recordName = obj.recordName;
        const path_recordName = path + '.recordName';
        if (typeof obj_recordName !== 'string') {
            return new TypeError('Expected "string" but received "' + typeof obj_recordName + '" (at "' + path_recordName + '")');
        }
    })();
    return v_error === undefined ? null : v_error;
}
function normalize(input, existing, path, luvio, store, timestamp) {
    return input;
}
const select = function RecordSeoPropertiesRepresentationSelect() {
    return {
        kind: 'Fragment',
        private: [],
        opaque: true
    };
};
function equals(existing, incoming) {
    if (JSONStringify(incoming) !== JSONStringify(existing)) {
        return false;
    }
    return true;
}
function deepFreeze(input) {
    const input_fields = input.fields;
    const input_fields_keys = Object.keys(input_fields);
    const input_fields_length = input_fields_keys.length;
    for (let i = 0; i < input_fields_length; i++) {
        const key = input_fields_keys[i];
    }
    ObjectFreeze$1(input_fields);
    ObjectFreeze$1(input);
}
const ingest = function RecordSeoPropertiesRepresentationIngest(input, path, luvio, store, timestamp) {
    if (process.env.NODE_ENV !== 'production') {
        const validateError = validate(input);
        if (validateError !== null) {
            throw validateError;
        }
    }
    const key = path.fullPath;
    let incomingRecord = normalize(input, store.records[key], {
        fullPath: key,
        parent: path.parent,
        propertyName: path.propertyName,
    });
    const existingRecord = store.records[key];
    deepFreeze(input);
    if (existingRecord === undefined || equals(existingRecord, incomingRecord) === false) {
        luvio.storePublish(key, incomingRecord);
    }
    luvio.storeSetExpiration(key, timestamp + 3600000);
    return createLink(key);
};

function select$1(luvio, params) {
    return select();
}
function keyBuilder(params) {
    return keyPrefix + 'RecordSeoPropertiesRepresentation(' + 'fields:' + params.queryParams.fields + ',' + 'communityId:' + params.urlParams.communityId + ',' + 'recordId:' + params.urlParams.recordId + ')';
}
function ingestSuccess(luvio, resourceParams, response, snapshotRefresh) {
    const { body } = response;
    const key = keyBuilder(resourceParams);
    luvio.storeIngest(key, ingest, body);
    const snapshot = luvio.storeLookup({
        recordId: key,
        node: select$1(),
        variables: {},
    }, snapshotRefresh);
    if (process.env.NODE_ENV !== 'production') {
        if (response.headers !== undefined && snapshot.state !== 'Fulfilled') {
            throw new Error('Invalid network response. Expected resource response to result in Fulfilled snapshot');
        }
        if (!(snapshot.state === 'Fulfilled' || snapshot.state === 'Stale')) {
            throw new Error('Invalid resource response. Expected resource response to result in Fulfilled or Stale snapshot');
        }
    }
    return snapshot;
}
function ingestError(luvio, params, error, snapshotRefresh) {
    const key = keyBuilder(params);
    const errorSnapshot = luvio.errorSnapshot(error, snapshotRefresh);
    luvio.storeIngestError(key, errorSnapshot, TTL);
    return errorSnapshot;
}
function createResourceRequest(config) {
    const headers = {};
    return {
        baseUri: '/services/data/v53.0',
        basePath: '/connect/communities/' + config.urlParams.communityId + '/seo/properties/' + config.urlParams.recordId + '',
        method: 'get',
        body: null,
        urlParams: config.urlParams,
        queryParams: config.queryParams,
        headers,
    };
}

const adapterName = 'getRecordSeoProperties';
const getRecordSeoProperties_ConfigPropertyNames = {
    displayName: 'getRecordSeoProperties',
    parameters: {
        required: ['communityId', 'recordId'],
        optional: ['fields']
    }
};
function createResourceParams(config) {
    return {
        urlParams: {
            communityId: config.communityId, recordId: config.recordId
        },
        queryParams: {
            fields: config.fields
        }
    };
}
function keyBuilder$1(luvio, config) {
    const resourceParams = createResourceParams(config);
    return keyBuilder(resourceParams);
}
function typeCheckConfig(untrustedConfig) {
    const config = {};
    const untrustedConfig_communityId = untrustedConfig.communityId;
    if (typeof untrustedConfig_communityId === 'string') {
        config.communityId = untrustedConfig_communityId;
    }
    const untrustedConfig_recordId = untrustedConfig.recordId;
    if (typeof untrustedConfig_recordId === 'string') {
        config.recordId = untrustedConfig_recordId;
    }
    const untrustedConfig_fields = untrustedConfig.fields;
    if (typeof untrustedConfig_fields === 'string') {
        config.fields = untrustedConfig_fields;
    }
    return config;
}
function validateAdapterConfig(untrustedConfig, configPropertyNames) {
    if (!untrustedIsObject(untrustedConfig)) {
        return null;
    }
    if (process.env.NODE_ENV !== 'production') {
        validateConfig(untrustedConfig, configPropertyNames);
    }
    const config = typeCheckConfig(untrustedConfig);
    if (!areRequiredParametersPresent(config, configPropertyNames)) {
        return null;
    }
    return config;
}
function adapterFragment(luvio, config) {
    const resourceParams = createResourceParams(config);
    return select$1();
}
function buildInMemorySnapshot(luvio, config) {
    const selector = {
        recordId: keyBuilder$1(luvio, config),
        node: adapterFragment(luvio, config),
        variables: {},
    };
    return luvio.storeLookup(selector, {
        config,
        resolve: () => buildNetworkSnapshot(luvio, config, snapshotRefreshOptions)
    });
}
function onResourceResponseSuccess(luvio, config, resourceParams, response) {
    const snapshot = ingestSuccess(luvio, resourceParams, response, {
        config,
        resolve: () => buildNetworkSnapshot(luvio, config, snapshotRefreshOptions)
    });
    luvio.storeBroadcast();
    return snapshot;
}
function onResourceResponseError(luvio, config, resourceParams, response) {
    const snapshot = ingestError(luvio, resourceParams, response, {
        config,
        resolve: () => buildNetworkSnapshot(luvio, config, snapshotRefreshOptions)
    });
    luvio.storeBroadcast();
    return snapshot;
}
function buildNetworkSnapshot(luvio, config, override) {
    const resourceParams = createResourceParams(config);
    const request = createResourceRequest(resourceParams);
    return luvio.dispatchResourceRequest(request, override)
        .then((response) => {
        return onResourceResponseSuccess(luvio, config, resourceParams, response);
    }, (response) => {
        return onResourceResponseError(luvio, config, resourceParams, response);
    });
}
function resolveUnfulfilledSnapshot(luvio, config, snapshot) {
    const resourceParams = createResourceParams(config);
    const request = createResourceRequest(resourceParams);
    return luvio.resolveUnfulfilledSnapshot(request, snapshot)
        .then((response) => {
        return onResourceResponseSuccess(luvio, config, resourceParams, response);
    }, (response) => {
        return onResourceResponseError(luvio, config, resourceParams, response);
    });
}
const getRecordSeoPropertiesAdapterFactory = (luvio) => function communitiesSeo__getRecordSeoProperties(untrustedConfig) {
    const config = validateAdapterConfig(untrustedConfig, getRecordSeoProperties_ConfigPropertyNames);
    // Invalid or incomplete config
    if (config === null) {
        return null;
    }
    const cacheSnapshot = buildInMemorySnapshot(luvio, config);
    // Cache Hit
    if (luvio.snapshotAvailable(cacheSnapshot) === true) {
        return cacheSnapshot;
    }
    if (cacheSnapshot.state === SNAPSHOT_STATE_UNFULFILLED) {
        return resolveUnfulfilledSnapshot(luvio, config, cacheSnapshot);
    }
    return buildNetworkSnapshot(luvio, config);
};

const getRecordSeoProperties = createWireAdapterConstructor(getRecordSeoPropertiesAdapterFactory, { apiFamily: 'CommunitiesSeo', name: adapterName, ttl: 3600000 });

export { getRecordSeoProperties };
// version: 1.11.3-03778f23
