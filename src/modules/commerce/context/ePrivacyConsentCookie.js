/*
 * Copyright 2020 salesforce.com, inc.
 * All Rights Reserved
 * Company Confidential
 */

/*
 * File reference: https://swarm.soma.salesforce.com/files/app/main/core/ui-force-components/modules/force/ePrivacyConsentCookie/ePrivacyConsentCookie.js
 */

export const OPTANON_COOKIE_NAME = 'OptanonConsent';
export const CONSENT_COOKIE_NAME = 'CookieConsent';
export const CONSENT_ENABLEMENT_COOKIE_NAME = 'CookieConsentPolicy';
const EXPIRY_MILLISECONDS_OPTANON_COOKIE = 1000 * 60 * 60 * 24 * 365;

const DEFAULT_COOKIE_VERSION = '232.1';
const DEFAULT_METADATA_VERSION = '230.1.0';
const RECONSENT_REQUIRED = false;
const CONSENT_COOKIE_SPLITTER = '|';

const PREFERENCES_CATEGORY_NAME = 'Preferences';
const STATISTICS_CATEGORY_NAME = 'Statistics';
const MARKETING_CATEGORY_NAME = 'Marketing';

const SAME_SITE = { NONE: 'None', STRICT: 'Strict', LAX: 'Lax' };

/**
 * @param {String} name The key of the key=value pair to set in the cookie.
 * @param {String} value The value of the key=value pair.
 * @param {Date} expires Date the key=value pair is to expire.
 * @param {String} path Portions of the site to limit this domain cookie to. (/apex, /_ui/, /, etc...)
 * @param {String} domain Sites to limit the cookie for.
 * @param {Boolean} secure Is this for the secure domain? (https:// vs http://)
 * @param {Function} [escapeCookieVal] Function used to escape the cookie value. Defaults to encodeURIComponent, but you could also supply window.escape() or window.encodeURI().
 * @param {String} sameSite The value of the SameSite attribute on Cookies (None|Strict|Lax). See Sfdc.Cookie.SAME_SITE above.
 * @example Sfdc.Cookie.setCookie('loginDate', new Date().toString(), null );
 * @description
 * Be wary of sticking things in the cookie. This information gets sent to the server on every request,
 * and it maxes out. So you could fill up the cookie and subsequent requests to setCookie don't get
 * stored.
 */
export function setCookie(name, value, expires, path, domain, secure, escapeCookieVal, sameSite) {
    // If sameSite is provided, ensure it's a valid value in the SAME_SITE map
    if (sameSite) {
        let found = false;
        const keys = Object.keys(SAME_SITE);
        for (let i = 0; i < keys.length; i++) {
            if (SAME_SITE[keys[i]] === sameSite) {
                found = true;
                break;
            }
        }
        if (!found) {
            throw new Error(`Setting cookie with provided SameSite value failed : ${sameSite}`);
        }
    }

    // Default to the safest and Unicode compliant escaping function.
    escapeCookieVal = escapeCookieVal || encodeURIComponent;
    document.cookie = `${name}=${escapeCookieVal(value)}${`${expires ? `; expires=${expires.toGMTString()}` : ''}${
        path ? `; path=${path}` : '; path=/'
    }${domain ? `; domain=${domain}` : ''}${secure === true ? '; secure' : ''}${
        sameSite ? `; SameSite=${sameSite}` : ''
    }`}`;
}

export function deleteCookie(name, path, domain) {
    if (getCookie(name)) {
        const exp = new Date(new Date().getTime() + 1000 * -10);

        // Set the cookie value to blank and expire it.
        setCookie(name, '', exp, path, domain);
    }
}

/**
 * Gets the value from the cookie.
 * @param {String} name The key of the value stored in the cookie.
 * @example
 * // Get the decoded value that was encoded on the way in.
 * Sfdc.Cookie.getCookie("lastLoggedInDate");
 *
 * // Get raw sid value from the cookie.
 * Sfdc.Cookie.getCookie("sid", function(rawValue) { return rawValue; });
 * @param {Function} [unescapeCookieVal="decodeURIComponent"] Function used to unescape the cookie value. Defaults to decodeURIComponent, but you could also supply window.unescape() or window.decodeURI(). Supplying a blank function would result in the returing of the raw value.
 */
