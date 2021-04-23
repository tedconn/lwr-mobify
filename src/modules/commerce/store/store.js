import { BehaviorSubject } from 'commerce/observable';
import { getSsrContext, isSsr } from './ssr';
import { keyAsString } from './store-key';
export { StoreAdapter } from './store-wire';
export { isSsr, getSsrContext } from './ssr';
const INITIAL_STATE = '__B2C_INITIAL_STATE__'; // This is temporary, see the ctor

const GLOBAL_STATE = '__B2C_GLOBAL_STATE__';
export function freezeJson(o) {
  if (o !== null && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.getOwnPropertyNames(o).forEach(p => freezeJson(o[p]));
    Object.freeze(o);
  }
}
export function jsonClone(o) {
  // Simplest clone implementation, we can make it more efficient if necessary
  if (o !== undefined && o !== null) {
    return JSON.parse(JSON.stringify(o));
  }

  return o;
}
/**
 * Internal subject class
 */

class StoreSubject extends BehaviorSubject {
  subscribers = 0;

  constructor(store, keyString, value) {
    super(value);
    this.store = store;
    this.keyString = keyString;
  }

  subscribe(handler) {
    const subscription = super.subscribe(handler);

    if (++this.subscribers === 1) {
      this.store._addSubject(this);
    }

    return {
      unsubscribe: () => {
        subscription.unsubscribe(); // If no more handlers, we remove the subject

        if (--this.subscribers === 0) {
          this.store._removeSubject(this);
        }
      }
    };
  }

}
/**
 * Simple in memory store.
 *
 * This is a centralized client side state manager that stores data and notify subscribers on changes.
 * An instance of a store is generally dedicated to one type of data management, like a cart of a set of products.
 *
 * A store can hold a single JS object or a set of objects referemced by a key. For example, a typical commerce
 * application will have one cart object, and multiple products referenced by their id. A single object is
 * in fact an object with a undefined, null or empty string key.
 *
 * The store uses a lazy loading mechanism, which attempts to load the data on its first access. To do this,
 * it uses a 'loader' that is invoked when the data should be loaded. This function returns a Promise that
 * resolves when the data, or a load error, is available.
 *
 * An object is created in the store as soon as it is accessed for the first time. It always contains the
 * following properties:
 *   - data
 *     The actually object data, like a product. It can be null if the data hasn't been loaded yet, or if
 *     there was an error when loading the object.
 *   - error
 *     An error object if the store failed to load the object. It can be null if the data hasn't been loaded yet,
 *     or if the object loaded properly.
 *   - loaded
 *     Set when an attempt to load the object was completed, which resulted in some data or an error.
 *   - loading
 *     Contains a promise if the data is being loaded. Most applications will simply check if the value
 *     is not null/undefined to display a loading icon. The promise is provided to support advanced use cases
 *     like Server Side Rendering
 *
 * Each object in the store can have subscribers that will be notified when the object is updated. When an
 * object has no longer subscribers, it is removed from the store. To keep it alive, one can create a fake
 * subscriber to keep a reference active.
 * When the an object is changed, because the data was loaded, or changed programmatically, all the subscribers
 * are notified. Also, when a subscriber sunscribes to an object that is already in the store, then it
 * receives an initial notification.
 *
 */


export class Store {
  subjects = [];
  _container = new Map();

  constructor(name, options = {}) {
    this.name = name;
    this.options = options;

    // Preload the store on the client when SSR was activated
    // We have to store the SSR context when the subject is created, as it will be unavailable when the request is completed
    // Thus it won't be available dynamically when a Promise is resolved
    if (isSsr()) {
      this.ssrContext = getSsrContext() || {
        states: new Map(),
        loading: []
      };
      const {
        states
      } = this.ssrContext;

      if (!states.has(this.name)) {
        states.set(this.name, new Map());
      }
    } else {
      // This is temporary for LWR running in Node, as there is currently no guarantee that a module will be instantiated once.
      // Note: as a developer, you should NOT rely on it and access this global directly!
      const globalStates = (window ? window[GLOBAL_STATE] : null) || new Map();

      if (!globalStates.has(name)) {
        globalStates.set(name, new Map());
      }

      this._container = globalStates.get(name); // This is to preload the store when SSR is enabled

      if (window && window[INITIAL_STATE]) {
        const initialStates = window[INITIAL_STATE] || new Map();
        const initialState = initialStates.get(name);

        if (initialState) {
          for (const [keyString, value] of initialState.entries()) {
            this._container.set(keyString, value);
          }

          initialStates.delete(name);
        }
      }
    }
  }

