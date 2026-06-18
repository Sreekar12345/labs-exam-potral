import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// Helper to run code with a timeout and stdin feed
const runProcess = (
  cmd: string,
  args: string[],
  inputData: string
): Promise<{ stdout: string; stderr: string; code: number | null; error?: string }> => {
  return new Promise((resolve) => {
    const child = spawn(cmd, args);
    let stdout = "";
    let stderr = "";
    let resolved = false;

    // Timeout of 5 seconds to prevent TLE / infinite loops
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill("SIGKILL");
        resolve({
          stdout,
          stderr: stderr + "\nTime Limit Exceeded: Execution timed out after 5 seconds.",
          code: null,
          error: "TLE",
        });
      }
    }, 5000);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({ stdout, stderr, code: null, error: err.message });
      }
    });

    child.on("close", (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({ stdout, stderr, code });
      }
    });

    // Write test case input to child process stdin
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
  });
};

export async function POST(request: Request) {
  let tempFilePath = "";
  try {
    const { code, language, input } = await request.json();

    if (!code) {
      return NextResponse.json(
        { status: "error", message: "Source code is empty" },
        { status: 400 }
      );
    }

    const tempDir = path.join(process.cwd(), "temp_run");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Unique temp file name
    const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (language === "python" || language === "python3") {
      tempFilePath = path.join(tempDir, `temp_code_${fileId}.py`);
      
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

      const result = await runProcess("python", [tempFilePath], input || "");

      // Cleanup
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
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
