import { LightningElement, api } from 'lwc';
import lightningQuill from 'lightning/quillLib';
import { toolbarConfig } from './toolbarConfig';
import SldsTheme from './sldsTheme';
import LinkFormat from './linkFormat';
import VideoEmbed from './videoEmbed';
import ImageResize from './imageResize';
import {
    linkButtonClickHandler,
    videoButtonClickHandler,
    imageButtonClickHandler
} from './toolbarHandlers';

import { sanitize } from 'community_builder/sanitizeUtil';
import { processContents } from 'community_builder/richTextUtil';

const { Quill, applyEmitterShadowDOMFix } = lightningQuill;

Quill.register('themes/slds', SldsTheme, true);
Quill.register(LinkFormat);
Quill.register(VideoEmbed);
Quill.register('modules/imageResize', ImageResize);

/**
 A Quill-based rich text editor with SLDS theme. It is for use within builder context only:

  - toolbar visible only when RTE is enabled
  - image/video/link picker pops up in builder (parent frame)
  - desktop only
  - not configurable or extendable
*/

export default class RichTextEditor extends LightningElement {
    quill;
    connection;
    isEditorMode = false;
    rawValue = '';
    isDataReady = false;

    /**
     * The HTML content in the rich text editor.
     * @type {string}
     *
     */
    @api
    get richTextValue() {
        return this.rawValue;
    }

    set richTextValue(val) {
        this.rawValue = val;
    }
    /**
      enter rich text interactive editor mode
    */
    @api
    enterEditorMode(connection) {
        this.connection = connection;
        this.isEditorMode = true;
    }

    /**
      exit rich text editor mode
    */
    @api
    exitEditorMode() {
        this.saveContents();
        this.cleanupQuill();
        this.isEditorMode = false;
    }

    /**
     * Data provider provides data that is used to resolve the data expressions
     * ex. {!Item.field}
     *
     * @param {Object} data - Object with field names as keys and field values as values
     */
    @api
    setDataExpressions(data) {
        this.template
            .querySelector('community_builder-output-rich-text')
            .setDataExpressions(data);
    }

    renderedCallback() {
        if (this.isEditorMode && !this.quill) {
            this.setupQuill();
        }
    }

    setupQuill() {
        const editorEl = this.template.querySelector('.editor');
        const toolbarEl = this.template.querySelector('.toolbar');

        this.initToolbar(toolbarEl);

        const quillConfig = {
            modules: {
                toolbar: toolbarEl,
                imageResize: { connection: this.connection }
            },
            theme: 'slds'
        };

        this.quill = new Quill(editorEl, quillConfig);
        // Monkeypatches binding of event emitter
        // As it doesn't work w/ shadow dom out of the box
        this.removeQuillEmitterEventListeners = applyEmitterShadowDOMFix(
            this.quill
        );

        this.addCustomHandlers();

        this.setContents();
    }

    initToolbar(toolbarEl) {
        const i18n = toolbarConfig.i18n;
        const btns = i18n.buttons;

        // eslint-disable-next-line @lwc/lwc/no-inner-html
        toolbarEl.innerHTML = `
            <span class="ql-formats"
                aria-label="${i18n.formatFont}"
            >
                <select class="ql-font"></select>
                <select class="ql-size"></select>
            </span>
            <ul class="ql-formats button-group"
                aria-label="${i18n.formatText}"
            >
                <li><button class="ql-bold" tabindex="0"></button></li>
                <li><button class="ql-italic" tabindex="-1"></button></li>
                <li><button class="ql-underline" tabindex="-1"></button></li>
                <li><button class="ql-strike" tabindex="-1"></button></li>
            </ul>
            <ul class="ql-formats"
                aria-label="${i18n.formatBackground}"
            >
                <select class="ql-color"></select>
                <select class="ql-background"></select>
            </ul>
            <ul class="ql-formats button-group"
                aria-label="${i18n.formatBody}"
            >
                <li><button class="ql-list" value="bullet" tabindex="0"></button></li>
                <li><button class="ql-list" value="ordered" tabindex="-1"></button></li>
                <li><button class="ql-indent" value="+1" tabindex="-1"></button></li>
                <li><button class="ql-indent" value="-1" tabindex="-1"></button></li>
            </ul>
            <ul class="ql-formats button-group"
                aria-label="${i18n.alignText}"
            >
                <li><button class="ql-align" value="" tabindex="0"></button></li>
                <li><button class="ql-align" value="center" tabindex="-1"></button></li>
                <li><button class="ql-align" value="right" tabindex="-1"></button></li>
            </ul>
            <ul class="ql-formats button-group"
                aria-label="${i18n.insertContent}"
            >
                <li><button class="ql-link" title="${btns.link}" tabindex="0"></button></li>
                <li><button class="ql-image" title="${btns.image}" tabindex="0"></button></li>
                <li><button class="ql-video" title="${btns.video}" tabindex="-1"></button></li>
            </ul >
            <ul class="ql-formats button-group"
                aria-label="${i18n.removeFormatting}"
            >
                <li><button class="ql-clean" title="${btns.clean}" tabindex="0"></button></li>
            </ul >
        `;
    }

    setContents() {
        this.rawValue = processContents(sanitize(this.rawValue));
        const delta = this.quill.clipboard.convert(this.rawValue);
        this.quill.setContents(delta, 'silent');
    }

    saveContents() {
        // eslint-disable-next-line @lwc/lwc/no-inner-html
        const editorContents = this.quill.scroll.domNode.innerHTML;
        this.rawValue = editorContents;
    }

    cleanupQuill() {
        this.removeQuillEmitterEventListeners();
        this.quill = null;
    }

    addCustomHandlers() {
        const toolbar = this.quill.getModule('toolbar');
        toolbar.addHandler('link', () => {
            linkButtonClickHandler(this.quill, this.connection);
        });
        toolbar.addHandler('video', () => {
            videoButtonClickHandler(this.quill, this.connection);
        });
        toolbar.addHandler('image', () => {
            imageButtonClickHandler(this.quill, this.connection);
        });
    }
}
