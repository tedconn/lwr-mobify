/*  *******************************************************************************************
 *  ATTENTION!
 *  THIS IS A GENERATED FILE FROM https://github.com/salesforce/lds-lightning-platform
 *  If you would like to contribute to LDS, please follow the steps outlined in the git repo.
 *  Any changes made to this file in p4 will be automatically overwritten.
 *  *******************************************************************************************
 */
/* proxy-compat-disable */
import networkAdapter from 'force/ldsNetwork';
import { instrumentation, setupInstrumentation, mark } from 'force/ldsInstrumentation';
import { clearStorages } from 'force/ldsStorage';

const { keys, create, freeze } = Object;
const { hasOwnProperty } = Object.prototype;
const { isArray } = Array;
const { push, indexOf, slice } = Array.prototype;
const { stringify } = JSON;

function deepFreeze(value) {
    // No need to freeze primitives
    if (typeof value !== 'object' || value === null) {
        return;
    }
    if (isArray(value)) {
        for (let i = 0, len = value.length; i < len; i += 1) {
            deepFreeze(value[i]);
        }
    }
    else {
        const keys$1 = keys(value);
        for (let i = 0, len = keys$1.length; i < len; i += 1) {
            deepFreeze(value[keys$1[i]]);
        }
    }
    freeze(value);
}

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
function isUnfulfilledSnapshot(snapshot) {
    return snapshot.state === SnapshotState.Unfulfilled;
}
function isPendingSnapshot(snapshot) {
    return snapshot.state === SnapshotState.Pending;
}
function createErrorSnapshot(error, refresh) {
    deepFreeze(error);
    const snap = {
        error,
        state: SnapshotState.Error,
        data: undefined,
        refresh,
    };
    return snap;
}

// TODO RAML -  see if we can find a way to remove this assumption - the default token
// really should just be whatever the server sends back for currentPageToken
// when the request did not specify a pageToken parameter.
const DEFAULT_TOKEN = '0';
const END_TOKEN = '__END__';
// TODO: re-evaluate passing save function vs something like getPaginationData
function pagination(pd, save) {
    const pd_ = pd || { [DEFAULT_TOKEN]: 0 };
    return {
        defaultToken: () => DEFAULT_TOKEN,
        endOffset: () => pd_[END_TOKEN],
        isPastEnd: (offset) => {
            return END_TOKEN in pd_ && offset >= pd_[END_TOKEN];
        },
        limitToEnd: (offset) => {
            return END_TOKEN in pd_ && offset >= pd_[END_TOKEN] ? pd_[END_TOKEN] : offset;
        },
        offsetFor: (token) => {
            return pd_[token || DEFAULT_TOKEN];
        },
        save: () => {
            if (!save) {
                if (process.env.NODE_ENV !== 'production') {
                    throw new Error('pagination.save() invoked but no save function supplied');
                }
            }
            else {
                save(pd_);
            }
        },
        setEnd: (offset) => {
            if (offset === undefined) {
                delete pd_[END_TOKEN];
            }
            else {
                pd_[END_TOKEN] = offset;
            }
        },
        setToken: (token, offset) => {
            if (offset === undefined) {
                delete pd_[token];
            }
            else {
                pd_[token] = offset;
            }
        },
        tokenFor: (offset) => {
            const tokens = Object.keys(pd_);
            for (let i = 0; i < tokens.length; ++i) {
                if (pd_[tokens[i]] === offset) {
                    return tokens[i];
                }
            }
        },
        tokenForAtMost: (offset) => {
            let result = [DEFAULT_TOKEN, 0];
            const tokens = Object.keys(pd_);
            for (let i = 0; i < tokens.length; ++i) {
                let offsetI = pd_[tokens[i]];
                if (offsetI <= offset && offsetI > result[1]) {
                    result = [tokens[i], offsetI];
                }
            }
            return result;
        },
    };
}

function isUnionObjectSelection(sel) {
    return sel.union === true && sel.kind === 'Object';
}
function isReaderFragment(fragment) {
    return fragment.reader === true;
}
function isFragmentUnionSelection(sel) {
    return sel.union === true;
}

function formatStorageKey(name, argValues) {
    if (!argValues) {
        return name;
    }
    var values = [];
    for (var _argName in argValues) {
        if (hasOwnProperty.call(argValues, _argName)) {
            var value = argValues[_argName];
            if (value !== null || value !== undefined) {
                values.push(_argName + ':' + stringify(value));
            }
        }
    }
    return values.length === 0 ? name : name + '('.concat(values.join(','), ')');
}
function getArgumentValues(args, variables) {
    const values = {};
    args.forEach((arg) => {
        if (arg.kind === 'Variable') {
            // Variables are provided at runtime and are not guaranteed to be stable.
            values[arg.name] = variables[arg.variableName];
        }
        else {
            values[arg.name] = arg.value;
        }
    });
    return values;
}
function getStorageKey(field, variables) {
    const { args, name } = field;
    if (args && args.length !== 0) {
        return formatStorageKey(name, getArgumentValues(args, variables));
    }
    return name;
}

var StoreLinkStateValues;
(function (StoreLinkStateValues) {
    StoreLinkStateValues[StoreLinkStateValues["NotPresent"] = 0] = "NotPresent";
    StoreLinkStateValues[StoreLinkStateValues["RefNotPresent"] = 1] = "RefNotPresent";
    StoreLinkStateValues[StoreLinkStateValues["RefPresent"] = 2] = "RefPresent";
    StoreLinkStateValues[StoreLinkStateValues["Null"] = 3] = "Null";
    StoreLinkStateValues[StoreLinkStateValues["Missing"] = 4] = "Missing";
    StoreLinkStateValues[StoreLinkStateValues["Pending"] = 5] = "Pending";
})(StoreLinkStateValues || (StoreLinkStateValues = {}));
function getLinkState(link) {
    // This condition is hit when the link itself isn't present
    if (link === undefined) {
        return {
            state: StoreLinkStateValues.NotPresent,
        };
    }
    if (link === null) {
        return {
            state: StoreLinkStateValues.Null,
        };
    }
    const { __ref: key, pending, isMissing } = link;
    if (pending === true) {
        return {
            state: StoreLinkStateValues.Pending,
        };
    }
    if (isMissing === true) {
        return {
            state: StoreLinkStateValues.Missing,
        };
    }
    if (key === undefined) {
        return {
            state: StoreLinkStateValues.RefNotPresent,
        };
    }
    return {
        state: StoreLinkStateValues.RefPresent,
        key,
    };
}

