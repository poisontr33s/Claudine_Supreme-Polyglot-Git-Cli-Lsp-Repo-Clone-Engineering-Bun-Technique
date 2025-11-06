/**
 * Configuration Manager for Claudine CLI
 *
 * Manages .poly_gluttony configuration:
 * - Loads config from .poly_gluttony/config.json
 * - Searches upward from cwd to find .poly_gluttony/
 * - Initializes config with default structure
 * - Saves and updates config
 * - Handles errors (missing dirs, corrupted JSON, permissions)
 * - Resolves PowerShell script paths
 *
 * @module core/config/config-manager
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { z } from "zod";

/**
 * Configuration schema using Zod for runtime validation
 */
const CLITConfigSchema = z.object({
  version: z.string(),
  polygluttonyRoot: z.string(),
  workspaceRoot: z.string(),
  scripts: z.object({
    claudineENV: z.string().optional(),
    claudineENV_F: z.string().optional(),
    pwshGoddess: z.string().optional(),
  }),
  languages: z.array(z.string()),
  environments: z.record(z.any()).optional(),
  lastUpdated: z.string().optional(),
});

/**
 * Configuration type inferred from schema
 */
export type CLITConfig = z.infer<typeof CLITConfigSchema>;

/**
 * Configuration directory name
 */
export const CONFIG_DIR_NAME = ".poly_gluttony";

/**
 * Configuration file name
 */
export const CONFIG_FILE_NAME = "config.json";

/**
 * Default PowerShell script names
 */
export const DEFAULT_SCRIPTS = {
  claudineENV: "claudineENV.ps1",
  claudineENV_F: "claudineENV_F.ps1",
  pwshGoddess: "pwshGoddess.ps1",
};

/**
 * Default languages supported
 */
export const DEFAULT_LANGUAGES = ["python", "rust", "ruby", "javascript", "typescript", "go", "bun"];

/**
 * Error thrown when .poly_gluttony directory is not found
 */
export class ConfigNotFoundError extends Error {
  constructor(message = "Configuration directory not found") {
    super(message);
    this.name = "ConfigNotFoundError";
  }
}

/**
 * Error thrown when config.json is corrupted or invalid
 */
export class ConfigValidationError extends Error {
  constructor(message = "Invalid configuration") {
    super(message);
    this.name = "ConfigValidationError";
  }
}

/**
 * Error thrown when there are permission issues
 */
export class ConfigPermissionError extends Error {
  constructor(message = "Permission denied") {
    super(message);
    this.name = "ConfigPermissionError";
  }
}

/**
 * Find .poly_gluttony directory by searching upward from startDir
 *
 * @param startDir - Starting directory for search (defaults to cwd)
 * @returns Path to .poly_gluttony directory
 * @throws {ConfigNotFoundError} If directory not found
 */
export function findPolygluttonyRoot(startDir: string = process.cwd()): string {
  let currentDir = path.resolve(startDir);
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const configDir = path.join(currentDir, CONFIG_DIR_NAME);

    if (fs.existsSync(configDir)) {
      try {
        const stats = fs.statSync(configDir);
        if (stats.isDirectory()) {
          return configDir;
        }
      } catch (_error) {
        // Permission error or other issue, continue searching
      }
    }

    // Move up one directory
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached the root
      break;
    }
    currentDir = parentDir;
  }

  throw new ConfigNotFoundError(`Could not find ${CONFIG_DIR_NAME} directory in ${startDir} or any parent directory`);
}

/**
 * Load configuration from .poly_gluttony/config.json
 *
 * @param startDir - Starting directory for search (defaults to cwd)
 * @returns Validated configuration object
 * @throws {ConfigNotFoundError} If .poly_gluttony not found
 * @throws {ConfigValidationError} If config.json is corrupted or invalid
 * @throws {ConfigPermissionError} If permission denied
 */
export function loadConfig(startDir: string = process.cwd()): CLITConfig {
  // Find .poly_gluttony directory
  const polygluttonyRoot = findPolygluttonyRoot(startDir);
  const configPath = path.join(polygluttonyRoot, CONFIG_FILE_NAME);

  // Check if config.json exists
  if (!fs.existsSync(configPath)) {
    throw new ConfigNotFoundError(`Configuration file not found: ${configPath}`);
  }

  // Read config file
  let configData: string;
  try {
    configData = fs.readFileSync(configPath, "utf-8");
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "EACCES") {
      throw new ConfigPermissionError(`Permission denied reading config: ${configPath}`);
    }
    throw error;
  }

  // Parse JSON
  let parsedConfig: unknown;
  try {
    parsedConfig = JSON.parse(configData);
  } catch (_error) {
    throw new ConfigValidationError(`Corrupted JSON in config file: ${configPath}`);
  }

  // Validate config with Zod
  try {
    return CLITConfigSchema.parse(parsedConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      throw new ConfigValidationError(`Invalid configuration: ${issues}`);
    }
    throw error;
  }
}

