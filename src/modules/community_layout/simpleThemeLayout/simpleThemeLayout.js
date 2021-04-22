import { LightningElement, api } from 'lwc';

/**
 * A simple Theme Layout component with a header, footer, and main area.
 * This @slot comment is important, if it doesn't exist the slots will not be accessible
 *
 * @slot header Header slot
 * @slot footer Footer slot
 * @slot default Default slot
 */
export default class SimpleThemeLayout extends LightningElement {
    /**
     * Header background color in string format.
     * @type {string}
     */
    @api headerBackgroundColor;

    /**
     * Main area background color in string format.
     * @type {string}
     */
    @api mainBackgroundColor;

    /**
     * Footer background color in string format.
     * @type {string}
     */
    @api footerBackgroundColor;

    get headerStyle() {
        return `background-color: ${this.headerBackgroundColor}`;
    }

    get footerStyle() {
        return `background-color: ${this.footerBackgroundColor}`;
    }

    get mainStyle() {
        return `background-color: ${this.mainBackgroundColor}`;
    }
}
