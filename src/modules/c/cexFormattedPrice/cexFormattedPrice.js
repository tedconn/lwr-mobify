import { LightningElement, api } from 'lwc';
import currencyFormatter from 'c/cexCurrencyFormatter';

export default class FormattedPrice extends LightningElement {
    /**
     * The ISO 4217 currency code for the price
     *
     * @type {string}
     */
    @api
    currencyCode;

    /**
     * The value of the price to format
     *
     * If assigned a value of 'undefined', no value will be displayed.
     * A value of 'null' is handled as though it were a value of zero.
     *
     * @type {number | string}
     */
    @api
    value;

    /**
     * Specify how the currency is displayed, defaults to 'symbol'
     *
     * @type {'symbol' | 'code' | 'name'}
     *    - 'symbol' to use a localized currency symbol such as €
     *    - 'code' to use the ISO currency code, e.g. 'USD' or 'EUR'
     *    - 'name' to use a localized currency name such as 'dollar'
     */
    @api
    displayCurrencyAs;

    /**
     * Gets the formatted price based on the currencyCode and value
     *
     * @type {string | undefined}
     * @readonly
     */
    get formattedPrice() {
        if (this.value !== undefined && this.currencyCode) {
            return currencyFormatter(
                this.currencyCode,
                this.value,
                this.displayCurrencyAs || 'symbol'
            );
        }
        return undefined;
    }
}