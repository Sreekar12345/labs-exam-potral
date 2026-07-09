import { NextResponse } from "next/server";
import { spawn, exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { promisify } from "util";

const execAsync = promisify(exec);

async function isDockerAvailable(): Promise<boolean> {
  try {
    await execAsync("docker ps");
    return true;
  } catch {
    return false;
  }
}

// Helper to run code with a timeout and stdin feed
const runProcess = (
  cmd: string,
  args: string[],
  inputData: string
): Promise<{ stdout: string; stderr: string; code: number | null; error?: string }> => {
  return new Promise((resolve) => {
    let child: any;
    try {
      child = spawn(cmd, args, { shell: true });
    } catch (err: any) {
      resolve({
        stdout: "",
        stderr: "",
        code: null,
        error: err.message || "Failed to spawn process",
      });
      return;
    }

    let stdout = "";
    let stderr = "";
    let resolved = false;

    // Timeout of 30 seconds to prevent TLE / infinite loops
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try {
          child.kill("SIGKILL");
        } catch (e) {}
        resolve({
          stdout,
          stderr: stderr + "\nTime Limit Exceeded: Execution timed out after 30 seconds.",
          code: null,
          error: "TLE",
        });
      }
    }, 30000);

    if (child.stdout) {
      child.stdout.on("data", (data: any) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on("data", (data: any) => {
        stderr += data.toString();
      });
    }

    child.on("error", (err: any) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({ stdout, stderr, code: null, error: err.message });
      }
    });

    child.on("close", (code: number | null) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({ stdout, stderr, code });
      }
    });

    // Write test case input to child process stdin
    if (child.stdin) {
      if (inputData) {
        try {
          child.stdin.write(inputData);
        } catch (e) {
          // Stdin might close early if process errors out immediately
        }
      }
      try {
        child.stdin.end();
      } catch (e) {}
    }
  });
};

// Clean comments and strings from code to analyze identifiers safely
function cleanCodeForAnalysis(code: string): string {
  // 1. Remove comments
  let clean = code.replace(/#[^\n]*/g, "");
  // 2. Remove triple-quoted strings ('''...''' or """...""")
  clean = clean.replace(/'''[\s\S]*?'''/g, "");
  clean = clean.replace(/"""[\s\S]*?"""/g, "");
  // 3. Remove double-quoted and single-quoted strings
  clean = clean.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, "");
  clean = clean.replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, "");
  return clean;
}

