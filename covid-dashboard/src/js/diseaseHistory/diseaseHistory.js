import Component from '../additionalClasses/component';
import chartConfig from './chartConfig';
import { svgArrowLeft, svgArrowRight } from '../storage/icons';
import state from '../state';

const Chart = require('chart.js');

export default class DiseaseHistoryContainer extends Component {
  constructor(...args) {
    super(...args);

    this._createCanvas();
    this._createConfig();
    this._createContext();
    this._createButtons();
    this._addListeners();

    this._append();

    this._refresh = this._refresh.bind(this);
    this._subscribe(this._refresh);
  }

  _createCanvas() {
    this.canvas = new Component('canvas', 'canvas').node;
  }

  _createConfig() {
    this.chartConfig = chartConfig;
  }

  _createContext() {
    const ctx = this.canvas.getContext('2d');
    this.chart = new Chart(ctx, this.chartConfig);
  }

  _createButtons() {
    this.buttonsContainer = new Component('div', 'graph-canvas-container').node;

    this.display = new Component('span', '', 'none').node;
    this.buttonLeft = new Component('div', 'switch-arrow', '').node;
    this.buttonLeft.innerHTML = svgArrowLeft;
    this.buttonRight = new Component('div', 'switch-arrow', '').node;
    this.buttonRight.innerHTML = svgArrowRight;

    this.buttonsContainer.append(this.buttonLeft, this.display, this.buttonRight);
  }

  _addListeners() {
    this.buttonLeft.addEventListener('click', () => {
      state.shiftOption(-1);
    });

    this.buttonRight.addEventListener('click', () => {
      state.shiftOption(1);
    });
  }

  _refresh() {
    this._clearChartConfig();
    this._refreshChart();
    this._refreshDisplay();
  }

  _clearChartConfig() {
    this.chartConfig.data.labels.length = 0;
    this.chartConfig.data.datasets[0].data.length = 0;
  }

  _refreshChart() {
    const request = this.loader.getData('history');
    request.then((data) => {
      const arr = Object.entries(data[state.option.name]);

      arr.forEach((value) => {
        this.chartConfig.data.labels.push(value[0]);
        this.chartConfig.data.datasets[0].data.push(value[1]);
      });

      this.chart.update();
    });
  }

  _refreshDisplay() {
    this.display.textContent = state.option.name;
  }

  _append() {
    this.node.append(this.canvas, this.buttonsContainer);
  }

  addLoader(loader) {
    this.loader = loader;
  }

  _subscribe(fn) {
    state.subscribeOption(fn);
  }

  toggleSize() {
    this.node.classList.toggle('canvas-big');
  }
}
