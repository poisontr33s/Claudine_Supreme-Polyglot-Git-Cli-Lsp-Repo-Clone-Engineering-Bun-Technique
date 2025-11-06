# Claudine CLI Tests

This directory contains the test suite for the Claudine CLI project.

## Structure

```
tests/
└── e2e/
    └── clit-workflow.test.ts    # End-to-end workflow tests
```

## Running Tests

### Run All Tests

```bash
bun test
```

### Run Specific Test File

```bash
bun test tests/e2e/clit-workflow.test.ts
```

### Watch Mode

```bash
bun test --watch
```

### With Coverage

```bash
bun test --coverage
```

## E2E Workflow Tests

The E2E tests in `e2e/clit-workflow.test.ts` validate complete user workflows:

### Test Scenarios

1. **Full CLIT Workflow** - Tests the complete workflow:
   - Detect languages in workspace
   - Initialize configuration
   - Create Python project
   - Activate environment via health check

2. **Multi-Language Projects** - Tests handling of multiple languages:
   - Create Python project
   - Create Rust project
   - Verify both are detected

3. **Health Check** - Validates environment health checking:
   - JSON output format
   - Tool installation status
   - Version information

4. **Health Check Verbose** - Tests detailed health information:
   - Path information for installed tools
   - Extended diagnostic output

5. **Project Creation** - Tests project scaffolding:
   - Python project creation
   - Template selection
   - Dependency management

6. **CLI Help** - Validates help text display

7. **CLI Version** - Validates version information display

### Test Features

- **Isolated Test Environment**: Uses `os.tmpdir()` for temporary directories
- **Automatic Cleanup**: Cleans up test directories after each run
- **Platform Agnostic**: Handles platform-specific behavior gracefully
- **Tool Detection**: Gracefully skips tests when tools are unavailable
- **Fast Execution**: All tests run in ~1.8 seconds

### Future Orchestrator Support

The test suite is designed to work with the current CLI structure while being ready for the future orchestrator pattern (Issue #3). When the orchestrator is implemented, tests can be updated to use:

```typescript
await orchestrator.invoke('detect-languages', { params: { projectPath } });
await orchestrator.invoke('config-init', { params: { workspaceRoot } });
await orchestrator.invoke('project-create-python', { params: { Name, Template, Path } });
```

## Test Requirements

- **Bun 1.3.1+**: Required for running tests
- **Node.js Built-ins**: Uses `node:fs`, `node:path`, `node:os` modules
- **External Tools** (optional): Python/uv, Rust/cargo for full project creation tests

## Writing Tests

When adding new tests:

1. Use Bun's test framework (`bun:test`)
2. Follow existing test patterns for consistency
3. Clean up any created resources in `afterAll`
4. Use descriptive test names
5. Add comments explaining complex workflows
6. Ensure tests run in <10 seconds total

## Test Metrics

- **Total Tests**: 7
- **Assertions**: 68
- **Execution Time**: ~1.8 seconds
- **Pass Rate**: 100%
