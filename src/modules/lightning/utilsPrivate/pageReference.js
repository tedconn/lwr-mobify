const VALID_PAGE_REFERENCE_PROPERTIES = new Set([
    'type',
    'attributes',
    'state',
]);

export function isValidPageReference(object) {
    return (
        object &&
        object.type &&
        typeof object.type === 'string' &&
        object.attributes &&
        typeof object.attributes === 'object' &&
        Object.keys(object).every((prop) =>
            VALID_PAGE_REFERENCE_PROPERTIES.has(prop)
        )
    );
}
