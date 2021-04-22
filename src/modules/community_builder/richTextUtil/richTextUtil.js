import COMMUNITY_BASE_PATH from '@salesforce/community/basePath';

const CORE_PATH_PREFIX = '/sfsites/c';
const CONTENT_ASSET_REGEX = /\{!contentAsset\.(.+?)\.(.+?)\}/g;
const CMS_CONTENT_REGEX = /\{!cmsMedia\.(.+?)\}/g;

export function processContents(html) {
    let result = html;
    let tokens;
    while ((tokens = CMS_CONTENT_REGEX.exec(html)) !== null) {
        const [match, contentKey] = tokens;
        let url = getCMSContentUrl(contentKey);
        result = result.replace(match, url);
    }
    return processContentAssets(result);
}

export function processContentAssets(html) {
    let result = html;
    let tokens;
    while ((tokens = CONTENT_ASSET_REGEX.exec(html)) !== null) {
        const [match, assetName, version] = tokens;
        let url = getContentAssetUrl(assetName, version);
        result = result.replace(match, url);
    }
    return result;
}

export function getPathPrefix() {
    return COMMUNITY_BASE_PATH + CORE_PATH_PREFIX;
}

export function getCMSContentUrl(contentKey) {
    return `${getPathPrefix()}/cms/delivery/media/${contentKey}`;
}

function getContentAssetUrl(assetName, version) {
    return `${getPathPrefix()}/file-asset/${assetName}?v=${version}`;
}
