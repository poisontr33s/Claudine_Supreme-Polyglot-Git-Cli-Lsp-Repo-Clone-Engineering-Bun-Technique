/**
 * Comprehensive test suite for config-manager
 *
 * Tests:
 * - Config loading with upward directory search
 * - Config initialization with default structure
 * - Config saving and updating
 * - Error handling (missing dirs, corrupted JSON, permissions)
 * - Script resolution
 * - Validation
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  type CLITConfig,
  CONFIG_DIR_NAME,
  CONFIG_FILE_NAME,
  ConfigNotFoundError,
  ConfigValidationError,
  DEFAULT_LANGUAGES,
  findPolygluttonyRoot,
  initConfig,
  loadConfig,
  resolveScriptPath,
  saveConfig,
  updateConfig,
  validateConfig,
} from "../src/core/config/config-manager";

// Test fixture directories
let testRootDir: string;
let testPolygluttonyDir: string;

/**
 * Create a test fixture directory structure
 */
function createTestFixture(): void {
  testRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "claudine-test-"));
  testPolygluttonyDir = path.join(testRootDir, CONFIG_DIR_NAME);
  fs.mkdirSync(testPolygluttonyDir, { recursive: true });
}

/**
 * Clean up test fixture directories
 */
function cleanupTestFixture(): void {
  if (testRootDir && fs.existsSync(testRootDir)) {
    fs.rmSync(testRootDir, { recursive: true, force: true });
  }
}

/**
 * Create a valid config.json file in test fixture
 */
function createValidConfig(customValues?: Partial<CLITConfig>): CLITConfig {
  const config: CLITConfig = {
    version: "1.0.0",
    polygluttonyRoot: testPolygluttonyDir,
    workspaceRoot: testRootDir,
    scripts: {
      claudineENV: path.join(testPolygluttonyDir, "claudineENV.ps1"),
      claudineENV_F: path.join(testPolygluttonyDir, "claudineENV_F.ps1"),
    },
    languages: DEFAULT_LANGUAGES,
    ...customValues,
  };

  const configPath = path.join(testPolygluttonyDir, CONFIG_FILE_NAME);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

  return config;
}

describe("Config Loading Tests", () => {
  beforeEach(() => {
    createTestFixture();
  });

  afterEach(() => {
    cleanupTestFixture();
  });

  it("should load valid config from .poly_gluttony/config.json", () => {
    const expectedConfig = createValidConfig();
    const loadedConfig = loadConfig(testRootDir);

    expect(loadedConfig.version).toBe(expectedConfig.version);
    expect(loadedConfig.polygluttonyRoot).toBe(expectedConfig.polygluttonyRoot);
    expect(loadedConfig.workspaceRoot).toBe(expectedConfig.workspaceRoot);
    expect(loadedConfig.languages).toEqual(expectedConfig.languages);
  });

  it("should find .poly_gluttony by searching upward from nested directory", () => {
    createValidConfig();

    // Create nested directory structure
    const nestedDir = path.join(testRootDir, "src", "commands", "deep");
    fs.mkdirSync(nestedDir, { recursive: true });

    // Load config from deeply nested directory
    const config = loadConfig(nestedDir);
    expect(config.polygluttonyRoot).toBe(testPolygluttonyDir);
  });

  it("should return valid CLITConfig with all required fields", () => {
    createValidConfig();
    const config = loadConfig(testRootDir);

    expect(config).toHaveProperty("version");
    expect(config).toHaveProperty("polygluttonyRoot");
    expect(config).toHaveProperty("workspaceRoot");
    expect(config).toHaveProperty("scripts");
    expect(config).toHaveProperty("languages");
    expect(typeof config.version).toBe("string");
    expect(typeof config.polygluttonyRoot).toBe("string");
    expect(typeof config.workspaceRoot).toBe("string");
    expect(typeof config.scripts).toBe("object");
    expect(Array.isArray(config.languages)).toBe(true);
  });

  it("should throw ConfigNotFoundError when .poly_gluttony not found", () => {
    // Don't create config, use a different temp directory
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), "claudine-empty-"));

    try {
      expect(() => loadConfig(emptyDir)).toThrow(ConfigNotFoundError);
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });

  it("should throw ConfigNotFoundError when config.json missing", () => {
    // Create .poly_gluttony but no config.json
    expect(() => loadConfig(testRootDir)).toThrow(ConfigNotFoundError);
    expect(() => loadConfig(testRootDir)).toThrow("Configuration file not found");
  });

  it("should handle corrupted JSON gracefully", () => {
    const configPath = path.join(testPolygluttonyDir, CONFIG_FILE_NAME);
    fs.writeFileSync(configPath, "{ invalid json content }", "utf-8");

    expect(() => loadConfig(testRootDir)).toThrow(ConfigValidationError);
    expect(() => loadConfig(testRootDir)).toThrow("Corrupted JSON");
  });

  it("should throw ConfigValidationError for missing required fields", () => {
    const configPath = path.join(testPolygluttonyDir, CONFIG_FILE_NAME);
    const invalidConfig = {
      version: "1.0.0",
      // Missing required fields
    };
    fs.writeFileSync(configPath, JSON.stringify(invalidConfig), "utf-8");

    expect(() => loadConfig(testRootDir)).toThrow(ConfigValidationError);
  });
});

