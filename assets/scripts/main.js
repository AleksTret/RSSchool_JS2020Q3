'use strict';

const gemPuzzle = {
    elements: {
        main: null,
        pieces: null
    },

    init(){
        this.sizeBoard = 64;
        this.piecesInRow = Math.sqrt(this.sizeBoard);
        this.cells = Array(this.sizeBoard);
        this._createGameBoard(); 
    },

    _createGameBoard(){
        this.elements.main = document.createElement("div"); 
        this.elements.main.classList.add("keyboard");
        
        this.elements.pieces = document.createElement("div");
        this.elements.pieces.classList.add("keyboard__keys");
        this.elements.pieces.appendChild(this._createPieces());

        this.elements.main.appendChild(this.elements.pieces);

        this.elements.pieces.style.width = `${this.piecesInRow*70 + this.piecesInRow *2}px`;
    
        document.body.appendChild(this.elements.main);
    },

    _createPieces(){
        const fragment = document.createDocumentFragment();

        for (let index = 1; index < this.sizeBoard; index++){
            const keyElement = document.createElement("div");
            keyElement.classList.add("keyboard__key");
            keyElement.innerHTML = index;
            keyElement.style.order = index;
            keyElement.setAttribute("data-number", index);

            this.cells[index-1] = {cellsNumber: index, pieceNumber: index};

            keyElement.addEventListener("click", (event)=> {
                this._onClick(event);                    
            });

            fragment.appendChild(keyElement);
        }

        this.cells[this.sizeBoard-1] = {cellsNumber: this.sizeBoard, pieceNumber: -1};
        const keyElement = document.createElement("div");
        keyElement.classList.add("keyboard__key");
        keyElement.style.order = this.sizeBoard;
        keyElement.setAttribute("data-number", -1);
        fragment.appendChild(keyElement);

        return fragment;
    },

    _onClick(event){
        this._movePieces(event.target.innerHTML);
        this._checkWin();
    },

    _movePieces(number){
        let elements = document.querySelectorAll("[data-number]");

        let currentElement = undefined;
        const hole = elements[elements.length - 1];
        elements.forEach(item => item.dataset.number == number && (currentElement = item));

        const currentPosition = this.cells.find((cell) => cell.pieceNumber == number);
        const index = this.cells.indexOf(currentPosition);

        if (this.cells[index + 1]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.cells[index], this.cells[index + 1]);
        }
        if (this.cells[index - 1]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.cells[index], this.cells[index - 1]);
        }
        if (this.cells[index + this.piecesInRow]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.cells[index], this.cells[index + this.piecesInRow]);
        }
        if (this.cells[index - this.piecesInRow]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.cells[index], this.cells[index - this.piecesInRow]);
        }
    },

    _checkWin(){
        const lastElement = this.cells.length;
        const isWin = this.cells.every(cell => {
            if (cell.cellsNumber == lastElement){
                return cell.pieceNumber == -1
            }           
            return cell.cellsNumber == cell.pieceNumber
        });
        console.log(isWin);
    },

    _swapStyleOrder(firstElement, secondElement){
        const temp = firstElement.style.order;
        firstElement.style.order = secondElement.style.order;
        secondElement.style.order = temp;
    },

    _swapArrayPosition(firstElement, secondElement){
        const temp = firstElement.pieceNumber;
        firstElement.pieceNumber = secondElement.pieceNumber;
        secondElement.pieceNumber = temp;
    }
}

window.addEventListener("DOMContentLoaded", () => gemPuzzle.init());