/**
 * Environment detection and validation utilities for Claudine CLI
 *
 * Detects:
 * - Activated polyglot environment ($env:CLAUDINE_ACTIVATED)
 * - Available tools (Python/UV, Rust/Cargo, Bun, Ruby, Go/gopls)
 * - Tool versions and compatibility
 * - Workspace context
 *
 * @module utils/environment
 */

import * as os from "os";
import * as path from "path";
import { $ } from "bun";

/**
 * Environment detection result
 */
export interface EnvironmentInfo {
  /** Is Claudine polyglot environment activated? */
  isActivated: boolean;
  /** Environment activation method (claudineENV.ps1, etc.) */
  activationSource?: string;
  /** Version of claudineENV */
  version?: string;
  /** Polyglot root directory */
  polyglotRoot?: string;
  /** Available tool information */
  tools: ToolAvailability[];
  /** Environment warnings (missing tools, etc.) */
  warnings: string[];
}

/**
 * Tool availability information
 */
export interface ToolAvailability {
  /** Tool name (python, uv, cargo, etc.) */
  name: string;
  /** Is tool available in PATH? */
  available: boolean;
  /** Tool version (if available) */
  version?: string;
  /** Path to tool binary (if available) */
  path?: string;
  /** Tool category (language, package-manager, lsp, etc.) */
  category: "language" | "package-manager" | "lsp" | "build-tool" | "formatter" | "other";
}

/**
 * Tool definitions for checking availability
 */
const POLYGLOT_TOOLS = [
  // Python ecosystem
  { name: "python", command: "python", versionFlag: "--version", category: "language" as const },
  { name: "uv", command: "uv", versionFlag: "--version", category: "package-manager" as const },
  { name: "ruff", command: "ruff", versionFlag: "--version", category: "formatter" as const },
  { name: "black", command: "black", versionFlag: "--version", category: "formatter" as const },
  { name: "pytest", command: "pytest", versionFlag: "--version", category: "build-tool" as const },

  // Rust ecosystem
  { name: "cargo", command: "cargo", versionFlag: "--version", category: "package-manager" as const },
  { name: "rustc", command: "rustc", versionFlag: "--version", category: "language" as const },

  // Ruby ecosystem
  { name: "ruby", command: "ruby", versionFlag: "--version", category: "language" as const },
  { name: "bundle", command: "bundle", versionFlag: "--version", category: "package-manager" as const },

  // JavaScript/TypeScript ecosystem
  { name: "bun", command: "bun", versionFlag: "--version", category: "language" as const },

  // Go ecosystem
  { name: "go", command: "go", versionFlag: "version", category: "language" as const },
  { name: "gopls", command: "gopls", versionFlag: "version", category: "lsp" as const },

  // Build tools
  { name: "gcc", command: "gcc", versionFlag: "--version", category: "build-tool" as const },
] as const;

/**
 * Check if Claudine polyglot environment is activated
 *
 * Checks for environment markers:
 * - $env:CLAUDINE_ACTIVATED (PowerShell marker)
 * - $CLAUDINE_ACTIVATED (shell marker)
 * - $env:CLAUDINE_VERSION (version marker)
 * - $env:CLAUDINE_ROOT (polyglot root path)
 *
 * @returns {boolean} True if environment is activated
 *
 * @example
 * ```typescript
 * if (!isEnvironmentActivated()) {
 *   console.error("❌ Claudine environment not activated");
 *   console.error("   Run: . ./.poly_gluttony/claudineENV.ps1");
 *   process.exit(1);
 * }
 * ```
 */
export function isEnvironmentActivated(): boolean {
  return process.env.CLAUDINE_ACTIVATED !== undefined || process.env.CLAUDINE_VERSION !== undefined;
}

/**
 * Get environment activation source
 *
 * @returns {string | undefined} Activation source (claudineENV.ps1, etc.)
 */
export function getActivationSource(): string | undefined {
  return process.env.CLAUDINE_ACTIVATED;
}

/**
 * Get Claudine environment version
 *
 * @returns {string | undefined} Environment version
 */
export function getEnvironmentVersion(): string | undefined {
  return process.env.CLAUDINE_VERSION;
}

