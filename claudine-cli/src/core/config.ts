/**
 * 🔥💋 Claudine CLI Configuration System
 * 
 * Inspired by: Gemini CLI config.ts (1,324 lines)
 * Pattern: Central configuration class with lazy initialization
 * 
 * Features:
 * - User preferences (name, email, default language, etc.)
 * - Project defaults (template preferences, git config)
 * - Tool registry (will be expanded in Phase 6)
 * - Extension/plugin registry (Phase 6)
 * - Priority layering: CLI args → env vars → config file → defaults
 */

import { z } from 'zod';
import { Storage, getStorage } from './storage.js';
import { logger } from './logger.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Zod Schemas (validation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const UserPreferencesSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  defaultLanguage: z.enum(['python', 'rust', 'bun', 'ruby', 'react', 'node', 'go']).optional(),
  defaultTemplate: z.string().optional(),
});

export const GitConfigSchema = z.object({
  autoInit: z.boolean().default(true),
  defaultBranch: z.string().default('main'),
  commitMessage: z.string().optional(),
});

export const ProjectDefaultsSchema = z.object({
  python: z.object({
    packageManager: z.enum(['uv', 'pip', 'poetry']).default('uv'),
    pythonVersion: z.string().optional(),
  }).optional(),
  rust: z.object({
    edition: z.enum(['2015', '2018', '2021', '2024']).default('2021'),
  }).optional(),
  node: z.object({
    packageManager: z.enum(['npm', 'yarn', 'pnpm', 'bun']).default('bun'),
  }).optional(),
});

