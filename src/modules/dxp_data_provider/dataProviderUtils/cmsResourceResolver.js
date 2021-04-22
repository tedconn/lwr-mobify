import basePath from '@salesforce/community/basePath';

/**
 * Regular expressions for CMS resources and for static image resources.
 */
const cmsResourceUrlPattern = /^\/cms\//;
const staticImageResourcePattern = /^\/img\//; // Static app resources referenced by Commerce APIs (e.g. the "no image" image")
const staticCmsAssetPattern = /^\/assets\//; // Static (LWR-specific) app resources referenced by Commerce APIs
const PATH_PREFIX = '/sfsites/c';

/**
 * Resolves a Commerce API resource URL - that may (or may not) be managed by Salesforce CMS - to a canonical, routable URL.
 * @param {string} url
 *  A URL of a resource. This may - or may not - be a Salesforce-hosted CMS resource.
 *
 * @returns {string}
 *  If {@see url} represents a CMS-hosted resource, then a resolved CMS resource URL;
 *  otherwise, the unaltered {@see url}.
 */
export function resolve(url) {
    // If the URL is a CMS URL, transform it; otherwise, leave it alone.
    if (
        cmsResourceUrlPattern.test(url) ||
        staticImageResourcePattern.test(url)
    ) {
        url = `${basePath}${PATH_PREFIX}${url}`;
    } else if (staticCmsAssetPattern.test(url)) {
        url = `${basePath}${url}`;
    }
    return url;
}
