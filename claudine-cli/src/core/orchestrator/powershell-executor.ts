/**
 * PowerShell Function Executor
 * 
 * Invokes PowerShell scripts and functions from TypeScript via Bun.spawn().
 * Handles parameter serialization, JSON output parsing, and error handling.
 * 
 * Architecture: Bridge between TypeScript CLI and PowerShell tools
 */

import path from 'node:path';
import { existsSync } from 'node:fs';

export interface PowerShellInvokeOptions {
  captureOutput?: boolean;     // Capture stdout/stderr (default: true)
  parseJson?: boolean;          // Parse stdout as JSON (default: true)
  timeout?: number;             // Timeout in ms (default: 60000)
  workingDirectory?: string;    // Working directory for script execution
  quiet?: boolean;              // Suppress PowerShell output (default: false)
}

export interface PowerShellResult<T = any> {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  data?: T;                     // Parsed JSON data (if parseJson: true)
  error?: string;               // Error message (if failed)
  duration: number;             // Execution time in ms
}

export class PowerShellExecutor {
  private scriptsDir: string;

  constructor(scriptsDir?: string) {
    // Default to workspace/scripts directory
    this.scriptsDir = scriptsDir || path.join(process.cwd(), '..', 'scripts');
  }

  /**
   * Invoke a PowerShell script with optional parameters
   * 
   * @example
   * await executor.invokeScript('claudineENV.ps1', ['-ShowVersions'])
   */
  async invokeScript(
    scriptName: string,
    args: string[] = [],
    options: PowerShellInvokeOptions = {}
  ): Promise<PowerShellResult> {
    const startTime = Date.now();
    const scriptPath = path.join(this.scriptsDir, scriptName);

    // Validate script exists
    if (!existsSync(scriptPath)) {
      return {
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: `Script not found: ${scriptPath}`,
        error: `Script not found: ${scriptPath}`,
        duration: Date.now() - startTime
      };
    }

    try {
      // Build PowerShell command
      const psArgs = [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-File', scriptPath,
        ...args
      ];

      // Spawn PowerShell process
      const proc = Bun.spawn(['pwsh.exe', ...psArgs], {
        stdout: options.captureOutput !== false ? 'pipe' : 'inherit',
        stderr: options.captureOutput !== false ? 'pipe' : 'inherit',
        cwd: options.workingDirectory || process.cwd()
      });

      // Capture output
      const stdoutPromise = options.captureOutput !== false
        ? Bun.readableStreamToText(proc.stdout)
        : Promise.resolve('');
      
      const stderrPromise = options.captureOutput !== false
        ? Bun.readableStreamToText(proc.stderr)
        : Promise.resolve('');

      // Wait for process with timeout
      const exitCodePromise = proc.exited;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), options.timeout || 60000);
      });

      const [stdout, stderr, exitCode] = await Promise.all([
        stdoutPromise,
        stderrPromise,
        Promise.race([exitCodePromise, timeoutPromise])
      ]);

      const duration = Date.now() - startTime;

      // Parse JSON output if requested
      let data: any = undefined;
      if (options.parseJson !== false && stdout.trim()) {
        try {
          data = JSON.parse(stdout);
        } catch (e) {
          // Not valid JSON, leave data undefined
        }
      }

      return {
        success: exitCode === 0,
        exitCode,
        stdout,
        stderr,
        data,
        error: exitCode !== 0 ? stderr || 'Script failed' : undefined,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: String(error),
        error: String(error),
        duration
      };
    }
  }

  /**
   * Invoke a specific function within a PowerShell script
   * 
   * This sources the script, then calls the specified function with parameters.
   * Parameters are automatically serialized to PowerShell syntax.
   * 
   * @example
   * await executor.invokeFunction('claudineENV_F.ps1', 'new-python', {
   *   Name: 'myproject',
   *   Template: 'web',
   *   Path: 'C:\\Projects'
   * })
   */
  async invokeFunction<T = any>(
    scriptName: string,
    functionName: string,
    params: Record<string, any> = {},
    options: PowerShellInvokeOptions = {}
  ): Promise<PowerShellResult<T>> {
    const startTime = Date.now();
    const scriptPath = path.join(this.scriptsDir, scriptName);

    // Validate script exists
    if (!existsSync(scriptPath)) {
      return {
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: `Script not found: ${scriptPath}`,
        error: `Script not found: ${scriptPath}`,
        duration: Date.now() - startTime
      };
    }

    try {
      // Build PowerShell command that:
      // 1. Sources the script (dot-sourcing)
      // 2. Invokes the function with serialized parameters
      // 3. Converts output to JSON for parsing
      const paramString = this.serializeParams(params);
      const psCommand = `
        . "${scriptPath}";
        $result = ${functionName} ${paramString};
        if ($result -is [System.Collections.Hashtable] -or $result -is [PSCustomObject]) {
          $result | ConvertTo-Json -Depth 10 -Compress
        } elseif ($result -is [bool]) {
          @{ success = $result } | ConvertTo-Json -Compress
        } else {
          @{ output = $result } | ConvertTo-Json -Depth 10 -Compress
        }
      `.trim();

      // Spawn PowerShell process
      const proc = Bun.spawn(['pwsh.exe', '-NoProfile', '-Command', psCommand], {
        stdout: 'pipe',
        stderr: 'pipe',
        cwd: options.workingDirectory || process.cwd()
      });

      // Capture output
      const [stdout, stderr, exitCode] = await Promise.all([
        Bun.readableStreamToText(proc.stdout),
        Bun.readableStreamToText(proc.stderr),
        proc.exited
      ]);

      const duration = Date.now() - startTime;

      // Parse JSON output
      let data: T | undefined = undefined;
      if (stdout.trim()) {
        try {
          data = JSON.parse(stdout);
        } catch (e) {
          // If JSON parsing fails, return raw output
          return {
            success: exitCode === 0,
            exitCode,
            stdout,
            stderr,
            error: `Failed to parse JSON output: ${e}`,
            duration
          };
        }
      }

      return {
        success: exitCode === 0,
        exitCode,
        stdout,
        stderr,
        data,
        error: exitCode !== 0 ? stderr || 'Function failed' : undefined,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: String(error),
        error: String(error),
        duration
      };
    }
  }

  /**
   * Serialize JavaScript parameters to PowerShell syntax
   * 
   * Converts:
   *   { Name: "myapp", Template: "web", Force: true }
   * To:
   *   -Name "myapp" -Template "web" -Force
   */
  private serializeParams(params: Record<string, any>): string {
    return Object.entries(params)
      .map(([key, value]) => {
        // Handle different parameter types
        if (value === undefined || value === null) {
          return '';  // Omit undefined/null params
        }
        
        if (typeof value === 'boolean') {
          // Boolean switches: -Force for true, omit for false
          return value ? `-${key}` : '';
        }
        
        if (typeof value === 'string') {
          // String parameters: -Name "value"
          // Escape double quotes within the string
          const escaped = value.replace(/"/g, '""');
          return `-${key} "${escaped}"`;
        }
        
        if (typeof value === 'number') {
          // Numeric parameters: -Count 42
          return `-${key} ${value}`;
        }
        
        if (Array.is_array(value)) {
          // Array parameters: -Items @("a","b","c")
          const arrayStr = value.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
          return `-${key} @(${arrayStr})`;
        }

        // For other types, convert to string
        return `-${key} "${String(value).replace(/"/g, '""')}"`;
      })
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Test if PowerShell is available
   */
  async testPowerShell(): Promise<boolean> {
    try {
      const proc = Bun.spawn(['pwsh.exe', '-Version'], {
        stdout: 'pipe',
        stderr: 'pipe'
      });
      const exitCode = await proc.exited;
      return exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Get PowerShell version
   */
  async getPowerShellVersion(): Promise<string | null> {
    try {
      const proc = Bun.spawn(['pwsh.exe', '-Command', '$PSVersionTable.PSVersion.ToString()'], {
        stdout: 'pipe'
      });
      const version = await Bun.readableStreamToText(proc.stdout);
      return version.trim();
    } catch {
      return null;
    }
  }
}

/**
 * Singleton executor instance
 * Uses default scripts directory (workspace/scripts)
 */
export const powershell = new PowerShellExecutor();
