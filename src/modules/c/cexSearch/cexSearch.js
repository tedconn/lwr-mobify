import { LightningElement, track } from 'lwc';
import { productSearch } from "c/cexConfig"

export default class ProductSearch extends LightningElement {

  @track rows = [];
  loading = false;
  loaded = false;
  searchTerm = "";

  keyup(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.search();
    }
  }

  get emptySearch() {
    return this.rows.length===0;
  }

  get resultAsString() {
    return JSON.stringify(this.rows);
  }

  async search() {
    if(this.loading) {
      return;
    }

    this.rows = [];
    this.searchTerm = this.template.querySelector("input").value;
    if(this.searchTerm) {
      this.loading = true;
      try {
        const rs = await productSearch(this.searchTerm);
        if(rs.hits) {
          rs.hits.forEach( (h,index) => {
            if(index%4===0) {
              this.rows.push({id:index,items:[]});
            }
            const it = {
              id: h.productId,
              description: h.productName,
              image: h.image.link,
              price: h.price,
              reducedPrice: h.price?h.price/1.1:undefined
            }
            this.rows[this.rows.length-1].items.push(it);
          });
        }
      } finally {
        this.loading = false;
        this.loaded = true;
      }
      //console.log(JSON.stringify(p,null,"  "));
    }
  }

}