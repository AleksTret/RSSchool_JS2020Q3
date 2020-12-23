import state from './state';
import firstLetterToUpperCase from './utils/firstLetterToUpperCase';
import toReadableFormat from './utils/toReadableFormat';

export default class Statistics {
  constructor() {
    this.text = document.getElementById('table-title__text');
    this.infoWithNumbers = document.getElementById('info_with_numbers');

    this._findTogglesInDOM();
    this.isProccessing = false;
    this._addListenerToToggles();

    this._refresh = this._refresh.bind(this);
    this._subscribe(this._refresh);
  }

  _findTogglesInDOM() {
    this.togglePeriod = document.getElementById('checkbox-period');
    this.togglePopulation = document.getElementById('checkbox-population');
    this.inputPeriod = document.getElementById('input-period');
    this.inputPopulation = document.getElementById('input-population');
  }

  _addListenerToToggles() {
    this._addListenerToTogglePeriod();
    this._addListenerToTogglePopulation();
  }

  _addListenerToTogglePeriod() {
    this.inputPeriod.addEventListener('click', () => {
      if (this.isProccessing) {
        return;
      }
      this.isProccessing = true;

      const period = this.togglePeriod.childNodes[0].checked ? 'today' : 'total';
      state.setPeriod(period);

      this._clickUnpause();
    });
  }

  _addListenerToTogglePopulation() {
    this.inputPopulation.addEventListener('click', () => {
      if (this.isProccessing) {
        return;
      }
      this.isProccessing = true;

      const population = this.togglePopulation.childNodes[0].checked ? '100k' : 'total';
      state.setPopulation(population);

      this._clickUnpause();
    });
  }

  _clickUnpause() {
    setTimeout(() => {
      this.isProccessing = false;
    }, 500);
  }

  setIso2(iso2) {
    this.iso2 = iso2;
  }

  _subscribe(fn) {
    state.subscribeLocation(fn);
  }

  addLoader(loader) {
    this.loader = loader;
  }

  _refresh() {
    this._refreshText();
    this._refreshinfoWithNumbers();
  }

  _refreshText() {
    this.text.textContent = state.location === 'total' ? 'All world' : this.iso2[state.location];
  }

  _refreshinfoWithNumbers() {
    this.infoWithNumbers.innerHTML = '';
    const fragment = new DocumentFragment();
    state.options.forEach((option) => {
      const item = document.createElement('p');

      const optionName = firstLetterToUpperCase(option.name);
      const optionNum = state.population.type === '100k'
        ? ((option[state.period] * 10e4) / state.population.num).toFixed(2)
        : option[state.period];

      item.innerHTML = `${optionName}: ${toReadableFormat(optionNum)}`;
      fragment.append(item);
    });
    this.infoWithNumbers.append(fragment);
  }
}
