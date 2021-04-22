import { getContextBinder } from "./contextBinder";
import { KEY, isFunction } from "./shared";

const SR_DOM_EVENT = "wirecontextevent";

function handleEvent(evt) {
    // Prevent an element from retrieving a context binding to itself
    if (evt.target !== this) {
        const { key, contextKey, callback } = evt.detail;
        if (key === KEY) {
            const binder = getContextBinder(contextKey);
            if (binder) {
                if (binder.hasBinding(this)) {
                    // Allow propagation so all handlers in the event path may invoke the callback
                    // with their own bindings
                    callback(binder.getBinding(this));
                }
            }
        }
    }
}

const LISTENERS = new WeakSet();

export function addDomProvider(contextBinding, element, contextKey, value) {
    if (element) {
        const binder = getContextBinder(contextKey);
        binder.bind(element, {contextBinding, value});
        if (!LISTENERS.has(element)) {
            LISTENERS.add(element);
            element.addEventListener(SR_DOM_EVENT, handleEvent.bind(element));
        }
    }
}

export class DomContextBinding {
    constructor(context) {
        Object.defineProperty(this, "context", {
            value: context,
            writable: false
        });
    }

    get(contextKey) {
        const provisions = [];
        const srEvent = new CustomEvent(SR_DOM_EVENT, {
            bubbles    : true,
            cancelable : true,
            composed   : true,
            detail     : {
                key: KEY,
                contextKey,
                callback: (contextProvision) => {
                    provisions.push(contextProvision);
                }
            }
        });
        this.context.dispatchEvent(srEvent);
        return provisions;
    }

    provide(contextKey, value) {
        addDomProvider(this, this.context, contextKey, value);
    }

    static create(anything) {
        return this.isEventTarget(anything)  ?
            new DomContextBinding(anything) :
            null;
    }

    static isEventTarget(anything) {
        return anything &&
            isFunction(anything.dispatchEvent) &&
            isFunction(anything.addEventListener) &&
            isFunction(anything.removeEventListener);
    }
}