import 'regenerator-runtime/runtime';

export default class Iso2 {
  constructor(url) {
    this.url = url;
  }

  async load() {
    return this._loadJSON(this.url);
  }

  async _loadJSON(url) {
    const response = await fetch(url);
    return response.json();
  }
}
