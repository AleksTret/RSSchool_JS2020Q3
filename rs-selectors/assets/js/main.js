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

    _getMenuElements(){
        this.menu = document.getElementsByClassName("levels")[0];
        this.buttonReset = document.getElementById("buttonReset");
        this.burgerCheckbox = document.getElementById("burger-checkbox");
    },

    _setListeners(){
        this.inputCss.addEventListener("keydown", (event) => {
            event.key == "Enter" && this._checkWin(event.target.value);
        });

        this.buttonEnter.addEventListener("click", () => {
            this._checkWin(this.inputCss.value);
        });

        this.buttonReset.addEventListener("click", () => {
            this._resetGame();
        });
    },

    _resetGame(){
        this._clearLocalStorage();
        this._resetMenu();
        this._setLevel(this._game.startLevel);
    },

    _resetMenu(){
        document.getElementsByClassName("current")[0].classList.remove("current");
        const marks = document.getElementsByClassName("done");
        for (let mark of marks){
            mark.classList.remove("done");
        }

        document.getElementsByClassName("levels")[0].firstChild.classList.add("current");

        this.inputCss.value = "";

        this.burgerCheckbox.checked = false;
    },

    _clearLocalStorage(){
        localStorage.removeItem("currentLevel");
        localStorage.removeItem("completedLevels");
    },

    _checkWin(solution){
        if (this.answer == solution) {         
            const currentLevel = this._animateChangeLevel();
            const nextLevel = (+currentLevel + 1).toString();

            this._saveGame(currentLevel);

            setTimeout(() => this._setLevel(nextLevel), 1000); 
        }
    },

    _animateChangeLevel(){
        const animatedElement = document.getElementsByClassName("animated");
        for (let element of animatedElement){
            element.classList.toggle("getOut");
        }

        const menuLinkElement = document.querySelector(".current");
        menuLinkElement?.querySelector(".check-mark").classList.add("done");
        menuLinkElement?.classList.remove("current");
        menuLinkElement?.nextSibling?.classList.add("current");

        this.inputCss.value = "";

        const currentLevel = menuLinkElement?.querySelector(".level-number").innerHTML;
        return currentLevel;
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
        const currentLevel = this.levels.has(levelNumber?.toString()) ? levelNumber.toString() : this._game.startLevel;
        this._removeChild(this.table);
        this._removeChild(this.taskExamples);
        this._removeChild(this.codeArea);
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
        this.codeArea.appendChild(this._createCodeArea(task.markup));

        // create elements on the table
        this.table.appendChild(this._createElementOnTable(task.markup));
    },

    _createOneElementOnTable(element){
        const fragment = document.createDocumentFragment();

        const classes = [];
        element.name.includes("plate") && classes.push("plate");
        element.name.includes("fancy") && classes.push("fancy");
        JSON.parse(element.animated) && classes.push("animated")

        const result = this._createDiv(classes);
        result.appendChild(this._createDiv(["hint"], `&lt;${element.name}/&gt;`));

        fragment.appendChild(result);

        return fragment;
    },

    _createElementOnTable(markup){
        const result = document.createDocumentFragment();
        this.elementAnimated = new Array();
        markup.forEach(element => {
            result.appendChild(this._createOneElementOnTable(element));       
        });
        return result;
    },

    _createCodeArea(markup){
        const fragment = document.createDocumentFragment();

        fragment.appendChild(this._createDiv([], '&lt;div class="table"&gt;'));

        markup.forEach((item, index) => {
            const temp = this._createDiv(["highlight"], `&lt;${item.name}/&gt;`, 3);
            temp.addEventListener("mouseenter", () => this.table.getElementsByClassName("hint")[index].classList.toggle("show"));
            temp.addEventListener("mouseleave", () => this.table.getElementsByClassName("hint")[index].classList.toggle("show"));
            fragment.appendChild(temp);
        });

        fragment.appendChild(this._createDiv([], '&lt;/div&gt;'));

        return fragment;
    },

    _createDiv(classesName, content, whitespace = 0){
        const result = document.createElement("div");
        Array.isArray(classesName) && classesName.length && result.classList.add(...classesName);
        content && (result.innerHTML = `${'&nbsp;'.repeat(whitespace)}${content}`);
        return result;
    },

    _createExamples(examples){
        const fragment = document.createDocumentFragment();
        examples.forEach(item => {
            fragment.appendChild(this._createDiv(["example"], item));
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
        return (jsonString ? new Map(JSON.parse(jsonString)) : new Map());
    },
}

const urlGameLevels = "assets/json/levels.json";

window.addEventListener("DOMContentLoaded",  () => game.init(urlGameLevels));