describe("Config Initialization Tests", () => {
  beforeEach(() => {
    testRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "claudine-init-"));
  });

  afterEach(() => {
    cleanupTestFixture();
  });

  it("should create .poly_gluttony directory structure", () => {
    initConfig(testRootDir);

    const polygluttonyDir = path.join(testRootDir, CONFIG_DIR_NAME);
    expect(fs.existsSync(polygluttonyDir)).toBe(true);
    expect(fs.statSync(polygluttonyDir).isDirectory()).toBe(true);
  });

  it("should create required subdirectories", () => {
    initConfig(testRootDir);

    const polygluttonyDir = path.join(testRootDir, CONFIG_DIR_NAME);
    const environmentsDir = path.join(polygluttonyDir, "environments");
    const scriptsDir = path.join(polygluttonyDir, "scripts");
    const healthDir = path.join(polygluttonyDir, "health");

    expect(fs.existsSync(environmentsDir)).toBe(true);
    expect(fs.existsSync(scriptsDir)).toBe(true);
    expect(fs.existsSync(healthDir)).toBe(true);
    expect(fs.statSync(environmentsDir).isDirectory()).toBe(true);
    expect(fs.statSync(scriptsDir).isDirectory()).toBe(true);
    expect(fs.statSync(healthDir).isDirectory()).toBe(true);
  });

  it("should generate valid config.json with defaults", () => {
    const config = initConfig(testRootDir);

    expect(config.version).toBe("1.0.0");
    expect(config.polygluttonyRoot).toBe(path.join(testRootDir, CONFIG_DIR_NAME));
    expect(config.workspaceRoot).toBe(testRootDir);
    expect(config.languages).toEqual(DEFAULT_LANGUAGES);
    expect(config).toHaveProperty("lastUpdated");
  });

  it("should detect script paths when scripts exist", () => {
    // Create scripts first
    const polygluttonyDir = path.join(testRootDir, CONFIG_DIR_NAME);
    fs.mkdirSync(polygluttonyDir, { recursive: true });

    const script1Path = path.join(polygluttonyDir, "claudineENV.ps1");
    const script2Path = path.join(polygluttonyDir, "claudineENV_F.ps1");
    fs.writeFileSync(script1Path, "# PowerShell script", "utf-8");
    fs.writeFileSync(script2Path, "# PowerShell script", "utf-8");

    const config = initConfig(testRootDir, true);

    expect(config.scripts.claudineENV).toBe(script1Path);
    expect(config.scripts.claudineENV_F).toBe(script2Path);
  });

  it("should not overwrite existing config without force flag", () => {
    // Create initial config
    initConfig(testRootDir);

    // Try to init again without force
    expect(() => initConfig(testRootDir, false)).toThrow("Configuration already exists");
  });

  it("should overwrite existing config with force flag", () => {
    // Create initial config
    const config1 = initConfig(testRootDir);
    const version1 = config1.version;

    // Wait a tiny bit to ensure different timestamp
    // (In real scenarios, this would be different)

    // Overwrite with force
    const config2 = initConfig(testRootDir, true);
    expect(config2.version).toBe(version1); // Same version
    expect(config2.polygluttonyRoot).toBe(config1.polygluttonyRoot);
  });
});

