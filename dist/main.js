
const CustomGlobalCss = `
  
`;

class CustomHTMLElement extends HTMLElement {
  #shadow = null;
  #events = {};
  #observers = [];
  #data = null;
  #fetchOption = {
    controller: null,
    headers: null,
    request: null,
    body: null,
    url:'',
  };

  constructor(fetchOptions=null) {
    super();
    this.#shadow = this.attachShadow(
      { mode: "open" }
    );
    this.#setMainCssSheet();

    if(fetchOptions) {
      (async () => {
        await this.fetch('http://localhost');
      })();
    }
  }

  #setMainCssSheet() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(CustomGlobalCss);
    this.#shadow.adoptedStyleSheets.push(
      sheet
    );
  }

  #getObserver(type, callback, config={}) {
    switch(type){
      case 'IntersectionObserver': {
        return new IntersectionObserver(callback);
      }
      case 'ResizeObserver': {
        return new ResizeObserver(callback);
      }
      case 'MutationObserver': {
        return new MutationObserver(callback);
      }
    } 
    return null;
  }

  #processFetchUrl (url) {
    return url.trim();
  }

  #processFetchMethod (method) {
    if(method.toLowerCase() === 'get') {
      return 'GET';
    } else if(method.toLowerCase() === 'post') {
      return 'POST';
    } else {
      return 'GET';
    }
  }

  #processFetchBody (body) {
    return null;
  }

  #processFetchHeaders (headers) {
    if(headers) return headers;
    const _headers = new Headers();
    _headers.append("Content-Type", "application/json");
    return _headers;
  }

  addEvent(event, callback) {
    if(this.#events.hasOwnProperty(event)) {
      this.removeEventListener(...this.#events[event])
    }
    this.#events[event] = [event, callback];
    this.addEventListener(...this.#events[event]);
  }

  addObserver(type, callback, config={}) {
    const observer = this.#getObserver(type, callback, config);
    if(observer) {
      observer.observe(this);
      this.#observers.push(observer);
    }
  }

  async fetch(url, method=null, headers=null, body={}) {
    try{
      console.log('fetch')
      this.#fetchOption.url = this.#processFetchUrl(url);
      this.#fetchOption.method = this.#processFetchMethod(url);
      this.#fetchOption.body = this.#processFetchBody(url);
      this.#fetchOption.headers = this.#processFetchHeaders(url);
      this.#fetchOption.controller = new AbortController();

      const reqObj = {
        method: this.#fetchOption.method,
        headers: this.#fetchOption.headers,
        signal: this.#fetchOption.controller.signal,
      }

      if(this.#fetchOption.body) {
        reqObj['body'] = JSON.stringify(this.#fetchOption.body)
      }

      this.#fetchOption.request = new Request(this.#fetchOption.url, reqObj);

      const cachedResponse = await caches.match(this.#fetchOption.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      const response = await fetch(this.#fetchOption.request);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const cache = await caches.open("CustomComponents");
      cache.put(this.#fetchOption.request, response.clone());

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Oops, we haven't got JSON!");
      }

      return await response.json();

    } catch (error) {
      console.error("Error:", error);
    }
  }


  setChild(child) {
    this.#shadow.appendChild(child);
  }

  connectedCallback() {

    console.log("Custom p element added to page.");
  }

  disconnectedCallback() {
    const keys = Object.keys(this.#events);
    for(let i =0; i<keys.length; i++){
      this.removeEventListener(...this.#events[keys[i]])
    }
    for(let i =0; i<this.#observers.length; i++){
      //this.#observers[i].
    }
    console.log("Custom element removed from page.");
  }

  connectedMoveCallback() {
    console.log("Custom element moved with moveBefore()");
  }

  adoptedCallback() {
    
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed.`);
  }

}
