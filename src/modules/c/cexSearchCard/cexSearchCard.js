import { LightningElement, api } from 'lwc';

import communityBasePath from '@salesforce/community/basePath';

export default class ProductCard extends LightningElement  {

  @api product;

  handleNavigate() {
    // Might have better methods in NavigateMixin!
    const url = `${communityBasePath}/product?id=${this.product.id}`;
    window.open(url, "_self");
  }
}