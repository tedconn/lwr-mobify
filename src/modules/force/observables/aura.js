import { Observable } from './observable';
import { Replay } from './replay';

const aName = "$A";
const A = window[aName];

// Returns a subscriber function that will subscribe observers to
// a component attribute.
function getAuraAttributeSubscriberFunction(cmp, expression) {
    // Must be invoked in an Aura execution context that has visibility
    // to the expression on the cmp so we can capture the callback context
    // in the main subscriber function
    return A.getCallback(observer => {
        // emit the initial value
        observer.next(cmp.get(expression));

        // connect a listener to future changes
        let listener = (event) => {
            const newValue = event.getParam("value");
            observer.next(newValue);
        };
        const config = {
            event: "change",
            value: expression,
            method: listener
        };
        cmp.addValueHandler(config);

        // Aura does something dumb, and wraps the method in createCallback, so our match won't work on removeValueHandler
        // unless we use the now-wrapped version
        listener = config.method;

        const onValueDestroyed = () => {
            observer.complete();
        };
        // complete the stream when the component is destroyed
        cmp.addEventHandler("markup://aura:valueDestroy", onValueDestroyed, "default");

        // return dispose function
        return () => {
            cmp.removeValueHandler({
                event: "change",
                value: expression,
                method: listener
            });
            cmp.removeEventHandler("markup://aura:valueDestroy", onValueDestroyed, "default");
        };
    });
}

function assertValidComponent(cmp) {
    if (!cmp.isValid()) {
        throw new Error(`${cmp} is not a valid Component`);
    }
}

function assertExpression(expression) {
    if (typeof expression !== "string") {
        throw new TypeError(`${expression} is not a valid expression`);
    }
}

class AuraComponentObservable extends Observable {
    constructor(cmp, expression) {
        assertValidComponent(cmp);
        assertExpression(expression);
        super(getAuraAttributeSubscriberFunction(cmp, expression));
    }
}

/**
 * Returns an Observable that emits the values of resolved by the expression
 * on the component.
 *
 * @param {AuraComponent} cmp component at which to resolve the expression
 * @param {String} expression expression whose value to wrap with an Observable
 * @return {Observable} an observable
 */
export function forAuraComponent(cmp, expression) {
    // Use Replay to avoid duplicate low-level interaction with Aura
    return new Replay(new AuraComponentObservable(cmp, expression));
}

/**
 * Wires a subscription to the observable that set the value
 * resolved by the expression on the component as the observable emits
 * new values.
 *
 * @param {Observable} observable an Observable
 * @param {AuraComponent} cmp an Aura Component
 * @param {String} expression an expression
 * @return {Subscription} a Subscription
 */
export function toAuraComponent(observable, cmp, expression) {
    assertValidComponent(cmp);
    assertExpression(expression);
    const subscription = observable.subscribe(A.getCallback(value => {
        cmp.set(expression, value);
    }));

    // unsubscribe when the component is destroyed
    cmp.addEventHandler("markup://aura:valueDestroy",
        () => {
            subscription.unsubscribe();
        },
        "default");

    return subscription;
}