function getCookie(name, unescapeCookieVal = decodeURIComponent) {
    const dc = document.cookie;
    const prefix = `${name}=`;
    let begin = dc.indexOf(`; ${prefix}`);
    if (begin === -1) {
        begin = dc.indexOf(prefix);
        if (begin !== 0) {
            return null;
        }
    } else {
        begin += 2;
    }
    let end = document.cookie.indexOf(';', begin);
    if (end === -1) {
        end = dc.length;
    }
    return unescapeCookieVal(dc.substring(begin + prefix.length, end));
}

/**
 * @description sets the consent preferences
 * @param cookieClassifications {object} Cookie classification object with classification categories as key and consent as boolean
 *
 *  By default, if OneTrust script is loaded, the following cookie will become available
 * - Optanon
 * {
 *     Preferences : true
 *     Marketing : true
 *     Statistics : false
 * }
 */
export function setOnetrustConsentCookie(cookieClassifications) {
    const nowDateTime = new Date();
    const EXPIRY_DATE = new Date(new Date().getTime() + EXPIRY_MILLISECONDS_OPTANON_COOKIE);
    const cookieValForOptanonConsent = getCookie(OPTANON_COOKIE_NAME);
    if (cookieValForOptanonConsent == null) {
        const defaultGroupConsent = getConsentStringFromPreferencesOptanon(cookieClassifications);
        const datestamp = nowDateTime.toString().split(' ').join('+');
        const cookieValueIfNull = `groups=${defaultGroupConsent}&datestamp=${datestamp}`;
        setCookie(OPTANON_COOKIE_NAME, cookieValueIfNull, EXPIRY_DATE, '/', null, false, encodeURIComponent, '');
        return;
    }
    const cookieElements = getParsedCookieElementsOptanon(cookieValForOptanonConsent);
    cookieElements.groups = getConsentStringFromPreferencesOptanon(cookieClassifications);
    cookieElements.datestamp = nowDateTime.toString().split(' ').join('+');
    const cookieElementsSerialized = serializeCookieElementsOptanon(cookieElements);
    const newCookieValueString = generateCookieValueStringOptanon(cookieElementsSerialized);
    setCookie(OPTANON_COOKIE_NAME, newCookieValueString, EXPIRY_DATE, '/', null, false, encodeURIComponent, '');
}

/**
 * @description sets the consent preferences
 * @param cookieClassifications {object} Cookie classification object with classification categories as key and consent as boolean
 *
 *  By default, the cookie should be provided by server
 * - SalesforceConsent
 * {
 *     Preferences : true
 *     Marketing : true
 *     Statistics : false
 * }
 */
export function setCookieConsent(cookieClassifications) {
    const nowDateTime = new Date();
    const EXPIRY_DATE = new Date(new Date().getTime() + EXPIRY_MILLISECONDS_OPTANON_COOKIE);
    const cookieValForCookieConsent = getCookie(CONSENT_COOKIE_NAME);
    if (cookieValForCookieConsent == null) {
        const defaultGroupConsent = getConsentStringFromPreferencesCookieConsent(cookieClassifications);
        const datestamp = getTimeStampInRequiredFormat(nowDateTime);
        const cookieValue =
            DEFAULT_COOKIE_VERSION +
            CONSENT_COOKIE_SPLITTER +
            DEFAULT_METADATA_VERSION +
            CONSENT_COOKIE_SPLITTER +
            datestamp +
            CONSENT_COOKIE_SPLITTER +
            defaultGroupConsent +
            CONSENT_COOKIE_SPLITTER +
            RECONSENT_REQUIRED;
        setCookie(CONSENT_COOKIE_NAME, cookieValue, EXPIRY_DATE, '/', null, false, encodeURI, '');
        return;
    }
    const cookieElements = getParsedCookieElementsCookieConsent(cookieValForCookieConsent);
    cookieElements[3] = getConsentStringFromPreferencesCookieConsent(cookieClassifications);
    cookieElements[2] = getTimeStampInRequiredFormat(nowDateTime);
    const cookieElementsSerialized = generateCookieValueStringCookieConsent(cookieElements);
    setCookie(CONSENT_COOKIE_NAME, cookieElementsSerialized, EXPIRY_DATE, '/', null, false, encodeURI, '');
}

