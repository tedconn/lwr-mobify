import { Observable } from './observable';
import { Subscriber } from './subscriber';


function subscribeFn(subscriber) {
    // return a dispose function for this particular subscriber
    return () => {
        this.subscribers.delete(subscriber);
    };
}

// An Observable and an Observer. Allows for multicasting from an outside source.
// A Subject may be passed to a different Observable's subscribe() function
// to multicast the values from that Observable to its own subscribers.
export class Subject extends Observable {
    constructor() {
        super(subscribeFn);
        Object.defineProperties(this, {
            subscribers: {
                value: new Set(),
                writable: false
            },
            isClosed: {
                value: false,
                writable: true
            }
        });
    }

    get closed() {
        return this.isClosed;
    }

    get subscriberCount() {
        return this.subscribers.size;
    }

    subscribe(observerOrNext, error, complete) {
        const subscriber = Subscriber.from(observerOrNext, error, complete);
        subscriber.addSub(this.subscribeFn(subscriber));

        if (this.isClosed) {
            // immediately complete new subscribers if we're closed
            subscriber.complete();
        } else {
            // add tear down subscription
            this.subscribers.add(subscriber);
        }
        return subscriber;
    }

    next(value) {
        if (!this.isClosed) {
            this.subscribers.forEach(sub => sub.next(value));
        }
    }

    error(err) {
        if (!this.isClosed) {
            this.subscribers.forEach(sub => sub.error(err));
        }
    }

    complete() {
        if (!this.isClosed) {
            this.isClosed = true;
            try {
                this.subscribers.forEach(sub => sub.complete());
            } finally {
                this.subscribers.clear();
            }
        }
    }

    static isSubject(anything) {
        return anything instanceof Subject;
    }
}