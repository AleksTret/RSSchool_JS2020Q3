'use strict';

const time = document.querySelector('.time');
const greeting = document.querySelector('.greeting');
const name = document.querySelector('.name');
const goal = document.querySelector('.goal');
const date = document.querySelector('.date');
const editable = document.querySelectorAll('[date-editable]');
const button = document.querySelector('.btn');

const monthsName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                    'September', 'October', 'November', 'December'];
const weekdaysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class Momentum{
    constructor(){
        this.getName();
        this.getGoal();
        this.getBackgroundList();
    }

    getBackgroundList(){
        this.backgroundImageList = [];
        let daysPart = ['night', 'morning', 'day', 'evening'];

        let filesName = []
        for (let i = 0; i < 20; i++){
            filesName[i] = `${this.addZero(i + 1)}.jpg`;
        }
        
        for (let i = 0; i < 4; i++){
            this.backgroundImageList = this.backgroundImageList
                                           .concat(this.shuffleArray(filesName)
                                           .map(item => `assets/images/${daysPart[i]}/${item}`)
                                           .slice(0, 6));
        }

        this.indexBackgroundImage = (new Date()).getHours() + 1;
    }

    addZero(number){
        return parseInt(number, 10) < 10 ? `0${number}` : number;
    } 

    shuffleArray(array){
        return array
            .map(function(elem,index) { return [elem, Math.random()]})
            .sort(function(a,b){ return a[1] - b[1]})
            .map(function(elem){return elem[0]});
    }

    getDaysPart(input){
        let hour = parseInt(input, 10) || -1;
        hour = 0 > hour || hour > 24 ? -1 : hour;
        switch (Math.floor(hour/6)) {
            case 0:
                return 'night';
            case 1:
                return 'morning';
            case 2:
                return 'day';
            case 3:
            case 4:
                return 'evening';
            default:
                return '';
        }    
    }

    redraw(){
        let hour = (new Date()).getHours();
        this.changeBackground(this.backgroundImageList[hour]);
        greeting.textContent = `Good ${this.getDaysPart(hour)}`;

        this.redrawTime();
    }

    redrawTime() {
        let today = new Date();
        let hour = today.getHours()
        let minutes = today.getMinutes();
    
        time.innerHTML = `${this.addZero(hour)}<span>:</span>${this.addZero(minutes)}<span>:</span>${this.addZero(today.getSeconds())}`;
        date.innerHTML = `${weekdaysName[today.getDay()]}<span> </span>${today.getDate()}<span> </span>${monthsName[today.getMonth()]}`;

        if(minutes == 0){
            this.changeBackground(this.backgroundImageList[hour]);
            greeting.textContent = `Good ${this.getDaysPart(hour)}`;
        }

        let that = this;
        setTimeout(() => that.redrawTime(), 1000);
    }

    changeBackground(source){
        let background = document.createElement('img');
        background.src = source;
        background.onload = () => {document.body.style.backgroundImage = `url(${source})`; };
    }

    getName(){
        name.textContent = localStorage.getItem('name') || '[Enter your Name]';
    }

    getGoal(){
        goal.textContent = localStorage.getItem('goal') || '[Enter your goal]';
    }

    onClick(event){
        let className = event.currentTarget.classList.item(0).toString();
        localStorage.setItem(className, event.currentTarget.innerText); 
        event.currentTarget.innerText = '';   
    }
    
    onKeydown(event){
        if(event.code === 'Enter'){
            let className = event.currentTarget.classList.item(0).toString();
            localStorage.setItem(className, event.currentTarget.innerText); 
            event.currentTarget.blur();
        }
    }
    
    whenBlur(event){
        let className = event.currentTarget.classList.item(0).toString();
        event.currentTarget.innerText = localStorage.getItem(className);
    }
    
    setStorage(event){
        let className = event.currentTarget.classList.item(0).toString();
        localStorage.setItem(className, event.currentTarget.innerText);
    }

    nextBackground(){
        if (this.indexBackgroundImage >= this.backgroundImageList.length){
             this.indexBackgroundImage = 0;
        }
        this.changeBackground(this.backgroundImageList[this.indexBackgroundImage]);
        this.indexBackgroundImage++
    }
}

let momentum = new Momentum();

editable.forEach(item => {
    item.addEventListener('input', momentum.setStorage);
    item.addEventListener('blur', momentum.whenBlur);
    item.addEventListener('click', momentum.onClick);
    item.addEventListener('keydown', momentum.onKeydown);
})

button.addEventListener('click', () => momentum.nextBackground());

momentum.redraw();