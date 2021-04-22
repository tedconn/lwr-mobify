import sanitizeHTML from 'lightning/purifyLib';
import { richTextConfig } from './richTextConfig';

export function sanitize(value) {
    let richText;

    try {
        richText = sanitizeHTML(value, richTextConfig);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(
            `<community_builder-santizeUtil> Exception caught when attempting to sanitize: `,
            e
        );
        const textNode = document.createTextNode(value);
        richText = textNode.textContent;
    }

    return richText;
}
