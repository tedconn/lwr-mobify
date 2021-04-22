import { keys } from 'community_runtime/keyboard';
import SldsPicker from './sldsPicker';

class ListPicker extends SldsPicker {
    constructor(select) {
        super(select);

        this.handleLabelKeydownNav();
    }

    // Override the parent method
    buildItem(option) {
        const item = document.createElement('span');
        item.tabIndex = '0';
        item.setAttribute('role', 'button');

        item.classList.add('ql-picker-item');
        item.setAttribute('data-value', option.getAttribute('value'));
        item.setAttribute('data-label', option.textContent);
        item.addEventListener('click', () => {
            this.selectItem(item, true);
        });

        this.handleItemKeydownNav(option, item);
        return item;
    }

    getSelectedItemIndex() {
        const selectedItem = this.options.querySelector('.ql-selected');
        const itemsArray = Array.from(this.options.children);
        return itemsArray.indexOf(selectedItem);
    }

    findNextItemByChar(key, startIdx) {
        const keyChar = key.toLowerCase();
        if (/[a-z0-9]/.test(keyChar)) {
            let idx = startIdx;
            const items = this.options.children;
            for (; idx < items.length; ++idx) {
                const label = items[idx].getAttribute('data-label');
                if (label[0].toLowerCase() === keyChar) {
                    return idx;
                }
            }
        }
        return -1;
    }

    /**
      Handle keyboard event on the picker's label (current selection)
        Tab: close the picker
        Down: move to the first item
        Up: move to the last item
        a-z0-9: move to the item that begins with this character
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
            } else {
                focusItemIdx = this.findNextItemByChar(
                    key,
                    this.getSelectedItemIndex()
                );
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
        a-z0-9: move to the item that begins with this character
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
            } else {
                const optionsArray = Array.from(this.select.options);
                const currentIdx = optionsArray.indexOf(option);
                let focusItemIdx = -1;
                if (key === keys.down || key === keys.up) {
                    // iterate menu items
                    const len = optionsArray.length;
                    const delta = key === keys.down ? 1 : -1;
                    focusItemIdx = (currentIdx + delta + len) % len;
                } else {
                    // find the next item that starts with the character
                    focusItemIdx = this.findNextItemByChar(key, currentIdx + 1);
                    if (focusItemIdx < 0) {
                        // now try search from the start
                        focusItemIdx = this.findNextItemByChar(key, 0);
                    }
                }
                if (focusItemIdx >= 0) {
                    this.focusItem(focusItemIdx);
                }
            }
        });
    }
}

export default ListPicker;
