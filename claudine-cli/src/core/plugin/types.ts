/**
 * Plugin System Types
 * 
 * Defines the interfaces for Claudine CLI plugin architecture.
 * Inspired by VS Code extensions and MCP (Model Context Protocol).
 * 
 * @module core/plugin/types
 */

import type { Command } from "commander";

/**
 * Plugin metadata and manifest
 */
export interface PluginManifest {
  /** Unique plugin identifier (e.g., 'claudine-docker-templates') */
  id: string;
  
  /** Human-readable plugin name */
  name: string;
  
  /** Plugin version (semver) */
  version: string;
  
  /** Brief description of plugin functionality */
  description: string;
  
  /** Plugin author */
  author?: string;
  
  /** Minimum Claudine CLI version required */
  minimumCliVersion?: string;
  
  /** Plugin activation events */
  activationEvents?: ActivationEvent[];
  
  /** Capabilities this plugin provides */
  capabilities?: PluginCapabilities;
  
  /** Plugin configuration schema */
  configSchema?: Record<string, unknown>;
}

/**
 * Events that trigger plugin activation
 */
export type ActivationEvent =
  | "onStartup"                      // Plugin loads at CLI startup
  | "onCommand:*"                    // Plugin loads when any command runs
  | `onCommand:${string}`            // Plugin loads for specific command
  | `onLanguage:${string}`           // Plugin loads for specific language
  | `onTemplate:${string}`;          // Plugin loads for specific template

/**
 * Plugin capabilities (what the plugin can do)
 */
export interface PluginCapabilities {
  /** Provides custom commands */
  commands?: boolean;
  
  /** Provides custom templates */
  templates?: boolean;
  
  /** Provides language support */
  languages?: boolean;
  
  /** Provides custom configuration */
  configuration?: boolean;
  
  /** Provides tools/utilities */
  tools?: boolean;
}

/**
 * Context provided to plugins
 */
export interface PluginContext {
  /** Plugin's root directory */
  extensionPath: string;
  
  /** Plugin's global storage path */
  globalStoragePath: string;
  
  /** Plugin's workspace storage path */
  workspaceStoragePath: string;
  
  /** CLI version */
  cliVersion: string;
  
  /** Logger instance */
  logger: PluginLogger;
  
  /** Configuration access */
  config: PluginConfig;
}

/**
 * Plugin logger interface
 */
export interface PluginLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Plugin configuration interface
 */
export interface PluginConfig {
  get<T>(key: string, defaultValue?: T): T | undefined;
  update(key: string, value: unknown): Promise<void>;
  has(key: string): boolean;
}

/**
 * Main plugin interface
 */
export interface ClaudinePlugin {
  /** Plugin manifest */
  manifest: PluginManifest;
  
  /**
   * Called when plugin is activated
   * @param context Plugin context
   */
  activate(context: PluginContext): Promise<void> | void;
  
  /**
   * Called when plugin is deactivated
   */
  deactivate?(): Promise<void> | void;
  
  /**
   * Register custom commands
   * @returns Array of Commander.js commands
   */
  contributeCommands?(): Command[];
  
  /**
   * Register custom templates
   * @returns Record of template definitions
   */
  contributeTemplates?(): TemplateContribution[];
  
  /**
   * Register custom languages
   * @returns Array of language definitions
   */
  contributeLanguages?(): LanguageContribution[];
  
  /**
   * Register custom tools
   * @returns Array of tool definitions
   */
  contributeTools?(): ToolContribution[];
}

/**
 * Template contribution from plugin
 */
export interface TemplateContribution {
  /** Template ID */
  id: string;
  
  /** Template name */
  name: string;
  
  /** Template description */
  description: string;
  
  /** Language this template is for */
  language: string;
  
  /** Template files (path -> content) */
  files: Record<string, string>;
  
  /** Variables to prompt for */
  variables?: TemplateVariable[];
  
  /** Template category */
  category?: string;
  
  /** Template tags */
  tags?: string[];
}

/**
 * Template variable definition
 */
export interface TemplateVariable {
  /** Variable name (e.g., 'projectName') */
  name: string;
  
  /** Human-readable label */
  label: string;
  
  /** Variable description */
  description?: string;
  
  /** Default value */
  default?: string;
  
  /** Validation regex */
  pattern?: string;
  
  /** Variable type */
  type?: "string" | "boolean" | "number" | "choice";
  
  /** Choices (if type is 'choice') */
  choices?: string[];
}

/**
 * Language contribution from plugin
 */
export interface LanguageContribution {
  /** Language ID */
  id: string;
  
  /** Language name */
  name: string;
  
  /** Language description */
  description: string;
  
  /** Language icon (emoji) */
  icon: string;
  
  /** File extensions */
  extensions: string[];
  
  /** Package manager info */
  packageManager?: {
    name: string;
    installCommand: string;
    lockFile: string;
  };
  
  /** Tooling info */
  tooling?: {
    compiler?: string;
    formatter?: string;
    linter?: string;
    testRunner?: string;
  };
}

/**
 * Tool contribution from plugin
 */
export interface ToolContribution {
  /** Tool ID */
  id: string;
  
  /** Tool name */
  name: string;
  
  /** Tool description */
  description: string;
  
  /** Tool command */
  command: string;
  
  /** Tool arguments */
  args?: string[];
  
  /** Environment variables */
  env?: Record<string, string>;
  
  /** Tool category */
  category?: string;
}

/**
 * Plugin loading result
 */
export interface PluginLoadResult {
  success: boolean;
  plugin?: ClaudinePlugin;
  error?: Error;
  loadTime?: number;
}

/**
 * Plugin registry entry
 */
export interface PluginRegistryEntry {
  manifest: PluginManifest;
  plugin: ClaudinePlugin;
  context: PluginContext;
  active: boolean;
  loadedAt: Date;
  loadTime: number;
}

/**
 * Plugin discovery result
 */
export interface PluginDiscoveryResult {
  found: PluginManifest[];
  errors: Array<{ path: string; error: Error }>;
}
