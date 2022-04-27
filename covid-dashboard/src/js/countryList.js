import state from './state';
import Image from './additionalClasses/image';
import Keyboard from './virtual-keyboard/keyboard';
import toReadableFormat from './utils/toReadableFormat';

export default class CountryList {
  constructor() {
    this._getDocumentElements();
    this._addListeners();
    this._refresh = this._refresh.bind(this);
    this._subscribe(this._refresh);
    this._addKeyboard();
  }

  setIso2(iso2) {
    this.iso2 = iso2;
  }

  _addKeyboard() {
    const keyboardLayouts = {
      en: './assets/json/en_layout.json',
      ru: './assets/json/ru_layout.json',
    };
    this.keyboard = new Keyboard(keyboardLayouts, this.inputCountry, this.buttonKeyboard);
  }

  _getDocumentElements() {
    this.countryList = document.querySelector('#cases-countries__rows');
    this.date = document.querySelector('#last-update-date');
    this.inputCountry = document.getElementById('search-field');
    this.buttonKeyboard = document.getElementById('keyboard-button');
  }

  _addListeners() {
    this.countryList.addEventListener('click', (event) => {
      const countryIso2 = event.target.getAttribute('countryIso2')
      || event.target.parentNode.getAttribute('countryIso2');

      if (countryIso2) {
        this.countryList.childNodes.forEach((node) => {
          node.classList.remove('country-active');
        });
        const item = event.target.getAttribute('countryIso2') ? event.target : event.target.parentNode;
        item.classList.add('country-active');

        state.setLocation(countryIso2);
      }

      this._showAllCountry();
      this._clearInput();
    });

    this.inputCountry.addEventListener('input', (event) => {
      this._searchCountry(event.target.value);
    });
  }

  addLoader(loader) {
    this.loader = loader;
  }

  _refresh() {
    this._clearCountryList();
    this._refreshCountryList();
    this._updateDate();
  }

  _clearCountryList() {
    this.countryList.innerHTML = '';
  }

  _refreshCountryList() {
    const request = this.loader.getData('countries', state.option.name);
    let targetElement = null;

    request.then((data) => {
      const fragment = new DocumentFragment();
      data.forEach((country) => {
        const div = this._createElement(country);

        if (country.countryInfo.iso2 === state.location) {
          div.classList.add('country-active');
          targetElement = div;
        }

        fragment.append(div);
      });
      this.countryList.append(fragment);

      if (state.location !== 'total') {
        this._scroll(targetElement);
      }
    });
  }

  _createElement(country) {
    const div = document.createElement('div');
    div.classList.add('table-item');
    div.setAttribute('countryIso2', country.countryInfo.iso2);

    const img = new Image(country);

    const span = document.createElement('span');
    const casesNumber = toReadableFormat(country[state.option.name]);
    span.textContent = `${country.country}. ${casesNumber} ${state.option.name}`;

    div.append(img, span);

    return div;
  }

  _showAllCountry() {
    const elements = document.querySelectorAll('.hidden');
    if (!elements.length) return;

    elements.forEach((item) => {
      item.classList.toggle('hidden', false);
    });
  }

  _scroll(element) {
    const style = window.getComputedStyle(this.countryList, null);
    const topMargin = parseFloat(style.marginTop);
    const { offsetHeight } = document.getElementById('cases-countries__title');
    const topPos = element.offsetTop - topMargin - offsetHeight;

    this.countryList.scrollTop = topPos;
  }

  _searchCountry(input) {
    const regexp = /[a-z]{1,}/i;

    this.countryList.childNodes.forEach((item) => {
      const countryName = item.innerText.match(regexp)[0].toLowerCase();
      item.classList.toggle('hidden', !countryName.includes(input.toLowerCase()));
    });
  }

  _clearInput() {
    const input = document.getElementById('search-field');
    input.value = '';
  }

  _updateDate() {
    let date = new Date().toString();
    date = date.split(' ').slice(0, 5).join(' ');
    this.date.textContent = date;
  }

  _subscribe(fn) {
    state.subscribeLocation(fn);
    state.subscribeOption(fn);
  }
}