/**
 * Get polyglot root directory
 *
 * @returns {string | undefined} Polyglot root path
 */
export function getPolyglotRoot(): string | undefined {
  if (process.env.CLAUDINE_ROOT) {
    return process.env.CLAUDINE_ROOT;
  }

  // Fallback: detect from current directory
  const cwd = process.cwd();
  const defaultPath = path.join(cwd, ".poly_gluttony");

  try {
    const fs = require("fs");
    if (fs.existsSync(defaultPath)) {
      return defaultPath;
    }
  } catch {
    // Ignore errors
  }

  return undefined;
}

/**
 * Check if a tool is available in PATH
 *
 * @param {string} command - Command name to check
 * @returns {Promise<boolean>} True if command is available
 */
async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    const which = os.platform() === "win32" ? "where" : "which";
    const result = await $`${which} ${command}`.quiet().nothrow();
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Get tool version
 *
 * @param {string} command - Command name
 * @param {string} versionFlag - Version flag (--version, version, etc.)
 * @returns {Promise<string | undefined>} Tool version or undefined
 */
async function getToolVersion(command: string, versionFlag: string): Promise<string | undefined> {
  try {
    const result = await $`${command} ${versionFlag}`.quiet().nothrow();
    if (result.exitCode === 0) {
      // Extract version from output (first line usually contains version)
      const output = result.stdout.toString().trim();
      const lines = output.split("\n");
      return lines[0].trim();
    }
  } catch {
    // Ignore errors
  }
  return undefined;
}

/**
 * Get path to tool binary
 *
 * @param {string} command - Command name
 * @returns {Promise<string | undefined>} Path to binary or undefined
 */
async function getToolPath(command: string): Promise<string | undefined> {
  try {
    const which = os.platform() === "win32" ? "where" : "which";
    const result = await $`${which} ${command}`.quiet().nothrow();
    if (result.exitCode === 0) {
      const output = result.stdout.toString().trim();
      // Return first path if multiple paths found (Windows where returns all matches)
      return output.split("\n")[0].trim();
    }
  } catch {
    // Ignore errors
  }
  return undefined;
}

/**
 * Check availability of all polyglot tools
 *
 * @returns {Promise<ToolAvailability[]>} Array of tool availability information
 */
export async function checkToolAvailability(): Promise<ToolAvailability[]> {
  const results: ToolAvailability[] = [];

  for (const tool of POLYGLOT_TOOLS) {
    const available = await isCommandAvailable(tool.command);
    const version = available ? await getToolVersion(tool.command, tool.versionFlag) : undefined;
    const toolPath = available ? await getToolPath(tool.command) : undefined;

    results.push({
      name: tool.name,
      available,
      version,
      path: toolPath,
      category: tool.category,
    });
  }

  return results;
}

/**
 * Get comprehensive environment information
 *
 * Checks:
 * - Activation status
 * - Available tools
 * - Warnings (missing critical tools, etc.)
 *
 * @returns {Promise<EnvironmentInfo>} Complete environment information
 *
 * @example
 * ```typescript
 * const env = await getEnvironmentInfo();
 *
 * if (!env.isActivated) {
 *   console.error("❌ Environment not activated");
 * }
 *
 * console.log(`✅ Activated: ${env.isActivated}`);
 * console.log(`📦 Tools: ${env.tools.filter(t => t.available).length}/${env.tools.length}`);
 *
 * if (env.warnings.length > 0) {
 *   console.warn("⚠️  Warnings:");
 *   env.warnings.forEach(w => console.warn(`   - ${w}`));
 * }
 * ```
 */
