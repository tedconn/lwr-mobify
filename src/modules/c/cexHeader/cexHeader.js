import { LightningElement } from 'lwc';

import { getSessionContext } from 'commerce/contextApi';
import communityBasePath from '@salesforce/community/basePath';

export default class CommerceHeader extends LightningElement {

    isLoggedIn = false;
    userName = "";

    connectedCallback() {
        getSessionContext().then( (context) => {
            this.isLoggedIn = context.isLoggedIn;
            this.userName = context.userName;
        }).catch( (error) => {
            console.log(JSON.stringify(error))
        });
    }

    get homeLink() {
        return `${communityBasePath}/`;
    }
    get searchLink() {
        return `${communityBasePath}/search/`;
    }
}