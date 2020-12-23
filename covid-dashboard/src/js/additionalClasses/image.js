export default class Image {
  constructor(countryObject) {
    this.node = document.createElement('img');
    this.node.setAttribute('src', countryObject.countryInfo.flag);
    this.node.setAttribute('alt', `${countryObject.country}-flag`);
    this.node.setAttribute('width', '24px');
    this.node.setAttribute('height', '16px');

    return this.node;
  }
}
