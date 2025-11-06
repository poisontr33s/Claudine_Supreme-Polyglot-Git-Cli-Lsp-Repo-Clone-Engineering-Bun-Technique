import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as orchestrator from "../src/core/orchestrator/orchestrator";

describe("Config Tool Integration", () => {
  let tempDir: string;

  beforeAll(() => {
    // Create a temporary directory for testing
    tempDir = path.join(os.tmpdir(), `config-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterAll(() => {
    // Cleanup
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should load config via orchestrator", async () => {
    // First init config in temp directory
    const initResult = await orchestrator.invoke("config-init", {
      params: { workspaceRoot: tempDir },
    });

    expect(initResult.success).toBe(true);
    expect(initResult.data).toBeDefined();

    // Now load the config
    const result = await orchestrator.invoke("config-load", {
      params: { workspaceRoot: tempDir },
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("version");
    expect(result.data).toHaveProperty("polygluttonyRoot");
    expect(result.data.version).toBe("1.0.0");
    expect(result.data.polygluttonyRoot).toBe(path.join(tempDir, ".poly_gluttony"));
  });

  it("should init config via orchestrator", async () => {
    const tempDir2 = path.join(os.tmpdir(), `config-test-init-${Date.now()}`);

    const result = await orchestrator.invoke("config-init", {
      params: { workspaceRoot: tempDir2 },
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("polygluttonyRoot");
    expect(result.data).toHaveProperty("workspaceRoot");
    expect(result.data.workspaceRoot).toBe(tempDir2);

    // Verify .poly_gluttony directory was created
    const polygluttonyPath = path.join(tempDir2, ".poly_gluttony");
    expect(fs.existsSync(polygluttonyPath)).toBe(true);

    // Verify config.json was created
    const configPath = path.join(polygluttonyPath, "config.json");
    expect(fs.existsSync(configPath)).toBe(true);

    // Cleanup
    fs.rmSync(tempDir2, { recursive: true, force: true });
  });

  it("should get registered tools", () => {
    const tools = orchestrator.getRegisteredTools();

    expect(tools.length).toBeGreaterThan(0);

    // Check that config tools are registered
    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain("config-load");
    expect(toolNames).toContain("config-init");
    expect(toolNames).toContain("config-get");
  });

  it("should handle tool not found", async () => {
    const result = await orchestrator.invoke("nonexistent-tool");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("Tool not found");
  });
});
