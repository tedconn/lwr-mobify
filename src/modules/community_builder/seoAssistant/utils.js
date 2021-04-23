import * as utils from './utils';

export const fieldPatternToMatch = new RegExp(
    `\\{!(Record|Content)[\\.\\w]+\\}`,
    'g'
);
export const fieldExpPartToStrip = new RegExp(
    `\\{!(Record|Content)\\.|\\}`,
    'g'
);
const recordNameRegex = new RegExp('\\{!(Record|Content)\\._Title\\}', 'g');
const objectNameRegex = new RegExp('\\{!(Record|Content)\\._Object\\}', 'g');
const singleQuoteRegex = new RegExp("'", 'g');
const doubleQuoteRegex = new RegExp('"', 'g');

/**
 * Removes existing SEO properties set by this component and sets new resolved SEO properties
 * in the head markup of the page.
 *
 * TODO: Move this to an event handler because 'document' level DOM queries are not allowed in a component.
 *
 * @param {*} recordData Record fields and values
 * @returns resolved SEO property
 */
export function setSeoProperties(recordData, unresolvedProperties) {
    const seoProperties = processSeoProperties(
        recordData,
        unresolvedProperties
    );

    if (seoProperties.title) {
        document.title = seoProperties.title;
    }

    let headElement;
    if (seoProperties.description) {
        headElement = document.createElement('meta');
        headElement.setAttribute('name', 'description');
        headElement.setAttribute('content', seoProperties.description);
        headElement.setAttribute('data-owner', 'setSEOProperties');
        document.head.appendChild(headElement);
    }

    if (seoProperties.customHeadTags) {
        Object.entries(seoProperties.customHeadTags).forEach(
            ([tagType, tags]) => {
                tags.forEach((attributes) => {
                    headElement = document.createElement(tagType);
                    Object.entries(attributes).forEach(([name, value]) => {
                        headElement.setAttribute(name, value);
                    });
                    headElement.setAttribute('data-owner', 'setSEOProperties');
                    document.head.appendChild(headElement);
                });
            }
        );
    }
}

/**
 * Removes all meta tags set by this component from the head markup
 */
export function cleanUpTags(oldTitle) {
    document.title = oldTitle;

    const metaElements = document.head.querySelectorAll(
        'head [data-owner=setSEOProperties]'
    );

    metaElements.forEach((node) => node.parentNode.removeChild(node));
}

/**
 * Parse SEO properties and extract object field names from the expression used in them.
 *
 * @param string recordData Record fields and values
 * @returns resolved SEO properties
 */
export function getNeedRecordAndQueryFields(pageTitle, description, metaTags) {
    const seoProperties = [pageTitle, description, metaTags];
    const allFields = seoProperties
        .filter((prop) => prop && fieldPatternToMatch.test(prop))
        .flatMap((prop) =>
            prop
                .match(fieldPatternToMatch)
                .map((val) => val.replace(fieldExpPartToStrip, ''))
        );

    const needRecord = allFields.length > 0;

    // '_name' expressions are not actual record fields but properties of the entity (E.g. name field, entity label).
    // They cannot be queried directly so we don't pass them to the API. They are included by default in the returned
    // value (if possible).
    const queryFields = Array.from(
        new Set(allFields.filter((field) => !field.startsWith('_')))
    );

    return { needRecord, queryFields: queryFields.join() };
}

/**
 * Resolves all expressions in each SEO property using record information,
 * returns properties unchanged if there is no record data.
 *
 * @param {*} recordData Record fields and values
 * @returns resolved SEO properties
 */
function processSeoProperties(recordData, unresolvedProperties) {
    const resolvedProperties = {};

    if (unresolvedProperties.title) {
        resolvedProperties.title = resolveFieldsEL(
            recordData,
            unresolvedProperties.title
        );
    }

    if (unresolvedProperties.description) {
        resolvedProperties.description = resolveFieldsEL(
            recordData,
            unresolvedProperties.description
        );
    }

    if (unresolvedProperties.customHeadTags) {
        resolvedProperties.customHeadTags = convertCustomHeadTagsToJson(
            resolveFieldsEL(recordData, unresolvedProperties.customHeadTags)
        );
    }

    return resolvedProperties;
}

/**
 * Resolves an expression using record information
 *
 * @param {*} recordData Record fields and values
 * @param expression The expression to resolve
 * @returns resolved SEO property
 */
function resolveFieldsEL(recordData, expression) {
    if (!expression || !Object.keys(recordData).length > 0) {
        return expression;
    }

    expression = expression.replace(recordNameRegex, recordData.recordName);
    expression = expression.replace(objectNameRegex, recordData.objectName);

    Object.entries(recordData.fields)
        .filter(([name, value]) => name && value)
        .forEach(([name, value]) => {
            const fieldPattern = new RegExp(
                `\\{!(Record|Content)\\.${name}\\}`,
                'g'
            );
            // Values that go in an HTML tag's attribute need to be escaped.
            const escapedValue = value
                .replace(singleQuoteRegex, '&apos;')
                .replace(doubleQuoteRegex, '&quot;');

            expression = expression.replace(fieldPattern, escapedValue);
        });

    return expression;
}

/**
 * Convert head tags from HTML format to JSON
 *
 * @param htmlString Meta tags in HTML format
 * @returns resolved SEO property
 */
export function convertCustomHeadTagsToJson(htmlString) {
    const headDOM = utils.getHeadDOM(htmlString);

    let customHeadTagsJson = {};
    if (headDOM) {
        // headDOM is null when PhantomJS renders the page.
        let metaTagsJson = [];
        let linkTagsJson = [];
        let tags = Array.from(headDOM.querySelectorAll('head meta, head link'));
        tags.forEach((tag) => {
            const node = {};
            convertAttributesNamedNodeMapToArray(tag.attributes)
                .filter((attr) => attr && attr.name && attr.value)
                .map((attr) => (node[attr.name] = attr.value));

            if (tag.tagName === 'META') {
                metaTagsJson.push(node);
            } else {
                linkTagsJson.push(node);
            }
        });
        customHeadTagsJson.meta = metaTagsJson;
        customHeadTagsJson.link = linkTagsJson;
    }

    return customHeadTagsJson;
}

/**
 * Head tags are set as plain HTML input but setSEOProperties needs tags in a JSON format, so we build a DOM
 * from the htmlString.
 *
 * @param htmlString Head tags in HTML format
 * @returns DOM representation of head tags HTML
 */
export function getHeadDOM(htmlString) {
    const parser = new DOMParser();
    return parser.parseFromString(htmlString, 'text/html');
}

/**
 * Converts a tag's attribute NamedNodeMap to an array because it is not iterable.
 *
 * @param attributes NamedNodeMap representation of attributes
 */
function convertAttributesNamedNodeMapToArray(attributes) {
    const attributeArray = [];
    for (let i = 0; i < attributes.length; i++) {
        attributeArray.push(attributes[i]);
    }

    return attributeArray;
}
