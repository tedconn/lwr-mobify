import { Subscriber } from "./subscriber";

// Should this set Symbol.observable if it's undefined?
export const $$observable = Symbol.observable || Symbol("observable");

// Implementation of https://tc39.github.io/proposal-observable/
export class Observable {
    constructor(subscribeFn /* SubscriberFunction*/) {
        if (typeof subscribeFn !== "function") {
            throw new TypeError(`${subscribeFn} is not a function`);
        }
        Object.defineProperty(this, "subscribeFn", {
            value: subscribeFn,
            writable: false
        });
    }

    [$$observable]() {
        return this;
    }

    subscribe(observerOrNext, error, complete) {
        const subscriber = Subscriber.from(observerOrNext, error, complete);
        // SubscriberFunction can return a tear-down function OR a Subscription; add it to the Subscriber
        subscriber.addSub(this.subscribeFn(subscriber));
        return subscriber;
    }

    static of(...items) {
        return new Observable(observer => {
            items.forEach(item => observer.next(item));
            observer.complete();
        });
    }

    static from(something) {
        if (something === null || something === undefined) {
            throw new TypeError(`${something} is not an object`);
        }
        if (something && something[$$observable]) {
            return something[$$observable]();
        }
        return Observable.of(...something);
    }
}