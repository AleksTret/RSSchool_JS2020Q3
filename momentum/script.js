'use strict';

const time = document.querySelector('.time');
const greeting = document.querySelector('.greeting');
const name = document.querySelector('.name');
const goal = document.querySelector('.goal');
const date = document.querySelector('.date');
const editable = document.querySelectorAll('[date-editable]');

const monthsName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                    'September', 'October', 'November', 'December'];
const weekdaysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class Momentum{
    constructor(){
        this.getName();
        this.getGoal();
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
        let partDay = '';
        switch (Math.floor((new Date()).getHours()/6)) {
            case 0:
                partDay = 'night';
                break;
            case 1:
                partDay = 'morning';
                break;
            case 2:
                partDay = 'day';
                break;
            case 3:
            case 4:
                partDay = 'evening';
                break;
            default:
                partDay = '';
                break;
        }
    
        let imageNumber = this.addZero(this.getRandomInt(1, 20));
    
        document.body.style.backgroundImage = 
            `url(assets/images/${partDay}/${imageNumber}.jpg)`;
        greeting.textContent = `Good ${partDay}`;

        let that = this;
        setTimeout(() => that.redrawBackground(), 3600000);
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
}

let momentum = new Momentum();

editable.forEach(item => {
    item.addEventListener('input', momentum.setStorage);
    item.addEventListener('blur', momentum.whenBlur);
    item.addEventListener('click', momentum.onClick);
    item.addEventListener('keydown', momentum.onKeydown);
})

momentum.redraw();