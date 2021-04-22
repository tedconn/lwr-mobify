import { typeUtils } from "./typeUtils.class.js";

/*
 * Thenable implements a function chain that mimics the Promise instance API and can degrade to being backed by Promises
 * if necessary. If no Promises are encountered in the chain this will result in better performance because it chains functions
 * without pushing anything into a future tick in the microtask queue, i.e. it can be synchronous. When Promises go into the
 * same microtask queue they can be slowed down by things already ahead of them in the queue. Using Thenables allows us to
 * be synchronous when we can and degrade to being asynchronous (Promises) when we must.
 *
 * Note that Thenables are a notion from the Promise spec, see section 2.3.3 in https://promisesaplus.com/
 *
 * Note also that Promises are interoperable with the Thenable concept -- they have a construtor to convert a Thenable to a
 * Promise as well as a static method to contruct a Promise from a Thenable. See:
 * <pre><code>
 * new Promise((resolve, reject) => {resolve(thenable);}); // (constructor)
 * Promise.resolve(thenable); // (static)
 * </code></pre>
 *
 * Note that with this Promise interoperability, Thenable works with async/await. E.g. just like you can do the following with
 * Promises:
 * <pre><code>
 * async function asyncFunc() {
 *     var value = await Promise.resolve(1)
 *         .then(x => x * 3)
 *         .then(await Promise.resolve(x => x + 5))
 *         .then(x => x / 2);
 *     return value;
 * }
 * asyncFunc().then(x => {console.log(`x: ${x}`); return x;});
 * // log output: x: 4
 * // result: Promise {[[PromiseStatus]]: "resolved", [[PromiseValue]]: 4}
 * </code></pre>
 * you can also do the same thing with Thenable:
 * <pre><code>
 * async function asyncFunc() {
 *     var value = await Thenable.resolve(1)
 *         .then(x => x * 3)
 *         .then(await Thenable.resolve(x => x + 5))
 *         .then(x => x / 2);
 *     return value;
 * }
 * asyncFunc().then(x => {console.log(`x: ${x}`); return x;});
 * // log output: x: 4
 * // result: Promise {[[PromiseStatus]]: "resolved", [[PromiseValue]]: 4}
 * </code></pre>
 * While this interoperability with async/await may prove very handy when necessary, you should be careful using async/await
 * because once you do you will leave the synchronous chain of Thenables and start an asynchronous chain of Promises.
 */
export class Thenable {
    /*
     * Constructor.
     * @param value: any - The value that the thenable should resolve to.
     * @param rejectionReason: any - The rejection reason if the thenable rejects.
     */
    constructor(executor) {
        if (typeof executor != "function") {
            throw new Error("executor must be a function!");
        }

        // A "Promise" can only have one result: either value or error
        // https://javascript.info/promise-basics under "There can be only a single result or an error"

        // A string is used because performance seems roughly comparable to using an int, as long as we use interned / static strings
        // https://stackoverflow.com/questions/23836825/is-javascript-string-comparison-just-as-fast-as-number-comparison
        this.state = "pending";
        this.value = undefined; // calling this value matches what Promise calls it

        this.onValueQueue = [];
        this.onRejectQueue = [];

        try {
            // This is expected to be synchronous.
            executor(this.resolver.bind(this), this.rejector.bind(this));
        } catch (setupException) {
            // If the setup function (executor) throws an error, we capture it as a rejection
            // reason for the Thenable, matching the Promise API's implicit try-catch:
            // https://javascript.info/promise-error-handling#implicit-try-catch
            this.rejector(setupException);
        }
    }

    resolver(value) {
        // no-op if the Thenable has already resolved
        if (this.state === "pending") {
            // If we resolve to another thenable, this Thenable's end-state depends on the outcome of this "value"
            if (value && value.then) {
                value.then(this.resolver.bind(this), this.rejector.bind(this));
                return;
            }
            this.state = "resolved";
            this.value = value;

            // Deferred / async executor
            this.onValueQueue.forEach((onValue) => {
                if (onValue) {
                    onValue(this.value);
                }
            });
        }
    }

    rejector(rejectionReason) {
        // no-op if resolve or reject has already been called
        if (this.state === "pending") {
            // If we reject to another thenable, this Thenable's end-state depends on the outcome of this "value"
            if (rejectionReason && rejectionReason.then) {
                rejectionReason.then(this.resolver.bind(this), this.rejector.bind(this));
                return;
            }
            this.state = "rejected";
            this.value = rejectionReason;

            // Deferred / async executor
            this.onRejectQueue.forEach((onReject) => {
                if (onReject && typeof onReject === "function") {
                    onReject(this.value);
                }
            });
        }
    }

    /*
     * Returns a Thenable that is resolved with the provided value.
     * @param value: any - The value for the returned Thenable.
     * @returns Thenable<any> - Returns a Thenable that is resolved with the provided value.
     */
    static resolve(value) {
        return new Thenable((resolve) => {
            resolve(value);
        });
    }

