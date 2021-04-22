import { DomContextBinding } from "./dom";
import { AuraContextBinding } from "./aura";
import { FunctionContextBinding } from "./function";
import { error as metricsError } from "instrumentation/service";

function getContextBinding(context) {
    const contextBinding = DomContextBinding.create(context)
        || AuraContextBinding.create(context)
        || FunctionContextBinding.create(context, getContextBinding);
    return contextBinding;
}

/*
 * Finds the context provision for the given contextKey in the scope of the
 * given context. Will return undefined if no provision is found.
 * @param {EventTarget|AuraComponent|Function} context
 * @param {*} contextKey
 * @returns {ContextProvision|undefined} the context provision for the contextKey that is closest to the given context
 */
function findContextProvisions(context, contextKey) {
    const binding = getContextBinding(context);
    if (binding) {
        return binding.get(contextKey);
    }
    /* W-5599121:
     * When a context access occurs while the parent component stack is getting destroyed,
     * no context binding is found. This was gacking, and we've decided to kill the context access
     * in this scenario. If no context binding can be found... give up, and leave everything dead in the water.
     * else: don't call the callback; there's likely a promise that'll be left open, which is fine
     * TODO: Can we log more about this scenario?
     */
    metricsError(`laf:contextService could not bind to context: ${context}`, "laf:contextService");
    return undefined;
}

// Cache whose key is a consuming contexts and whose value is the provisions for that context.
// Provision values are Maps whose keys are contextKeys.
const CONTEXT_CACHE = new WeakMap();

/*
 * Returns the context provision for the given contextKey in the scope of the
 * given context. Will return undefined if no provision is found. This caches
 * the provision to the input context using the contextKey.
 * @param {EventTarget|AuraComponent|Function} context
 * @param {*} contextKey - a unique key associated with a context provider
 * @returns {ContextProvision|undefined} the context provision for the contextKey that is closest to the given context
 */
function getContextProvisions(context, contextKey) {
    // get contextProvisions[context]
    let contextProvisions = CONTEXT_CACHE.get(context);
    if (!contextProvisions) {
        CONTEXT_CACHE.set(context, contextProvisions = new Map());
    }

    // get contextProvisions[context][contextKey]
    if (contextProvisions.has(contextKey)) {
        return contextProvisions.get(contextKey);
    }
    // contextProvisions map is filled on demand per contextKey
    const provisions = findContextProvisions(context, contextKey);
    contextProvisions.set(contextKey, provisions);
    return provisions;
}

/*
 * Returns the context value for the given {context, contextKey} tuple.
 * Any different future values emitted by the same provider used to
 * resolve the requested context value will never be seen from this tuple's vantage
 * point. On the other hand, any mutations to the cached context value will be seen
 * by consumers of this API.
 *
 * @param {EventTarget|AuraComponent|Function} context
 * @param {*} contextKey - a unique key associated with a context provider
 * @returns {*} the value for the given {context, contextKey} tuple.
 */
export function getContextValue(context, contextKey) {
    const provisions = getContextProvisions(context, contextKey);
    return provisions.length > 0 ? provisions[0].value : undefined;
}

/*
 * Returns an array of all context values from all providers of the given contextKey
 * in order of higher to lower precedence.
 *
 * @param {EventTarget|AuraComponent|Function} context
 * @param {*} contextKey - a unique key associated with a context provider
 * @returns {Array} the ordered array of provided values for the given {context, contextKey} tuple.
 */
export function getContextValues(context, contextKey) {
    return getContextProvisions(context, contextKey).map(provision => provision.value);
}

/*
 * Provides a value for a given contextKey so that all consumers inside the given
 * context may retrieve that value through the getContextValue / getContextValues APIs.
 *
 * Retrieving the value for a contextKey from a context at which a value was previously
 * provided will *NOT* resolve to that value but will instead resolve to the value provided
 * by an ancestor context scope.
 *
 * Given Context[A] -> Context[B] -> Context[C]
 * Provide 1 @ Context[A]
 * Provide 2 @ Context[B]
 * Provide 3 @ Context[C]
 * Get from Context[C] returns 2
 * Get from Context[B] returns 1
 *
 * @param {HTMLElement|RaptorElement|AuraComponent} context
 * @param {*} contextKey - a unique key associated with a context provider
 * @param {*} value A value for the given contextKey scoped to provide to all
 * consumers inside the given context.
 */
export function provideContextValue(context, contextKey, value) {
    getContextBinding(context).provide(contextKey, value);
}