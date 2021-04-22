import { LightningElement, api, wire, track } from 'lwc';
import { getRecordSeoProperties } from 'lightning/communityRecordSeoPropertiesApi';
import { CurrentPageReference } from 'lightning/navigation';
import CommunityId from '@salesforce/community/Id';
import {
    cleanUpTags,
    setSeoProperties,
    getNeedRecordAndQueryFields
} from './utils';

export default class SeoAssistant extends LightningElement {
    /**
     * Document title displayed in the browser and search result.
     *
     * @type {string}
     */
    @api
    get pageTitle() {
        return this._pageTitle;
    }

    set pageTitle(_pageTitle) {
        this._pageTitle = _pageTitle;
        this.getFieldsAndSetProperties();
    }

    // Private version of pageTitle
    _pageTitle;

    /**
     * Content of the description meta tag.
     *
     * @type {string}
     */
    @api
    get description() {
        return this._description;
    }

    set description(_description) {
        this._description = _description;
        this.getFieldsAndSetProperties();
    }

    // Private version of description
    _description;

    /**
     * Additional head tags in plain HTML form.
     *
     * @type {string}
     */
    @api
    get customHeadTags() {
        return this._customHeadTags;
    }

    set customHeadTags(_customHeadTags) {
        this._customHeadTags = _customHeadTags;
        this.getFieldsAndSetProperties();
    }

    // Private version of head tags
    _customHeadTags;

    /**
     * Context RecordId on object pages.
     *
     * @type {string}
     */
    @api
    recordId;

    /**
     * Main param used to query SEO properties. It can be a recordId or a urlAlias.
     *
     * @type {string}
     */
    @track
    queryKey;

    /**
     * Fields (comma-separated) used in SEO properties' expressions which need to be queried.
     *
     * @type {string}
     */
    @track
    queryFields;

    /**
     * Flag to decide if an API call is needed to fetch record data.
     *
     * @type {Boolean}
     */
    needRecord = false;

    /**
     * Record data including field values used to set properties' tags
     *
     * @type {Object}
     */
    recordData = {};

    /**
     * Browser title set before this component is loaded.
     *
     * @type {string}
     */
    oldTitle;

    /**
     * Check fields to query when the component is initialized. Set the raw properties directly if
     * there's no need to get data.
     */
    connectedCallback() {
        this.getFieldsAndSetProperties();
    }

    /**
     * Remove all tags set by this component at the end of its lifecycle.
     */
    disconnectedCallback() {
        cleanUpTags(this.oldTitle);
    }

    /**
     * Get the query key (recordId or urlAlias) from the page reference
     *
     * @param {*} data page reference wire response
     */
    @wire(CurrentPageReference)
    wiredPageRef(data) {
        if (data) {
            const attributes = data.attributes;
            if (attributes.recordId) {
                this.queryKey = this.recordId;
            } else if (attributes.urlAlias) {
                this.queryKey = attributes.urlAlias;
            }
        }
    }

    /**
     * Set the field-based properties using the record data returned by the API
     *
     * @param {*} param SEO properties wire response
     */
    @wire(getRecordSeoProperties, {
        communityId: CommunityId,
        recordId: '$queryKey',
        fields: '$queryFields'
    })
    wiredRecordSeoProperties({ error, data }) {
        if (this.needRecord && data) {
            Object.assign(this.recordData, data);
            this.getFieldsAndSetProperties();
        } else if (error) {
            this.error = error;
        }
    }

    /**
     * Parse SEO properties and extract object field names from the expression used in them, if any.
     * Set the SEO properties in the DOM if record information is not needed or is already
     * fetched.
     */
    getFieldsAndSetProperties() {
        this.oldTitle = document.title;
        const result = getNeedRecordAndQueryFields(
            this.pageTitle,
            this.description,
            this.customHeadTags
        );

        this.needRecord = result.needRecord;
        this.queryFields = result.queryFields;

        // When the properties don't rely on record information, they can be set right away,
        // without needing to wait for the API call. Otherwise, only set the properties when
        // we have record data from the API.
        // setSeoProperties could be called multiple times when any property is set, so clean up
        // before setting each time to avoid duplicate tags.
        if (!this.needRecord) {
            cleanUpTags(this.oldTitle);
            setSeoProperties({}, this.getUnresolvedProperties());
        } else if (Object.entries(this.recordData).length !== 0) {
            cleanUpTags(this.oldTitle);
            setSeoProperties(this.recordData, this.getUnresolvedProperties());
        }
    }

    /**
     * Get SEO properties in their original form, where they might still contain expressions.
     */
    getUnresolvedProperties() {
        const unresolvedProperties = {};
        unresolvedProperties.title = this.pageTitle;
        unresolvedProperties.description = this.description;
        unresolvedProperties.customHeadTags = this.customHeadTags;

        return unresolvedProperties;
    }
}
