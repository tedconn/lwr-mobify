import { Subject } from './subject';
import { Subscriber } from './subscriber';
import { Multicast } from './multicast';

class ReplaySubject extends Subject {
    constructor() {
        super();
        Object.defineProperties(this, {
            lastValue: {
                value: undefined,
                writable: true
            },
            isError: {
                value: false,
                writable: true
            },
            hasLast: {
                value: false,
                writable: true
            }
        });
    }

    subscribe(observerOrNext, error, complete) {
        const subscriber = Subscriber.from(observerOrNext, error, complete);
        subscriber.addSub(this.subscribeFn(subscriber));

        // replay the last emission if present
        if (this.isError) {
            subscriber.error(this.lastValue);
        } else if (this.hasLast) {
            subscriber.next(this.lastValue);
        }

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
        if (!this.closed) {
            this.lastValue = value;
            this.hasLast = true;
        }
        super.next(value);
    }

    error(err) {
        if (!this.closed) {
            this.lastValue = err;
            this.isError = true;
            this.hasLast = true;
        }
        super.error(err);
    }
}

/**
 * Replays the last emission from an underlying source to all future observers the
 * moment they call subscribe(). If this is complete whenever subscribe()
 * is called, the observer will receive the last value before this was
 * closed before receiving a complete() call.
 *
 * NOTE: This could be generalized to the last N emissions, but that use
 * case is not needed presently, and it is more expensive to implement this
 * on top of the generalized buffer form.
 */
export class Replay extends Multicast {
    /**
     * @param {Observable|Function} anySource may be an Observable, something that can be converted
     * to an Observable through Observable.from(anySource), or a function that will be invoked with
     * a callback argument that takes a single argument which may be an Observable or something that
     * can be converted to an Observable through Observable.from(anySource). As a function argument,
     * this provides support for asynchronous connection to a resolved source.
     */
    constructor(anySource) {
        super(anySource, new ReplaySubject());
    }
}