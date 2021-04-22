import { getContextValue, provideContextValue } from "laf/contextService";
import { Observable } from "force/observables";

const PAGE_CONTEXT_KEY = {};

function getDelegate(context) {
    return getContextValue(context, PAGE_CONTEXT_KEY);
}

const DEFAULT_OBSERVABLE = new Observable(() => {}); // Observable that never emits

class PageServiceClient {
    constructor(context) {
        Object.defineProperty(this, "context", {
            value: context,
            writable: false
        });
    }

    /*
     * Returns an Observable that emits the current page reference within the scope of this client.
     * @return {Observable}
     */
    getCurrentPageReference() {
        // return a replay Observable that asynchronously connects to the delegate's
        // Observable for this API
        const delegate = getDelegate(this.context);
        return delegate ? delegate.getCurrentPageReference() : DEFAULT_OBSERVABLE;
    }
}

export function getService(context) {
    return new PageServiceClient(context);
}

export function provideService(context, pageService) {
    provideContextValue(context, PAGE_CONTEXT_KEY, pageService);
}

const aName = "$A";
const A = window[aName];

export function getReadOnly(pageReference) {
    if (pageReference) {
        // Assumes there are no cycles here, which will cause infinite recursion
        // Deep clone attributes. Return a spec object (i.e. no functions!).
        const clonedPageReference = {
            type: pageReference.type,
            attributes: A.util.apply({}, pageReference.attributes, true, true),
            state: A.util.apply({}, pageReference.state, true, true)
        };
        return makeImmutable(clonedPageReference);
    }
    return null;
}

// TODO: investigate using a Defensive Proxy from Raptor instead once it's provided
function makeImmutable(obj) {
    const props = Object.getOwnPropertyNames(obj);
    props.forEach((name) => {
        const prop = obj[name];
        if (typeof prop === 'object' && prop !== null) {
            makeImmutable(prop);
        }
    });
    return Object.freeze(obj);
}