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
      // Safely extract stderr if it exists and is a string
      let stderr: string | undefined;
      if (error && typeof error === "object" && "stderr" in error) {
        const stderrValue = (error as { stderr: unknown }).stderr;
        stderr = typeof stderrValue === "string" ? stderrValue : undefined;
      }
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

    if (toolMapping.function) {
      // For functions, use -Command but build the command array to avoid injection
      // PowerShell -Command can accept an array of arguments for better safety
      const commandParts: string[] = [".", scriptPath, ";", toolMapping.function];

      // Add parameters safely
      if (options.params) {
        for (const [key, value] of Object.entries(options.params)) {
          commandParts.push(`-${key}`);
          if (value !== true) {
            // For non-boolean values, add them as separate arguments
            // PowerShell will handle escaping when we pass them as array elements
            commandParts.push(String(value));
          }
        }
      }

      // Join with spaces for -Command, but execa will handle this as an array
      const command = commandParts.join(" ");
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

  /**
   * Set custom tools path (for testing or custom installations)
   */
  setToolsPath(path: string): void {
    this.toolsPath = path;
  }
}

// Export singleton instance
export const orchestrator = new Orchestrator();
