import { Store } from 'commerce/store';
import { readAppContext } from './appContextConnector';

// As of now, there is one App Context that is valid at a time
// So we store the value in a module private member
// Would normally use a #private syntax when JS will support it (or typescript?)
let contextData;

class AppContext {
    constructor(data) {
        contextData = data;
    }

    get webstoreId() {
        return contextData ? contextData.webstoreId : null;
    }

    get urlPathPrefix() {
        return contextData ? contextData.urlPathPrefix : null;
    }

    get networkId() {
        return contextData ? contextData.networkId : null;
    }

    get logoutUrl() {
        return contextData ? contextData.logoutUrl : null;
    }

    get baseUrl() {
        const isSecure = window.location.protocol === 'https:';
        const { baseSecureUrl = null, baseInsecureUrl = null } = contextData || {};
        return isSecure ? baseSecureUrl : baseInsecureUrl;
    }

    get urlPathPrefixShort() {
        const urlPathPrefix = contextData ? contextData.urlPathPrefix : null;
        return urlPathPrefix ? urlPathPrefix.substr(0, urlPathPrefix.lastIndexOf('/')) : null;
    }
}

const appContextStore = new Store('AppContext', {
    loader: async () => {
        const result = await readAppContext();
        return new AppContext(result);
    },
});

// getAppContextData is temporarily exported for the session context
// Until the 2 are split into 2 services
function getAppContextData() {
    return contextData;
}

export { appContextStore, getAppContextData };
