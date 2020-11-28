'use strict';

const game = {
    _game:{
        startLevel : "1",
        completedLevels : null,
    },    

    async init(urlGameLevels){
        this._getPageElements();
        this._setListeners();
        this.levels = await this._loadLevels(urlGameLevels);
        const currentLevel = this._loadGame();
        this._createMenu(currentLevel);
        this._setLevel(currentLevel);
    },

    async _loadLevels(urlGameLevels){   
        const json = await this._loadJSON(urlGameLevels);
        return this._jsonToMap(json);
    },

    async _loadJSON(url){
        const response = await fetch(url);
        return await response.json();
    },

    _jsonToMap(json){
        const result = new Map();
    
        Object.entries(json).forEach((item) => {
            result.set(item[0], item[1]);
        })
        return result;
    },

    _getPageElements(){
        this._getTaskElements();
        this._getCodeAreaElements();
        this._getTableElements();
        this._getMenuElements();
    },

    _getTaskElements(){
        this.task = document.getElementById("task");
        this.taskLevel = document.getElementById("taskLevel");
        this.taskName = document.getElementById("taskName");
        this.taskDescription = document.getElementById("taskDescription");
        this.taskSyntax = document.getElementById("taskSyntax");
        this.taskHint = document.getElementById("taskHint");
        this.taskExamples = document.getElementById("taskExamples");
    },

    _getTableElements(){
        this.table = document.getElementById("table");
    },

    _getCodeAreaElements(){
        this.codeArea = document.getElementById("codeArea");
        this.inputCss = document.getElementById("inputCss");
        this.buttonEnter = document.getElementById("buttonEnter");
    },

    _setListeners(){
        this.inputCss.addEventListener("keydown", (event) => {
            event.key == "Enter" && this._checkWin(event.target.value);
        });

        this.buttonEnter.addEventListener("click", () => {
            this._checkWin(this.inputCss.value);
        });
    },

    _checkWin(solution){
        console.log("enter _ckeckWin");
        if (this.answer == solution) {
            this.elementAnimated.forEach(item => item.classList.toggle("animated"));

            const elementA = document.querySelector(".current");
            elementA?.querySelector(".check-mark").classList.add("done");
    
            const currentLevel = elementA?.querySelector(".level-number").innerHTML;
            const nextLevel = +currentLevel + 1;
    
            elementA.classList.remove("current");
            elementA.nextSibling?.classList.add("current");
           
            this._saveGame(currentLevel);
    
            setTimeout(() => this._setLevel(nextLevel), 1000); 
        }
    },

    _getMenuElements(){
        this.menu = document.getElementsByClassName("levels")[0];
    },

    _createMenu(currentLevel){
        const fragment = document.createDocumentFragment();

        this.levels.forEach(level => {
            const done = this._game.completedLevels.get(level.level)?.done;
            fragment.appendChild(this._createMenuLink(level.level, level.name, currentLevel, done));
        });

        this.menu.appendChild(fragment);
    },

    _createMenuLink(level, nameLevel, currentLevel, done){
        // create
        // <a><span class="check-mark"></span><span class="level-number">level number</span><span>level name text</span></a>

        const fragment = document.createDocumentFragment();
        const a = document.createElement("a");
        (level == currentLevel) && a.classList.add("current");

        a.appendChild(this._createSpanElement("check-mark", null, done));
        a.appendChild(this._createSpanElement("level-number", level));
        a.appendChild(this._createSpanElement(null, nameLevel));

        a.addEventListener('click', () => {
            document.getElementsByClassName("current")[0]?.classList.remove("current");
            
            a.classList.add("current");

            this._setLevel(level)
        });
        
        fragment.appendChild(a);

        return fragment;
    },

    _createSpanElement(className, text, done){
        const result = document.createElement("span");
        className && result.classList.add(className);
        text && (result.innerHTML = text);
        done && (result.classList.add("done"));
        return result;
    },

    _setLevel(levelNumber){
        const currentLevel = this.levels.has(levelNumber.toString()) ? levelNumber.toString() : this._game.startLevel;
        this._removeChild(this.table);
        this._removeChild(this.taskExamples);
        this._createLevel(this.levels.get(currentLevel));
        this.answer = this.levels.get(currentLevel).answer;
    },

    _createLevel(task){
        // fill menu element
        this.taskLevel.innerHTML = `Level ${task.level} of ${this.levels.size}`;
        this.taskName.innerHTML = task.name;
        this.taskDescription.innerHTML = task.description;
        this.taskSyntax.innerHTML = task.syntax;
        this.taskHint.innerHTML = task.hint;
        this.taskExamples.appendChild(this._createExamples(task.examples));

        // fill code area
        this.codeArea.innerHTML = this._createCodeArea(task.markup);

        // create elements on the table
        this.table.appendChild(this._createElementOnTable(task.markup));
    },

    _createPlate(plate){
        const result =  document.createElement("div");
        result.classList.add("plate");
        plate.name.includes("fancy") && result.classList.add("fancy");
        return result;
    },

    _createElementOnTable(markup){
        const result = document.createDocumentFragment();
        this.elementAnimated = new Array();
        markup.forEach(item => {
            if(item.name.includes("plate")){
                const element = this._createPlate(item);
                result.appendChild(element);
                JSON.parse(item.animated) && this.elementAnimated.push(element);
            }             
        });
        return result;
    },

    _createCodeArea(markup){
        let result = '&lt;div class="table"&gt;<br>';
        markup.forEach(item => {
            result += `&nbsp;&nbsp;&nbsp;&lt;${item.name}/&gt;<br>`;
        });
        result += '&lt;/div&gt;';
        return result;
    },

    _createExamples(examples){
        const fragment = document.createDocumentFragment();
        examples.forEach(item => {
            const element = document.createElement("div");
            element.classList.add("example");
            element.innerHTML = item;
            fragment.appendChild(element) 
        });
        return fragment;
    },

    _removeChild(element){
        while (element.firstChild){
            element.removeChild(element.firstChild);
        }
    },

    _saveGame(level){
        localStorage.setItem("currentLevel", level);

        this._game.completedLevels.set(level, {done : true});

        localStorage.setItem("completedLevels", JSON.stringify([...this._game.completedLevels]));        
    },

    _loadGame(){
        this._game.completedLevels = this._initCompletedLevel(localStorage.getItem("completedLevels"));

        const result = localStorage.getItem("currentLevel");
        
        return (result && (+result < this.levels.size) ? +result + 1 : this._game.startLevel);
    },

    _initCompletedLevel(jsonString){
        if (jsonString){
            return new Map(JSON.parse(jsonString));
        }else {
            return new Map();
        }
    },
}

const urlGameLevels = "assets/json/levels.json";

window.addEventListener("DOMContentLoaded",  () => game.init(urlGameLevels));