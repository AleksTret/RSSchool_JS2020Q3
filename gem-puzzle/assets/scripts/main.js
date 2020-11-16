'use strict';

const gemPuzzle = {
    elements: {
        main: null,
        pieces: null
    },

    properties: {
        newGame: false,
        sound: false,
        newStopwatch: true,
    },

    async init(sizeBoard){
        this._getMenuElements();
        this._createGameBoard(sizeBoard); 
        this.counter = 0;
        await this._loadHoF("assets/json/HoF.json");
        return this.elements.main;
    },

    _getMenuElements(){
        this.stopwatchElementInMenu = document.getElementById("stopwatch");
        this.counterElementInMenu = document.getElementById("counter")
        this._initMenuElement();
    },

    _initMenuElement(){
        this._stopStopwatch();
        this.stopwatchElementInMenu.value = "00:00:00:00";
        this.counterElementInMenu.value = "0";
    },

    _startStopwatch(){
        this.storageStopwatchForHoF = 0;

        this.stopwatchStartTime =  this.properties.newGame ? new Date() : this._restoreStopwatch();

        this._toggleStopwatch();

        this._redrawTime();        
    },

    _restoreStopwatch(){
        let now = new Date();
        let temp = this.stopwatchElementInMenu.value.split(":");

        now.setHours(now.getHours() - temp[0], now.getMinutes() - temp[1], now.getSeconds() - temp[2], now.getMilliseconds() - temp[3]);

        return now;
    },

    _stopStopwatch(){
        clearTimeout(this.stopwatchIdTimer);
        return true;
    },

    _redrawTime() {
        let now = new Date();

        let diff = now.getTime() - this.stopwatchStartTime.getTime();

        let milliseconds = diff % 1000;
        diff -= milliseconds;
        milliseconds = Math.floor(milliseconds/10);
        
        diff = Math.floor(diff / 1000);
        let seconds = diff % 60;
        diff -= seconds;

        diff = Math.floor(diff / 60);
        let minutes = diff % 60;
        diff -= minutes;

        diff = Math.floor(diff / 60);
        let hours = diff % 60;

        let result = `${this._addZero(hours)}:${this._addZero(minutes)}:${this._addZero(seconds)}:${this._addZero(milliseconds)}`;

        this.stopwatchElementInMenu.value = result;
        localStorage.setItem("gem-puzzle_stopwatch", result);
        this.storageStopwatchForHoF = result;

        this.stopwatchIdTimer =  setTimeout(() => this._redrawTime(), 10);
    },

    _addZero(number){
        return parseInt(number, 10) < 10 ? `0${number}` : number;
    },

    _createGameBoard(sizeBoard){
        this.sizeBoard = sizeBoard;
        this.piecesInRow = Math.sqrt(this.sizeBoard);
        this.game = Array(this.sizeBoard);

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
    },

    refresh(sizeBoard){
        this._removeChild();
        !this.properties.newGame && this._toggleNewGame();
        !this.properties.newStopwatch && this._toggleStopwatch();
        this._clearLocalStorage();
        this._initMenuElement();
        return  this.init(sizeBoard);
    },

    _removeChild(){
        while (this.elements.main.firstChild) {
            this.elements.main.removeChild(this.elements.main.firstChild);
        }
    },

    _clearLocalStorage(){
        localStorage.removeItem("gem-puzzle");
        localStorage.removeItem("gem-puzzle_counter");
        localStorage.removeItem("gem-puzzle_stopwatch");
    },

    _toggleNewGame(){
        this.properties.newGame = !this.properties.newGame;
    },

    _loadGame(){  
        if (localStorage.getItem('gem-puzzle')){
            this.game = JSON.parse(localStorage.getItem('gem-puzzle'));
            this.sizeBoard = this.game.length;
            this.piecesInRow = Math.sqrt(this.sizeBoard);
            
            this.stopwatchElementInMenu.value = localStorage.getItem("gem-puzzle_stopwatch");
            this.counter = localStorage.getItem("gem-puzzle_counter");
            this.counterElementInMenu.value = this.counter;
        }
        else{
            this._generateNewGame();
        }
    },

    _toggleStopwatch(){
        this.properties.newStopwatch = !this.properties.newStopwatch;
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
        localStorage.setItem("gem-puzzle_counter", this.counter);
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
        this._swapPieces(piece) &&  this._increaseCounter() && this.properties.newStopwatch && this._startStopwatch();
        this._saveGame();
        this._checkWin();
    },

    _increaseCounter(){
        !this.properties.newGame && (this.counter = this.counterElementInMenu.value);
        this.counterElementInMenu.value = ++this.counter;
        return true;
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
            this.properties.sound && this._soundClick();
            return true;
        }

        // if hole to the left from the clicked piece
        if (this.game[index - 1]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.game[index], this.game[index - 1]);
            this.properties.sound && this._soundClick();
            return true;
        }

        // if hole to the down from the clicked piece
        if (this.game[index + this.piecesInRow]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.game[index], this.game[index + this.piecesInRow]);
            this.properties.sound && this._soundClick();
            return true;
        }

        // if hole to the top from the clicked piece
        if (this.game[index - this.piecesInRow]?.pieceNumber == -1){
            this._swapStyleOrder(currentElement, hole);
            this._swapArrayPosition(this.game[index], this.game[index - this.piecesInRow]);
            this.properties.sound && this._soundClick();
            return true;
        }
        return false;
    },

    _checkWin(){
        const lastElement = this.game.length;
        const isWin = this.game.every(cell => {
            if (cell.cellsNumber == lastElement){
                return cell.pieceNumber == -1
            }           
            return cell.cellsNumber == cell.pieceNumber
        });

        isWin && this._stopStopwatch() && this._saveHoF();
    },

    _saveHoF(){
        const result = {
            name: "player name",
            counter: `${this.counter}`,
            stopwatch: this.storageStopwatchForHoF,
        }

        // sorry for that magic const, but we save only the 10 best result
        let position = 11;
        this.HoF.get(this.sizeBoard)?.forEach((value, key) => 
            +result.counter < +value.counter && +key < +position && (position = key)
        ); 


        if (position < 11){
            let subMap = this.HoF.get(`${this.sizeBoard}`);

            let newSubMap = this._insertAtMap(position - 1 , position, result, subMap);

            this.HoF.set(`${this.sizeBoard}`, newSubMap);
        }

        let jsonObject = {};  
        this.HoF.forEach((value, key) => { 
                let subObject = {};
                value.forEach((subValue, subKey) => subObject[subKey] = subValue)
            jsonObject[key] = subObject  
        }); 

        localStorage.setItem("gem-puzzle_HoF", JSON.stringify(jsonObject));
    },

    _insertAtMap(index, key, value, map){
        let temp = Array.from(map);

        temp.splice(index, 0, [`${key}`, value]);
        temp.length = 10;

        temp.forEach((item, index) => {
            item[0] = index + 1;
        })

        return new Map(temp);
    },

    async _loadHoF(url){
        let json = localStorage.getItem("gem-puzzle_HoF");

        if (!json) {
            const response = await fetch(url);
            json =  await response.json();

            localStorage.setItem("gem-puzzle_HoF", JSON.stringify(json));

            this.HoF = this._jsonToMapMap(json);
        }
        else{
            this.HoF = this._jsonToMapMap(JSON.parse(json));
        }        
    },

    _jsonToMapMap(json){
        let result = new Map();
    
        const temp = new Map(Object.entries(json));

        temp.forEach((value, key) => {
            result.set(key, new Map(Object.entries(value)));
        })
        return result;
    },

    async _createKeyLayout(keyboardLayouts){
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

        this._createRegularExpression();
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
    },

    toggleSound(event){
        this.properties.sound = !this.properties.sound;
        event.target.classList.toggle("keyboard__key--active", this.properties.sound);
    },

    _soundClick(){
        let urlSoundFile = `assets/sounds/click.mp3`;     
        let audio = new Audio(urlSoundFile);
        audio.play();
    },
}