  _addSubject(subject) {
    this.subjects.push(subject);
  }

  _removeSubject(subject) {
    // First remove the subject from the list of subjects
    const idx = this.subjects.findIndex(s => subject === s);

    if (idx >= 0) {
      this.subjects.splice(idx, 1);
    } // Discard the value in the store if there is no more observable
    // We could have a function that discards using a MRU, or whatever...
    // This can be extended in many ways


    if (this.options.discard) {
      const keyString = subject.keyString;
      const count = this.subjects.reduce((a, s) => {
        return a + (s.keyString === keyString ? 1 : 0);
      }, 0);

      if (count === 0) {
        this._container.delete(keyString);
      }
    }
  }

  get container() {
    // Client side container
    if (!this.ssrContext) {
      return this._container;
    } // Server side container
    // It must be stored in the SSR context


    const {
      states
    } = this.ssrContext;
    return states.get(this.name);
  }

  _get(key, keyString, load = false) {
    const container = this._container;

    if (!container.get(keyString)) {
      this._set(container, keyString, {
        data: undefined,
        error: undefined,
        loaded: false,
        loading: undefined
      });
    }

    const {
      loaded,
      loading
    } = container.get(keyString);

    if (load && !loaded && !loading) {
      this._load(key, keyString);
    }

    return container.get(keyString);
  }

  _set(container, keyString, value) {
    container.set(keyString, value);

    if (process.env.NODE_ENV !== 'production') {
      Object.freeze(value);
      freezeJson(value.data);
      freezeJson(value.error);
    }
  }

  _load(key, keyString, loader) {
    // We get the container here so it is available to the promises even though the context changed
    const container = this._container;
    loader = loader || this.options.loader;

    if (loader) {
      this._cancelRequest(keyString);

      try {
        const result = loader(key);

        if (result && typeof result === 'object' && typeof result.then === 'function') {
          const resultPromise = result;
          const loading = resultPromise.then(data => {
            // Verify that the promise is the expected one
            // It happens when multiple load requests are sent at the same time
            // The latest will win
            const val = container.get(keyString);

            if (val && val.loading === loading) {
              const v = {
                data,
                error: undefined,
                loaded: true,
                loading: undefined
              };

              this._set(container, keyString, v);

              this._notify(keyString, v);
            }

            return container.get(keyString);
          }).catch(ex => {
            const error = this._errorFromException(ex);

            const val = container.get(keyString);

            if (val && val.loading === loading) {
              const v = {
                data: undefined,
                error: error,
                loaded: true,
                loading: undefined
              };

              this._set(container, keyString, v);

              this._notify(keyString, v);
            }

            return container.get(keyString);
          });

          if (isSsr()) {
            // With SSR, we don't notify the loading state as this is not necessary
            // We simply store the value so it gets to the store.
            const v = {
              data: undefined,
              error: undefined,
              loaded: false,
              loading
            };

            this._set(container, keyString, v);

            if (loading && this.ssrContext) {
              this.ssrContext.loading.push(loading);
            }
          } else {
            // If a value was already there, we keep it but notify that another value is being loaded
            const e = container.get(keyString);
            const v = e ? { ...e,
              loading
            } : {
              loading
            };

            this._set(container, keyString, v);

            this._notify(keyString, v);
          }
        } else {
          const v = {
            data: result,
            error: undefined,
            loaded: true,
            loading: undefined
          };

          this._set(container, keyString, v);

          this._notify(keyString, v);
        }
      } catch (ex) {
        const error = this._errorFromException(ex);

        const v = {
          data: undefined,
          error: error,
          loaded: true,
          loading: undefined
        };

        this._set(container, keyString, v);

        this._notify(keyString, v);
      }
    } else {
      // Ok, cannot be loaded...
      const v = {
        data: undefined,
        error: undefined,
        loaded: false,
        loading: undefined
      };

      this._set(container, keyString, v);

      this._notify(keyString, v);
    }
  } // TODO(seckardt): Looks like this method was supposed to get a "better" impl?


