import Quill from './quill';
import { createComponent } from 'aura';
// import labelImageSizeExceeded from '@salesforce/label/LightningRichTextEditor.imageSizeExceeded';
// import labelImageUploadFailed from '@salesforce/label/LightningRichTextEditor.imageUploadFailed';
import sanitizeHTML from 'lightning/purifyLib';
import { ArraySlice, isUndefinedOrNull } from 'lightning/utilsPrivate';

const QUILL_EMITTER_EVENT_LIST = [
    'selectionchange',
    'mousedown',
    'mouseup',
    'click',
];
const Delta = Quill.Delta;
const ALLOWED_FORMATS_FOR_API = [
    'align',
    'font',
    'size',
    'link',
    'bold',
    'italic',
    'strike',
    'header',
    'code',
    'code-block',
    'color',
    'underline',
    'background',
    'mention',
    /* the following formats are not enabled for 228,
       leaving them here to simplify enabling them
    'indent',
    'list',
    'direction',
    'script',*/
];

const ALLOWED_SIZES = [
    8,
    9,
    10,
    11,
    12,
    14,
    16,
    18,
    20,
    22,
    24,
    26,
    28,
    36,
    48,
    72,
];

const FONT_LIST = [
    {
        label: 'Salesforce Sans',
        value: 'default',
    },
    {
        label: 'Arial',
        class: 'sans-serif',
        value: 'sans-serif',
    },
    {
        label: 'Courier',
        class: 'courier',
        value: 'courier',
    },
    {
        label: 'Verdana',
        class: 'verdana',
        value: 'verdana',
    },
    {
        label: 'Tahoma',
        class: 'tahoma',
        value: 'tahoma',
    },
    {
        label: 'Garamond',
        class: 'garamond',
        value: 'garamond',
    },
    {
        label: 'Times New Roman',
        class: 'serif',
        value: 'serif',
    },
];

const ALLOWED_FONTS = FONT_LIST.map((item) => {
    return item.value;
});

const ALLOWED_TAGS = [
    'a',
    'abbr',
    'acronym',
    'address',
    'b',
    'br',
    'big',
    'blockquote',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'del',
    'div',
    'dl',
    'dd',
    'dt',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'ins',
    'kbd',
    'li',
    'ol',
    'p',
    'param',
    'pre',
    'q',
    's',
    'samp',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'tt',
    'u',
    'ul',
    'var',
    'strike',
    'font',
];

const ALLOWED_ATTRS = [
    'accept',
    'action',
    'align',
    'alt',
    'autocomplete',
    'background',
    'bgcolor',
    'border',
    'cellpadding',
    'cellspacing',
    'checked',
    'cite',
    'class',
    'clear',
    'color',
    'cols',
    'colspan',
    'coords',
    'datetime',
    'default',
    'dir',
    'disabled',
    'download',
    'enctype',
    'face',
    'for',
    'headers',
    'height',
    'hidden',
    'high',
    'href',
    'hreflang',
    'id',
    'ismap',
    'label',
    'lang',
    'list',
    'loop',
    'low',
    'max',
    'maxlength',
    'media',
    'method',
    'min',
    'multiple',
    'name',
    'noshade',
    'novalidate',
    'nowrap',
    'open',
    'optimum',
    'pattern',
    'placeholder',
    'poster',
    'preload',
    'pubdate',
    'radiogroup',
    'readonly',
    'rel',
    'required',
    'rev',
    'reversed',
    'rows',
    'rowspan',
    'spellcheck',
    'scope',
    'selected',
    'shape',
    'size',
    'span',
    'srclang',
    'start',
    'src',
    'step',
    'style',
    'summary',
    'tabindex',
    'target',
    'title',
    'type',
    'usemap',
    'valign',
    'value',
    'width',
    'xmlns',
    // for custom blots
    'data-fileid',
];

const IMAGE_MAX_SIZE = 1048576; // Max size of image: 1MB - 1048576 bytes

function _sanitize(val) {
    return sanitizeHTML(val, { ALLOWED_TAGS, ALLOWED_ATTRS });
}

function computeIndentLevel(node) {
    const indentMatch = node.className.match(/ql-indent-([0-9]+)/);
    if (indentMatch) {
        return parseInt(indentMatch[1], 10);
    }

    return 0;
}

// Patches quill emitter
// https://github.com/quilljs/quill/blob/5b28603337f3a7a2b651f94cffc9754b61eaeec7/core/emitter.js#L8
// To fix shadow dom issue
function applyEmitterShadowDOMFix(quillInstance) {
    const callbacks = {};
    QUILL_EMITTER_EVENT_LIST.forEach((eventName) => {
        function callback() {
            const args = ArraySlice.call(arguments, 0);
            if (quillInstance && quillInstance.emitter) {
                quillInstance.emitter.handleDOM(args[0]);
            }
        }
        document.addEventListener(eventName, callback);
        callbacks[eventName] = callback;
    });
    function removeEventListeners() {
        QUILL_EMITTER_EVENT_LIST.forEach((eventName) => {
            document.removeEventListener(eventName, callbacks[eventName]);
        });
    }
    return removeEventListeners;
}

