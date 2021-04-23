import { keyAsString } from './store-key';
import { Store } from './store';
/**
 * Generic @wire adapter that works with a store.
 *
 * Note: this is deprecated for Commerce as it does not work with Server Side Rendering
 *
 * Typical usage:
 *    const myStore  = new Store('MyStore', loadMyStore);
 *    ...
 *    @wire(StoreAdapter, {store: myStore, [key: objectkey]}) myData;
 *
 * or:
 *    const myStore = new Store('MyStore', loadMyStore);
 *    class MyAdapter extends StoreAdapter {
 *      constructor(dataCallback) {
 *        super(dataCallback, myStore);
 *      }
 *    }
 *    ...
 *    @wire(MyAdapter, {[key: objectkey]}) myData;
 */

export class StoreAdapter {
  isConnected = false;

  /**
   * Dedicated constructor.
   * 'store' and 'key' can be used by inherited, specialized stores
   */
  constructor(dataCallback, store, key) {
    this.dataCallback = dataCallback;
    this.store = store;
    this.key = key;
    this.initialStore = store;
    this.initialKey = key;
  }

  _unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      delete this.subscription;
      delete this.subscribedStore;
      delete this.subscribedKey;
    }
  }

  _subscribe() {
    // It only makes sense to subscribe when both connect and update have been called
    // LWC seems to call these methods in no particular order...
    if (this.isConnected && this.config) {
      if (this.subscribedStore !== this.store || keyAsString(this.subscribedKey) !== keyAsString(this.key)) {
        this._unsubscribe();

        if (this.store) {
          this.subscribedStore = this.store;
          this.subscribedKey = this.key;
          this.subscription = this.subscribedStore.getObservable(this.subscribedKey).subscribe(this.dataCallback);
        }
      }

      if (this.subscribedStore === undefined) {
        // We enforce an initial empty object as sometime connect() is called before update()
        this.dataCallback({
          loaded: false
        });
      }
    }
  }

  update(config) {
    this.config = config;

    if (!this.initialStore === undefined) {
      this.store = this.getStore(config);
    }

    if (this.initialKey === undefined) {
      this.key = this.getKey(config);
    }

    this._subscribe();
  }

  getStore(config) {
    if (config && config.store instanceof Store) {
      return config.store;
    }

    return undefined;
  }

  getKey(config) {
    // Remove the store entry
    if (this.initialStore === undefined) {
      const {
        store,
        ...rest
      } = config;
      config = rest;
    }

    if (Object.prototype.hasOwnProperty.call(config, 'key') && Object.keys(config).length === 1) {
      return config.key;
    }

    return config;
  }

  connect() {
    this.isConnected = true;

    this._subscribe();
  }

  disconnect() {
    this._unsubscribe();

    this.isConnected = false;
  }

}