export default class Keyboard {
  constructor(keyboardLayouts, textArea, buttonShowKeyboard, breakLine = ['13', '25', '38', '50']) {
    this.elements = {
      main: null,
      keysContainer: null,
      keys: [],
    };

    this.properties = {
      capsLock: false,
      shift: false,
      language: '',
      sound: false,
      sync: false,
      microphone: false,
      isHidden: true,
    };

    this.textArea = textArea;
    this.buttonShowKeyboard = buttonShowKeyboard;

    this._init(keyboardLayouts, breakLine);
  }

  async _init(keyboardLayouts, breakLine) {
    await this._createKeyLayout(keyboardLayouts);

    this._createKeyboard(breakLine);

    this._speechRecognitionInit();
  }

  _createKeyboard(breakLine) {
    this.elements.main = document.createElement('div');
    this.elements.keysContainer = document.createElement('div');

    this.elements.main.classList.add('keyboard', 'keyboard--hidden');
    this.elements.keysContainer.classList.add('keyboard__keys');

    this.elements.keysContainer.appendChild(this._createKeys(breakLine));

    this.elements.keys = this.elements.keysContainer.querySelectorAll('.keyboard__key');

    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);

    this.buttonShowKeyboard.addEventListener('click', () => {
      this._toggleShowKeyboard();
      this.textArea.focus();
    });

    this.textArea.addEventListener('click', () => {
      this._toggleShowKeyboard();
    });

    this.textArea.addEventListener('keydown', (event) => this._onKeydown(event));

