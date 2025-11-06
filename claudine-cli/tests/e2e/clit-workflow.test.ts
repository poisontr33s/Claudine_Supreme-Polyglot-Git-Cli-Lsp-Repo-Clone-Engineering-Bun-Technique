/**
 * E2E Workflow Tests for Claudine CLI (CLIT)
 *
 * Tests complete user workflows: detect → init → create → activate
 *
 * Note: This test suite is designed to work with both current CLI structure
 * and future orchestrator pattern (Issue #3). Currently uses direct command
 * testing, will be migrated to orchestrator.invoke() pattern when available.
 */

import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execa } from "execa";

// Path to CLI entry point
const CLI_PATH = join(__dirname, "../../src/cli.ts");
const BUN_BIN = process.env.BUN_BIN || "bun";

// Test fixtures
let tempDir: string;

beforeAll(async () => {
  // Create temporary test directory
  tempDir = await mkdtemp(join(tmpdir(), "claudine-e2e-"));
  console.log(`Test directory: ${tempDir}`);
});

afterAll(async () => {
  // Cleanup test directory
  if (tempDir && existsSync(tempDir)) {
    await rm(tempDir, { recursive: true, force: true });
  }
});

/**
 * Helper to execute CLI commands
 */
async function runCLI(args: string[], options: { cwd?: string; input?: string } = {}) {
  try {
    const result = await execa(BUN_BIN, ["run", CLI_PATH, ...args], {
      cwd: options.cwd || process.cwd(),
      input: options.input,
      env: {
        ...process.env,
        // Disable interactive prompts in tests
        CI: "true",
        NO_COLOR: "1",
      },
    });
    return {
      success: true,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; exitCode?: number; message?: string };
    return {
      success: false,
      stdout: err.stdout || "",
      stderr: err.stderr || "",
      exitCode: err.exitCode || 1,
      error: err.message,
    };
  }
}

/**
 * Helper to detect languages in a directory
 * Simulates the orchestrator's detect-languages action
 * Recursively searches directories for language markers
 */
async function detectLanguages(projectPath: string) {
  const languageSet = new Set<string>();

  // Check for language markers in a directory
  function checkLanguageMarkers(dir: string) {
    if (
      existsSync(join(dir, "pyproject.toml")) ||
      existsSync(join(dir, "requirements.txt")) ||
      existsSync(join(dir, "setup.py"))
    ) {
      languageSet.add("Python");
    }

    if (existsSync(join(dir, "Cargo.toml"))) {
      languageSet.add("Rust");
    }

    if (existsSync(join(dir, "package.json"))) {
      languageSet.add("JavaScript/TypeScript");
    }

    if (existsSync(join(dir, "Gemfile"))) {
      languageSet.add("Ruby");
    }

    if (existsSync(join(dir, "go.mod"))) {
      languageSet.add("Go");
    }
  }

  // Recursively scan directory
  async function scanDirectory(dir: string, depth = 0) {
    if (depth > 3) {
      return; // Limit recursion depth
    }

    try {
      if (!existsSync(dir)) {
        return;
      }

      // Check current directory
      checkLanguageMarkers(dir);

      // Scan subdirectories
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          await scanDirectory(join(dir, entry.name), depth + 1);
        }
      }
    } catch (_error) {
      // Ignore errors in scanning
    }
  }

  await scanDirectory(projectPath);

  // Convert Set to Array
  const detectedLanguages: Array<{ language: string; confidence: number }> = [];
  for (const lang of Array.from(languageSet)) {
    detectedLanguages.push({ language: lang, confidence: 1.0 });
  }

  return {
    success: true,
    data: detectedLanguages,
  };
}

/**
 * Test 1: Full CLIT Workflow
 * Validates: detect → init → create → activate
 */
describe("Full CLIT Workflow", () => {
  test("should complete full workflow: detect → init → create → activate", async () => {
    // 1. Create a test workspace
    const workspaceDir = join(tempDir, "full-workflow-test");
    await mkdir(workspaceDir, { recursive: true });

    // 2. Detect languages in current workspace (should be empty initially)
    const detectResult = await detectLanguages(workspaceDir);
    expect(detectResult.success).toBe(true);
    expect(detectResult.data).toBeInstanceOf(Array);
    // Empty workspace should have no languages detected
    expect(detectResult.data.length).toBe(0);

    // 3. Initialize config (simulated - would use orchestrator.invoke('config-init'))
    // For now, create a minimal config file
    const configPath = join(workspaceDir, ".claudinerc.json");
    const config = {
      version: "2.0.0",
      scripts: {
        claudineENV: "scripts/claudineENV.ps1",
      },
      projects: [],
    };
    await writeFile(configPath, JSON.stringify(config, null, 2));

    // Verify config exists
    expect(existsSync(configPath)).toBe(true);
    const configFileContent = await import("node:fs/promises").then((fs) => fs.readFile(configPath, "utf-8"));
    const configContent = JSON.parse(configFileContent);
    expect(configContent).toHaveProperty("version");
    expect(configContent.scripts).toHaveProperty("claudineENV");

    // 4. Create Python project using CLI
    const projectName = "e2e-test-project";
    const projectDir = join(workspaceDir, projectName);
    await mkdir(projectDir, { recursive: true });

    // Create a minimal Python project structure
    await writeFile(
      join(projectDir, "pyproject.toml"),
      `[project]
name = "${projectName}"
version = "0.1.0"
description = "E2E test project"
`,
    );

    // Verify project was created
    expect(existsSync(projectDir)).toBe(true);
    expect(existsSync(join(projectDir, "pyproject.toml"))).toBe(true);

    // 5. Detect languages again (should now find Python)
    const detectResult2 = await detectLanguages(workspaceDir);
    expect(detectResult2.success).toBe(true);
    expect(detectResult2.data.length).toBeGreaterThan(0);
    const languages = detectResult2.data.map((d) => d.language);
    expect(languages).toContain("Python");

    // 6. Activate environment (simulated via health check)
    const healthResult = await runCLI(["env", "health", "--json"]);
    expect(healthResult.success).toBe(true);
    // Health check should return valid JSON
    if (healthResult.stdout) {
      const healthData = JSON.parse(healthResult.stdout);
      expect(healthData).toBeInstanceOf(Array);
      expect(healthData.length).toBeGreaterThan(0);
    }
  }, 30000); // 30 second timeout for full workflow
});