/**
 * Turn a list with ql- classes into a nested list.
 * Recursive!
 *
 * @param  {Array} list         an array of list items
 * @param  {Number} indentLevel the current indent level
 * @param  {String} type        ol or ul
 * @return {HTMLElement}        A DOM element
 */
function nestList(list, indentLevel, type) {
    let level;
    let thisNode;
    let lastNode;
    const returnNode = document.createElement(type);
    while (list.length > 0) {
        if (thisNode) {
            lastNode = thisNode;
        }
        thisNode = list[0];
        level = computeIndentLevel(thisNode);

        // should be a sub-list. Recurse!
        if (lastNode && level > indentLevel) {
            lastNode.appendChild(nestList(list, level, type));
        } else if (level < indentLevel) {
            return returnNode;
        } else {
            thisNode.removeAttribute('class');
            returnNode.appendChild(list.shift());
        }
    }
    return returnNode;
}

/**
 * Recursivly flatten a nested list
 * an add quill classes
 *
 * No return, this will TRANSFORM the passed list
 * @param  {HTMLElement} list        This list node
 * @param  {Number} indentLevel The indentation level of the list passed
 */
function unnestList(list, indentLevel) {
    const children = Array.prototype.slice.call(list.childNodes);
    children.forEach((node) => {
        if (indentLevel > 0) {
            node.className = 'ql-indent-' + indentLevel;
        }

        Array.prototype.slice.call(node.childNodes).forEach((childNode) => {
            const regex = /ol|ul/i;
            if (regex.test(childNode.tagName)) {
                unnestList(childNode, indentLevel + 1);
            }
        });
    });
}

function cleanInput(html) {
    const frag = document.createElement('div');
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    frag.innerHTML = _sanitize(html);
    const lists = Array.prototype.slice.call(frag.querySelectorAll('ol,ul'));
    if (lists) {
        lists.forEach((list) => {
            unnestList(list, 0);
            const flatList = list.querySelectorAll('li');
            if (flatList.length > 0) {
                for (let i = 0; i < flatList.length; i += 1) {
                    list.appendChild(flatList[i]);
                }
            }
        });
    }
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    return frag.innerHTML;
}

function cleanOutput(html) {
    const frag = document.createElement('div');
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    frag.innerHTML = html;
    const lists = Array.prototype.slice.call(frag.querySelectorAll('ol,ul'));
    if (lists) {
        lists.forEach((list) => {
            const myList = nestList(
                Array.prototype.slice.call(list.querySelectorAll('li')),
                0,
                list.tagName
            );
            list.parentNode.replaceChild(myList, list);
        });
    }
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    return frag.innerHTML;
}

function insertEmbed(quillInstance, format, value, attributes) {
    const insert = {};
    const attrs = attributes || {};

    // this is important! if the editor
    // is not focused we can't insert.
    quillInstance.focus();
    const range = quillInstance.getSelection();

    // TODO: handle alt tags!
    insert[format] = value;
    const delta = new Delta();
    if (range) {
        delta.retain(range.index).delete(range.length);
    }
    delta.insert(insert, attrs);
    return quillInstance.updateContents(delta);
}

/**
 * 1. Attempt to upload the selected file
 *     a. If the file size exceeds 1MB, the file will not be uploaded
 *     b. If the upload encounters a problem, an error is thrown
 * 2. If the file is uploaded, insert the file/image into the editor
 * @param {Object} quillApi - Quill instance into which the image should be inserted
 * @param {Object} file - The file that needs to be uploaded
 * @param {Object} shareWithEntityId - Entity ID to share the image with
 */
function uploadAndInsertSelectedFile(quillApi, file, shareWithEntityId) {
    createComponent(
        'force:fileUpload',
        {
            shareWithEntityId,
            onUpload: (serverResponse) => {
                if (serverResponse.successful) {
                    this.insertEmbed(
                        quillApi,
                        'image',
                        serverResponse.response.downloadUrl,
                        { alt: file.name }
                    );
                }
            },
        },
        (uploadFileCmp, status) => {
            if (status === 'SUCCESS') {
                uploadFileCmp.uploadFile(file);
            }
        }
    );
}

function filterFormats(formats) {
    const ret = {};
    const keys = Object.keys(formats);
    keys.forEach((key) => {
        let value = formats[key];
        // remove formats not in the allowlist
        if (ALLOWED_FORMATS_FOR_API.indexOf(key) === -1) {
            return;
        }

        // check font values allowlist
        if (key === 'font' && ALLOWED_FONTS.indexOf(value) === -1) {
            return;
        }

        // cast size to int, check value, cast back to string later when we set it
        if (key === 'size') {
            const size = parseInt(value, 10);
            // fast short circuit non number values;
            if (isNaN(size)) {
                return;
            }
            if (ALLOWED_SIZES.indexOf(size) === -1) {
                return;
            }
            value = size;
        }
        ret[key] = value;
    });
    return ret;
}

