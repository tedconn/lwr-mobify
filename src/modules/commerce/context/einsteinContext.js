import { Store } from 'commerce/store';
import { appContextStore } from './appContext';
import { connFetchEinsteinConfig } from './einsteinContextConnector';

class EinsteinContext {
    // data;

    constructor(data) {
        this.data = data;
    }

    get config() {
        return this.data;
    }

    // Any method/property can be exposed here...
}

const einsteinContextStore = new Store('EinsteinContext', {
    loader: async () => {
        const appContext = await appContextStore.getPromise();
        const einsteinConfig = await connFetchEinsteinConfig(appContext);
        return new EinsteinContext(einsteinConfig);
    },
});

export { einsteinContextStore };
