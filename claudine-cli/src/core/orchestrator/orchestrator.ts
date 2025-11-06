import * as path from "node:path";

export interface ToolDefinition {
  name: string;
  module: string;
  function: string;
  description?: string;
}

export interface InvokeOptions {
  params?: Record<string, unknown>;
}

export interface InvokeResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Mapping of module names to their file paths
const MODULE_MAPPING: Record<string, string> = {
  "@claudine/detector": "../detector/index",
  "@claudine/config": "../config/index",
};

// Tool registry
const toolRegistry: Map<string, ToolDefinition> = new Map();

/**
 * Register a tool with the orchestrator
 */
export function registerTool(toolDef: ToolDefinition): void {
  toolRegistry.set(toolDef.name, toolDef);
}

/**
 * Initialize orchestrator with default tools
 */
export function initOrchestrator(): void {
  // Register config tools
  registerTool({
    name: "config-load",
    module: "@claudine/config",
    function: "loadConfig",
    description: "Load configuration from .poly_gluttony directory",
  });

  registerTool({
    name: "config-init",
    module: "@claudine/config",
    function: "initConfig",
    description: "Initialize configuration directory",
  });

  registerTool({
    name: "config-get",
    module: "@claudine/config",
    function: "getConfig",
    description: "Get current configuration",
  });

  // Register detector tool
  registerTool({
    name: "detect",
    module: "@claudine/detector",
    function: "detect",
    description: "Detect current environment",
  });
}

/**
 * Execute a native module function
 */
async function executeNative(toolDef: ToolDefinition, options: InvokeOptions = {}): Promise<unknown> {
  const modulePath = MODULE_MAPPING[toolDef.module];

  if (!modulePath) {
    throw new Error(`Module not found: ${toolDef.module}`);
  }

  // Resolve the module path relative to this file
  const resolvedPath = path.join(__dirname, modulePath);

  try {
    // Dynamic import of the module
    const module = await import(resolvedPath);
    const fn = module[toolDef.function];

    if (!fn || typeof fn !== "function") {
      throw new Error(`Function not found: ${toolDef.function} in ${toolDef.module}`);
    }

    // Execute the function based on module type
    let data: unknown;

    switch (toolDef.module) {
      case "@claudine/config":
        if (toolDef.function === "loadConfig") {
          const configOptions = options.params || {};
          data = await fn(configOptions);
        } else if (toolDef.function === "initConfig") {
          const initOptions = options.params || {};
          data = await fn(initOptions);
        } else if (toolDef.function === "getConfig") {
          data = await fn();
        }
        break;

      case "@claudine/detector":
        data = await fn();
        break;

      default:
        // Default: call function with params
        data = await fn(options.params);
        break;
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to execute ${toolDef.module}.${toolDef.function}: ${error}`);
  }
}

/**
 * Invoke a tool by name
 */
export async function invoke(toolName: string, options: InvokeOptions = {}): Promise<InvokeResult> {
  try {
    const toolDef = toolRegistry.get(toolName);

    if (!toolDef) {
      return {
        success: false,
        error: `Tool not found: ${toolName}`,
      };
    }

    const data = await executeNative(toolDef, options);

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get all registered tools
 */
export function getRegisteredTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values());
}

// Initialize on module load
initOrchestrator();
