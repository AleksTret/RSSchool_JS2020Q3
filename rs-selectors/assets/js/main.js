'use strict';

const game = {
    async init(urlGameLevels){
        this._getPageElements();
        this.levels = await this._loadLevels(urlGameLevels);
        this._createMenu();
        this._setLevel(1);
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
        let result = new Map();
    
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
    },

    _getMenuElements(){
        this.menu = document.getElementsByClassName("levels")[0];
    },

    _createMenu(){
        const fragment = document.createDocumentFragment();

        this.levels.forEach(level => {
            fragment.appendChild(this._createMenuLink(level.level, level.name));
        });

        this.menu.appendChild(fragment);
    },

    _createMenuLink(level, nameLevel){
        // create
        // <a><span class="check-mark"></span><span class="level-number">level number</span><span>level name text</span></a>

        const fragment = document.createDocumentFragment();
        const a = document.createElement("a");

        const firstSpan = document.createElement("span");
        firstSpan.classList.add("check-mark");
        const secondSpan = document.createElement("span");
        secondSpan.classList.add("level-number");
        secondSpan.innerHTML = level;
        const thirdSpan = document.createElement("span");
        thirdSpan.innerHTML = nameLevel;

        a.appendChild(firstSpan);
        a.appendChild(secondSpan);
        a.appendChild(thirdSpan);

        a.addEventListener('click', () => this._setLevel(level));
        
        fragment.appendChild(a);

        return fragment;
    },

    _setLevel(levelNumber){
        this._removeChild(this.table);
        this._removeChild(this.taskExamples);
        this._createLevel(this.levels.get(levelNumber.toString()));
    },

    _createLevel(task){
        // fill menu element
        this.taskLevel.innerHTML = `Level ${task.level} of 15`;
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
        plate.includes("fancy") && result.classList.add("fancy");
        return result;
    },

    _createElementOnTable(markup){
        const result = document.createDocumentFragment();
        markup.forEach(item => {
            if(item.includes("plate")){
                result.appendChild(this._createPlate(item));
            }; 
        });
        return result;
    },

    _createCodeArea(markup){
        let result = '&lt;div class="table"&gt;<br>';
        markup.forEach(item => {
            result += `&nbsp;&nbsp;&nbsp;&lt;${item}/&gt;<br>`;
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
        if (element.childNodes.length){
            while (element.firstChild){
                element.removeChild(element.firstChild);
            }
        }
    },
}

const urlGameLevels = "assets/json/levels.json";

window.addEventListener("DOMContentLoaded",  () => game.init(urlGameLevels));