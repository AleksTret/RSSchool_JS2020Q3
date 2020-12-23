import state from '../state';
import createConfig from './mapConfig';
import { createReduceOrIncrease } from '../storage/icons';
import ScreenSwitch from '../additionalClasses/screenSwitch';
import defineStartIndex from '../utils/defineStartIndex';
import toReadableFormat from '../utils/toReadableFormat';
import firstLetterToUpperCase from '../utils/firstLetterToUpperCase';

export default class MapCovid {
  constructor() {
    this.node = document.createElement('div');
    this.node.setAttribute('id', 'map');
    this.node.classList.add('map-small');

    this.container = document.querySelector('.dashboard-map');

    this.markerMinSize = 12;
    this.markerMaxSize = 120;
    this.markers = [];
    this.markerParameters = {
      cases: {
        color: 'red',
        scale: 50000,
      },
      deaths: {
        color: 'blue',
        scale: 3000,
      },
      recovered: {
        color: 'green',
        scale: 50000,
      },
    };
    this.toggles = document.querySelector('.toggles');
  }

  init() {
    this._createMap();

    this.map.on('load', () => {
      this.map = createConfig(this.map);
      this._addHoverAnimation();
      this._addListenerToMap();
      this._addControlToMap();
      this._createResizeIcon();
      this._addListenerToIcon();

      this.canvas = document.querySelector('.mapboxgl-canvas');
      this._addLegend();
    });

    this._refreshMap = this._refreshMap.bind(this);
    this._subscribe(this._refreshMap);
  }

  setIso2(iso2) {
    this.iso2 = iso2;
  }