var StoreResolveResultState;
(function (StoreResolveResultState) {
    StoreResolveResultState[StoreResolveResultState["Found"] = 0] = "Found";
    StoreResolveResultState[StoreResolveResultState["Error"] = 1] = "Error";
    StoreResolveResultState[StoreResolveResultState["Null"] = 2] = "Null";
    StoreResolveResultState[StoreResolveResultState["NotPresent"] = 3] = "NotPresent";
})(StoreResolveResultState || (StoreResolveResultState = {}));
function resolveKey(reader, key) {
    const source = reader.storeLookup(key);
    if (source === undefined) {
        return {
            state: StoreResolveResultState.NotPresent,
        };
    }
    if (source !== null && isStoreRecordError(source)) {
        return {
            state: StoreResolveResultState.Error,
            value: source.error,
        };
    }
    return {
        state: StoreResolveResultState.Found,
        value: source,
    };
}

const READER_PATH_ROOT = 'ROOT';
const EMPTY_STRING = '';
var FragmentReadResultState;
(function (FragmentReadResultState) {
    FragmentReadResultState[FragmentReadResultState["Missing"] = 0] = "Missing";
    FragmentReadResultState[FragmentReadResultState["Success"] = 1] = "Success";
    FragmentReadResultState[FragmentReadResultState["Error"] = 2] = "Error";
})(FragmentReadResultState || (FragmentReadResultState = {}));
const FRAGMENT_READ_RESULT_MISSING = {
    state: FragmentReadResultState.Missing,
};
function validateUnionSelection(record, selection, path) {
    const { discriminator } = selection;
    const discriminatorValue = record[discriminator];
    if (discriminatorValue === undefined) {
        throw new Error(`Invalid discriminator. Expected discriminator at path "${path.fullPath}.${discriminator}" but received "${stringify(record)}"`);
    }
    const unionSelection = selection.unionSelections[discriminatorValue];
    if (unionSelection === undefined) {
        const keys = Object.keys(selection.unionSelections)
            .map(key => `"${key}"`)
            .join(', ');
        throw new Error(`Invalid union selection. Expected to be one of ${keys} but received "${discriminatorValue}"`);
    }
}
class Reader {
    constructor(records, expirationMap, redirects, variables, refresh, baseSnapshot) {
        this.missingPaths = {};
        this.missingLinks = {};
        this.hasPendingData = false;
        this.variables = variables;
        this.records = records;
        this.seenIds = {};
        this.isMissingData = false;
        this.hasStaleData = false;
        this.refresh = refresh;
        // When we aren't passed a base snapshot, we don't have to worry about
        // marking the snapshot as changed because there is nothing to compare against.
        // Therefore, our initial state is that the snapshot has changed.
        let snapshotChanged = true;
        // When we aren't passed a base snapshot, we do not have any previous data
        // So we can just assign this to undefined
        let baseSnapshotValue = undefined;
        // When we are passed a base snapshot, we want to keep track of the previous data
        // We also will need to compare all of our data against the snapshot's previous data
        // Our initial state is that the snapshot has not changed. The reason for this is because
        // Once we detect a change, we can just flip this boolean on the first change and then
        // not have to worry about it for additional changes.
        if (baseSnapshot !== undefined && baseSnapshot.state === SnapshotState.Fulfilled) {
            baseSnapshotValue = baseSnapshot.data;
            snapshotChanged = false;
        }
        this.snapshotChanged = snapshotChanged;
        this.currentPath = {
            fullPath: EMPTY_STRING,
            key: READER_PATH_ROOT,
            parent: null,
            baseSnapshotValue,
        };
        this.baseSnapshot = baseSnapshot;
        this.expirationMap = expirationMap;
        this.redirects = redirects;
        this.timestamp = Date.now();
    }
    pagination(key) {
        return pagination(this.storeLookup(key));
    }
    readFragmentUnion(result, selection) {
        const { value: record } = result;
        if (process.env.NODE_ENV !== 'production') {
            validateUnionSelection(record, selection, this.currentPath);
        }
        const { discriminator } = selection;
        const discriminatorValue = record[discriminator];
        return this.readFragment(result, selection.unionSelections[discriminatorValue]);
    }
    read(selector) {
        const { node: selectorNode } = selector;
        const { recordId: key } = selector;
        const result = resolveKey(this, key);
        const fragmentResult = this.readFragment(result, selectorNode);
        switch (fragmentResult.state) {
            case FragmentReadResultState.Missing:
                if (this.isMissingData === false) {
                    this.isMissingData = true;
                    this.snapshotChanged = true;
                }
                return this.createSnapshot(undefined, selector);
            case FragmentReadResultState.Error:
                return this.createErrorSnapshot(fragmentResult.value);
            default:
                return this.createSnapshot(fragmentResult.value, selector);
        }
    }
    getSnapshotState() {
        if (this.isMissingData === true) {
            return SnapshotState.Unfulfilled;
        }
        if (this.hasPendingData === true) {
            return SnapshotState.Pending;
        }
        if (this.hasStaleData === true) {
            return SnapshotState.Stale;
        }
        return SnapshotState.Fulfilled;
    }
    createErrorSnapshot(data) {
        return {
            data: undefined,
            error: data,
            state: SnapshotState.Error,
            refresh: this.refresh,
        };
    }
    createSnapshot(data, selector) {
        if (this.snapshotChanged === false) {
            return this.baseSnapshot;
        }
        return {
            recordId: selector.recordId,
            select: selector,
            variables: this.variables,
            seenRecords: this.seenIds,
            data,
            state: this.getSnapshotState(),
            missingPaths: this.missingPaths,
            missingLinks: this.missingLinks,
            refresh: this.refresh,
        }; // Typescript complains about unfulfilled vs fulfilled snapshot if we don't cast
    }
    deepCopy(record, data, key, visitedKeys) {
        const value = record[key];
        this.enterPath(key);
        if (isArray(value)) {
            // Array
            const items = [];
            this.selectAll(value, items, visitedKeys);
            data[key] = items;
        }
        else if (typeof value === 'object' && value !== null) {
            // Object
            if (value.__ref !== undefined) {
                // Link
                const nextRecordId = value.__ref;
                if (isArray(nextRecordId)) {
                    const items = [];
                    this.selectAll(nextRecordId, items, visitedKeys);
                    data[key] = items;
                }
                else {
                    if (hasOwnProperty.call(visitedKeys, nextRecordId) === true) {
                        throw new Error(`Invalid eager selection on records with circular references.`);
                    }
                    this.seenIds[nextRecordId] = true;
                    const nextRecord = this.storeLookup(nextRecordId);
                    if (nextRecord === undefined) {
                        this.markMissingLink(nextRecordId);
                        data[key] = undefined;
                    }
                    else {
                        const nested = {};
                        this.selectAll(nextRecord, nested, {
                            ...visitedKeys,
                            [nextRecordId]: true,
                        });
                        data[key] = nested;
                    }
                }
            }
            else {
                // Inlined object
                const items = {};
                this.selectAll(value, items, visitedKeys);
                data[key] = items;
            }
        }
        else {
            // Scalar
            this.checkIfChanged(value);
            data[key] = value;
        }
        this.exitPath();
    }
    selectAllArray(record, data, visitedKeys) {
        const { length } = record;
        for (let key = 0; key < length; key += 1) {
            this.deepCopy(record, data, key, visitedKeys);
        }
    }
    selectAllObject(record, data, visitedKeys) {
        const recordKeys = keys(record);
        const { length } = recordKeys;
        for (let i = 0; i < length; i += 1) {
            const key = recordKeys[i];
            this.deepCopy(record, data, key, visitedKeys);
        }
    }
    selectAll(record, data, visitedKeys = {}) {
        const recordIsArray = isArray(record);
        if (recordIsArray === true) {
            this.selectAllArray(record, data, visitedKeys);
        }
        else {
            this.selectAllObject(record, data, visitedKeys);
        }
        freeze(data);
    }
    markPending() {
        this.hasPendingData = true;
    }
    markStale() {
        this.hasStaleData = true;
    }
    markMissing() {
        this.isMissingData = true;
        this.missingPaths[this.currentPath.fullPath] = true;
        this.checkIfChanged(undefined);
    }
    markMissingLink(linkKey) {
        this.missingLinks[linkKey] = true;
        this.markMissing();
    }
    assignNonScalar(sink, key, value) {
        sink[key] = value;
        freeze(value);
    }
    enterPath(key) {
        const parent = this.currentPath;
        const { key: parentKey, fullPath: parentFullPath, baseSnapshotValue: parentBaseSnapshotValue, } = parent;
        let baseSnapshotValue = undefined;
        if (parentBaseSnapshotValue !== undefined && parentBaseSnapshotValue !== null) {
            baseSnapshotValue = parentBaseSnapshotValue[key];
        }
        this.currentPath = {
            parent,
            key,
            fullPath: parentKey === READER_PATH_ROOT ? key : parentFullPath + '.' + key,
            baseSnapshotValue,
        };
    }
    exitPath() {
        this.currentPath = this.currentPath.parent;
    }
    readSingleLink(propertyName, selection, source, sink, assignmentProperty) {
        const { required, nullable, fragment } = selection;
        const link = source[propertyName];
        const property = assignmentProperty === undefined ? propertyName : assignmentProperty;
        const linkState = getLinkState(link);
        switch (linkState.state) {
            case StoreLinkStateValues.RefNotPresent:
            case StoreLinkStateValues.NotPresent:
            case StoreLinkStateValues.Missing:
                // We need to read synthetic fragments here because data from the link is missing,
                // So we won't have a chance to call readFragment
                if (isReaderFragment(fragment) && fragment.synthetic === true) {
                    return this.assignNonScalar(sink, property, fragment.read(this));
                }
                if (linkState.state === StoreLinkStateValues.Missing && required === false) {
                    return;
                }
                this.markMissing();
                return;
            case StoreLinkStateValues.Null:
                if (nullable === true) {
                    this.readScalar(propertyName, source, sink);
                    return;
                }
                throw new Error(`Invalid Link State. Link on "${this.currentPath.fullPath}" is null but selection is not nullable: \n${stringify(selection, null, 2)}`);
            case StoreLinkStateValues.Pending:
                this.markPending();
                return;
            default:
                this.readStoreLinkWithRef(linkState, fragment, sink, property, required);
        }
    }
    readStoreLinkWithRef(linkState, fragment, sink, assignmentProperty, required) {
        const { seenIds: ids } = this;
        const fragmentResult = this.readFragment(resolveKey(this, linkState.key), fragment);
        const { key } = linkState;
        ids[key] = true;
        switch (fragmentResult.state) {
            case FragmentReadResultState.Missing:
                if (required === false) {
                    return;
                }
                this.markMissingLink(key);
                return;
            case FragmentReadResultState.Error:
                this.markMissing();
                return;
            default:
                this.assignNonScalar(sink, assignmentProperty, fragmentResult.value);
        }
    }
    readObject(key, selection, source, sink) {
        const sourceValue = source[key];
        if (selection.nullable === true && sourceValue === null) {
            this.readScalar(key, source, sink);
            return;
        }
        if (selection.opaque === true) {
            this.readOpaque(sink, key, sourceValue, selection.required);
            return;
        }
        if (sourceValue === undefined) {
            if (selection.required === false) {
                this.checkIfChanged(sourceValue);
                return;
            }
            return this.markMissing();
        }
        const sinkValue = isArray(sourceValue) ? [] : {};
        if (selection.selections === undefined) {
            this.selectAll(sourceValue, sinkValue);
        }
        else {
            this.traverseSelections(selection, sourceValue, sinkValue);
        }
        this.assignNonScalar(sink, key, sinkValue);
    }
    /**
     * Flips snapshotChanged flag if current size of the value 'array' is different from the length of base snapshot.
     *
     * @param value - Sink array to be checked against baseSnapshotValue
     */
    checkIfArrayLengthChanged(value) {
        // If we've already detected a change, just return
        if (this.snapshotChanged === true) {
            return;
        }
        if (this.currentPath.baseSnapshotValue !== undefined &&
            this.currentPath.baseSnapshotValue !== null) {
            this.snapshotChanged = this.currentPath.baseSnapshotValue.length !== value.length;
        }
    }
    checkIfChanged(value) {
        // If we've already detected a change, just return
        if (this.snapshotChanged === true) {
            return;
        }
        this.snapshotChanged = this.currentPath.baseSnapshotValue !== value;
    }
    computeCopyBounds(array, selection) {
        // pageToken *can* be undefined
        if (selection.tokenDataKey !== undefined && selection.pageSize !== undefined) {
            const pagination = this.pagination(selection.tokenDataKey);
            const startingOffset = pagination.offsetFor(selection.pageToken);
            if (startingOffset === undefined) {
                return;
            }
            const endingOffset = pagination.limitToEnd(startingOffset + selection.pageSize);
            this.seenIds[selection.tokenDataKey] = true;
            return [startingOffset, endingOffset];
        }
        else {
            return [0, array.length];
        }
    }
    /**
     * This method is public *only* so CustomReaders can call it.
     */
    readPluralLink(propertyName, selection, record, data) {
        if (selection.fragment === undefined) {
            return;
        }
        const array = record[propertyName];
        const [start, end] = this.computeCopyBounds(array, selection) || [-1, -1];
        if (start < 0) {
            return this.markMissing();
        }
        const sink = (data[propertyName] = []);
        for (let i = start; i < end; i += 1) {
            this.enterPath(i);
            this.readSingleLink(i, selection, array, sink, i - start);
            this.exitPath();
        }
        this.checkIfArrayLengthChanged(sink);
        freeze(sink);
    }
    readObjectMap(propertyName, selection, record, data) {
        const obj = record[propertyName];
        if (obj === undefined) {
            if (selection.required === false) {
                return;
            }
            return this.markMissing();
        }
        const sink = (data[propertyName] = {});
        const keys$1 = keys(obj);
        for (let i = 0, len = keys$1.length; i < len; i += 1) {
            const key = keys$1[i];
            this.enterPath(key);
            this.readObject(key, selection, obj, sink);
            this.exitPath();
        }
        freeze(sink);
    }
    readLinkMap(propertyName, selection, record, data) {
        const map = record[propertyName];
        const keys$1 = keys(map);
        const sink = {};
        for (let i = 0, len = keys$1.length; i < len; i += 1) {
            const key = keys$1[i];
            this.enterPath(key);
            this.readSingleLink(key, selection, map, sink);
            this.exitPath();
        }
        this.assignNonScalar(data, propertyName, sink);
    }
    readSuccessResolveState(result, fragment) {
        if (isReaderFragment(fragment)) {
            const value = fragment.read(result.value, this);
            freeze(value);
            return {
                state: FragmentReadResultState.Success,
                value,
            };
        }
        if (fragment.opaque) {
            this.checkIfChanged(result.value);
            return {
                state: FragmentReadResultState.Success,
                value: result.value,
            };
        }
        if (isFragmentUnionSelection(fragment)) {
            return this.readFragmentUnion(result, fragment);
        }
        const sink = {};
        this.traverseSelections(fragment, result.value, sink);
        freeze(sink);
        return {
            state: FragmentReadResultState.Success,
            value: sink,
        };
    }
    readFragment(result, fragment) {
        if (isReaderFragment(fragment) && fragment.synthetic === true) {
            const value = fragment.read(this);
            freeze(value);
            return {
                state: FragmentReadResultState.Success,
                value,
            };
        }
        switch (result.state) {
            case StoreResolveResultState.NotPresent:
                return FRAGMENT_READ_RESULT_MISSING;
            case StoreResolveResultState.Error:
                return {
                    state: FragmentReadResultState.Error,
                    value: result.value,
                };
            default:
                return this.readSuccessResolveState(result, fragment);
        }
    }
    /**
     * This method is public *only* so CustomReaders can call it.
     */
    readPluralObject(propertyName, selection, record, data) {
        if (selection.selections === undefined) {
            return;
        }
        const array = record[propertyName];
        const [start, end] = this.computeCopyBounds(array, selection) || [-1, -1];
        if (start < 0) {
            return this.markMissing();
        }
        const sink = (data[propertyName] = []);
        for (let i = start; i < end; i += 1) {
            this.enterPath(i);
            const nextRecord = array[i];
            if (nextRecord === undefined) {
                this.markMissing();
                this.exitPath();
                return;
            }
            const obj = {};
            this.traverseSelections(selection, nextRecord, obj);
            push.call(sink, obj);
            freeze(obj);
            this.exitPath();
        }
        this.checkIfArrayLengthChanged(sink);
        freeze(sink);
    }
    readOpaque(sink, propertyName, value, required) {
        this.checkIfChanged(value);
        if (value === undefined && required === false) {
            return;
        }
        sink[propertyName] = value;
    }
    readScalarMap(propertyName, record, data, required) {
        const obj = record[propertyName];
        if (obj === undefined) {
            if (required !== false) {
                this.markMissing();
                return;
            }
            this.checkIfChanged(undefined);
            return;
        }
        const sink = (data[propertyName] = {});
        const keys$1 = keys(obj);
        for (let i = 0, len = keys$1.length; i < len; i += 1) {
            const key = keys$1[i];
            this.enterPath(key);
            this.readScalar(key, obj, sink);
            this.exitPath();
        }
        freeze(sink);
    }
    readScalarPlural(propertyName, record, data) {
        const array = record[propertyName];
        const sink = (data[propertyName] = []);
        // If the current snapshot is already know to be different from
        // previous snapshot, we can fast track and just copy the array
        // over.
        if (this.snapshotChanged === true) {
            // fast path: just copy from array to sink
            push.apply(sink, array);
            freeze(sink);
            return;
        }
        this.checkIfArrayLengthChanged(array);
        // tsc seems to think 'this.snapshotChanged' is constant false here,
        // and it flags comparisons of false === true as error 'ts(2367)'
        // Oddly, this comparison exactly the same as earlier, yet the earlier
        // has no tsc errors.
        // @ts-ignore
        if (this.snapshotChanged === true) {
            // fast path: just copy from array to sink
            push.apply(sink, array);
            freeze(sink);
            return;
        }
        for (let i = 0, len = array.length; i < len; i += 1) {
            this.enterPath(i);
            const value = array[i];
            push.call(sink, value);
            // the following method will change 'this.snapshotChanged'.
            // Later, check to see if 'this.snapshotChanged' is true,
            // if so, we can short-circuit the rest of this loop, and just
            // copy over the remainder of the array.
            this.checkIfChanged(value);
            this.exitPath();
            // see explanation for previous ts-ignore
            // @ts-ignore
            if (this.snapshotChanged === true) {
                // fast path the remainder: just copy from array to sink
                push.apply(sink, slice.call(array, i + 1));
                break;
            }
        }
        freeze(sink);
    }
    /**
     * This method is public *only* so CustomReaders can call it.
     */
    readScalar(propertyName, record, data, required) {
        if (!hasOwnProperty.call(record, propertyName)) {
            if (required !== false) {
                this.markMissing();
                return;
            }
            this.checkIfChanged(undefined);
            return;
        }
        this.assignScalar(propertyName, data, record[propertyName]);
    }
    assignScalar(propertyName, sink, value) {
        sink[propertyName] = value;
        this.checkIfChanged(value);
    }
    /**
     * This method is public *only* so CustomReaders can call it.
     */
    storeLookup(recordId) {
        let canonicalKey = recordId;
        const { redirects, records } = this;
        let value = records[canonicalKey];
        if (value === undefined) {
            // value is missing, check that it has not been redirected
            while (redirects[canonicalKey] !== undefined) {
                this.seenIds[canonicalKey] = true;
                canonicalKey = redirects[canonicalKey];
            }
            value = records[canonicalKey];
            // value is still undefined after following redirects
            if (value === undefined) {
                return undefined;
            }
        }
        const ttl = this.expirationMap[canonicalKey];
        if (ttl !== undefined) {
            const { fresh, stale } = ttl;
            const { timestamp } = this;
            if (timestamp > fresh) {
                if (timestamp <= stale) {
                    this.markStale();
                    return value;
                }
                return undefined;
            }
        }
        return value;
    }
    selectUnion(selection, storeEntry, discriminatedObject, sink) {
        const { discriminator } = selection;
        const discriminatorValue = discriminatedObject[discriminator];
        if (process.env.NODE_ENV !== 'production') {
            validateUnionSelection(discriminatedObject, selection, this.currentPath);
        }
        const unionSelection = selection.unionSelections[discriminatorValue];
        const childSelection = {
            selections: unionSelection.selections,
            private: unionSelection.private,
            name: selection.name,
            kind: selection.kind,
        };
        this.traverseSelection(childSelection, storeEntry, sink);
    }
    selectObjectUnion(selection, source, sink) {
        const { name: propertyName } = selection;
        const object = source[propertyName];
        if (object === undefined) {
            this.markMissing();
            return;
        }
        if (selection.nullable === true && object === null) {
            this.readScalar(propertyName, source, sink);
            return;
        }
        this.selectUnion(selection, source, object, sink);
    }
    traverseSelection(selection, record, data) {
        const { variables } = this;
        const key = getStorageKey(selection, variables);
        if (isUnionObjectSelection(selection)) {
            this.selectObjectUnion(selection, record, data);
            return;
        }
        if (selection.kind === 'Link') {
            if (selection.plural === true) {
                this.readPluralLink(key, selection, record, data);
            }
            else if (selection.map === true) {
                this.readLinkMap(key, selection, record, data);
            }
            else {
                this.readSingleLink(key, selection, record, data);
            }
        }
        else if (selection.kind === 'Scalar') {
            if (selection.map === true) {
                this.readScalarMap(key, record, data, selection.required !== false);
            }
            else if (selection.plural === true) {
                this.readScalarPlural(key, record, data);
            }
            else {
                this.readScalar(key, record, data, selection.required);
            }
        }
        else if (selection.kind === 'Object') {
            if (selection.map === true) {
                this.readObjectMap(key, selection, record, data);
            }
            else if (selection.plural === true) {
                this.readPluralObject(key, selection, record, data);
            }
            else {
                this.readObject(key, selection, record, data);
            }
        }
        else if (selection.kind === 'Custom') {
            selection.reader(key, selection, record, data, variables, this);
        }
    }
    traverseSelections(node, record, data) {
        const { selections } = node;
        if (selections === undefined) {
            this.selectAll(record, data);
            return;
        }
        const { length: len } = selections;
        for (let i = 0; i < len; i += 1) {
            const selection = selections[i];
            this.enterPath(selection.name);
            this.traverseSelection(selection, record, data);
            this.exitPath();
        }
    }
}

