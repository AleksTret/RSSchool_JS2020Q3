import defineStartIndex from './utils/defineStartIndex';
import firstLetterToUpperCase from './utils/firstLetterToUpperCase';

const state = {
  options: [
    {
      name: 'cases',
      total: 0,
      today: 0,
    },
    {
      name: 'deaths',
      total: 0,
      today: 0,
    },
    {
      name: 'recovered',
      total: 0,
      today: 0,
    },
  ],
  optionNumber: 0,
  location: 'total',
  period: 'total',
  population: {
    type: 'total',
    num: 0,
  },

  subscribersLocation: [],
  subscribersOption: [],

  shiftOption(num) {
    this.optionNumber += num;
    this._checkOptionNumber();
    this._sendToSubscribersOption();
  },

  setIso2(iso2) {
    this.iso2 = iso2;
  },

  _checkOptionNumber() {
    if (this.optionNumber > this.options.length - 1) {
      this.optionNumber = 0;
    } else if (this.optionNumber < 0) {
      this.optionNumber = this.options.length - 1;
    }
  },

  get option() {
    return this.options[this.optionNumber];
  },

  init() {
    this._refreshLocationTotal();
  },

  setLocation(location) {
    if (this.location !== location) {
      this.location = location;
      this._refreshLocation();
      // this._sendToSubscribersLocation();
    }
  },

  _refreshLocation() {
    if (this.location === 'total') {
      this._refreshLocationTotal();
    } else {
      this._refreshLocationCountry();
    }
  },

  _refreshLocationTotal() {
    const request = this.loader.getData('total');
    request
      .then((data) => {
        this._setOptions(data);
      })
      .finally(() => {
        this._sendToSubscribersAll();
      });
  },

  _refreshLocationCountry() {
    const request = this.loader.getData('countries');
    request
      .then((data) => {
        const len = data.length;
        const startIndex = defineStartIndex(this.iso2, this.location, len);
        for (let i = startIndex; i < len; i++) {
          if (this.location === data[i].countryInfo.iso2) {
            this._setOptions(data[i]);
            break;
          }
        }
      })
      .finally(() => {
        this._sendToSubscribersAll();
      });
  },

  _setOptions(sourceObject) {
    this.options.forEach((option) => {
      option.total = sourceObject[option.name];
      option.today = sourceObject[`today${firstLetterToUpperCase(option.name)}`];
    });
    this.population.num = sourceObject.population;
  },

  addLoader(loader) {
    this.loader = loader;
  },

  // subscribeAll(fn) {
  // this.subscribersLocation.push(fn);
  // this.subscribeLocation(fn);
  // this.subscribeOption(fn);
  // },

  subscribeLocation(fn) {
    this.subscribersLocation.push(fn);
  },

  subscribeOption(fn) {
    this.subscribersOption.push(fn);
  },

  _sendToSubscribersAll() {
    this._sendToSubscribersLocation();
    this._sendToSubscribersOption();
  },

  _sendToSubscribersLocation(data) {
    this.subscribersLocation.forEach((subscriber) => {
      subscriber(data);
    });
  },

  _sendToSubscribersOption(data) {
    this.subscribersOption.forEach((subscriber) => {
      subscriber(data);
    });
  },

  setPeriod(period) {
    this.period = period;
    // this._sendToSubscribersAll();
    this._sendToSubscribersLocation();
    // this._sendToSubscribersOption();
  },

  setPopulation(population) {
    this.population.type = population;
    this._sendToSubscribersAll();
    // this._sendToSubscribersLocation();
    // this._sendToSubscribersOption();
  },
};

export default state;
