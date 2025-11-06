/**
 * Configuration loader for Claudine CLI
 * 
 * Loads and manages CLI configuration including:
 * - Tool paths
 * - Environment settings
 * - User preferences
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

// Configuration schema
const ConfigSchema = z.object({
  version: z.string().default('2.0.0'),
  toolsPath: z.string().default('.poly_gluttony'),
  environment: z.object({
    autoActivate: z.boolean().default(true),
    loadFunctions: z.boolean().default(false)
  }).default({}),
  templates: z.object({
    python: z.array(z.string()).default(['basic', 'web', 'cli', 'data-science']),
    rust: z.array(z.string()).default(['basic', 'binary', 'library']),
    bun: z.array(z.string()).default(['basic', 'web', 'cli']),
    ruby: z.array(z.string()).default(['basic', 'rails', 'gem']),
    react: z.array(z.string()).default(['vite', 'nextjs', 'remix']),
    node: z.array(z.string()).default(['basic', 'express', 'fastify']),
    go: z.array(z.string()).default(['basic', 'cli', 'web'])
  }).default({}),
  tools: z.record(z.object({
    path: z.string().optional(),
    version: z.string().optional(),
    enabled: z.boolean().default(true)
  })).default({})
});

export type ClaudineConfig = z.infer<typeof ConfigSchema>;

/**
 * Load configuration from workspace or defaults
 * 
 * Looks for configuration in:
 * 1. .claudine/config.json in workspace root
 * 2. claudine.config.json in workspace root
 * 3. Falls back to defaults
 */
export async function loadConfig(): Promise<ClaudineConfig> {
  const configPaths = [
    join(process.cwd(), '.claudine', 'config.json'),
    join(process.cwd(), 'claudine.config.json')
  ];

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const configData = JSON.parse(readFileSync(configPath, 'utf-8'));
        return ConfigSchema.parse(configData);
      } catch (error) {
        console.warn(`Warning: Failed to parse config at ${configPath}`);
      }
    }
  }

  // Return defaults
  return ConfigSchema.parse({});
}

/**
 * Get templates for a specific language
 */
export function getTemplatesForLanguage(config: ClaudineConfig, language: string): string[] {
  const templates = config.templates as Record<string, string[]>;
  return templates[language] || ['basic'];
}

/**
 * Check if a tool is enabled
 */
export function isToolEnabled(config: ClaudineConfig, toolName: string): boolean {
  const tool = config.tools[toolName];
  return tool ? tool.enabled : true; // Default to enabled if not specified
}

/**
 * Get tools path from config
 */
export function getToolsPath(config: ClaudineConfig): string {
  return join(process.cwd(), config.toolsPath);
}