describe("Config Persistence Tests", () => {
  beforeEach(() => {
    createTestFixture();
  });

  afterEach(() => {
    cleanupTestFixture();
  });

  it("should write config to disk successfully", () => {
    const config: CLITConfig = {
      version: "1.0.0",
      polygluttonyRoot: testPolygluttonyDir,
      workspaceRoot: testRootDir,
      scripts: {},
      languages: DEFAULT_LANGUAGES,
    };

    saveConfig(config);

    const configPath = path.join(testPolygluttonyDir, CONFIG_FILE_NAME);
    expect(fs.existsSync(configPath)).toBe(true);

    const savedData = fs.readFileSync(configPath, "utf-8");
    const savedConfig = JSON.parse(savedData);
    expect(savedConfig.version).toBe(config.version);
  });

  it("should merge partial updates correctly", () => {
    createValidConfig({ version: "1.0.0" });

    const updates = {
      version: "1.1.0",
    };

    const updatedConfig = updateConfig(updates, testRootDir);

    expect(updatedConfig.version).toBe("1.1.0");
    expect(updatedConfig.polygluttonyRoot).toBe(testPolygluttonyDir); // Preserved
    expect(updatedConfig.languages).toEqual(DEFAULT_LANGUAGES); // Preserved
  });

  it("should preserve existing fields when updating subset", () => {
    const originalConfig = createValidConfig({
      version: "1.0.0",
      languages: ["python", "rust"],
    });

    const updates = {
      version: "2.0.0",
    };

    const updatedConfig = updateConfig(updates, testRootDir);

    expect(updatedConfig.version).toBe("2.0.0"); // Updated
    expect(updatedConfig.languages).toEqual(["python", "rust"]); // Preserved
    expect(updatedConfig.workspaceRoot).toBe(originalConfig.workspaceRoot); // Preserved
  });

  it("should update lastUpdated timestamp", () => {
    createValidConfig();

    const updates = {
      version: "1.1.0",
    };

    const updatedConfig = updateConfig(updates, testRootDir);
    expect(updatedConfig).toHaveProperty("lastUpdated");
    expect(typeof updatedConfig.lastUpdated).toBe("string");
  });

  it("should merge script updates correctly", () => {
    createValidConfig({
      scripts: {
        claudineENV: "old-path.ps1",
      },
    });

    const updates = {
      scripts: {
        claudineENV_F: "new-script.ps1",
      },
    };

    const updatedConfig = updateConfig(updates, testRootDir);

    expect(updatedConfig.scripts.claudineENV).toBe("old-path.ps1"); // Preserved
    expect(updatedConfig.scripts.claudineENV_F).toBe("new-script.ps1"); // Added
  });
});

describe("Validation Tests", () => {
  it("should accept valid config", () => {
    const validConfig = {
      version: "1.0.0",
      polygluttonyRoot: "/path/to/.poly_gluttony",
      workspaceRoot: "/path/to/workspace",
      scripts: {},
      languages: ["python", "rust"],
    };

    expect(validateConfig(validConfig)).toBe(true);
  });

  it("should reject config missing version", () => {
    const invalidConfig = {
      // Missing version
      polygluttonyRoot: "/path/to/.poly_gluttony",
      workspaceRoot: "/path/to/workspace",
      scripts: {},
      languages: ["python"],
    };

    expect(() => validateConfig(invalidConfig)).toThrow(ConfigValidationError);
  });

  it("should reject config missing polygluttonyRoot", () => {
    const invalidConfig = {
      version: "1.0.0",
      // Missing polygluttonyRoot
      workspaceRoot: "/path/to/workspace",
      scripts: {},
      languages: ["python"],
    };

    expect(() => validateConfig(invalidConfig)).toThrow(ConfigValidationError);
  });

  it("should reject config missing workspaceRoot", () => {
    const invalidConfig = {
      version: "1.0.0",
      polygluttonyRoot: "/path/to/.poly_gluttony",
      // Missing workspaceRoot
      scripts: {},
      languages: ["python"],
    };

    expect(() => validateConfig(invalidConfig)).toThrow(ConfigValidationError);
  });

  it("should reject config missing scripts", () => {
    const invalidConfig = {
      version: "1.0.0",
      polygluttonyRoot: "/path/to/.poly_gluttony",
      workspaceRoot: "/path/to/workspace",
      // Missing scripts
      languages: ["python"],
    };

    expect(() => validateConfig(invalidConfig)).toThrow(ConfigValidationError);
  });

  it("should reject config missing languages", () => {
    const invalidConfig = {
      version: "1.0.0",
      polygluttonyRoot: "/path/to/.poly_gluttony",
      workspaceRoot: "/path/to/workspace",
      scripts: {},
      // Missing languages
    };

    expect(() => validateConfig(invalidConfig)).toThrow(ConfigValidationError);
  });

  it("should reject config with invalid types", () => {
    const invalidConfig = {
      version: 123, // Should be string
      polygluttonyRoot: "/path/to/.poly_gluttony",
      workspaceRoot: "/path/to/workspace",
      scripts: {},
      languages: ["python"],
    };

    expect(() => validateConfig(invalidConfig)).toThrow(ConfigValidationError);
  });
});

