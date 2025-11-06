/**
 * Plugin Manager
 * 
 * Central manager for Claudine CLI plugins.
 * Handles plugin discovery, loading, activation, and lifecycle management.
 * 
 * @module core/plugin/manager
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { logger } from "../logger.js";
import type {
  ClaudinePlugin,
  PluginContext,
  PluginDiscoveryResult,
  PluginLoadResult,
  PluginLogger,
  PluginManifest,
  PluginRegistryEntry,
} from "./types.js";

/**
 * Plugin manager singleton
 */
export class PluginManager {
  private static instance: PluginManager | null = null;
  
  /** Loaded plugins registry */
  private registry: Map<string, PluginRegistryEntry> = new Map();
  
  /** Plugin search paths */
  private searchPaths: string[] = [];
  
  /** CLI version */
  private cliVersion: string;
  
  /** Global storage path */
  private globalStoragePath: string;
  
  private constructor(cliVersion: string, globalStoragePath: string) {
    this.cliVersion = cliVersion;
    this.globalStoragePath = globalStoragePath;
    this.initializeSearchPaths();
  }
  
  /**
   * Get plugin manager instance
   */
  static getInstance(cliVersion?: string, globalStoragePath?: string): PluginManager {
    if (!PluginManager.instance) {
      if (!cliVersion || !globalStoragePath) {
        throw new Error("PluginManager must be initialized with cliVersion and globalStoragePath");
      }
      PluginManager.instance = new PluginManager(cliVersion, globalStoragePath);
    }
    return PluginManager.instance;
  }
  
  /**
   * Initialize plugin search paths
   */
  private initializeSearchPaths(): void {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    
    this.searchPaths = [
      // Local workspace plugins
      join(process.cwd(), ".claudine", "plugins"),
      
      // User global plugins
      join(homeDir, ".claudine", "plugins"),
      
      // System plugins (if installed globally)
      join(homeDir, ".config", "claudine", "plugins"),
      
      // npm global node_modules (for published plugins)
      join(homeDir, ".local", "share", "claudine", "plugins"),
    ];
    
    logger.debug("Plugin search paths initialized", { paths: this.searchPaths });
  }
  
  /**
   * Add custom plugin search path
   */
  addSearchPath(path: string): void {
    const resolvedPath = resolve(path);
    if (!this.searchPaths.includes(resolvedPath)) {
      this.searchPaths.push(resolvedPath);
      logger.debug("Added plugin search path", { path: resolvedPath });
    }
  }
  
  /**
   * Discover plugins in search paths
   */
  async discover(): Promise<PluginDiscoveryResult> {
    const found: PluginManifest[] = [];
    const errors: Array<{ path: string; error: Error }> = [];
    
    logger.info("Discovering plugins...", { searchPaths: this.searchPaths });
    
    for (const searchPath of this.searchPaths) {
      if (!existsSync(searchPath)) {
        continue;
      }
      
      try {
        const entries = readdirSync(searchPath);
        
        for (const entry of entries) {
          const pluginPath = join(searchPath, entry);
          
          // Check if it's a directory
          try {
            const stat = statSync(pluginPath);
            if (!stat.isDirectory()) {
              continue;
            }
          } catch {
            continue;
          }
          
          // Look for claudine-plugin.json
          const manifestPath = join(pluginPath, "claudine-plugin.json");
          if (!existsSync(manifestPath)) {
            continue;
          }
          
          // Parse manifest
          try {
            const manifestContent = readFileSync(manifestPath, "utf-8");
            const manifest = JSON.parse(manifestContent) as PluginManifest;
            
            // Basic validation
            if (!manifest.id || !manifest.name || !manifest.version) {
              throw new Error("Invalid manifest: missing required fields (id, name, version)");
            }
            
            found.push(manifest);
            logger.debug("Found plugin", { id: manifest.id, path: pluginPath });
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            errors.push({ path: manifestPath, error: err });
            logger.warn("Failed to parse plugin manifest", { path: manifestPath, error: err.message });
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push({ path: searchPath, error: err });
        logger.warn("Failed to scan plugin directory", { path: searchPath, error: err.message });
      }
    }
    
    logger.info("Plugin discovery complete", { found: found.length, errors: errors.length });
    
    return { found, errors };
  }
  
  /**
   * Load a plugin from path
   */
  async load(pluginPath: string): Promise<PluginLoadResult> {
    const startTime = Date.now();
    
    try {
      // Read manifest
      const manifestPath = join(pluginPath, "claudine-plugin.json");
      if (!existsSync(manifestPath)) {
        throw new Error("Plugin manifest not found");
      }
      
      const manifestContent = readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestContent) as PluginManifest;
      
      // Check if already loaded
      if (this.registry.has(manifest.id)) {
        logger.warn("Plugin already loaded", { id: manifest.id });
        return {
          success: false,
          error: new Error(`Plugin ${manifest.id} is already loaded`),
        };
      }
      
      // Load plugin module
      const mainPath = join(pluginPath, "index.js");
      if (!existsSync(mainPath)) {
        throw new Error("Plugin entry point (index.js) not found");
      }
      
      // Dynamic import
      const module = await import(`file://${mainPath}`);
      const plugin = module.default as ClaudinePlugin;
      
      if (!plugin || typeof plugin.activate !== "function") {
        throw new Error("Invalid plugin: must export default object with activate() method");
      }
      
      // Set plugin manifest
      plugin.manifest = manifest;
      
      const loadTime = Date.now() - startTime;
      
      logger.info("Plugin loaded successfully", {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        loadTime: `${loadTime}ms`,
      });
      
      return {
        success: true,
        plugin,
        loadTime,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to load plugin", { path: pluginPath, error: err.message });
      
      return {
        success: false,
        error: err,
      };
    }
  }
  
  /**
   * Activate a plugin
   */
  async activate(plugin: ClaudinePlugin, pluginPath: string): Promise<boolean> {
    try {
      const manifest = plugin.manifest;
      
      // Create plugin context
      const context = this.createPluginContext(plugin, pluginPath);
      
      // Call activate
      logger.debug("Activating plugin", { id: manifest.id });
      await plugin.activate(context);
      
      // Register in registry
      this.registry.set(manifest.id, {
        manifest,
        plugin,
        context,
        active: true,
        loadedAt: new Date(),
        loadTime: 0, // Set by load()
      });
      
      logger.info("Plugin activated", { id: manifest.id, name: manifest.name });
      
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to activate plugin", {
        id: plugin.manifest.id,
        error: err.message,
      });
      
      return false;
    }
  }
  