export async function getEnvironmentInfo(): Promise<EnvironmentInfo> {
  const isActivated = isEnvironmentActivated();
  const activationSource = getActivationSource();
  const version = getEnvironmentVersion();
  const polyglotRoot = getPolyglotRoot();
  const tools = await checkToolAvailability();

  const warnings: string[] = [];

  // Warn if environment is not activated
  if (!isActivated) {
    warnings.push("Claudine polyglot environment not activated (run: . ./.poly_gluttony/claudineENV.ps1)");
  }

  // Warn about missing critical tools
  const criticalTools = ["python", "uv", "cargo", "bun"];
  for (const toolName of criticalTools) {
    const tool = tools.find((t) => t.name === toolName);
    if (!tool?.available) {
      warnings.push(`Critical tool not available: ${toolName}`);
    }
  }

  // Warn if gopls is missing (required for LSP)
  const gopls = tools.find((t) => t.name === "gopls");
  if (!gopls?.available) {
    warnings.push("gopls not found (Go LSP will not work, install: go install golang.org/x/tools/gopls@latest)");
  }

  return {
    isActivated,
    activationSource,
    version,
    polyglotRoot,
    tools,
    warnings,
  };
}

/**
 * Require environment activation (throws error if not activated)
 *
 * Use at the start of commands that require polyglot tools.
 *
 * @throws {Error} If environment is not activated
 *
 * @example
 * ```typescript
 * export const myCommand = new Command('my-command')
 *   .description('Do something with polyglot tools')
 *   .action(async () => {
 *     requireEnvironment(); // Will throw if not activated
 *
 *     // Continue with command logic...
 *   });
 * ```
 */
export function requireEnvironment(): void {
  if (!isEnvironmentActivated()) {
    console.error("❌ Claudine polyglot environment not activated");
    console.error("");
    console.error("🔧 Activate the environment first:");
    console.error("");

    if (os.platform() === "win32") {
      console.error("   PowerShell:");
      console.error("   . .\\.poly_gluttony\\claudineENV.ps1");
      console.error("");
      console.error("   Or add to your $PROFILE for auto-activation:");
      console.error("   .\\scripts\\Setup-ClaudineProfile.ps1");
    } else {
      console.error("   Bash/Zsh:");
      console.error("   source ./.poly_gluttony/claudineENV.sh");
      console.error("");
      console.error("   Or add to your ~/.bashrc or ~/.zshrc");
    }

    console.error("");
    throw new Error("Environment not activated");
  }
}

/**
 * Display environment status (for `claudine env status` command)
 *
 * @example
 * ```typescript
 * export const statusCommand = new Command('status')
 *   .description('Show environment activation status')
 *   .action(async () => {
 *     await displayEnvironmentStatus();
 *   });
 * ```
 */
export async function displayEnvironmentStatus(): Promise<void> {
  const env = await getEnvironmentInfo();

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  🔥💋 CLAUDINE ENVIRONMENT STATUS 💋🔥                      ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("");

  // Activation status
  if (env.isActivated) {
    console.log("✅ Environment: Activated");
    if (env.activationSource) {
      console.log(`   Source: ${env.activationSource}`);
    }
    if (env.version) {
      console.log(`   Version: ${env.version}`);
    }
    if (env.polyglotRoot) {
      console.log(`   Root: ${env.polyglotRoot}`);
    }
  } else {
    console.log("❌ Environment: Not Activated");
  }

  console.log("");
  console.log("📦 Polyglot Tools:");
  console.log("");

  // Group tools by category
  const categories = Array.from(new Set(env.tools.map((t) => t.category)));

  for (const category of categories) {
    const categoryTools = env.tools.filter((t) => t.category === category);
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");

    console.log(`   ${categoryName}:`);
    for (const tool of categoryTools) {
      const status = tool.available ? "✅" : "❌";
      const version = tool.version ? ` (${tool.version})` : "";
      console.log(`      ${status} ${tool.name}${version}`);
    }
    console.log("");
  }

  // Warnings
  if (env.warnings.length > 0) {
    console.log("⚠️  Warnings:");
    for (const warning of env.warnings) {
      console.log(`   - ${warning}`);
    }
    console.log("");
  }

  // Summary
  const availableCount = env.tools.filter((t) => t.available).length;
  const totalCount = env.tools.length;
  const percentage = Math.round((availableCount / totalCount) * 100);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Status: ${availableCount}/${totalCount} tools available (${percentage}%)`);

  if (percentage === 100) {
    console.log("🎉 All systems operational!");
  } else if (percentage >= 80) {
    console.log("✅ Environment functional (some optional tools missing)");
  } else {
    console.log("⚠️  Some critical tools missing");
  }
}
