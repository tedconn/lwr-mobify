import lightningQuill from 'lightning/quillLib';
import VideoElementTitle from '@salesforce/label/CommBuilderRichTextEditor.VideoElementTitle';

const { Quill } = lightningQuill;

const VideoEmbed = Quill.import('blots/block/embed');

/*
  A Custom Video Embed to include class names and iframe
  Based on Aura custom blot implementation
 */
class CustomVideoEmbed extends VideoEmbed {
    static create(value) {
        const node = super.create();
        const newNode = document.createElement('iframe');
        newNode.classList.add('ql-video');
        newNode.setAttribute('allowfullscreen', 'true');
        newNode.setAttribute('width', '100%');
        newNode.setAttribute('title', VideoElementTitle.replace('{0}', value));
        newNode.setAttribute('src', value);
        node.appendChild(newNode);
        return node;
    }

    static value(domNode) {
        let src = '';
        if (
            domNode &&
            domNode.querySelector('iframe') &&
            domNode.querySelector('iframe').src
        ) {
            src = domNode.querySelector('iframe').src;
        }
        return src;
    }
}
CustomVideoEmbed.blotName = 'cbVideo';
CustomVideoEmbed.tagName = 'div';
CustomVideoEmbed.className = 'cb-video-container';
export default CustomVideoEmbed;