// Cannot use a symbol because we cannot serialize a symbol
// Also, IE11 polyfill have problems when a lot of symbols
// are created
var StoreErrorStatus;
(function (StoreErrorStatus) {
    StoreErrorStatus[StoreErrorStatus["RESOURCE_NOT_FOUND"] = 404] = "RESOURCE_NOT_FOUND";
})(StoreErrorStatus || (StoreErrorStatus = {}));
var StoreRecordType;
(function (StoreRecordType) {
    StoreRecordType["Error"] = "error";
})(StoreRecordType || (StoreRecordType = {}));
function isStoreRecordError(storeRecord) {
    return storeRecord.__type === StoreRecordType.Error;
}
function hasOverlappingIds(snapshot, visitedIds) {
    const { length: len } = visitedIds;
    const { seenRecords } = snapshot;
    for (let i = 0; i < len; i += 1) {
        const id = visitedIds[i];
        if (seenRecords[id] || id === snapshot.recordId) {
            return true;
        }
    }
    return false;
}
function getMatchingIds(prefix, visitedIds) {
    const matchingIds = [];
    for (let i = 0, len = visitedIds.length; i < len; i++) {
        const visitedId = visitedIds[i];
        if (visitedId.indexOf(prefix) === 0) {
            push.call(matchingIds, visitedId);
        }
    }
    return matchingIds;
}
class Store {
    constructor() {
        this.recordExpirations = create(null);
        this.records = create(null);
        this.snapshotSubscriptions = [];
        this.watchSubscriptions = [];
        this.visitedIds = create(null);
        this.insertedIds = create(null);
        this.redirectKeys = create(null);
        this.reverseRedirectKeys = create(null);
    }
    reset() {
        this.recordExpirations = create(null);
        this.records = create(null);
        this.snapshotSubscriptions = [];
        this.watchSubscriptions = [];
        this.visitedIds = create(null);
        this.insertedIds = create(null);
        this.redirectKeys = create(null);
        this.reverseRedirectKeys = create(null);
    }
    redirect(key, canonicalKey) {
        const { redirectKeys, reverseRedirectKeys } = this;
        if (key === canonicalKey) {
            throw new Error('cannot redirect a key to itself');
        }
        if (reverseRedirectKeys[canonicalKey] !== undefined) {
            throw new Error('cannot have multiple redirects keys point to the same canonical key');
        }
        if (redirectKeys[canonicalKey] !== undefined) {
            throw new Error('the canonical key must be terminal and cannot already be part of a redirect chain');
        }
        redirectKeys[key] = canonicalKey;
        reverseRedirectKeys[canonicalKey] = key;
        // evict key at original location as it now lives at the canonical key
        delete this.records[key];
        this.visitedIds[key] = true;
    }
    publish(recordId, record) {
        const { records, visitedIds, insertedIds, reverseRedirectKeys } = this;
        // make sure we publish to the canonical record id in case it's been redirected
        const canonicalKey = this.getCanonicalRecordId(recordId);
        if (hasOwnProperty.call(records, canonicalKey) === false) {
            insertedIds[canonicalKey] = true;
        }
        records[canonicalKey] = record;
        if (process.env.NODE_ENV !== 'production') {
            freeze(record);
        }
        visitedIds[canonicalKey] = true;
        // mark all redirects leading up to the canonical key as visited so
        // affected snapshots are updated
        let redirectKey = reverseRedirectKeys[canonicalKey];
        while (redirectKey !== undefined) {
            visitedIds[redirectKey] = true;
            redirectKey = reverseRedirectKeys[redirectKey];
        }
    }
    /**
     * Given a record id, this method returns the key where the corresponding data is actually stored.
     * It could be that this record id has been redirected, so this method will follow the redirects, if applicable,
     * and return the canonical key for the record
     * @param recordId The original location of the record
     * @returns The canonical key where the record is stored
     */
    getCanonicalRecordId(recordId) {
        let canonicalKey = recordId;
        const { redirectKeys } = this;
        while (redirectKeys[canonicalKey]) {
            canonicalKey = redirectKeys[canonicalKey];
        }
        return canonicalKey;
    }
    setExpiration(recordId, expiration, staleExpiration) {
        this.recordExpirations[recordId] = {
            fresh: expiration,
            stale: staleExpiration === undefined ? expiration : staleExpiration,
        };
    }
    broadcast(rebuildSnapshot, snapshotAvailable) {
        // Note: we should always get the subscription references from this at the beginning
        // of the function, in case the reference changes (because of an unsubscribe)
        const { snapshotSubscriptions, watchSubscriptions, visitedIds, insertedIds, records, redirectKeys, } = this;
        const allVisitedIds = keys(visitedIds);
        // Early exit if nothing has changed
        if (allVisitedIds.length === 0) {
            return;
        }
        // Process snapshot subscriptions
        for (let i = 0, len = snapshotSubscriptions.length; i < len; i++) {
            const subscription = snapshotSubscriptions[i];
            const { snapshot, callback } = subscription;
            // Don't re-emit the snapshot if there is no overlap between the visited keys and the
            // snapshot seen keys.
            if (isErrorSnapshot(snapshot) || hasOverlappingIds(snapshot, allVisitedIds) === false) {
                continue;
            }
            const updatedSnapshot = rebuildSnapshot(snapshot, records, {}, redirectKeys);
            // if the rebuilt snapshot is pending then continue on, broadcast will get
            // called again once the pending snapshot is resolved
            if (isPendingSnapshot(updatedSnapshot)) {
                continue;
            }
            subscription.snapshot = updatedSnapshot;
            if (snapshotAvailable(updatedSnapshot) && updatedSnapshot !== snapshot) {
                callback(updatedSnapshot);
            }
            else if (isUnfulfilledSnapshot(updatedSnapshot)) {
                const { refresh } = updatedSnapshot;
                if (refresh !== undefined) {
                    refresh.resolve(refresh.config);
                }
            }
        }
        // Process watch subscriptions
        for (let i = 0, len = watchSubscriptions.length; i < len; i++) {
            const { prefix, callback } = watchSubscriptions[i];
            const matchingIds = getMatchingIds(prefix, allVisitedIds);
            if (matchingIds.length > 0) {
                const watchCallbackEntries = [];
                for (let i = 0, len = matchingIds.length; i < len; i++) {
                    const id = matchingIds[i];
                    const inserted = insertedIds[id] || false;
                    push.call(watchCallbackEntries, { id, inserted });
                }
                callback(watchCallbackEntries);
            }
        }
        this.visitedIds = create(null);
        this.insertedIds = create(null);
    }
    /**
     * Broadcasts an ErrorSnapshot to any Pending snapshots for the given
     * recordId.
     */
    broadcastNonCachedSnapshot(recordId, errorSnapshot) {
        // Note: we should always get the subscription references from this at the beginning
        // of the function, in case the reference changes (because of an unsubscribe)
        const { snapshotSubscriptions } = this;
        for (let i = 0, len = snapshotSubscriptions.length; i < len; i++) {
            const subscription = snapshotSubscriptions[i];
            const { snapshot, callback } = subscription;
            // if the subscriber is pending and its recordId matches then emit
            // the error to it
            if (isPendingSnapshot(snapshot) && snapshot.recordId === recordId) {
                subscription.snapshot = errorSnapshot;
                callback(errorSnapshot);
            }
        }
    }
    lookup(selector, createSnapshot, refresh) {
        const { records, recordExpirations, redirectKeys } = this;
        return createSnapshot(records, recordExpirations, redirectKeys, selector, refresh);
    }
    subscribe(snapshot, callback) {
        const subscription = { snapshot, callback };
        this.snapshotSubscriptions = [...this.snapshotSubscriptions, subscription];
        return () => {
            const { snapshotSubscriptions } = this;
            const index = indexOf.call(snapshotSubscriptions, subscription);
            this.snapshotSubscriptions = [
                ...slice.call(snapshotSubscriptions, 0, index),
                ...slice.call(snapshotSubscriptions, index + 1),
            ];
            if (process.env.NODE_ENV !== 'production') {
                this.snapshotSubscriptions = freeze(this.snapshotSubscriptions);
            }
        };
    }
    watch(prefix, callback) {
        const subscription = { prefix, callback };
        this.watchSubscriptions = [...this.watchSubscriptions, subscription];
        return () => {
            const { watchSubscriptions } = this;
            const index = indexOf.call(watchSubscriptions, subscription);
            this.watchSubscriptions = [
                ...slice.call(watchSubscriptions, 0, index),
                ...slice.call(watchSubscriptions, index + 1),
            ];
            if (process.env.NODE_ENV !== 'production') {
                this.watchSubscriptions = freeze(this.watchSubscriptions);
            }
        };
    }
    /**
     * Evicts data at the canonical key location and marks any redirects (if applicable)
     * to the key as visited
     * @param key key to evict
     */
    evict(key) {
        // find and evict the canonical key
        const canonicalKey = this.getCanonicalRecordId(key);
        delete this.records[canonicalKey];
        this.visitedIds[canonicalKey] = true;
        // mark all redirects leading up to the canonical key as visited so
        // affected snapshots are updated
        let redirectKey = this.reverseRedirectKeys[canonicalKey];
        while (redirectKey !== undefined) {
            this.visitedIds[redirectKey] = true;
            redirectKey = this.reverseRedirectKeys[redirectKey];
        }
    }
    /**
     * Deallocates data at the canonical key location for in-memory (L1) cache
     * @param key key to deallocate
     */
    dealloc(key) {
        // find and deallocate the canonical key
        const canonicalKey = this.getCanonicalRecordId(key);
        delete this.records[canonicalKey];
    }
    createReader(records, recordExpirations, redirects, variables, refresh, baseSnapshot) {
        return new Reader(records, recordExpirations, redirects, variables, refresh, baseSnapshot);
    }
}

