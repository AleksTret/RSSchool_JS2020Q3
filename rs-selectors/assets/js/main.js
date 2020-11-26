'use strict';

const game = {
    async init(urlGameLevels){
        this._initPageElement();
        this.levels = await this._loadLevels(urlGameLevels);
        this._createLevel(this.levels.get("2"));
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

    _initPageElement(){
        this._getMenuElement();
        this._getCodeAreaElement();
        this._getTableElement();
    },

    _getMenuElement(){
        this.task = document.getElementById("task");
        this.taskLevel = document.getElementById("taskLevel");
        this.taskName = document.getElementById("taskName");
        this.taskDescription = document.getElementById("taskDescription");
        this.taskSyntax = document.getElementById("taskSyntax");
        this.taskHint = document.getElementById("taskHint");
        this.taskExamples = document.getElementById("taskExamples");
    },

    _getTableElement(){
        this.table = document.getElementById("table");
    },

    _getCodeAreaElement(){
        this.codeArea = document.getElementById("codeArea");
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
        const result = document.createDocumentFragment();
        examples.forEach(item => {
            const element = document.createElement("div");
            element.classList.add("example");
            element.innerHTML = item;
            result.appendChild(element) 
        });
        return result;
    }
}

const urlGameLevels = "assets/json/levels.json";

window.addEventListener("DOMContentLoaded",  () => game.init(urlGameLevels));