    this.textArea.addEventListener('keyup', (event) => this._onKeyup(event));
  }

  async _createKeyLayout(keyboardLayouts) {
    this.languages = [];
    this.keyLayouts = new Map();

    const promises = Object.entries(keyboardLayouts).map(async (item) => {
      this.languages.push(item[0]);
      const json = await this._loadKeyLayout(item[1]);
      this.keyLayouts.set(item[0], new Map(Object.entries(json)));
    });

    await Promise.all(promises);

    [this.properties.language] = this.languages;

    this.currentLayout = this.keyLayouts.get(this.languages[0]);

    this._createRegularExpression();
  }

  _createRegularExpression() {
    const reg = /[^1234567890\-=[]{};:'",.\/]/i;
    this.regularExpression = new Map();

    this.keyLayouts.forEach((layout, language) => {
      const lettersSetFromKeyLayout = Array.from(layout.values())
        .map((item) => item.normal)
        .filter((item) => item.length === 1 && reg.test(item))
        .join('');

      const regExp = new RegExp(`[${lettersSetFromKeyLayout}]`);

      this.regularExpression.set(language, regExp);
    });
  }

  async _loadKeyLayout(url) {
    const response = await fetch(url);
    return response.json();
  }

  _createIconHTML(iconName) {
    return `<i class="material-icons">${iconName}</i>`;
  }

  _createKeyCode(text) {
    return `<span class="keyboard__key__code-hidden">${text}</span>`;
  }

  _createKeys(breakLine) {
    const fragment = document.createDocumentFragment();

    this.currentLayout.forEach((value, key) => {
      const keyElement = document.createElement('button');

      const insertLineBreak = breakLine.indexOf(key) !== -1;

      keyElement.setAttribute('type', 'button');
      keyElement.setAttribute('data', key);
      keyElement.classList.add('keyboard__key');

      switch (value.normal) {
        case 'backspace':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = this._createIconHTML('backspace') + this._createKeyCode('Backspace');

          keyElement.addEventListener('click', () => {
            this._delete();
            this._callEventInput(this.textArea);
          });
          break;
        case 'capslock':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatable');
          keyElement.innerHTML = this._createIconHTML('keyboard_capslock') + this._createKeyCode('CapsLock');

          this.keyCapsLock = keyElement;
          keyElement.addEventListener('click', () => {
            this._clickOnCapsLock();
            if (this.properties.sound) this._soundClick('CapsLock');
          });
          break;
        case 'enter':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = this._createIconHTML('keyboard_return') + this._createKeyCode('Enter');

          keyElement.addEventListener('click', (event) => this._print(event, this.textArea, '\n'));
          break;
        case 'space':
          keyElement.classList.add('keyboard__key--extra-wide');
          keyElement.innerHTML = this._createIconHTML('space_bar') + this._createKeyCode('Space');
          keyElement.addEventListener('click', (event) => this._print(event, this.textArea, ' '));
          break;
        case 'done':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--dark');
          keyElement.innerHTML = this._createIconHTML('check_circle');

          keyElement.addEventListener('click', () => this._toggleShowKeyboard());
          break;
        case 'shift':
          keyElement.classList.add('keyboard__key--activatable', 'keyboard__key--wide');

          keyElement.innerHTML = this._createIconHTML('arrow_circle_up') + this._createKeyCode('Shift');
          this.keyShift = keyElement;
          keyElement.addEventListener('click', () => {
            this._clickOnShift();
            if (this.properties.sound) this._soundClick('Shift');
          });
          break;
        case 'language':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = `${this._createIconHTML('language')}<span class="language_name">${this.properties.language}</span>`;
          keyElement.addEventListener('click', () => {
            this._toggleLang();
            this.textArea.focus();
          });
          break;
        case 'left_arrow':
          keyElement.innerHTML = this._createIconHTML('keyboard_arrow_left') + this._createKeyCode('ArrowLeft');
          keyElement.addEventListener('click', () => {
            this.textArea.focus();
            if (this.textArea.selectionStart) {
              const currentPositionCursor = this.textArea.selectionStart;
              this.textArea.setSelectionRange(currentPositionCursor - 1, currentPositionCursor - 1);
            }
            if (this.properties.sound) this._soundClick();
            this.textArea.focus();
          });
          break;
        case 'right_arrow':
          keyElement.innerHTML = this._createIconHTML('keyboard_arrow_right') + this._createKeyCode('ArrowRight');
          keyElement.addEventListener('click', () => {
            this.textArea.focus();
            const currentPositionCursor = this.textArea.selectionStart;
            this.textArea.setSelectionRange(currentPositionCursor + 1, currentPositionCursor + 1);
            if (this.properties.sound) this._soundClick();
            this.textArea.focus();
          });
          break;
        case 'sound':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatable');
          keyElement.innerHTML = this._createIconHTML('audiotrack') + this._createKeyCode('audiotrack');
          this.keySound = keyElement;
          keyElement.addEventListener('click', () => {
            this._toggleSound();
            this._soundClick();
          });
          break;
        case 'microphone':
          keyElement.innerHTML = this._createIconHTML('mic_off') + this._createKeyCode('microphone');
          this.keyMicrophone = keyElement;
          keyElement.addEventListener('click', () => this._toggleMicrophone());
          break;
        default:
          keyElement.innerHTML = value.normal;
          keyElement.addEventListener('click', (event) => this._print(event, this.textArea));
          break;
      }

      fragment.appendChild(keyElement);

      if (insertLineBreak) {
        fragment.appendChild(document.createElement('br'));
      }
    });

    return fragment;
  }

  _soundClick(code) {
    let urlSoundFile = `assets/sounds/${this.properties.language}_click.mp3`;
    if (code?.includes('keyboard_return')) {
      urlSoundFile = 'assets/sounds/enter_click.mp3';
    }

    if (code?.includes('Backspace') || code?.includes('Enter') || code?.includes('CapsLock') || code?.includes('Shift')) {
      urlSoundFile = `assets/sounds/${code.toLowerCase()}_click.mp3`;
    }

    const audio = new Audio(urlSoundFile);
    audio.play();
  }

  _clickOnCapsLock() {
    this._toggleCapsLock();
    this.keyCapsLock.classList.toggle('keyboard__key--active', this.properties.capsLock);
    this.textArea.focus();
  }

  _clickOnShift() {
    this._toggleShift();
    this.keyShift.classList.toggle('keyboard__key--active', this.properties.shift);
    this.textArea.focus();
  }

  _onKeydown(event) {
    if ((event.altKey && event.shiftKey) || (event.ctrlKey && event.shiftKey)) {
      this._toggleLang();
      return;
    }

    if (!this.properties.sync) this._syncKeyLayout(event.key);

    if (event.code.includes('CapsLock')) this._clickOnCapsLock();
    if (event.code.includes('Shift')) this._clickOnShift();
    if (this.properties.sound && !event.altKey && !event.ctrlKey) this._soundClick(event.code);

    this.elements.keys.forEach((key) => {
      if (key.childElementCount !== 0 && event.code.includes(key.querySelector('span')?.innerHTML)) {
        key.querySelector('i').classList.add('keyboard__key--highlight');
      }
      if (key.innerHTML.toLowerCase() === event.key.toLowerCase()) {
        key.classList.add('keyboard__key--highlight');
      }
    });
  }

  _syncKeyLayout(key) {
    this.regularExpression.forEach((regexp, language) => {
      if (regexp.test(key) && this.properties.language !== language) {
        this._toggleLang();
        this._toggleSync();
      }
    });
  }

  _toggleSync() {
    this.properties.sync = !this.properties.sync;
  }

  _onKeyup(event) {
    this.elements.keys.forEach((key) => {
      if (key.childElementCount !== 0) {
        key.querySelector('i').classList.remove('keyboard__key--highlight');
      }
      if (key.innerHTML.toLowerCase() === event.key.toLowerCase()) {
        key.classList.remove('keyboard__key--highlight');
      }
    });
  }

  _print(event, textArea, symbol) {
    if (this.properties.sound) this._soundClick(event?.currentTarget.innerText);
    const startPosition = this.textArea.selectionStart;
    const endPosition = this.textArea.selectionEnd;

    const text = this.textArea.value.substring(0, startPosition)
      + (symbol || event?.currentTarget.innerText)
      + this.textArea.value.substring(endPosition);

    this.textArea.value = text;

    this._callEventInput(this.textArea);

    this.textArea.focus();

    this.textArea.selectionEnd = (startPosition === endPosition)
      ? (startPosition + 1)
      : endPosition - 1;
  }

  _callEventInput(textArea) {
    const eventOptions = { bubbles: true, cancelable: false, composed: false };
    const inputEvent = new Event('input', eventOptions);
    textArea.dispatchEvent(inputEvent);
  }

  _delete() {
    const startPosition = this.textArea.selectionStart;
    const endPosition = this.textArea.selectionEnd;
    if (this.properties.sound) this._soundClick('Backspace');

    this.textArea.value = (startPosition === endPosition)
      ? this.textArea.value.substring(0, startPosition - 1)
        + this.textArea.value.substring(endPosition)
      : this.textArea.value.substring(0, startPosition)
        + this.textArea.value.substring(endPosition);
    this.textArea.focus();

    this.textArea.selectionEnd = (startPosition === endPosition)
      ? startPosition - 1
      : startPosition;
  }

  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;

    this.elements.keys.forEach((key) => {
      if (key.childElementCount !== 0) return;
      const dataAttribute = key.getAttribute('data');
      const letterObject = this.currentLayout.get(dataAttribute);
      key.innerHTML = this._getSymbol(this.properties.capsLock,
        this.properties.shift, letterObject);
    });
  }

  _toggleSound() {
    this.properties.sound = !this.properties.sound;
    this.keySound.classList.toggle('keyboard__key--active', this.properties.sound);
    this.textArea.focus();
  }

  _getSymbol(caps, shift, letterObject) {
    const isSpecialSymbol = letterObject.normal === letterObject.caps;
    if (caps) {
      if (!shift) {
        return letterObject.caps;
      }
      return isSpecialSymbol ? letterObject.shift : letterObject.normal;
    }
    return shift ? letterObject.shift : letterObject.normal;
  }

  _toggleShift() {
    this.properties.shift = !this.properties.shift;

    this.elements.keys.forEach((key) => {
      if (key.childElementCount !== 0) return;
      const dataAttribute = key.getAttribute('data');
      const letterObject = this.currentLayout.get(dataAttribute);
      key.innerHTML = this._getSymbol(this.properties.capsLock,
        this.properties.shift, letterObject);
    });
  }

  _toggleLang() {
    const index = this.languages.indexOf(this.properties.language);
    const next = index < this.languages.length - 1 ? index + 1 : 0;
    this.properties.language = this.languages[next];

    this.currentLayout = this.keyLayouts.get(this.properties.language);
    if (this.properties.sound) this._soundClick();

    this.recognition.lang = `${this.properties.language}-${this.properties.language.toUpperCase()}`;

    this.elements.keys.forEach((key) => {
      if (key.childElementCount !== 0) {
        const span = key.getElementsByClassName('language_name');
        if (span.length) {
          key.innerHTML = `${this._createIconHTML('language')}<span class="language_name">${this.properties.language}</span>`;
        }
        return;
      }
      const dataAttribute = key.getAttribute('data');
      const letterObject = this.currentLayout.get(dataAttribute);

      key.innerHTML = this._getSymbol(this.properties.capsLock,
        this.properties.shift, letterObject);
    });
  }

  _toggleShowKeyboard() {
    this.properties.isHidden = !this.properties.isHidden;
    this.elements.main.classList.toggle('keyboard--hidden', this.properties.isHidden);
  }

  _toggleMicrophone() {
    this.properties.microphone = !this.properties.microphone;
    if (this.properties.microphone) {
      this.keyMicrophone.querySelector('i').innerHTML = 'mic';
    } else {
      this.keyMicrophone.querySelector('i').innerHTML = 'mic_off';
    }
    if (this.properties.sound) this._soundClick();

    this.recognition.lang = `${this.properties.language}-${this.properties.language.toUpperCase()}`;
    if (this.properties.microphone) {
      this.recognition.start();
    } else {
      this.recognition.stop();
    }
  }

  _speechRecognitionInit() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new window.SpeechRecognition();
    this.recognition.interimResults = true;
    this.recognition.lang = `${this.properties.language}-${this.properties.language.toUpperCase()}`;

    this.storageValueTextArea = this.textArea.value;

    this.recognition.addEventListener('result', (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');

      this.textArea.value = this.storageValueTextArea + transcript;
      this.textArea.focus();
    });

    this.recognition.addEventListener('start', () => {
      this.storageValueTextArea = `${this.textArea.value} `;
    });
    this.recognition.addEventListener('end', () => {
      if (this.properties.microphone) {
        this.recognition.start();
      }
      this.microphone.stop();
    });
  }
}
