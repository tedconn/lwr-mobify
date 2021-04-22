import lightningQuill from 'lightning/quillLib';
import { toolbarConfig } from './toolbarConfig';
import icons from './toolbarIcons';
import { keys } from 'community_runtime/keyboard';
import ListPicker from './listPicker';
import ColorPicker from './colorPicker';
import { getIsButtonActive } from './toolbarUtil';

const { Quill } = lightningQuill;

const Theme = Quill.import('core/theme');
const Picker = Quill.import('ui/picker');

const QUILL_ACTIVE = 'ql-active';
const QUILL_FORMAT_PREFIX = 'ql-';

class SldsTheme extends Theme {
    // eslint-disable-next-line no-useless-constructor
    constructor(quill, options) {
        super(quill, options);
    }

    addModule(name) {
        const module = super.addModule(name);
        if (name === 'toolbar') {
            this.extendToolbar(module);
        }
        return module;
    }

    extendToolbar(toolbar) {
        const container = toolbar.container;

        this.buildButtons(getElementsArray(container, '.ql-formats button'));
        this.buildPickers(getElementsArray(container, '.ql-formats select'));

        this.setupToolbarNavigation(container);
        this.setupQuillEvents();
    }

    setupToolbarNavigation(container) {
        container.querySelectorAll('.ql-formats').forEach((group) => {
            const isButtonGroup = group.querySelectorAll('button').length > 1;
            if (isButtonGroup) {
                group.addEventListener('keydown', (evt) => {
                    navigateToolbarButton(group, evt);
                });
            }
        });
    }

    buildButtons(buttons) {
        const labels = toolbarConfig.i18n.buttons;
        this.buttons = buttons.map((button) => {
            const format = getFormat(button.classList);
            let icon = icons[format];
            let label = labels[format];
            const value = button.value || '';
            if (typeof icon !== 'string') {
                icon = icons[format][value];
                label = labels[format][value];
            }
            // eslint-disable-next-line @lwc/lwc/no-inner-html
            button.innerHTML = icon;
            button.setAttribute('title', label);
            button.setAttribute('aria-pressed', false);

            button.addEventListener('click', () => {
                const isActive = button.classList.contains(QUILL_ACTIVE);
                button.setAttribute('aria-pressed', isActive);
            });

            return button;
        });
    }

    buildPickers(selects) {
        const fontMenus = toolbarConfig.fontMenus;
        this.pickers = selects.map((select) => {
            const classList = select.classList;
            if (classList.contains('ql-font')) {
                fillSelect(
                    select,
                    fontMenus.fontList,
                    fontMenus.defaultFontNameValue
                );
                return new ListPicker(select);
            } else if (classList.contains('ql-size')) {
                fillSelect(
                    select,
                    fontMenus.sizeList,
                    fontMenus.defaultFontSizeValue
                );
                return new ListPicker(select);
            } else if (classList.contains('ql-background')) {
                fillSelect(select, toolbarConfig.colors, '#ffffff');
                return new ColorPicker(select, icons.background + icons.down);
            } else if (classList.contains('ql-color')) {
                fillSelect(select, toolbarConfig.colors, '#000000');
                return new ColorPicker(select, icons.color + icons.down);
            }
            return new Picker(select);
        });
    }

    setupQuillEvents() {
        this.quill.on(Quill.events.EDITOR_CHANGE, () => {
            this.pickers.forEach((picker) => {
                picker.update();
            });
        });

        /*
          _savedRangeOnbBlur is for fixing a quill bug which can be seen here: https://quilljs.com/playground/
          Repro:
            (1) set some text selection to bold by click "B" (notice B is highlighted)
            (2) click font size dropdown - notice B is no longer highlighted

          The issue: quill clears the user selection when user clicks outside the editor
          The fix: saves the current user selection range on blur and use it later on selection 
            change  which happens immediately on blur
        */
        this.quill.on(Quill.events.SELECTION_CHANGE, (range) => {
            let actualRange = range;
            if (!range) {
                actualRange = this._savedRangeOnBlur;
                this._savedRangeOnBlur = null;
            }
            if (actualRange) {
                this.handleSelectionChange(actualRange);
            }
        });

        this.quill.root.addEventListener('blur', () => {
            this._savedRangeOnBlur = this.quill.selection.getRange()[0];
        });
    }

    handleSelectionChange(range) {
        const formatLookup = this.quill.getFormat(range);

        this.pickers.forEach(function (picker) {
            const format = getFormat(picker.select.classList);
            const formatVal = formatLookup[format];
            if (formatVal && typeof formatVal !== 'string') {
                // clear label when multiple values match text selection
                // eg when the selection contains both 'arial' and 'serif' fonts
                // formatLookup would be { font: ['arial', 'serif'], ... }
                picker.container
                    .querySelector('.ql-picker-label')
                    .setAttribute('data-label', '');
            }
        });

        this.buttons.forEach((button) => {
            const format = getFormat(button.classList);
            const value = button.getAttribute('value');
            const isActive = getIsButtonActive(value, formatLookup, format);
            button.classList.toggle(QUILL_ACTIVE, isActive);
            button.setAttribute('aria-pressed', isActive);
        });
    }
}

function fillSelect(select, values, defaultValue) {
    values.forEach(function (val) {
        const option = document.createElement('option');
        const value = val.value;
        const label = val.label;
        option.textContent = label;
        if (value === defaultValue) {
            option.setAttribute('selected', 'selected');
        } else {
            option.setAttribute('value', value);
        }
        select.appendChild(option);
    });
}

function navigateToolbarButton(buttonGroup, evt) {
    let increment = 0;
    if (evt.key === keys.right) {
        increment = 1;
    }
    if (evt.key === keys.left) {
        increment = -1;
    }
    if (increment !== 0) {
        const currentButton = evt.target;
        const buttonList = Array.from(buttonGroup.querySelectorAll('button'));
        const currentIndex = buttonList.indexOf(currentButton);

        // cycle through to the next button
        const newIndex =
            (currentIndex + increment + buttonList.length) % buttonList.length;
        buttonList[newIndex].focus();

        // roving tabindex so the same button is focused when user tabs away and back,
        // see https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets
        buttonList.forEach((button) => {
            button.setAttribute('tabindex', -1);
        });
        buttonList[newIndex].setAttribute('tabindex', 0);
    }
}

function getElementsArray(container, cssQuery) {
    return Array.from(container.querySelectorAll(cssQuery));
}

function getFormat(classList) {
    const qlFormat = Array.from(classList).find((className) =>
        className.startsWith(QUILL_FORMAT_PREFIX)
    );
    return qlFormat && qlFormat.slice(QUILL_FORMAT_PREFIX.length);
}

export default SldsTheme;
