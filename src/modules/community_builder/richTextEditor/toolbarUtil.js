import lightningQuill from 'lightning/quillLib';

const { Quill } = lightningQuill;

/**
  Returns whether the button should be in active state

  A button should be active (pressed) when the current text selected by user 
  (either block highlight or cursor position) contains format that matches
  the toolbar elements. 
  eg: 
  the 'Bold' button should be active when the selected text is formatted as bold
*/
export function getIsButtonActive(buttonValue, formatLookup, format) {
    let isActive = false;
    if (buttonValue === null) {
        // for buttons w/o value:
        // it should be active per format value
        // eg formatLookup={bold: true}, format='bold'
        isActive = !!formatLookup[format];
    } else if (format === 'align' && buttonValue === '') {
        // for left align button:
        // since its value is '' (falsy) it should be active when formatLookup
        // does not contain any truthy value ("center", "right")
        isActive = !formatLookup[format];
    } else {
        // for buttons with value:
        // it should be active when the format value contains button value
        // eg formatLookup={list: 'bullet'}, format='list'
        isActive = formatLookup[format] === buttonValue;
    }
    return isActive;
}

export function sendMessage(conn, eventName, data) {
    conn.sendPostmessage(window.parent, eventName, data);
}

export function handleMessageOnce(conn, eventName, callback) {
    function handler(event) {
        conn.unregisterPostmessageHandler(window.parent, eventName, handler);
        callback(event);
    }

    conn.registerPostmessageHandler(window.parent, eventName, handler);
}

/**
 * Get the enclosing link node.
 * Search upward through parentNode.
 *
 * @param {Object} node - node of which to find enclosing node
 * @returns {Object} returns the enclosing link node
 */
export function getEnclosingLinkNode(quillApi, node) {
    const endNode = quillApi.scroll.domNode;
    let currentNode = node;
    while (currentNode && currentNode !== endNode) {
        if (currentNode.tagName === 'A') {
            return currentNode;
        }
        currentNode = currentNode.parentNode;
    }
    return null;
}

/**
 * Expand selection to the whole node
 * when selection only covers the node partially
 *
 * @param {Object} node - node of which to expand selection
 */
export function expandSelectionToNode(quillApi, node) {
    try {
        let selectionRange = getSelectionRangeForNode(quillApi, node);
        if (selectionRange) {
            quillApi.focus();
            quillApi.setSelection(selectionRange.index, selectionRange.length);
        }
    } catch (e) {
        // do nothing when this fails as it does not affect functionality
    }
}

export function getSelectionRangeForNode(quillApi, node) {
    if (!node && !quillApi) {
        return null;
    }
    const blot = quillApi.constructor.find(node);
    if (blot) {
        return {
            index: quillApi.getIndex(blot),
            length: blot.length()
        };
    }
    return null;
}

export function insertEmbed(
    quillInstance,
    format,
    value,
    attributes,
    selectionRange
) {
    let delta;
    let range;
    const insertContent = {};
    const attrs = attributes || {};

    // this is important! if the editor
    // is not focused we can't insert.
    quillInstance.focus();
    range = selectionRange || quillInstance.getSelection();

    insertContent[format] = value;
    delta = new Quill.Delta().retain(range.index).delete(range.length);
    delta.insert(insertContent, attrs);

    return quillInstance.updateContents(delta);
}
