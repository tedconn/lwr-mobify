/*  *******************************************************************************************
 *  ATTENTION!
 *  THIS IS A GENERATED FILE FROM https://github.com/salesforce/lds-lightning-platform
 *  If you would like to contribute to LDS, please follow the steps outlined in the git repo.
 *  Any changes made to this file in p4 will be automatically overwritten.
 *  *******************************************************************************************
 */
/* proxy-compat-disable */
import auraStorage from 'aura-storage';

// The VERSION environment variable is replaced by rollup during the bundling and replaces it with
// the commit hash. This avoid having a cache hit on data that has been stored by a previous
// version of LDS.
const STORAGE_VERSION = "03778f23";
// AuraStorage treats `secure` as a must-have whereas `persistent` is a nice-to-have. Secure and
// persistent storage is only possible with CryptoAdapter. Availability of that adapter is
// controlled by the application.
const STORAGE_CONFIG = {
    persistent: true,
    secure: true,
    maxSize: 5 * 1024 * 1024,
    clearOnInit: false,
    debugLogging: false,
    version: STORAGE_VERSION,
};
const STORAGE_INSTANCES = [];
function createStorage(config) {
    if (auraStorage.initStorage === undefined) {
        return null;
    }
    const storageConfig = {
        ...STORAGE_CONFIG,
        ...config,
    };
    const storage = auraStorage.initStorage(storageConfig);
    if (!storage.isPersistent()) {
        if (auraStorage.deleteStorage !== undefined) {
            auraStorage.deleteStorage(storageConfig.name).catch(() => { }); // intentional noop on error
        }
        return null;
    }
    STORAGE_INSTANCES.push(storage);
    return storage;
}
function clearStorages() {
    return Promise.all(STORAGE_INSTANCES.map(storage => {
        try {
            return storage.clear();
        }
        catch (e) {
            /* noop */
        }
    }));
}

export { clearStorages, createStorage };
// version: 1.11.3-03778f23
