# 🧪 TESTING PATTERNS EXTRACTED FROM GEMINI CLI

**Extraction Date**: 2025-01-15 (Autonomous Analysis - Task #5)
**Source**: Gemini CLI (TypeScript/Vitest monorepo)
**Purpose**: Port testing strategy to Claudine CLI (Bun/Vitest)

---

## 📊 TESTING ARCHITECTURE OVERVIEW

### Test Structure Hierarchy

```
gemini-cli/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   └── **/*.test.ts        # Unit tests (co-located)
│   │   ├── test-setup.ts           # Vitest setup file
│   │   └── vitest.config.ts        # Core package config
│   └── cli/
│       └── src/
│           └── **/*.test.ts        # CLI unit tests
│
└── integration-tests/              # E2E tests (separate)
    ├── **/*.test.ts                # Integration test files
    ├── test-helper.ts              # Test rig & helpers
    ├── globalSetup.ts              # Global test setup
    └── vitest.config.ts            # Integration config
```

**Key Pattern**: **Co-located unit tests + Separate integration tests**

---

## 🎯 UNIT TESTING PATTERNS

### Pattern 1: Vitest Configuration (Unit Tests)

**File**: `packages/core/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', 'junit'],      // Multiple reporters
    silent: true,                          // Suppress console output
    setupFiles: ['./test-setup.ts'],       // Global setup
    outputFile: {
      junit: 'junit.xml',                  // CI integration
    },
    coverage: {
      enabled: true,
      provider: 'v8',                      // V8 coverage provider
      reportsDirectory: './coverage',
      include: ['src/**/*'],
      reporter: [
        ['text', { file: 'full-text-summary.txt' }],
        'html',                            // Multiple formats
        'json',
        'lcov',
        'cobertura',
        ['json-summary', { outputFile: 'coverage-summary.json' }],
      ],
    },
    poolOptions: {
      threads: {
        minThreads: 8,
        maxThreads: 16,                    // Parallel execution
      },
    },
  },
});
```

**Key Features**:
- ✅ JUnit XML output for CI/CD
- ✅ V8 coverage provider (fast, accurate)
- ✅ Multiple coverage formats (HTML, LCOV, Cobertura)
- ✅ Parallel test execution (8-16 threads)
- ✅ Global setup file for mocks

---

### Pattern 2: Co-Located Unit Tests

**File**: `packages/core/src/utils/ignorePatterns.test.ts`

```typescript
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import {
  FileExclusions,
  BINARY_EXTENSIONS,
  extractExtensionsFromPatterns,
} from './ignorePatterns.js';
import type { Config } from '../config/config.js';

// Mock dependencies BEFORE using them
vi.mock('../tools/memoryTool.js', () => ({
  getCurrentGeminiMdFilename: vi.fn(() => 'GEMINI.md'),
}));

describe('FileExclusions', () => {
  describe('getCoreIgnorePatterns', () => {
    it('should return basic ignore patterns', () => {
      const excluder = new FileExclusions();
      const patterns = excluder.getCoreIgnorePatterns();

      expect(patterns).toContain('**/node_modules/**');
      expect(patterns).toContain('**/.git/**');
      expect(patterns).toHaveLength(5);
    });
  });

  describe('getDefaultExcludePatterns', () => {
    it('should return comprehensive patterns by default', () => {
      const excluder = new FileExclusions();
      const patterns = excluder.getDefaultExcludePatterns();

      // Multiple assertions per test
      expect(patterns).toContain('**/node_modules/**');
      expect(patterns).toContain('**/.git/**');
      expect(patterns).toContain('**/.vscode/**');
    });

    it('should respect includeDefaults option', () => {
      const excluder = new FileExclusions();
      const patterns = excluder.getDefaultExcludePatterns({
        includeDefaults: false,
        includeDynamicPatterns: false,
      });

      expect(patterns).not.toContain('**/node_modules/**');
      expect(patterns).toHaveLength(0);
    });
  });

  // Parameterized tests using it.each()
  describe('extractExtensionsFromPatterns', () => {
    it.each([
      [
        'simple extensions',
        ['**/*.exe', '**/*.jar', '**/*.zip'],
        ['.exe', '.jar', '.zip'],
      ],
      [
        'compound extensions',
        ['**/*.tar.gz', '**/*.min.js', '**/*.d.ts'],
        ['.gz', '.js', '.ts'],
      ],
    ])('should extract %s', (_, patterns, expected) => {
      const result = extractExtensionsFromPatterns(patterns);
      expect(result).toEqual(expected);
    });
  });
});
```

**Key Patterns**:
1. ✅ **Co-location**: Test file next to source file (`ignorePatterns.ts` → `ignorePatterns.test.ts`)
2. ✅ **Nested describes**: Group related tests hierarchically
3. ✅ **Parameterized tests**: Use `it.each()` for data-driven tests
4. ✅ **Mocking**: Use `vi.mock()` for dependencies
5. ✅ **Type imports**: Import types without mocking (`import type { Config }`)

---

## 🔥 INTEGRATION TESTING PATTERNS

### Pattern 3: Integration Test Configuration

**File**: `integration-tests/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 300000,              // 5 minutes (LLM calls)
    globalSetup: './globalSetup.ts',  // Global setup hook
    reporters: ['default'],
    include: ['**/*.test.ts'],
    retry: 2,                         // Retry flaky tests
    fileParallelism: true,            // Run test files in parallel
    poolOptions: {
      threads: {
        minThreads: 8,
        maxThreads: 16,
      },
    },
  },
});
```

**Key Features**:
- ✅ **Long timeout**: 5 minutes for E2E tests with LLM calls
- ✅ **Retries**: Auto-retry flaky tests (2 attempts)
- ✅ **Parallel file execution**: Fast test suite
- ✅ **Global setup**: Shared initialization

---

### Pattern 4: TestRig Class (Test Helper Pattern)

**File**: `integration-tests/test-helper.ts`

```typescript
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import * as pty from '@lydell/node-pty';
import stripAnsi from 'strip-ansi';

// Dynamic timeout based on environment
function getDefaultTimeout() {
  if (env['CI']) return 60000;          // 1 minute in CI
  if (env['GEMINI_SANDBOX']) return 30000; // 30s in containers
  return 15000;                          // 15s locally
}

// Polling utility for async operations
export async function poll(
  predicate: () => boolean,
  timeout: number,
  interval: number,
): Promise<boolean> {
  const startTime = Date.now();
  let attempts = 0;
  while (Date.now() - startTime < timeout) {
    attempts++;
    const result = predicate();
    if (env['VERBOSE'] === 'true' && attempts % 5 === 0) {
      console.log(`Poll attempt ${attempts}: ${result ? 'success' : 'waiting...'}`);
    }
    if (result) return true;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return false;
}

// Helper for detailed error messages
export function createToolCallErrorMessage(
  expectedTools: string | string[],
  foundTools: string[],
  result: string,
) {
  const expectedStr = Array.isArray(expectedTools)
    ? expectedTools.join(' or ')
    : expectedTools;
  return (
    `Expected to find ${expectedStr} tool call(s). ` +
    `Found: ${foundTools.length > 0 ? foundTools.join(', ') : 'none'}. ` +
    `Output preview: ${result ? result.substring(0, 200) + '...' : 'no output'}`
  );
}

// Debug helper for test failures
export function printDebugInfo(
  rig: TestRig,
  result: string,
  context: Record<string, unknown> = {},
) {
  console.error('Test failed - Debug info:');
  console.error('Result length:', result.length);
  console.error('Result (first 500 chars):', result.substring(0, 500));
  
  Object.entries(context).forEach(([key, value]) => {
    console.error(`${key}:`, value);
  });

  const allTools = rig.readToolLogs();
  console.error('All tool calls found:', allTools.map((t) => t.toolRequest.name));
  return allTools;
}

// Model output validation with warnings (not failures)
export function validateModelOutput(
  result: string,
  expectedContent: string | (string | RegExp)[] | null = null,
  testName = '',
) {
  if (!result || result.trim().length === 0) {
    throw new Error('Expected LLM to return some output');
  }

  if (expectedContent) {
    const contents = Array.isArray(expectedContent) ? expectedContent : [expectedContent];
    const missingContent = contents.filter((content) => {
      if (typeof content === 'string') {
        return !result.toLowerCase().includes(content.toLowerCase());
      } else if (content instanceof RegExp) {
        return !content.test(result);
      }
      return false;
    });

    if (missingContent.length > 0) {
      console.warn(
        `Warning: LLM did not include expected content: ${missingContent.join(', ')}`,
        'This is not ideal but not a test failure.',
      );
      return false;
    }
  }
  return true;
}

// Interactive PTY session wrapper
export class InteractiveRun {
  ptyProcess: pty.IPty;
  public output = '';

  constructor(ptyProcess: pty.IPty) {
    this.ptyProcess = ptyProcess;
    ptyProcess.onData((data) => {
      this.output += data;
      if (env['KEEP_OUTPUT'] === 'true' || env['VERBOSE'] === 'true') {
        process.stdout.write(data);
      }
    });
  }

  async expectText(text: string, timeout?: number) {
    if (!timeout) timeout = getDefaultTimeout();
    const found = await poll(
      () => stripAnsi(this.output).toLowerCase().includes(text.toLowerCase()),
      timeout,
      200,
    );
    expect(found, `Did not find expected text: "${text}"`).toBe(true);
  }

  async type(text: string) {
    // Type slowly to ensure correctness
    for (const char of text) {
      this.ptyProcess.write(char);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  async sendKeys(keys: string) {
    this.ptyProcess.write(keys);
  }
}

// Main test rig class
export class TestRig {
  testDir: string | null = null;
  ptyProcess: pty.IPty | null = null;
  output = '';

  async setup(testName: string) {
    const sanitized = sanitizeTestName(testName);
    this.testDir = mkdirSync(`/tmp/test-${sanitized}`, { recursive: true });
  }

  createFile(name: string, content: string) {
    writeFileSync(join(this.testDir!, name), content);
  }

  mkdir(name: string) {
    mkdirSync(join(this.testDir!, name), { recursive: true });
  }

  async run(prompt: string): Promise<string> {
    // Spawn CLI process
    const proc = spawn('gemini', [prompt], {
      cwd: this.testDir,
      env: process.env,
    });
    
    // Collect output
    let output = '';
    proc.stdout?.on('data', (data) => { output += data.toString(); });
    proc.stderr?.on('data', (data) => { output += data.toString(); });
    
    await new Promise((resolve) => proc.on('close', resolve));
    this.output = output;
    return output;
  }

  async waitForToolCall(toolName: string): Promise<boolean> {
    return await poll(
      () => this.readToolLogs().some(t => t.toolRequest.name === toolName),
      5000,
      100,
    );
  }

  readToolLogs(): Array<{ toolRequest: { name: string; args: any } }> {
    // Parse telemetry logs to find tool calls
    const logFile = join(this.testDir!, '.gemini', 'telemetry.jsonl');
    if (!existsSync(logFile)) return [];
    
    const logs = readFileSync(logFile, 'utf-8')
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
    
    return logs.filter(log => 
      log.attributes?.['event.name'] === 'tool_request'
    );
  }

  async cleanup() {
    // Cleanup test directory
    if (this.testDir) {
      rmSync(this.testDir, { recursive: true, force: true });
    }
  }
}
```

**Key Patterns**:
1. ✅ **TestRig class**: Encapsulates test setup/teardown
2. ✅ **PTY wrapper**: Interactive terminal testing
3. ✅ **Polling utilities**: Wait for async operations
4. ✅ **Environment-aware timeouts**: Different for CI, containers, local
5. ✅ **Debug helpers**: Rich failure messages
6. ✅ **Model validation**: Warn on missing content (don't fail tests)

---

### Pattern 5: Integration Test Structure

**File**: `integration-tests/list_directory.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  TestRig,
  poll,
  printDebugInfo,
  validateModelOutput,
} from './test-helper.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('list_directory', () => {
  it('should be able to list a directory', async () => {
    // 1. Setup test environment
    const rig = new TestRig();
    await rig.setup('should be able to list a directory');
    
    // 2. Create test fixtures
    rig.createFile('file1.txt', 'file 1 content');
    rig.mkdir('subdir');
    rig.sync();

    // 3. Wait for filesystem propagation (container support)
    await poll(
      () => {
        const file1Path = join(rig.testDir!, 'file1.txt');
        const subdirPath = join(rig.testDir!, 'subdir');
        return existsSync(file1Path) && existsSync(subdirPath);
      },
      1000,  // 1 second max
      50,    // check every 50ms
    );

    // 4. Execute CLI command
    const prompt = `Can you list the files in the current directory.`;
    const result = await rig.run(prompt);

    // 5. Wait for specific tool call
    const foundToolCall = await rig.waitForToolCall('list_directory');

    // 6. Debug on failure
    if (!foundToolCall || !result.includes('file1.txt')) {
      const allTools = printDebugInfo(rig, result, {
        'Found tool call': foundToolCall,
        'Contains file1.txt': result.includes('file1.txt'),
        'Contains subdir': result.includes('subdir'),
      });

      console.error(
        'List directory calls:',
        allTools
          .filter((t) => t.toolRequest.name === 'list_directory')
          .map((t) => t.toolRequest.args),
      );
    }

    // 7. Assert tool was called
    expect(
      foundToolCall,
      'Expected to find a list_directory tool call',
    ).toBeTruthy();

    // 8. Validate output (warns, doesn't fail)
    validateModelOutput(result, ['file1.txt', 'subdir'], 'List directory test');
  });
});
```

**Key Patterns**:
1. ✅ **8-step test structure**: Setup → Fixtures → Sync → Execute → Wait → Debug → Assert → Validate
2. ✅ **Filesystem polling**: Wait for container sync
3. ✅ **Tool call validation**: Check telemetry logs
4. ✅ **Rich debugging**: Automatic debug output on failure
5. ✅ **Soft validation**: Warn about missing content, don't fail

---

## 📦 NPM SCRIPTS PATTERN

**File**: `package.json`

```json
{
  "scripts": {
    // Building
    "build": "npm run build --workspaces",
    "bundle": "npm run generate && node esbuild.config.js && node scripts/copy_bundle_assets.js",
    
    // Unit Tests
    "test": "npm run test --workspaces --if-present",
    "test:ci": "npm run test:ci --workspaces --if-present && npm run test:scripts",
    
    // Integration Tests
    "test:e2e": "cross-env VERBOSE=true KEEP_OUTPUT=true npm run test:integration:sandbox:none",
    "test:integration:all": "npm run test:integration:sandbox:none && npm run test:integration:sandbox:docker && npm run test:integration:sandbox:podman",
    "test:integration:sandbox:none": "cross-env GEMINI_SANDBOX=false vitest run --root ./integration-tests",
    "test:integration:sandbox:docker": "cross-env GEMINI_SANDBOX=docker npm run build:sandbox && cross-env GEMINI_SANDBOX=docker vitest run --root ./integration-tests",
    
    // Linting
    "lint": "eslint . --ext .ts,.tsx && eslint integration-tests && eslint scripts",
    "lint:fix": "eslint . --fix --ext .ts,.tsx && npm run format",
    "format": "prettier --experimental-cli --write .",
    
    // Pre-commit
    "preflight": "npm run clean && npm ci && npm run format && npm run lint:ci && npm run build && npm run typecheck && npm run test:ci",
  }
}
```

**Key Patterns**:
- ✅ **Workspace support**: Run tests across monorepo
- ✅ **Environment variables**: Control test behavior (VERBOSE, KEEP_OUTPUT, GEMINI_SANDBOX)
- ✅ **Sandbox matrix**: Test in different environments (none, docker, podman)
- ✅ **Preflight script**: Full validation before commit

---

## 🎯 CLAUDINE CLI APPLICATION PLAN

### Bun-Native Testing Setup

```typescript
// claudine-cli/tests/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit tests
    reporters: ['default', 'junit'],
    outputFile: { junit: 'junit.xml' },
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*'],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
    },
    poolOptions: {
      threads: { minThreads: 4, maxThreads: 8 },
    },
  },
});

// claudine-cli/tests/integration/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 120000,  // 2 minutes (CLI operations)
    retry: 2,
    fileParallelism: true,
  },
});
```

### Test Structure for Claudine CLI

```
claudine-cli/
├── src/
│   ├── commands/
│   │   ├── project/
│   │   │   ├── new.ts
│   │   │   └── new.test.ts          # Co-located unit tests
│   │   └── env/
│   │       ├── health.ts
│   │       └── health.test.ts
│   ├── core/
│   │   ├── config/
│   │   │   ├── config.ts
│   │   │   └── config.test.ts
│   │   └── logger/
│   │       ├── logger.ts
│   │       └── logger.test.ts
│   └── utils/
│       ├── file-system.ts
│       └── file-system.test.ts
│
└── tests/
    ├── integration/
    │   ├── cli.test.ts               # CLI integration tests
    │   ├── project-new.test.ts       # Project creation E2E
    │   ├── env-health.test.ts        # Env health E2E
    │   ├── test-helper.ts            # TestRig class
    │   └── vitest.config.ts
    └── vitest.config.ts              # Unit test config
```

### TestRig for Claudine CLI

```typescript
// tests/integration/test-helper.ts
import { spawn } from 'bun';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class ClaudineTestRig {
  testDir: string | null = null;

  async setup(testName: string) {
    const sanitized = testName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    this.testDir = `/tmp/claudine-test-${sanitized}-${Date.now()}`;
    mkdirSync(this.testDir, { recursive: true });
  }

  createFile(name: string, content: string) {
    writeFileSync(join(this.testDir!, name), content);
  }

  async runCLI(...args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const proc = spawn(['claudine', ...args], {
      cwd: this.testDir,
      env: process.env,
    });

    const stdout = await proc.text();
    return {
      stdout,
      stderr: '',
      exitCode: proc.exitCode || 0,
    };
  }

  async cleanup() {
    if (this.testDir) {
      await Bun.file(this.testDir).remove({ recursive: true });
    }
  }
}
```

### Example Integration Test

```typescript
// tests/integration/project-new.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import { ClaudineTestRig } from './test-helper';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('claudine project new', () => {
  const rig = new ClaudineTestRig();

  afterEach(async () => {
    await rig.cleanup();
  });

  it('should create Python project', async () => {
    await rig.setup('should create Python project');

    const result = await rig.runCLI('project', 'new', 'python', 'my-project');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('✅ Python project created');

    // Verify files were created
    const projectPath = join(rig.testDir!, 'my-project');
    expect(existsSync(join(projectPath, 'pyproject.toml'))).toBe(true);
    expect(existsSync(join(projectPath, 'src'))).toBe(true);
  });

  it('should create TypeScript project', async () => {
    await rig.setup('should create TypeScript project');

    const result = await rig.runCLI('project', 'new', 'typescript', 'my-ts-project');

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(rig.testDir!, 'my-ts-project', 'package.json'))).toBe(true);
    expect(existsSync(join(rig.testDir!, 'my-ts-project', 'tsconfig.json'))).toBe(true);
  });
});
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Unit Testing Infrastructure ✅ (Complete)
- [x] Add Vitest to devDependencies
- [x] Create unit test config (`tests/vitest.config.ts`)
- [x] Create test-setup.ts for global mocks
- [x] Add test scripts to package.json

### Phase 2: First Unit Tests 🚧 (Next)
- [ ] Write tests for `src/commands/project/new.ts` (project creation)
- [ ] Write tests for `src/commands/env/health.ts` (health checks)
- [ ] Write tests for `src/core/config/config.ts` (configuration)
- [ ] Write tests for `src/utils/file-system.ts` (utilities)

### Phase 3: Integration Testing Infrastructure
- [ ] Create `tests/integration/` directory
- [ ] Create `ClaudineTestRig` class in `test-helper.ts`
- [ ] Create integration test config (`tests/integration/vitest.config.ts`)
- [ ] Add integration test scripts to package.json

### Phase 4: Integration Tests
- [ ] Write `cli.test.ts` (basic CLI smoke tests)
- [ ] Write `project-new.test.ts` (project creation E2E)
- [ ] Write `env-health.test.ts` (env health E2E)

### Phase 5: CI/CD Integration
- [ ] Add GitHub Actions workflow for tests
- [ ] Configure JUnit XML reporting
- [ ] Configure coverage reporting
- [ ] Add pre-commit hooks

---

## 📝 TESTING BEST PRACTICES EXTRACTED

### 1. Test Organization
- ✅ **Co-locate unit tests** with source files (`*.test.ts` next to `*.ts`)
- ✅ **Separate integration tests** in dedicated directory
- ✅ **Use nested describes** for hierarchical organization
- ✅ **Parameterized tests** with `it.each()` for data-driven testing

### 2. Test Helpers
- ✅ **TestRig pattern**: Encapsulate setup/teardown logic
- ✅ **Polling utilities**: Handle async operations gracefully
- ✅ **Debug helpers**: Rich failure messages with context
- ✅ **Environment-aware**: Different behavior for CI, containers, local

### 3. Mocking
- ✅ **Mock external dependencies** with `vi.mock()`
- ✅ **Type imports**: Use `import type` to avoid mocking types
- ✅ **Global setup**: Use `setupFiles` for shared mocks

### 4. Assertions
- ✅ **Multiple assertions** per test (but keep tests focused)
- ✅ **Soft validation**: Warn on missing content, don't fail unnecessarily
- ✅ **Rich error messages**: Include context in expect() messages

### 5. CI/CD
- ✅ **JUnit XML output**: Standard format for CI systems
- ✅ **Multiple coverage formats**: HTML (local), LCOV (CI), JSON (tooling)
- ✅ **Parallel execution**: Fast test suites
- ✅ **Retry flaky tests**: Auto-retry 2 times

### 6. Environment Variables
- ✅ `VERBOSE=true`: Enable debug output
- ✅ `KEEP_OUTPUT=true`: Preserve test artifacts
- ✅ `CI=true`: Detect CI environment
- ✅ `REGENERATE_MODEL_GOLDENS=true`: Update golden files

---

## 🎉 EXTRACTION COMPLETE

**Files Analyzed**:
- ✅ `integration-tests/vitest.config.ts`
- ✅ `packages/core/vitest.config.ts`
- ✅ `integration-tests/test-helper.ts` (1,023 lines)
- ✅ `integration-tests/list_directory.test.ts`
- ✅ `packages/core/src/utils/ignorePatterns.test.ts`
- ✅ `docs/integration-tests.md`
- ✅ `package.json` (test scripts)

**Key Insights**:
1. **Two-tier testing**: Co-located unit tests + separate integration tests
2. **TestRig pattern**: Encapsulates CLI testing complexity
3. **Polling pattern**: Essential for container/async testing
4. **Soft validation**: Warn on missing content instead of failing
5. **Environment awareness**: Different timeouts for CI, containers, local
6. **Rich debugging**: Automatic debug output on test failures

**Ready for Claudine CLI Implementation** ✅

---

*End of Testing Patterns Extraction*
