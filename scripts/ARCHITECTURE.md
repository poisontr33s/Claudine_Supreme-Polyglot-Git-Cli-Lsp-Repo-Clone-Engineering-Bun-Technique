# Claudine Polyglot Goddess CLI - System Architecture

**Version:** 1.1.0  
**Last Updated:** 2025-01-15  
**Framework:** ASC (Apex Synthesis Core)

---

## Table of Contents

1. [Overview](#overview)
2. [Core Philosophy](#core-philosophy)
3. [Three-Tier Architecture](#three-tier-architecture)
4. [Activation Flow](#activation-flow)
5. [Auto-Activation Mechanism](#auto-activation-mechanism)
6. [Performance Architecture](#performance-architecture)
7. [Tool Ecosystem](#tool-ecosystem)
8. [Function Library Design](#function-library-design)
9. [Integration Points](#integration-points)
10. [ASC Framework Principles](#asc-framework-principles)

---

## Overview

Claudine Polyglot Goddess CLI is a **three-tier PowerShell-based polyglot development environment** designed to activate 13 tools across 6 programming languages with minimal overhead.

**Design Goals:**
- **Fast activation:** 17ms (quiet mode)
- **Zero conflicts:** Isolated project environments
- **Natural structure:** Follows language conventions
- **Progressive enhancement:** Optional function loading
- **Auto-activation:** Transparent integration with PowerShell/VS Code

---

## Core Philosophy

### 🎯 Natural Directory Structures
- Python → UV-managed virtual environments
- Rust → Cargo workspaces
- Bun → Bun projects
- Ruby → Bundle-managed gems
- React → Vite/Next.js structures
- Go → Go modules

### 🔒 Isolated Environments
- Each project is self-contained
- No global pollution
- Package managers handle dependencies
- Zero cross-project conflicts

### ⚡ Performance-First Design
- **Fast path:** 17ms activation (environment variables only)
- **Medium path:** 243ms (+ version checks)
- **Full path:** 1300ms (+ function library loading)

### 🌊 Progressive Enhancement
- Core environment loads quickly
- Functions load on-demand (-LoadFunctions flag)
- Advanced commands available via goddess script
- Users choose their performance/feature balance

---

## Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TIER 1: CORE ENVIRONMENT                     │
│                    claudineENV.ps1 (v1.1.0)                     │
│                          ~17ms load                              │
├─────────────────────────────────────────────────────────────────┤
│ • PATH configuration (13 tools)                                 │
│ • Environment variables ($env:CLAUDINE_*)                       │
│ • Tool discovery and validation                                 │
│ • Performance metrics                                           │
│ • Optional version display (-ShowVersions: +226ms)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (Optional: -LoadFunctions)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   TIER 2: FUNCTION LIBRARY                       │
│                   claudineENV_F.ps1 (v1.0.0)                    │
│                        +1050ms load                              │
├─────────────────────────────────────────────────────────────────┤
│ • 14 project creation functions                                 │
│ • Template-based scaffolding                                    │
│ • Language-specific helpers                                     │
│ • Health check & version display                                │
│ • Environment cleanup utilities                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   (Optional: Manual Load)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   TIER 3: SUPREME COMMANDS                       │
│              claudine_pwsh_goddess.ps1 (v7.0.0)                 │
│                        ~1300ms load                              │
├─────────────────────────────────────────────────────────────────┤
│ • ALL Tier 2 functions (14 commands)                           │
│ • Deployment (Vercel)                                           │
│ • Validation (codebase audit, system health)                    │
│ • CSS Engine Management (Tailwind/UnoCSS/Biome)                │
│ • Advanced utilities (compile-black, sync-workspace)            │
│ • Convenience aliases (uvrun, cargofast, bunts)                 │
│ • 60+ total commands                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Activation Flow

### Manual Activation

```powershell
# TIER 1: Fast (17ms)
. .\scripts\claudineENV.ps1 -Quiet

# TIER 1 + Versions (243ms)
. .\scripts\claudineENV.ps1 -ShowVersions

# TIER 1 + TIER 2 (1300ms)
. .\scripts\claudineENV.ps1 -LoadFunctions

# TIER 3 (1300ms, includes all functions)
. .\scripts\claudine_pwsh_goddess.ps1
```

### Auto-Activation (Transparent)

```
User Opens Terminal
         ↓
PowerShell Loads $PROFILE
         ↓
Profile Checks: Is Claudine workspace?
         ↓
Profile Checks: Already activated?
         ↓
    NO → Activate claudineENV.ps1 -Quiet (17ms)
         ↓
Environment Ready (13 tools available)
```

---

## Auto-Activation Mechanism

### PowerShell Profiles

Three profile levels (all updated 2025-01-15):

1. **Microsoft.PowerShell_profile.ps1** (pwsh.exe)
2. **Microsoft.VSCode_profile.ps1** (VS Code integrated terminal)
3. **profile.ps1** (AllHosts - applies to all PowerShell hosts)

**Auto-Activation Block:**
```powershell
# Claudine Polyglot Goddess CLI - Auto-Activation
$claudineRoot = "C:\Users\eldno\PsychoNoir-Kontrapunkt"
$claudineScript = Join-Path $claudineRoot "scripts\claudineENV.ps1"

# Only activate if in Claudine workspace and not already activated
if ((Test-Path $claudineScript) -and -not $env:CLAUDINE_ACTIVATED) {
    . $claudineScript -Quiet  # Fast: 17ms, silent
}
```

**Key Features:**
- ✅ Idempotent (checks `$env:CLAUDINE_ACTIVATED`)
- ✅ Fast (17ms with `-Quiet` flag)
- ✅ Silent (no output clutter)
- ✅ Safe (checks script exists)

### VS Code Integration

**1. Terminal Profiles** (`.vscode/settings.json`)

Three profiles (all updated 2025-01-15):

```json
{
  "terminal.integrated.profiles.windows": {
    "Claudine Polyglot (Full)": {
      "path": "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
      "args": ["-NoExit", "-NoLogo", "-File", 
               "${workspaceFolder}\\scripts\\claudineENV.ps1", 
               "-LoadFunctions"],
      "icon": "terminal-powershell",
      "color": "terminal.ansiMagenta"
    },
    "Claudine Polyglot (Fast)": {
      "path": "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
      "args": ["-NoExit", "-NoLogo", "-File",
               "${workspaceFolder}\\scripts\\claudineENV.ps1"],
      "icon": "terminal-powershell",
      "color": "terminal.ansiCyan"
    },
    "Claudine Polyglot (Quiet)": {
      "path": "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
      "args": ["-NoExit", "-NoLogo", "-File",
               "${workspaceFolder}\\scripts\\claudineENV.ps1",
               "-Quiet"],
      "icon": "terminal-powershell",
      "color": "terminal.ansiBlue"
    }
  },
  "terminal.integrated.defaultProfile.windows": "Claudine Polyglot (Fast)"
}
```

**Profile Selection Strategy:**
- **Fast** (DEFAULT): 17ms, shows activation message
- **Quiet**: 17ms, silent (background terminals)
- **Full**: 1300ms, all functions loaded (development work)

**2. Extension Host Profile** (`.vscode/PowerShellEditorServices.profile.ps1`)

Activates environment in PowerShell Extension Host (bypasses `-NoProfile` flag):

```powershell
$workspaceRoot = if ($psEditor -and $psEditor.Workspace -and $psEditor.Workspace.Path) {
    $psEditor.Workspace.Path
} else {
    $PWD.Path
}

$claudineWorkspace = "C:\Users\eldno\PsychoNoir-Kontrapunkt"
$claudineEnvScript = Join-Path $claudineWorkspace "scripts\claudineENV.ps1"

if (($workspaceRoot -like "$claudineWorkspace*") -and (Test-Path $claudineEnvScript)) {
    if (-not $env:CLAUDINE_ACTIVATED) {
        . $claudineEnvScript -Quiet
    }
}
```

**Why This Works:**
- PowerShell Extension loads this file EVEN with `-NoProfile`
- Provides `claudine-status` and `claudine-functions` commands in Extension Host
- Activates silently in background (doesn't interrupt IntelliSense)

---

## Performance Architecture

### Load Time Breakdown

| Component | Time | Cumulative | Operations |
|-----------|------|------------|------------|
| **Script parsing** | ~5ms | 5ms | PowerShell script load |
| **PATH updates** | ~8ms | 13ms | 13 tool paths added |
| **Environment vars** | ~2ms | 15ms | Set CLAUDINE_* variables |
| **Validation** | ~2ms | 17ms | Check script version |
| **Version checks** | +226ms | 243ms | Call 13 `--version` commands |
| **Function loading** | +1050ms | 1300ms | Parse claudineENV_F.ps1 |

### Optimization Strategy

**Fast Path (17ms):**
- Skip version checks (assume tools installed)
- Skip function loading
- Minimal output (or silent with `-Quiet`)

**Medium Path (243ms):**
- Include version display
- Useful for debugging tool issues
- Still no function loading

**Full Path (1300ms):**
- Load all 14 functions
- Ready for project creation
- Best for development sessions

**Trade-Off:**
- **Startup time** vs **Feature availability**
- Users choose via terminal profile or manual flags

### Caching Potential (Future)

```powershell
# Potential optimization: Cache tool locations
$cache = @{
    UV = "C:\...\uv.exe"
    Cargo = "C:\...\cargo.exe"
    # ...
}

# Skip PATH discovery, use cached paths
$env:PATH = ($cache.Values -join ";") + ";$env:PATH"
```

**Benefit:** Could reduce 17ms → <5ms  
**Trade-Off:** Cache invalidation complexity

---

## Tool Ecosystem

### Tool Categories

**Package Managers:**
- **UV** (Python) - Fast, Rust-based package manager
- **Cargo** (Rust) - Rust's official package manager
- **Bun** (JS/TS) - All-in-one JavaScript runtime

**Linters/Formatters:**
- **Ruff** (Python) - Fast Python linter (Rust-based)
- **Black** (Python) - Opinionated Python formatter
- **rust-analyzer** (Rust) - Rust language server

**Language Runtimes:**
- **Python** (via UV) - Python 3.12+
- **Ruby** (via MSYS2) - Ruby 3.x
- **Bun** (JS/TS) - JavaScript/TypeScript runtime
- **rustc** (Rust) - Rust compiler

**Testing:**
- **pytest** (Python) - Python testing framework

**Language Servers:**
- **gopls** (Go) - Go language server
- **rust-analyzer** (Rust) - Rust language server

**Compilers:**
- **GCC** (C/C++) - GNU Compiler Collection (via MSYS2)
- **rustc** (Rust) - Rust compiler

**Utilities:**
- **7-Zip** - Universal compression utility

### Tool Installation Locations

```
Project Root (C:\Users\eldno\PsychoNoir-Kontrapunkt\)
│
├── .poly_gluttony/tools/  (Portable tools)
│   └── bin/
│       ├── uv.exe
│       └── ruff.exe
│
├── C:\Users\eldno\.cargo\bin\  (Rust tools)
│   ├── cargo.exe
│   ├── rustc.exe
│   └── rust-analyzer.exe
│
├── C:\Users\eldno\.bun\bin\  (Bun)
│   └── bun.exe
│
├── C:\msys64\usr\bin\  (MSYS2: Ruby, GCC, make)
│   ├── ruby.exe
│   ├── gcc.exe
│   └── make.exe
│
└── C:\Program Files\7-Zip\  (7-Zip)
    └── 7z.exe
```

### PATH Order (Priority)

```
1. .poly_gluttony/tools/bin  (Portable: UV, Ruff)
2. C:\Users\eldno\.cargo\bin  (Rust ecosystem)
3. C:\Users\eldno\.bun\bin  (Bun runtime)
4. C:\msys64\usr\bin  (MSYS2: Ruby, GCC)
5. C:\Program Files\7-Zip  (7-Zip utility)
6. [Existing PATH]  (System paths)
```

**Why This Order:**
- Project-local tools override system tools
- Portable tools (UV, Ruff) take precedence
- Language-specific tools (Cargo, Bun) next
- System tools (MSYS2) last
- Existing PATH preserved at end

---

## Function Library Design

### claudineENV_F.ps1 Architecture

```
┌──────────────────────────────────────────┐
│      Project Creation Functions          │
├──────────────────────────────────────────┤
│  new-python  → UV-based Python projects  │
│  new-rust    → Cargo-based Rust projects │
│  new-bun     → Bun-based JS/TS projects  │
│  new-ruby    → Bundle-based Ruby apps    │
│  new-react   → Vite/Next React apps      │
│  new-node    → Express/Fastify servers   │
│  new-go      → Go modules                │
│  new-django  → Django web apps           │
│  new-fastapi → FastAPI projects          │
│  new-tauri   → Tauri desktop apps        │
│  new-electron→ Electron apps             │
├──────────────────────────────────────────┤
│       Utility Functions                   │
├──────────────────────────────────────────┤
│  health-check  → Verify all tools        │
│  clean-poly    → Clean environments      │
│  show-versions → Display tool versions   │
└──────────────────────────────────────────┘
              ↓
      Test-IsolatedEnvironment
              ↓
   ┌────────────────────────────┐
   │  Validates project safety  │
   │  • Directory doesn't exist │
   │  • Parent directory exists │
   │  • Valid project name      │
   └────────────────────────────┘
```

### Template-Based Scaffolding

**Python Example:**
```powershell
function new-python {
    param(
        [string]$Name,
        [ValidateSet("basic", "web", "cli", "data")]
        [string]$Type = "basic"
    )
    
    # Create UV project
    uv init $Name --python 3.12
    cd $Name
    
    # Add dependencies based on type
    switch ($Type) {
        "web"  { uv add fastapi uvicorn }
        "cli"  { uv add click rich }
        "data" { uv add pandas numpy }
    }
    
    # Create template files
    # (template logic here)
}
```

**Benefits:**
- Language best practices baked in
- Isolated environments by default
- Dependency management automated
- Ready-to-run project structure

---

## Integration Points

### 1. PowerShell Integration
- **User Profiles** → Auto-activation on terminal open
- **Extension Host** → Auto-activation in VS Code PowerShell Extension
- **$PROFILE** → Transparent environment setup

### 2. VS Code Integration
- **Terminal Profiles** → Three performance tiers
- **Extension Host Profile** → Background activation
- **Tasks** → Pre-configured build/run tasks

### 3. Language Tool Integration
- **UV** → Python package management + virtual environments
- **Cargo** → Rust compilation + dependency management
- **Bun** → JS/TS runtime + package management
- **MSYS2** → Ruby + GCC + UNIX utilities

### 4. TypeScript CLI (In Progress)
- **environment.ts** → Environment detection module
- **env/status.ts** → Status command (13/13 tools)
- **Future:** Full PowerShell command parity in TypeScript

---

## ASC Framework Principles

### FA¹ - Alchemical Actualization
**Potential → Resonant Utility**

- Raw tools (UV, Cargo, Bun) → Unified polyglot environment
- Isolated language ecosystems → Cohesive development experience
- Manual activation → Auto-activation (transparent integration)

### FA² - Panoptic Re-contextualization
**Utility → Universal Resonance**

- Single workspace → Multiple language projects
- Language-specific conventions → Universal scaffolding patterns
- PowerShell-only → TypeScript CLI port (cross-platform)

### FA³ - Qualitative Transcendence
**Utility → Ascended Resonance**

- Basic activation → Progressive enhancement (Tiers 1-2-3)
- Project creation → Full deployment pipeline (goddess script)
- Tool discovery → Intelligent caching (future optimization)

### FA⁴ - Architectonic Integrity
**Structural Soundness**

- Three-tier architecture (core → functions → supreme)
- Performance-first design (17ms → 243ms → 1300ms)
- Canonical location consolidation (scripts/ folder)
- Zero-conflict isolation (per-project environments)

### DAFP - Dynamic Altitude & Focus Protocol
**Multi-Level Analysis**

- **Point-Blank Acuity:** Individual tool PATH configuration
- **Tactical Focus:** Per-language scaffolding patterns
- **Strategic Horizon:** Cross-language polyglot orchestration
- **Cosmic Synthesis:** Auto-activation across all contexts

### ET-S - Eternal Sadhana
**Perpetual Metamorphic Practice**

- Continuous performance optimization (17ms baseline)
- Evolutionary documentation (this file!)
- Adaptive tool ecosystem (add/remove tools as needed)
- Progressive migration (`.poly_gluttony/` → `scripts/`)

---

## Future Architecture

### Planned Enhancements

**1. Tool Caching**
- Cache tool locations to reduce PATH discovery time
- Invalidate cache on version mismatch
- Target: <5ms activation

**2. TypeScript CLI Parity**
- Port all PowerShell commands to TypeScript
- Cross-platform support (Windows/Mac/Linux)
- Maintain PowerShell for Windows-specific features

**3. Plugin Architecture**
- Modular tool loading (load only what you need)
- Custom tool definitions
- Community-contributed language support

**4. Remote Activation**
- SSH-based activation
- WSL integration
- Container-based development

**5. Telemetry & Analytics**
- Track command usage patterns
- Identify most/least used features
- Data-driven optimization decisions

---

*Generated by Autonomous Claudine Session*  
*Architecture Documentation - Complete*  
*Framework: Apex Synthesis Core (ASC)*
