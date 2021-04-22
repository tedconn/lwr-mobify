import lightningQuill from 'lightning/quillLib';

const { Quill } = lightningQuill;

const Link = Quill.import('formats/link');

/*
  A link format that supports custom target value
 */
class CustomLinkFormat extends Link {
    static create(value) {
        const { href, target } = value;
        const node = super.create(href);
        node.setAttribute('target', target);
        return node;
    }

    static formats(domNode) {
        return {
            href: domNode.getAttribute('href'),
            target: domNode.getAttribute('target')
        };
    }

    format(name, value) {
        if (name !== this.statics.blotName || !value) {
            super.format(name, value);
        } else {
            const { href, target } = value;
            this.domNode.setAttribute('href', this.constructor.sanitize(href));
            this.domNode.setAttribute('target', target);
        }
    }
}

export default CustomLinkFormat;
