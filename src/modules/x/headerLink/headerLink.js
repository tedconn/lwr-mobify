import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HeaderLink extends NavigationMixin(LightningElement) {
    @api route;
    @api active = false;
    
    navigate() {
        this[NavigationMixin.Navigate]({
            id: this.route
        });
    }

    get cssClass() {
        return this.active ? 'nav-link active' : 'nav-link';
    }
}