const codeInput = document.getElementById("codeInput");
const codeDisplay = document.getElementById("codeDisplay");
const lineNumbers = document.getElementById("lineNumbers");
const output = document.getElementById("output");

// Update line numbers
function updateLineNumbers() {
const lines = codeInput.value.split("\n");
const lineCount = lines.length;
let lineNumbersText = "";

for (let i = 1; i <= lineCount; i++) {
    lineNumbersText += i + "\n";
}

lineNumbers.textContent = lineNumbersText;
}

// Update the display (no syntax highlighting to avoid the HTML issue)
function updateDisplay() {
// Just copy the text content to maintain cursor position
codeDisplay.textContent = codeInput.value;
updateLineNumbers();
}

// Log to output
function logToOutput(message, type = "info") {
const logEntry = document.createElement("div");
logEntry.className = "log-entry";

const arrow = document.createElement("span");
arrow.className = "log-arrow";
arrow.textContent = "→";

const content = document.createElement("span");
content.className = `log-${type}`;
content.textContent = message;

logEntry.appendChild(arrow);
logEntry.appendChild(content);
output.appendChild(logEntry);

// Auto-scroll to bottom
output.scrollTop = output.scrollHeight;
}

// Override console methods to capture output
function setupConsoleCapture() {
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

console.log = function (...args) {
    const message = args
    .map((arg) => {
        if (typeof arg === "object") {
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
    originalLog.apply(console, args);
};

console.error = function (...args) {
    const message = args.map((arg) => String(arg)).join(" ");
    logToOutput(message, "error");
    originalError.apply(console, args);
};

console.warn = function (...args) {
    const message = args.map((arg) => String(arg)).join(" ");
    logToOutput(message, "warning");
    originalWarn.apply(console, args);
};

console.info = function (...args) {
    const message = args.map((arg) => String(arg)).join(" ");
    logToOutput(message, "info");
    originalInfo.apply(console, args);
};
}

// Execute code
function executeCode() {
const code = codeInput.value.trim();
if (!code) return;

logToOutput(`Executing code...`, "info");

try {
    // Create a more isolated execution context
    const func = new Function(`
                ${code}
            `);
    const result = func();

    if (result !== undefined) {
    console.log(result);
    }

    logToOutput("Code executed successfully", "success");
} catch (error) {
    logToOutput(`Error: ${error.message}`, "error");
}
}

// Clear output
function clearOutput() {
output.innerHTML =
    '<div class="log-entry"><span class="log-arrow">→</span><span class="log-info">Output cleared</span></div>';
}

// Load example code
function loadExample() {
const exampleCode = `// Prototype Pattern Example
function Person() {
    // Constructor function
}

Person.prototype.name = "Ice";
Person.prototype.age = 29;
Person.prototype.job = "S/W Developer";

Person.prototype.profile = function() {
    console.log(\`Name: \${this.name}\`);
    console.log(\`Age: \${this.age}\`);
    console.log(\`Job: \${this.job}\`);
};

// Create instances
var person1 = new Person();
var person2 = new Person();
person2.name = "Mit"; // Override prototype property

console.log("=== Person 1 Profile ===");
person1.profile();

console.log("\\n=== Person 2 Profile ===");
person2.profile();

// Demonstrate method sharing
console.log("\\n=== Method Sharing ===");
console.log("Same method reference:", person1.profile === person2.profile);

// Prototype chain validation
console.log("\\n=== Prototype Chain ===");
console.log("person1 has Person prototype:", Person.prototype.isPrototypeOf(person1));
console.log("person2 has Person prototype:", Person.prototype.isPrototypeOf(person2));`;

codeInput.value = exampleCode;
updateDisplay();
}

// Event listeners
codeInput.addEventListener("input", updateDisplay);
codeInput.addEventListener("scroll", () => {
codeDisplay.scrollTop = codeInput.scrollTop;
lineNumbers.scrollTop = codeInput.scrollTop;
});

// Keyboard shortcuts
codeInput.addEventListener("keydown", (e) => {
if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    executeCode();
}

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
}
});

// Add these variables at the top of your file
const autocompleteDropdown = document.getElementById("autocompleteDropdown");
let selectedIndex = -1;

// Autocomplete suggestions
const autocompleteSuggestions = [
    {
        trigger: "function",
        title: "Function Declaration",
        snippet: "function functionName() {\n    // Your code here\n}"
    },
    {
        trigger: "func",
        title: "Function Declaration",
        snippet: "function functionName() {\n    // Your code here\n}"
    },
    {
        trigger: "console.log",
        title: "Console Log",
        snippet: "console.log();"
    },
    {
        trigger: "console",
        title: "Console Log",
        snippet: "console.log();"
    },
    {
        trigger: "log",
        title: "Console Log",
        snippet: "console.log();"
    },
    {
        trigger: "arrow",
        title: "Arrow Function",
        snippet: "const functionName = () => {\n    // Your code here\n};"
    },
    {
        trigger: "=>",
        title: "Arrow Function",
        snippet: "const functionName = () => {\n    // Your code here\n};"
    },
    {
        trigger: "for",
        title: "For Loop",
        snippet: "for (let i = 0; i < length; i++) {\n    // Your code here\n}"
    },
    {
        trigger: "if",
        title: "If Statement",
        snippet: "if (condition) {\n    // Your code here\n}"
    },
    {
        trigger: "const",
        title: "Const Declaration",
        snippet: "const variableName = value;"
    },
    {
        trigger: "let",
        title: "Let Declaration",
        snippet: "let variableName = value;"
    }
];

// Get current word being typed
function getCurrentWord() {
    const text = codeInput.value;
    const cursor = codeInput.selectionStart;
    
    // Find the start of the current word
    let start = cursor;
    while (start > 0 && /\w|\./.test(text[start - 1])) {
        start--;
    }
    
    // Find the end of the current word
    let end = cursor;
    while (end < text.length && /\w/.test(text[end])) {
        end++;
    }
    
    return {
        word: text.substring(start, end),
        start: start,
        end: end
    };
}

// Show autocomplete suggestions
function showAutocomplete(suggestions, cursorPos) {
    if (suggestions.length === 0) {
        hideAutocomplete();
        return;
    }
    
    // Clear previous suggestions
    autocompleteDropdown.innerHTML = '';
    
    // Add suggestions to dropdown
    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        if (index === 0) item.classList.add('selected');
        
        item.innerHTML = `
            <div class="autocomplete-item-title">${suggestion.title}</div>
            <div class="autocomplete-item-snippet">${suggestion.snippet.replace(/\n/g, '\\n')}</div>
        `;
        
        item.addEventListener('click', () => {
            insertSuggestion(suggestion);
            hideAutocomplete();
        });
        
        autocompleteDropdown.appendChild(item);
    });
    
    // Position dropdown
    const textareaRect = codeInput.getBoundingClientRect();
    const editorRect = codeInput.parentElement.getBoundingClientRect();
    
    // Calculate approximate cursor position
    const lines = codeInput.value.substring(0, cursorPos).split('\n');
    const currentLine = lines.length - 1;
    const currentCol = lines[lines.length - 1].length;
    
    // Approximate positioning (this is basic - could be improved)
    const lineHeight = 21; // Approximate line height
    const charWidth = 8.4; // Approximate character width
    
    autocompleteDropdown.style.left = `${4 + (currentCol * charWidth)}rem`;
    autocompleteDropdown.style.top = `${1 + ((currentLine + 1) * lineHeight)}px`;
    autocompleteDropdown.style.display = 'block';
    
    selectedIndex = 0;
}

