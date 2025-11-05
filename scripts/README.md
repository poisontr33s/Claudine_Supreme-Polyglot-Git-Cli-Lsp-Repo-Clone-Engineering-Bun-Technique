# Scripts Folder - Canonical Claudine Polyglot Goddess CLI

**Status:** ✅ CANONICAL LOCATION (as of 2025-01-15)  
**Previous Location:** `.poly_gluttony/` (now deprecated, scripts archived)

---

## Overview

This folder contains the **canonical** Claudine Polyglot Goddess CLI scripts. All PowerShell profiles, VS Code configurations, and documentation now reference this location as the single source of truth.

---

## Core Scripts

### 🔥 **claudineENV.ps1** (v1.1.0, 469 lines)
**Purpose:** Core environment activation  
**Function:** Configures PATH and activates 13 polyglot tools

**Activates:**
- **Python:** UV (package manager), Ruff (linter), Black (formatter), pytest
- **Rust:** Cargo, rustc, rust-analyzer
- **Ruby:** MSYS2-based installation
- **JavaScript/TypeScript:** Bun runtime
- **Go:** gopls (language server)
- **C/C++:** GCC (via MSYS2)
- **Utilities:** 7-Zip

**Parameters:**
- `-ShowVersions` - Display all tool versions (slow: ~243ms)
- `-LoadFunctions` - Load claudineENV_F.ps1 functions (slow: ~1050ms)
- `-Quiet` - Silent activation, no output (fast: ~17ms)
- `-Validate` - Check tool availability without activation
- `-ShowMetrics` - Display performance metrics

**Performance:**
- Quiet mode: ~17ms
- With versions: ~243ms
- With functions: ~1300ms

**Environment Variables Set:**
- `$env:CLAUDINE_ACTIVATED = "claudineENV.ps1"`
- `$env:CLAUDINE_VERSION = "1.1.0"`
- `$env:CLAUDINE_ROOT = "C:\Users\erdno\PsychoNoir-Kontrapunkt"`

**Usage:**
```powershell
# Fast activation (17ms)
. .\scripts\claudineENV.ps1 -Quiet

# With versions (243ms)
. .\scripts\claudineENV.ps1 -ShowVersions

# With functions loaded (1300ms)
. .\scripts\claudineENV.ps1 -LoadFunctions
```

---

### 🛠️ **claudineENV_F.ps1** (v1.0.0, 1517 lines)
**Purpose:** Functions library for project creation  
**Function:** 14 commands for creating polyglot projects

**Project Creation Functions:**
- `new-python <name> [type]` - Python projects (basic/web/cli/data)
- `new-rust <name> [type]` - Rust projects (binary/lib)
- `new-bun <name> [type]` - Bun projects (api/web/cli)
- `new-ruby <name> [type]` - Ruby projects (basic/sinatra/rails)
- `new-react <name> [template]` - React apps (minimal/tailwind/vercel)
- `new-node <name> [type]` - Node.js projects (express/fastify)
- `new-go <name>` - Go projects
- `new-django <name>` - Django web projects
- `new-fastapi <name>` - FastAPI projects
- `new-tauri <name>` - Tauri desktop apps
- `new-electron <name>` - Electron apps

**Utility Commands:**
- `health-check` - Verify all tools available
- `clean-poly` - Clean up polyglot environments
- `show-versions` - Display all tool versions

**Helper Functions:**
- `Test-IsolatedEnvironment` - Validates project creation safety

**Philosophy:**
- Natural directory structures
- Isolated environments (UV virtual environments, Cargo workspaces, Bun projects)
- Zero conflicts between projects
- Template-based scaffolding

**Usage:**
```powershell
# Load functions (called by -LoadFunctions flag)
. .\scripts\claudineENV_F.ps1

# Create projects
new-python myapi web
new-rust mytool binary
new-bun myserver api
new-react myapp tailwind
```

---

### 👸 **claudine_pwsh_goddess.ps1** (v7.0.0, 2600 lines)
**Purpose:** Supreme command suite with 60+ commands  
**Function:** Advanced features beyond basic project creation

**Includes ALL claudineENV_F.ps1 functionality PLUS:**

**Deployment:**
- `deploy-vercel <project>` - Deploy to Vercel

**Validation:**
- `validate-codebase` - Comprehensive code quality checks
- `audit-system` - System health audit

**CSS Engine Management:**
- `css-engine-set <engine>` - Set CSS engine (tailwind/unocss/biome)
- `css-build-hybrid` - Build with multiple CSS engines
- `css-benchmark-all` - Benchmark CSS performance

