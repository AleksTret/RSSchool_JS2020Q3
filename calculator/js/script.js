class Calculator{
    constructor(previousOperandElement, currentOperandElement){
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear(){
        this.previousOperand = '';
        this.currentOperand = '';
        this.operation = undefined;
        this.unlockButtons();
    }

    delete(){
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    enterNumbers(number){
        if (number === "." && this.currentOperand.includes(".")){
            return;
        }
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    enterOperation(operator){
        if (this.currentOperand === ''){
            return;
        }
        if (operator === "sqrt" || operator === "minus"){
            this.operation = operator;
            this.compute();
            return;
        }
        if (this.previousOperand !== ''){
            this.compute();
        }
        this.operation = operator;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute(){
        let result;
        const previous = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if(isNaN(current) || (isNaN(previous) && this.operation !== "sqrt" && this.operation !== "minus")){
            return;
        }
        switch (this.operation) {
            case "+":
                result = previous + current;
                break;
            case "-":
                result = previous - current;
                break;
            case "*":
                result = previous * current;
            break;
            case "/":
                result = previous / current;
                break;
            case "sqrt":
                result = (current > 0 ? Math.sqrt(current) : NaN);
                break;
            case "^":
                result = previous ** current;
                break;
            case "minus":
                result = -current;
                break;
            default:
                return;
        }

        this.currentOperand = result;
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number){
        if (isNaN(number)){
            return number;
        }
        let stringNumber = number.toString();
        let integerDigits = parseFloat(stringNumber.split(".")[0]);
        let decimalDigits = stringNumber.split(".")[1];
        let integerDisplay;
        if(!isNaN(integerDigits)){
            integerDisplay = integerDigits.toLocaleString("ru-RU", {maximumFractionDigits: 0});
        }
        else {
            integerDisplay = '';
        }
        if(decimalDigits != null){
            return `${integerDisplay}.${decimalDigits}`;
        }
        else{
            return integerDisplay;
        }
    }

    redrawDisplay(){
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (isNaN(this.currentOperand)){
            this.lockButtons();
        }
        if (this.operation != null && this.operation !== "sqrt"){
            this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        }
        else {
            this.previousOperandElement.innerText = '';
        }
    }

    lockButtons(){
        operationsCommand.forEach(item => item.disabled = true);
        numbersButtons.forEach(item => item.disabled = true);
        equalsCommand.disabled = true;
        deleteCommand.disabled = true;
    }

    unlockButtons(){
        operationsCommand.forEach(item => item.disabled = false);
        numbersButtons.forEach(item => item.disabled = false);
        equalsCommand.disabled = false;
        deleteCommand.disabled = false;
    }
}

const numbersButtons = document.querySelectorAll('button[data-number]');
const operationsCommand = document.querySelectorAll('[data-operation]');
const equalsCommand = document.querySelector('[data-equals]');
const deleteCommand = document.querySelector('[data-delete]');
const clearCommand = document.querySelector('[data-all-clear]');
const previousOperand = document.querySelector('[data-previous-operand]');
const currentOperand = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperand, currentOperand);

numbersButtons.forEach(item => {
    item.addEventListener("click", () => {
        calculator.enterNumbers(item.innerText); 
        calculator.redrawDisplay();
    })
})

operationsCommand.forEach(item => {
    item.addEventListener("click", () => {
        calculator.enterOperation(item.dataset.operation);
        calculator.redrawDisplay();
    })
})

equalsCommand.addEventListener("click", () => {
    calculator.compute();
    calculator.redrawDisplay();
})

clearCommand.addEventListener("click", () => {
    calculator.clear();
    calculator.redrawDisplay();
})

deleteCommand.addEventListener("click", () => {
    calculator.delete();
    calculator.redrawDisplay();
})

