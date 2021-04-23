import { LightningElement, track } from 'lwc';

import { cmsContent, proxyUrl } from "c/cexConfig"

export default class Home extends LightningElement {

    @track items = [];

    connectedCallback() {
        this.loadItems();
    }

    loadItems() {
        cmsContent().then( (cms) => {
            this.items = [];
            cms.items.forEach( (item) => {
                const it = {
                    id: item.managedContentId,
                    title: item.title,
                    image: proxyUrl(item.contentNodes?.SneakerImageMain?.url),
                    price: item.contentNodes?.SneakerPrice?.value,
                    description: item.contentNodes?.SneakerDetail?.value,
                }
                this.items.push(it);
            });
            //console.log(`ITEMS=${JSON.stringify(this.items,null,"  ")}`);
        }) 
    }
}