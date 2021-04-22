
function getSubscriptions(subscription) {
    return subscription.subscriptions || (subscription.subscriptions = new Set());
}

export class Subscription {
    constructor(unsubscriber) {
        Object.defineProperties(this, {
            subscriptions: {
                value: undefined,
                writable: true
            },
            unsubscriber: {
                value: unsubscriber,
                writable: false
            },
            isClosed: {
                value: false,
                writable: true
            }
        });
    }

    static isSubscription(anything) {
        return anything instanceof Subscription;
    }

    get closed() {
        return this.isClosed;
    }

    // add child subscription to unsubscribe whenever this unsubscribes
    addSub(subscription) {
        if (subscription === this || subscription === null || subscription === undefined) {
            return this;
        } else if (typeof subscription === "function") {
            if (this.closed) {
                subscription();
            } else {
                // wrap naked function in Subscription
                subscription = new Subscription(subscription);
                getSubscriptions(this).add(subscription);
            }
        } else if (Subscription.isSubscription(subscription)) {
            if (this.closed) {
                subscription.unsubscribe();
            } else {
                getSubscriptions(this).add(subscription);
            }
        }
        return subscription;
    }

    unsubscribe() {
        if (!this.closed) {
            this.isClosed = true;
            if (this.subscriptions) {
                try {
                    this.subscriptions.forEach(sub => sub.unsubscribe());
                } finally {
                    this.subscriptions = null;
                }
            }
            if (this.unsubscriber) {
                this.unsubscriber();
            }
        }
    }
}