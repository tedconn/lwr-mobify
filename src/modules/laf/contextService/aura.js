import { addDomProvider } from "./dom";
import { getContextBinder } from "./contextBinder";
import { KEY, isNullOrUndefined, isFunction } from "./shared";

const SR_AURA_EVENT = "markup://force:serviceRequest";

function addDomProviders(contextBinding, elements, contextKey, value) {
    elements.forEach(elem => addDomProvider(contextBinding, elem, contextKey, value));
}

// Apparently developers need handcuffs
const aName = "$A";
const A = window[aName];

function handleEvent(evt) {
    // Prevent an element from retrieving a context binding to itself
    if (evt.getSource() !== this) {
        const { key, contextKey, callback } = evt.getParams();
        if (key === KEY && evt.getSource() !== this) {
            const binder = getContextBinder(contextKey);
            if (binder.hasBinding(this)) {
                // Allow propagation so all handlers in the event path may invoke the callback
                // with their own bindings
                evt.preventDefault();
                callback(binder.getBinding(this));
            }
        }
    }
}

const LISTENERS = new WeakSet();

function addProvider(contextBinding, component, contextKey, value) {
    const binder = getContextBinder(contextKey);
    binder.bind(component, {contextBinding, value});
    if (!LISTENERS.has(component)) {
        LISTENERS.add(component);
        component.addEventHandler(
            SR_AURA_EVENT,
            handleEvent.bind(component),
            "bubble",
            true
        );
    }
}

export class AuraContextBinding {
    constructor(context) {
        Object.defineProperty(this, "context", {
            value: context,
            writable: false
        });
    }

    get(contextKey) {
        const provisions = [];
        // NOTE: This *MUST* be done in the current execution context so that Aura will attribute it
        // to the component in whose call stack this event is fired.
        // It ONLY runs for Aura components, and hinges on the Aura context to work correctly.
        // Do *NOT* change this to import dispatchGlobalEvent from aura as it will completely break
        // this entire module.
        A.getEvt(SR_AURA_EVENT).setParams({
            key: KEY,
            contextKey,
            callback: (contextProvision) => {
                provisions.push(contextProvision);
            }
        }).fire();
        return provisions;
    }

    provide(contextKey, value) {
        const component = this.context.getConcreteComponent();
        addProvider(this, this.context, contextKey, value);
        // add providers to component elements
        if (component.isRendered()) {
            addDomProviders(this, component.getElements(), contextKey, value);
        } else {
            // wait for render event
            component.addEventHandler("markup://aura:valueRender",
                () => {
                    addDomProviders(this, component.getElements(), contextKey, value);
                },
                "default");
        }
    }

    static create(anything) {
        /* quack like an Aura Component */
        return (!isNullOrUndefined(anything) && isFunction(anything.addEventHandler)
                && isFunction(anything.isValid) && anything.isValid()) ?
            new AuraContextBinding(anything) :
            null;
    }
}