function isNodeLink(node) {
    return (typeof node === 'object' &&
        node !== null &&
        hasOwnProperty.call(node, '__ref'));
}
var GraphNodeType;
(function (GraphNodeType) {
    GraphNodeType["Link"] = "Link";
    GraphNodeType["Node"] = "Node";
    GraphNodeType["Error"] = "Error";
})(GraphNodeType || (GraphNodeType = {}));
class GraphNodeError {
    constructor(store, data) {
        this.type = GraphNodeType.Error;
        this.store = store;
        this.data = data;
    }
    retrieve() {
        return this.data;
    }
}
function followLink(store, key) {
    const canonicalKey = store.getCanonicalRecordId(key);
    return store.records[canonicalKey];
}
class GraphLink {
    constructor(store, data) {
        this.type = GraphNodeType.Link;
        this.store = store;
        this.data = data;
    }
    isPending() {
        return this.data.pending === true;
    }
    isMissing() {
        return this.data.isMissing === true;
    }
    follow() {
        const { __ref } = this.data;
        if (__ref === undefined) {
            return null;
        }
        const linked = followLink(this.store, __ref);
        if (linked === null || linked === undefined) {
            return null;
        }
        if (isStoreRecordError(linked)) {
            return new GraphNodeError(this.store, linked);
        }
        return new GraphNode(this.store, linked);
    }
    linkData() {
        return this.data.data;
    }
    writeLinkData(data) {
        this.data.data = data;
    }
}
class GraphNode {
    constructor(store, data) {
        this.type = GraphNodeType.Node;
        this.store = store;
        this.data = data;
    }
    object(propertyName) {
        const value = this.data[propertyName];
        if (isNodeLink(value)) {
            throw new Error(`Cannot walk to path ${propertyName}. "${propertyName}" is a link: "${value}"`);
        }
        if (typeof value !== 'object' || value === null) {
            throw new Error(`Cannot walk to path ${propertyName}. "${propertyName}" is a scalar: "${value}"`);
        }
        return new GraphNode(this.store, value);
    }
    link(propertyName) {
        const value = this.data[propertyName];
        if (!isNodeLink(value)) {
            throw new Error(`Cannot walk to link ${propertyName}. "${propertyName}" is not a link: "${value}"`);
        }
        return new GraphLink(this.store, value);
    }
    scalar(propertyName) {
        const value = this.data[propertyName];
        if (typeof value === 'object' && value !== null) {
            throw new Error(`Cannot return value at path ${propertyName}. ${propertyName} is not a scalar.`);
        }
        return value;
    }
    keys() {
        return keys(this.data);
    }
    isScalar(propertyName) {
        // TODO W-6900046 - merge.ts casts these to any and manually sets `data`
        // so this guard is required
        if (this.data === undefined) {
            return true;
        }
        const value = this.data[propertyName];
        return typeof value !== 'object' || value === null;
    }
    write(propertyName, value) {
        this.data[propertyName] = value;
    }
    isUndefined(propertyName) {
        return this.data[propertyName] === undefined;
    }
    retrieve() {
        return this.data;
    }
}

