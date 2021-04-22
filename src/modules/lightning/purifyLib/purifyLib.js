import purify from './purify';

/**
 * Sanitize method providing core sanitation functionality
 *
 * @param {String|Node} dirty string or DOM node
 * @param {Object} configuration object
 * @return {String} sanitized string
 */

export default function sanitizeHTML(dirty, config) {
    return purify.sanitize(dirty, config);
}
