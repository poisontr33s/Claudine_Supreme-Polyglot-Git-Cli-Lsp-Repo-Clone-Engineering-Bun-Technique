/**
 * Language Detection Tests
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { detectLanguages, getPrimaryLanguage, hasLanguage } from '../src/core/detector/language-detector.js';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const TEST_DIR = path.join(process.cwd(), 'tests', 'fixtures', 'detection');

beforeAll(() => {
  // Create test fixtures
  mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
  // Cleanup test fixtures
  try {
    rmSync(TEST_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});

describe('Language Detection', () => {
  test('detects Python project with pyproject.toml', async () => {
    const projectDir = path.join(TEST_DIR, 'python-project');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(path.join(projectDir, 'pyproject.toml'), '[project]\nname = "test"');

    const result = await detectLanguages(projectDir);

    expect(result.languages.length).toBeGreaterThan(0);
    expect(result.languages[0].name).toBe('python');
    expect(result.languages[0].confidence).toBe(1.0);
    expect(result.languages[0].evidence).toContain('pyproject.toml');
  });

  test('detects Rust project with Cargo.toml', async () => {
    const projectDir = path.join(TEST_DIR, 'rust-project');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(path.join(projectDir, 'Cargo.toml'), '[package]\nname = "test"');

    const result = await detectLanguages(projectDir);

    expect(hasLanguage(result, 'rust')).toBe(true);
    const rustLang = result.languages.find(l => l.name === 'rust');
    expect(rustLang?.confidence).toBe(1.0);
  });

  test('detects multi-language project (Python + Rust)', async () => {
    const projectDir = path.join(TEST_DIR, 'multi-lang');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(path.join(projectDir, 'pyproject.toml'), '[project]\nname = "test"');
    writeFileSync(path.join(projectDir, 'Cargo.toml'), '[package]\nname = "test"');

    const result = await detectLanguages(projectDir);

    expect(result.multiLanguage).toBe(true);
    expect(result.languages.length).toBeGreaterThanOrEqual(2);
    expect(hasLanguage(result, 'python')).toBe(true);
    expect(hasLanguage(result, 'rust')).toBe(true);
  });

  test('detects Bun project with bun.lockb', async () => {
    const projectDir = path.join(TEST_DIR, 'bun-project');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(path.join(projectDir, 'bun.lockb'), '');
    writeFileSync(path.join(projectDir, 'package.json'), '{"name": "test"}');

    const result = await detectLanguages(projectDir);

    expect(hasLanguage(result, 'bun')).toBe(true);
  });

  test('detects Go project with go.mod', async () => {
    const projectDir = path.join(TEST_DIR, 'go-project');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(path.join(projectDir, 'go.mod'), 'module test\n\ngo 1.21');

    const result = await detectLanguages(projectDir);

    expect(hasLanguage(result, 'go')).toBe(true);
  });

  test('detects Ruby project with Gemfile', async () => {
    const projectDir = path.join(TEST_DIR, 'ruby-project');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(path.join(projectDir, 'Gemfile'), 'source "https://rubygems.org"');

    const result = await detectLanguages(projectDir);

    expect(hasLanguage(result, 'ruby')).toBe(true);
  });

  test('returns empty for directory with no language markers', async () => {
    const projectDir = path.join(TEST_DIR, 'empty-project');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(path.join(projectDir, 'README.md'), '# Test');

    const result = await detectLanguages(projectDir);

    expect(result.languages.length).toBe(0);
  });

  test('getPrimaryLanguage returns highest confidence', async () => {
    const projectDir = path.join(TEST_DIR, 'primary-test');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(path.join(projectDir, 'pyproject.toml'), '[project]\nname = "test"');
    writeFileSync(path.join(projectDir, 'package.json'), '{"name": "test"}');

    const result = await detectLanguages(projectDir);
    const primary = getPrimaryLanguage(result);

    expect(primary).not.toBeNull();
    expect(primary!.name).toBe('python');  // pyproject.toml = 1.0 confidence
  });

  test('respects minConfidence threshold', async () => {
    const projectDir = path.join(TEST_DIR, 'min-confidence-test');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(path.join(projectDir, 'setup.py'), '# Python setup');

    const result = await detectLanguages(projectDir, { minConfidence: 0.9 });

    // setup.py = 0.8 confidence, should be filtered out
    expect(result.languages.length).toBe(0);
  });
});

describe('Language Detection Integration with Orchestrator', () => {
  test('can be invoked via orchestrator (placeholder)', async () => {
    // This will fail until we integrate the native detector with orchestrator
    // Just verifying the module exports work correctly
    
    const projectDir = path.join(TEST_DIR, 'orchestrator-test');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(path.join(projectDir, 'Cargo.toml'), '[package]\nname = "test"');

    const result = await detectLanguages(projectDir);
    
    expect(result).toHaveProperty('languages');
    expect(result).toHaveProperty('projectPath');
    expect(result).toHaveProperty('multiLanguage');
  });
});
