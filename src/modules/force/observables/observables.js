import { Observable } from './observable';
import { Subject } from './subject';
import { Multicast } from './multicast';
import { Replay } from './replay';
import { forAuraComponent, toAuraComponent } from './aura';

/**
 * Returns an Observable that subscribes to a single source and multicasts its
 * emissions to all subscribers on itself without requiring duplicate low-level
 * subscriptions to the underlying source.
 *
 * @param {Observable|Function} anySource may be an Observable, something that can be converted
 * to an Observable through Observable.from(anySource), or a function that will be invoked with
 * a callback argument that takes a single argument which may be an Observable or something that
 * can be converted to an Observable through Observable.from(anySource). As a function argument,
 * this provides support for asynchronous connection to a resolved source.
 * @param {Subject} subject an optional Subject
 * @return {Observable} an observable
 */
export function multicast(anySource, subject) {
    if (anySource instanceof Multicast && !subject) {
        return anySource;
    }
    return new Multicast(anySource, subject);
}

/**
 * Returns an Observable whose future subscriptions will receive the most recent value of an
 * underlying source. The returned Observable only remembers the last value of the underlying
 * source that is emitted after this replay observable is created. Any future observers that
 * subscribe to the replay observable after it has received at least one emission from the
 * underlying source will immediately be invoked with that same emission.
 *
 * @param {Observable|Function} anySource may be an Observable, something that can be converted
 * to an Observable through Observable.from(anySource), or a function that will be invoked with
 * a callback argument that takes a single argument which may be an Observable or something that
 * can be converted to an Observable through Observable.from(anySource). As a function argument,
 * this provides support for asynchronous connection to a resolved source.
 * @return {Observable} an observable
 */
export function replay(anySource) {
    if (anySource instanceof Replay) {
        return anySource;
    }
    return new Replay(anySource);
}

// expose these directly
export { Observable, Subject, forAuraComponent, toAuraComponent };