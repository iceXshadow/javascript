// DOM Elements
const codeInput = document.getElementById("codeInput");
const codeDisplay = document.getElementById("codeDisplay");
const lineNumbers = document.getElementById("lineNumbers");
const output = document.getElementById("output");
const autocompleteDropdown = document.getElementById("autocompleteDropdown");

// State variables
let selectedIndex = -1;
let isConsoleSetup = false;
let autocompleteTimeout = null;

// Token-based Syntax Highlighting (Fixed approach)
class SyntaxHighlighter {
constructor() {
    this.keywords = [
    "abstract",
    "arguments",
    "await",
    "boolean",
    "break",
    "byte",
    "case",
    "catch",
    "char",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "double",
    "else",
    "enum",
    "eval",
    "export",
    "extends",
    "false",
    "final",
    "finally",
    "float",
    "for",
    "function",
    "goto",
    "if",
    "implements",
    "import",
    "in",
    "instanceof",
    "int",
    "interface",
    "let",
    "long",
    "native",
    "new",
    "null",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "short",
    "static",
    "super",
    "switch",
    "synchronized",
    "this",
    "throw",
    "throws",
    "transient",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "volatile",
    "while",
    "with",
    "yield",
    "async",
    "of",
    "undefined",
    ];

    this.builtins = [
    "Array",
    "Boolean",
    "Date",
    "Error",
    "Function",
    "JSON",
    "Math",
    "Number",
    "Object",
    "RegExp",
    "String",
    "console",
    "document",
    "window",
    "parseInt",
    "parseFloat",
    "isNaN",
    "isFinite",
    "setTimeout",
    "setInterval",
    "clearTimeout",
    "clearInterval",
    "Promise",
    "Symbol",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    ];
}

tokenize(code) {
    const tokens = [];
    let i = 0;

    while (i < code.length) {
    const char = code[i];

    // Skip whitespace but preserve it
    if (/\s/.test(char)) {
        let whitespace = "";
        while (i < code.length && /\s/.test(code[i])) {
        whitespace += code[i];
        i++;
        }
        tokens.push({ type: "whitespace", value: whitespace });
        continue;
    }

    // Comments
    if (char === "/" && i + 1 < code.length) {
        if (code[i + 1] === "/") {
        // Single line comment
        let comment = "";
        while (i < code.length && code[i] !== "\n") {
            comment += code[i];
            i++;
        }
        tokens.push({ type: "comment", value: comment });
        continue;
        } else if (code[i + 1] === "*") {
        // Multi-line comment
        let comment = "";
        while (i < code.length - 1) {
            comment += code[i];
            if (code[i] === "*" && code[i + 1] === "/") {
            comment += code[i + 1];
            i += 2;
            break;
            }
            i++;
        }
        tokens.push({ type: "comment", value: comment });
        continue;
        }
    }

    // Strings
    if (char === '"' || char === "'" || char === "`") {
        const quote = char;
        let string = quote;
        i++;
        while (i < code.length) {
        if (code[i] === quote && code[i - 1] !== "\\") {
            string += code[i];
            i++;
            break;
        }
        string += code[i];
        i++;
        }
        tokens.push({ type: "string", value: string });
        continue;
    }

    // Numbers
    if (/\d/.test(char)) {
        let number = "";
        while (i < code.length && /[\d.eE+\-xXbBoO]/.test(code[i])) {
        number += code[i];
        i++;
        }
        tokens.push({ type: "number", value: number });
        continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(char)) {
        let identifier = "";
        while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
        identifier += code[i];
        i++;
        }

        let type = "identifier";
        if (this.keywords.includes(identifier)) {
        type = "keyword";
        } else if (this.builtins.includes(identifier)) {
        type = "builtin";
        } else if (i < code.length && /\s*\(/.test(code.slice(i))) {
        type = "function";
        }

        tokens.push({ type, value: identifier });
        continue;
    }

    // Operators and punctuation
    if (/[+\-*/%=<>!&|^~?:;,.()[\]{}]/.test(char)) {
        tokens.push({ type: "operator", value: char });
        i++;
        continue;
    }

    // Default: treat as text
    tokens.push({ type: "text", value: char });
    i++;
    }

    return tokens;
}

highlight(code) {
    const tokens = this.tokenize(code);
    const container = document.createElement("div");

    tokens.forEach((token) => {
    const span = document.createElement("span");
    span.textContent = token.value;

    switch (token.type) {
        case "keyword":
        span.className = "keyword";
        break;
        case "string":
        span.className = "string";
        break;
        case "number":
        span.className = "number";
        break;
        case "comment":
        span.className = "comment";
        break;
        case "function":
        span.className = "function-name";
        break;
        case "builtin":
        span.className = "builtin";
        break;
        case "operator":
        span.className = "operator";
        break;
        case "whitespace":
        case "text":
        case "identifier":
        default:
        // No special styling
        break;
    }

    container.appendChild(span);
    });

    return container;
}
}

