import { Subscription } from './subscription';

// A Subscription and an Observer. Convenience wrapper for an Observer,
// making it safe to invoke and providing a Subscription API around it.
export class Subscriber extends Subscription {
    constructor(nextFn, errorFn, completeFn, scope) {
        super();
        Object.defineProperties(this, {
            nextFn: {
                value: nextFn,
                writable: false
            },
            errorFn: {
                value: errorFn,
                writable: false
            },
            completeFn: {
                value: completeFn,
                writable: false
            },
            scope: {
                value: scope || this,
                writable: false
            }
        });
    }

    next(value) {
        if (!this.closed && this.nextFn) {
            this.nextFn.call(this.scope, value);
        }
    }

    error(err) {
        try {
            if (!this.closed && this.errorFn) {
                this.errorFn.call(this.scope, err);
            }
        } finally {
            // the spec indicates that an error(...) emission cleans up the
            // subscription
            this.unsubscribe();
        }
    }

    complete() {
        try {
            if (!this.closed && this.completeFn) {
                this.completeFn.call(this.scope);
            }
        } finally {
            this.unsubscribe();
        }
    }

    static from(observerOrNext, error, complete) {
        let nextFn;
        let errorFn;
        let completeFn;
        let scope = null;
        if (observerOrNext instanceof Subscriber) {
            return observerOrNext;
        } else if (observerOrNext && typeof observerOrNext === "object") {
            nextFn = observerOrNext.next;
            errorFn = observerOrNext.error;
            completeFn = observerOrNext.complete;
            scope = observerOrNext;
        } else {
            nextFn = observerOrNext;
            errorFn = error;
            completeFn = complete;
        }
        return new Subscriber(nextFn, errorFn, completeFn, scope);
    }
}