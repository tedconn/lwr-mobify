import { fetch } from 'transport';

export async function readAppContext() {
    let body = JSON.stringify({
        namespace: 'applauncher',
        classname: 'CommerceStoreController',
        method: 'getCommerceContext',
        isContinuation: false,
        params: {},
        cacheable: true,
    });
    const response = await fetch('/apex/execute', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json;  charset=utf-8',
        },
        body: body,
    });

    if (!response.ok) {
        throw new Error(`Error ${response.status} while accessing the application context`);
    }

    return (await response.json()).returnValue;
}