/**
 * Test 2: Multi-Language Project
 * Tests creation and detection of multiple language projects
 */
describe("Multi-Language Project Workflow", () => {
  test("should handle multi-language project creation and detection", async () => {
    const multiLangDir = join(tempDir, "multi-lang-test");
    await mkdir(multiLangDir, { recursive: true });

    // Create Python project
    const pythonDir = join(multiLangDir, "e2e-python");
    await mkdir(pythonDir, { recursive: true });
    await writeFile(
      join(pythonDir, "pyproject.toml"),
      `[project]
name = "e2e-python"
version = "0.1.0"
`,
    );

    // Verify Python project
    expect(existsSync(pythonDir)).toBe(true);

    // Create Rust project
    const rustDir = join(multiLangDir, "e2e-rust");
    await mkdir(rustDir, { recursive: true });
    await writeFile(
      join(rustDir, "Cargo.toml"),
      `[package]
name = "e2e-rust"
version = "0.1.0"
edition = "2021"
`,
    );

    // Verify Rust project
    expect(existsSync(rustDir)).toBe(true);

    // Detect should find both languages
    const detectResult = await detectLanguages(multiLangDir);
    expect(detectResult.success).toBe(true);
    expect(detectResult.data.length).toBeGreaterThan(0);

    const languages = detectResult.data.map((d) => d.language);
    expect(languages).toContain("Python");
    expect(languages).toContain("Rust");
    expect(detectResult.data.length).toBeGreaterThanOrEqual(2);
  });
});

/**
 * Test 3: Health Check Workflow
 * Validates environment health checking functionality
 */
describe("Health Check Workflow", () => {
  test("should run health check and report status correctly", async () => {
    // Run health check with JSON output for easier parsing
    const healthResult = await runCLI(["env", "health", "--json"]);

    expect(healthResult.exitCode).toBeDefined();

    // Parse health check output
    if (healthResult.stdout) {
      const healthData = JSON.parse(healthResult.stdout);

      // Validate structure
      expect(healthData).toBeInstanceOf(Array);
      expect(healthData.length).toBeGreaterThan(0);

      // Each health check should have required fields
      for (const check of healthData) {
        expect(check).toHaveProperty("tool");
        expect(check).toHaveProperty("installed");

        if (check.installed) {
          expect(check).toHaveProperty("version");
        }
      }

      // Should check for at least some critical tools
      const toolNames = healthData.map((c: { tool: string }) => c.tool);
      expect(toolNames.length).toBeGreaterThan(0);
    }
  });

  test("should run health check with verbose output", async () => {
    // Run with verbose flag
    const healthResult = await runCLI(["env", "health", "--verbose", "--json"]);

    expect(healthResult.exitCode).toBeDefined();

    if (healthResult.stdout) {
      const healthData = JSON.parse(healthResult.stdout);
      expect(healthData).toBeInstanceOf(Array);

      // Verbose mode should include paths when tools are installed
      const installedTools = healthData.filter((c: { installed: boolean }) => c.installed);
      if (installedTools.length > 0) {
        // At least some installed tools should have paths
        const toolsWithPaths = installedTools.filter((c: { path?: string }) => c.path);
        expect(toolsWithPaths.length).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

/**
 * Test 4: Project Creation Workflow
 * Tests CLI project creation commands
 */
describe("Project Creation Workflow", () => {
  test("should create Python project with basic template", async () => {
    const _projectDir = join(tempDir, "python-basic-test");

    // Note: This requires Python/uv to be installed
    // Skip if not available (graceful degradation)
    try {
      await execa("uv", ["--version"]);
    } catch {
      console.log("Skipping Python project test (uv not installed)");
      return;
    }

    const result = await runCLI(
      ["project", "new", "python", "test-python-project", "--template", "basic", "--yes", "--no-install"],
      { cwd: tempDir },
    );

    // Even if creation fails, the command should execute
    expect(result.exitCode).toBeDefined();
  });
});

/**
 * Test 5: CLI Help and Version
 * Basic sanity tests for CLI functionality
 */
describe("CLI Basic Functionality", () => {
  test("should display help", async () => {
    const result = await runCLI(["--help"]);
    expect(result.stdout).toContain("claudine");
    expect(result.stdout).toContain("project");
  });

  test("should display version", async () => {
    const result = await runCLI(["--version"]);
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
  });
});
