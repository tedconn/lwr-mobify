import { appContextStore, getAppContextData } from './appContext';

// This is temporary until the app & user service are split
export async function readSessionContext() {
    await appContextStore.getPromise();
    return getAppContextData();
}