// Hide autocomplete
function hideAutocomplete() {
    autocompleteDropdown.style.display = 'none';
    selectedIndex = -1;
}

// Insert selected suggestion
function insertSuggestion(suggestion) {
    const currentWord = getCurrentWord();
    const text = codeInput.value;
    const before = text.substring(0, currentWord.start);
    const after = text.substring(currentWord.end);
    
    const newText = before + suggestion.snippet + after;
    codeInput.value = newText;
    
    // Position cursor after insertion
    let cursorPos = before.length + suggestion.snippet.length;
    
    // If snippet contains parentheses, position cursor inside them
    if (suggestion.snippet.includes('()')) {
        cursorPos = before.length + suggestion.snippet.indexOf('()') + 1;
    }
    // If snippet contains function name placeholder, select it
    else if (suggestion.snippet.includes('functionName')) {
        const nameStart = before.length + suggestion.snippet.indexOf('functionName');
        codeInput.focus();
        codeInput.setSelectionRange(nameStart, nameStart + 'functionName'.length);
        updateDisplay();
        return;
    }
    
    codeInput.focus();
    codeInput.setSelectionRange(cursorPos, cursorPos);
    updateDisplay();
}

// Handle autocomplete input
function handleAutocompleteInput() {
    const currentWord = getCurrentWord();
    
    if (currentWord.word.length < 2) {
        hideAutocomplete();
        return;
    }
    
    // Filter suggestions based on current word
    const filteredSuggestions = autocompleteSuggestions.filter(suggestion =>
        suggestion.trigger.toLowerCase().startsWith(currentWord.word.toLowerCase())
    );
    
    if (filteredSuggestions.length > 0) {
        showAutocomplete(filteredSuggestions, codeInput.selectionStart);
    } else {
        hideAutocomplete();
    }
}

