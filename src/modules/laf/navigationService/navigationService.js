import { getContextValues, provideContextValue } from "laf/contextService";
import { equalityUtils } from "force/shared";

const NAV_SERVICE_CONTEXT_KEY = {};

function getDelegates(context) {
    return getContextValues(context, NAV_SERVICE_CONTEXT_KEY);
}

/*
function validateType(pageType) {
    // Type is a required string. null/undefined/"" not allowed.
    if (!pageType) {
        return "type must be non-empty string";
    }
    if (!typeUtils.isString(pageType)) {
        return "type must be a string";
    }
    return null;
}

function validateAttributes(pageRef) {
    // attribute is a required object.
    if (!typeUtils.isPlainObject(pageRef.attributes)) {
        return "attributes must be an object";
    }
    const keys = Object.keys(pageRef.attributes);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const val = pageRef.attributes[k];
        // null/undefined attributes are valid
        if (!equalityUtils.isUndefinedOrNull(val)) {
            if (!typeUtils.isString(val)) {
                if (typeUtils.isObject(val)) {
                    // componentDefRef needs attributes as an object, but we won't be so kind with other types
                    if (pageRef.type !== "standard__directCmpReference") {
                        const msg = validatePageReferenceStructure(val);
                        if (msg) {
                            return "Expected attributes[" + k + "] to be an embedded page reference, but is invalid: " + msg;
                        }
                    }
                } else {
                    return "Expected attributes[" + k + "] to be a string";
                }
            }
        }
    }
    return null;
}

function validateState(state) {
    // empty state is allowed
    if (!equalityUtils.isUndefinedOrNull(state)) {
        if (!typeUtils.isPlainObject(state)) {
            return "state must be an object";
        }
        const keys = Object.keys(state);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const val = state[k];
            // null/undefined attributes are valid
            if (!equalityUtils.isUndefinedOrNull(val)) {
                if (!typeUtils.isString(val)) {
                    return "Expected state[" + k + "] to be a string";
                }
            }
        }
    }
    return null;
}

function validatePageReferenceStructure(pageRef) {
    // null pageRef is allowed
    if (pageRef === null) {
        return null;
    }

    let msg;
    msg = validateType(pageRef.type);
    if (!msg) {
        msg = validateAttributes(pageRef);
        if (!msg) {
            msg = validateState(pageRef.state);
            if (!msg) {
                return null;
            }
        }
    }
    return msg;
}

function assertValidPageReferenceStructure(pageRef) {
    const msg = validatePageReferenceStructure(pageRef);
    if (msg) {
        throw new Error(msg);
    }
}
*/

// eslint-disable-next-line no-script-url
const DEFAULT_URL_PROMISE = Promise.resolve("javascript:void(0);");

function extractOnlyPageReference(pageRef) {
    return {
        type: pageRef.type,
        attributes: equalityUtils.isUndefinedOrNull(pageRef.attributes) ? {} : clonePOJO(pageRef.attributes),
        state: equalityUtils.isUndefinedOrNull(pageRef.state) ? {} : clonePOJO(pageRef.state)
    };
}

function clonePOJO(obj) {
    return JSON.parse(JSON.stringify(obj));
}

class NavigationServiceClient {
    constructor(context) {
        Object.defineProperty(this, "context", {
            value: context,
            writable: false
        });
    }

    navigateTo(pageReference, options) {
        if (pageReference) {
            pageReference = extractOnlyPageReference(pageReference);
        }
        // TODO: Re-enable after the real fix on W-4849816
        // assertValidPageReferenceStructure(pageReference);
        const service = getDelegates(this.context).find(delegate => delegate.navigateTo);
        if (service) {
            service.navigateTo(pageReference, options);
        }
        // No-op if we can't find a service
    }

    generateUrl(pageReference, options) {
        if (pageReference) {
            pageReference = extractOnlyPageReference(pageReference);
        }
        // TODO: Re-enable after the real fix on W-4849816
        // assertValidPageReferenceStructure(pageReference);
        const service = getDelegates(this.context).find(delegate => delegate.generateUrl);
        if (service) {
            return service.generateUrl(pageReference, options);
        }
        // If there's no provided service, return something valid, but not an error
        return DEFAULT_URL_PROMISE;
    }

    resolveUrl(url) {
        const service = getDelegates(this.context).find(delegate => delegate.resolveUrl);
        if (!service) {
            // If there's no provided service, return something valid, but not an error
            return {
                type: "standard__directCmpReference",
                attributes: {
                    name: "one:unsupported",
                    attributes: {}
                },
                state: {}
            };
        }
        return service.resolveUrl(url);
    }

    resolvePage(pageReference) {
        const service = getDelegates(this.context).find(delegate => delegate.resolvePage);
        if (!service) {
            // If there's no provided service, return unsupported page but not an error
            return Promise.resolve({
                type: "standard__directCmpReference",
                attributes: {
                    name: "one:unsupported",
                    attributes: {}
                },
                componentDefRef: {
                    componentDef: "one:unsupported"
                },
                state: {}
            });
        }
        return service.resolvePage(pageReference);
    }
}

export function getService(context) {
    return new NavigationServiceClient(context);
}

export function provideService(context, navService) {
    provideContextValue(context, NAV_SERVICE_CONTEXT_KEY, navService);
}
