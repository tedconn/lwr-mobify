import { LightningElement, api, track } from 'lwc';
import { getProduct, proxyUrl } from "c/cexConfig"

export default class ProductDetail extends LightningElement {

  @api productId=undefined;
  @track product;
  loading = false;

  connectedCallback() {
    this.loadProduct(this.productId);
  }

  async loadProduct(productId) {
    this.product = {};
    console.log(`Product is=${productId}`)
    if(productId) {
      this.loading = true;
      try {
        const p = await getProduct(productId);
        this.product = {
          description: p.name,
          image: p.imageGroups[0].images[0].link,
          price: p.price||undefined,
          reducedPrice: p.price?p.price/1.1:undefined
        }
        console.log(JSON.stringify(this.product,null,"  "));
        //this.productAsString = JSON.stringify(this.product,null,"  ");
      } catch(e) {
        this.product = {
          description: "Deliver seamless experiences anytime, anywhere.",
          image: proxyUrl("www.salesforce.com:443/content/dam/web/global/icons/product/commerce-day.svg?version=202131"),
          price: undefined,
          reducedPrice: undefined
        }
        } finally {
        this.loading = false;
      }
    } else {
      this.product = {
        description: "Deliver seamless experiences anytime, anywhere.",
        image: proxyUrl("www.salesforce.com:443/content/dam/web/global/icons/product/commerce-day.svg?version=202131"),
        price: undefined,
        reducedPrice: undefined
      }
    }
  }
}