// Initialize syntax highlighter
const syntaxHighlighter = new SyntaxHighlighter();

// Fixed Code Display with Syntax Highlighting
function updateDisplay() {
const code = codeInput.value;

// Clear previous content
codeDisplay.innerHTML = "";

// Apply syntax highlighting
const highlightedContainer = syntaxHighlighter.highlight(code);

// Append all highlighted elements
while (highlightedContainer.firstChild) {
    codeDisplay.appendChild(highlightedContainer.firstChild);
}

updateLineNumbers();
}

// Line Numbers Management
function updateLineNumbers() {
const lines = codeInput.value.split("\n");
const lineCount = lines.length;
let lineNumbersText = "";

for (let i = 1; i <= lineCount; i++) {
    lineNumbersText += i + "\n";
}

lineNumbers.textContent = lineNumbersText;
}

// Console Output Management
function logToOutput(message, type = "info") {
const logEntry = document.createElement("div");
logEntry.className = "log-entry";

const arrow = document.createElement("span");
arrow.className = "log-arrow";
arrow.textContent = "→";

const content = document.createElement("span");
content.className = `log-${type}`;

// Handle object formatting
if (typeof message === "object" && message !== null) {
    try {
    content.textContent = JSON.stringify(message, null, 2);
    } catch (e) {
    content.textContent = String(message);
    }
} else {
    content.textContent = String(message);
}

logEntry.appendChild(arrow);
logEntry.appendChild(content);
output.appendChild(logEntry);

// Auto-scroll to bottom
output.scrollTop = output.scrollHeight;
}

// Console Capture Setup (Fixed to prevent duplicates)
function setupConsoleCapture() {
if (isConsoleSetup) return;
isConsoleSetup = true;

// Store original console methods
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
};

// Override console methods
console.log = (...args) => {
    const message = args
    .map((arg) => {
        if (typeof arg === "object" && arg !== null) {
        try {
            return JSON.stringify(arg, null, 2);
        } catch (e) {
            return String(arg);
        }
        }
        return String(arg);
    })
    .join(" ");

    logToOutput(message, "success");
    // Don't call original to prevent duplicate output in browser console
};

console.error = (...args) => {
    const message = args.map((arg) => String(arg)).join(" ");
    logToOutput(message, "error");
};

console.warn = (...args) => {
    const message = args.map((arg) => String(arg)).join(" ");
    logToOutput(message, "warning");
};

console.info = (...args) => {
    const message = args.map((arg) => String(arg)).join(" ");
    logToOutput(message, "info");
};
}

// Code Execution Engine
function executeCode() {
const code = codeInput.value.trim();
if (!code) return;

logToOutput("Executing code...", "info");

try {
    // Create isolated execution context
    const executeFunction = new Function(`
            "use strict";
            ${code}
        `);

    const result = executeFunction();

    // Only log result if it's not undefined
    if (result !== undefined) {
    logToOutput(result, "success");
    }

    logToOutput("Code executed successfully", "success");
} catch (error) {
    logToOutput(`Error: ${error.message}`, "error");
    console.error("Execution error:", error);
}
}

