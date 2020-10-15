class Calculator{
    constructor(previousOperandElement, currentOperandElement){
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear(){
        this.previousOperand = '';
        this.currentOperand = '';
        this.operation = '';
        this.unlockButtons();
        this.isInputNewCurrentOperand = false;
        this.storageCurrentOperand = '';    
        this.storageOperation = '';
    }

    equal(){
        this.isInputNewCurrentOperand = true;

        if(this.currentOperand !== '' && this.operation === ''){
            return;
        }

        //functionality like Windows Calculator
        // if(this.currentOperand === '' && this.previousOperand !== '' && this.operation !== ''){
        //     this.currentOperand = this.previousOperand;
        // }

        // if(this.previousOperand === '' && this.storageCurrentOperand !== '' && this.storageOperation !== ''){
        //     this.previousOperand = this.currentOperand;
        //     this.currentOperand = this.storageCurrentOperand;
        //     this.operation = this.storageOperation;
        // }
        // else {
        //     this.storageCurrentOperand = this.currentOperand;    
        //     this.storageOperation = this.operation;
        // }

        this.currentOperand = this.compute();

        this.operation = '';
        this.previousOperand = ''; 
    }

    delete(){
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    enterNumbers(number){
        if (number === "." && this.currentOperand.toString().includes(".")){
            return;
        }
        if(this.isInputNewCurrentOperand){
            this.currentOperand = number.toString();
            this.previousOperand = '';
            this.operation = '';
            this.isInputNewCurrentOperand = false;
        }
        else{
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    enterOperation(operation){
        if (this.currentOperand === ''){
            return;
        }
        if (operation === "sqrt"){
            this.operation = operation;
            this.isInputNewCurrentOperand = true;
            this.currentOperand = this.compute();
            return;
        }

        if (this.previousOperand !== ''){
            this.currentOperand = this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.isInputNewCurrentOperand = false;
    }

    changeSign(){
        if (this.currentOperand)
            this.currentOperand = -parseFloat(this.currentOperand);
    }

    getPrecision(operand){
        let result = 0;
        let decimalDigit = operand.toString().split(".")[1];
        if(decimalDigit){
            result = decimalDigit.toString().length;
        } 
        return result;
    }

    shrinkLastZeroAndDot(number){
        let result = number.toString();
        if (result.split(".")[1]){
            while (result.endsWith("0")){
                result = result.slice(0, -1);
            }
        }
        if (result.endsWith(".")){
            result = result.slice(0, -1);
        }
        return result
    }

    compute(){
        let result;

        const previous = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if(isNaN(current) || (isNaN(previous) && this.operation !== "sqrt")){
            return '';
        }
        
        switch (this.operation) {
            case "+":
                result = (previous + current).toFixed(Math.min(Math.max(this.getPrecision(previous), this.getPrecision(current)), 20));
                result = this.shrinkLastZeroAndDot(result);
                break;
            case "-":
                result = (previous - current).toFixed(Math.min(Math.max(this.getPrecision(previous), this.getPrecision(current)), 20));
                result = this.shrinkLastZeroAndDot(result);
                break;
            case "*":
                result = (previous * current).toFixed(Math.min(this.getPrecision(previous) + this.getPrecision(current), 20));
                result = this.shrinkLastZeroAndDot(result);
                break;
            case "/":
                result = previous / current;
                break;
            case "sqrt":
                result = (current > 0 ? Math.sqrt(current) : NaN);
                break;
            case "^":
                result = (previous ** current).toFixed(Math.max(this.getPrecision(previous) * current), 20);
                break;
            default:
                result = '';
        }
        return result;   
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
        if (this.currentOperandElement.innerText === "NaN"){
            this.lockButtons();            
        }

        if (this.operation !== '' && this.operation !== "sqrt"){
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
        minusCommand.disabled = true;
    }

    unlockButtons(){
        operationsCommand.forEach(item => item.disabled = false);
        numbersButtons.forEach(item => item.disabled = false);
        equalsCommand.disabled = false;
        deleteCommand.disabled = false;
        minusCommand.disabled = false;
    }
}

const numbersButtons = document.querySelectorAll('[data-number]');
const operationsCommand = document.querySelectorAll('[data-operation]');
const equalsCommand = document.querySelector('[data-equals]');
const deleteCommand = document.querySelector('[data-delete]');
const clearCommand = document.querySelector('[data-all-clear]');
const previousOperand = document.querySelector('[data-previous-operand]');
const currentOperand = document.querySelector('[data-current-operand]');
const minusCommand = document.querySelector('[data-minus]');

const calculator = new Calculator(previousOperand, currentOperand);

numbersButtons.forEach(item => {
    item.addEventListener("click", () => {
        calculator.enterNumbers(item.dataset.number); 
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
    calculator.equal();
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

minusCommand.addEventListener("click", () => {
    calculator.changeSign();
    calculator.redrawDisplay();
})