var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["Ok"] = 200] = "Ok";
    HttpStatusCode[HttpStatusCode["Created"] = 201] = "Created";
    HttpStatusCode[HttpStatusCode["NoContent"] = 204] = "NoContent";
    HttpStatusCode[HttpStatusCode["NotModified"] = 304] = "NotModified";
    HttpStatusCode[HttpStatusCode["NotFound"] = 404] = "NotFound";
    HttpStatusCode[HttpStatusCode["BadRequest"] = 400] = "BadRequest";
    HttpStatusCode[HttpStatusCode["ServerError"] = 500] = "ServerError";
})(HttpStatusCode || (HttpStatusCode = {}));

class Environment {
    constructor(store, networkAdapter) {
        this.store = store;
        this.networkAdapter = networkAdapter;
        // bind these methods so when they get passed into the
        // Store, the this reference is preserved
        this.createSnapshot = this.createSnapshot.bind(this);
        this.rebuildSnapshot = this.rebuildSnapshot.bind(this);
    }
    dispatchResourceRequest(request) {
        return this.networkAdapter(request);
    }
    resolveUnfulfilledSnapshot(request, _snapshot) {
        return this.networkAdapter(request);
    }
    resolveSnapshot(snapshot, refresh) {
        const { resolve, config } = refresh;
        // kick off network refresh, don't await, it will broadcast once it resolves
        resolve(config);
        // synchronously return a pending snapshot
        return { ...snapshot, state: SnapshotState.Pending };
    }
    storeIngest(key, ingest, response, luvio) {
        if (ingest !== null) {
            ingest(response, {
                fullPath: key,
                parent: null,
                propertyName: null,
            }, luvio, this.store, Date.now());
        }
    }
    storeIngestError(key, errorSnapshot, ttl) {
        const { error } = errorSnapshot;
        const { status } = error;
        if (status === HttpStatusCode.NotFound) {
            const entry = {
                __type: StoreRecordType.Error,
                status: StoreErrorStatus.RESOURCE_NOT_FOUND,
                error,
            };
            freeze(entry);
            this.storePublish(key, entry);
            if (ttl !== undefined) {
                this.storeSetExpiration(key, Date.now() + ttl);
            }
            return;
        }
        // this error is not cached, notify any pending subscribers here
        // since broadcast only deals with cached recordIds
        this.store.broadcastNonCachedSnapshot(key, errorSnapshot);
    }
    storePublish(key, data) {
        this.store.publish(key, data);
    }
    storeRedirect(existingKey, redirectKey) {
        this.store.redirect(existingKey, redirectKey);
    }
    storeGetCanonicalKey(key) {
        return this.store.getCanonicalRecordId(key);
    }
    storeBroadcast(rebuildSnapshot, snapshotAvailable) {
        this.store.broadcast(rebuildSnapshot, snapshotAvailable);
    }
    storeSubscribe(snapshot, callback) {
        return this.store.subscribe(snapshot, callback);
    }
    storeWatch(prefix, callback) {
        return this.store.watch(prefix, callback);
    }
    storeLookup(sel, createSnapshot, refresh) {
        return this.store.lookup(sel, createSnapshot, refresh);
    }
    storeEvict(key) {
        this.store.evict(key);
    }
    storeDealloc(key) {
        this.store.dealloc(key);
    }
    storeReset() {
        this.store.reset();
    }
    snapshotAvailable(snapshot) {
        return (isFulfilledSnapshot(snapshot) ||
            isErrorSnapshot(snapshot) ||
            isPendingSnapshot(snapshot));
    }
    storeSetExpiration(recordId, expiration, staleExpiration) {
        this.store.setExpiration(recordId, expiration, staleExpiration);
    }
    storeCreateReader(records, recordExpirations, redirects, selector, refresh, baseSnapshot) {
        return this.store.createReader(records, recordExpirations, redirects, selector.variables, refresh, baseSnapshot);
    }
    createSnapshot(records, recordExpirations, redirects, selector, refresh) {
        return this.store
            .createReader(records, recordExpirations, redirects, selector.variables, refresh)
            .read(selector);
    }
    rebuildSnapshot(snapshot, records, recordExpirations, redirects) {
        return this.store
            .createReader(records, recordExpirations, redirects, snapshot.variables, snapshot.refresh, snapshot)
            .read(snapshot.select);
    }
    getStoreRecords() {
        return this.store.records;
    }
    getStoreVisitedIds() {
        return this.store.visitedIds;
    }
    getStoreRecordExpirations() {
        return this.store.recordExpirations;
    }
    getStoreRedirectKeys() {
        return this.store.redirectKeys;
    }
    getNode(key) {
        const canonicalKey = this.store.getCanonicalRecordId(key);
        const value = this.store.records[canonicalKey];
        // doesn't exist
        if (value === undefined) {
            return null;
        }
        return this.wrapNormalizedGraphNode(value);
    }
    wrapNormalizedGraphNode(normalized) {
        if (normalized === null) {
            return null;
        }
        if (isStoreRecordError(normalized)) {
            return new GraphNodeError(this.store, normalized);
        }
        return new GraphNode(this.store, normalized);
    }
    withContext(adapter, onContextLoaded) {
        // simple in-memory object stores metadata
        const contextStore = create(null);
        const context = {
            set(key, value) {
                contextStore[key] = value;
            },
            get(key) {
                return contextStore[key];
            },
        };
        // if no onContextLoaded hook then return a function that
        // simply returns the adapter
        if (onContextLoaded === undefined) {
            return (config) => {
                return adapter(config, context);
            };
        }
        // if we got here then we need to return a function that awaits the
        // onContextLoaded hook only on the first invocation.
        let firstRun = true;
        const hookAsPromise = onContextLoaded(context);
        return (config) => {
            if (firstRun) {
                return hookAsPromise.then(() => {
                    firstRun = false;
                    return adapter(config, context); // TODO - remove as any cast after https://github.com/salesforce/luvio/pull/230
                });
            }
            return adapter(config, context);
        };
    }
}