// Output Management
function clearOutput() {
output.innerHTML = `
        <div class="log-entry">
            <span class="log-arrow">→</span>
            <span class="log-info">Output cleared</span>
        </div>
    `;
}

// Example Code Loader
function loadExample() {
const exampleCode = `// JavaScript Prototype Pattern Example
function Person(name, age, job) {
    this.name = name || "Unknown";
    this.age = age || 0;
    this.job = job || "Unemployed";
}

Person.prototype.profile = function() {
    console.log(\`Name: \${this.name}\`);
    console.log(\`Age: \${this.age}\`);
    console.log(\`Job: \${this.job}\`);
};

Person.prototype.greet = function() {
    return \`Hello, I'm \${this.name}!\`;
};

// Create instances
const person1 = new Person("Alice", 30, "Developer");
const person2 = new Person("Bob", 25, "Designer");

console.log("=== Person 1 Profile ===");
person1.profile();
console.log(person1.greet());

console.log("\\n=== Person 2 Profile ===");
person2.profile();
console.log(person2.greet());

// Demonstrate prototype chain
console.log("\\n=== Prototype Chain Demo ===");
console.log("Same method reference:", person1.profile === person2.profile);
console.log("person1 instanceof Person:", person1 instanceof Person);

// Array methods example
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("\\n=== Array Operations ===");
console.log("Original:", numbers);
console.log("Doubled:", doubled);
console.log("Sum:", numbers.reduce((a, b) => a + b, 0));`;

codeInput.value = exampleCode;
updateDisplay();
}

// Autocomplete System
const autocompleteSuggestions = [
{
    trigger: "function",
    title: "Function Declaration",
    snippet: "function functionName() {\n    // Your code here\n    return;\n}",
},
{
    trigger: "func",
    title: "Function Declaration",
    snippet: "function functionName() {\n    // Your code here\n    return;\n}",
},
{
    trigger: "arrow",
    title: "Arrow Function",
    snippet:
    "const functionName = () => {\n    // Your code here\n    return;\n};",
},
{
    trigger: "=>",
    title: "Arrow Function",
    snippet: "const functionName = () => {\n    // Your code here\n};",
},
{
    trigger: "console.log",
    title: "Console Log",
    snippet: "console.log();",
},
{
    trigger: "console",
    title: "Console Log",
    snippet: "console.log();",
},
{
    trigger: "log",
    title: "Console Log",
    snippet: "console.log();",
},
{
    trigger: "for",
    title: "For Loop",
    snippet:
    "for (let i = 0; i < array.length; i++) {\n    // Your code here\n}",
},
{
    trigger: "foreach",
    title: "For Each Loop",
    snippet: "array.forEach((item, index) => {\n    // Your code here\n});",
},
{
    trigger: "if",
    title: "If Statement",
    snippet: "if (condition) {\n    // Your code here\n}",
},
{
    trigger: "ifelse",
    title: "If-Else Statement",
    snippet:
    "if (condition) {\n    // Your code here\n} else {\n    // Alternative code\n}",
},
{
    trigger: "const",
    title: "Const Declaration",
    snippet: "const variableName = value;",
},
{
    trigger: "let",
    title: "Let Declaration",
    snippet: "let variableName = value;",
},
{
    trigger: "var",
    title: "Var Declaration",
    snippet: "var variableName = value;",
},
{
    trigger: "try",
    title: "Try-Catch Block",
    snippet:
    "try {\n    // Your code here\n} catch (error) {\n    console.error(error);\n}",
},
{
    trigger: "class",
    title: "Class Declaration",
    snippet:
    "class ClassName {\n    constructor() {\n        // Constructor code\n    }\n    \n    method() {\n        // Method code\n    }\n}",
},
];