  /**
   * Deactivate a plugin
   */
  async deactivate(pluginId: string): Promise<boolean> {
    const entry = this.registry.get(pluginId);
    if (!entry) {
      logger.warn("Plugin not found in registry", { id: pluginId });
      return false;
    }
    
    try {
      if (entry.plugin.deactivate) {
        logger.debug("Deactivating plugin", { id: pluginId });
        await entry.plugin.deactivate();
      }
      
      entry.active = false;
      this.registry.delete(pluginId);
      
      logger.info("Plugin deactivated", { id: pluginId });
      
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to deactivate plugin", { id: pluginId, error: err.message });
      
      return false;
    }
  }
  
  /**
   * Create plugin context
   */
  private createPluginContext(plugin: ClaudinePlugin, pluginPath: string): PluginContext {
    const manifest = plugin.manifest;
    const globalStorage = join(this.globalStoragePath, manifest.id);
    const workspaceStorage = join(process.cwd(), ".claudine", "storage", manifest.id);
    
    return {
      extensionPath: pluginPath,
      globalStoragePath: globalStorage,
      workspaceStoragePath: workspaceStorage,
      cliVersion: this.cliVersion,
      logger: this.createPluginLogger(manifest.id),
      config: this.createPluginConfig(manifest.id),
    };
  }
  
  /**
   * Create plugin logger
   */
  private createPluginLogger(pluginId: string): PluginLogger {
    const prefix = `[Plugin:${pluginId}]`;
    
    return {
      debug: (message: string, ...args: unknown[]) => {
        logger.debug(`${prefix} ${message}`, ...args);
      },
      info: (message: string, ...args: unknown[]) => {
        logger.info(`${prefix} ${message}`, ...args);
      },
      warn: (message: string, ...args: unknown[]) => {
        logger.warn(`${prefix} ${message}`, ...args);
      },
      error: (message: string, ...args: unknown[]) => {
        logger.error(`${prefix} ${message}`, ...args);
      },
    };
  }
  
  /**
   * Create plugin config interface
   */
  private createPluginConfig(pluginId: string) {
    // TODO: Implement proper config system with cosmiconfig
    const configStore = new Map<string, unknown>();
    
    return {
      get: <T>(key: string, defaultValue?: T): T | undefined => {
        const fullKey = `plugins.${pluginId}.${key}`;
        return (configStore.get(fullKey) as T) ?? defaultValue;
      },
      update: async (key: string, value: unknown): Promise<void> => {
        const fullKey = `plugins.${pluginId}.${key}`;
        configStore.set(fullKey, value);
      },
      has: (key: string): boolean => {
        const fullKey = `plugins.${pluginId}.${key}`;
        return configStore.has(fullKey);
      },
    };
  }
  
  /**
   * Get all active plugins
   */
  getActivePlugins(): PluginRegistryEntry[] {
    return Array.from(this.registry.values()).filter((entry) => entry.active);
  }
  
  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): PluginRegistryEntry | undefined {
    return this.registry.get(pluginId);
  }
  
  /**
   * Check if plugin is loaded
   */
  isLoaded(pluginId: string): boolean {
    return this.registry.has(pluginId);
  }
  
  /**
   * Get all loaded plugins
   */
  getAllPlugins(): PluginRegistryEntry[] {
    return Array.from(this.registry.values());
  }
}
