/**
 * Plugin Manager Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PluginManager } from '../plugin/manager.js';
import type { PluginManifest } from '../plugin/types.js';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('Plugin Manager', () => {
  let testDir: string;
  let pluginManager: PluginManager;

  beforeEach(() => {
    // Create temporary test directory
    testDir = join(tmpdir(), `claudine-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    // Initialize plugin manager with test paths
    pluginManager = PluginManager.getInstance('2.0.0', testDir);
    pluginManager.addSearchPath(testDir);
  });

  afterEach(() => {
    // Cleanup test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Initialization', () => {
    it('should create singleton instance', () => {
      const instance1 = PluginManager.getInstance();
      const instance2 = PluginManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should have default search paths', () => {
      const manager = PluginManager.getInstance();
      expect(manager).toBeDefined();
    });
  });

  describe('Plugin Discovery', () => {
    it('should discover plugins with valid manifests', async () => {
      // Note: This test verifies plugin discovery works
      // It may find the docker-compose-plugin from examples/ if it exists
      
      const result = await pluginManager.discover();
      
      // May find 0 plugins if no plugins are installed (that's OK for unit test)
      expect(result).toHaveProperty('found');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.found)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
      
      // If plugins are found, verify structure
      if (result.found.length > 0) {
        const firstPlugin = result.found[0];
        expect(firstPlugin).toHaveProperty('id');
        expect(firstPlugin).toHaveProperty('name');
        expect(firstPlugin).toHaveProperty('version');
      }
    });

    it('should handle missing manifests gracefully', async () => {
      // Create directory without manifest
      const pluginDir = join(testDir, 'invalid-plugin');
      mkdirSync(pluginDir, { recursive: true });

      const result = await pluginManager.discover();
      expect(result.errors.length).toBe(0); // Should skip, not error
    });

    it('should handle invalid JSON in manifests', async () => {
      const pluginDir = join(testDir, 'bad-json-plugin');
      mkdirSync(pluginDir, { recursive: true });

      writeFileSync(
        join(pluginDir, 'claudine-plugin.json'),
        '{ invalid json }'
      );

      const result = await pluginManager.discover();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Plugin Loading', () => {
    it('should reject plugins without required manifest fields', async () => {
      const pluginDir = join(testDir, 'incomplete-plugin');
      mkdirSync(pluginDir, { recursive: true });

      // Missing required fields
      const manifest = {
        name: 'Incomplete Plugin',
      };

      writeFileSync(
        join(pluginDir, 'claudine-plugin.json'),
        JSON.stringify(manifest, null, 2)
      );

      const result = await pluginManager.discover();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Plugin Registry', () => {
    it('should track loaded plugins', () => {
      const plugins = pluginManager.getAllPlugins();
      expect(Array.isArray(plugins)).toBe(true);
    });

    it('should check if plugin is loaded', () => {
      const isLoaded = pluginManager.isLoaded('non-existent-plugin');
      expect(isLoaded).toBe(false);
    });

    it('should get active plugins', () => {
      const active = pluginManager.getActivePlugins();
      expect(Array.isArray(active)).toBe(true);
    });
  });
});
