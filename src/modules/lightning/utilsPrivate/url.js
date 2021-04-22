const URL_CHECK_REGEX = /^(\/+|\.+|ftp|http(s?):\/\/)/i;

export function isAbsoluteUrl(url) {
    return URL_CHECK_REGEX.test(url);
}

export function makeAbsoluteUrl(url) {
    const protocol = window.location.protocol;
    return isAbsoluteUrl(url) ? url : `${protocol}//${url}`;
}
