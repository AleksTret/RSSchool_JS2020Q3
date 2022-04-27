export default class Component {
  constructor(tag = 'div', cssClass = '', textContent = '') {
    const node = document.createElement(tag);
    if (cssClass) {
      node.classList.add(...cssClass.split(' '));
    }
    if (textContent) {
      node.textContent = textContent;
    }
    this.node = node;

    if (cssClass === 'toggle') {
      this._createToggle();
    }
  }

  _createToggle() {
    const checkbox = new Component('input', 'checkbox').node;
    checkbox.setAttribute('type', 'checkbox');
    const slider = new Component('span', 'slider').node;
    this.node.append(checkbox, slider);
  }
}