// Autocomplete Helper Functions
function getCurrentWord() {
const text = codeInput.value;
const cursor = codeInput.selectionStart;

let start = cursor;
while (start > 0 && /[\w.]/.test(text[start - 1])) {
    start--;
}

let end = cursor;
while (end < text.length && /\w/.test(text[end])) {
    end++;
}

return {
    word: text.substring(start, end),
    start: start,
    end: end,
};
}

function getCaretCoordinates() {
const textBeforeCursor = codeInput.value.substring(
    0,
    codeInput.selectionStart
);
const lines = textBeforeCursor.split("\n");
const currentLine = lines.length - 1;
const currentCol = lines[lines.length - 1].length;

return { line: currentLine, col: currentCol };
}

function showAutocomplete(suggestions) {
if (suggestions.length === 0) {
    hideAutocomplete();
    return;
}

autocompleteDropdown.innerHTML = "";

suggestions.forEach((suggestion, index) => {
    const item = document.createElement("div");
    item.className = "autocomplete-item";
    if (index === 0) item.classList.add("selected");

    const title = document.createElement("div");
    title.className = "autocomplete-item-title";
    title.textContent = suggestion.title;

    const snippet = document.createElement("div");
    snippet.className = "autocomplete-item-snippet";
    snippet.textContent = suggestion.snippet.replace(/\n/g, " ↵ ");

    item.appendChild(title);
    item.appendChild(snippet);

    item.addEventListener("click", () => {
    insertSuggestion(suggestion);
    hideAutocomplete();
    });

    autocompleteDropdown.appendChild(item);
});

// Position autocomplete dropdown
positionAutocomplete();
autocompleteDropdown.style.display = "block";
selectedIndex = 0;
}

function positionAutocomplete() {
const editorRect = codeInput.getBoundingClientRect();
const containerRect = codeInput.parentElement.getBoundingClientRect();
const caretPos = getCaretCoordinates();

const lineHeight = 21;
const charWidth = 8.4;
const scrollTop = codeInput.scrollTop;
const scrollLeft = codeInput.scrollLeft;

// Calculate position relative to the editor container
let left = 60 + caretPos.col * charWidth - scrollLeft;
let top = 20 + (caretPos.line + 1) * lineHeight - scrollTop;

// Ensure dropdown stays within bounds
const dropdownWidth = 280;
const dropdownHeight = 200;

if (left + dropdownWidth > containerRect.width) {
    left = containerRect.width - dropdownWidth - 10;
}

if (top + dropdownHeight > containerRect.height) {
    top = Math.max(20, top - dropdownHeight - lineHeight);
}

autocompleteDropdown.style.left = `${Math.max(10, left)}px`;
autocompleteDropdown.style.top = `${Math.max(10, top)}px`;
}

function hideAutocomplete() {
autocompleteDropdown.style.display = "none";
selectedIndex = -1;
}

function insertSuggestion(suggestion) {
const currentWord = getCurrentWord();
const text = codeInput.value;
const before = text.substring(0, currentWord.start);
const after = text.substring(currentWord.end);

const newText = before + suggestion.snippet + after;
codeInput.value = newText;

// Position cursor intelligently
let cursorPos = before.length + suggestion.snippet.length;

if (suggestion.snippet.includes("()")) {
    cursorPos = before.length + suggestion.snippet.indexOf("()") + 1;
} else if (suggestion.snippet.includes("functionName")) {
    const nameStart =
    before.length + suggestion.snippet.indexOf("functionName");
    codeInput.focus();
    codeInput.setSelectionRange(nameStart, nameStart + "functionName".length);
    updateDisplay();
    return;
} else if (suggestion.snippet.includes("condition")) {
    const conditionStart =
    before.length + suggestion.snippet.indexOf("condition");
    codeInput.focus();
    codeInput.setSelectionRange(
    conditionStart,
    conditionStart + "condition".length
    );
    updateDisplay();
    return;
}

codeInput.focus();
codeInput.setSelectionRange(cursorPos, cursorPos);
updateDisplay();
}

