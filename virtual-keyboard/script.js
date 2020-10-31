const Keyboard = {
    textArea : document.querySelector(".use-keyboard-input"),

    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    properties: {
        capsLock: false,
        shift: false,
        language: "",
        sound: false,
        sync: false
    },

    async init(keyboardLayouts) {
        this.languages = [];
        this.keyLayouts = new Map();

        const promises = Object.entries(keyboardLayouts).map(async (item)=> {
            this.languages.push(item[0]);
            let json =  await this._loadKeyLayout(item[1]);
            this.keyLayouts.set(item[0], new Map(Object.entries(json)));
        });

        await Promise.all(promises);

        this.properties.language = this.languages[0];

        this.currentLayout = this.keyLayouts.get(this.languages[0]);

        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");

        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this._showKeyboard();
            });    
        })

        // make copy properties for callback functions
        this.currentProperties = this.properties;

        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("keydown", (event) => {
                this._onKeydown(event);
            });    
        })

        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("keyup", (event) => {
                this._onKeyup(event);
            });    
        })
    },

    async _loadKeyLayout(url){
        const response = await fetch(url);
        return await response.json();
    },

    _createIconHTML(icon_name){
        return `<i class="material-icons">${icon_name}</i>`;
    },

    _createKeyCode(text){
        return `<span class="keyboard__key__code-hidden">${text}</span>`;
    },

    _createKeys(){
        const fragment = document.createDocumentFragment();

        this.currentLayout.forEach((value, key, map) => {
            const keyElement = document.createElement("button");

            const insertLineBreak = ["13", "25", "38", "50"].indexOf(key) !== -1;

            keyElement.setAttribute("type", "button");
            keyElement.setAttribute("data", key);
            keyElement.classList.add("keyboard__key");
            
            switch (value.normal) {
                case "backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = this._createIconHTML("backspace") + this._createKeyCode("Backspace"); 

                    keyElement.addEventListener("click", () => this._delete(this.textArea));
                    

                    break;

                case "capslock":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = this._createIconHTML("keyboard_capslock") + this._createKeyCode("CapsLock");

                    this.keyCapsLock = keyElement;
                    keyElement.addEventListener("click", () => {
                        this._clickOnCapsLock();
                        this.properties.sound && this._soundClick("CapsLock");
                    });
                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = this._createIconHTML("keyboard_return") + this._createKeyCode("Enter");

                    keyElement.addEventListener("click", (event) => this._print(event, this.textArea, "\n"));

                    break;

                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = this._createIconHTML("space_bar") + this._createKeyCode("Space");
                    keyElement.addEventListener("click", (event) => this._print(event, this.textArea, " "));

                    break;

                case "done":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = this._createIconHTML("check_circle");

                    keyElement.addEventListener("click", () => this._hideKeyboard());
                    break;

                case "shift":
                    keyElement.classList.add("keyboard__key--activatable", "keyboard__key--wide");
                    
                    keyElement.innerHTML = this._createIconHTML("arrow_circle_up") + this._createKeyCode("Shift");
                    this.keyShift = keyElement;
                    keyElement.addEventListener("click", () => {
                        this._clickOnShift();
                        this.properties.sound && this._soundClick("Shift");
                    });
                    break;
                
                case "language":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = this._createIconHTML("language") + `<span class="language_name">${this.properties.language}</span>`;
                    keyElement.addEventListener("click", () => {
                        this._toggleLang();
                        this.textArea.focus();
                    })
                    break;

                case "left_arrow":
                    keyElement.innerHTML = this._createIconHTML("keyboard_arrow_left") + this._createKeyCode("ArrowLeft");
                    keyElement.addEventListener("click", () => {
                        this.textArea.focus();
                        if (this.textArea.selectionStart)
                        { 
                            let currentPositionCursor = this.textArea.selectionStart;
                            this.textArea.setSelectionRange(currentPositionCursor - 1,currentPositionCursor - 1);
                        }
                        this.properties.sound && this._soundClick();
                        this.textArea.focus();
                    })
                    break;

                case "right_arrow":
                    keyElement.innerHTML = this._createIconHTML("keyboard_arrow_right")  + this._createKeyCode("ArrowRight");
                    keyElement.addEventListener("click", () => {
                        this.textArea.focus();
                        let currentPositionCursor = this.textArea.selectionStart;
                        this.textArea.setSelectionRange(currentPositionCursor + 1,currentPositionCursor + 1);
                        this.properties.sound && this._soundClick();
                        this.textArea.focus();
                    })
                    break;

                case "sound":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = this._createIconHTML("audiotrack") + this._createKeyCode("audiotrack");
                    this.keySound = keyElement;
                    keyElement.addEventListener("click", () => {
                        this._toggleSound();
                        this._soundClick();
                    });
                    break;
        
                default:
                    keyElement.innerHTML = value.normal;
                    keyElement.addEventListener("click", (event) => this._print(event, this.textArea));
                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak){
                fragment.appendChild(document.createElement("br"));
            }
        });

        return fragment;
    },

    _soundClick(code){
        let urlSoundFile = `assets/sounds/${this.currentProperties.language}_click.mp3`;
        if(code?.includes("keyboard_return")){
            urlSoundFile = `assets/sounds/enter_click.mp3`;
        }

        if(code?.includes("Backspace") || code?.includes("Enter") || code?.includes("CapsLock") || code?.includes("Shift")){
            urlSoundFile = `assets/sounds/${code}_click.mp3`;
        } 
        
        let audio = new Audio(urlSoundFile);
        audio.play();
    },

    _clickOnCapsLock(){
        this._toggleCapsLock();
        this.keyCapsLock.classList.toggle("keyboard__key--active", this.properties.capsLock);
        this.textArea.focus();
    }, 

    _clickOnShift(){
        this._toggleShift();
        this.keyShift.classList.toggle("keyboard__key--active", this.properties.shift);
        this.textArea.focus();
    },

    _onKeydown(event){
        if  ((event.altKey && event.shiftKey) || (event.ctrlKey && event.shiftKey)) {
            this._toggleLang();
            return;
        }

        !this.properties.sync && this._syncKeyLayout(event.key);

        event.code.includes("CapsLock") && this._clickOnCapsLock();
        event.code.includes("Shift") && this._clickOnShift();
        this.properties.sound && !event.altKey && !event.ctrlKey && this._soundClick(event.code);
     
        this.elements.keys.forEach(key => {
            key.childElementCount !== 0 && event.code.includes(key.querySelector("span")?.innerHTML) && key.querySelector("i").classList.add("keyboard__key--highlight");
            key.innerHTML.toLowerCase() == event.key.toLowerCase() && key.classList.add("keyboard__key--highlight");             
        });
    },

    _syncKeyLayout(key){
        console.log(this.properties.sync);
        console.log(key);

        if (/[a-z]/i.test(key) && this.properties.language == "ru"){
            this._toggleLang();
            this._toggleSync();
        } 
        if (/[а-я]/i.test(key) && this.properties.language == "en"){
            this._toggleLang();
            this._toggleSync();
        } 
    },

    _toggleSync(){
        this.properties.sync = !this.properties.sync; 
        console.log
    },

    _onKeyup(event){
        this.elements.keys.forEach(key => {
            key.childElementCount !== 0 && key.querySelector("i").classList.remove("keyboard__key--highlight");
            key.innerHTML.toLowerCase() == event.key.toLowerCase() && key.classList.remove("keyboard__key--highlight");
        });                                                                                                            
    },

    _print(event, textArea, symbol){
        this.properties.sound && this._soundClick(event.currentTarget.innerText);
        const startPosition = textArea.selectionStart;
        const endPosition = textArea.selectionEnd;
        
        let text = textArea.value.substring(0, startPosition) + (symbol || event.currentTarget.innerText) + textArea.value.substring(endPosition);

        textArea.value = text;
        
        textArea.focus();

        textArea.selectionEnd = (startPosition == endPosition) ? (startPosition + 1) : endPosition - 1;
    },

    _delete(textArea){
        const startPosition = textArea.selectionStart;
        const endPosition = textArea.selectionEnd;
        this.properties.sound && this._soundClick("Backspace");
     
        textArea.value = (startPosition == endPosition) ?
                            textArea.value.substring(0, startPosition - 1) + textArea.value.substring(endPosition):
                            textArea.value.substring(0, startPosition) + textArea.value.substring(endPosition);
        textArea.focus();

        textArea.selectionEnd = (startPosition == endPosition) ? startPosition - 1 : startPosition;
    },

    _toggleCapsLock(){
        this.properties.capsLock = !this.properties.capsLock;  

        this.elements.keys.forEach(key => {
            if(key.childElementCount !== 0) return;
            const dataAttribute = key.getAttribute("data");
            const letterObject = this.currentLayout.get(dataAttribute);
            key.innerHTML = this._getSymbol(this.properties.capsLock, this.properties.shift, letterObject);
        });
    },

    _toggleSound(){
        this.properties.sound = !this.properties.sound;
        this.keySound.classList.toggle("keyboard__key--active", this.properties.sound);
        this.textArea.focus();
    },

    _getSymbol(caps, shift, letterObject){
        const isSpecialSymbol = letterObject.normal === letterObject.caps;
        if (caps){
            return !shift ? letterObject.caps : 
                            isSpecialSymbol ? letterObject.shift : letterObject.normal;
        }
        else {
            return shift ? letterObject.shift : letterObject.normal;
        }
    },

    _toggleShift(){
        this.properties.shift = !this.properties.shift;

        this.elements.keys.forEach(key => {
            if(key.childElementCount !== 0) return;
            const dataAttribute = key.getAttribute("data");
            const letterObject = this.currentLayout.get(dataAttribute);        
            key.innerHTML = this._getSymbol(this.properties.capsLock, this.properties.shift, letterObject);     
        });
    },

    _toggleLang(){
        const index = this.languages.indexOf(this.properties.language);
        const next = index < this.languages.length - 1 ? index + 1 : 0;
        this.properties.language = this.languages[next];
        
        this.currentLayout = this.keyLayouts.get(this.properties.language);
        this.properties.sound && this._soundClick();

        this.elements.keys.forEach(key => {
            if(key.childElementCount !== 0) {
                let span = key.getElementsByClassName("language_name");
                if (span.length){
                    key.innerHTML = this._createIconHTML("language") + `<span class="language_name">${this.properties.language}</span>`;
                }                
                return;
            }
            const dataAttribute = key.getAttribute("data");
            //const letterObject = this.properties.language ? this.currentLayout.get(dataAttribute) : this.currentLayout.get(dataAttribute); 
            const letterObject = this.currentLayout.get(dataAttribute);      

            key.innerHTML = this._getSymbol(this.properties.capsLock, this.properties.shift, letterObject);
        })
    },

    _showKeyboard(){
        this.elements.main.classList.remove("keyboard--hidden");
    },

    _hideKeyboard(){
        this.elements.main.classList.add("keyboard--hidden");
    }
}

const keyboardLayouts = {
    "en" : "assets/json/en_layout.json",
    "ru" : "assets/json/ru_layout.json"
}
window.addEventListener("DOMContentLoaded", () => Keyboard.init(keyboardLayouts));