/**
 * @description Return consent string based on the cookieClassifications provided
 * @param {Object} cookieClassifications
 * @returns String
 */
function getConsentStringFromPreferencesOptanon(cookieClassifications) {
    const preferencesCookieConsent = cookieClassifications[PREFERENCES_CATEGORY_NAME];
    const statisticsCookieConsent = cookieClassifications[STATISTICS_CATEGORY_NAME];
    const marketingCookieConsent = cookieClassifications[MARKETING_CATEGORY_NAME];
    let cookieConsentString = '1:1,';
    if (preferencesCookieConsent) {
        cookieConsentString = cookieConsentString.concat('2:1,');
    }
    if (statisticsCookieConsent) {
        cookieConsentString = cookieConsentString.concat('3:1,');
    }
    if (marketingCookieConsent) {
        cookieConsentString = cookieConsentString.concat('4:1,');
    }
    return encodeURIComponent(cookieConsentString.slice(0, -1));
}

/**
 * @description Return consent string in CookieConsent based on the cookieClassifications provided
 * @param {Object} cookieClassifications
 * @returns String
 */
function getConsentStringFromPreferencesCookieConsent(cookieClassifications) {
    const preferencesCookieConsent = cookieClassifications[PREFERENCES_CATEGORY_NAME];
    const statisticsCookieConsent = cookieClassifications[STATISTICS_CATEGORY_NAME];
    const marketingCookieConsent = cookieClassifications[MARKETING_CATEGORY_NAME];
    let cookieConsentString = '1';
    cookieConsentString += preferencesCookieConsent ? '1' : '0';
    cookieConsentString += statisticsCookieConsent ? '1' : '0';
    cookieConsentString += marketingCookieConsent ? '1' : '0';

    return encodeURIComponent(cookieConsentString);
}

/**
 * @description Return parsed cookie elements from cookie value
 * @param {Object} cookieValForOptanonConsent
 */
function getParsedCookieElementsOptanon(cookieValForOptanonConsent) {
    return cookieValForOptanonConsent
        .split('&')
        .map((cookieParams) => cookieParams.split('='))
        .reduce((cookieItem, keyValuePair) => {
            if (keyValuePair[0] != null && keyValuePair[1] != null) {
                cookieItem[decodeURIComponent(keyValuePair[0].trim())] = decodeURIComponent(keyValuePair[1].trim());
            }
            return cookieItem;
        }, {});
}

function serializeCookieElementsOptanon(cookieElements) {
    return Object.keys(cookieElements).map((item) => `${item}=${cookieElements[item]}`);
}

function generateCookieValueStringCookieConsent(cookieElements) {
    return cookieElements.join(CONSENT_COOKIE_SPLITTER);
}

function generateCookieValueStringOptanon(cookieElementsSerialized) {
    return cookieElementsSerialized.join('&');
}

function getParsedCookieElementsCookieConsent(cookieValForCookieConsent) {
    return cookieValForCookieConsent.split(CONSENT_COOKIE_SPLITTER);
}

/**
 * @description Convert date to required format and return it as String
 * @param {Date} date
 * @returns String
 */
function getTimeStampInRequiredFormat(date) {
    return date.toISOString();
}

/**
 * @description Return true if the coategory is allowed and false if it is not
 * The consent is determined by parsing the current consent state of OptanonConsent cookie
 * @param {String} categoryName
 * @returns Boolean
 */
