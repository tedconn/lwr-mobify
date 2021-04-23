import { appContextStore, getAppContextData } from './appContext';
import { einsteinContextStore } from './einsteinContext';
import { sessionContextStore } from './sessionContext';
import * as ePrivacyConsentCookie from './ePrivacyConsentCookie';

// TEMP class to maintain the compatibility
class _AppContext {
    constructor() {
        appContextStore.getObservable().subscribe((value) => {
            this.appContext = value.data;
        });
        sessionContextStore.getObservable().subscribe((value) => {
            this.sessionContext = value.data;
        });
    }

    async init(cb, errorCb) {
        // Wait for the user context to be loaded
        await sessionContextStore.getAsync();

        // And then for the app context
        const ctx = await appContextStore.getAsync();
        if (ctx.error) {
            if (errorCb) {
                errorCb({ error: ctx.error.message });
            }
        } else if (getAppContextData()) {
            if (cb) {
                const data = getAppContextData();
                cb({ data });
            }
        }
    }

    //
    // Application context
    //
    get webstoreId() {
        return this.appContext ? this.appContext.webstoreId : null;
    }

    get urlPathPrefix() {
        return this.appContext ? this.appContext.urlPathPrefix : null;
    }

    get networkId() {
        return this.appContext ? this.appContext.networkId : null;
    }

    get logoutUrl() {
        return this.appContext ? this.appContext.logoutUrl : '';
    }

    get baseUrl() {
        return this.appContext ? this.appContext.baseUrl : '';
    }

    get urlPathPrefixShort() {
        return this.appContext ? this.appContext.urlPathPrefixShort : '';
    }

    //
    // User context
    //

    get isLoggedIn() {
        return this.sessionContext ? this.sessionContext.isLoggedIn : false;
    }

    get userId() {
        return this.sessionContext ? this.sessionContext.userId : null;
    }

    get userName() {
        return this.sessionContext ? this.sessionContext.userName : null;
    }

    get effectiveAccountId() {
        return this.sessionContext ? this.sessionContext.effectiveAccountId : null;
    }

    get isPreview() {
        return this.sessionContext ? this.sessionContext.isPreview : null;
    }

    get isAnonymousPreview() {
        return this.sessionContext ? this.sessionContext.isAnonymousPreview : null;
    }

    get isGuestCartCheckoutEnabled() {
        return this.sessionContext ? this.sessionContext.isGuestCartCheckoutEnabled : false;
    }

    get paymentComponentName() {
        return this.sessionContext ? this.sessionContext.paymentComponentName : null;
    }

    //
    // Einstein config
    //
    async getEinsteinConfig() {
        return einsteinContextStore
            .getPromise()
            .then((ctx) => {
                return ctx.config;
            })
            .catch((e) => {
                /*
                 This is only here because not returning 'undefined' might break components that rely on
                  the legacy context to not throw an error if response.ok is false. This will change once legacy context is removed.
                  However, catching errors here without any notification makes debugging difficult and therefore we're
                  throwing it on the console.
                */
                console.error(e);
                return undefined;
            });
    }

    /**
     * Allow write access to document.cookie from inside components.
     */
    setDocumentCookie(fullCookieString) {
        document.cookie = fullCookieString;
    }

    ePrivacyConsentCookie = ePrivacyConsentCookie;
}

const B2CLiteContext = new _AppContext();

// Helpers
function getAppContext() {
    return appContextStore.getPromise();
}
function getSessionContext() {
    return sessionContextStore.getPromise();
}
function getEinsteinContext() {
    return einsteinContextStore.getPromise();
}

// class AppContextAdapter extends StoreAdapter {
//     constructor(dataCallback) {
//         super(dataCallback, appContextStore)
//     }
// }
// class SessionContextAdapter extends StoreAdapter {
//     constructor(dataCallback) {
//         super(dataCallback, sessionContextStore)
//     }
// }
// class EinsteinContextAdapter extends StoreAdapter {
//     constructor(dataCallback) {
//         super(dataCallback, einsteinContextStore)
//     }
// }

// B2CLiteContext is going to be removed
export {
    B2CLiteContext,
    getAppContext,
    getEinsteinContext,
    getSessionContext,
    // AppContextAdapter,
    // EinsteinContextAdapter,
    // SessionContextAdapter,
    appContextStore,
    einsteinContextStore,
    sessionContextStore,
};
