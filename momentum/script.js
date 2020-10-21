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
        this.setBackgroundList();
        this.currentBackgroundIndex = 0;
    }

    setBackgroundList(){
        this.backgroundImageList = [];

        let filesName = []
        for (let i = 0; i < 20; i++){
            filesName[i] = `${this.addZero(i + 1)}.jpg`;
        }

        let daysPart = this.getDaysPart((new Date()).getHours());

        for (let i = 0; i < 4; i++){
            this.backgroundImageList = this.backgroundImageList.concat(this.getRandomArray(filesName).map(item => `assets/images/${daysPart}/${item}`));
            daysPart = this.getNextDaysPart(daysPart);
        }
    }

    getRandomArray(array){
        return array
            .map(function(elem,index) { return [elem, Math.random()]})
            .sort(function(a,b){ return a[1] - b[1]})
            .map(function(elem){return elem[0]});
    }

    getNextDaysPart(input){
        let daysPart = ['morning', 'day', 'evening', 'night'];
        let index = daysPart.indexOf(input);
        index = index + 1 === daysPart.length ? 0 : ++index;
        return daysPart[index];
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
        this.redrawTime();
        this.redrawBackground();
    }

    redrawTime() {
        let today = new Date();
    
        time.innerHTML = `${today.getHours()}<span>:</span>${this.addZero(today.getMinutes())}<span>:</span>${this.addZero(today.getSeconds())}`;
        date.innerHTML = `${weekdaysName[today.getDay()]}<span> </span>${today.getDate()}<span> </span>${monthsName[today.getMonth()]}`;

        let that = this;
        setTimeout(() => that.redrawTime(), 1000);
    }

    addZero(number){
        return parseInt(number, 10) < 10 ? `0${number}` : number;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }    

    redrawBackground(){
        let daysPart = this.getDaysPart((new Date()).getHours());
    
        let imageNumber = this.addZero(this.getRandomInt(1, 20));

        document.body.style.backgroundImage = 
            `url(assets/images/${daysPart}/${imageNumber}.jpg)`;
        greeting.textContent = `Good ${daysPart}`;

        let that = this;
        setTimeout(() => that.redrawBackground(), 3600000);
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
        if (this.currentBackgroundIndex >= this.backgroundImageList.length){
             this.currentBackgroundIndex = 0;
        }
        this.changeBackground(this.backgroundImageList[this.currentBackgroundIndex]);
        this.currentBackgroundIndex++
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