class Luvio {
    constructor(environment, options = {}) {
        this.environment = environment;
        this.options = options;
    }
    pagination(key) {
        const records = this.environment.getStoreRecords();
        let data = records[key];
        data = data && { ...data };
        return pagination(data, (pd) => {
            this.storePublish(key, pd);
        });
    }
    storePublish(key, data) {
        this.environment.storePublish(key, data);
    }
    storeRedirect(existingKey, canonicalKey) {
        this.environment.storeRedirect(existingKey, canonicalKey);
    }
    storeGetCanonicalKey(key) {
        return this.environment.storeGetCanonicalKey(key);
    }
    storeBroadcast() {
        this.environment.storeBroadcast(this.environment.rebuildSnapshot, this.environment.snapshotAvailable);
    }
    storeIngest(key, ingest, response) {
        this.environment.storeIngest(key, ingest, response, this);
    }
    storeIngestError(key, errorSnapshot, ttl) {
        return this.environment.storeIngestError(key, errorSnapshot, ttl);
    }
    /**
     * Subscribe to the Luvio store to observe any changes to the data in the given
     * snapshot.
     *
     * NOTE: Errors are terminal - the callback will never be called after an ErrorSnapshot
     * is emitted (or if the given Snapshot is an ErrorSnapshot).
     *
     * @template D
     * @template V
     * @param {Snapshot<D, V>} snapshot The snapshot that contains data to observe.
     * @param {SnapshotSubscriptionCallback<D, V>} callback The callback to be called
     * whenever the given snapshot's data changes.  NOTE: the snapshot passed to the
     * callback will have consistent, normalized data - however it is not guaranteed
     * to be within the TTL of that data type.
     * @returns {Unsubscribe} A function that will unsubscribe when invoked.
     * @memberof Luvio
     */
    storeSubscribe(snapshot, callback) {
        return this.environment.storeSubscribe(snapshot, callback);
    }
    storeWatch(prefix, callback) {
        return this.environment.storeWatch(prefix, callback);
    }
    storeLookup(sel, refresh) {
        return this.environment.storeLookup(sel, this.environment.createSnapshot, refresh);
    }
    storeEvict(key) {
        this.environment.storeEvict(key);
    }
    storeSetExpiration(recordId, expiration, staleExpiration) {
        this.environment.storeSetExpiration(recordId, expiration, staleExpiration);
    }
    createSnapshot(records, recordExpirations, redirects, selector, refresh) {
        return this.environment.createSnapshot(records, recordExpirations, redirects, selector, refresh);
    }
    errorSnapshot(error, refresh) {
        return createErrorSnapshot(error, refresh);
    }
    dispatchResourceRequest(resourceRequest, overrides) {
        let mergedResourceRequest = resourceRequest;
        // Apply resource request override if passed as argument.
        if (overrides !== undefined) {
            mergedResourceRequest = {
                ...resourceRequest,
                headers: {
                    ...resourceRequest.headers,
                    ...overrides.headers,
                },
            };
        }
        return this.environment.dispatchResourceRequest(mergedResourceRequest);
    }
    resolveUnfulfilledSnapshot(resourceRequest, snapshot) {
        return this.environment.resolveUnfulfilledSnapshot(resourceRequest, snapshot);
    }
    /**
     * Kicks off snapshot resolution (without awaiting it) and returns a Pending
     * snapshot.
     */
    resolveSnapshot(snapshot, refresh) {
        return this.environment.resolveSnapshot(snapshot, refresh);
    }
    refreshSnapshot(snapshot) {
        const { refresh } = snapshot;
        if (refresh !== undefined) {
            const { config, resolve } = refresh;
            return resolve(config);
        }
        throw new Error('Snapshot is not refreshable');
    }
    getNode(key) {
        return this.environment.getNode(key);
    }
    wrapNormalizedGraphNode(normalized) {
        return this.environment.wrapNormalizedGraphNode(normalized);
    }
    instrument(paramsBuilder) {
        const { instrument } = this.options;
        if (instrument) {
            instrument(paramsBuilder());
        }
    }
    /**
     * Returns true if the given snapshot can be returned to userland without
     * requiring any additional resolution.
     */
    snapshotAvailable(snapshot) {
        return this.environment.snapshotAvailable(snapshot);
    }
    withContext(adapter, onContextLoaded) {
        return this.environment.withContext(adapter, onContextLoaded);
    }
}
// engine version: 0.31.2-47f0217