function handleAutocompleteInput() {
const currentWord = getCurrentWord();

if (currentWord.word.length < 2) {
    hideAutocomplete();
    return;
}

const filteredSuggestions = autocompleteSuggestions.filter((suggestion) =>
    suggestion.trigger.toLowerCase().startsWith(currentWord.word.toLowerCase())
);

if (filteredSuggestions.length > 0) {
    showAutocomplete(filteredSuggestions);
} else {
    hideAutocomplete();
}
}

function navigateAutocomplete(direction) {
const items = autocompleteDropdown.querySelectorAll(".autocomplete-item");
if (items.length === 0) return false;

if (selectedIndex >= 0 && selectedIndex < items.length) {
    items[selectedIndex].classList.remove("selected");
}

if (direction === "down") {
    selectedIndex = (selectedIndex + 1) % items.length;
} else if (direction === "up") {
    selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
}

items[selectedIndex].classList.add("selected");
items[selectedIndex].scrollIntoView({ block: "nearest" });

return true;
}

function acceptSuggestion() {
const items = autocompleteDropdown.querySelectorAll(".autocomplete-item");
if (selectedIndex >= 0 && selectedIndex < items.length) {
    const titleElement = items[selectedIndex].querySelector(
    ".autocomplete-item-title"
    );
    const suggestion = autocompleteSuggestions.find(
    (s) => s.title === titleElement.textContent
    );
    if (suggestion) {
    insertSuggestion(suggestion);
    hideAutocomplete();
    return true;
    }
}
return false;
}

// Event Listeners
codeInput.addEventListener("input", (e) => {
updateDisplay();

// Clear previous timeout
if (autocompleteTimeout) {
    clearTimeout(autocompleteTimeout);
}

// Set new timeout for autocomplete
autocompleteTimeout = setTimeout(() => {
    handleAutocompleteInput();
}, 200);
});

codeInput.addEventListener("scroll", () => {
codeDisplay.scrollTop = codeInput.scrollTop;
lineNumbers.scrollTop = codeInput.scrollTop;

// Reposition autocomplete if visible
if (autocompleteDropdown.style.display === "block") {
    positionAutocomplete();
}
});

codeInput.addEventListener("keydown", (e) => {
// Handle autocomplete navigation
if (autocompleteDropdown.style.display === "block") {
    if (e.key === "ArrowDown") {
    e.preventDefault();
    navigateAutocomplete("down");
    return;
    } else if (e.key === "ArrowUp") {
    e.preventDefault();
    navigateAutocomplete("up");
    return;
    } else if (e.key === "Enter" || e.key === "Tab") {
    if (acceptSuggestion()) {
        e.preventDefault();
        return;
    }
    } else if (e.key === "Escape") {
    hideAutocomplete();
    return;
    }
}

// Execute code
if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    executeCode();
    return;
}

// Tab indentation
if (e.key === "Tab") {
    e.preventDefault();
    const start = codeInput.selectionStart;
    const end = codeInput.selectionEnd;
    codeInput.value =
    codeInput.value.substring(0, start) +
    "    " +
    codeInput.value.substring(end);
    codeInput.selectionStart = codeInput.selectionEnd = start + 4;
    updateDisplay();
    return;
}
});

// Hide autocomplete when clicking outside
document.addEventListener("click", (e) => {
if (
    !codeInput.contains(e.target) &&
    !autocompleteDropdown.contains(e.target)
) {
    hideAutocomplete();
}
});

// Hide autocomplete when textarea loses focus
codeInput.addEventListener("blur", () => {
setTimeout(() => {
    if (
    document.activeElement !== autocompleteDropdown &&
    !autocompleteDropdown.contains(document.activeElement)
    ) {
    hideAutocomplete();
    }
}, 150);
});

// Initialize the application
function initializeApp() {
setupConsoleCapture();
updateDisplay();
loadExample();
}

// Start the application
initializeApp();
