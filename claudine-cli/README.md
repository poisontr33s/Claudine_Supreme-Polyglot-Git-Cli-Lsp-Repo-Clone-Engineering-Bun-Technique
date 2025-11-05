# 🔥💋 Claudine CLI v2.0# claudine-cli



**Professional polyglot project management CLI built with Bun 1.3.1**To install dependencies:



Inspired by the architecture of Gemini CLI, GitHub CLI, and Claude Code CLI.```bash

bun install

## 🎯 Features```



- **Multi-language support**: Python, Rust, Bun, Ruby, React, Node.js, GoTo run:

- **Project scaffolding**: Create new projects with templates

- **Modern tooling**: Uses uv for Python, Cargo for Rust, Bun for TypeScript/Node```bash

- **Beautiful CLI**: Colored output, spinners, tables, interactive promptsbun run index.ts

- **Fast execution**: Built with Bun 1.3.1 for native TypeScript speed```



## 📦 InstallationThis project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.


### From Source (Development)

```bash
# Clone the repository
git clone https://github.com/poisontr33s/claudine-cli.git
cd claudine-cli

# Install dependencies
bun install

# Run in development mode
bun run dev

# Build standalone executable
bun run compile:all
```

### Global Installation

```bash
# Link for global use
bun link

# Now use anywhere
claudine --help
```

## 🚀 Quick Start

### List Available Project Types

```bash
claudine project list
```

### Create a New Project

```bash
# Python project with uv
claudine project new python my-api --template web

# Rust binary project
claudine project new rust my-cli --template binary

# React app with Next.js
claudine project new react my-app --template nextjs

# Bun CLI tool
claudine project new bun my-tool --template cli
```

### Interactive Mode

```bash
# Omit name/template for interactive prompts
claudine project new python
```

## 📚 Commands

### Project Management

| Command | Description | Example |
|---------|-------------|---------|
| `project list` | List available project types | `claudine project list` |
| `project new <type> [name]` | Create new project | `claudine project new python my-app` |

### Environment Management (Coming Soon)

- `env activate` - Activate polyglot environment
- `env health` - Check environment health
- `env clean` - Clean environment

### Linting (Coming Soon)

- `lint quality` - Run quality checks
- `lint stress` - Run stress tests

### Utilities (Coming Soon)

- `utils versions` - Show installed tool versions
- `utils msys2` - Manage MSYS2 integration

## 🛠️ Technology Stack

### Core

- **Bun 1.3.1**: Runtime and bundler
- **TypeScript**: Type-safe development
- **Commander.js**: CLI framework

### UI/UX

- **chalk**: Terminal colors
- **ora**: Loading spinners
- **cli-table3**: Formatted tables
- **prompts**: Interactive input

### Utilities

- **execa**: Process execution
- **zod**: Runtime validation
- **fs-extra**: Enhanced file operations
- **fast-glob**: File pattern matching

### Development

- **Biome**: Linting and formatting
- **Bun Test**: Unit testing

## 🏗️ Architecture

Based on analysis of 4 official CLIs (see `../git_cloned_CLIs/CLI_ARCHITECTURE_ANALYSIS.md`):

```
claudine-cli/
├── src/
│   ├── commands/          # Command modules
│   │   ├── project/       # Project commands
│   │   ├── env/           # Environment commands
│   │   ├── lint/          # Linting commands
│   │   └── utils/         # Utility commands
│   ├── core/              # Core logic
│   ├── ui/                # UI components
│   ├── types/             # TypeScript types
│   └── cli.ts             # Main entry point
├── tests/                 # Unit and integration tests
├── scripts/               # Build scripts
└── docs/                  # Documentation
```

## 🔥 Building

### Development Build

```bash
bun run build
# Output: dist/claudine.js
```

### Standalone Executables

```bash
# All platforms
bun run compile:all

# Specific platform
bun run compile:windows   # → dist/claudine-windows-x64.exe
bun run compile:linux     # → dist/claudine-linux-x64
bun run compile:macos     # → dist/claudine-darwin-x64
```

## 🧪 Testing

```bash
# Run tests
bun test

# Watch mode
bun test:watch

# With coverage
bun test:coverage
```

## 🎨 Code Quality

```bash
# Lint
bun run lint

# Fix issues
bun run lint:fix

# Format
bun run format

# Type check
bun run typecheck

# Full preflight check
bun run preflight
```

## 📖 Development

### Adding a New Command

1. Create command file in `src/commands/<category>/<command>.ts`
2. Implement using Commander.js `Command` class
3. Export from `src/commands/<category>/index.ts`
4. Add to main CLI in `src/cli.ts`

Example:

```typescript
// src/commands/project/new.ts
import { Command } from 'commander';

export const newCommand = new Command('new')
  .description('Create a new project')
  .action(() => {
    // Implementation
  });
```

### Using the Research

This CLI was built by analyzing:

1. **Gemini CLI** - Node.js monorepo with Ink for TUI
2. **GitHub CLI** - Go binary with Cobra framework
3. **Claude Code CLI** - TypeScript plugin architecture
4. **GitHub Copilot CLI** - Go/TypeScript hybrid

See `../git_cloned_CLIs/CLI_ARCHITECTURE_ANALYSIS.md` for full analysis.

## 🎯 Roadmap

### Phase 1: Core Framework ✅
- [x] CLI entry point with Commander.js
- [x] Project creation command
- [x] Python/Rust/Bun/Ruby/React/Node/Go support
- [x] Template system
- [x] Beautiful terminal output

### Phase 2: Environment Management (Next)
- [ ] `env activate` - Polyglot environment activation
- [ ] `env health` - Health check for tools
- [ ] `env clean` - Environment cleanup

### Phase 3: Linting Integration
- [ ] `lint quality` - Run Test-ScriptQuality
- [ ] `lint stress` - Run stress tests
- [ ] Integration with existing scripts

### Phase 4: Advanced Features
- [ ] Configuration file support (`.claudinerc`)
- [ ] Plugin system
- [ ] Template marketplace
- [ ] Auto-update checks

### Phase 5: Distribution
- [ ] npm registry publication
- [ ] GitHub Releases with binaries
- [ ] Homebrew formula
- [ ] Chocolatey package (Windows)

## 🙏 Acknowledgments

Built using patterns from:

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Monorepo architecture
- [GitHub CLI](https://github.com/cli/cli) - Binary distribution model
- [Claude Code](https://github.com/anthropics/claude-code) - Plugin system
- [GitHub Copilot CLI](https://github.com/github/copilot-cli) - Hybrid approach

## 📄 License

MIT License

## 👩‍💻 Author

**Claudine Sin'Claire**  
🔗 [GitHub](https://github.com/poisontr33s)

---

**⚡ Built with Bun 1.3.1 • Inspired by Gemini CLI architecture**
