import { LightningElement, api } from 'lwc';

/**
 * Html Editor LWC based of Aura forceCommunity:htmlBlock
 */
export default class HtmlEditor extends LightningElement {
    internalValue = '';

    /**
     * The HTML content in the rich text editor.
     * @type {string}
     */
    @api
    get richTextValue() {
        return this.internalValue;
    }

    set richTextValue(val) {
        this.internalValue = val;
    }
}