describe("Script Resolution Tests", () => {
  beforeEach(() => {
    createTestFixture();
  });

  afterEach(() => {
    cleanupTestFixture();
  });

  it("should find script in polygluttonyRoot", () => {
    const scriptPath = path.join(testPolygluttonyDir, "claudineENV.ps1");
    fs.writeFileSync(scriptPath, "# PowerShell script", "utf-8");

    const resolved = resolveScriptPath("claudineENV.ps1", testPolygluttonyDir);
    expect(resolved).toBe(scriptPath);
  });

  it("should find script in scripts subdirectory", () => {
    const scriptsDir = path.join(testPolygluttonyDir, "scripts");
    fs.mkdirSync(scriptsDir, { recursive: true });

    const scriptPath = path.join(scriptsDir, "pwshGoddess.ps1");
    fs.writeFileSync(scriptPath, "# PowerShell script", "utf-8");

    const resolved = resolveScriptPath("pwshGoddess.ps1", testPolygluttonyDir);
    expect(resolved).toBe(scriptPath);
  });

  it("should return undefined for missing script", () => {
    const resolved = resolveScriptPath("nonexistent.ps1", testPolygluttonyDir);
    expect(resolved).toBeUndefined();
  });

  it("should prefer script in root over scripts subdirectory", () => {
    // Create script in both locations
    const rootScriptPath = path.join(testPolygluttonyDir, "test.ps1");
    const scriptsDir = path.join(testPolygluttonyDir, "scripts");
    fs.mkdirSync(scriptsDir, { recursive: true });
    const subScriptPath = path.join(scriptsDir, "test.ps1");

    fs.writeFileSync(rootScriptPath, "# Root script", "utf-8");
    fs.writeFileSync(subScriptPath, "# Sub script", "utf-8");

    const resolved = resolveScriptPath("test.ps1", testPolygluttonyDir);
    expect(resolved).toBe(rootScriptPath); // Should prefer root
  });
});

describe("findPolygluttonyRoot Tests", () => {
  beforeEach(() => {
    createTestFixture();
  });

  afterEach(() => {
    cleanupTestFixture();
  });

  it("should find .poly_gluttony in current directory", () => {
    const found = findPolygluttonyRoot(testRootDir);
    expect(found).toBe(testPolygluttonyDir);
  });

  it("should find .poly_gluttony in parent directory", () => {
    const childDir = path.join(testRootDir, "child");
    fs.mkdirSync(childDir, { recursive: true });

    const found = findPolygluttonyRoot(childDir);
    expect(found).toBe(testPolygluttonyDir);
  });

  it("should find .poly_gluttony multiple levels up", () => {
    const deepDir = path.join(testRootDir, "a", "b", "c", "d");
    fs.mkdirSync(deepDir, { recursive: true });

    const found = findPolygluttonyRoot(deepDir);
    expect(found).toBe(testPolygluttonyDir);
  });

  it("should throw ConfigNotFoundError when not found", () => {
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), "claudine-nofind-"));

    try {
      expect(() => findPolygluttonyRoot(emptyDir)).toThrow(ConfigNotFoundError);
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });
});
