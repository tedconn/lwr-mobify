import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class Header extends LightningElement {

    active = null;

    @wire(CurrentPageReference) currentPageChange(data) {
        this.active = data.attributes.name;
        this.setActive(data.attributes.name);
    };

    renderedCallback() {
        this.setActive(this.active);
    }

    setActive(active) {
        this.template.querySelectorAll('x-header-link').forEach(el => {
            el.active = (el.route == active);
        })
    }
}