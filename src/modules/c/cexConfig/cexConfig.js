// https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/
// https://github.com/SalesforceCommerceCloud/commerce-sdk-isomorphic
// import capi from "c/pocSdk"
import { Spike4 } from "./sdk";

//https://spike-4.herokuapp.com/api-doc/#/default/getB2CShopperToken

const TRACE = false;
const PROXY = "https://priand-proxy.herokuapp.com/";

export function proxyUrl(url) {
  return url ? PROXY+url : url;
}

class Accessor {
  _config;
  async createClient() {
    if(!this._config) {
      this._config = await this.createConfig()
    }
    return new Spike4(this._config);
  }

  async getProduct(id) {
    const client = await this.createClient();
    return client.getProduct({
      parameters: {
         id
      } 
    })
    .catch( (err) => {
      console.log("ERROR!") 
      console.log(err) 
    });
  }

  async productSearch(searchTerm) {
    const client = await this.createClient();
    return client.productSearch({
      body: {
        searchTerm
      }
    }).catch( (err) => {
      console.log("ERROR!") 
      console.log(err) 
    });
  }
}

class B2CAccessor extends Accessor {
  async createConfig() {
    const token = await this.readToken();
    return {
      parameters: {
        clientId: "419998a0-1ec6-4598-8d88-ef28093e7453",
        organizationId: "f_ecom_bdqd_s12",
        shortCode: "0dnz6oep",
        siteId: "RefArch"
      },
      headers: {
        authorization: token,
      },
      proxy: PROXY+"spike-4.herokuapp.com:443/"
    };
  }  
  async readToken() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "BrowserId=nGA526IFEeuHxlEWr5g1eQ; BrowserId_sec=nGA526IFEeuHxlEWr5g1eQ; __cfduid=da798c96128c04b6376dab4a41cf9728b1617326503");
    var raw = JSON.stringify({
      "type": "guest"
    });
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    return fetch(PROXY+"https://0dnz6oep.api.commercecloud.salesforce.com/customer/shopper-customers/v1/organizations/f_ecom_bdqd_s12/customers/actions/login?siteId=RefArch&clientId=419998a0-1ec6-4598-8d88-ef28093e7453", requestOptions)
      .then(response => { 
        if(TRACE) {
          const headers = {};
          for (var pair of response.headers.entries()) {
            headers[pair[0]] = pair[1];
          }
          console.log(`HEADERS: ${JSON.stringify(headers,null,"  ")}`)
          console.log(`HEADER-AUTH: ${response.headers.get("authorization")}`)
        }
        return response.headers.get("authorization");
      })
      .catch(error => console.log('error', error));
  }
}

class OneCAccessor extends Accessor {
  async createConfig() {
    const token = await this.readToken();
    return {
      parameters: {
        clientId: "419998a0-1ec6-4598-8d88-ef28093e7453",
        organizationId: "f_ecom_bdqd_s12",
        shortCode: "0dnz6oep",
        siteId: "RefArch"
      },
      headers: {
        authorization: token,
      },
      proxy: PROXY+"spike-4.herokuapp.com:443/"
    };
  }  
  async readToken() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "BrowserId=nGA526IFEeuHxlEWr5g1eQ; BrowserId_sec=nGA526IFEeuHxlEWr5g1eQ; __cfduid=da798c96128c04b6376dab4a41cf9728b1617326503");
    var raw = JSON.stringify({
      "type": "guest"
    });
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    return fetch(PROXY+"https://0dnz6oep.api.commercecloud.salesforce.com/customer/shopper-customers/v1/organizations/f_ecom_bdqd_s12/customers/actions/login?siteId=RefArch&clientId=419998a0-1ec6-4598-8d88-ef28093e7453", requestOptions)
      .then(response => { 
        if(TRACE) {
          const headers = {};
          for (var pair of response.headers.entries()) {
            headers[pair[0]] = pair[1];
          }
          console.log(`HEADERS: ${JSON.stringify(headers,null,"  ")}`)
          console.log(`HEADER-AUTH: ${response.headers.get("authorization")}`)
        }
        return response.headers.get("authorization");
      })
      .catch(error => console.log('error', error));
  }
}

// https://spike-4.herokuapp.com/spike-4/v1/organizations/f_ecom_bdqd_s12/products/canon-powershot-a580M?siteId=RefArch
// https://priand-proxy.herokuapp.com/spike-4/v1/organizations/f_ecom_bdqd_s12/products/canon-powershot-a580M?siteId=RefArch


const accessor = new B2CAccessor();

export async function getProduct(id) {
  return accessor.getProduct(id);
}

export async function productSearch(searchTerm) {
  return accessor.productSearch(searchTerm);
}

const CC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export async function cmsContent() {
  let RANDOM_KEY = "";
  for(let i=0; i<16; i++) {
    const pos = Math.random()*CC.length;
    RANDOM_KEY = RANDOM_KEY + CC.substring(pos,pos+1);
  }
  return fetch(PROXY+`https://d23q98rtu4xlmj.cloudfront.net/static/00Dxx0000001gXl/0apxx000000010C.json?q=${RANDOM_KEY}`)
    .then(response => { 
      return response.json();
    })
    .catch(error => console.log('error', error));
}