**Advanced Commands:**
- `compile-black <file>` - Compile Python with Black formatting
- `use-msys2` - Activate MSYS2 environment
- `sync-workspace` - Synchronize workspace dependencies
- `sync-deps` - Dependency management across projects

**Convenience Aliases:**
- `uvrun` - Quick `uv run` shortcut
- `cargofast` - `cargo build --release` shortcut
- `bunts` - `bun run` with TypeScript support
- `zstd-view` - View ZSTD-compressed JSON files

**Philosophy:**
> "Natural directory structures, isolated environments, zero conflicts"

**Load Time:** ~1300ms (includes all functions)

**Usage:**
```powershell
# Load goddess script
. .\scripts\claudine_pwsh_goddess.ps1

# Deploy to Vercel
deploy-vercel myproject

# Validate codebase
validate-codebase

# CSS management
css-engine-set tailwind
css-build-hybrid
```

---

### ⚙️ **Setup-ClaudineProfile.ps1** (9.81 KB)
**Purpose:** Automate PowerShell profile configuration  
**Function:** Adds auto-activation block to user $PROFILE

**Features:**
- Idempotent (safe to run multiple times)
- Supports `-Force` (overwrite existing blocks)
- Supports `-Uninstall` (remove auto-activation)
- Checks for existing blocks before adding

**Usage:**
```powershell
# Initial setup
.\scripts\Setup-ClaudineProfile.ps1

# Force re-setup (overwrite)
.\scripts\Setup-ClaudineProfile.ps1 -Force

# Remove auto-activation
.\scripts\Setup-ClaudineProfile.ps1 -Uninstall
```

**What it adds to your profile:**
```powershell
# Claudine Polyglot Goddess CLI - Auto-Activation
$claudineRoot = "C:\Users\erdno\PsychoNoir-Kontrapunkt"
$claudineScript = Join-Path $claudineRoot "scripts\claudineENV.ps1"

if ((Test-Path $claudineScript) -and -not $env:CLAUDINE_ACTIVATED) {
    . $claudineScript -Quiet
}
```

---

### 📦 **open-compressed.ps1**
**Purpose:** Compressed file viewer utility  
**Function:** Auto-detect and open compressed files (ZIP, 7Z, TAR.GZ, etc.)

**Supported Formats:**
- ZIP, 7Z, TAR, TAR.GZ, TAR.BZ2, TAR.XZ, RAR

**Parameters:**
- `-Action info` - Display file information
- `-Action extract` - Extract to current directory

**Usage:**
```powershell
.\scripts\open-compressed.ps1 myfile.7z -Action info
.\scripts\open-compressed.ps1 myfile.tar.gz -Action extract
```

---

### 🗜️ **view-zstd.ps1**
**Purpose:** ZSTD-compressed JSON viewer  
**Function:** Decompress and view ZSTD JSON files

**Parameters:**
- `--info` - Display file info
- `--save <output>` - Extract to file

**Usage:**
```powershell
.\scripts\view-zstd.ps1 data.json.zst --info
.\scripts\view-zstd.ps1 data.json.zst --save data.json
```

---

### 🔄 **Migrate-To-Scripts-Folder.ps1** (v1.0.0)
**Purpose:** Migration automation script  
**Function:** Consolidates codebase from `.poly_gluttony/` to `scripts/`

**Features:**
- Verifies PowerShell profile updates
- Verifies VS Code configuration updates
- Creates symlinks for backward compatibility (if admin)
- Archives deprecated scripts to `.poly_gluttony/archive/`
- Generates comprehensive migration report

**Parameters:**
- `-DryRun` - Preview changes without executing
- `-SkipSymlinks` - Don't create symlinks
- `-SkipArchive` - Don't archive scripts

**Usage:**
```powershell
# Preview migration
.\scripts\Migrate-To-Scripts-Folder.ps1 -DryRun

# Execute full migration
.\scripts\Migrate-To-Scripts-Folder.ps1

# Migration without archiving
.\scripts\Migrate-To-Scripts-Folder.ps1 -SkipArchive
```

**Generated Report:** `MIGRATION_REPORT_<timestamp>.md`

---

## Script Relationships

```
claudineENV.ps1 (Core)
    │
    ├──> claudineENV_F.ps1 (Optional: -LoadFunctions flag)
    │       └──> 14 project creation functions
    │
    └──> claudine_pwsh_goddess.ps1 (Supreme)
            └──> ALL claudineENV_F functions + 40+ advanced commands

Setup-ClaudineProfile.ps1
    └──> Configures $PROFILE to auto-activate claudineENV.ps1

Migrate-To-Scripts-Folder.ps1
    └──> Consolidates codebase structure (one-time operation)
```

