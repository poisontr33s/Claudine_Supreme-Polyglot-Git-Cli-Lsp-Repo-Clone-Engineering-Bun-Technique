import * as fs from "node:fs";
import * as path from "node:path";

export interface ClaudineConfig {
  version: string;
  polygluttonyRoot: string;
  workspaceRoot: string;
}

export interface ConfigOptions {
  workspaceRoot?: string;
}

/**
 * Load configuration from .poly_gluttony directory
 */
export async function loadConfig(options: ConfigOptions = {}): Promise<ClaudineConfig> {
  return Promise.resolve().then(() => {
    const workspaceRoot = options.workspaceRoot || process.cwd();
    const polygluttonyRoot = path.join(workspaceRoot, ".poly_gluttony");

    // Check if .poly_gluttony exists
    if (!fs.existsSync(polygluttonyRoot)) {
      throw new Error(`Configuration directory not found: ${polygluttonyRoot}`);
    }

    const configPath = path.join(polygluttonyRoot, "config.json");

    // If config.json exists, load it
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(configData);
      return {
        ...config,
        polygluttonyRoot,
        workspaceRoot,
      };
    }

    // Return default config if file doesn't exist
    return {
      version: "1.0.0",
      polygluttonyRoot,
      workspaceRoot,
    };
  });
}

/**
 * Initialize configuration directory
 */
export async function initConfig(options: ConfigOptions = {}): Promise<ClaudineConfig> {
  return Promise.resolve().then(() => {
    const workspaceRoot = options.workspaceRoot || process.cwd();
    const polygluttonyRoot = path.join(workspaceRoot, ".poly_gluttony");

    // Create .poly_gluttony directory if it doesn't exist
    if (!fs.existsSync(polygluttonyRoot)) {
      fs.mkdirSync(polygluttonyRoot, { recursive: true });
    }

    // Create default config
    const config: ClaudineConfig = {
      version: "1.0.0",
      polygluttonyRoot,
      workspaceRoot,
    };

    // Write config.json
    const configPath = path.join(polygluttonyRoot, "config.json");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

    return config;
  });
}

/**
 * Get current configuration
 */
export async function getConfig(): Promise<ClaudineConfig> {
  return await loadConfig();
}
