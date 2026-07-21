
const CustomGlobalCss = `
  
`;

class CusHTMLElement extends HTMLElement {
  #shadow = null;

  constructor() {
    super();
    this.#shadow = this.attachShadow(
      { mode: "open" }
    );
    this.#setMainCssSheet();
  }

  connectedCallback() {
    console.log("Custom element added to page.");
  }

  disconnectedCallback() {
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

  #setMainCssSheet(){
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(CustomGlobalCss);
    this.#shadow.adoptedStyleSheets.push(
      sheet
    );
  }
  setChild(child){
    this.#shadow.appendChild(child);
  }
}
