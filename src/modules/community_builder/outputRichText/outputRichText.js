import { LightningElement, api } from 'lwc';
import { classSet } from 'lightning/utils';
import { processContents } from 'community_builder/richTextUtil';
import {
    DATA_BIND_REGEX,
    DATA_PROVIDER_GET_FIELD_DATA_EVENT_NAME
} from 'dxp_data_provider/dataProviderUtils';

export default class OutputRichText extends LightningElement {
    processedValue = '';
    isDomReady = false;
    pendingEvent;

    @api enableQuillCss = false;

    /**
     * Sets the rich text to display.
     * @type {string}
     *
     * The rich text should be a valid html string which can contain
     * references to content assets in the form of {!contentAsset.name.version}
     */
    @api
    get value() {
        return this.processedValue;
    }

    set value(val) {
        this.processedValue = processContents(val);
        this.processDataExpressions(this.processedValue);
        this.renderRichText();
    }

    /**
     * Data provider provides data that is used to resolve the data expressions
     * ex. {!Item.field}
     *
     * @param {object} data - Object with field names as keys and field values as values
     */
    @api
    setDataExpressions(data) {
        this.processedValue = this.resolveDataExpressions(this.value, data);
        this.renderRichText();
    }

    get containerClass() {
        return classSet({ 'ql-editor': this.enableQuillCss }).toString();
    }

    /**
     * Resolve data expressions with the provided data. Searches html for
     * {!Item.field} and resolves with data.
     *
     * @param {string} html - html to render
     * @param {object} data - object with field names as keys and field values as values
     */
    resolveDataExpressions(html, data) {
        let result = html;
        let tokens;
        while ((tokens = DATA_BIND_REGEX.exec(html)) !== null) {
            const [match, field] = tokens;
            result = result.replace(match, data[field]);
        }
        return result;
    }

    /**
     * Searches html for data expresions (ex. {!Item.field})
     * Sends event to data provider asking for data to resolve data expressions
     *
     * @param {String} html - html to render
     */
    processDataExpressions(html) {
        let tokens;
        let fields = [];
        while ((tokens = DATA_BIND_REGEX.exec(html)) !== null) {
            const [, field] = tokens;
            fields.push(field);
        }

        if (fields.length > 0) {
            this.pendingEvent = new CustomEvent(
                DATA_PROVIDER_GET_FIELD_DATA_EVENT_NAME,
                {
                    detail: fields,
                    bubbles: true,
                    composed: true
                }
            );
        }
    }

    renderedCallback() {
        this.isDomReady = true;
        this.renderRichText();
    }

    renderRichText() {
        if (this.isDomReady) {
            const container = this.template.querySelector('div');
            // eslint-disable-next-line @lwc/lwc/no-inner-html
            container.innerHTML = this.processedValue;
            if (this.pendingEvent) {
                // We need to set pendingEvent to null before dispatching, because event could trigger
                // a rerender which would send the event out again
                const e = this.pendingEvent;
                this.pendingEvent = null;
                this.dispatchEvent(e);
            }
        }
    }
}