const store = new Store();
const environment = new Environment(store, networkAdapter);
const luvio = new Luvio(environment, {
    instrument: instrumentation.instrumentNetwork.bind(instrumentation),
});
setupInstrumentation(luvio, store);

const OBJECT_INFO_PREFIX = 'UiApi::ObjectInfoRepresentation:';
const STORAGE_DROP_MARK_NAME = 'storage-drop';
const STORAGE_DROP_MARK_CONTEXT = {
    reason: 'Object info changed',
};
/**
 * Watch a Luvio instance for metadata changes.
 */
function setupMetadataWatcher(luvio) {
    // Watch for object info changes. Since we don't have enough information to understand to which
    // extent an object info change may impact the application the only thing we do is to clear all
    // the  persistent storages.
    luvio.storeWatch(OBJECT_INFO_PREFIX, entries => {
        for (let i = 0, len = entries.length; i < len; i++) {
            const entry = entries[i];
            const isObjectInfoUpdated = entry.inserted === false;
            if (isObjectInfoUpdated) {
                mark(STORAGE_DROP_MARK_NAME, STORAGE_DROP_MARK_CONTEXT);
                clearStorages().catch(() => {
                    /* noop */
                });
                break;
            }
        }
    });
}

setupMetadataWatcher(luvio);

export { luvio };
// version: 1.11.3-03778f23