function applyFormats(api, formats) {
    const filtered = filterFormats(formats);
    Object.keys(filtered).forEach((key) => {
        let value = formats[key];
        if (key === 'size') {
            value = `${value}px`;
        }
        api.format(key, value);
    });
}

/**
 * Replaces a range of text in lightning-input-rich-text with a new string
 *
 * If valid start AND end values are provided, update editor contents
 * and set selection based on 'selectMode' value
 * For start & end to be valid,
 *     1. start value should exist and should have a value of 0 or greater
 *     2. end value should exist and should have a value equal or greater than the start
 *
 * If BOTH start and end values are NOT provided,
 * update editor contents based on current user selection
 * and set selection based on 'selectMode' value
 *
 * Update editor contents using a Delta:
 *     1. Keep characters until the start index (retain)
 *     2. Delete characters between start and end indices (delete)
 *     3. Insert the specified text at that cursor position (insert)
 *
 * Throw a RangeError if provided start value is greater than the provided end value
 *
 * @param {Object} quill - Current quill instance
 * @param {String} replacement - The string to insert
 * @param {Number} start - The 0-based index of the first character to replace
 * @param {Number} end - The 0-based index of the character after the last character to replace.
 * @param {String} selectMode -  A string defining how the selection should be set after the text has been replaced
 */
function setRangeText(quill, replacement, start, end, selectMode) {
    // Don't do anything if an invalid select mode is provided
    if (
        !isUndefinedOrNull(selectMode) &&
        !/^start$|^end$|^select$|^preserve$/.test(selectMode)
    ) {
        return;
    }

    const textToInsert = String(replacement);
    const delta = new Delta();
    const selection = quill.getSelection(true) || {
        index: quill.getLength(),
        length: 0,
    };

    if (
        !isUndefinedOrNull(start) &&
        start > -1 &&
        !isUndefinedOrNull(end) &&
        end >= start
    ) {
        delta
            .retain(start)
            .delete(end - start)
            .insert(textToInsert);
        quill.updateContents(delta);

        // If cursor position is between start and end values
        // with select mode - 'preserve' (unspecified defaults to preserve),
        // highlight the inserted text
        if (
            selection.index > start &&
            selection.index <= end &&
            (selectMode === 'preserve' || isUndefinedOrNull(selectMode))
        ) {
            this.setSelectionFromSelectMode(
                quill,
                'select',
                start,
                textToInsert.length
            );
            return;
        }
        this.setSelectionFromSelectMode(
            quill,
            selectMode,
            start,
            textToInsert.length
        );
    } else if (isUndefinedOrNull(start) && isUndefinedOrNull(end)) {
        // If both start and end values are not provided,
        // update editor contents based on current user selection and
        // set selection based on specified selectMode
        delta
            .retain(selection.index)
            .delete(selection.length)
            .insert(textToInsert);
        quill.updateContents(delta);
        this.setSelectionFromSelectMode(
            quill,
            selectMode,
            selection.index,
            textToInsert.length
        );
    } else if (start > end) {
        throw new RangeError(
            `Failed to execute 'setRangeText' on 'inputRichText': The provided start value (${start}) is larger than the provided end value (${end}).`
        );
    }
}

/**
 * Sets the selection/cursor at the appropriate location
 * based on the specified select mode from setRangeText:
 *
 * Mode: 'select' -
 *     Sets selection or highlights text starting from the
 *     'startIndex' index until 'startIndex + selectionLength' index
 * Mode: 'start' -
 *     Sets the cursor at the start index
 * Mode: 'end' -
 *     Sets the cursor at the end index (startIndex + length)
 * Mode: 'preserve' or undefined -
 *     Quill's updateContents function automatically preserves
 *     the selection so no additional work to be done for that case
 *
 * @param {String} mode
 * @param {Number} startIndex
 * @param {Number} selectionLength
 */
function setSelectionFromSelectMode(quill, mode, startIndex, selectionLength) {
    if (mode === 'select') {
        quill.setSelection(startIndex, selectionLength);
    } else if (mode === 'start') {
        quill.setSelection(startIndex);
    } else if (mode === 'end') {
        quill.setSelection(startIndex + selectionLength);
    }
}

const inputRichTextLibrary = {
    Delta,
    filterFormats,
    applyFormats,
    setRangeText,
    setSelectionFromSelectMode,
    computeIndentLevel,
    nestList,
    unnestList,
    cleanInput,
    cleanOutput,
    insertEmbed,
    uploadAndInsertSelectedFile,
    ALLOWED_SIZES,
    FONT_LIST,
    ALLOWED_ATTRS,
    ALLOWED_TAGS,
    IMAGE_MAX_SIZE,
    labelImageSizeExceeded: "",
    labelImageUploadFailed: "",
};

export default { Quill, inputRichTextLibrary, applyEmitterShadowDOMFix };