    /*
     * Returns a Thenable that is rejected for the provided reason.
     * @param rejectionReason: any - The reason for the returned Thenable's rejection.
     * @returns Thenable<any> - Returns a Thenable that is rejected for the provided reason.
     */
    static reject(rejectionReason) {
        return new Thenable((_resolve, reject) => {
            reject(rejectionReason);
        });
    }

    static _getSyncResultOrPromise(thenable) {
        if (typeUtils.isInstanceOf(thenable, Thenable)) {
            if (thenable.state === "rejected") {
                if (thenable.value.then) {
                    return this._getSyncResultOrPromise(thenable.value);
                }
                return {rejection: thenable.value};
            }
            if (thenable.state === "resolved") {
                if (thenable.value && thenable.value.then) {
                    return this._getSyncResultOrPromise(thenable.value);
                }
                return {value: thenable.value};
            }

            // If we ever come across an async thenable, turn all async thenables into Promises, so they can work in Promise.all
            // Fun fact: Promise.all() does not call .then() on the thenables in the array, so we need a way to register
            // with the promise-all when this particular thenable is done.
            // By turning the Thenable into a Promise, it will work seamlessly with Promise.all in a quick/dirty way
            return new Promise((resolve, reject) => {
                thenable.then(function () {
                    resolve.apply(undefined, arguments);
                }, function () {
                    reject.apply(undefined, arguments);
                });
            });
        }
        return thenable;
    }

    /*
     * Behaves like Promise.all() but uses Thenables synchronously if possible. If all Thenables in the chains are non-Promises,
     * then this returns a Thenable that resolves to an array of results. If a Promise is encountered, then a Promise is returned
     * that resolves to an array of results (same as Promise.all()).
     * @param thenables: Iterable<Thenable|Promise> - The iterable of Thenables or Promises for which to wait.
     * @returns Thenable<Array<any>>|Promise<Array<any>> - If all Thenables in the chains are non-Promises, then this returns a
     * Thenable that resolves to an array of results. If a Promise is encountered, then a Promise is returned that resolves to an
     * array of results (same as Promise.all()).
     */
    static all(thenables) {
        if (!thenables) {
            throw new TypeError(`thenables was falsy -- should be defined as an iterable of Thenables: ${thenables}`);
        }

        const thenableResultsArray = [];

        for (let i = 0; i < thenables.length; i++) {
            const thenable = thenables[i];

            const resultOrPromise = this._getSyncResultOrPromise(thenable);

            if (resultOrPromise.hasOwnProperty("rejection")) {
                return Thenable.reject(resultOrPromise.rejection);
            } else if (resultOrPromise.hasOwnProperty("value")) {
                thenableResultsArray.push(resultOrPromise.value);
            } else {
                // Drop into an async flow, Promisizing the remainder of Thenables

                // All thenables up to now are sync, so use them as-is
                const promisifiedThenables = thenables.slice(0, i);
                promisifiedThenables.push(resultOrPromise);

                // convert the remainder of (async) Thenables into Promises
                for (let restIdx = i + 1; restIdx < thenables.length; restIdx++) {
                    const restThenable = thenables[restIdx];
                    // Give all Thenables an opportunity to become a Promise, in the case that it is async
                    const restPromiseOrResult = this._getSyncResultOrPromise(restThenable);

                    // If we find a sync exception, (even if there are other async things), reject the Thenable without waiting for the async processes
                    if (restPromiseOrResult.rejection) {
                        return Thenable.reject(restPromiseOrResult.rejection);
                    }

                    // If processing resulted in a thenable, it's async, and we should use that Promise/Thenable
                    if (!restPromiseOrResult.rejection && !restPromiseOrResult.value) {
                        promisifiedThenables.push(restPromiseOrResult);
                    } else {
                        // If there's a value, it's a sync thenable, and the input thenable should be used rather than the output value
                        promisifiedThenables.push(restThenable);
                    }
                }

                // Async Promise fallback
                return Promise.all(promisifiedThenables);
            }
        }
        // Synchronous resolve to the values
        return Thenable.resolve(thenableResultsArray);
    }

    /*
     * Returns a Thenable or a Promise based on the input value or rejectionReason. If the value is a Promise
     * then we have to let this convert to a Promise chain and return Promises from here on, otherwise it will
     * return a Thenable.
     * @param value: any - The value for the returned Thenable.
     * @param rejectionReason: any - The reason for the returned Thenable's rejection.
     * @returns Thenable<any> | Promise<any> - Returns a Thenable or a Promise based on the input value or rejectionReason.
     */
    static _resolveOrReject(value, rejectionReason) {
        if (value && value.then !== undefined) {
            // if the value is a thenable, it can be returned (and used for chaining); no need to create a new Thenable
            return value;
        }

        if (rejectionReason) {
            return Thenable.reject(rejectionReason);
        }
        return Thenable.resolve(value);
    }

