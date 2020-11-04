'use strict';

const gemPuzzle = {
    elements: {
        main: null,
        pieces: null
    },

    init(){
        this.sizeBoard = 16;
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

        let numbersInSimpleOrder = Array(this.sizeBoard - 1).fill(1).map((item, index) => item + index);
        let numberInRandomOrder = this._lloydsParity(numbersInSimpleOrder); 

        for (let index = 1; index < this.sizeBoard; index++){
            const keyElement = document.createElement("div");
            keyElement.classList.add("keyboard__key");
            keyElement.innerHTML = numberInRandomOrder[index - 1];
            keyElement.style.order = index;
            keyElement.setAttribute("data-number", numberInRandomOrder[index - 1]);

            this.cells[index-1] = {cellsNumber: index, pieceNumber: numberInRandomOrder[index - 1]};

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
    },
    
    _shuffleArray(array){
        return array
            .map(function(elem,index) { return [elem, Math.random()]})
            .sort(function(a,b){ return a[1] - b[1]})
            .map(function(elem){return elem[0]});
    },

    _lloydsParity(inputArray){
        let isOdd = true;
        let numberInRandomOrder;
        do{
            numberInRandomOrder = this._shuffleArray(inputArray);

 

            let pairsCount = numberInRandomOrder.reduce((result, number, index, array) =>{
                //console.log(array.slice(index + 1));
                let temp = array.slice(index + 1)?.reduce((subResult, nexNumber) => {
                    if (number > nexNumber){
                        return subResult + 1;
                    }
                    return subResult;
                    //number > nexNumber ? subResult + 1 : subResult
                }, 0); 
                return result + temp;
               
            }, 0);
            console.log(pairsCount);
            isOdd = pairsCount % 2;
        }while (isOdd)
        console.log(numberInRandomOrder);
        return numberInRandomOrder;
    }
}

window.addEventListener("DOMContentLoaded", () => gemPuzzle.init());