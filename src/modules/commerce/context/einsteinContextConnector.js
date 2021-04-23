import { fetch } from 'transport';
import { currentRelease } from 'commerce/config';

const API_VERSION = currentRelease.apiVersion;

export async function connFetchEinsteinConfig(appContext) {
    const response = await fetch(
        `/services/data/${API_VERSION}/commerce/einstein/webstores/${appContext.webstoreId}/configuration`,
        {
            method: 'GET',
            credentials: 'same-origin',
        }
    );
    if (!response.ok) {
        throw new Error(response.statusText || 'Error while accessing Einstein context');
    }
    return response.json();
}
