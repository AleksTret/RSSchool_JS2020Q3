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
        this.gameTitle = document.getElementById("gameTast");
    },

    _getTaskElements(){
        this.task = document.getElementById("task");
        this.taskLevel = document.getElementById("taskLevel");
        this.taskName = document.getElementById("taskName");
        this.taskDescription = document.getElementById("taskDescription");
        this.taskSyntax = document.getElementById("taskSyntax");
        this.taskHint = document.getElementById("taskHint");
        this.taskExamples = document.getElementById("taskExamples");
        this.buttonHelp = document.getElementById("buttonHelp");
    },

    _getTableElements(){
        this.table = document.getElementById("table");
    },

    _getCodeAreaElements(){
        this.editor = document.getElementById("editor");
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

        this.buttonHelp.addEventListener("click", () => {
            this._showAnswer();
        })
    },

    _resetGame(){
        this._clearLocalStorage();
        this._resetMenu();
        this._setLevel(this._game.startLevel);
    },

    _resetMenu(){
        const marks = document.querySelectorAll("a > span:first-child");
        for (let mark of marks){
            mark.classList.remove("mark-red");
            mark.classList.remove("mark-green");
        }

        document.getElementsByClassName("current")[0]?.classList.remove("current");

        document.getElementsByClassName("levels")[0].firstChild.classList.add("current");

        this.inputCss.value = "";

        this.burgerCheckbox.checked = false;
    },

    _showAnswer(){
        const timeout = 200;
        this._printText(this.answer[0], 0, "", timeout);
        setTimeout(() => {
            const currentLevel = this._animateChangeLevel(false);
            const nextLevel = (+currentLevel + 1).toString();
    
            this._saveGame(currentLevel, true);
            
            setTimeout(() => this._setLevel(nextLevel), 500); 
        }, timeout * (this.answer[0].length + 4));
    },

    _printText(answer, counter, output, timeout){
        let timerId = setInterval(() => {
            output += answer[counter++];
            this.inputCss.value = output;

            if(counter == answer.length){
                clearTimeout(timerId);
            }
        }, timeout);
    },

    _clearLocalStorage(){
        localStorage.removeItem("currentLevel");
        localStorage.removeItem("completedLevels");
    },

    _checkWin(solution){
        if (~this.answer.indexOf(solution)) {         
            const currentLevel = this._animateChangeLevel(true);
            const nextLevel = (+currentLevel + 1).toString();

            this._saveGame(currentLevel, false);

            setTimeout(() => this._setLevel(nextLevel), 500); 
        }
        else{
            this.editor.classList.toggle("tremble");
            setTimeout(()=> this.editor.classList.toggle("tremble"), 500);
        }
    },

    _animateChangeLevel(done){
        const animatedElement = document.querySelectorAll(".element_dancer");
        for (let element of animatedElement){
            element.classList.add("element_takeoff");
        }

        const menuLinkElement = document.querySelector(".current");
        const markColor = done ? "mark-green" : "mark-red";
        menuLinkElement?.querySelector(".check-mark").classList.add(markColor);
        menuLinkElement?.classList.remove("current");
        menuLinkElement?.nextSibling?.classList.add("current");

        const currentLevel = menuLinkElement?.querySelector(".level-number").innerHTML;

        this.inputCss.value = "";

        return currentLevel;
    },

    _createMenu(currentLevel){
        const fragment = document.createDocumentFragment();

        this.levels.forEach(level => {
            const done = this._game.completedLevels.get(level.level)?.done;
            const withHelp = this._game.completedLevels.get(level.level)?.withHelp;
            fragment.appendChild(this._createMenuLink(level.level, level.name, currentLevel, done, withHelp));
        });

        this.menu.appendChild(fragment);
    },

    _createMenuLink(level, nameLevel, currentLevel, done, withHelp){
        // create
        // <a><span class="check-mark"></span><span class="level-number">level number</span><span>level name text</span></a>

        const fragment = document.createDocumentFragment();
        const a = document.createElement("a");
        (level == currentLevel) && a.classList.add("current");

        a.appendChild(this._createSpanElement("check-mark", null, done, withHelp));
        a.appendChild(this._createSpanElement("level-number", level));
        a.appendChild(this._createSpanElement(null, nameLevel));

        a.addEventListener('click', () => {
            document.getElementsByClassName("current")[0]?.classList.remove("current");
            
            a.classList.add("current");
            this.burgerCheckbox.checked = false;

            this._setLevel(level);
        });
        
        fragment.appendChild(a);

        return fragment;
    },

    _createSpanElement(className, text, done, withHelp){
        const result = document.createElement("span");
        className && result.classList.add(className);
        text && (result.innerHTML = text);
        
        const markColor = withHelp ? "mark-red" : "mark-green";
        done && (result.classList.add(markColor));

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
        // fill the title
        this.gameTitle.innerHTML = task.title;

        // fill menu's elements
        this.taskLevel.innerHTML = `Level ${task.level} of ${this.levels.size}`;
        this.taskName.innerHTML = task.name;
        this.taskDescription.innerHTML = task.description;
        this.taskSyntax.innerHTML = task.syntax;
        this.taskHint.innerHTML = task.hint;
        this.taskExamples.appendChild(this._createExamples(task.examples));

        // fill the code area
        this.codeArea.appendChild(this._createCodeArea(task.markup));

        this.notes = this._createDiv(["notes"]);
        this.table.appendChild(this.notes);

        // create elements on the table
        this.table.appendChild(this._createElementOnTable(task.markup));

        this._addMouseEventListeners();
    },

    _createOneElementOnTable(element, counter){
        // recursive function
        const fragment = document.createDocumentFragment();

        const classes = this._createClassArray(element);    
        const result = this._createDiv(classes);

        const hint = this._createDiv(["hint"], `&lt;${element.name}/&gt;`, null, "data-numberElement", counter.index++);
        result.appendChild(hint);       

        // if we have an inner element do recursive call
        ('markup' in element) && result.appendChild(this._createOneElementOnTable(element.markup, counter));

        this._addMouseEventListener(result, "hint-display-block");

        fragment.appendChild(result);

        // if we have an attribute in code, create the note on the table
        const regexp = /for='.+'/ig;
        regexp.test(element.name) && this._createNotesOnTheTable(element, regexp, counter.index);

        return fragment;
    },

    _createClassArray(element){
        const classes = [];

        element.name.includes("plate") && classes.push("plate");
        element.name.includes("fancy") && classes.push("fancy");
        JSON.parse(element.animated) && classes.push("element_dancer");
        element.name.includes("apple") && classes.push("apple");
        element.name.includes("pickle") && classes.push("pickle");
        element.name.includes("bento") && classes.push("bento");
        element.name.includes("orange") && classes.push("orange");
        element.name.includes("small") && classes.push("small");

        return classes;
    },

    _createElementOnTable(markup){
        const fragment = document.createDocumentFragment();
        this.elementAnimated = new Array();
        const counter = {index: 0};
        markup.forEach((element) => {
            fragment.appendChild(this._createOneElementOnTable(element, counter));      
        });
        return fragment;
    },

    _createNotesOnTheTable(element, regexp, value){
        const name = element.name.match(regexp)[0].match(/'.+'/ig)[0].match(/\w+/)[0];
        const note = this._createDiv(["for"], name, null, 'style', `left:${value*50}px`);
        this.notes.appendChild(note)
    },

    _createCodeArea(markup){
        const fragment = document.createDocumentFragment();

        fragment.appendChild(this._createDiv([], '&lt;div class="table"&gt;'));

        const counter = {index: 0};
        markup.forEach((element) => {
            fragment.appendChild(this._createOneElementOnCodeArea(element, counter));
            counter.index++;
        });

        fragment.appendChild(this._createDiv([], '&lt;/div&gt;'));

        return fragment;
    },

    _createOneElementOnCodeArea(element, counter, spaceBeforeTag = 2){
        // recursive function
        const fragment = document.createDocumentFragment();

        const openTag = this._createDiv(["highlight"], `&lt;${element.name}&gt;`, spaceBeforeTag, "data-highlight", counter.index);
        
        fragment.appendChild(openTag);

        // if we have an inner element do recursive call
        const storageCurrentIndex = counter.index;
        ('markup' in element) && ++counter.index && openTag.appendChild(this._createOneElementOnCodeArea(element.markup, counter, spaceBeforeTag + 2)) 

        const closeTag = this._createDiv(["highlight"], `&lt;/${element.name.match(/([a-z-]*)/)[0]}&gt;`, spaceBeforeTag, "data-highlight", storageCurrentIndex);
 
        fragment.appendChild(closeTag);

        return fragment;
    },

    _addMouseEventListeners(){
        const tags = document.querySelectorAll(`[data-highlight]`);

        for (let tag of tags){
            tag.addEventListener("mouseover", (event) => {
                event.target.classList.add("html-view-highlight");
                const hint = document.querySelector(`[data-numberElement="${tag.dataset.highlight}"]`);
                hint.classList.add("hint-display-block");
                hint.parentNode.classList.add("element_shadow");
                event.stopPropagation();
            });


            tag.addEventListener("mouseout", (event) => {
                event.target.classList.remove("html-view-highlight");
                const hint = document.querySelector(`[data-numberElement="${tag.dataset.highlight}"]`);
                hint.classList.remove("hint-display-block");
                hint.parentNode.classList.remove("element_shadow");
                event.stopPropagation();
            });
        }
    },

    _addMouseEventListener(tag, className){
        tag.addEventListener("mouseover", (event) => {
            event.target.firstChild.classList.add(className);
            const tags = document.querySelectorAll(`[data-highlight="${event.target.firstChild.dataset.numberelement}"]`);
            for(let tag of tags) {
                tag.classList.add("html-view-highlight");
            }            
        });
        tag.addEventListener("mouseout", (event) => {
            event.target.firstChild.classList.remove(className);
            const tags = document.querySelectorAll(`[data-highlight="${event.target.firstChild.dataset.numberelement}"]`);
            for(let tag of tags) {
                tag.classList.remove("html-view-highlight");
            }   
        });
    },

    _createDiv(classesName, content, whitespace = 0, attribute, attrValue){
        const result = document.createElement("div");
        Array.isArray(classesName) && classesName.length && result.classList.add(...classesName);
        content && (result.innerHTML = `${'&nbsp;'.repeat(whitespace)}${content}`);
        attribute && typeof(attrValue) !== "undefined" && attrValue !== null && result.setAttribute(attribute, attrValue);
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

    _saveGame(level, withHelp){
        localStorage.setItem("currentLevel", level);

        this._game.completedLevels.set(level, {done : true, withHelp : withHelp});

        localStorage.setItem("completedLevels", JSON.stringify([...this._game.completedLevels]));        
    },

    _loadGame(){
        console.log(this._game.completedLevels);

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