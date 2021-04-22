/**
 * This comment is important, if it doesn't exist the slot will not be accessible in the ModuleDef,
 * see https://gus.lightning.force.com/lightning/r/0D5B000000moNnZ/view
 * @slot column a place for content within a column slot
 */
import { LightningElement, api } from 'lwc';

const FULL_WIDTH_MED = 'col-max-medium-size_12-of-12';
const FULL_WIDTH = 'col-size_12-of-12';

export default class Column extends LightningElement {
    _columnWidth = 12;

    /**
     * (Integer) Width (out of 12) used to create the appropriate column-grid class
     */
    @api
    get columnWidth() {
        return this._columnWidth;
    }

    set columnWidth(newWidth) {
        this._columnWidth = newWidth;
        this.updateHostCssClasses();
    }

    connectedCallback() {
        this.updateHostCssClasses();
    }

    /**
     * Set the host class list to use column classes
     *
     * Required to set on the template.host level so that it has a width relative to its container (community_layout-section)
     */
    updateHostCssClasses() {
        const updatedClassList = [
            FULL_WIDTH,
            FULL_WIDTH_MED,
            this.colWidthClass
        ];

        // clean-up previous classes, cannot use multiple args due to lack of IE11 support
        let i, clazz;
        for (i = 0; i < this.classList.length; i++) {
            clazz = this.classList[i];
            this.classList.remove(clazz);
        }

        // add back default classes and class for colWidth
        for (i = 0; i < updatedClassList.length; i++) {
            clazz = updatedClassList[i];
            this.classList.add(clazz);
        }
    }

    get colWidthClass() {
        return this.columnWidth
            ? `col-large-size_${this.columnWidth}-of-12`
            : 'col';
    }
}
