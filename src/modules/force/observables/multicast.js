import { Observable } from './observable';
import { Subject } from './subject';

function noop() {}

/**
 * Provides multicasting capabilities from a source Observable to a Subject
 * which may have multiple Observers subscribed to it.
 */
export class Multicast extends Observable {
    /**
     * Creates an Observable that subscribes to a single source and multicasts its
     * emissions to all subscribers on itself without requiring duplicate low-level
     * subscriptions to the underlying source.
     *
     * @param {Observable|Function} anySource may be an Observable, something that can be converted
     * to an Observable through Observable.from(anySource), or a function that will be invoked with
     * a callback argument that takes a single argument which may be an Observable or something that
     * can be converted to an Observable through Observable.from(anySource). As a function argument,
     * this provides support for asynchronous connection to a resolved source.
     * @param {Subject} subject an optional Subject; will create a new one if not provided
     */
    constructor(anySource, subject) {
        super(noop);
        if (!subject) {
            subject = new Subject();
        } else if (!Subject.isSubject(subject)) {
            throw new Error(`${subject} must be a Subject`);
        }

        Object.defineProperties(this, {
            subject: {
                value: subject,
                writable: false
            },
            subscription: {
                value: undefined,
                writable: true
            }
        });

        if (typeof anySource === "function") {
            // anySource is a function(observable => void) type, so pass setSource to
            // the anySource function as a callback to receive the observable when ready
            anySource(this.setSource.bind(this));
        } else {
            // Extract an Observable from anySource
            this.setSource(anySource);
        }
    }

    setSource(observable) {
        if (this.source) {
            throw new Error("source is already set");
        }
        this.source = Observable.from(observable); // support fromability
        if (this.subject.subscriberCount > 0) {
            // auto-connect on observable resolution since we already have subscribers
            this.subscription = this.source.subscribe(this.subject);
        }
    }

    subscribe(observerOrNext, error, complete) {
        const subscription = this.subject.subscribe(observerOrNext, error, complete);
        if (!this.subscription && this.source) {
            // auto-connect on first subscription if we already have a source
            this.subscription = this.source.subscribe(this.subject);
        }
        // add a tear down callback if this subscription is unsubscribed
        subscription.addSub(() => {
            if (this.subject.subscriberCount === 0) {
                // auto-disconnect on the last subscription
                if (this.subscription) {
                    this.subscription.unsubscribe();
                    this.subscription = null;
                }
            }
        });
        return subscription;
    }
}