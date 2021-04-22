const ALLOWED_DOMAINS = new Set([
    'www.youtube.com',
    'www.youtube-nocookie.com',
    'www.youtube.ca',
    'www.youtube.jp',
    'www.youtube.com.br',
    'www.youtube.co.uk',
    'www.youtube.nl',
    'www.youtube.pl',
    'www.youtube.es',
    'www.youtube.ie',
    'www.youtube.fr',
    'player.vimeo.com',
    'play.vidyard.com',
    'players.brightcove.net',
    'bcove.video',
    'player.cloudinary.com',
    'fast.wistia.net',
    'i1.adis.ws',
    's1.adis.ws',
    'scormanywhere.secure.force.com',
    'appiniummastertrial.secure.force.com',
]);

export function hasOnlyAllowedVideoIframes(htmlString) {
    if (htmlString && htmlString.indexOf('<iframe') > -1) {
        const parsedHtml = new DOMParser().parseFromString(
            htmlString,
            'text/html'
        );
        const iframesList = Array.prototype.slice.call(
            parsedHtml.querySelectorAll('iframe')
        );

        return (
            iframesList.length > 0 &&
            !iframesList.some((iframe) => !isUrlAllowed(iframe.src))
        );
    }
    return false;
}

function isUrlAllowed(url) {
    const anchor = document.createElement('a');
    anchor.href = url;

    return anchor.protocol === 'https:' && ALLOWED_DOMAINS.has(anchor.hostname);
}