// JS/TS-based Python validator and simulator for institutional questions
export function simulatePython(questionTitle: string, userCode: string, input: string): { stdout: string; stderr: string; exitCode: number } {
  const lines = userCode.split('\n');
  let cleanTitle = (questionTitle || "").trim().toLowerCase();

  // If questionTitle is empty/missing, infer it from the sample input structure
  if (!cleanTitle && input) {
    const normInput = input.trim();
    if (normInput === "5\n10 20 30 40 50" || normInput === "5 10 20 30 40 50") {
      if (userCode.includes("reverse") || userCode.includes("[::-1]") || userCode.includes("reversed")) {
        cleanTitle = "reverse the elements";
      } else {
        cleanTitle = "sum of elements";
      }
    } else if (normInput === "python") {
      if (userCode.includes("len(")) {
        cleanTitle = "count the characters in a string";
      } else if (userCode.includes("upper")) {
        cleanTitle = "lowercase to uppercase";
      } else {
        cleanTitle = "reverse the string";
      }
    } else if (normInput === "madam") {
      cleanTitle = "palindrome of string";
    } else if (normInput === "Python is easy to learn") {
      cleanTitle = "count the number of words";
    } else if (normInput === "banana") {
      cleanTitle = "character frequency winner";
    } else if (normInput === "abba") {
      cleanTitle = "mirror word check";
    } else if (normInput === "Python is easy") {
      if (userCode.includes("len") || userCode.includes("weight") || userCode.includes(":")) {
        cleanTitle = "word weight calculator";
      } else if (userCode.includes("replace") || userCode.includes("-")) {
        cleanTitle = "replace space with hyphen";
      } else {
        cleanTitle = "reverse each word in a sentence";
      }
    } else if (normInput === "abc123@#$") {
      if (userCode.includes("len") || userCode.includes("count")) {
        cleanTitle = "count the special characters in a string";
      } else {
        cleanTitle = "special character filter";
      }
    } else if (normInput === "5\n12 45 8 67 23" || normInput === "5 12 45 8 67 23") {
      cleanTitle = "find the largest number";
    } else if (normInput === "6\n10 15 20 25 30 35" || normInput === "6 10 15 20 25 30 35") {
      cleanTitle = "print only even numbers";
    } else if (normInput === "6\n1 2 3 4 5 6" || normInput === "6 1 2 3 4 5 6") {
      cleanTitle = "count of even and odd numbers";
    } else if (normInput === "6\n10 -5 20 -15 30 -10" || normInput === "6 10 -5 20 -15 30 -10") {
      cleanTitle = "sum of positive and negative numbers";
    } else if (normInput === "7\n10 -5 15 -20 25 -30 40" || normInput === "7 10 -5 15 -20 25 -30 40") {
      cleanTitle = "count and sum of positive and negative numbers";
    } else if (normInput === "abc123xyz45") {
      cleanTitle = "count the numbers in a string";
    } else if (normInput === "programming") {
      cleanTitle = "remove duplicate characters";
    } else if (normInput === "PyThOn") {
      cleanTitle = "toggle case";
    }
  }

  // 1. Basic Bracket Matching Check
  const stack: { char: string; line: number }[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].split('#')[0];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '(' || c === '[' || c === '{') {
        stack.push({ char: c, line: i + 1 });
      } else if (c === ')' || c === ']' || c === '}') {
        const top = stack.pop();
        if (!top || top.char !== pairs[c]) {
          return {
            stdout: "",
            stderr: `  File "solution.py", line ${i + 1}\n    ${lines[i].trim()}\nSyntaxError: unmatched '${c}'`,
            exitCode: 1
          };
        }
      }
    }
  }
  if (stack.length > 0) {
    const top = stack.pop()!;
    return {
      stdout: "",
      stderr: `  File "solution.py", line ${top.line}\nSyntaxError: unexpected EOF while parsing (unclosed '${top.char}')`,
      exitCode: 1
    };
  }

  // 2. Colon Check for Blocks
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#') || line === "") continue;
    const cleanLine = line.split('#')[0].trim();
    if (/^(def|class|if|elif|else|for|while|try|except)\b/.test(cleanLine)) {
      if (!cleanLine.endsWith(':')) {
        return {
          stdout: "",
          stderr: `  File "solution.py", line ${i + 1}\n    ${line}\nSyntaxError: expected ':'`,
          exitCode: 1
        };
      }
    }
  }

  // 2.5. Invalid colons check (e.g. 'a'<=ch <= 'z': without block keyword)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#') || line === "") continue;
    const cleanLine = line.split('#')[0].trim();
    if (cleanLine.endsWith(':')) {
      const startsWithKeyword = /^(def|class|if|elif|else|for|while|try|except|finally|with|async)\b/.test(cleanLine);
      if (!startsWithKeyword) {
        let openBrackets = 0;
        for (const c of cleanLine) {
          if (c === '(' || c === '[' || c === '{') openBrackets++;
          if (c === ')' || c === ']' || c === '}') openBrackets--;
        }
        if (openBrackets === 0) {
          return {
            stdout: "",
            stderr: `  File "solution.py", line ${i + 1}\n    ${line}\nSyntaxError: invalid syntax`,
            exitCode: 1
          };
        }
      }
    }
  }

  // 2.6. Indentation check after block start
  let expectIndentNext = false;
  let prevIndent = 0;
  let prevLineNum = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    const currentIndent = line.length - line.trimStart().length;

    if (expectIndentNext) {
      if (currentIndent <= prevIndent) {
        return {
          stdout: "",
          stderr: `  File "solution.py", line ${i + 1}\n    ${line.trim()}\nIndentationError: expected an indented block after '${lines[prevLineNum].trim()}'`,
          exitCode: 1
        };
      }
      expectIndentNext = false;
    }

    const cleanLine = line.split('#')[0].trim();
    if (cleanLine.endsWith(':')) {
      expectIndentNext = true;
      prevIndent = currentIndent;
      prevLineNum = i;
    }
  }

  // 2.7. Undefined function calls check (e.g. inpt())
  const cleanCodeText = cleanCodeForAnalysis(userCode);
  const userFuncs = new Set<string>();
  for (const line of lines) {
    const match = line.trim().match(/^(?:def|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (match) {
      userFuncs.add(match[1]);
    }
  }

  const standardBuiltins = new Set([
    "input", "print", "len", "int", "str", "chr", "ord", "range", "list", "dict", "set", "sum", "max", "min", "sorted",
    "float", "abs", "round", "type", "enumerate", "zip", "map", "filter", "bool", "repr", "dir", "help", "next",
    "iter", "isinstance", "issubclass", "getattr", "setattr", "hasattr", "delattr", "callable", "eval", "exec", "hash",
    "id", "pow", "divmod", "all", "any", "reversed", "super", "property", "staticmethod", "classmethod"
  ]);

  const callRegex = /(?:\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\(|\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\()/g;
  let callMatch;
  while ((callMatch = callRegex.exec(cleanCodeText)) !== null) {
    const funcName = callMatch[2]; // Group 2 matches standalone functions (not preceded by dot)
    if (funcName && !standardBuiltins.has(funcName) && !userFuncs.has(funcName)) {
      let errLine = 1;
      for (let i = 0; i < lines.length; i++) {
        const lineStr = cleanCodeForAnalysis(lines[i]);
        const idx = lineStr.indexOf(funcName);
        if (idx !== -1 && (idx === 0 || lineStr[idx - 1] !== '.')) {
          errLine = i + 1;
          break;
        }
      }
      return {
        stdout: "",
        stderr: `  File "solution.py", line ${errLine}\n    ${lines[errLine-1].trim()}\nNameError: name '${funcName}' is not defined`,
        exitCode: 1
      };
    }
  }

  // 3. Python 3 Print Statement Check
  if (/\bprint\s+[^(\s]/.test(userCode)) {
    let errLine = 1;
    for (let i = 0; i < lines.length; i++) {
      if (/\bprint\s+[^(\s]/.test(lines[i])) {
        errLine = i + 1;
        break;
      }
    }
    return {
      stdout: "",
      stderr: `  File "solution.py", line ${errLine}\n    ${lines[errLine-1].trim()}\nSyntaxError: Missing parentheses in call to 'print'. Did you mean print(...)?`,
      exitCode: 1
    };
  }

  // 3.5. Callable method reference checks (detecting references to string/list methods without parentheses)
  const cleanCode = cleanCodeForAnalysis(userCode);
  const callables = [
    "join", "upper", "lower", "split", "swapcase", "strip", "replace", 
    "isdigit", "isnumeric", "isalpha", "isalnum", "input"
  ];
  
  for (const name of callables) {
    const regex = new RegExp(`\\b${name}\\b(?!\\s*\\()`);
    if (regex.test(cleanCode)) {
      let errLine = 1;
      for (let i = 0; i < lines.length; i++) {
        const lineClean = cleanCodeForAnalysis(lines[i]);
        if (new RegExp(`\\b${name}\\b(?!\\s*\\()`).test(lineClean)) {
          errLine = i + 1;
          break;
        }
      }
      return {
        stdout: "",
        stderr: `  File "solution.py", line ${errLine}\n    ${lines[errLine-1].trim()}\nTypeError: '${name}' object is not callable or was referenced without parentheses`,
        exitCode: 1
      };
    }
  }

  // 4. Try running the user's code using the JS-based Python runner
  try {
    const inputLines = input.split('\n');
    let inputIndex = 0;
    const consoleOutputs: string[] = [];

    const context: Record<string, any> = {
      input: () => {
        if (inputIndex < inputLines.length) {
          return inputLines[inputIndex++];
        }
        return "";
      },
      print: (...args: any[]) => {
        consoleOutputs.push(args.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' '));
      },
      len: (x: any) => {
        if (x && typeof x.length === 'number') return x.length;
        if (x && typeof x.size === 'number') return x.size;
        return 0;
      },
      int: (x: any) => {
        const p = parseInt(x, 10);
        return isNaN(p) ? 0 : p;
      },
      float: (x: any) => {
        const p = parseFloat(x);
        return isNaN(p) ? 0.0 : p;
      },
      str: (x: any) => String(x),
      chr: (x: any) => String.fromCharCode(x),
      ord: (x: any) => {
        if (typeof x === 'string' && x.length > 0) return x.charCodeAt(0);
        throw new Error("TypeError: ord() expected string of length 1");
      },
      list: (x: any) => {
        if (typeof x === 'string') return x.split('');
        if (Array.isArray(x)) return [...x];
        if (x && typeof x[Symbol.iterator] === 'function') return Array.from(x);
        return [];
      },
      dict: (x: any) => ({}),
      set: (x: any) => {
        if (Array.isArray(x)) return new Set(x);
        return new Set();
      },
      sum: (x: any) => {
        if (Array.isArray(x)) {
          return x.reduce((a, b) => Number(a) + Number(b), 0);
        }
        return 0;
      },
      max: (...args: any[]) => {
        if (args.length === 1 && Array.isArray(args[0])) {
          return Math.max(...args[0].map(Number));
        }
        return Math.max(...args.map(Number));
      },
      min: (...args: any[]) => {
        if (args.length === 1 && Array.isArray(args[0])) {
          return Math.min(...args[0].map(Number));
        }
        return Math.min(...args.map(Number));
      },
      sorted: (x: any) => {
        if (Array.isArray(x)) {
          return [...x].sort((a, b) => String(a).localeCompare(String(b)));
        }
        return [];
      },
      range: (start: number, stop?: number, step: number = 1) => {
        let actualStart = start;
        let actualStop = stop;
        if (actualStop === undefined) {
          actualStop = start;
          actualStart = 0;
        }
        const arr: number[] = [];
        for (let i = actualStart; i < actualStop; i += step) {
          arr.push(i);
        }
        return arr;
      },
      map: (func: Function, iterable: any) => {
        if (!iterable || typeof iterable.map !== 'function') {
          throw new Error("TypeError: map() argument 2 must be iterable");
        }
        return iterable.map(func);
      },
      filter: (func: Function, iterable: any) => {
        if (!iterable || typeof iterable.filter !== 'function') {
          throw new Error("TypeError: filter() argument 2 must be iterable");
        }
        return iterable.filter(func);
      },
      abs: (x: any) => Math.abs(Number(x)),
      round: (x: any) => Math.round(Number(x)),
      enumerate: (x: any) => {
        if (Array.isArray(x)) {
          return x.map((val, idx) => [idx, val]);
        }
        return [];
      },
      zip: (a: any[], b: any[]) => {
        const len = Math.min(a.length, b.length);
        const arr = [];
        for (let i = 0; i < len; i++) {
          arr.push([a[i], b[i]]);
        }
        return arr;
      },
      pyIn: (x: any, y: any) => {
        if (!y) return false;
        if (typeof y.has === 'function') return y.has(x);
        if (typeof y.includes === 'function') return y.includes(x);
        if (typeof y === 'string') return y.includes(String(x));
        if (Array.isArray(y)) return y.includes(x);
        if (typeof y === 'object') return x in y;
        return false;
      }
    };

    // Transpile userCode to JS
    const codeLines = userCode.split('\n');
    const jsLines: string[] = [];
    const indentStack: number[] = [];

    for (let idx = 0; idx < codeLines.length; idx++) {
      const line = codeLines[idx];
      const trimmed = line.trim();

      if (trimmed === "" || trimmed.startsWith("#")) {
        continue;
      }

      const currentIndent = line.length - line.trimStart().length;

      while (indentStack.length > 0 && indentStack[indentStack.length - 1] >= currentIndent) {
        indentStack.pop();
        const parentIndent = indentStack.length > 0 ? indentStack[indentStack.length - 1] : 0;
        jsLines.push(" ".repeat(parentIndent) + "}");
      }

      let statement = trimmed;
      if (statement.endsWith(':')) {
        statement = statement.slice(0, -1).trim();
      }

      let processed = statement;

      if (statement.startsWith("def ")) {
        const match = statement.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/);
        if (match) {
          processed = `function ${match[1]}(${match[2]}) {`;
          indentStack.push(currentIndent);
        }
      } else if (statement.startsWith("if ")) {
        const cond = statement.slice(3).trim();
        processed = `if (${translateExpr(cond)}) {`;
        indentStack.push(currentIndent);
      } else if (statement.startsWith("elif ")) {
        const cond = statement.slice(5).trim();
        processed = `else if (${translateExpr(cond)}) {`;
        indentStack.push(currentIndent);
      } else if (statement === "else") {
        processed = `else {`;
        indentStack.push(currentIndent);
      } else if (statement.startsWith("for ")) {
        const forMatch = statement.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+(.*)/);
        if (forMatch) {
          const item = forMatch[1];
          const iterable = translateExpr(forMatch[2]);
          processed = `let loop_cnt_${idx} = 0;\nfor (let ${item} of ${iterable}) {\nif (++loop_cnt_${idx} > 1000) throw new Error("Time Limit Exceeded: Loop execution limit exceeded (1000 iterations)");`;
          indentStack.push(currentIndent);
        }
      } else if (statement.startsWith("while ")) {
        const cond = statement.slice(6).trim();
        processed = `let loop_cnt_${idx} = 0;\nwhile (${translateExpr(cond)}) {\nif (++loop_cnt_${idx} > 1000) throw new Error("Time Limit Exceeded: Loop execution limit exceeded (1000 iterations)");`;
        indentStack.push(currentIndent);
      } else {
        processed = translateExpr(statement);
      }

      jsLines.push(" ".repeat(currentIndent) + processed);
    }

    while (indentStack.length > 0) {
      indentStack.pop();
      const parentIndent = indentStack.length > 0 ? indentStack[indentStack.length - 1] : 0;
      jsLines.push(" ".repeat(parentIndent) + "}");
    }

    function translateExpr(expr: string): string {
      let t = expr;

      // 1. Double slash integer division (e.g. a // b -> Math.floor(a / b))
      t = t.replace(/([a-zA-Z0-9_]+(?:\([^)]*\))?)\s*\/\/\s*([a-zA-Z0-9_]+(?:\([^)]*\))?)/g, 'Math.floor(($1) / ($2))');

      // 2. Triple colon / step slices
      t = t.replace(/\[\s*:\s*:\s*-1\s*\]/g, '.split("").reverse().join("")');
      t = t.replace(/\[\s*:\s*:\s*2\s*\]/g, '.split("").filter((_, i) => i % 2 === 0).join("")');

      // 3. Single colon slices (e.g. s[a:b], s[a:], s[:b])
      // s[a:b]
      t = t.replace(/([a-zA-Z0-9_]+)\[([^\]:]+):([^\]:]+)\]/g, '$1.slice($2, $3)');
      // s[a:]
      t = t.replace(/([a-zA-Z0-9_]+)\[([^\]:]+):\]/g, '$1.slice($2)');
      // s[:b]
      t = t.replace(/([a-zA-Z0-9_]+)\[:([^\]:]+)\]/g, '$1.slice(0, $2)');

      // 3.5. Membership checks (e.g. x in y -> pyIn(x, y))
      t = t.replace(/(\b[a-zA-Z0-9_]+|["'][^"']*["'])\s+not\s+in\s+(\b[a-zA-Z0-9_]+(?:\([^)]*\))?|["'][^"']*["'])/g, '!pyIn($1, $2)');
      t = t.replace(/(\b[a-zA-Z0-9_]+|["'][^"']*["'])\s+in\s+(\b[a-zA-Z0-9_]+(?:\([^)]*\))?|["'][^"']*["'])/g, 'pyIn($1, $2)');

      // 4. Comparison and logical operators
      t = t.replace(/\band\b/g, '&&');
      t = t.replace(/\bor\b/g, '||');
      t = t.replace(/\bnot\b/g, '!');
      t = t.replace(/\bTrue\b/g, 'true');
      t = t.replace(/\bFalse\b/g, 'false');
      t = t.replace(/\bNone\b/g, 'null');

      // 5. String/list method overrides
      t = t.replace(/\.append\s*\(/g, '.push(');
      t = t.replace(/\.split\s*\(\s*\)/g, '.split(/\\s+/)');
      t = t.replace(/\.lower\s*\(\)/g, '.toLowerCase()');
      t = t.replace(/\.upper\s*\(\)/g, '.toUpperCase()');
      t = t.replace(/\.swapcase\s*\(\)/g, '.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("")');
      t = t.replace(/\.strip\s*\(\s*\)/g, '.trim()');
      t = t.replace(/\.replace\s*\(/g, '.replaceAll(');
      return t;
    }

    // Append call to solve() if not present
    let runsSolve = false;
    for (const line of codeLines) {
      if (line.trim().startsWith("solve(")) {
        runsSolve = true;
      }
    }
    if (!runsSolve && userCode.includes("def solve(")) {
      jsLines.push("solve();");
    }

    const script = `
      const { input, print, len, int, float, str, chr, ord, list, dict, set, sum, max, min, sorted, range, map, filter, abs, round, enumerate, zip, pyIn } = context;
      ${jsLines.join('\n')}
    `;

    const runner = new Function("context", script);
    runner(context);

    const actualOutput = consoleOutputs.join('\n');

    // Generate expected output using standard logic
    let expectedOutput = "";
    const cleanInput = input.trim();

    if (cleanTitle.includes("reverse each word")) {
      expectedOutput = cleanInput.split(/\s+/).map(w => w.split("").reverse().join("")).join(" ");
    } else if (cleanTitle.includes("reverse the string")) {
      expectedOutput = cleanInput.split("").reverse().join("");
    } else if (cleanTitle.includes("sum of list") || cleanTitle.includes("sum of elements")) {
      const numbers = cleanInput.split(/\s+/).slice(1).map(Number);
      expectedOutput = numbers.reduce((a, b) => a + b, 0).toString();
    } else if (cleanTitle.includes("count the characters")) {
      expectedOutput = cleanInput.length.toString();
    } else if (cleanTitle.includes("palindrome of string")) {
      const isPal = cleanInput.toLowerCase() === cleanInput.toLowerCase().split("").reverse().join("");
      expectedOutput = isPal ? "Palindrome" : "Not Palindrome";
    } else if (cleanTitle.includes("lowercase to uppercase")) {
      expectedOutput = cleanInput.toUpperCase();
    } else if (cleanTitle.includes("count the number of words")) {
      expectedOutput = cleanInput.split(/\s+/).filter(Boolean).length.toString();
    } else if (cleanTitle.includes("alternate character removal")) {
      expectedOutput = cleanInput.split("").filter((_, idx) => idx % 2 === 0).join("");
    } else if (cleanTitle.includes("character frequency winner")) {
      const freq: Record<string, number> = {};
      let maxChar = "";
      let maxCount = 0;
      for (const char of cleanInput) {
        freq[char] = (freq[char] || 0) + 1;
        if (freq[char] > maxCount) {
          maxCount = freq[char];
          maxChar = char;
        }
      }
      expectedOutput = maxChar;
    } else if (cleanTitle.includes("mirror word")) {
      const isPal = cleanInput.toLowerCase() === cleanInput.toLowerCase().split("").reverse().join("");
      expectedOutput = isPal ? "Mirror Word" : "Not a Mirror Word";
    } else if (cleanTitle.includes("word weight")) {
      const words = cleanInput.split(/\s+/).filter(Boolean);
      expectedOutput = words.map(w => `${w} : ${w.length}`).join("\n");
    } else if (cleanTitle.includes("special character filter")) {
      expectedOutput = cleanInput.split("").filter(c => !/[a-zA-Z0-9]/.test(c)).join("");
    } else if (cleanTitle.includes("find the largest number")) {
      const numbers = cleanInput.split(/\s+/).slice(1).map(Number);
      expectedOutput = Math.max(...numbers).toString();
    } else if (cleanTitle.includes("print only even")) {
      const numbers = cleanInput.split(/\s+/).slice(1).map(Number);
      expectedOutput = numbers.filter(n => n % 2 === 0).join(" ");
    } else if (cleanTitle.includes("count of even and odd")) {
      const numbers = cleanInput.split(/\s+/).slice(1).map(Number);
      const evens = numbers.filter(n => n % 2 === 0).length;
      const odds = numbers.length - evens;
      expectedOutput = `Even Count : ${evens}\nOdd Count : ${odds}`;
    } else if (cleanTitle.includes("reverse the elements")) {
      const numbers = cleanInput.split(/\s+/).slice(1);
      expectedOutput = numbers.reverse().join(" ");
    } else if (cleanTitle.includes("sum of positive and negative")) {
      const numbers = cleanInput.split(/\s+/).slice(1).map(Number);
      const pos = numbers.filter(n => n > 0).reduce((a, b) => a + b, 0);
      const neg = numbers.filter(n => n < 0).reduce((a, b) => a + b, 0);
      expectedOutput = `Positive Sum : ${pos}\nNegative Sum : ${neg}`;
    } else if (cleanTitle.includes("count and sum of positive")) {
      const numbers = cleanInput.split(/\s+/).slice(1).map(Number);
      const posNums = numbers.filter(n => n > 0);
      const negNums = numbers.filter(n => n < 0);
      const posCount = posNums.length;
      const negCount = negNums.length;
      const posSum = posNums.reduce((a, b) => a + b, 0);
      const negSum = negNums.reduce((a, b) => a + b, 0);
      expectedOutput = `Positive Count : ${posCount}\nNegative Count : ${negCount}\nPositive Sum : ${posSum}\nNegative Sum : ${negSum}`;
    } else if (cleanTitle.includes("count the numbers in a string")) {
      expectedOutput = cleanInput.split("").filter(c => /[0-9]/.test(c)).length.toString();
    } else if (cleanTitle.includes("count the special characters")) {
      expectedOutput = cleanInput.split("").filter(c => !/[a-zA-Z0-9]/.test(c)).length.toString();
    } else if (cleanTitle.includes("remove duplicate")) {
      const seen = new Set();
      const res: string[] = [];
      for (const c of cleanInput) {
        if (!seen.has(c)) {
          seen.add(c);
          res.push(c);
        }
      }
      expectedOutput = res.join("");
    } else if (cleanTitle.includes("toggle case")) {
      expectedOutput = cleanInput.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("");
    } else if (cleanTitle.includes("replace space")) {
      expectedOutput = cleanInput.replace(/\s+/g, "-");
    } else {
      expectedOutput = cleanInput;
    }

    // Match validation using alphanumeric tokens or raw match
    const cleanActual = actualOutput.replace(/['"“”]/g, "").trim().toLowerCase();
    const cleanExpected = expectedOutput.replace(/['"“”]/g, "").trim().toLowerCase();
    
    let isCorrect = cleanActual.replace(/\r/g, "") === cleanExpected.replace(/\r/g, "");
    if (!isCorrect) {
      const toTokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean);
      const tAct = toTokens(cleanActual);
      const tExp = toTokens(cleanExpected);
      if (tAct.length === tExp.length && tAct.length > 0 && tAct.every((t, i) => t === tExp[i])) {
        isCorrect = true;
      }
    }

    // Special constraint check for "without using upper()"
    if (isCorrect && cleanTitle.includes("lowercase to uppercase") && cleanTitle.includes("without")) {
      if (userCode.includes(".upper()")) {
        return {
          stdout: actualOutput,
          stderr: "AssertionError: You are not allowed to call .upper() string method in this challenge.",
          exitCode: 1
        };
      }
    }

    if (isCorrect) {
      return { stdout: actualOutput, stderr: "", exitCode: 0 };
    } else {
      return {
        stdout: actualOutput,
        stderr: `AssertionError: The output does not match the expected test case output.\nActual: ${actualOutput}`,
        exitCode: 1
      };
    }
  } catch (err: any) {
    return {
      stdout: "",
      stderr: `Runtime Error: ${err.message}`,
      exitCode: 1
    };
  }
}

export async function POST(request: Request) {
  let tempFilePath = "";
  try {
    const { code, language, input, questionTitle } = await request.json();

    if (!code) {
      return NextResponse.json(
        { status: "error", message: "Source code is empty" },
        { status: 400 }
      );
    }

    // Unique temp file name
    const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (language === "python" || language === "python3") {
      let sandboxDir = "";
      const dockerActive = await isDockerAvailable();

      if (dockerActive) {
        sandboxDir = path.join(process.cwd(), "sandbox");
        if (!fs.existsSync(sandboxDir)) {
          fs.mkdirSync(sandboxDir, { recursive: true });
        }
        tempFilePath = path.join(sandboxDir, `temp_code_${fileId}.py`);
      } else {
        tempFilePath = path.join(os.tmpdir(), `temp_code_${fileId}.py`);
      }
      
      let finalCode = code;
      const hasPrint = /\bprint\b|\bsys\.stdout\.write\b/.test(code);
      if (!hasPrint) {
        const runnerExtension = `

# Auto-injected runner for function execution from stdin
import sys
import ast
import inspect

try:
    user_funcs = []
    for name, obj in list(globals().items()):
        if name.startswith('_') or not callable(obj):
            continue
        if inspect.ismodule(obj) or inspect.isclass(obj):
            continue
        if name in ['ast', 'sys', 'inspect', 're', 'path', 'fs', 'NextResponse', 'spawn', 'finalCode', 'hasPrint', 'runnerExtension']:
            continue
        user_funcs.append(obj)
        
    if user_funcs:
        try:
            user_funcs.sort(key=lambda f: inspect.getsourcelines(f)[1])
        except Exception:
            pass
        func = user_funcs[-1]
        
        input_str = sys.stdin.read().strip()
        if (input_str.startswith('"') and input_str.endswith('"')) or (input_str.startswith("'") and input_str.endswith("'")):
            eval_input = input_str[1:-1]
        else:
            eval_input = input_str
            
        sig = inspect.signature(func)
        num_params = len(sig.parameters)
        if num_params > 0:
            if num_params == 1:
                try:
                    arg = ast.literal_eval(eval_input)
                except Exception:
                    arg = eval_input
                res = func(arg)
            else:
                parts = eval_input.split(',')
                if len(parts) != num_params:
                    parts = eval_input.split()
                args = []
                for part in parts:
                    try:
                        args.append(ast.literal_eval(part.strip()))
                    except Exception:
                        args.append(part.strip())
                res = func(*args[:num_params])
        else:
            res = func()
        if res is not None:
            print(res)
except Exception:
    pass
`;
        finalCode = code + runnerExtension;
      }

      fs.writeFileSync(tempFilePath, finalCode);

      let result;

      if (dockerActive) {
        const absoluteSandboxDir = path.resolve(sandboxDir).replace(/\\/g, '/');
        const cmd = "docker";
        const args = [
          "run",
          "--rm",
          "-i",
          "--net=none",
          "--memory=128m",
          "--cpus=0.5",
          "-v",
          `${absoluteSandboxDir}:/app`,
          "-w",
          "/app",
          "python-sandbox",
          "python",
          `temp_code_${fileId}.py`
        ];
        result = await runProcess(cmd, args, input || "");
      } else {
        result = await runProcess("python", [tempFilePath], input || "");
        
        // Fallback to python3 if python ENOENT
        if (result.error && (result.error.includes("ENOENT") || result.error.includes("not found"))) {
          result = await runProcess("python3", [tempFilePath], input || "");
        }
      }

      // Cleanup
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {}
      }

      // Fallback to JS/TS python simulator if interpreter is not configured/installed (e.g. Vercel or Windows app execution alias)
      const isCmdNotFound = 
        result.code === 9009 || 
        (result.error && (result.error.includes("ENOENT") || result.error.toLowerCase().includes("not found"))) ||
        (result.stderr && (
          result.stderr.includes("Python was not found") || 
          result.stderr.toLowerCase().includes("not found") || 
          result.stderr.toLowerCase().includes("not recognized") ||
          result.stderr.toLowerCase().includes("command not found") ||
          result.stderr.toLowerCase().includes("no such file")
        ));
      if (isCmdNotFound || (result.error && (result.error.includes("ENOENT") || result.error.includes("not found")))) {
        const simulated = simulatePython(questionTitle || "", code, input || "");
        return NextResponse.json({
          status: "success",
          stdout: simulated.stdout,
          stderr: simulated.stderr,
          exitCode: simulated.exitCode,
          error: simulated.exitCode !== 0 ? (simulated.stderr ? null : "Execution Failed") : null,
        });
      }

      return NextResponse.json({
        status: "success",
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.code,
        error: result.error || null,
      });
    }

    // Fallback for unsupported/non-configured languages (C, C++, Java) on local host
    return NextResponse.json({
      status: "error",
      message: `The ${language.toUpperCase()} compiler is not configured/installed on this host. Currently, only PYTHON is supported for live compilation.`,
    });
  } catch (error: any) {
    console.error("Compilation endpoint error:", error);
    // Cleanup if something crashed
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {}
    }
    return NextResponse.json(
      { status: "error", message: "Internal compiler service error", error: error.message },
      { status: 500 }
    );
  }
}
