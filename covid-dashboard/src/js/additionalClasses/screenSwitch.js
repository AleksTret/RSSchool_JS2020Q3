import state from '../state';

export default class ScreenSwitch {
  constructor() {
    this.fullButtons = document.querySelectorAll('.full-block');
    this.toggles = document.querySelector('.toggles');
    this.dashboardСontainer = document.querySelector('.dashboard-container');
    this.lengthWhileFullScreen = 4;
    this.lengthWhileSmallScreen = 3;
    this._addListeners();
  }

  addDiseaseHistory(diseaseHistory) {
    this.diseaseHistory = diseaseHistory;
  }

  disableAnotherScreen(button) {
    this.allDashboardBlocks = document.querySelector('.dashboard-container').childNodes;
    this.allDashboardBlocks.forEach((block) => {
      if (block !== button.parentElement.parentElement) {
        block.classList.toggle('full-notActive');
      }
    });

    if (this.allDashboardBlocks.length === this.lengthWhileFullScreen) {
      const temp = this.dashboardСontainer.lastChild;
      const clone = temp.cloneNode(true);
      temp.remove();

      clone.classList.remove('full-notActive');
      clone.classList.remove('toggles-active');
      document.getElementById('right_panel-tables-new').append(clone);
    } else if (this.allDashboardBlocks.length === this.lengthWhileSmallScreen) {
      const temp = document.querySelector('.toggles');
      const clone = temp.cloneNode(true);
      temp.remove();

      clone.classList.remove('full-notActive');
      clone.classList.add('toggles-active');
      this.dashboardСontainer.append(clone);
    }

    this._findTogglesInDOM();
    this._addListenerToToggles();
  }

  _createClone() {

  }

  _addListeners() {
    this.fullButtons.forEach((fullButton) => {
      fullButton.addEventListener('click', () => {
        this.disableAnotherScreen(fullButton);
        const parent = fullButton.parentElement;
        parent.classList.toggle('full-active');

        if (parent.classList.contains('full-active')) {
          this._changeResizeIcon('reduce', fullButton);
        } else {
          this._changeResizeIcon('increase', fullButton);
        }

        if (!document.querySelector('.last-update-date').classList.contains('full-active')) {
          document.querySelector('.last-update-date').classList.toggle('full-notActive');
        }

        if (parent.classList.contains('cases-countries__table')) {
          document.querySelector('.cases-countries__rows').classList.toggle('active');
        } else if (parent.classList.contains('right_panel-grafic')) {
          document.querySelector('.right_panel-tables').classList.toggle('full-notActive');
          this.diseaseHistory.toggleSize();
        }
      });
    });
  }

  _changeResizeIcon(mode, resizeButton) {
    this.fullButton = resizeButton;
    this.fullButton.innerHTML = `
      <img src='./assets/icons/${mode}-screen.png' alt="${mode}-screen.png">
    `;
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
}
