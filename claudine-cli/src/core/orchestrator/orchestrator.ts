/**
 * Orchestrator - Coordinates execution of PowerShell tools
 *
 * Transforms the CLI from implementer to conductor by delegating
 * actual work to PowerShell scripts and tools.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { execa } from "execa";

export interface OrchestratorParams {
  params?: Record<string, unknown>;
  timeout?: number;
}

export interface OrchestratorResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

class Orchestrator {
  private toolsPath: string;

  constructor() {
    // Default to workspace root's .poly_gluttony directory
    this.toolsPath = join(process.cwd(), ".poly_gluttony");
  }

  /**
   * Invoke a PowerShell tool by name
   *
   * @param toolName - Name of the tool to invoke (e.g., 'project-create-python', 'health-check')
   * @param options - Parameters and options for the tool
   * @returns Result with success status, data, and any errors
   */
  async invoke(toolName: string, options: OrchestratorParams = {}): Promise<OrchestratorResult> {
    try {
      // Map tool names to PowerShell scripts/functions
      const toolMapping = this.getToolMapping(toolName);

      if (!toolMapping) {
        return {
          success: false,
          error: `Unknown tool: ${toolName}`,
        };
      }

      // Execute the tool
      const result = await this.executeTool(toolMapping, options);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private getToolMapping(toolName: string): { script: string; function?: string } | null {
    // Map tool names to PowerShell scripts/functions
    const mappings: Record<string, { script: string; function?: string }> = {
      // Project creation tools
      "project-create-python": { script: "claudineENV.ps1", function: "new-python" },
      "project-create-rust": { script: "claudineENV.ps1", function: "new-rust" },
      "project-create-bun": { script: "claudineENV.ps1", function: "new-bun" },
      "project-create-ruby": { script: "claudineENV.ps1", function: "new-ruby" },
      "project-create-react": { script: "claudineENV.ps1", function: "new-react" },
      "project-create-node": { script: "claudineENV.ps1", function: "new-node" },
      "project-create-go": { script: "claudineENV.ps1", function: "new-go" },

      // Environment tools
      "environment-activate": { script: "claudineENV.ps1" },
      "health-check": { script: "claudineENV.ps1", function: "check-health" },

      // Detection tools
      "detect-languages": { script: "claudineENV.ps1", function: "detect-languages" },
    };

    return mappings[toolName] || null;
  }

  private async executeTool(
    toolMapping: { script: string; function?: string },
    options: OrchestratorParams,
  ): Promise<OrchestratorResult> {
    const scriptPath = join(this.toolsPath, toolMapping.script);

    // Check if script exists
    if (!existsSync(scriptPath)) {
      return {
        success: false,
        error: `Script not found: ${scriptPath}`,
      };
    }

    try {
      // Build PowerShell command
      const args = this.buildPowerShellArgs(toolMapping, options);

      // Execute PowerShell
      const { stdout, stderr } = await execa("pwsh", args, {
        timeout: options.timeout || 30000,
        shell: false,
      });

      // Parse output (assuming JSON output from PowerShell)
      let data: unknown = {};
      if (stdout) {
        try {
          data = JSON.parse(stdout);
        } catch {
          // If not JSON, treat as plain text
          data = { output: stdout };
        }
      }

      return {
        success: true,
        data,
        metadata: stderr ? { warnings: stderr } : undefined,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "PowerShell execution failed";
      const stderr = error && typeof error === "object" && "stderr" in error ? error.stderr : undefined;
      return {
        success: false,
        error: errorMessage,
        metadata: stderr ? { stderr } : undefined,
      };
    }
  }

  private buildPowerShellArgs(
    toolMapping: { script: string; function?: string },
    options: OrchestratorParams,
  ): string[] {
    const scriptPath = join(this.toolsPath, toolMapping.script);

    // Build parameter string for PowerShell
    const paramString = this.buildParamString(options.params || {});

    if (toolMapping.function) {
      // For functions, we need to dot-source the script and call the function with parameters
      const command = `. '${scriptPath}'; ${toolMapping.function} ${paramString}`;
      return ["-NoProfile", "-NonInteractive", "-Command", command];
    }
    // For scripts without functions, use -File and pass parameters as args
    const args: string[] = ["-NoProfile", "-NonInteractive", "-File", scriptPath];

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        args.push(`-${key}`);
        if (value !== true) {
          // Skip boolean true, it's just a flag
          args.push(String(value));
        }
      }
    }

    return args;
  }

  private buildParamString(params: Record<string, unknown>): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(params)) {
      if (value === true) {
        // Boolean flag
        parts.push(`-${key}`);
      } else if (typeof value === "string" && value.includes(" ")) {
        // String with spaces - quote it
        parts.push(`-${key} "${value}"`);
      } else {
        // Normal value
        parts.push(`-${key} ${value}`);
      }
    }

    return parts.join(" ");
  }

  /**
   * Set custom tools path (for testing or custom installations)
   */
  setToolsPath(path: string): void {
    this.toolsPath = path;
  }
}

// Export singleton instance
export const orchestrator = new Orchestrator();
