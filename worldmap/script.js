
const result = document.getElementById("result");
const expression = document.getElementById("expression");
const historyList = document.getElementById("historyList");

let currentValue = "0";
let previousValue = null;
let operator = null;
let waitingForNewValue = false;
let memory = 0;
let history = [];

function formatNumber(number) {
    if (!Number.isFinite(number)) return "Error";

    if (Object.is(number, -0)) number = 0;

    return String(Number(number.toPrecision(12)));
}

function updateDisplay() {
    result.textContent = currentValue;
}

function calculate(a, b, op) {
    let answer;

    switch (op) {
        case "+": answer = a + b; break;
        case "-": answer = a - b; break;
        case "*": answer = a * b; break;
        case "/": answer = b === 0 ? NaN : a / b; break;
        case "^": answer = Math.pow(a, b); break;
        default: return NaN;
    }

    return Number.isFinite(answer) ? answer : NaN;
}

function showError() {
    currentValue = "Error";
    previousValue = null;
    operator = null;
    waitingForNewValue = true;
    updateDisplay();
}

function addHistory(text, answer) {
    history.unshift({ text, answer });
    history = history.slice(0, 20);

    historyList.innerHTML = "";

    history.forEach(item => {
        const card = document.createElement("div");
        card.className = "history-item";
        card.tabIndex = 0;

        const equation = document.createElement("div");
        equation.className = "history-expression";
        equation.textContent = item.text;

        const value = document.createElement("div");
        value.className = "history-answer";
        value.textContent = item.answer;

        card.append(equation, value);

        function reuseAnswer() {
            currentValue = item.answer;
            previousValue = null;
            operator = null;
            waitingForNewValue = true;
            expression.textContent = item.text;
            updateDisplay();
        }

        card.addEventListener("click", reuseAnswer);

        card.addEventListener("keydown", event => {
            if (event.key === "Enter") reuseAnswer();
        });

        historyList.appendChild(card);
    });

    if (history.length === 0) {
        historyList.innerHTML =
            '<div class="empty-history"><span>◷</span><p>No calculations yet</p></div>';
    }
}

function resetAll() {
    currentValue = "0";
    previousValue = null;
    operator = null;
    waitingForNewValue = false;
    expression.textContent = "";
    updateDisplay();
}

function enterNumber(number) {
    if (currentValue === "Error" || waitingForNewValue) {
        currentValue = number;
        waitingForNewValue = false;
    } else {
        currentValue = currentValue === "0"
            ? number
            : currentValue + number;
    }

    updateDisplay();
}

function chooseOperator(nextOperator) {
    if (currentValue === "Error") return;

    const value = Number(currentValue);

    if (operator !== null && !waitingForNewValue) {
        const answer = calculate(previousValue, value, operator);

        if (!Number.isFinite(answer)) {
            showError();
            return;
        }

        currentValue = formatNumber(answer);
    }

    previousValue = Number(currentValue);
    operator = nextOperator;
    waitingForNewValue = true;

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷",
        "^": "^"
    };

    expression.textContent =
        currentValue + " " + symbols[nextOperator];

    updateDisplay();
}

function performUnary(action) {
    if (currentValue === "Error") return;

    const value = Number(currentValue);
    let answer;
    let label = action;

    switch (action) {
        case "square":
            answer = value * value;
            label = `sqr(${value})`;
            break;

        case "sqrt":
            answer = value < 0 ? NaN : Math.sqrt(value);
            label = `√(${value})`;
            break;

        case "reciprocal":
            answer = value === 0 ? NaN : 1 / value;
            label = `1/(${value})`;
            break;

        case "sin":
            answer = Math.sin(value * Math.PI / 180);
            label = `sin(${value}°)`;
            break;

        case "cos":
            answer = Math.cos(value * Math.PI / 180);
            label = `cos(${value}°)`;
            break;

        case "tan":
            answer = Math.abs(Math.cos(value * Math.PI / 180)) < 1e-12
                ? NaN
                : Math.tan(value * Math.PI / 180);
            label = `tan(${value}°)`;
            break;

        case "log":
            answer = value <= 0 ? NaN : Math.log10(value);
            label = `log(${value})`;
            break;

        case "ln":
            answer = value <= 0 ? NaN : Math.log(value);
            label = `ln(${value})`;
            break;

        case "factorial":
            if (value < 0 || !Number.isInteger(value) || value > 170) {
                answer = NaN;
            } else {
                answer = 1;
                for (let i = 2; i <= value; i++) {
                    answer *= i;
                }
            }
            label = `${value}!`;
            break;

        default:
            return;
    }

    if (!Number.isFinite(answer)) {
        showError();
        expression.textContent = label;
        return;
    }

    currentValue = formatNumber(answer);
    expression.textContent = label;
    waitingForNewValue = true;

    addHistory(label, currentValue);
    updateDisplay();
}

