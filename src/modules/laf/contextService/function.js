import { isFunction } from "./shared";

function dispatchWithContextBinding(contextDispatcher, contextBinder, dispatcher) {
    contextDispatcher((resolvedContext) => {
        // avoid a possible infinite recursion; this can't delegate to another delegate
        if (isFunction(resolvedContext)) {
            throw new Error(`context generator cannot return a function: ${resolvedContext}`);
        }
        const contextBinding = contextBinder(resolvedContext);
        dispatcher(contextBinding);
    });
}

// The FunctionContextBinding allows a context argument to be a function that will accept a single
// function-typed argument and invoke that argument with the actual context. This pattern allows a
// caller to acquire a context in its own execution scope (Aura components) and execute the context
// resolution in the context-service in that execution scope. It can still delegate handling to the
// callback in whatever scope it wants to run. Individual services may utilize this to acquire their
// context in the scope of an internal Aura component and still allow the caller to run in its own
// context for error handling and reporting.
export class FunctionContextBinding {
    constructor(context, contextBinder) {
        Object.defineProperties(this, {
            context: {
                value: context,
                writable: false
            },
            contextBinder: {
                value: contextBinder,
                writable: false
            }
        });
    }

    /**
     * Calls dispatcher, passing it the resolved context binding. The context binding is only safe to
     * use within the dispatcher's call stack and may not be returned for use outside the execution
     * stack of the dispatcher.
     * @param {Function} dispatcher
     */
    dispatchWithContextBinding(dispatcher) {
        dispatchWithContextBinding(this.context, this.contextBinder, dispatcher);
    }

    get(contextKey) {
        let provisions = [];
        this.dispatchWithContextBinding((contextBinding) => {
            provisions = contextBinding.get(contextKey);
        });
        return provisions;
    }

    provide(contextKey, value) {
        this.dispatchWithContextBinding((contextBinding) => contextBinding.provide(contextKey, value));
    }

    static create(anything, contextBinder) {
        return isFunction(anything) ?
            new FunctionContextBinding(anything, contextBinder) :
            null;
    }
}
