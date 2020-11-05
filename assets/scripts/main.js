'use strict';

const gemPuzzle = {
    elements: {
        main: null,
        pieces: null
    },

    properties: {
        newGame: false,
    },

    init(){
        this.sizeBoard = 16;
        this.piecesInRow = Math.sqrt(this.sizeBoard);
        this.game = Array(this.sizeBoard);
        this._createGameBoard(); 
        this.step = 0;
        this.timerStart = Date.now();
    },

    _createGameBoard(){
        this.elements.main = document.createElement("div"); 
        this.elements.main.classList.add("keyboard");
        
        this.elements.pieces = document.createElement("div");
        this.elements.pieces.classList.add("keyboard__keys");

        if(this.properties.newGame){
            this._generateNewGame()
            this._saveGame();
        } 
        else{
            this._loadGame();
        } 

        this.elements.pieces.appendChild(this._createPieces());

        this.elements.main.appendChild(this.elements.pieces);

        this.elements.pieces.style.width = `${this.piecesInRow*70 + this.piecesInRow *2}px`;
    
        document.body.appendChild(this.elements.main);
    },

    refresh(){
        document.body.removeChild(this.elements.main);
        this._toggleNewGame();
        this.init();
        this._toggleNewGame();
    },

    _toggleNewGame(){
        this.properties.newGame = !this.properties.newGame;
    },

    _loadGame(){  
        if (localStorage.getItem('gem-puzzle')){
            this.game = JSON.parse(localStorage.getItem('gem-puzzle'));
        }
        else{
            this._generateNewGame();
        }
    },

    _generateNewGame(){
        let numbersInSimpleOrder = Array(this.sizeBoard - 1).fill(1).map((item, index) => item + index);
        let numberInRandomOrder = this._lloydsParity(numbersInSimpleOrder);

        this.game.length = 0;
        this.game = numberInRandomOrder.map((item, index) => {return {cellsNumber: index + 1, pieceNumber: item}});
        this.game.push({cellsNumber: this.game.length + 1, pieceNumber: -1})
    },

    _saveGame(){
        localStorage.setItem("gem-puzzle", JSON.stringify(this.game));
    },

    _createPieces(){
        const fragment = document.createDocumentFragment();

        this.game.forEach((item, index) => {
            const keyElement = document.createElement("div");

            keyElement.classList.add("keyboard__key");
            keyElement.style.order = index;
            keyElement.setAttribute("data-number", item.pieceNumber);

            // set the text value for a normal piece & and D&D events
            if(~item.pieceNumber){
                keyElement.innerHTML = item.pieceNumber;
                keyElement.setAttribute("draggable", "true");

                keyElement.addEventListener("dragstart", (event) => event.dataTransfer.setData("pieceNumber", event.target.dataset.number));
    
                // keyElement.addEventListener("drag", (event) => {
                //     //console.log(`element ${event.target.dataset.number} is dragging`);
                // });
    
                keyElement.addEventListener("dragend", () => {
                    let elements = document.querySelectorAll("[data-number]");
                    let hole;
                    elements.forEach(item => item.dataset.number == -1 && (hole = item));
                    hole.style.backgroundColor = "";
                });

                keyElement.addEventListener("click", (event)=> this._movePieces(event.target.innerHTML));        
            }
            // don't set text value for a hole & add D&D events
            else{
                keyElement.addEventListener("dragover", (event) => event.preventDefault());

                keyElement.addEventListener("dragenter", (event) => event.target.style.backgroundColor = "darkolivegreen");

                keyElement.addEventListener("dragleave", (event) => event.target.style.backgroundColor = "");

                keyElement.addEventListener("drop", (event) => this._movePieces(event.dataTransfer.getData("pieceNumber")));
            }            

            fragment.appendChild(keyElement);
        })

        return fragment;
    },

    _movePieces(piece){
        this.step++;
        this._swapPieces(piece);
        this._saveGame();
        this._checkWin();
    },

    _swapPieces(number){
        // get the current structure of div elements in the document, because it could have changed
        let elements = document.querySelectorAll("[data-number]");

        // get the clicked piece & hole
        let currentElement = undefined;
        let hole;
        elements.forEach(item => {
            if(item.dataset.number == number){
                currentElement = item;
            } 
            if(item.dataset.number == -1){
                hole = item;
            }
        });

        // get index the clicked piece in current game
        const elementInGame = this.game.find((item) => item.pieceNumber == number);
        const index = this.game.indexOf(elementInGame);

        // if hole to the right from the clicked piece
        if (this.game[index + 1]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.game[index], this.game[index + 1]);
        }

        // if hole to the left from the clicked piece
        if (this.game[index - 1]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.game[index], this.game[index - 1]);
        }

        // if hole to the down from the clicked piece
        if (this.game[index + this.piecesInRow]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.game[index], this.game[index + this.piecesInRow]);
        }

        // if hole to the top from the clicked piece
        if (this.game[index - this.piecesInRow]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.game[index], this.game[index - this.piecesInRow]);
        }
    },

    _checkWin(){
        const lastElement = this.game.length;
        const isWin = this.game.every(cell => {
            if (cell.cellsNumber == lastElement){
                return cell.pieceNumber == -1
            }           
            return cell.cellsNumber == cell.pieceNumber
        });


        if (isWin){
            console.log(isWin);
            console.log(this.step);
            let delta = Date.now() - this.timerStart;
            console.log(`${Math.floor(delta / 1000)}sec`);
        }

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

            const pairsCount = numberInRandomOrder.reduce((result, number, index, array) =>
                result + array.slice(index + 1)?.reduce((subResult, nexNumber) => (number > nexNumber) ? subResult + 1 : subResult, 0)            
                , 0);
            isOdd = pairsCount % 2;
        }while (isOdd)

        return numberInRandomOrder;
    }
}

const menu = {
    init(){
        const keyElement = document.createElement("button");
        keyElement.setAttribute("type", "button");
        keyElement.classList.add("keyboard__key");
        keyElement.innerHTML = "New game";
        keyElement.style.backgroundColor = "red";
        keyElement.addEventListener("click", () => gemPuzzle.refresh());
        document.body.appendChild(keyElement);
    }
}

window.addEventListener("DOMContentLoaded", () => menu.init());
window.addEventListener("DOMContentLoaded", () => gemPuzzle.init());