const menu = {
    properties:{
        HoF: false,
    },

    _toggleHoF(){
        this.properties.HoF = !this.properties.HoF;
    },

    _fillUpHoF(){
        this.HoF = this._getHoF();
    
        const fragment = new DocumentFragment();

        this.HoF.get(`${this.sizeBoard}`).forEach((value, key) => {
            const row = document.createElement("div");
            row.classList.add("HoF__row");

            const position = document.createElement("span");
            position.innerHTML = key;

            const name = document.createElement("span");
            name.innerHTML = value.name;

            const counter = document.createElement("span");
            counter.innerHTML = value.counter;

            const stopwatch = document.createElement("span");
            stopwatch.innerHTML = value.stopwatch;

            row.appendChild(position);
            row.appendChild(name);
            row.appendChild(counter);
            row.appendChild(stopwatch);

            fragment.appendChild(row);
        });

        this.wrapperHoF.appendChild(fragment);
    }, 

    _clearHoF(){
        while (this.wrapperHoF.firstChild) {
            this.wrapperHoF.removeChild(this.wrapperHoF.firstChild);
        }
    },

    _getHoF(){
        let result = undefined;
        let json = localStorage.getItem("gem-puzzle_HoF");
        json && (result = this._jsonToMapMap(JSON.parse(json)));
        return result;
    },

    _jsonToMapMap(json){
        let result = new Map();
    
        const temp = new Map(Object.entries(json));

        temp.forEach((value, key) => {
            result.set(key, new Map(Object.entries(value)));
        })
        return result;
    },

    init(){
        this.sizeBoard = 16;

        this.menu = document.createElement("div"); 
        this.menu.classList.add("keyboard");

        const keyElement = document.createElement("button");
        keyElement.setAttribute("type", "button");
        keyElement.classList.add("keyboard__key");
        keyElement.innerHTML = "New game";
        keyElement.style.backgroundColor = "red";
        keyElement.addEventListener("click", async () => {
            wrapper.elements.main.appendChild(await gemPuzzle.refresh(this.sizeBoard));
        });

        const keySound = document.createElement("button");
        keySound.setAttribute("type", "button");
        keySound.classList.add("keyboard__key", "keyboard__key--activatable");
        keySound.innerHTML = "sound";
        keySound.style.backgroundColor = "red";
        keySound.addEventListener("click", (event) => gemPuzzle.toggleSound(event));

        const keyHoF = document.createElement("button");
        keyHoF.setAttribute("type", "button");
        keyHoF.classList.add("keyboard__key");
        keyHoF.innerHTML = "Hall of Frame";
        keyHoF.style.backgroundColor = "red";
        keyHoF.addEventListener("click", () => {
            this.wrapperHoF.classList.toggle("wrapper__HoF-hidden", this.properties.HoF);
            this._toggleHoF();
            this.properties.HoF ? this._fillUpHoF() : this._clearHoF();
        });

        const stopwatch = document.createElement("input");
        stopwatch.setAttribute("value", "00:00:00.00");
        stopwatch.setAttribute("id", "stopwatch");
        stopwatch.setAttribute("size", "12");
        stopwatch.setAttribute("maxlength", "12");

        const counter = document.createElement("input");
        counter.setAttribute("value", "0");
        counter.setAttribute("id", "counter");
        counter.setAttribute("size", "12");
        counter.setAttribute("maxlength", "12");

        const select = document.createElement("select");
        select.setAttribute("id", "board_size");
        select.options[0] = new Option("3x3", "9");
        select.options[1] = new Option("4x4", "16");
        select.options[2] = new Option("5x5", "25");  
        select.options[3] = new Option("6x6", "36");  
        select.options[4] = new Option("7x7", "49");  
        select.options[5] = new Option("8x8", "64");          
        select.options[1].selected=true;      
        select.addEventListener("change", (event) => this.sizeBoard = event.target.value);

        this.wrapperHoF = document.createElement("div");
        this.wrapperHoF.classList.add("wrapper__HoF", "wrapper__HoF-hidden");

        this.menu.appendChild(keyElement);
        this.menu.appendChild(keySound);
        this.menu.appendChild(keyHoF);
        this.menu.appendChild(stopwatch);
        this.menu.appendChild(counter);
        this.menu.appendChild(select);
        this.menu.appendChild(this.wrapperHoF);

        return this.menu;
    }
}

const wrapper = {
    elements:{
        main: null
    },

    init(){
        this.elements.main = document.createElement("div");
        this.elements.main.classList.add("wrapper");
        this.elements.main.setAttribute("id", "wrapper__id");
        this.elements.main.appendChild(menu.init());
        
        document.body.appendChild(this.elements.main);   
        
        this._addChild(); 
    },

    async _addChild(){
        let puzzle = await gemPuzzle.init(16);

        this.elements.main.appendChild(puzzle);
    }
}

window.addEventListener("DOMContentLoaded",  () => wrapper.init());