/**
 * Resolve path to a PowerShell script
 *
 * @param scriptName - Name of the script to find
 * @param polygluttonyRoot - Root directory to search in
 * @returns Path to script if found, undefined otherwise
 */
export function resolveScriptPath(scriptName: string, polygluttonyRoot: string): string | undefined {
  // Check if script exists in polygluttonyRoot
  const scriptPath = path.join(polygluttonyRoot, scriptName);
  if (fs.existsSync(scriptPath)) {
    return scriptPath;
  }

  // Check in scripts subdirectory
  const scriptsPath = path.join(polygluttonyRoot, "scripts", scriptName);
  if (fs.existsSync(scriptsPath)) {
    return scriptsPath;
  }

  return undefined;
}

/**
 * Initialize .poly_gluttony directory structure and config
 *
 * @param targetDir - Directory to create .poly_gluttony in (defaults to cwd)
 * @param force - Force overwrite existing config (defaults to false)
 * @returns Created configuration object
 * @throws {ConfigPermissionError} If permission denied
 */
export function initConfig(targetDir: string = process.cwd(), force = false): CLITConfig {
  const polygluttonyRoot = path.join(targetDir, CONFIG_DIR_NAME);
  const configPath = path.join(polygluttonyRoot, CONFIG_FILE_NAME);

  // Check if config already exists
  if (!force && fs.existsSync(configPath)) {
    throw new Error(`Configuration already exists at ${configPath}. Use force=true to overwrite.`);
  }

  // Create .poly_gluttony directory structure
  try {
    fs.mkdirSync(polygluttonyRoot, { recursive: true });
    fs.mkdirSync(path.join(polygluttonyRoot, "environments"), { recursive: true });
    fs.mkdirSync(path.join(polygluttonyRoot, "scripts"), { recursive: true });
    fs.mkdirSync(path.join(polygluttonyRoot, "health"), { recursive: true });
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "EACCES") {
      throw new ConfigPermissionError(`Permission denied creating directory: ${polygluttonyRoot}`);
    }
    throw error;
  }

  // Detect script paths
  const scripts: Record<string, string | undefined> = {};
  for (const [key, scriptName] of Object.entries(DEFAULT_SCRIPTS)) {
    const scriptPath = resolveScriptPath(scriptName, polygluttonyRoot);
    if (scriptPath) {
      scripts[key] = scriptPath;
    }
  }

  // Create default config
  const config: CLITConfig = {
    version: "1.0.0",
    polygluttonyRoot,
    workspaceRoot: targetDir,
    scripts,
    languages: DEFAULT_LANGUAGES,
    lastUpdated: new Date().toISOString(),
  };

  // Save config
  saveConfig(config);

  return config;
}

/**
 * Save configuration to disk
 *
 * @param config - Configuration object to save
 * @throws {ConfigPermissionError} If permission denied
 */
export function saveConfig(config: CLITConfig): void {
  const configPath = path.join(config.polygluttonyRoot, CONFIG_FILE_NAME);

  // Ensure directory exists
  try {
    fs.mkdirSync(config.polygluttonyRoot, { recursive: true });
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "EACCES") {
      throw new ConfigPermissionError(`Permission denied creating directory: ${config.polygluttonyRoot}`);
    }
    throw error;
  }

  // Write config file
  try {
    const configData = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, configData, "utf-8");
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "EACCES") {
      throw new ConfigPermissionError(`Permission denied writing config: ${configPath}`);
    }
    throw error;
  }
}

/**
 * Update configuration with partial updates
 *
 * @param updates - Partial configuration updates
 * @param startDir - Starting directory for search (defaults to cwd)
 * @returns Updated configuration object
 * @throws {ConfigNotFoundError} If config not found
 * @throws {ConfigPermissionError} If permission denied
 */
export function updateConfig(updates: Partial<CLITConfig>, startDir: string = process.cwd()): CLITConfig {
  // Load existing config
  const config = loadConfig(startDir);

  // Merge updates
  const updatedConfig: CLITConfig = {
    ...config,
    ...updates,
    scripts: {
      ...config.scripts,
      ...updates.scripts,
    },
    lastUpdated: new Date().toISOString(),
  };

  // Validate updated config
  const validated = CLITConfigSchema.parse(updatedConfig);

  // Save updated config
  saveConfig(validated);

  return validated;
}

/**
 * Validate configuration object
 *
 * @param config - Configuration object to validate
 * @returns True if valid
 * @throws {ConfigValidationError} If invalid
 */
export function validateConfig(config: unknown): boolean {
  try {
    CLITConfigSchema.parse(config);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      throw new ConfigValidationError(`Invalid configuration: ${issues}`);
    }
    throw error;
  }
}