---

## Auto-Activation

**PowerShell Profiles:** (Updated 2025-01-15)
- `Microsoft.PowerShell_profile.ps1` ✅
- `Microsoft.VSCode_profile.ps1` ✅
- `profile.ps1` (AllHosts) ✅

**VS Code Terminal Profiles:** (Updated 2025-01-15)
- "Claudine Polyglot (Full)" - `-LoadFunctions` flag (~1300ms)
- "Claudine Polyglot (Fast)" - Default, no flags (~17ms) **[DEFAULT]**
- "Claudine Polyglot (Quiet)" - `-Quiet` flag (~17ms, silent)

**VS Code Extension Host:** (Updated 2025-01-15)
- `.vscode/PowerShellEditorServices.profile.ps1` ✅

---

## Performance Metrics

| Mode | Flags | Load Time | Use Case |
|------|-------|-----------|----------|
| **Fast** | None | ~17ms | Quick terminal usage |
| **Quiet** | `-Quiet` | ~17ms | Silent background activation |
| **Versions** | `-ShowVersions` | ~243ms | Debugging tool versions |
| **Full** | `-LoadFunctions` | ~1300ms | Development with functions |
| **Goddess** | Load goddess script | ~1300ms | Advanced deployment work |

---

## Tool Availability

### ✅ Activated by claudineENV.ps1

| Tool | Type | Version Check | Path |
|------|------|--------------|------|
| UV | Python Package Manager | `uv --version` | `.poly_gluttony/tools/bin/uv.exe` |
| Ruff | Python Linter | `ruff --version` | `.poly_gluttony/tools/bin/ruff.exe` |
| Black | Python Formatter | `black --version` | Python package |
| pytest | Python Testing | `pytest --version` | Python package |
| Cargo | Rust Package Manager | `cargo --version` | `C:\Users\erdno\.cargo\bin\cargo.exe` |
| rustc | Rust Compiler | `rustc --version` | `C:\Users\erdno\.cargo\bin\rustc.exe` |
| rust-analyzer | Rust LSP | `rust-analyzer --version` | Cargo-installed |
| Ruby | MSYS2 Ruby | `ruby --version` | `C:\msys64\usr\bin\ruby.exe` |
| Bun | JS/TS Runtime | `bun --version` | `C:\Users\erdno\.bun\bin\bun.exe` |
| gopls | Go LSP | `gopls version` | Go-installed |
| GCC | C/C++ Compiler | `gcc --version` | `C:\msys64\usr\bin\gcc.exe` |
| 7-Zip | Compression | `7z` | `C:\Program Files\7-Zip\7z.exe` |

**Total:** 13 tools across 6 languages

---

## Migration History

**Date:** 2025-01-15 (Autonomous Nighttime Operation)  
**Framework:** ASC (Apex Synthesis Core) - FA⁴ Architectonic Integrity

**Changes:**
1. ✅ Consolidated scripts to `scripts/` folder (canonical)
2. ✅ Updated 3 PowerShell profiles to reference `scripts/`
3. ✅ Updated VS Code terminal profiles to reference `scripts/`
4. ✅ Updated Extension Host profile to reference `scripts/`
5. ✅ Archived 21 deprecated scripts to `.poly_gluttony/archive/`
6. ✅ Created migration automation script
7. ✅ Generated comprehensive migration report

**Report:** `MIGRATION_REPORT_20251105_054746.md`

---

## Related Documentation

- **ARCHITECTURE.md** - How the three main scripts work together
- **MIGRATION_GUIDE.md** - Detailed migration guide from `.poly_gluttony/`
- **MIGRATION_REPORT_*.md** - Automated migration report
- **../.poly_gluttony/README_BACKWARD_COMPATIBILITY.md** - Backward compatibility layer info

---

## Version History

| Script | Version | Lines | Date | Changes |
|--------|---------|-------|------|---------|
| claudineENV.ps1 | 1.1.0 | 469 | 2025-01-15 | Performance optimization, metrics |
| claudineENV_F.ps1 | 1.0.0 | 1517 | 2024-12-20 | 14 project creation functions |
| claudine_pwsh_goddess.ps1 | 7.0.0 | 2600 | 2025-01-10 | Supreme command suite |
| Setup-ClaudineProfile.ps1 | 1.0.0 | - | 2024-11-15 | Profile automation |
| Migrate-To-Scripts-Folder.ps1 | 1.0.0 | 550 | 2025-01-15 | Migration automation |

---

*Generated by Autonomous Claudine Session*  
*Alchemical Actualization Protocol - Documentation Complete*