  _errorFromException(ex) {
    // Just carry the exception
    return ex;
  } // TODO(seckardt): Looks like this method was supposed to get a "better" impl?


  _exceptionFromError(error) {
    // Just carry the exception
    return error;
  }

  _cancelRequest(keyString) {
    const container = this._container;
    const value = container.get(keyString);

    if (!value || !value.loading) {
      return undefined;
    } // TODO(priand,seckardt)
    // For now, only clear it - do more later with AbortablePromises


    const v = { ...value,
      loading: undefined
    };

    this._set(container, keyString, v);

    return v;
  }

  _notify(keyString, value) {
    // In case of SSR, we make sure that the value is stored in the global ssr context
    // So the server renderer can retrieve it afterwards
    if (this.ssrContext) {
      const {
        states
      } = this.ssrContext;
      const state = states.get(this.name);
      state.set(keyString, value);
    }

    this.subjects.forEach(subject => {
      if (subject.keyString === keyString) {
        subject.next(value);
      }
    });
  } //
  // Public methods
  //

  /**
   * Checks if the store has an entry for a key.
   */


  has(key) {
    return this._container.has(keyAsString(key));
  }
  /**
   * Get a value by key.
   */


  get(key) {
    return this._get(key, keyAsString(key), true);
  }
  /**
   * Shortcut to get the data by key.
   */


  getData(key) {
    const {
      data
    } = this.get(key) || {};
    return data;
  }
  /**
   * Shortcut to get the error by key.
   */


  getError(key) {
    const {
      error
    } = this.get(key) || {};
    return error;
  }
  /**
   * Returns the data after waiting for its load.
   */


  async getAsync(key) {
    const keyString = keyAsString(key);
    const {
      loaded,
      loading
    } = this._get(key, keyString, true) || {};

    if (!loaded && loading) {
      await loading;
    }

    return this._container.get(keyString) || {};
  }
  /**
   * Set the data for a key.
   *
   * The key is optional.
   */


  setData(key, data) {
    const _key = arguments.length === 1 ? undefined : key;

    const _data = arguments.length === 1 ? key : data;

    const container = this._container;
    const keyString = keyAsString(_key);
    const v = {
      data: _data,
      error: undefined,
      loaded: true,
      loading: undefined
    };

    this._set(container, keyString, v);

    this._notify(keyString, v);
  }
  /**
   * Set the error for a key.
   *
   * The key is optional.
   */


  setError(key, error) {
    const _key = arguments.length === 1 ? undefined : key;

    const _error = arguments.length === 1 ? key : error;

    const container = this._container;
    const keyString = keyAsString(_key);
    const v = {
      data: undefined,
      error: _error,
      loaded: true,
      loading: undefined
    };

    this._set(container, keyString, v);

    this._notify(keyString, v);
  }
  /**
   * Remove an entry by key.
   */


  remove(key) {
    const keyString = keyAsString(key);

    this._cancelRequest(keyString);

    this._container.delete(keyString);

    const v = {
      data: undefined,
      error: undefined
    };

    this._notify(keyString, v);
  }
  /**
   * Load an entry by key.
   *
   * If the value was already loaded, then it is reloaded.
   *
   * The loading state is set during the loading process and the observers are notified
   * The key is optional.
   *
   * The function returns a promise that is resolved when the value is loaded.
   */


  load(key, loader) {
    const _key = arguments.length === 1 ? undefined : key;

    const _loader = arguments.length === 1 ? key : loader;

    this._load(_key, keyAsString(_key), _loader);

    return this.getPromise(_key);
  }
  /**
   * Get an observable to get the notifications for a given key.
   */


  getObservable(key, load = true) {
    const keyString = keyAsString(key);

    const value = this._get(key, keyString, load);

    return new StoreSubject(this, keyString, value);
  }
  /**
   * Get an promise to either get the data or the error.
   */


  getPromise(key) {
    return this.getAsync(key).then(value => {
      const {
        data,
        error
      } = value;

      if (error) {
        throw this._exceptionFromError(error);
      }

      return data;
    });
  }
  /**
   * Cancel an on-going request if there is one.
   */


  cancelRequest(key) {
    const keyString = keyAsString(key);

    const v = this._cancelRequest(keyString);

    if (v) {
      this._notify(keyString, v);
    }
  }

}