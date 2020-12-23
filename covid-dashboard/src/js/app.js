import nprogress from 'nprogress';
import MapCovid from './map/map';
import DiseaseHistoryContainer from './diseaseHistory/diseaseHistory';
import Loader from './utils/loader';
import ScreenSwitch from './additionalClasses/screenSwitch';
import CountryList from './countryList';
import Statistics from './statistics';
import state from './state';
import Iso2 from './storage/iso2';

export default class App {
  constructor() {
    this.map = new MapCovid();
    this.diseaseHistory = new DiseaseHistoryContainer('div', 'container container-canvas');

    this.loader = new Loader();
    this.screenSwitch = new ScreenSwitch();

    this.countryList = new CountryList();
    this.statistics = new Statistics();

    const urlIso2 = './assets/json/iso2.json';
    this.objIso2 = new Iso2(urlIso2);
  }

  async init() {
    const iso2 = await this.objIso2.load();
    this.countryList.setIso2(iso2);
    this.statistics.setIso2(iso2);
    this.map.setIso2(iso2);
    state.setIso2(iso2);

    nprogress.start();
    setTimeout(() => {
      nprogress.done();
    }, 3000);

    document.querySelector('.right_panel-grafic').append(this.diseaseHistory.node);
    document.querySelector('.dashboard-map').append(this.map.node);
    this.map.init();
  }

  refresh() {
    state.addLoader(this.loader);

    this.diseaseHistory.addLoader(this.loader);
    this.map.addLoader(this.loader);
    this.countryList.addLoader(this.loader);
    this.statistics.addLoader(this.loader);
    this.screenSwitch.addDiseaseHistory(this.diseaseHistory);

    state.init();
  }
}