export const ConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  user: UserPreferencesSchema.optional(),
  git: GitConfigSchema.optional(),
  projects: ProjectDefaultsSchema.optional(),
  templates: z.object({
    customPath: z.string().optional(),
    remoteRepos: z.array(z.string()).default([]),
  }).optional(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type GitConfig = z.infer<typeof GitConfigSchema>;
export type ProjectDefaults = z.infer<typeof ProjectDefaultsSchema>;
export type ConfigData = z.infer<typeof ConfigSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Config Class
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Central configuration manager
 * 
 * Usage:
 * ```typescript
 * const config = await Config.create();
 * 
 * // Get user name (with fallback)
 * const name = config.getUserName() || 'Developer';
 * 
 * // Set user preferences
 * config.setUserName('Claudine');
 * config.setUserEmail('claudine@example.com');
 * config.setDefaultLanguage('python');
 * 
 * // Get project defaults
 * const pythonConfig = config.getPythonDefaults();
 * const rustConfig = config.getRustDefaults();
 * 
 * // Save config
 * await config.save();
 * ```
 */
export class Config {
  private storage: Storage;
  private data: ConfigData;
  private initialized: boolean = false;

  private constructor(storage: Storage) {
    this.storage = storage;
    this.data = {
      version: '1.0.0',
    };
  }

  /**
   * Create and initialize config
   */
  static async create(): Promise<Config> {
    const storage = await getStorage();
    const config = new Config(storage);
    await config.init();
    return config;
  }

  /**
   * Initialize config (load from storage + env vars)
   */
  private async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Load from storage
      const storedData = this.storage.get<ConfigData>('config');
      
      if (storedData) {
        // Validate with Zod
        const validated = ConfigSchema.parse(storedData);
        this.data = validated;
        logger.debug('Config loaded from storage', { keys: Object.keys(this.data) });
      } else {
        // Initialize with defaults
        this.data = ConfigSchema.parse({});
        logger.debug('Config initialized with defaults');
      }

      // Override with environment variables
      this.loadFromEnv();

      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize config', error as Error);
      // Gracefully degrade to defaults
      this.data = ConfigSchema.parse({});
      this.initialized = true;
    }
  }

  /**
   * Load overrides from environment variables
   * Pattern: CLAUDINE_USER_NAME, CLAUDINE_GIT_AUTO_INIT, etc.
   */
  private loadFromEnv(): void {
    // User preferences
    if (process.env.CLAUDINE_USER_NAME) {
      this.setUserName(process.env.CLAUDINE_USER_NAME);
    }
    if (process.env.CLAUDINE_USER_EMAIL) {
      this.setUserEmail(process.env.CLAUDINE_USER_EMAIL);
    }
    if (process.env.CLAUDINE_DEFAULT_LANGUAGE) {
      const lang = process.env.CLAUDINE_DEFAULT_LANGUAGE as any;
      if (['python', 'rust', 'bun', 'ruby', 'react', 'node', 'go'].includes(lang)) {
        this.setDefaultLanguage(lang);
      }
    }

    // Git config
    if (process.env.CLAUDINE_GIT_AUTO_INIT) {
      this.setGitAutoInit(process.env.CLAUDINE_GIT_AUTO_INIT === 'true');
    }
    if (process.env.CLAUDINE_GIT_DEFAULT_BRANCH) {
      this.setGitDefaultBranch(process.env.CLAUDINE_GIT_DEFAULT_BRANCH);
    }

    logger.debug('Environment variables loaded');
  }

  /**
   * Save config to storage
   */
  async save(): Promise<void> {
    try {
      this.storage.set('config', this.data);
      await this.storage.flush();
      logger.debug('Config saved to storage');
    } catch (error) {
      logger.error('Failed to save config', error as Error);
      throw error;
    }
  }

  /**
   * Export config as JSON
   */
  toJSON(): ConfigData {
    return { ...this.data };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // User Preferences
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getUserName(): string | undefined {
    return this.data.user?.name;
  }

  setUserName(name: string): void {
    if (!this.data.user) {
      this.data.user = {};
    }
    this.data.user.name = name;
  }

  getUserEmail(): string | undefined {
    return this.data.user?.email;
  }

  setUserEmail(email: string): void {
    if (!this.data.user) {
      this.data.user = {};
    }
    this.data.user.email = email;
  }

  getDefaultLanguage(): string | undefined {
    return this.data.user?.defaultLanguage;
  }

  setDefaultLanguage(language: 'python' | 'rust' | 'bun' | 'ruby' | 'react' | 'node' | 'go'): void {
    if (!this.data.user) {
      this.data.user = {};
    }
    this.data.user.defaultLanguage = language;
  }

  getDefaultTemplate(): string | undefined {
    return this.data.user?.defaultTemplate;
  }

  setDefaultTemplate(template: string): void {
    if (!this.data.user) {
      this.data.user = {};
    }
    this.data.user.defaultTemplate = template;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Git Config
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getGitAutoInit(): boolean {
    return this.data.git?.autoInit ?? true;
  }

  setGitAutoInit(autoInit: boolean): void {
    if (!this.data.git) {
      this.data.git = GitConfigSchema.parse({});
    }
    this.data.git.autoInit = autoInit;
  }

  getGitDefaultBranch(): string {
    return this.data.git?.defaultBranch ?? 'main';
  }

  setGitDefaultBranch(branch: string): void {
    if (!this.data.git) {
      this.data.git = GitConfigSchema.parse({});
    }
    this.data.git.defaultBranch = branch;
  }

  getGitCommitMessage(): string | undefined {
    return this.data.git?.commitMessage;
  }

  setGitCommitMessage(message: string): void {
    if (!this.data.git) {
      this.data.git = GitConfigSchema.parse({});
    }
    this.data.git.commitMessage = message;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Project Defaults
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getPythonDefaults() {
    return this.data.projects?.python ?? {
      packageManager: 'uv' as const,
    };
  }

  setPythonPackageManager(pm: 'uv' | 'pip' | 'poetry'): void {
    if (!this.data.projects) {
      this.data.projects = {};
    }
    if (!this.data.projects.python) {
      this.data.projects.python = { packageManager: pm };
    } else {
      this.data.projects.python.packageManager = pm;
    }
  }

  getRustDefaults() {
    return this.data.projects?.rust ?? {
      edition: '2021' as const,
    };
  }

  setRustEdition(edition: '2015' | '2018' | '2021' | '2024'): void {
    if (!this.data.projects) {
      this.data.projects = {};
    }
    if (!this.data.projects.rust) {
      this.data.projects.rust = { edition };
    } else {
      this.data.projects.rust.edition = edition;
    }
  }

  getNodeDefaults() {
    return this.data.projects?.node ?? {
      packageManager: 'bun' as const,
    };
  }

  setNodePackageManager(pm: 'npm' | 'yarn' | 'pnpm' | 'bun'): void {
    if (!this.data.projects) {
      this.data.projects = {};
    }
    if (!this.data.projects.node) {
      this.data.projects.node = { packageManager: pm };
    } else {
      this.data.projects.node.packageManager = pm;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Templates
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getCustomTemplatePath(): string | undefined {
    return this.data.templates?.customPath;
  }

  setCustomTemplatePath(path: string): void {
    if (!this.data.templates) {
      this.data.templates = { remoteRepos: [] };
    }
    this.data.templates.customPath = path;
  }

  getRemoteTemplateRepos(): string[] {
    return this.data.templates?.remoteRepos ?? [];
  }

  addRemoteTemplateRepo(url: string): void {
    if (!this.data.templates) {
      this.data.templates = { remoteRepos: [] };
    }
    if (!this.data.templates.remoteRepos.includes(url)) {
      this.data.templates.remoteRepos.push(url);
    }
  }

  removeRemoteTemplateRepo(url: string): void {
    if (!this.data.templates?.remoteRepos) {
      return;
    }
    this.data.templates.remoteRepos = this.data.templates.remoteRepos.filter(r => r !== url);
  }
}

/**
 * Global config instance
 */
let globalConfig: Config | null = null;

/**
 * Get global config instance (lazy init)
 */
export async function getConfig(): Promise<Config> {
  if (!globalConfig) {
    globalConfig = await Config.create();
  }
  return globalConfig;
}

/**
 * Reset global config (for testing)
 */
export function resetConfig(): void {
  globalConfig = null;
}
