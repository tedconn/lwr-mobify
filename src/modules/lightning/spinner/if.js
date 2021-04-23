import { LightningElement } from 'lwc';

export default class SpinnerIf extends LightningElement {
    loaded = false;

    handleClick() {
        this.loaded = !this.loaded;
    }
}
