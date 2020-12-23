import 'regenerator-runtime/runtime';
import defaultUrls from '../storage/defaultUrls';

export default class Loader {
  constructor(urls) {
    this.urls = urls || defaultUrls;
    this.getData = this.getData.bind(this);
  }

  getUrl(name) {
    return (name in this.urls) && this.urls[name];
  }

  setUrl(name, url) {
    this.urls[name] = url;
  }

  getData(purpose, sortString) {
    const url = sortString ? `${this.getUrl(purpose)}&sort=${sortString}` : this.getUrl(purpose);

    return fetch(url)
      .then((response) => {
        if (response.ok) return response.json();
        return Promise.reject(response);
      })
      .catch((response) => console.log(`there's something wrong with error=${response.statusText}`));
  }
}