    /*
     * Appends fulfillment and rejection handlers to the Thenable, and returns a new Thenable resolving to the return value of
     * the called handler, or to its original settled value if the Thenable was not handled (i.e. if the relevant handler onFulfilled
     * or onRejected is not a function).
     *
     * This method mirrors its equivalent in the Promise API, but calls everything synchronously if it can. If it encounters a Promise
     * in the chain, this synchronous Thenable chain will convert to an asynchronous Promise chain at that point.
     * @param onFulfilled: function - A Function called if the Thenable is fulfilled. This function has one argument, the fulfillment value.
     * @param onRejected: function - A Function called if the Thenable is rejected. This function has one argument, the rejection reason.
     * @returns Thenable<any> | Promise<any> - Returns a Thenable or a Promise based on output of the onFulfilled or onRejected handler.
     */
    then(onFulfilled, onRejected) {
        let newValue;
        let newRejectionReason;

        try {
            if (this.value === this) {
                throw new TypeError("Thenable cannot resolve to itself.");
            }

            // Async resolution/rejection handling, when neither a value nor rejection has been decided synchronously
            if (this.state === "pending") {
                // Return a new thenable for subsequent chains
                return new Thenable((resolve, reject) => {
                    // Because we're returning a new thenable, we always need to have a then/catch handler, to be able
                    // to forward values/rejections down the chain.
                    // The base-case here is:
                    // thenable.then().then().catch().then().then(fn, fn)
                    // where all the intermediate empty then().catch() basically do nothing, but each has a "forward" handler
                    this.onRejectQueue.push((rejection) => {
                        // If the Thenable has already resolved, don't override with a rejection. This matches Promise
                        if (this.state === "resolved") {
                            this.onRejectQueue = [];
                        } else {
                            try {
                                if (onRejected) {
                                    const catchReturnValue = onRejected(rejection);
                                    if (catchReturnValue && catchReturnValue.then && (catchReturnValue instanceof Thenable || catchReturnValue instanceof Promise)) {
                                        catchReturnValue.then(resolve, reject);
                                    } else {
                                        // if the catch handler returns a value, we continue down the .then chain by resolving
                                        resolve(catchReturnValue);
                                    }
                                } else {
                                    // if there is no catch handler, forward the exception to the next thenable via reject
                                    throw rejection;
                                }
                            } catch (e) {
                                reject(e);
                            }
                        }
                    });

                    this.onValueQueue.push((value) => {
                        // If the Thenable has already rejected, don't override with a resolve. This matches Promise behavior
                        // new Promise((resolve, reject) => { resolve(); reject(); }).catch(fn).then(fn): only the .then gets called
                        if (this.state === "rejected") {
                            this.onValueQueue = [];
                        } else {
                            try {
                                let fulfilledValue = value;
                                if (onFulfilled && typeof onFulfilled === "function") {
                                    fulfilledValue = onFulfilled(value);
                                }
                                if (fulfilledValue
                                    && fulfilledValue.then
                                    && (
                                        fulfilledValue instanceof Thenable
                                        || fulfilledValue instanceof Promise
                                    )) {
                                    fulfilledValue.then(resolve, reject);
                                } else {
                                    resolve(fulfilledValue);
                                }
                            } catch (e) {
                                reject(e);
                            }
                        }
                    });
                });
            }

            // We have a async answer on this thenable in either this.value or this.rejectionReason
            // and can notify the value or rejection synchronously

            if (this.state === "rejected") {
                if (typeof onRejected === "function") {
                    if (typeUtils.isInstanceOf(this.value, Promise)) {
                        return this.value.then(undefined, onRejected);
                    }

                    newValue = onRejected(this.value);
                } else {
                    newRejectionReason = this.value;
                }
            } else if (typeof onFulfilled === "function") {
                if (typeUtils.isInstanceOf(this.value, Promise)) {
                    return this.value.then(onFulfilled);
                }

                newValue = onFulfilled(this.value);
            }
        } catch (e) {
            newRejectionReason = e;
        }

        // If there was no onFulfilled to give us a newValue, propagate this Thenable's value to the next
        // This can come up in scenarios like:
        // Thenable.resolve("foo").catch(...);
        // Thenable.resolve("foo").then().then().then(doSomething);
        if (!onFulfilled) {
            // note that newValue could come from either onFulfilled or onRejected

            // In Thenable.resolve("foo").catch(() => { throw });
            // The try/catch sets a newRejectionReason, and while we retain "foo" in this.value,
            // the next section (_resolveOrReject) favors the newRejectionReason from the throw,
            // so setting newValue doesn't harm anything, albeit unnecessary
            newValue = newValue || this.value;
        }

        return Thenable._resolveOrReject(newValue, newRejectionReason);
    }

    /*
     * Appends a rejection handler callback to the Thenable, and returns a new Thenable resolving to the return value of the callback if it
     * is called, or to its original fulfillment value if the Thenable is instead fulfilled.
     *
     * This method mirrors its equivalent in the Promise API, but calls everything synchronously if it can. If it encounters a Promise
     * in the chain, this synchronous Thenable chain will convert to an asynchronous Promise chain at that point.
     * @param onRejected: function - A Function called if the Thenable is rejected. This function has one argument, the rejection reason.
     * @returns Thenable<any> | Promise<any> - Returns a Thenable or a Promise based on output of the onRejected handler.
     */
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }
}
