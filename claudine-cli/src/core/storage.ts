/**
 * 🔥💋 Claudine CLI Storage System
 * 
 * Inspired by: Gemini CLI storage.ts
 * Pattern: Map-based cache + JSON file persistence
 * 
 * Features:
 * - In-memory cache (Map) for fast access
 * - JSON file persistence (~/.claudine/config.json)
 * - Debounced writes (don't hammer disk)
 * - Type-safe get/set with generics
 */

import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { logger } from './logger.js';

export interface StorageConfig {
  filePath?: string;
  autoSave?: boolean;
  debounceMs?: number;
}

/**
 * Storage class - persistent key-value store
 * 
 * Usage:
 * ```typescript
 * const storage = new Storage({ filePath: '~/.claudine/config.json' });
 * await storage.load();
 * 
 * storage.set('user.name', 'Claudine');
 * storage.set('user.email', 'claudine@example.com');
 * 
 * const name = storage.get('user.name'); // 'Claudine'
 * const email = storage.get<string>('user.email'); // Type-safe
 * 
 * await storage.save(); // Persist to disk
 * ```
 */
export class Storage {
  private cache: Map<string, any> = new Map();
  private filePath: string;
  private autoSave: boolean;
  private debounceMs: number;
  private saveTimer?: NodeJS.Timeout;
  private pendingSave: boolean = false;

  constructor(config: StorageConfig = {}) {
    this.filePath = config.filePath || join(homedir(), '.claudine', 'config.json');
    this.autoSave = config.autoSave ?? true;
    this.debounceMs = config.debounceMs ?? 1000; // 1 second debounce
  }

  /**
   * Load data from disk into cache
   */
  async load(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = dirname(this.filePath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      // Read file if exists
      if (existsSync(this.filePath)) {
        const data = await readFile(this.filePath, 'utf-8');
        const parsed = JSON.parse(data);
        this.cache = new Map(Object.entries(parsed));
        logger.debug(`Storage loaded from ${this.filePath}`, { keys: this.cache.size });
      } else {
        logger.debug(`Storage file not found, starting fresh: ${this.filePath}`);
      }
    } catch (error) {
      logger.error('Failed to load storage', error as Error);
      // Don't throw - gracefully degrade to empty cache
      this.cache = new Map();
    }
  }

  /**
   * Save cache to disk
   */
  async save(): Promise<void> {
    try {
      const data = Object.fromEntries(this.cache);
      const json = JSON.stringify(data, null, 2);
      
      // Ensure directory exists
      const dir = dirname(this.filePath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      await writeFile(this.filePath, json, 'utf-8');
      logger.debug(`Storage saved to ${this.filePath}`, { keys: this.cache.size });
      this.pendingSave = false;
    } catch (error) {
      logger.error('Failed to save storage', error as Error);
      throw error;
    }
  }

  /**
   * Get value by key (with optional default)
   */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    const value = this.cache.get(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get nested value by dot-notation path
   * Example: get('user.preferences.theme')
   */
  getNested<T = any>(path: string, defaultValue?: T): T | undefined {
    const keys = path.split('.');
    let current: any = Object.fromEntries(this.cache);

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }

    return current !== undefined ? current : defaultValue;
  }

  /**
   * Set value by key
   */
  set<T = any>(key: string, value: T): void {
    this.cache.set(key, value);
    
    if (this.autoSave) {
      this.scheduleSave();
    }
  }

  /**
   * Set nested value by dot-notation path
   * Example: setNested('user.preferences.theme', 'dark')
   */
  setNested<T = any>(path: string, value: T): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    // Get or create nested object
    let current: any = {};
    const existing = this.cache.get(keys[0]);
    if (existing && typeof existing === 'object') {
      current = { ...existing };
    }

    let pointer = current;
    for (let i = 1; i < keys.length; i++) {
      const key = keys[i];
      if (!pointer[key] || typeof pointer[key] !== 'object') {
        pointer[key] = {};
      }
      pointer = pointer[key];
    }

    pointer[lastKey] = value;
    this.cache.set(keys[0], current);

    if (this.autoSave) {
      this.scheduleSave();
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete key
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    
    if (result && this.autoSave) {
      this.scheduleSave();
    }
    
    return result;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.cache.clear();
    
    if (this.autoSave) {
      this.scheduleSave();
    }
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values
   */
  values(): any[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get all entries
   */
  entries(): [string, any][] {
    return Array.from(this.cache.entries());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Export all data as object
   */
  toObject(): Record<string, any> {
    return Object.fromEntries(this.cache);
  }

  /**
   * Schedule debounced save
   */
  private scheduleSave(): void {
    // Clear existing timer
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // Mark as pending
    this.pendingSave = true;

    // Schedule new save
    this.saveTimer = setTimeout(() => {
      this.save().catch(err => {
        logger.error('Debounced save failed', err);
      });
    }, this.debounceMs);
  }

  /**
   * Flush pending saves immediately
   */
  async flush(): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = undefined;
    }

    if (this.pendingSave) {
      await this.save();
    }
  }
}

/**
 * Global storage instance
 * Initialized lazily on first access
 */
let globalStorage: Storage | null = null;

/**
 * Get global storage instance
 */
export async function getStorage(): Promise<Storage> {
  if (!globalStorage) {
    globalStorage = new Storage();
    await globalStorage.load();
  }
  return globalStorage;
}

/**
 * Reset global storage (for testing)
 */
export function resetStorage(): void {
  globalStorage = null;
}
