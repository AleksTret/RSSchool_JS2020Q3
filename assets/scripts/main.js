'use strict';

const gemPuzzle = {
    elements: {
        main: null,
        pieces: null
    },

    init(){
        this.sizeBoard = 16;
        this._createGameBoard(); 
    },

    _createGameBoard(){
        this.elements.main = document.createElement("div"); 
        this.elements.main.classList.add("keyboard");
        
        this.elements.pieces = document.createElement("div");
        this.elements.pieces.classList.add("keyboard__keys");
        this.elements.pieces.appendChild(this._createPieces());

        this.elements.main.appendChild(this.elements.pieces);

        this.elements.pieces.style.width = `${Math.sqrt(this.sizeBoard)*70 + Math.sqrt(this.sizeBoard)*2}px`;
    
        document.body.appendChild(this.elements.main);
    },

    _createPieces(){
        const fragment = document.createDocumentFragment();

        for (let index = 1; index < this.sizeBoard; index++){
            const keyElement = document.createElement("div");
            keyElement.classList.add("keyboard__key");
            keyElement.innerHTML = index;

            fragment.appendChild(keyElement);
        }

        return fragment;
    },
}

window.addEventListener("DOMContentLoaded", () => gemPuzzle.init());