function performAction(action) {
    const value = Number(currentValue);

    switch (action) {
        case "clear":
            resetAll();
            return;

        case "clear-entry":
            currentValue = "0";
            updateDisplay();
            return;

        case "backspace":
            if (currentValue === "Error" || waitingForNewValue) {
                currentValue = "0";
                waitingForNewValue = false;
            } else {
                currentValue = currentValue.length > 1
                    ? currentValue.slice(0, -1)
                    : "0";

                if (currentValue === "-") currentValue = "0";
            }
            updateDisplay();
            return;

        case "decimal":
            if (currentValue === "Error" || waitingForNewValue) {
                currentValue = "0.";
                waitingForNewValue = false;
            } else if (!currentValue.includes(".")) {
                currentValue += ".";
            }
            updateDisplay();
            return;

        case "sign":
            if (currentValue !== "Error" && value !== 0) {
                currentValue = formatNumber(-value);
            }
            updateDisplay();
            return;

        case "percent":
            if (currentValue !== "Error") {
                currentValue = formatNumber(value / 100);
            }
            updateDisplay();
            return;

        case "pi":
            currentValue = formatNumber(Math.PI);
            expression.textContent = "π";
            waitingForNewValue = true;
            updateDisplay();
            return;

        case "equals":
            if (operator !== null && previousValue !== null) {
                const first = previousValue;
                const second = value;
                const op = operator;
                const answer = calculate(first, second, op);

                const symbols = {
                    "+": "+",
                    "-": "−",
                    "*": "×",
                    "/": "÷",
                    "^": "^"
                };

                const equation =
                    `${formatNumber(first)} ${symbols[op]} ${formatNumber(second)} =`;

                if (!Number.isFinite(answer)) {
                    expression.textContent = equation;
                    showError();
                    return;
                }

                currentValue = formatNumber(answer);
                expression.textContent = equation;

                addHistory(equation, currentValue);

                previousValue = null;
                operator = null;
                waitingForNewValue = true;
                updateDisplay();
            }
            return;
    }

    performUnary(action);
}

// Number buttons
document.querySelectorAll("[data-number]").forEach(button => {
    button.addEventListener("click", () => {
        enterNumber(button.dataset.number);
    });
});

// Operator buttons
document.querySelectorAll("[data-operator]").forEach(button => {
    button.addEventListener("click", () => {
        chooseOperator(button.dataset.operator);
    });
});

// Function and scientific buttons
document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
        performAction(button.dataset.action);
    });
});

// Memory buttons
document.querySelectorAll("[data-memory]").forEach(button => {
    button.addEventListener("click", () => {
        if (currentValue === "Error") return;

        const action = button.dataset.memory;
        const value = Number(currentValue);

        switch (action) {
            case "MC":
                memory = 0;
                break;

            case "MR":
                currentValue = formatNumber(memory);
                waitingForNewValue = true;
                updateDisplay();
                break;

            case "M+":
                memory += value;
                break;

            case "M-":
                memory -= value;
                break;

            case "MS":
                memory = value;
                break;
        }
    });
});

// Dark and light themes
document.getElementById("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("light");

    const lightMode = document.body.classList.contains("light");

    document.getElementById("themeBtn").textContent =
        lightMode ? "☾" : "☼";
});

// Clear calculation history
document.getElementById("clearHistory").addEventListener("click", () => {
    history = [];
    addHistory("", "");
});

// Keyboard support
document.addEventListener("keydown", event => {
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    if (/^[0-9]$/.test(event.key)) {
        enterNumber(event.key);
    } else if (event.key === ".") {
        performAction("decimal");
    } else if (["+", "-", "*", "/", "^"].includes(event.key)) {
        chooseOperator(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        performAction("equals");
    } else if (event.key === "Backspace") {
        performAction("backspace");
    } else if (event.key === "Escape") {
        resetAll();
    } else if (event.key === "%") {
        performAction("percent");
    }
});

updateDisplay();
addHistory("", "");
