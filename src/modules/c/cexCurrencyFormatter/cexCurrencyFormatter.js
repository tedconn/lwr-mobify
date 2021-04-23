import LOCALE from '@salesforce/i18n/locale';

/**
 * In-memory formatter cache
 *
 * @type {Map<string, Intl.NumberFormat>}
 * @private
 */
const _formatterCache = new Map();

/**
 * Formats a numeric value as a currency suitable for display in the store.
 *
 * @param {string} currency
 *  The currency to which the value will be formatted, specified as a ISO 4217 currency value.
 *
 * @param {number | string} value
 *  The numeric value to format.
 *
 * @param {'symbol' | 'code' | 'name'} currencyDisplay
 *  How to display the currency; defaults to 'symbol'
 *    - 'symbol' to use a localized currency symbol such as €
 *    - 'code' to use the ISO currency code
 *    - 'name' to use a localized currency name such as 'dollar'
 *
 * @returns {string}
 *  A formatted currency value.
 *
 * @throws {TypeError | RangeError}
 *  TypeError if currency is not provided
 *  RangeError if currency or currencyDisplay is invalid
 */
export default function format(currency, value, currencyDisplay = 'symbol') {
    const key = `${currency}-${currencyDisplay}`;
    let formatter = _formatterCache.get(key);

    if (!formatter) {
        formatter = new Intl.NumberFormat(LOCALE, {
            style: 'currency',
            currency,
            currencyDisplay
        });
        _formatterCache.set(key, formatter);
    }

    return formatter.format(value);
}