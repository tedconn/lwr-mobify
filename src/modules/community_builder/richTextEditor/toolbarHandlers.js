import {
    sendMessage,
    handleMessageOnce,
    getEnclosingLinkNode,
    expandSelectionToNode,
    insertEmbed
} from './toolbarUtil';
//import CommunityId from '@salesforce/community/Id';
import {
    getPathPrefix,
    getCMSContentUrl
} from 'community_builder/richTextUtil';

/**
 * Custom handler for onclick of link insertion button
 * 1. Get the text selected by user to insert a link on
 * 2. Get the formatting already present on the selected text
 * 3. If selected text already has a link format on it:
 *     a. Open link panel with href value populated in input
 * 4. If selected text does not have a link format on it:
 *     a. If length of selected text is 0
 *     i. Open link panel and insert the link as text
 *     b. If length of selected text is > 0
 *     i. Open link panel and convert the selected text to a link
 */
export function linkButtonClickHandler(quillApi, connection) {
    const selection = quillApi.getSelection();
    const format = quillApi.getFormat();
    const skipInsertIndex = -1;
    quillApi.focus();

    if (format.link) {
        const { href, target } = format.link;
        const nodeOnCursor = quillApi.getLeaf(
            selection.index + selection.length
        )[0].domNode;
        const linkNode = getEnclosingLinkNode(quillApi, nodeOnCursor);
        expandSelectionToNode(quillApi, linkNode);
        openLinkPanel(quillApi, connection, href, target, skipInsertIndex);
    } else {
        const shouldInsertText = selection.length === 0;
        openLinkPanel(
            quillApi,
            connection,
            '',
            '_blank',
            shouldInsertText ? selection.index : skipInsertIndex
        );
    }
}

/**
 * Custom handler for onclick of image insertion button
 * 1. On click, send a message to builder to open CMS Content Selector
 * 2. On successCallback, insert the image into the editor
 *   i. If some text is already selected, replace it with image
 *   ii. If no text is selected, insert the image at cursor position
 */
export function imageButtonClickHandler(quillApi, connection, selectionRange) {
    let onSuccessCallback = (data) => {
        if (data) {
            insertEmbed(
                quillApi,
                'image',
                data.isExternalUrl
                    ? getCMSContentUrl(data.contentKey)
                    : getPathPrefix() + data.imageUrl,
                {},
                selectionRange
            );
        }
        // Focus back to quill editor when user closes CMS Content Selector
        quillApi.focus();
    };

    handleMessageOnce(
        connection,
        'exit-rte-cms-content-selector',
        onSuccessCallback
    );

    sendMessage(connection, 'enter-rte-cms-content-selector', {
        deliveryTargetId: "CommunityId"
    });
}

function openLinkPanel(
    quillApi,
    connection,
    href,
    currTarget,
    insertLinkIndex
) {
    handleMessageOnce(connection, 'exit-rte-link-picker', function (data) {
        if (data) {
            const { url, target, shouldRemoveLink } = data;
            if (shouldRemoveLink) {
                quillApi.format('link', false);
            } else {
                if (insertLinkIndex >= 0) {
                    quillApi.insertText(insertLinkIndex, url);
                    quillApi.setSelection(insertLinkIndex, url.length);
                }
                quillApi.format('link', {
                    href: url,
                    target: target
                });
            }
        }
        // do nothing when user cancels link input
    });

    sendMessage(connection, 'enter-rte-link-picker', {
        url: href,
        target: currTarget
    });
}

export function videoButtonClickHandler(quillApi, connection) {
    quillApi.focus();
    openVideoPanel(quillApi, connection);
}

function openVideoPanel(quillApi, connection) {
    handleMessageOnce(connection, 'exit-rte-video-picker', function (data) {
        if (data) {
            const { videoUrl } = data;
            const selection = quillApi.getSelection();
            if (selection) {
                quillApi.deleteText(selection.index, selection.length);
                quillApi.insertEmbed(selection.index, 'cbVideo', videoUrl);
            } else {
                quillApi.insertEmbed(0, 'cbVideo', videoUrl);
            }
        }
        // do nothing when user cancels video input
    });

    sendMessage(connection, 'enter-rte-video-picker', {
        videoUrl: ''
    });
}
