import labelFormatText from '@salesforce/label/LightningRichTextEditor.formatText';
import labelFormatBody from '@salesforce/label/LightningRichTextEditor.formatBody';
import labelAlignText from '@salesforce/label/LightningRichTextEditor.alignText';
import labelFormatBackground from '@salesforce/label/LightningRichTextEditor.formatBackground';
import labelRemoveFormatting from '@salesforce/label/LightningRichTextEditor.removeFormatting';

import labelBold from '@salesforce/label/LightningRichTextButton.bold';
import labelItalic from '@salesforce/label/LightningRichTextButton.italic';
import labelStrike from '@salesforce/label/LightningRichTextButton.strike';
import labelUnderline from '@salesforce/label/LightningRichTextButton.underline';

import labelBullet from '@salesforce/label/LightningRichTextButton.bullet';
import labelNumber from '@salesforce/label/LightningRichTextButton.number';
import labelIndent from '@salesforce/label/LightningRichTextButton.indent';
import labelOutdent from '@salesforce/label/LightningRichTextButton.outdent';

import labelCenterAlign from '@salesforce/label/LightningRichTextButton.centerAlign';
import labelLeftAlign from '@salesforce/label/LightningRichTextButton.leftAlign';
import labelRightAlign from '@salesforce/label/LightningRichTextButton.rightAlign';

import labelFont from '@salesforce/label/LightningRichTextEditor.font';
import labelFontSize from '@salesforce/label/LightningRichTextEditor.fontSize';
import labelFormatFont from '@salesforce/label/LightningRichTextEditor.formatFont';
import labelDefaultFontName from '@salesforce/label/RichText.editorToolbarDefaultFont';
import labelDefaultFontSize from '@salesforce/label/RichText.editorToolbarDefaultSize';
import labelDefaultOptionTooltip from '@salesforce/label/RichText.editorToolbarDefaultOptionTooltip';

import labelInsertContent from '@salesforce/label/LightningRichTextEditor.insertContent';
import labelImage from '@salesforce/label/LightningRichTextButton.image';
import labelLink from '@salesforce/label/LightningRichTextButton.link';

import labelVideo from '@salesforce/label/LightningRichTextButton.video';

const DEFAULT_FONT_NAME_VALUE = '';
const DEFAULT_FONT_SIZE_VALUE = '';

/**
 Community uses 'branding set' to set the default global styles, hence the need for a default value for both font and size, which actually clears any specific value set by the editor
 */
const FONT_LIST = [
    {
        label: labelDefaultFontName,
        value: DEFAULT_FONT_NAME_VALUE
    },
    {
        label: 'Arial',
        value: 'arial'
    },
    {
        label: 'Georgia',
        value: 'georgia'
    },
    {
        label: 'Helvetica',
        value: 'helvetica'
    },
    {
        label: 'Sans Serif',
        value: 'sans-serif'
    },
    {
        label: 'Courier',
        value: 'courier'
    },
    {
        label: 'Monospace',
        value: 'monospace'
    },
    {
        label: 'Serif',
        value: 'serif'
    },
    {
        label: 'Garamond',
        value: 'garamond'
    },
    {
        label: 'Tahoma',
        value: 'tahoma'
    },
    {
        label: 'Verdana',
        value: 'verdana'
    }
];

const SIZE_LIST = [
    {
        label: labelDefaultFontSize,
        value: DEFAULT_FONT_SIZE_VALUE
    },
    {
        label: '8',
        value: '8px'
    },
    {
        label: '9',
        value: '9px'
    },
    {
        label: '10',
        value: '10px'
    },
    {
        label: '11',
        value: '11px'
    },
    {
        label: '12',
        value: '12px'
    },
    {
        label: '14',
        value: '14px'
    },
    {
        label: '16',
        value: '16px'
    },
    {
        label: '18',
        value: '18px'
    },
    {
        label: '20',
        value: '20px'
    },
    {
        label: '22',
        value: '22px'
    },
    {
        label: '24',
        value: '24px'
    },
    {
        label: '26',
        value: '26px'
    },
    {
        label: '28',
        value: '28px'
    },
    {
        label: '36',
        value: '36px'
    },
    {
        label: '48',
        value: '48px'
    },
    {
        label: '72',
        value: '72px'
    }
];
/*
 * the button names need to match the corresponding quill formats
 */
const buttons = Object.freeze({
    bold: labelBold,
    italic: labelItalic,
    underline: labelUnderline,
    strike: labelStrike,
    list: {
        ordered: labelNumber,
        bullet: labelBullet
    },
    indent: {
        '+1': labelIndent,
        '-1': labelOutdent
    },
    align: {
        '': labelLeftAlign,
        center: labelCenterAlign,
        right: labelRightAlign
    },
    link: labelLink,
    video: labelVideo,
    image: labelImage,
    clean: labelRemoveFormatting
});

const i18n = Object.freeze({
    font: labelFont,
    fontSize: labelFontSize,
    defaultOptionTooltip: labelDefaultOptionTooltip,
    formatFont: labelFormatFont,
    formatText: labelFormatText,
    formatBody: labelFormatBody,
    alignText: labelAlignText,
    formatBackground: labelFormatBackground,
    insertContent: labelInsertContent,
    removeFormatting: labelRemoveFormatting,
    buttons
});

const fontMenus = Object.freeze({
    fontList: FONT_LIST,
    sizeList: SIZE_LIST,
    defaultFontNameValue: DEFAULT_FONT_NAME_VALUE,
    defaultFontSizeValue: DEFAULT_FONT_SIZE_VALUE
});

const colors = Object.freeze([
    { label: '', value: '#000000' },
    { label: '', value: '#e60000' },
    { label: '', value: '#ff9900' },
    { label: '', value: '#ffff00' },
    { label: '', value: '#008a00' },
    { label: '', value: '#0066cc' },
    { label: '', value: '#9933ff' },
    { label: '', value: '#ffffff' },
    { label: '', value: '#facccc' },
    { label: '', value: '#ffebcc' },
    { label: '', value: '#ffffcc' },
    { label: '', value: '#cce8cc' },
    { label: '', value: '#cce0f5' },
    { label: '', value: '#ebd6ff' },
    { label: '', value: '#bbbbbb' },
    { label: '', value: '#f06666' },
    { label: '', value: '#ffc266' },
    { label: '', value: '#ffff66' },
    { label: '', value: '#66b966' },
    { label: '', value: '#66a3e0' },
    { label: '', value: '#c285ff' },
    { label: '', value: '#888888' },
    { label: '', value: '#a10000' },
    { label: '', value: '#b26b00' },
    { label: '', value: '#b2b200' },
    { label: '', value: '#006100' },
    { label: '', value: '#0047b2' },
    { label: '', value: '#6b24b2' },
    { label: '', value: '#444444' },
    { label: '', value: '#5c0000' },
    { label: '', value: '#663d00' },
    { label: '', value: '#666600' },
    { label: '', value: '#003700' },
    { label: '', value: '#002966' },
    { label: '', value: '#3d1466' }
]);

export const toolbarConfig = Object.freeze({
    fontMenus,
    colors,
    i18n
});
