import { Subscription } from './subscription';
/**
 * A simple observable subject.
 */

export class Subject {
  _nextHandlers = new Set();
  /**
   * Emits the next value to all subscribed handlers.
   *
   * @param {object} [nextValue]
   *  The optional value to provide to subscribers.
   */

  next(nextValue) {
    this._nextHandlers.forEach(nextHandler => nextHandler(nextValue));
  }
  /**
   * Subscribes to notifications from this subject.
   *
   * @param {function} nextHandler
   *  A handler for the notification.
   *
   * @returns {Subscription}
   *      A subscription that may be used to unsubscribe from the notifications.
   */


  subscribe(nextHandler) {
    this._nextHandlers.add(nextHandler);

    return new Subscription(() => {
      this._nextHandlers.delete(nextHandler);
    });
  }

}