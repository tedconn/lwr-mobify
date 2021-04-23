import { LightningElement } from 'lwc';
import communityBasePath from '@salesforce/community/basePath';

export default class CommerceHeader extends LightningElement {

    isLoggedIn = false;
    userName = "";

    connectedCallback() {
        this.isLoggedIn = false;
        this.userName = null;
    }

    get homeLink() {
        return `${communityBasePath}/`;
    }
    get searchLink() {
        return `${communityBasePath}/search/`;
    }
}