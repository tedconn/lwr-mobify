const CONTEXT_REGISTRY = new Map();

class ContextBinder {
    constructor(contextKey) {
        this.contextKey = contextKey;
        this.bindings = new WeakMap();
    }

    bind(target, value) {
        this.bindings.set(target, value);
    }

    hasBinding(target) {
        return this.bindings.has(target);
    }

    getBinding(target) {
        return this.bindings.get(target);
    }
}

export function getContextBinder(contextKey) {
    if (CONTEXT_REGISTRY.has(contextKey)) {
        return CONTEXT_REGISTRY.get(contextKey);
    }
    const binder = new ContextBinder(contextKey);
    CONTEXT_REGISTRY.set(contextKey, binder);
    return binder;
}