  _createMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibHVjYXN3b2oiLCJhIjoiY2l5Nmg4cWU1MDA0ejMzcDJtNHJmZzJkcyJ9.WhcEdTYQH6sSw2pm0RSP9Q'; // eslint-disable-line
    this.map = new mapboxgl.Map({ // eslint-disable-line
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v10',
      zoom: 2,
    });
  }

  _addHoverAnimation() {
    const popup = new mapboxgl.Popup({ // eslint-disable-line
      closeButton: false,
      closeOnClick: false,
    });

    this.map.on('mousemove', (event) => {
      const features = this.map.queryRenderedFeatures(event.point, { layers: ['countries'] });
      if (features.length) {
        this.map.getCanvas().style.cursor = 'pointer';
        this.map.setFilter('countries-fills-hover', ['==', 'name', features[0].properties.name]);

        const countryId = features[0].properties.iso_a2;
        if (this.countryId !== countryId) {
          this.countryId = countryId;
          const countriesArray = this.loader.getData('countries');

          countriesArray.then((data) => {
            const len = data.length;
            const startIndex = defineStartIndex(this.iso2, countryId, len);

            for (let i = startIndex; i < len; i++) {
              if (data[i] && data[i].countryInfo && countryId === data[i].countryInfo.iso2) {
                popup.setLngLat([data[i].countryInfo.long, data[i].countryInfo.lat]);

                const namePeriod = state['period'] === 'today'
                  ? `${firstLetterToUpperCase(state.option.name)} today`
                  : `${firstLetterToUpperCase(state.option.name)} (all period)`;

                const number = state['period'] === 'today'
                  ? `today${firstLetterToUpperCase(state.option.name)}`
                  : state.option.name;

                const namePopulation = state.population.type === '100k'
                  ? `(100k population)`
                  : `(all population)`;

                const resultNumber = state.population.type === '100k'
                  ? data[i][number] / (data[i].population * 10e4)
                  : data[i][number];

                popup.setHTML(`
                  <div class="popup">
                    <p>${data[i].country}</p>
                    <p>${namePeriod}:</p>
                    <p>${toReadableFormat(resultNumber)} ${namePopulation}</p>
                  </div>`);
                popup.addTo(this.map);
                break;
              }
            }
          });
        }
      } else {
        // popup.remove(); // it depends on hover (one bug or another bug)
        this.map.setFilter('countries-fills-hover', ['==', 'name', '']);
        this.map.getCanvas().style.cursor = '';
      }
    });

    this.map.on('mouseout', () => {
      popup.remove();
      this.map.getCanvas().style.cursor = 'auto';
      this.map.setFilter('countries-fills-hover', ['==', 'name', '']);
    });
  }

  _addListenerToMap() {
    this.map.on('click', (event) => {
      const features = this.map.queryRenderedFeatures(event.point, { layers: ['countries'] });
      const location = features.length ? features[0].properties.iso_a2 : 'total';
      state.setLocation(location);
    });
  }

  _addControlToMap() {
    const scale = new mapboxgl.ScaleControl(); // eslint-disable-line
    const nav = new mapboxgl.NavigationControl(); // eslint-disable-line
    this.map.addControl(scale, 'bottom-left');
    this.map.addControl(nav, 'top-left');
  }

  _createResizeIcon() {
    this.isMapBig = false;
    this.containerResize = document.createElement('div');
    this.containerResize.classList.add('container-resize');
    this.containerResize.innerHTML = createReduceOrIncrease('increase');
  }

  _addListenerToIcon() {
    this.containerResize.addEventListener('click', () => {
      this.node.classList.toggle('map-small');
      this.node.classList.toggle('map-big');
      this.container.classList.toggle('dashboard-map-big');
      this.isMapBig = !this.isMapBig;

      this.fullScreenMode = new ScreenSwitch();
      this.fullScreenMode.disableAnotherScreen(this.containerResize);

      this.map.resize();
      const reduceOrIncrease = this.isMapBig ? 'reduce' : 'increase';
      this.containerResize.innerHTML = createReduceOrIncrease(reduceOrIncrease);

      this.toggles.classList.toggle('toggles-active');
    });

    this.node.append(this.containerResize);
  }

  addLoader(loader) {
    this.loader = loader;
  }

  _refreshMap() {
    this._removeAllMarkers();
    this._createAndAppendMarkers();
  }

  _removeAllMarkers() {
    this.markers.forEach((marker) => {
      marker.remove();
    });
  }

  _createAndAppendMarkers() {
    const countriesArray = this.loader.getData('countries');
    countriesArray.then((data) => {
      data.forEach((country) => {
        const markerHtml = document.createElement('div');
        markerHtml.classList.add('marker');
        markerHtml.style.backgroundColor = this.markerParameters[state.option.name].color;
        markerHtml.style.pointerEvents = 'none';

        let size = country[state.option.name] / this.markerParameters[state.option.name].scale;
        size = this._checkSize(size);

        markerHtml.style.width = `${size}px`;
        markerHtml.style.height = `${size}px`;

        const marker = new mapboxgl.Marker(markerHtml); // eslint-disable-line
        marker.setLngLat([country.countryInfo.long, country.countryInfo.lat]);
        this.markers.push(marker);
        marker.addTo(this.map);
      });
    });
  }

  _checkSize(size) {
    let localSize = size;
    if (localSize < this.markerMinSize) {
      localSize = this.markerMinSize;
    } else if (localSize > this.markerMaxSize) {
      localSize = this.markerMaxSize;
    }
    return localSize;
  }

  _subscribe(fn) {
    state.subscribeOption(fn);
  }

  _addLegend() {
    const legend = document.createElement('div');
    legend.classList.add('legend');

    const arr = Object.entries(this.markerParameters);
    arr.forEach((parameter) => {
      const span = document.createElement('span');
      span.textContent = parameter[0];

      const marker = document.createElement('div');
      marker.classList.add('legend-marker');
      marker.style.width = `${this.markerMinSize}px`;
      marker.style.height = `${this.markerMinSize}px`;
      marker.style.backgroundColor = parameter[1].color;

      const item = document.createElement('div');
      item.classList.add('legend-item');
      item.append(span, marker);
      legend.append(item);
    });

    this.node.append(legend);
  }
}
