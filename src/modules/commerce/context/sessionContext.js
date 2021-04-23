import { Store } from 'commerce/store';
import { readSessionContext } from './sessionContextConnector';

// As of now, there is one Session Context that is valid at a time
// So we store the value in a module private member
// Would normally use a #private syntax when JS will support it (or typescript?)
let contextData;

class SessionContext {
    constructor(data) {
        contextData = data;
    }

    get effectiveAccountId() {
        return contextData ? contextData.effectiveAccountId : null;
    }

    get isLoggedIn() {
        return (!!contextData && contextData.isGuestUser && contextData.isGuestUser.toLowerCase() === 'false') || false;
    }

    get userId() {
        return contextData ? contextData.userId : null;
    }

    get userName() {
        return contextData ? contextData.name : null;
    }

    get isPreview() {
        return !!contextData && 'true' === contextData.siteforcePreview;
    }

    get isAnonymousPreview() {
        return !!contextData && 'true' === contextData.anonymousPreview;
    }

    get isGuestCartCheckoutEnabled() {
        return !!contextData && 'true' === contextData.isGuestCartCheckoutEnabled;
    }

    get paymentComponentName() {
        return contextData ? contextData.paymentComponentName : null;
    }
}

const sessionContextStore = new Store('SessionContext', {
    loader: async () => {
        const result = await readSessionContext();
        return new SessionContext(result);
    },
});

export { sessionContextStore };