export function isCategoryAllowedForCurrentConsentOptanon(categoryName) {
    const cookieValForEnablement = getCookie(CONSENT_ENABLEMENT_COOKIE_NAME);
    if (cookieValForEnablement == null) {
        return true;
    }
    const cookieValForOptanonConsent = getCookie(OPTANON_COOKIE_NAME);
    const enablementParts = cookieValForEnablement.split(':');
    const isSiteOptionEnabled = Boolean(Number(enablementParts[0]));
    const isCookieConsentPermEnabled = Boolean(Number(enablementParts[1]));

    if (isSiteOptionEnabled) {
        if (isCookieConsentPermEnabled) {
            if (cookieValForOptanonConsent == null) {
                if (Number(getCategoryIndex(categoryName)) === 1) {
                    return true;
                }
                return false;
            }
            return getConsentFromOptanon(cookieValForOptanonConsent, categoryName);
        }
        if (Number(getCategoryIndex(categoryName)) === 1) {
            return true;
        }
        return false;
    }
    return true;
}

function getConsentFromOptanon(cookieValForOptanonConsent, categoryName) {
    const cookieElements = getParsedCookieElementsOptanon(cookieValForOptanonConsent);
    if (cookieElements.groups == null) {
        return false;
    }
    const cookieConsent = cookieElements.groups;
    const categoryConsentMap = cookieConsent.split(',');
    const categoryIndexOfCookie = getCategoryIndex(categoryName);
    return getCategoryConsentValueOptanon(categoryIndexOfCookie, categoryConsentMap);
}

/**
 * @description Return true if the cotegory is allowed and false if it is not
 * The consent is determined by parsing the current consent state of CookieConsent cookie
 * @param {String} Category Name
 * @returns Boolean
 */
export function isCategoryAllowedForCurrentConsent(categoryName) {
    const cookieValForEnablement = getCookie(CONSENT_ENABLEMENT_COOKIE_NAME);
    if (cookieValForEnablement == null) {
        return true;
    }
    const cookieValForCookieConsent = getCookie(CONSENT_COOKIE_NAME);
    const enablementParts = cookieValForEnablement.split(':');
    const isSiteOptionEnabled = Boolean(Number(enablementParts[0]));
    const isCookieConsentPermEnabled = Boolean(Number(enablementParts[1]));
    if (isSiteOptionEnabled) {
        if (isCookieConsentPermEnabled) {
            if (cookieValForCookieConsent == null) {
                if (Number(getCategoryIndex(categoryName)) === 1) {
                    return true;
                }
                return false;
            }
            return getConsentFromCookieConsentValue(cookieValForCookieConsent, categoryName);
        }
        if (Number(getCategoryIndex(categoryName)) === 1) {
            return true;
        }
        return false;
    }
    return true;
}

function getConsentFromCookieConsentValue(cookieValForCookieConsent, categoryName) {
    const cookieElements = getParsedCookieElementsCookieConsent(cookieValForCookieConsent);
    if (cookieElements[3] == null) {
        return false;
    }
    const cookieConsent = cookieElements[3];
    const categoryIndex = Number(getCategoryIndex(categoryName));
    const consentValue = Number(cookieConsent.charAt(categoryIndex - 1));
    const result = consentValue === 1 ? true : false;
    return result;
}

/**
 * @description Return boolean value if the cookie has consent or not
 * @param {String} categoryIndex
 * @param {Object} categoryConsentMap
 * @returns Boolean
 */
function getCategoryConsentValueOptanon(categoryIndex, categoryConsentMap) {
    for (const item of categoryConsentMap) {
        const catConsentSplit = item.split(':');
        const categoryIndexFromCookieValue = catConsentSplit[0];
        const categoryConsentFromCookieValue = catConsentSplit[1];
        if (categoryIndex === categoryIndexFromCookieValue) {
            return categoryConsentFromCookieValue === '1';
        }
    }

    return false;
}

/**
 * @description Get Category Index from categoryName (hardcoded currently based on defined categories)
 * @param {String} categoryName
 * @returns String
 */
function getCategoryIndex(categoryName) {
    switch (categoryName.toLowerCase()) {
        case 'essential':
            return '1';
        case 'preferences':
            return '2';
        case 'statistics':
            return '3';
        case 'marketing':
            return '4';
        default:
            return '-1';
    }
}

export { getCookie };
