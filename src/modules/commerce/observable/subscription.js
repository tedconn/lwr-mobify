/**
 * A subscription to an observable notification stream.
 */
export class Subscription {
  /**
   * Initializes a new Subscription with the specified unsubscribe handler.
   *
   * @param {Function} [unsubscribeHandler]
   *  A handler that is executed when then subscription is ended.
   */
  constructor(unsubscribeHandler) {
    this.unsubscribeHandler = unsubscribeHandler;
  }
  /**
   * Unsubscribes from the associated observable.
   */


  unsubscribe() {
    // If we have a handler, invoke it.
    if (this.unsubscribeHandler) {
      // Snag a reference to the handler, then delete the instance property so that we only execute it once.
      const handler = this.unsubscribeHandler;
      delete this.unsubscribeHandler;
      handler();
    }
  }

}