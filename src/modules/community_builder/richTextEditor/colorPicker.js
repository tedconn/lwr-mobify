import { keys } from 'community_runtime/keyboard';
import SldsPicker from './sldsPicker';

const PRIMARY_COLOR_SIZE = 7; // the first few are considered primary colors

class ColorPicker extends SldsPicker {
    constructor(select, label) {
        super(select);
        // eslint-disable-next-line @lwc/lwc/no-inner-html
        this.label.innerHTML = label;
        this.container.classList.add('ql-color-picker');
        [].slice
            .call(
                this.container.querySelectorAll('.ql-picker-item'),
                0,
                PRIMARY_COLOR_SIZE
            )
            .forEach(function (item) {
                item.classList.add('ql-primary');
            });

        this.handleLabelKeydownNav();
    }

    // Override the parent method
    buildItem(option) {
        let item = super.buildItem(option);
        const bgColor = option.getAttribute('value');
        item.setAttribute('style', 'background-color:' + bgColor);
        this.handleItemKeydownNav(option, item);
        return item;
    }

    // Override the parent method
    selectItem(item, trigger) {
        super.selectItem(item, trigger);
        const icon = this.label.querySelector('.icon');
        if (icon && item) {
            const fillColor = item.getAttribute('data-value');
            icon.setAttribute('style', 'fill:' + fillColor);
        }
    }

    /**
      Handle keyboard event on the picker's label (icon container)
        Tab: close the picker
        Down: move to the first item
        Up: move to the last item
    */
    handleLabelKeydownNav() {
        this.label.addEventListener('keydown', (evt) => {
            const key = evt.key;
            let focusItemIdx = -1;
            // ENTER and ESCAPE are handled in the parent
            if (key === keys.tab) {
                this.close();
            } else if (key === keys.down) {
                focusItemIdx = 0;
            } else if (key === keys.up) {
                focusItemIdx = this.select.options.length - 1;
            }
            if (focusItemIdx >= 0) {
                this.open();
                this.focusItem(focusItemIdx);
            }
        });
    }

    /**
      Handle keyboard event on dropdown item
        Enter: select the item
        Tab: close the picker
        Escape: close the picker and move focus to the label
        Down: move to the next item
        Up: move to the previous item
    */
    handleItemKeydownNav(option, item) {
        item.addEventListener('keydown', (evt) => {
            const key = evt.key;
            if (key === keys.enter) {
                this.selectItem(item, true);
                // prevents ENTER to occur on the editor area which creates a blank newline
                evt.preventDefault();
            } else if (key === keys.tab) {
                this.close();
            } else if (key === keys.escape) {
                this.close();
                this.label.focus();
            } else if (key === keys.down || key === keys.up) {
                const optionsArray = Array.from(this.select.options);
                const currentIdx = optionsArray.indexOf(option);
                // iterate menu items
                const len = optionsArray.length;
                const delta = key === keys.down ? 1 : -1;
                const focusItemIdx = (currentIdx + delta + len) % len;
                this.focusItem(focusItemIdx);
            }
        });
    }
}

export default ColorPicker;
