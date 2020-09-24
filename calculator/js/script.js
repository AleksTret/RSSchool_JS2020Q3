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
    }

    delete(){
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    equals(){

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
        if (operator === "sqrt"){
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

        if(isNaN(current) || (isNaN(previous) && this.operation !== "sqrt")){
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
                result = Math.sqrt(current);
                break;
            default:
                return;
        }

        this.currentOperand = result;
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number){
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
        if (this.operation != null && this.operation !== "sqrt"){
            this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        }
        else {
            this.previousOperandElement.innerText = '';
        }
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

