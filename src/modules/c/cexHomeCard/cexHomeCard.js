import { LightningElement, api } from 'lwc';

export default class HomeCard extends LightningElement  {

  @api item;

  connectedCallback() {
  }

  renderedCallback() {
    const el = this.template.querySelector(".richtext-1");
    if(el) {
        const html = unescapeHTML((this.item && this.item.description) || "");
        el.innerHTML = html;
    }
  }
}

function unescapeHTML(escapedHTML) {
  return escapedHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
}