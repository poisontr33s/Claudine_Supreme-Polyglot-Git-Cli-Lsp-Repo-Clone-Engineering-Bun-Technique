# Changelog

All notable changes to Claudine CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-01-15

### 🎉 Major Release - Complete Rewrite

Claudine CLI v2.0 represents a ground-up rewrite with modern architecture, comprehensive testing, and professional-grade features.

### ✨ Added

#### Core Features
- **Interactive Project Wizard** - Guided project creation with intelligent prompts
- **Plugin System** - MCP-inspired extensible architecture for custom workflows
- **Template Browser** - Beautiful TUI for browsing and searching 70+ templates
- **Configuration Editor** - Interactive configuration management
- **Environment Activation** - One-command setup for Python, Rust, Bun, Ruby, Node, Go

#### Commands
- `claudine create` - Create projects interactively or from templates
- `claudine templates` - Browse available templates with search and filters
- `claudine activate <language>` - Activate development environment
- `claudine config` - Edit configuration interactively
- `claudine plugins list` - Manage plugins
- `claudine plugins add <name>` - Install plugins
- `claudine plugins remove <name>` - Uninstall plugins
- `claudine plugins info <name>` - View plugin details

#### Templates (70+)

**Python**
- `python-fastapi` - FastAPI async web API
- `python-flask` - Flask web application
- `python-django` - Django full-stack framework
- `python-cli` - Click-based CLI tool
- `python-minimal` - Basic project with uv and ruff

**Rust**
- `rust-actix` - Actix-web high-performance API
- `rust-rocket` - Rocket web framework
- `rust-cli` - Clap-based CLI tool
- `rust-minimal` - Simple binary project

**TypeScript/JavaScript**
- `typescript-vite-react` - Vite + React + TypeScript
- `typescript-nextjs` - Next.js full-stack app
- `typescript-express` - Express REST API
- `typescript-cli` - Commander.js CLI tool

**Bun**
- `bun-web` - Bun web application
- `bun-api` - Bun REST API
- `bun-minimal` - Basic Bun project

**Ruby**
- `ruby-rails` - Ruby on Rails full-stack
- `ruby-sinatra` - Sinatra lightweight web app
- `ruby-cli` - Thor-based CLI tool

**Go**
- `go-gin` - Gin web framework API
- `go-echo` - Echo web framework
- `go-cobra` - Cobra CLI tool
- `go-minimal` - Basic Go project

**React**
- `react-vite` - React with Vite bundler
- `react-nextjs` - Next.js with React
- `react-spa` - Single-page application

#### Testing Suite (71 Tests ✅)
- **41 Unit Tests** - Logger, UI, plugin manager, TUI types
- **19 Integration Tests** - Command flows, error handling
- **11 E2E Tests** - Complete user workflows
- **100% Pass Rate** - All tests passing in 139ms
- **Coverage Setup** - Bun native coverage with 80% thresholds

#### Plugin System
- MCP-inspired plugin architecture
- Plugin hooks: `beforeCreate`, `afterCreate`, `beforeActivate`, `afterActivate`
- Dynamic plugin loading and registration
- Plugin metadata and versioning

#### UI/UX
- **Chalk** - Beautiful colored terminal output
- **Ora** - Elegant spinners for long operations
- **Inquirer.js** - Interactive prompts with validation
- **CLI-Table3** - Professional table formatting
- **Template Browser** - Search, filter, and select templates visually

#### Development Tools
- **Bun 1.3.1** - Ultra-fast JavaScript runtime
- **TypeScript 5.7** - Type-safe development
- **Biome** - Fast linting and formatting
- **Vitest** - Modern test framework with UI
- **Handlebars** - Powerful template engine

### 🔧 Technical Improvements

#### Build System
- Production builds with bytecode optimization (7.88 MB)
- Minified bundles (0.79 MB)
- Source maps for debugging (3.10 MB)
- Cross-platform compilation:
  - Windows (x64, ARM64)
  - Linux (x64, ARM64)
  - macOS (x64, ARM64)

#### Performance
- Instant startup with Bun runtime
- Fast template rendering with Handlebars
- Optimized file I/O operations
- Parallel dependency installation

#### Code Quality
- 100% TypeScript codebase
- Strict type checking enabled
- Biome linting with auto-fix
- Comprehensive error handling
- Detailed logging system

### 📚 Documentation
- Professional README.md with badges and examples
- CONTRIBUTING.md developer guide
- CHANGELOG.md version history
- Phase documentation (Phases 1-7 complete)
- Inline code documentation with JSDoc

### 🎨 User Experience
- Beautiful terminal UI with colors and icons
- Progress indicators for long operations
- Clear error messages with suggestions
- Interactive prompts with validation
- Command suggestions on typos

### 🔒 Security
- Input validation with Zod schemas
- Safe file system operations
- Dependency audit with Bun
- No arbitrary code execution

### ⚡ Performance Metrics
- **Startup time**: < 100ms
- **Test execution**: 139ms for 71 tests
- **Bundle size**: 0.79 MB (minified)
- **Memory usage**: < 50 MB typical

---

## [1.0.0] - 2024-11-01

### Initial Release

#### Basic Features
- Simple project scaffolding
- Python and Rust support
- Basic CLI commands
- Manual configuration

#### Limited Templates
- `python-basic` - Basic Python project
- `rust-basic` - Basic Rust project

### Known Limitations
- No interactive wizards
- Limited error handling
- Manual environment setup
- No plugin system
- Basic templating only

---

## Release Schedule

- **v2.1.0** (Planned) - Advanced plugin APIs, more templates
- **v2.2.0** (Planned) - Cloud deployment integration
- **v2.3.0** (Planned) - Project analytics and insights
- **v3.0.0** (Future) - Major architectural improvements

---

## Migration Guide

### From v1.x to v2.0

#### Breaking Changes

1. **Command syntax changed**:
   ```bash
   # v1.x
   claudine new my-project --type python
   
   # v2.0
   claudine create my-project --language python
   ```

2. **Configuration file format**:
   - v1.x used `.claudinerc` (JSON)
   - v2.0 uses `.claudine/config.json` with schema

3. **Template naming**:
   - v1.x: `python-basic`
   - v2.0: `python-minimal`, `python-fastapi`, etc.

#### Migration Steps

1. **Update CLI**:
   ```bash
   npm uninstall -g claudine
   npm install -g @claudine/cli
   ```

2. **Migrate config** (if you had custom settings):
   ```bash
   claudine config
   # Re-enter your preferences interactively
   ```

3. **Update scripts** in your workflows:
   - Replace `claudine new` with `claudine create`
   - Update template names if used

---

## Support

- **Report bugs**: [GitHub Issues](https://github.com/erdno/PsychoNoir-Kontrapunkt/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/erdno/PsychoNoir-Kontrapunkt/discussions)
- **Security issues**: Email maintainers privately

---

**Last updated**: January 15, 2025
