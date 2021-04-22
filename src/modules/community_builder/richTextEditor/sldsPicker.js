import lightningQuill from 'lightning/quillLib';

const { Quill } = lightningQuill;

const Picker = Quill.import('ui/picker');

class SldsPicker extends Picker {
    constructor(select) {
        super(select);

        // _ignoreLabelBlur is used to prevent picker close too early on blur before user is able to select a picker item
        this._ignoreLabelBlur = false;

        this.handleClosePickerOnBlur();
    }

    open() {
        this.container.classList.add('ql-expanded');
        this.label.setAttribute('aria-expanded', true);
        this.options.setAttribute('aria-hidden', false);
    }

    focusItem(idx) {
        const item = this.options.children[idx];
        // ignore blur to prevent picker close when an item is focused (lable is blurred)
        this._ignoreLabelBlur = true;
        item.focus();
    }

    // make sure picker can close on blur
    handleClosePickerOnBlur() {
        const container = this.container;

        // handle blur on label
        container.addEventListener('click', () => {
            // reset _ignoreLabelBlur
            this._ignoreLabelBlur = false;
        });
        this.options.addEventListener('mousedown', () => {
            // ignore blur as user is about to select an item
            this._ignoreLabelBlur = true;
        });
        this.label.addEventListener('blur', () => {
            if (
                !this._ignoreLabelBlur &&
                container.classList.contains('ql-expanded')
            ) {
                this.close();
            }
        });
    }
}

export default SldsPicker;
