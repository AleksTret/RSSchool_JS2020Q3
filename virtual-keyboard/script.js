const Keyboard = {
    textArea: document.querySelector(".use-keyboard-input"),

    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    }, 

    properties: {
        value: "",
        capsLock: false,
        shift: false
    },

    init(){
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());
        this.specialSymbol = this._createSpecialSymbols();

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => element.value = currentValue)
            });    
        })
    },

    _createKeys(){
        const fragment = document.createDocumentFragment();
        const keyLayout = [
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
            "caps", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
            "shift", "a", "s", "d", "f", "g", "h", "j", "k", "l", "enter",
            "done", "z", "x", "c", "v", "b", "n", "m", ",", ".", "?",
            "space"
        ];

        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        }

        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["backspace", "p", "enter", "?"].indexOf(key) !== -1;

            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("backspace");

                    keyElement.addEventListener("click", () => {
                        this.properties.value = this.properties.value.substring(0, this.properties.value.length - 1);
                        this._triggerEvent("oninput");
                        this.textArea.focus();
                    });
                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_capslock");

                    keyElement.addEventListener("click", () => {
                        this._toggleCapsLock();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
                        this.textArea.focus();
                    });
                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_return");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += "\n";
                        this._triggerEvent("oninput");
                        this.textArea.focus();
                    });
                    break;

                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = createIconHTML("space_bar");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += " ";
                        this._triggerEvent("oninput");
                        this.textArea.focus();
                    });
                    break;

                case "done":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = createIconHTML("check_circle");

                    keyElement.addEventListener("click", () => {
                        this.close();
                        this._triggerEvent("onclose");
                    });
                    break;

                case "shift":
                    keyElement.classList.add("keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("arrow_circle_up");
                    keyElement.addEventListener("click", () => {
                        this._toggleShift();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
                        this.textArea.focus();
                    });

                    break;
        
                default:
                    keyElement.textContent = key.toLowerCase();

                    keyElement.addEventListener("click", () => {
                        if(this.properties.shift){
                            if (this.specialSymbol.has(key)){
                                this.properties.value += this.specialSymbol.get(key)
                            }
                            else{
                                this.properties.value += !this.properties.capsLock ? 
                                                            key.toUpperCase(): 
                                                            key.toLowerCase(); 
                            }
                        }
                        else{
                            this.properties.value += this.properties.capsLock ? 
                                                        key.toUpperCase(): 
                                                        key.toLowerCase(); 
                        }
                        this._triggerEvent("oninput");
                        this.textArea.focus();
                    });
                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak){
                fragment.appendChild(document.createElement("br"));
            }
        });

        return fragment;
    },

    _createSpecialSymbols(){
        const specialSymbol = {
            "1" : "!",
            "2" : "@",
            "3" : "#",
            "4" : "$",
            "5" : "%",
            "6" : "^",
            "7" : "&",
            "8" : "*",
            "9" : "(",
            "0" : ")",
            "," : "<",
            "." : ">",
            "?" : "/"
        };

        return new Map(Object.entries(specialSymbol));
    },


    _triggerEvent(handlerName){
        if(typeof this.eventHandlers[handlerName] == "function"){
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock(){
        this.properties.capsLock = !this.properties.capsLock;  

        this.elements.keys.forEach(key => {
            if(key.childElementCount === 0){
                if (this.properties.capsLock){
                    key.textContent = !this.properties.shift ?
                                        key.textContent.toUpperCase(): 
                                        key.textContent.toLowerCase();
                }
                else {
                    key.textContent = this.properties.shift ? 
                                        key.textContent.toUpperCase(): 
                                        key.textContent.toLowerCase(); 
                }
            }
        })
    },

    _toggleShift(){
        this.properties.shift = !this.properties.shift;

        this.elements.keys.forEach(key => {
            if(key.childElementCount === 0){
                if (this.properties.shift){
                    if (this.specialSymbol.has(key.textContent)){
                        key.textContent = this.specialSymbol.get(key.textContent)
                    }
                    else{
                        key.textContent = !this.properties.capsLock ? 
                                            key.textContent.toUpperCase(): 
                                            key.textContent.toLowerCase(); 
                    }
                }
                else{
                    let keySpecialSymbol = ([...this.specialSymbol].find(([, value]) => value === key.textContent) || [])[0];
                    if (keySpecialSymbol){
                        key.textContent = keySpecialSymbol;
                    }
                    else{
                        key.textContent = this.properties.capsLock ? 
                                            key.textContent.toUpperCase(): 
                                            key.textContent.toLowerCase(); 
                    }
                }
            }
        })
    },



    open(initialValue, oninput, onclose){
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
    },

    close(){
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden");
    }
}

window.addEventListener("DOMContentLoaded", () => Keyboard.init());