// Navigate autocomplete with arrow keys
function navigateAutocomplete(direction) {
    const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
    if (items.length === 0) return false;
    
    // Remove current selection
    if (selectedIndex >= 0 && selectedIndex < items.length) {
        items[selectedIndex].classList.remove('selected');
    }
    
    // Update selection
    if (direction === 'down') {
        selectedIndex = (selectedIndex + 1) % items.length;
    } else if (direction === 'up') {
        selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
    }
    
    // Add new selection
    items[selectedIndex].classList.add('selected');
    
    // Scroll item into view
    items[selectedIndex].scrollIntoView({ block: 'nearest' });
    
    return true;
}

// Accept selected autocomplete suggestion
function acceptSuggestion() {
    const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
    if (selectedIndex >= 0 && selectedIndex < items.length) {
        const suggestion = autocompleteSuggestions.find(s => 
            s.title === items[selectedIndex].querySelector('.autocomplete-item-title').textContent
        );
        if (suggestion) {
            insertSuggestion(suggestion);
            hideAutocomplete();
            return true;
        }
    }
    return false;
}

// Modify the existing codeInput event listeners
// Replace the existing keydown event listener with this enhanced version:
codeInput.addEventListener("keydown", (e) => {
    // Handle autocomplete navigation
    if (autocompleteDropdown.style.display === 'block') {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateAutocomplete('down');
            return;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateAutocomplete('up');
            return;
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            if (acceptSuggestion()) {
                return;
            }
        } else if (e.key === 'Escape') {
            hideAutocomplete();
            return;
        }
    }
    
    // Existing functionality
    if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        executeCode();
    }

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
    }
});

// Add input event listener for autocomplete (add this as a new event listener)
codeInput.addEventListener("input", (e) => {
    updateDisplay(); // Keep existing functionality
    
    // Trigger autocomplete after a short delay
    clearTimeout(window.autocompleteTimeout);
    window.autocompleteTimeout = setTimeout(() => {
        handleAutocompleteInput();
    }, 150);
});

// Hide autocomplete when clicking outside
document.addEventListener('click', (e) => {
    if (!codeInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
        hideAutocomplete();
    }
});

// Hide autocomplete when textarea loses focus
codeInput.addEventListener('blur', () => {
    // Delay hiding to allow clicks on dropdown
    setTimeout(() => {
        hideAutocomplete();
    }, 150);
});

// Initialize
setupConsoleCapture();
updateDisplay();
loadExample();
