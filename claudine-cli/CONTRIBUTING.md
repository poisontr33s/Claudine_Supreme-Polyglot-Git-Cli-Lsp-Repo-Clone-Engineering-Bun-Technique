# Contributing to Claudine CLI

Thank you for your interest in contributing to Claudine CLI! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Adding New Features](#adding-new-features)

---

## 🤝 Code of Conduct

By participating in this project, you agree to:

- **Be respectful** and inclusive
- **Provide constructive feedback**
- **Focus on what is best** for the community
- **Show empathy** towards other community members

---

## 🚀 Getting Started

### Prerequisites

- **Bun** >= 1.3.1 ([Install Bun](https://bun.sh))
- **Git** for version control
- **A code editor** (VS Code recommended)

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/PsychoNoir-Kontrapunkt.git
   cd PsychoNoir-Kontrapunkt/claudine-cli
   ```

3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/erdno/PsychoNoir-Kontrapunkt.git
   ```

---

## 🛠️ Development Setup

### Install Dependencies

```bash
bun install
```

### Development Commands

```bash
# Run CLI in development mode
bun run dev

# Watch mode (auto-reload on changes)
bun run dev:watch

# Build for production
bun run build:prod

# Type checking
bun run typecheck

# Linting
bun run lint

# Auto-fix lint issues
bun run lint:fix

# Format code
bun run format
```

---

## 🧪 Testing

Claudine CLI has a comprehensive test suite with **71 tests** covering unit, integration, and E2E scenarios.

### Running Tests

```bash
# Run all tests
bun test

# Watch mode (re-run on changes)
bun test:watch

# Generate coverage report
bun test:coverage

# Interactive test UI
bun test:ui
```

### Test Structure

```
tests/
├── unit/               # Unit tests for individual functions
│   ├── logger.test.ts
│   ├── ui.test.ts
│   └── plugin-manager.test.ts
├── integration/        # Integration tests for workflows
│   ├── create-command.test.ts
│   └── activate-command.test.ts
└── e2e/                # End-to-end tests
    └── full-workflow.test.ts
```

### Writing Tests

- **Unit tests**: Test individual functions in isolation
- **Integration tests**: Test command flows and interactions
- **E2E tests**: Test complete user workflows

**Example:**

```typescript
import { describe, test, expect } from "bun:test";
import { myFunction } from "../src/utils/myFunction";

describe("myFunction", () => {
  test("should return expected value", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Test Requirements

- ✅ All tests must pass before submitting a PR
- ✅ New features must include tests
- ✅ Bug fixes should include regression tests
- ✅ Maintain or improve code coverage

---

## 📏 Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all new code
- **Define types** explicitly, avoid `any`
- **Use interfaces** for public APIs
- **Prefer async/await** over raw Promises

### Code Style

We use **Biome** for linting and formatting:

```bash
# Check code style
bun run lint

# Auto-fix issues
bun run lint:fix

# Format code
bun run format
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces/Types**: `PascalCase`

### Code Organization

```typescript
// 1. Imports
import { dependency } from "package";

// 2. Types/Interfaces
interface MyInterface {
  // ...
}

// 3. Constants
const MY_CONSTANT = "value";

// 4. Functions
function myFunction() {
  // ...
}

// 5. Exports
export { myFunction };
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes** with clear, atomic commits

3. **Run preflight checks**:
   ```bash
   bun run preflight
   ```
   This runs: typecheck → lint → test

4. **Update documentation** if needed

5. **Add/update tests** for your changes

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```
feat(templates): add Django template
fix(cli): resolve argument parsing issue
docs(readme): update installation instructions
test(create): add E2E test for project creation
```

### Submitting PR

1. **Push to your fork**:
   ```bash
   git push origin feature/my-feature
   ```

2. **Open a Pull Request** on GitHub

3. **Fill out the PR template** completely

4. **Request review** from maintainers

5. **Address feedback** promptly

### PR Checklist

- [ ] All tests pass (`bun test`)
- [ ] Code is linted (`bun run lint`)
- [ ] TypeScript compiles (`bun run typecheck`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up-to-date with `main`

---

## 📂 Project Structure

```
claudine-cli/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── commands/           # Command implementations
│   │   ├── create.ts
│   │   ├── activate.ts
│   │   ├── config.ts
│   │   ├── plugins.ts
│   │   └── templates.ts
│   ├── core/               # Core functionality
│   │   ├── config/         # Configuration management
│   │   ├── plugin/         # Plugin system
│   │   ├── template/       # Template engine
│   │   ├── tui/            # Terminal UI components
│   │   └── ui/             # UI utilities
│   └── utils/              # Utility functions
│       ├── env.ts
│       ├── fs.ts
│       └── logger.ts
├── templates/              # Project templates
│   ├── python/
│   ├── rust/
│   ├── typescript/
│   └── ...
├── tests/                  # Test suite
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── dist/                   # Build output
├── docs/                   # Documentation
└── package.json
```

---

## ✨ Adding New Features

### Adding a Template

1. Create template directory in `templates/<language>/<template-name>/`
2. Add template files with Handlebars syntax
3. Create `template.json` metadata
4. Register in `src/core/template/registry.ts`
5. Add tests in `tests/integration/templates.test.ts`

**Example `template.json`:**

```json
{
  "id": "python-fastapi",
  "name": "FastAPI Web Application",
  "description": "Modern async web API with FastAPI",
  "language": "python",
  "category": "web",
  "tags": ["web", "api", "async"],
  "variables": [
    {
      "name": "projectName",
      "type": "string",
      "message": "Project name:",
      "default": "my-api"
    }
  ]
}
```

### Adding a Command

1. Create command file in `src/commands/<command-name>.ts`
2. Implement command logic
3. Register in `src/cli.ts`
4. Add tests in `tests/integration/<command-name>.test.ts`
5. Update README.md documentation

**Example:**

```typescript
// src/commands/my-command.ts
import { Command } from "commander";

export function setupMyCommand(program: Command): void {
  program
    .command("my-command")
    .description("My custom command")
    .action(async () => {
      console.log("Executing my command");
    });
}
```

### Adding a Plugin

1. Define plugin interface in `src/core/plugin/types.ts`
2. Implement plugin in `src/core/plugin/<plugin-name>.ts`
3. Register hooks in plugin manager
4. Add tests
5. Document in plugin section

---

## 🐛 Reporting Bugs

### Before Reporting

1. **Check existing issues** to avoid duplicates
2. **Try the latest version** of Claudine CLI
3. **Collect information**:
   - Bun version (`bun --version`)
   - OS and version
   - Command executed
   - Full error message

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Run `claudine ...`
2. See error

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [e.g., Windows 11, macOS 14, Ubuntu 22.04]
- Bun version: [e.g., 1.3.1]
- Claudine CLI version: [e.g., 2.0.0]

**Additional context**
Any other relevant information.
```

---

## 💡 Feature Requests

We welcome feature requests! Please:

1. **Check existing requests** first
2. **Describe the problem** you're trying to solve
3. **Propose a solution** if you have one
4. **Consider implementation** complexity

---

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and discussions
- **Pull Requests**: For code contributions

---

## 🙏 Thank You

Your contributions make Claudine CLI better for everyone. We appreciate your time and effort!

---

**Happy coding! 🚀**
