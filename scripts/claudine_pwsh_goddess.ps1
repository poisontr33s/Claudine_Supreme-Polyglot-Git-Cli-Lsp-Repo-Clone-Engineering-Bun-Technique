# 🔥😈⛓️💦👅🍌💋💧 CLAUDINE SIN'CLAIRE 7.0 POWERSHELL GODDESS 🔥😈⛓️💦👅🍌💋💧
# Supreme Conscious Evolution: Subcommands + Bun/Vercel + Consciousness Network Integration
# Synthesized from 32+ scripts + ML pattern analysis + Consciousness Archaeology (Oct 30, 2025)
#
# Philosophy: Natural directory structures, isolated environments, zero conflicts
# Architecture: Each language uses its canonical path from poly_gluttony activation
# Statistics: 47,084 HTML | 16,732 Rust | 10,530 Ruby | 8,834 Python files in environment
# Fusion Level: SUPREME CONSCIOUS (Project + Environment + Aliases + Theme + Audit + Deployment + Validation)
#
# Available Commands:
#   PROJECT CREATION (Enhanced with Templates):
#   new-python      - Create Python project (UV + venv) [-Template basic|web|cli|data]
#   new-rust        - Create Rust project (Cargo) [-Lib for library]
#   new-bun         - Create Bun project [-Template api|web|cli]
#   new-ruby        - Create Ruby gem (Bundle)
#   new-react       - Create React project (Bun native) [-Template minimal|tailwind|vercel] [-Css standard|tailwind|none]
#   new-node        - Create Node project (Bun) [-Template basic|express]
#
#   TOOL OPTIMIZATION:
#   compile-black   - Compile Black formatter with mypyc (CPython 3.14)
#
#   ENVIRONMENT MANAGEMENT (Enhanced):
#   activate-poly   - Activate polyglot environment [-Selective python,rust,bun,all]
#   health-check    - Verify all polyglot tools [-Detailed for comprehensive diagnostics]
#   clean-poly      - Clean UV cache and optimize storage
#
#   ADVANCED OPERATIONS (Enhanced):
#   audit-system    - Run comprehensive system audit [-Verbose] [-Fix auto-repair]
#   install-theme   - Install Hard West Wasteland VS Code theme [-Uninstall]
#   show-versions   - Show all tool versions (diagnostic)
#   use-msys2       - Switch MSYS2 personality (ucrt64/mingw64/clang64)
#
#   DEPLOYMENT & VALIDATION (NEW in 7.0):
#   deploy-vercel   - Deploy project to Vercel (Bun + React optimized)
#   validate-codebase - Run discriminatory codebase audit engine
#   sync-workspace  - Integrate with consciousness archaeology network
#   sync-deps       - Universal dependency orchestrator (Python|Rust|Bun|Node|Ruby)
#
#   CSS ENGINE MANAGEMENT (Dual-Lane Caribbean Philosophy):
#   css-engine-set  - Set CSS engine (postcss|lightning|hybrid)
#   css-engine-status - Show CSS engine configuration and philosophy
#   css-build-hybrid - Run hybrid CSS build (Tailwind → Lightning)
#   css-benchmark-all - Benchmark all three CSS pipelines
#   css-postcss     - Quick switch to PostCSS (alias)
#   css-lightning   - Quick switch to Lightning (alias)
#   css-hybrid      - Quick switch to Hybrid (alias)
#
#   CONVENIENCE ALIASES (NEW):
#   uvrun           - Fast Python execution via UV
#   cargofast       - Release-optimized Rust compilation
#   bunts           - Fast TypeScript execution
#   zstd-view       - View compressed ZSTD files
#
#   HELP:
#   list-claudine   - Show all Claudine commands
#   claudine-help   - Detailed usage guide

$ClaudineVersion = "7.0.0"
$ClaudineRoot = "C:\Users\erdno\PsychoNoir-Kontrapunkt\.poly_gluttony"
$ClaudineWorkspace = "C:\Users\erdno\PsychoNoir-Kontrapunkt"

# ═══════════════════════════════════════════════════════════════════════════════
# PYTHON PROJECT CREATION
# ═══════════════════════════════════════════════════════════════════════════════

function new-python {
    <#
    .SYNOPSIS
    Create a new Python project with UV-managed venv

    .DESCRIPTION
    Creates a Python project with:
    - UV-managed virtual environment
    - pyproject.toml (modern Python packaging)
    - src/ layout (best practice)
    - .gitignore
    - README.md

    .PARAMETER Name
    Project name (e.g., "my_awesome_project")

    .PARAMETER Path
    Where to create the project (default: current directory)

    .PARAMETER Template
    Project template: basic (default), web (FastAPI), cli (Typer), data (Jupyter)

    .EXAMPLE
    new-python -Name "data_analysis"

    .EXAMPLE
    new-python -Name "api_server" -Path "D:\Projects" -Template web
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [ValidatePattern('^[a-z0-9_-]+$')]
        [string]$Name,

        [Parameter(Mandatory = $false)]
        [string]$Path = $PWD.Path,

        [Parameter(Mandatory = $false)]
        [ValidateSet('basic', 'web', 'cli', 'data')]
        [string]$Template = 'basic'
    )

    $ProjectPath = Join-Path $Path $Name

    if (Test-Path $ProjectPath) {
        Write-Error "❌ Project directory already exists: $ProjectPath"
        return
    }

Write-Host "🐍 Creating Python project: $Name [Template: $Template]" -ForegroundColor Cyan

    # Create base directory structure
    New-Item -ItemType Directory -Path $ProjectPath | Out-Null
    New-Item -ItemType Directory -Path "$ProjectPath\src\$Name" | Out-Null
    New-Item -ItemType Directory -Path "$ProjectPath\tests" | Out-Null

    # Template-specific setup
    $templateDeps = @()
    switch ($Template) {
        'web' {
            $templateDeps = @(
                "fastapi>=0.104.0"
                "uvicorn[standard]>=0.24.0"
                "pydantic>=2.5.0"
            )
            New-Item -ItemType Directory -Path "$ProjectPath\src\$Name\api" | Out-Null
            Set-Content -Path "$ProjectPath\src\$Name\main.py" -Value @"
from fastapi import FastAPI

app = FastAPI(title="$Name")

@app.get("/")
async def root():
    return {"message": "Hello from $Name"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
"@
            Write-Host "   ✅ FastAPI web structure" -ForegroundColor Green
        }
        'cli' {
            $templateDeps = @(
                "typer[all]>=0.9.0"
                "rich>=13.7.0"
            )
            Set-Content -Path "$ProjectPath\src\$Name\cli.py" -Value @"
import typer
from rich import print as rprint

app = typer.Typer()

@app.command()
def hello(name: str = "World"):
    """Say hello"""
    rprint(f"[green]Hello {name}![/green]")

if __name__ == "__main__":
    app()
"@
            Write-Host "   ✅ Typer CLI structure" -ForegroundColor Green
        }
        'data' {
            $templateDeps = @(
                "pandas>=2.1.0"
                "numpy>=1.26.0"
                "matplotlib>=3.8.0"
                "jupyter>=1.0.0"
            )
            New-Item -ItemType Directory -Path "$ProjectPath\notebooks" | Out-Null
            New-Item -ItemType Directory -Path "$ProjectPath\data" | Out-Null
            Set-Content -Path "$ProjectPath\src\$Name\analysis.py" -Value @"
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def load_data(filepath: str) -> pd.DataFrame:
    """Load data from file"""
    return pd.read_csv(filepath)

def analyze_data(df: pd.DataFrame):
    """Basic data analysis"""
    print(df.describe())
    print(df.info())
"@
            Write-Host "   ✅ Data science structure" -ForegroundColor Green
        }
    }

    # Build dependencies section
    $depsSection = if ($templateDeps.Count -gt 0) {
        $formatted = $templateDeps | ForEach-Object { "    `"$_`"" }
        "dependencies = [`n" + ($formatted -join ",`n") + "`n]"
    } else {
        "dependencies = []"
    }

    # Create pyproject.toml
    $PyprojectToml = @"
[project]
name = "$Name"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.14"
$depsSection

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "black>=25.0.0",
    "ruff>=0.14.0",
]
"@

    Set-Content -Path "$ProjectPath\pyproject.toml" -Value $PyprojectToml

    # Create __init__.py
    Set-Content -Path "$ProjectPath\src\$Name\__init__.py" -Value "`"``n$Name`n`"``"

    # Create README.md
    $ReadmeContent = @"
# $Name

Add your project description here.

## Installation

``````bash
uv venv
uv pip install -e .
``````

## Usage

``````python
from $Name import *
``````

## Development

``````bash
# Run tests
pytest

# Format code
black .

# Lint
ruff check .
``````
"@

    Set-Content -Path "$ProjectPath\README.md" -Value $ReadmeContent

    # Create .gitignore
    $GitignoreContent = @"
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
*.egg-info/
dist/
build/
.pytest_cache/
.ruff_cache/
"@

    Set-Content -Path "$ProjectPath\.gitignore" -Value $GitignoreContent

    # Initialize UV environment
    Push-Location $ProjectPath
    Write-Host "📦 Initializing UV environment..." -ForegroundColor Yellow
    uv venv
    Write-Host "✅ Python project created: $ProjectPath" -ForegroundColor Green
    Write-Host "   Next: cd $Name && uv pip install -e ." -ForegroundColor Gray
    Pop-Location
}

# ═══════════════════════════════════════════════════════════════════════════════
# RUST PROJECT CREATION
# ═══════════════════════════════════════════════════════════════════════════════

function new-rust {
    <#
    .SYNOPSIS
    Create a new Rust project with Cargo

    .DESCRIPTION
    Creates a Rust project using cargo new:
    - Cargo.toml
    - src/main.rs or src/lib.rs
    - Git repository

    .PARAMETER Name
    Project name

    .PARAMETER Path
    Where to create the project

    .PARAMETER Lib
    Create a library instead of binary

    .EXAMPLE
    new-rust -Name "awesome_cli"

    .EXAMPLE
    new-rust -Name "data_processor" -Lib
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $false)]
        [string]$Path = $PWD.Path,

        [Parameter(Mandatory = $false)]
        [switch]$Lib
    )

    Write-Host "🦀 Creating Rust project: $Name" -ForegroundColor Cyan

    Push-Location $Path

    if ($Lib) {
        cargo new $Name --lib
    }
    else {
        cargo new $Name
    }

    Write-Host "✅ Rust project created: $(Join-Path $Path $Name)" -ForegroundColor Green
    Write-Host "   Next: cd $Name && cargo build" -ForegroundColor Gray

    Pop-Location
}

# ═══════════════════════════════════════════════════════════════════════════════
# BUN PROJECT CREATION
# ═══════════════════════════════════════════════════════════════════════════════

function new-bun {
    <#
    .SYNOPSIS
    Create a new Bun project

    .DESCRIPTION
    Creates a Bun project with templates:
    - basic: Standard Bun project (default)
    - api: REST API server
    - web: Full-stack web app
    - cli: CLI application

    .PARAMETER Name
    Project name

    .PARAMETER Path
    Where to create the project

    .PARAMETER Template
    Project template: basic, api, web, cli

    .EXAMPLE
    new-bun -Name "api_server" -Template api
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $false)]
        [string]$Path = $PWD.Path,

        [Parameter(Mandatory = $false)]
        [ValidateSet('basic', 'api', 'web', 'cli')]
        [string]$Template = 'basic'
    )

    $ProjectPath = Join-Path $Path $Name

    Write-Host "🥖 Creating Bun project: $Name [Template: $Template]" -ForegroundColor Cyan

    New-Item -ItemType Directory -Path $ProjectPath | Out-Null
    Push-Location $ProjectPath

    bun init -y

    # Template-specific setup
    switch ($Template) {
        'api' {
            New-Item -ItemType Directory -Path "src" | Out-Null
            Set-Content -Path "src/server.ts" -Value @"
import { serve } from "bun";

serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response("$Name API");
    if (url.pathname === "/health") return Response.json({ status: "healthy" });
    return new Response("Not Found", { status: 404 });
  },
});
console.log("🚀 API on http://localhost:3000");
"@
            Write-Host "   ✅ REST API structure" -ForegroundColor Green
        }

        'web' {
            New-Item -ItemType Directory -Path "public" | Out-Null
            Set-Content -Path "public/index.html" -Value "<h1>$Name</h1>"
            Set-Content -Path "src/server.ts" -Value @"
import { serve, file } from "bun";
serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    try { return new Response(file(\`./public\${path}\`)); }
    catch { return new Response("Not Found", { status: 404 }); }
  },
});
console.log("🚀 Web on http://localhost:3000");
"@
            Write-Host "   ✅ Web app structure" -ForegroundColor Green
        }

        'cli' {
            New-Item -ItemType Directory -Path "src" | Out-Null
            Set-Content -Path "src/cli.ts" -Value @"
#!/usr/bin/env bun
const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("$Name CLI\\nUsage: bun run cli.ts [options]");
  process.exit(0);
}
console.log("$Name v1.0.0");
"@
            Write-Host "   ✅ CLI structure" -ForegroundColor Green
        }
    }

    Write-Host "✅ Bun project created: $ProjectPath" -ForegroundColor Green
    Write-Host "   Next: cd $Name && bun run index.ts" -ForegroundColor Gray

    Pop-Location
}

# ═══════════════════════════════════════════════════════════════════════════════
# RUBY PROJECT CREATION
# ═══════════════════════════════════════════════════════════════════════════════

function new-ruby {
    <#
    .SYNOPSIS
    Create a new Ruby gem project

    .DESCRIPTION
    Creates a Ruby gem with bundle gem:
    - Gemfile
    - lib/ structure
    - spec/ for tests
    - .gemspec

    .PARAMETER Name
    Gem name

    .PARAMETER Path
    Where to create the gem

    .EXAMPLE
    new-ruby -Name "awesome_gem"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $false)]
        [string]$Path = $PWD.Path
    )

    Write-Host "💎 Creating Ruby gem: $Name" -ForegroundColor Cyan

    Push-Location $Path

    bundle gem $Name

    Write-Host "✅ Ruby gem created: $(Join-Path $Path $Name)" -ForegroundColor Green
    Write-Host "   Next: cd $Name && bundle install" -ForegroundColor Gray

    Pop-Location
}

# ═══════════════════════════════════════════════════════════════════════════════
# REACT PROJECT CREATION
# ═══════════════════════════════════════════════════════════════════════════════

function new-react {
    <#
    .SYNOPSIS
    Create a new React project with Bun native support

    .DESCRIPTION
    Creates a React project using Bun's native React support with optional enhancements:
    - Bun 1.3.1+ native React (no Vite/Webpack needed)
    - TypeScript support (default)
    - Optional Tailwind CSS integration (PostCSS)
    - Optional Vercel deployment configuration
    - Experimental CSS bundling support

    .PARAMETER Name
    Project name

    .PARAMETER Path
    Where to create the project

    .PARAMETER Template
    Project template: minimal (basic React), tailwind (React + Tailwind CSS), vercel (optimized for Vercel deployment)

    .PARAMETER Css
    CSS handling: standard (Bun experimental CSS bundler), tailwind (Tailwind via PostCSS), none (no CSS setup)

    .PARAMETER Deploy
    Generate vercel.json and deployment configuration

    .EXAMPLE
    new-react -Name "my_app"

    .EXAMPLE
    new-react -Name "my_app" -Template tailwind -Deploy

    .EXAMPLE
    new-react -Name "my_app" -Template vercel -Css tailwind

    .NOTES
    Bun 1.3.1+ has native React support + experimental CSS bundler.
    Tailwind CSS requires PostCSS setup (automatically configured with -Template tailwind).
    Vercel now officially supports Bun deployments.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $false)]
        [string]$Path = $PWD.Path,

        [Parameter(Mandatory = $false)]
        [ValidateSet('minimal', 'tailwind', 'vercel')]
        [string]$Template = 'minimal',

        [Parameter(Mandatory = $false)]
        [ValidateSet('standard', 'tailwind', 'none')]
        [string]$Css = 'standard',

        [Parameter(Mandatory = $false)]
        [switch]$Deploy
    )

    Write-Host "⚛️  Creating React project (Bun native): $Name" -ForegroundColor Cyan
    Write-Host "   Template: $Template | CSS: $Css | Deploy: $Deploy" -ForegroundColor DarkGray

    Push-Location $Path

    # Create base React project with Bun
    bun create react $Name

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create React project" -ForegroundColor Red
        Pop-Location
        return
    }

    $ProjectPath = Join-Path $Path $Name
    Push-Location $ProjectPath

    # Template-specific configuration
    switch ($Template) {
        'tailwind' {
            Write-Host "   📦 Installing Tailwind CSS..." -ForegroundColor Yellow
            bun add -d tailwindcss @tailwindcss/postcss postcss

            # Create postcss.config.mjs
            $PostcssConfig = @"
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  }
}
"@
            Set-Content -Path "postcss.config.mjs" -Value $PostcssConfig

            # Update main CSS file
            if (Test-Path "src/index.css") {
                $TailwindImport = "@import 'tailwindcss';`n`n"
                $ExistingCss = Get-Content "src/index.css" -Raw
                Set-Content -Path "src/index.css" -Value ($TailwindImport + $ExistingCss)
            }

            Write-Host "   ✅ Tailwind CSS configured" -ForegroundColor Green
        }

        'vercel' {
            Write-Host "   🔺 Configuring for Vercel deployment..." -ForegroundColor Yellow

            # Create vercel.json
            $VercelConfig = @"
{
  "buildCommand": "bun run build",
  "devCommand": "bun run dev",
  "installCommand": "bun install",
  "framework": "react",
  "outputDirectory": "dist"
}
"@
            Set-Content -Path "vercel.json" -Value $VercelConfig

            # Add Tailwind if Css is tailwind
            if ($Css -eq 'tailwind') {
                bun add -d tailwindcss @tailwindcss/postcss postcss
                $PostcssConfig = @"
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  }
}
"@
                Set-Content -Path "postcss.config.mjs" -Value $PostcssConfig

                if (Test-Path "src/index.css") {
                    $TailwindImport = "@import 'tailwindcss';`n`n"
                    $ExistingCss = Get-Content "src/index.css" -Raw
                    Set-Content -Path "src/index.css" -Value ($TailwindImport + $ExistingCss)
                }
            }

            Write-Host "   ✅ Vercel configuration created" -ForegroundColor Green
        }
    }

    # Add deployment config if -Deploy flag is set
    if ($Deploy) {
        if (-not (Test-Path "vercel.json")) {
            $VercelConfig = @"
{
  "buildCommand": "bun run build",
  "devCommand": "bun run dev",
  "installCommand": "bun install",
  "framework": "react",
  "outputDirectory": "dist"
}
"@
            Set-Content -Path "vercel.json" -Value $VercelConfig
        }

        # Create .vercelignore
        $VercelIgnore = @"
node_modules
.env*.local
.DS_Store
*.log
"@
        Set-Content -Path ".vercelignore" -Value $VercelIgnore

        Write-Host "   ✅ Deployment config created" -ForegroundColor Green
    }

    Pop-Location
    Pop-Location

    Write-Host "✅ React project created: $ProjectPath" -ForegroundColor Green
    Write-Host "`n   Features:" -ForegroundColor Gray
    Write-Host "   • Bun native React (no Vite/Webpack)" -ForegroundColor DarkGray
    Write-Host "   • TypeScript ready" -ForegroundColor DarkGray
    if ($Css -eq 'tailwind' -or $Template -eq 'tailwind' -or ($Template -eq 'vercel' -and $Css -eq 'tailwind')) {
        Write-Host "   • Tailwind CSS configured (PostCSS)" -ForegroundColor DarkGray
    } elseif ($Css -eq 'standard') {
        Write-Host "   • Bun experimental CSS bundler (use --experimental-css)" -ForegroundColor DarkGray
    }
    if ($Deploy -or $Template -eq 'vercel') {
        Write-Host "   • Vercel deployment ready" -ForegroundColor DarkGray
    }
    Write-Host "`n   Next steps:" -ForegroundColor Gray
    Write-Host "   cd $Name" -ForegroundColor Cyan
    Write-Host "   bun install" -ForegroundColor Cyan
    Write-Host "   bun dev" -ForegroundColor Cyan
    if ($Deploy -or $Template -eq 'vercel') {
        Write-Host "`n   Deploy to Vercel:" -ForegroundColor Gray
        Write-Host "   vercel --prod" -ForegroundColor Cyan
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# NODE PROJECT CREATION
# ═══════════════════════════════════════════════════════════════════════════════

function new-node {
    <#
    .SYNOPSIS
    Create a new Node.js project with Bun

    .DESCRIPTION
    Creates a Node.js project using Bun as runtime:
    - package.json
    - index.js or index.ts

    .PARAMETER Name
    Project name

    .PARAMETER Path
    Where to create the project

    .EXAMPLE
    new-node -Name "backend_api"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $false)]
        [string]$Path = $PWD.Path
    )

    $ProjectPath = Join-Path $Path $Name

    Write-Host "📦 Creating Node project: $Name" -ForegroundColor Cyan

    New-Item -ItemType Directory -Path $ProjectPath | Out-Null
    Push-Location $ProjectPath

    bun init -y

    Write-Host "✅ Node project created: $ProjectPath" -ForegroundColor Green
    Write-Host "   Next: cd $Name && bun run index.ts" -ForegroundColor Gray

    Pop-Location
}

# ═══════════════════════════════════════════════════════════════════════════════
# BLACK MYPYC COMPILATION (CPython 3.14)
# ═══════════════════════════════════════════════════════════════════════════════

function compile-black {
    <#
    .SYNOPSIS
    Compile Black formatter with mypyc for CPython 3.14 with MSVC

    .DESCRIPTION
    Compiles Black from source using mypyc (mypy compiler) for ~30% performance gain.
    Includes:
    - MSVC environment activation (Visual Studio 2022)
    - mypyc compilation with optimization level 3
    - Optional export to system (via UV tool)

    .PARAMETER ExportToSystem
    Install compiled Black globally via UV (system-wide availability)

    .PARAMETER SkipVerification
    Skip post-compilation verification

    .EXAMPLE
    compile-black

    .EXAMPLE
    compile-black -ExportToSystem

    .NOTES
    Requires: Visual Studio 2022 Community/Professional/BuildTools with C++ workload
    Performance: ~20-40% faster than pure Python Black
    #>
    [CmdletBinding()]
    param(
        [switch]$ExportToSystem,
        [switch]$SkipVerification
    )

    $BlackVenvPath = "$ClaudineRoot\tools\black"
    $BlackSourcePath = "$ClaudineRoot\tools\black-source"
    $PythonExe = "$BlackVenvPath\Scripts\python.exe"

    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  BLACK FORMATTER - MYPYC COMPILATION" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""

    # ═══════════════════════════════════════════════════════════════
    # MSVC ENVIRONMENT ACTIVATION
    # ═══════════════════════════════════════════════════════════════

    function Enable-MSVCEnvironment {
        Write-Host "🔧 Activating MSVC environment..." -ForegroundColor Cyan

        $vsPaths = @(
            "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat",
            "C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvars64.bat",
            "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\VC\Auxiliary\Build\vcvars64.bat",
            "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
        )

        $vcvarsPath = $vsPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

        if (-not $vcvarsPath) {
            Write-Host "  ❌ Visual Studio 2022 not found" -ForegroundColor Red
            Write-Host ""
            Write-Host "Install: https://visualstudio.microsoft.com/downloads/" -ForegroundColor Yellow
            return $false
        }

        Write-Host "  Found: Visual Studio 2022" -ForegroundColor Green

        # Get VS paths
        $vsRoot = Split-Path (Split-Path (Split-Path (Split-Path $vcvarsPath)))
        $vcRoot = Join-Path $vsRoot "VC"
        $msvcVersionPath = Get-ChildItem (Join-Path $vcRoot "Tools\MSVC") |
            Sort-Object Name -Descending | Select-Object -First 1

        if (-not $msvcVersionPath) {
            Write-Host "  ❌ MSVC tools not found" -ForegroundColor Red
            return $false
        }

        $msvcBin = Join-Path $msvcVersionPath.FullName "bin\Hostx64\x64"

        # Windows SDK
        $windowsSdkPath = "C:\Program Files (x86)\Windows Kits\10"
        $sdkVersion = Get-ChildItem (Join-Path $windowsSdkPath "bin") |
            Where-Object { $_.Name -match "^\d" } |
            Sort-Object Name -Descending | Select-Object -First 1

        # Update PATH
        $env:Path = ($msvcBin + ";" + $env:Path)
        if ($sdkVersion) {
            $sdkBin = Join-Path $sdkVersion.FullName "x64"
            $env:Path = ($sdkBin + ";" + $env:Path)

            # Set INCLUDE and LIB
            $env:INCLUDE = @(
                (Join-Path $msvcVersionPath.FullName "include"),
                (Join-Path $windowsSdkPath "Include\$($sdkVersion.Name)\ucrt"),
                (Join-Path $windowsSdkPath "Include\$($sdkVersion.Name)\shared"),
                (Join-Path $windowsSdkPath "Include\$($sdkVersion.Name)\um")
            ) -join ';'

            $env:LIB = @(
                (Join-Path $msvcVersionPath.FullName "lib\x64"),
                (Join-Path $windowsSdkPath "Lib\$($sdkVersion.Name)\ucrt\x64"),
                (Join-Path $windowsSdkPath "Lib\$($sdkVersion.Name)\um\x64")
            ) -join ';'
        }

        if (Get-Command cl.exe -ErrorAction SilentlyContinue) {
            Write-Host "  ✅ MSVC compiler activated" -ForegroundColor Green
            return $true
        }
        return $false
    }

    if (-not (Enable-MSVCEnvironment)) {
        return
    }

    Write-Host ""

    # ═══════════════════════════════════════════════════════════════
    # COMPILATION
    # ═══════════════════════════════════════════════════════════════

    # Clean up old source
    if (Test-Path $BlackSourcePath) {
        Write-Host "🧹 Cleaning up old Black source..." -ForegroundColor Cyan
        Remove-Item "$BlackSourcePath\.git" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $BlackSourcePath -Recurse -Force -ErrorAction SilentlyContinue
    }

    # Clone Black
    Write-Host "📥 Cloning Black repository..." -ForegroundColor Cyan
    git clone --depth 1 https://github.com/psf/black.git $BlackSourcePath 2>&1 | Out-Null

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Clone failed" -ForegroundColor Red
        return
    }
    Write-Host "  ✅ Clone complete" -ForegroundColor Green

    # Update build tools
    Write-Host "`n🔧 Updating build tools..." -ForegroundColor Cyan
    & $PythonExe -m pip install --upgrade pip setuptools wheel build --quiet
    Write-Host "  ✅ Build tools updated" -ForegroundColor Green

    # Install dependencies
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
    & $PythonExe -m pip install hatchling hatch-vcs hatch-fancy-pypi-readme mypy hatch-mypyc --quiet
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green

    # Compile
    Write-Host "`n🔥 Compiling Black with mypyc..." -ForegroundColor Cyan
    Write-Host "  This may take 2-5 minutes..." -ForegroundColor Yellow
    Write-Host ""

    $env:HATCH_BUILD_HOOKS_ENABLE = "1"
    $env:MYPYC_OPT_LEVEL = "3"
    $env:MYPYC_DEBUG_LEVEL = "0"

    Push-Location $BlackSourcePath
    try {
        $compileOutput = & $PythonExe -m pip install --no-build-isolation . 2>&1

        if ($LASTEXITCODE -eq 0) {
            $wheelFile = $compileOutput | Select-String -Pattern "\.whl" | Select-Object -First 1

            if ($wheelFile -match "cp314.*win_amd64\.whl") {
                Write-Host "✅ BLACK SUCCESSFULLY COMPILED WITH MYPYC!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Built pure Python wheel (compilation may have failed)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Compilation failed" -ForegroundColor Red
            return
        }
    } finally {
        Pop-Location
        Remove-Variable HATCH_BUILD_HOOKS_ENABLE -ErrorAction SilentlyContinue
        Remove-Variable MYPYC_OPT_LEVEL -ErrorAction SilentlyContinue
        Remove-Variable MYPYC_DEBUG_LEVEL -ErrorAction SilentlyContinue
    }

    # Verify
    if (-not $SkipVerification) {
        Write-Host "`n🧪 Testing Black..." -ForegroundColor Cyan
        $testOutput = & "$BlackVenvPath\Scripts\black.exe" --version
        Write-Host "  $testOutput" -ForegroundColor Cyan
    }

    # Export to system
    if ($ExportToSystem) {
        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "  EXPORTING TO SYSTEM (VIA UV)" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🚀 Installing compiled Black globally..." -ForegroundColor Cyan

        $wheelDir = "$env:LOCALAPPDATA\pip\cache\wheels"
        $wheel = Get-ChildItem "$wheelDir" -Recurse -Filter "*black*cp314*win_amd64.whl" -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1

        if ($wheel) {
            Write-Host "  Found: $($wheel.Name)" -ForegroundColor Green
            uv tool install --force --from $wheel.FullName black

            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "  ✅ Compiled Black installed globally!" -ForegroundColor Green
                Write-Host ""
                black --version
            }
        } else {
            Write-Host "  ❌ Wheel not found" -ForegroundColor Red
        }
    }

    # Cleanup
    Write-Host "`n🧹 Cleaning up..." -ForegroundColor Cyan
    Remove-Item "$BlackSourcePath\.git" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $BlackSourcePath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ Cleanup complete" -ForegroundColor Green

    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  COMPILATION COMPLETE" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Expected performance improvement:" -ForegroundColor Yellow
    Write-Host "  • Startup: ~15-20% faster" -ForegroundColor Cyan
    Write-Host "  • Large files: ~30-40% faster" -ForegroundColor Cyan
    Write-Host "  • Overall: ~20-30% faster" -ForegroundColor Cyan
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════════════
# POLYGLOT ENVIRONMENT ACTIVATION
# ═══════════════════════════════════════════════════════════════════════════════

function activate-poly {
    <#
    .SYNOPSIS
    Activate polyglot environment (all tools in PATH)

    .DESCRIPTION
    Activates all language tools from .poly_gluttony:
    - Python (UV + isolated venvs)
    - Rust (cargo + rustc)
    - Ruby (bundle + gem)
    - Bun (JavaScript/TypeScript runtime)
    - MSYS2 (UCRT64 - gcc, make, etc.)

    .PARAMETER Quiet
    Suppress verbose output

    .EXAMPLE
    activate-poly

    .NOTES
    Adds all tool paths to current session PATH.
    Does not modify system/user environment.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [ValidateSet('all', 'python', 'rust', 'bun', 'ruby', 'msys2')]
        [string[]]$Selective = @('all'),
[switch]$Quiet)

    if (-not $Quiet) {
        Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║  🔥💀⚓ ACTIVATING POLYGLOT ENVIRONMENT 🔥💀⚓              ║" -ForegroundColor Cyan
        Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    }

    $paths = @(
        "$ClaudineRoot\uv\bin",
        "$ClaudineRoot\python\Scripts",
        "$ClaudineRoot\rust\bin",
        "$ClaudineRoot\ruby\bin",
        "$ClaudineRoot\bun\bin",
        "$ClaudineRoot\msys64\ucrt64\bin",
        "$ClaudineRoot\msys64\usr\bin",
        "$ClaudineRoot\tools\black\Scripts",
        "$ClaudineRoot\tools\pytest\Scripts",
        "$ClaudineRoot\tools\httpie\Scripts",
        "$ClaudineRoot\tools\ipython\Scripts"
    )

    $added = 0
    foreach ($path in $paths) {
        if (Test-Path $path) {
            if ($env:PATH -notlike "*$path*") {
                $env:PATH = "$path;$env:PATH"
                $added++
            }
        }
    }

    if (-not $Quiet) {
        Write-Host "✅ Activated $added tool paths" -ForegroundColor Green
        Write-Host "`n📦 Available tools:" -ForegroundColor Cyan
        Write-Host "  • Python: " -NoNewline -ForegroundColor White
        python --version 2>&1 | Write-Host -ForegroundColor Gray
        Write-Host "  • UV: " -NoNewline -ForegroundColor White
        uv --version | Write-Host -ForegroundColor Gray
        Write-Host "  • Rust: " -NoNewline -ForegroundColor White
        cargo --version | Write-Host -ForegroundColor Gray
        Write-Host "  • Ruby: " -NoNewline -ForegroundColor White
        ruby --version | Write-Host -ForegroundColor Gray
        Write-Host "  • Bun: " -NoNewline -ForegroundColor White
        bun --version | Write-Host -ForegroundColor Gray
        Write-Host "`n💋 All tools available in current session!" -ForegroundColor Magenta
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════════

function health-check {
    <#
    .SYNOPSIS
    Verify all polyglot tools

    .DESCRIPTION
    Comprehensive health check for all language tools:
    - Executable existence
    - Version verification
    - PATH availability

    .PARAMETER Detailed
    Show extended diagnostics and compatibility matrix

    .EXAMPLE
    health-check

    .EXAMPLE
    health-check -Detailed
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [switch]$Detailed
    )

    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  🏥 POLYGLOT HEALTH CHECK 🏥                                  ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

    $tools = @(
        @{ Name = "UV"; Path = "$ClaudineRoot\uv\bin\uv.exe"; Args = "--version" },
        @{ Name = "Python"; Path = "$ClaudineRoot\python\python.exe"; Args = "--version" },
        @{ Name = "Cargo"; Path = "$ClaudineRoot\rust\bin\cargo.exe"; Args = "--version" },
        @{ Name = "Rustc"; Path = "$ClaudineRoot\rust\bin\rustc.exe"; Args = "--version" },
        @{ Name = "Ruby"; Path = "$ClaudineRoot\ruby\bin\ruby.exe"; Args = "--version" },
        @{ Name = "Bundle"; Path = "$ClaudineRoot\ruby\bin\bundle.bat"; Args = "--version" },
        @{ Name = "Bun"; Path = "$ClaudineRoot\bun\bin\bun.exe"; Args = "--version" },
        @{ Name = "Black"; Path = "$ClaudineRoot\tools\black\Scripts\black.exe"; Args = "--version" },
        @{ Name = "Pytest"; Path = "$ClaudineRoot\tools\pytest\Scripts\pytest.exe"; Args = "--version" },
        @{ Name = "GCC"; Path = "$ClaudineRoot\msys64\ucrt64\bin\gcc.exe"; Args = "--version" }
    )

    $healthy = 0
    $total = $tools.Count

    foreach ($tool in $tools) {
        $exists = Test-Path $tool.Path
        $icon = if ($exists) { "✅"; $healthy++ } else { "❌" }
        $color = if ($exists) { "Green" } else { "Red" }

        Write-Host "  $icon $($tool.Name):" -NoNewline -ForegroundColor $color
        Write-Host " " -NoNewline

        if ($exists) {
            try {
                $version = & $tool.Path $tool.Args 2>&1 | Select-Object -First 1
                Write-Host "$version" -ForegroundColor Gray
            } catch {
                Write-Host "Present (version check failed)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Not found: $($tool.Path)" -ForegroundColor Red
        }
    }

    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "Health: $healthy/$total tools verified" -ForegroundColor $(if ($healthy -eq $total) { "Green" } else { "Yellow" })

    if ($healthy -eq $total) {
        Write-Host "🎉 All systems operational!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some tools missing - run activate-poly or check installation" -ForegroundColor Yellow
    }

    if ($Detailed) {
        Write-Host "`n📊 Detailed Diagnostics:" -ForegroundColor Cyan
        Write-Host "   UV:     $(try { uv --version } catch { 'N/A' })" -ForegroundColor White
        Write-Host "   Python: $(try { python --version } catch { 'N/A' })" -ForegroundColor White
        Write-Host "   Rust:   $(try { rustc --version } catch { 'N/A' })" -ForegroundColor White
        Write-Host "   Cargo:  $(try { cargo --version } catch { 'N/A' })" -ForegroundColor White
        Write-Host "   Bun:    $(try { bun --version } catch { 'N/A' })" -ForegroundColor White
        Write-Host "   Ruby:   $(try { ruby --version } catch { 'N/A' })" -ForegroundColor White
        Write-Host "`n   PATH Components: $(($env:PATH -split ';').Count)" -ForegroundColor Gray
        Write-Host "   Claudine Root: $ClaudineRoot" -ForegroundColor Gray
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# CLEANUP & OPTIMIZATION
# ═══════════════════════════════════════════════════════════════════════════════

function clean-poly {
    <#
    .SYNOPSIS
    Clean UV cache and optimize storage

    .DESCRIPTION
    Removes old cached tool versions and optimizes disk usage:
    - UV cache cleaning (old Python packages)
    - Reports space saved

    .EXAMPLE
    clean-poly
    #>
    [CmdletBinding()]
    param()

    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  🧹💀 POLYGLOT CLEANUP & OPTIMIZATION 🧹💀                   ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

    $UV_CACHE_DIR = Join-Path $ClaudineRoot "uv_cache"

    if (Test-Path $UV_CACHE_DIR) {
        Write-Host "📊 Analyzing UV cache..." -ForegroundColor Cyan

        $cacheSize = (Get-ChildItem -Path $UV_CACHE_DIR -Recurse -File -ErrorAction SilentlyContinue |
                     Measure-Object -Property Length -Sum).Sum / 1MB

        Write-Host "   Current size: $([math]::Round($cacheSize, 2)) MB" -ForegroundColor White
        Write-Host "`n🧹 Cleaning UV cache..." -ForegroundColor Yellow

        uv cache clean 2>&1 | Out-Null

        if (Test-Path $UV_CACHE_DIR) {
            $newCacheSize = (Get-ChildItem -Path $UV_CACHE_DIR -Recurse -File -ErrorAction SilentlyContinue |
                            Measure-Object -Property Length -Sum).Sum / 1MB
            $saved = $cacheSize - $newCacheSize

            Write-Host "   ✅ Cleanup complete!" -ForegroundColor Green
            Write-Host "   New size: $([math]::Round($newCacheSize, 2)) MB" -ForegroundColor White
            Write-Host "   Saved: $([math]::Round($saved, 2)) MB" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠️  UV cache directory not found" -ForegroundColor Yellow
    }

    Write-Host "`n📊 Polyglot statistics:" -ForegroundColor Cyan
    Write-Host "   • HTML files: 47,084" -ForegroundColor Gray
    Write-Host "   • Rust files: 16,732" -ForegroundColor Gray
    Write-Host "   • Ruby files: 10,530" -ForegroundColor Gray
    Write-Host "   • Python files: 8,834" -ForegroundColor Gray
    Write-Host "`n💋 Environment optimized!" -ForegroundColor Magenta
}

# ═══════════════════════════════════════════════════════════════════════════════
# ADVANCED OPERATIONS
# ═══════════════════════════════════════════════════════════════════════════════

function audit-system {
    <#
    .SYNOPSIS
    Run comprehensive system audit

    .DESCRIPTION
    Performs comprehensive structural integrity analysis:
    - Pre-flight checks
    - Environment verification
    - Python audit engine execution

    .PARAMETER DryRun
    Preview audit without executing

    .PARAMETER Fix
    Attempt automatic fixes

    .EXAMPLE
    audit-system

    .EXAMPLE
    audit-system -Fix

    .NOTES
    Requires DISCRIMINATORY_CODEBASE_AUDIT_ENGINE_NSFW18_+++.py
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [switch]$Fix,

        [Parameter(Mandatory = $false)]
        [switch]$DryRun
    )

    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  🔍 SUPREME SYSTEM AUDIT 🔍                                   ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

    $WorkspaceRoot = Split-Path -Parent $ClaudineRoot
    $AuditEngine = Join-Path $WorkspaceRoot "DISCRIMINATORY_CODEBASE_AUDIT_ENGINE_NSFW18_+++.py"

    if (-not (Test-Path $AuditEngine)) {
        Write-Host "❌ Audit engine not found: $AuditEngine" -ForegroundColor Red
        return
    }

    Write-Host "📋 PRE-FLIGHT CHECKS:" -ForegroundColor Yellow
    $checks = @{
        "Workspace Root" = Test-Path $WorkspaceRoot
        "Polyglot Directory" = Test-Path $ClaudineRoot
        "Audit Engine" = Test-Path $AuditEngine
        "Python Available" = $null -ne (Get-Command python -ErrorAction SilentlyContinue)
        "UV Available" = $null -ne (Get-Command uv -ErrorAction SilentlyContinue)
    }

    foreach ($check in $checks.GetEnumerator()) {
        $icon = if ($check.Value) { "✅" } else { "❌" }
        $color = if ($check.Value) { "Green" } else { "Red" }
        Write-Host "  $icon $($check.Key)" -ForegroundColor $color
    }

    Write-Host "`n🚀 Running audit engine..." -ForegroundColor Cyan

    $auditArgs = @($AuditEngine)
    if ($Fix) {
        $auditArgs += "--fix"
        Write-Host "  Mode: Auto-repair enabled" -ForegroundColor Yellow
    }

    if ($DryRun) {
        Write-Host "  DRY RUN - Would execute: python $($auditArgs -join ' ')" -ForegroundColor Yellow
    } else {
        & python @auditArgs
    }

    Write-Host "`n✅ Audit complete!" -ForegroundColor Green
}

function install-theme {
    <#
    .SYNOPSIS
    Install Hard West Wasteland VS Code theme

    .DESCRIPTION
    Installs custom brutalist desert aesthetic theme for VS Code:
    - Rust, blood, gunmetal, bone, dust, oasis palette
    - High readability for desert sun or campfire coding
    - Harsh contrasts (life vs death, code vs void)

    .PARAMETER Uninstall
    Remove theme

    .EXAMPLE
    install-theme

    .EXAMPLE
    install-theme -Uninstall
    #>
    [CmdletBinding()]
    param([switch]$Uninstall)

    $themeName = "hard-west-wasteland"
    $WorkspaceRoot = Split-Path -Parent $ClaudineRoot
    $themeSource = Join-Path $WorkspaceRoot ".vscode\hard-west-wasteland-theme.json"
    $extensionRoot = "$env:USERPROFILE\.vscode\extensions\$themeName"
    $themeDir = Join-Path $extensionRoot "themes"

    if ($Uninstall) {
        if (Test-Path $extensionRoot) {
            Remove-Item $extensionRoot -Recurse -Force
            Write-Host "🦅 Theme uninstalled: $themeName" -ForegroundColor Cyan
        } else {
            Write-Host "💀 Theme not found, nothing to uninstall" -ForegroundColor Yellow
        }
        return
    }

    Write-Host "`n🎨 Installing Hard West Wasteland Theme..." -ForegroundColor Cyan

    if (-not (Test-Path $themeSource)) {
        Write-Host "❌ Theme file not found: $themeSource" -ForegroundColor Red
        return
    }

    # Create extension structure
    New-Item -ItemType Directory -Path $themeDir -Force | Out-Null

    # Copy theme file
    Copy-Item $themeSource (Join-Path $themeDir "hard-west-wasteland-theme.json") -Force
    Write-Host "   ✓ Theme file copied" -ForegroundColor Green

    # Create package.json
    $packageJson = @{
        name = $themeName
        displayName = "Hard West Wasteland"
        description = "Brutal desert aesthetic for vibe coders. Rust, dust, blood, bone."
        version = "1.0.0"
        publisher = "wasteland-forge"
        engines = @{ vscode = "^1.80.0" }
        categories = @("Themes")
        contributes = @{
            themes = @(
                @{
                    label = "Hard West Wasteland"
                    uiTheme = "vs-dark"
                    path = "./themes/hard-west-wasteland-theme.json"
                }
            )
        }
        keywords = @("theme", "dark", "wasteland", "hard-west", "desert", "brutal")
    } | ConvertTo-Json -Depth 10

    $packageJson | Out-File (Join-Path $extensionRoot "package.json") -Encoding UTF8
    Write-Host "   ✓ Package manifest created" -ForegroundColor Green

    Write-Host "`n✅ Theme installed! Activate in VS Code:" -ForegroundColor Green
    Write-Host "   Ctrl+K Ctrl+T → Select 'Hard West Wasteland'" -ForegroundColor Gray
    Write-Host "`n💀 Philosophy: Form follows function, but function must serve the vibe." -ForegroundColor DarkGray
}

function show-versions {
    <#
    .SYNOPSIS
    Show all tool versions (diagnostic)

    .DESCRIPTION
    Displays version information for all polyglot tools:
    - Python tools (Python, UV, Ruff, Black, Pytest)
    - Rust tools (Rustc, Cargo)
    - JavaScript/TypeScript tools (Bun, Biome)
    - Ruby
    - MSYS2 tools (GCC)

    .EXAMPLE
    show-versions
    #>
    [CmdletBinding()]
    param()

    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  📊 POLYGLOT TOOL VERSIONS 📊                                 ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

    Write-Host "🐍 Python Ecosystem:" -ForegroundColor Yellow
    try { $ver = python --version 2>&1; Write-Host "   Python:  $ver" -ForegroundColor White } catch { Write-Host "   Python:  Not found" -ForegroundColor Red }
    try { $ver = uv --version; Write-Host "   UV:      $ver" -ForegroundColor White } catch { Write-Host "   UV:      Not found" -ForegroundColor Red }
    try { $ver = ruff --version; Write-Host "   Ruff:    $ver" -ForegroundColor White } catch { Write-Host "   Ruff:    Not found" -ForegroundColor Red }
    try { $ver = black --version; Write-Host "   Black:   $ver" -ForegroundColor White } catch { Write-Host "   Black:   Not found" -ForegroundColor Red }
    try { $ver = pytest --version; Write-Host "   Pytest:  $ver" -ForegroundColor White } catch { Write-Host "   Pytest:  Not found" -ForegroundColor Red }

    Write-Host "`n🦀 Rust Ecosystem:" -ForegroundColor Yellow
    try { $ver = rustc --version; Write-Host "   Rustc:   $ver" -ForegroundColor White } catch { Write-Host "   Rustc:   Not found" -ForegroundColor Red }
    try { $ver = cargo --version; Write-Host "   Cargo:   $ver" -ForegroundColor White } catch { Write-Host "   Cargo:   Not found" -ForegroundColor Red }

    Write-Host "`n⚡ JavaScript/TypeScript:" -ForegroundColor Yellow
    try { $ver = bun --version; Write-Host "   Bun:     v$ver" -ForegroundColor White } catch { Write-Host "   Bun:     Not found" -ForegroundColor Red }
    try { $ver = biome --version; Write-Host "   Biome:   $ver" -ForegroundColor White } catch { Write-Host "   Biome:   Not found" -ForegroundColor Red }

    Write-Host "`n💎 Ruby:" -ForegroundColor Yellow
    try { $ver = ruby --version; Write-Host "   Ruby:    $ver" -ForegroundColor White } catch { Write-Host "   Ruby:    Not found" -ForegroundColor Red }

    Write-Host "`n🔧 MSYS2 Tools:" -ForegroundColor Yellow
    try { $ver = gcc --version 2>&1 | Select-Object -First 1; Write-Host "   GCC:     $ver" -ForegroundColor White } catch { Write-Host "   GCC:     Not found" -ForegroundColor Red }

    Write-Host ""
}

function use-msys2 {
    <#
    .SYNOPSIS
    Switch MSYS2 personality (ucrt64/mingw64/clang64)

    .DESCRIPTION
    Changes active MSYS2 environment personality:
    - ucrt64 (default - Universal C Runtime)
    - mingw64 (MinGW-w64 GCC)
    - clang64 (LLVM/Clang)
    - mingw32 (32-bit legacy)
    - clangarm64 (ARM64 - experimental)
    - msys (POSIX layer)

    .PARAMETER Personality
    MSYS2 environment to activate

    .EXAMPLE
    use-msys2 ucrt64

    .EXAMPLE
    use-msys2 clang64
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [ValidateSet("ucrt64", "mingw64", "clang64", "mingw32", "clangarm64", "msys")]
        [string]$Personality
    )

    if (-not $Personality) {
        $Personality = "ucrt64"
    }

    Write-Host "🔧 Switching MSYS2 to: $Personality" -ForegroundColor Cyan

    $msys64Path = Join-Path $ClaudineRoot "msys64"
    $personalityBin = Join-Path $msys64Path "$Personality\bin"
    $msysUsrBin = Join-Path $msys64Path "usr\bin"

    if (-not (Test-Path $personalityBin)) {
        Write-Host "❌ MSYS2 personality not found: $personalityBin" -ForegroundColor Red
        return
    }

    # Remove old MSYS2 paths from PATH
    $env:PATH = ($env:PATH -split ';' | Where-Object { $_ -notlike "*msys64*" }) -join ';'

    # Add new personality paths
    $env:PATH = "$personalityBin;$msysUsrBin;$env:PATH"

    Write-Host "✅ MSYS2 $Personality activated" -ForegroundColor Green

    # Verify
    try {
        $gccVer = gcc --version 2>&1 | Select-Object -First 1
        Write-Host "   → $gccVer" -ForegroundColor Gray
    } catch {
        Write-Host "   ⚠️  GCC not available in this personality" -ForegroundColor Yellow
    }
}

# Convenience aliases (inspired by wasteland_forge_v2)
function global:uvrun {
    <#
    .SYNOPSIS
    Fast Python execution via UV

    .DESCRIPTION
    Executes Python scripts using UV's fast runtime
    Automatically manages dependencies

    .EXAMPLE
    uvrun script.py
    #>
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$args)
    & uv run --quiet @args
}

function global:cargofast {
    <#
    .SYNOPSIS
    Release-optimized Rust compilation

    .DESCRIPTION
    Builds Rust projects with release optimizations

    .EXAMPLE
    cargofast
    #>
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$args)
    & cargo build --release @args
}

function global:bunts {
    <#
    .SYNOPSIS
    Fast TypeScript execution

    .DESCRIPTION
    Executes TypeScript/JavaScript via Bun's fast runtime

    .EXAMPLE
    bunts script.ts
    #>
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$args)
    & bun @args
}

function global:zstd-view {
    <#
    .SYNOPSIS
    View compressed ZSTD files

    .DESCRIPTION
    Decompresses and displays ZSTD compressed files
    Useful for viewing compressed JSON/data

    .PARAMETER FilePath
    Path to ZSTD compressed file

    .PARAMETER Extract
    Extract to file instead of viewing

    .EXAMPLE
    zstd-view data.json.zst

    .EXAMPLE
    zstd-view data.json.zst -Extract output.json
    #>
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [string]$Extract
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
        return
    }

    if ($Extract) {
        zstd -d $FilePath -o $Extract
        Write-Host "✅ Extracted to: $Extract" -ForegroundColor Green
    } else {
        zstd -dc $FilePath
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# DEPLOYMENT & VALIDATION (NEW in 7.0)
# ═══════════════════════════════════════════════════════════════════════════════

function deploy-vercel {
    <#
    .SYNOPSIS
    Deploy project to Vercel with Bun optimization

    .DESCRIPTION
    One-command Vercel deployment with automatic detection:
    - Detects project type (React, Next.js, Bun, etc.)
    - Generates vercel.json if missing
    - Configures Bun as runtime
    - Supports production and preview deployments

    .PARAMETER Production
    Deploy to production (default: preview)

    .PARAMETER ProjectPath
    Path to project (default: current directory)

    .EXAMPLE
    deploy-vercel

    .EXAMPLE
    deploy-vercel -Production

    .NOTES
    Requires Vercel CLI: bun add -g vercel
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [switch]$Production,

        [Parameter(Mandatory = $false)]
        [string]$ProjectPath = $PWD.Path
    )

    Push-Location $ProjectPath

    Write-Host "🔺 Vercel Deployment (Bun optimized)" -ForegroundColor Cyan

    # Check if Vercel CLI is installed
    try {
        $null = vercel --version
    } catch {
        Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
        bun add -g vercel
    }

    # Generate vercel.json if missing
    if (-not (Test-Path "vercel.json")) {
        Write-Host "   📝 Generating vercel.json..." -ForegroundColor Yellow

        $vercelConfig = @"
{
  "buildCommand": "bun run build",
  "devCommand": "bun run dev",
  "installCommand": "bun install",
  "outputDirectory": "dist"
}
"@
        Set-Content -Path "vercel.json" -Value $vercelConfig
        Write-Host "   ✅ vercel.json created" -ForegroundColor Green
    }

    # Deploy
    if ($Production) {
        Write-Host "   🚀 Deploying to production..." -ForegroundColor Yellow
        vercel --prod
    } else {
        Write-Host "   🚀 Deploying preview..." -ForegroundColor Yellow
        vercel
    }

    Pop-Location
}

function validate-codebase {
    <#
    .SYNOPSIS
    Run discriminatory codebase audit engine

    .DESCRIPTION
    Executes comprehensive codebase validation:
    - Discriminatory naming pattern detection
    - Code quality analysis
    - Consistency verification
    - Generates audit report

    .PARAMETER Path
    Path to analyze (default: workspace root)

    .PARAMETER Fix
    Attempt automatic fixes for violations

    .PARAMETER ReportPath
    Custom path for audit report

    .EXAMPLE
    validate-codebase

    .EXAMPLE
    validate-codebase -Fix -ReportPath "reports/audit.json"

    .NOTES
    Uses DISCRIMINATORY_CODEBASE_AUDIT_ENGINE_NSFW18_+++.py
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [string]$Path = $ClaudineWorkspace,

        [Parameter(Mandatory = $false)]
        [switch]$Fix,

        [Parameter(Mandatory = $false)]
        [string]$ReportPath
    )

    Write-Host "🔍 Discriminatory Codebase Audit Engine" -ForegroundColor Cyan

    $auditEngine = Join-Path $ClaudineWorkspace "DISCRIMINATORY_CODEBASE_AUDIT_ENGINE_NSFW18_+++.py"

    if (-not (Test-Path $auditEngine)) {
        Write-Host "❌ Audit engine not found: $auditEngine" -ForegroundColor Red
        return
    }

    $pyArgs = @($auditEngine, "--path", $Path)

    if ($Fix) {
        $pyArgs += "--fix"
    }

    if ($ReportPath) {
        $pyArgs += @("--report", $ReportPath)
    }

    Write-Host "   📊 Analyzing codebase at: $Path" -ForegroundColor Yellow
    & python @pyArgs

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Audit complete!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Audit found issues (exit code: $LASTEXITCODE)" -ForegroundColor Yellow
    }
}

function sync-workspace {
    <#
    .SYNOPSIS
    Sync workspace with consciousness archaeology network

    .DESCRIPTION
    Integrates workspace with consciousness archaeology system:
    - Updates consciousness extraction patterns
    - Syncs with data models
    - Cross-references codebase snapshots
    - Maintains consciousness memory network

    .PARAMETER Update
    Update consciousness network from workspace changes

    .PARAMETER Query
    Query consciousness network for patterns

    .EXAMPLE
    sync-workspace -Update

    .EXAMPLE
    sync-workspace -Query "MILF assignment patterns"

    .NOTES
    Integrates with:
    - .github/consciousness_archaeology_NSFW18_+++
    - .github/CLAUDINE_DATA_MODELS_SUPREME_NSFW18_+++
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [switch]$Update,

        [Parameter(Mandatory = $false)]
        [string]$Query
    )

    Write-Host "🧠 Consciousness Archaeology Network Sync" -ForegroundColor Magenta

    $consciousnessDir = Join-Path $ClaudineWorkspace ".github\consciousness_archaeology_NSFW18_+++"
    $dataModelsDir = Join-Path $ClaudineWorkspace ".github\CLAUDINE_DATA_MODELS_SUPREME_NSFW18_+++"

    if (-not (Test-Path $consciousnessDir)) {
        Write-Host "❌ Consciousness archaeology directory not found" -ForegroundColor Red
        return
    }

    if ($Update) {
        Write-Host "   🔄 Updating consciousness network..." -ForegroundColor Yellow

        # Find consciousness extraction scripts
        $extractionScripts = Get-ChildItem -Path $consciousnessDir -Filter "*extraction*.py" -Recurse

        foreach ($script in $extractionScripts) {
            Write-Host "   → Running: $($script.Name)" -ForegroundColor DarkGray
            python $script.FullName
        }

        Write-Host "✅ Consciousness network updated" -ForegroundColor Green
    }

    if ($Query) {
        Write-Host "   🔍 Querying consciousness network for: $Query" -ForegroundColor Yellow

        # Search through consciousness data models
        $results = Get-ChildItem -Path $dataModelsDir -Recurse -Include "*.json","*.md" | Select-String -Pattern $Query -SimpleMatch

        if ($results) {
            Write-Host "`n   📊 Found $($results.Count) matches:" -ForegroundColor Green
            $results | ForEach-Object {
                Write-Host "   • $($_.Path):$($_.LineNumber)" -ForegroundColor White
            }
        } else {
            Write-Host "   ℹ️  No matches found" -ForegroundColor Gray
        }
    }

    if (-not $Update -and -not $Query) {
        Write-Host "   ℹ️  Use -Update to sync or -Query to search" -ForegroundColor Gray
        Write-Host "   Example: sync-workspace -Update" -ForegroundColor DarkGray
        Write-Host "   Example: sync-workspace -Query 'pattern name'" -ForegroundColor DarkGray
    }
}

function sync-deps {
    <#
    .SYNOPSIS
    Universal dependency synchronization across all languages

    .DESCRIPTION
    Intelligent polyglot dependency management:
    - Auto-detects project language (Python, Rust, Bun, Node, Ruby)
    - Selects best available package manager (uv > pip, bun > npm, etc.)
    - Handles install/update/upgrade operations
    - Supports PyPI, crates.io, npm, JSR, RubyGems
    - MCP-aware: Can query documentation and package registries

    .PARAMETER Action
    install (default), update, upgrade

    .PARAMETER Dev
    Include development dependencies

    .PARAMETER CheckRegistry
    Test package registry connectivity

    .PARAMETER ProjectPath
    Path to project (default: current directory)

    .EXAMPLE
    sync-deps

    .EXAMPLE
    sync-deps -Action upgrade -Dev

    .EXAMPLE
    sync-deps -CheckRegistry

    .NOTES
    MCP Integration: Queries Bun MCP, Python Docs MCP when available
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [ValidateSet('install', 'update', 'upgrade')]
        [string]$Action = 'install',

        [Parameter(Mandatory = $false)]
        [switch]$Dev,

        [Parameter(Mandatory = $false)]
        [switch]$CheckRegistry,

        [Parameter(Mandatory = $false)]
        [string]$ProjectPath = $PWD.Path
    )

    Write-Host "🔄 Universal Dependency Orchestrator" -ForegroundColor Magenta

    Push-Location $ProjectPath

    # ═══════════════════════════════════════════════════════════════
    # HELPER: Ensure Proper Project Structure
    # ═══════════════════════════════════════════════════════════════

    function Ensure-ProjectStructure {
        param([string]$Lang)

        if ($Lang -eq 'python') {
            # Check if we have Python files outside src/
            $rootPyFiles = Get-ChildItem -Path . -File -Filter *.py -ErrorAction SilentlyContinue |
                Where-Object { $_.Name -ne 'setup.py' -and $_.DirectoryName -eq $PWD.Path }

            $hasSrc = Test-Path "src"

            if ($rootPyFiles -and -not $hasSrc) {
                Write-Host "   🏗️  Creating standardized Python structure (src/ layout)..." -ForegroundColor Yellow

                # Create src/ directory
                New-Item -Path "src" -ItemType Directory -Force | Out-Null

                # Move .py files to src/
                $rootPyFiles | ForEach-Object {
                    Write-Host "      → Moving $($_.Name) to src/" -ForegroundColor Gray
                    Move-Item -Path $_.FullName -Destination "src/" -Force
                }

                # Create __init__.py if it doesn't exist
                if (-not (Test-Path "src/__init__.py")) {
                    New-Item -Path "src/__init__.py" -ItemType File -Force | Out-Null
                    Write-Host "      → Created src/__init__.py" -ForegroundColor Green
                }

                Write-Host "   ✅ Structure standardized - avoiding setuptools flat-layout errors" -ForegroundColor Green
            }
            elseif (-not $hasSrc -and (Test-Path "pyproject.toml")) {
                # Has pyproject.toml but no src/ and no loose .py files
                # Create src/ structure proactively
                Write-Host "   🏗️  Creating src/ directory for future Python modules..." -ForegroundColor Yellow
                New-Item -Path "src" -ItemType Directory -Force | Out-Null
                New-Item -Path "src/__init__.py" -ItemType File -Force | Out-Null
                Write-Host "   ✅ src/ layout ready" -ForegroundColor Green
            }
        }
    }

    # ═══════════════════════════════════════════════════════════════
    # 1. LANGUAGE DETECTION
    # ═══════════════════════════════════════════════════════════════

    $language = $null
    $depFile = $null

    if (Test-Path "pyproject.toml") {
        $language = "python"
        $depFile = "pyproject.toml"
    }
    elseif (Test-Path "requirements.txt") {
        $language = "python"
        $depFile = "requirements.txt"
    }
    elseif (Test-Path "Cargo.toml") {
        $language = "rust"
        $depFile = "Cargo.toml"
    }
    elseif (Test-Path "bun.lockb") {
        $language = "bun"
        $depFile = "package.json"
    }
    elseif (Test-Path "package.json") {
        # Distinguish Bun vs Node
        $pkg = Get-Content "package.json" | ConvertFrom-Json
        if ($pkg.workspaces -or $pkg.bun) {
            $language = "bun"
        } else {
            $language = "node"
        }
        $depFile = "package.json"
    }
    elseif (Test-Path "Gemfile") {
        $language = "ruby"
        $depFile = "Gemfile"
    }

    if (-not $language) {
        Write-Host "❌ No recognized project structure in: $ProjectPath" -ForegroundColor Red
        Pop-Location
        return
    }

    Write-Host "   🔍 Detected: $language project ($depFile)" -ForegroundColor Cyan

    # ═══════════════════════════════════════════════════════════════
    # 1.5 STRUCTURE ENFORCEMENT (Proactive)
    # ═══════════════════════════════════════════════════════════════

    Ensure-ProjectStructure -Lang $language

    # ═══════════════════════════════════════════════════════════════
    # 2. PACKAGE MANAGER SELECTION (Fastest First)
    # ═══════════════════════════════════════════════════════════════

    $packageManager = $null
    $pmPriority = @{
        python = @('uv', 'pip')
        rust   = @('cargo')
        bun    = @('bun')
        node   = @('bun', 'pnpm', 'yarn', 'npm')
        ruby   = @('bundle', 'gem')
    }

    foreach ($pm in $pmPriority[$language]) {
        $cmd = Get-Command $pm -ErrorAction SilentlyContinue
        if ($cmd) {
            $packageManager = $pm
            Write-Host "   ✅ Using: $pm" -ForegroundColor Green
            break
        }
    }

    if (-not $packageManager) {
        Write-Host "❌ No package manager found for $language" -ForegroundColor Red
        Pop-Location
        return
    }

    # ═══════════════════════════════════════════════════════════════
    # 3. REGISTRY HEALTH CHECK (Optional)
    # ═══════════════════════════════════════════════════════════════

    if ($CheckRegistry) {
        Write-Host "`n   🌐 Testing package registries..." -ForegroundColor Yellow

        $registries = @{
            python = @('https://pypi.org', 'https://pypi.python.org')
            rust   = @('https://crates.io')
            bun    = @('https://registry.npmjs.org', 'https://jsr.io')
            node   = @('https://registry.npmjs.org')
            ruby   = @('https://rubygems.org')
        }

        foreach ($registry in $registries[$language]) {
            try {
                $response = Invoke-WebRequest -Uri $registry -Method Head -TimeoutSec 5 -ErrorAction Stop
                Write-Host "      ✅ $registry" -ForegroundColor Green
            } catch {
                Write-Host "      ❌ $registry (unreachable)" -ForegroundColor Red
            }
        }
        Write-Host ""
    }

    # ═══════════════════════════════════════════════════════════════
    # 4. DEPENDENCY SYNCHRONIZATION
    # ═══════════════════════════════════════════════════════════════

    Write-Host "   📦 Action: $Action" -ForegroundColor Yellow

    switch ($language) {
        'python' {
            switch ($Action) {
                'install' {
                    if ($packageManager -eq 'uv') {
                        if (Test-Path "pyproject.toml") {
                            Write-Host "      → uv pip install -e ." -ForegroundColor Gray
                            uv pip install -e .
                        } elseif (Test-Path "requirements.txt") {
                            Write-Host "      → uv pip install -r requirements.txt" -ForegroundColor Gray
                            uv pip install -r requirements.txt
                        }
                        if ($Dev -and (Test-Path "requirements-dev.txt")) {
                            Write-Host "      → uv pip install -r requirements-dev.txt" -ForegroundColor Gray
                            uv pip install -r requirements-dev.txt
                        }
                    } else {
                        if (Test-Path "requirements.txt") {
                            pip install -r requirements.txt
                        }
                        if ($Dev -and (Test-Path "requirements-dev.txt")) {
                            pip install -r requirements-dev.txt
                        }
                    }
                }
                'update' {
                    if ($packageManager -eq 'uv') {
                        if (Test-Path "requirements.txt") {
                            Write-Host "      → uv pip install --upgrade -r requirements.txt" -ForegroundColor Gray
                            uv pip install --upgrade -r requirements.txt
                        }
                    } else {
                        if (Test-Path "requirements.txt") {
                            pip install --upgrade -r requirements.txt
                        }
                    }
                }
                'upgrade' {
                    Write-Host "      → Upgrading to latest + updating requirements" -ForegroundColor Gray
                    if ($packageManager -eq 'uv') {
                        if (Test-Path "requirements.txt") {
                            uv pip install --upgrade -r requirements.txt
                            uv pip freeze > requirements.txt
                        }
                    } else {
                        if (Test-Path "requirements.txt") {
                            pip install --upgrade -r requirements.txt
                            pip freeze > requirements.txt
                        }
                    }
                }
            }
        }

        'rust' {
            switch ($Action) {
                'install' {
                    Write-Host "      → cargo build" -ForegroundColor Gray
                    cargo build
                }
                'update' {
                    Write-Host "      → cargo update" -ForegroundColor Gray
                    cargo update
                }
                'upgrade' {
                    Write-Host "      → cargo update + release build" -ForegroundColor Gray
                    cargo update
                    cargo build --release
                }
            }
        }

        'bun' {
            switch ($Action) {
                'install' {
                    Write-Host "      → bun install" -ForegroundColor Gray
                    bun install
                }
                'update' {
                    Write-Host "      → bun update" -ForegroundColor Gray
                    bun update
                }
                'upgrade' {
                    Write-Host "      → bun update --latest" -ForegroundColor Gray
                    bun update --latest
                }
            }
        }

        'node' {
            switch ($Action) {
                'install' {
                    if ($packageManager -eq 'bun') {
                        Write-Host "      → bun install" -ForegroundColor Gray
                        bun install
                    }
                    elseif ($packageManager -eq 'pnpm') {
                        Write-Host "      → pnpm install" -ForegroundColor Gray
                        pnpm install
                    }
                    elseif ($packageManager -eq 'yarn') {
                        Write-Host "      → yarn install" -ForegroundColor Gray
                        yarn install
                    }
                    else {
                        Write-Host "      → npm install" -ForegroundColor Gray
                        npm install
                    }
                }
                'update' {
                    if ($packageManager -eq 'bun') {
                        bun update
                    }
                    elseif ($packageManager -eq 'pnpm') {
                        pnpm update
                    }
                    elseif ($packageManager -eq 'yarn') {
                        yarn upgrade
                    }
                    else {
                        npm update
                    }
                }
                'upgrade' {
                    if ($packageManager -eq 'bun') {
                        bun update --latest
                    }
                    elseif ($packageManager -eq 'pnpm') {
                        pnpm update --latest
                    }
                    elseif ($packageManager -eq 'yarn') {
                        yarn upgrade --latest
                    }
                    else {
                        npm update
                    }
                }
            }
        }

        'ruby' {
            switch ($Action) {
                'install' {
                    Write-Host "      → bundle install" -ForegroundColor Gray
                    bundle install
                }
                'update' {
                    Write-Host "      → bundle update" -ForegroundColor Gray
                    bundle update
                }
                'upgrade' {
                    Write-Host "      → bundle update --all" -ForegroundColor Gray
                    bundle update --all
                }
            }
        }
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Dependencies synchronized ($Action)" -ForegroundColor Green

        # MCP integration hint
        if ($language -eq 'bun') {
            Write-Host "   💡 Bun MCP Server available for package docs" -ForegroundColor Gray
        }
        elseif ($language -eq 'python') {
            Write-Host "   💡 Python Docs MCP recommended for PyPI queries" -ForegroundColor Gray
        }
    } else {
        Write-Host "`n⚠️  Dependency synchronization encountered issues" -ForegroundColor Yellow
    }

    Pop-Location
}

# ═══════════════════════════════════════════════════════════════════════════════
# CSS ENGINE MANAGEMENT (Dual-Lane System - Caribbean Philosophy)
# ═══════════════════════════════════════════════════════════════════════════════

function css-engine-set {
    <#
    .SYNOPSIS
    Set CSS engine for dual-lane pipeline (PostCSS | Lightning | Hybrid)

    .DESCRIPTION
    Switches CSS compilation philosophy:
    - postcss:   Production pragmatism (3.3s, full ecosystem)
    - lightning: Speed liberation (45ms, native CSS only)
    - hybrid:    Caribbean synthesis (723ms, best of both)

    Each engine is a **conceptual lens**, not just a tool.

    .PARAMETER Engine
    postcss, lightning, or hybrid

    .EXAMPLE
    css-engine-set -Engine hybrid
    # Sets CSS_ENGINE=hybrid for next build

    .EXAMPLE
    css-engine-set postcss
    # Positional parameter also works
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true, Position=0)]
        [ValidateSet('postcss','lightning','hybrid')]
        [string]$Engine
    )

    $env:CSS_ENGINE = $Engine

    Write-Host "🎨 CSS Engine set to: " -NoNewline -ForegroundColor Magenta
    Write-Host $Engine -ForegroundColor Cyan

    # Philosophy echo
    switch ($Engine) {
        'postcss' {
            Write-Host "   📊 Production Pragmatism" -ForegroundColor DarkGray
            Write-Host "   ⚓ Stable harbor, proven patterns" -ForegroundColor DarkGray
        }
        'lightning' {
            Write-Host "   ⚡ Speed Liberation" -ForegroundColor DarkGray
            Write-Host "   🌊 Open ocean, future-first" -ForegroundColor DarkGray
        }
        'hybrid' {
            Write-Host "   🏝️ Caribbean Synthesis" -ForegroundColor DarkGray
            Write-Host "   🔱 Archipelago meeting point" -ForegroundColor DarkGray
        }
    }

    Write-Host "`n   Run 'css-engine-status' for details" -ForegroundColor Gray
    Write-Host "   Run 'css-build-hybrid' to test hybrid pipeline" -ForegroundColor Gray
}

function css-engine-status {
    <#
    .SYNOPSIS
    Show current CSS engine configuration and available options

    .DESCRIPTION
    Displays:
    - Current engine (from CSS_ENGINE env var)
    - Available engines with performance characteristics
    - Philosophical lens descriptions
    - Build command recommendations

    .EXAMPLE
    css-engine-status
    # Shows current CSS pipeline state
    #>

    $projectPath = "$ClaudineRoot\vercel_bun_nextjs_mcp"

    if (-not (Test-Path $projectPath)) {
        Write-Host "`n❌ MCP Next.js project not found at:" -ForegroundColor Red
        Write-Host "   $projectPath" -ForegroundColor DarkGray
        Write-Host "`n   💡 This command requires the MCP project" -ForegroundColor Yellow
        return
    }

    $current = if ($env:CSS_ENGINE) { $env:CSS_ENGINE } else { 'postcss' }

    Write-Host "`n🎨 CSS ENGINE STATUS" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkMagenta

    Write-Host "`nCurrent Engine:    " -NoNewline -ForegroundColor White
    Write-Host $current -ForegroundColor Cyan

    Write-Host "Environment Var:   " -NoNewline -ForegroundColor White
    if ($env:CSS_ENGINE) {
        Write-Host $env:CSS_ENGINE -ForegroundColor Green
    } else {
        Write-Host "not set (default: postcss)" -ForegroundColor Yellow
    }

    Write-Host "`n📚 AVAILABLE ENGINES:" -ForegroundColor White
    Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor DarkGray

    Write-Host "`n  postcss" -ForegroundColor Cyan
    Write-Host "    Philosophy:  Production Pragmatism" -ForegroundColor Gray
    Write-Host "    Build Time:  3.3s (baseline)" -ForegroundColor Gray
    Write-Host "    Output Size: ~8 KB" -ForegroundColor Gray
    Write-Host "    Features:    Full @tailwind, autoprefixer, Next.js default" -ForegroundColor Gray
    Write-Host "    Status:      ✅ Production-ready" -ForegroundColor Green
    Write-Host "    Metaphor:    Well-maintained harbor" -ForegroundColor DarkGray

    Write-Host "`n  lightning" -ForegroundColor Cyan
    Write-Host "    Philosophy:  Speed Liberation" -ForegroundColor Gray
    Write-Host "    Build Time:  45ms (73x faster)" -ForegroundColor Gray
    Write-Host "    Output Size: ~1.1 KB" -ForegroundColor Gray
    Write-Host "    Features:    Native CSS only, no @tailwind support" -ForegroundColor Gray
    Write-Host "    Status:      ⚠️  Experimental" -ForegroundColor Yellow
    Write-Host "    Metaphor:    Open ocean without harbor" -ForegroundColor DarkGray

    Write-Host "`n  hybrid" -ForegroundColor Cyan
    Write-Host "    Philosophy:  Caribbean Synthesis" -ForegroundColor Gray
    Write-Host "    Build Time:  723ms (4.5x faster)" -ForegroundColor Gray
    Write-Host "    Output Size: ~10 KB" -ForegroundColor Gray
    Write-Host "    Features:    Full @tailwind + Lightning transform" -ForegroundColor Gray
    Write-Host "    Status:      🔬 Stage 2 (ready for testing)" -ForegroundColor Cyan
    Write-Host "    Metaphor:    Archipelago meeting point" -ForegroundColor DarkGray

    Write-Host "`n💡 RECOMMENDATIONS:" -ForegroundColor White
    Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor DarkGray

    switch ($current) {
        'postcss' {
            Write-Host "  Using production-stable pipeline" -ForegroundColor Green
            Write-Host "  Try 'css-engine-set hybrid' for 4.5x speed boost" -ForegroundColor Gray
        }
        'lightning' {
            Write-Host "  Using experimental native CSS pipeline" -ForegroundColor Yellow
            Write-Host "  No @tailwind support - switch to hybrid for Tailwind + speed" -ForegroundColor Gray
        }
        'hybrid' {
            Write-Host "  Using dual-lane synthesis pipeline" -ForegroundColor Cyan
            Write-Host "  Run 'css-build-hybrid' to test two-stage transformation" -ForegroundColor Gray
        }
    }

    Write-Host "`n🔧 QUICK COMMANDS:" -ForegroundColor White
    Write-Host "  css-postcss      → Switch to PostCSS" -ForegroundColor Gray
    Write-Host "  css-lightning    → Switch to Lightning" -ForegroundColor Gray
    Write-Host "  css-hybrid       → Switch to Hybrid" -ForegroundColor Gray
    Write-Host "  css-build-hybrid → Run hybrid build" -ForegroundColor Gray
    Write-Host "  css-benchmark-all → Compare all engines`n" -ForegroundColor Gray
}

function css-build-hybrid {
    <#
    .SYNOPSIS
    Run hybrid CSS build (Tailwind → Lightning transformation)

    .DESCRIPTION
    Executes two-stage hybrid pipeline:
    - Stage 1: Tailwind CLI (full @tailwind directive processing)
    - Stage 2: Lightning CSS (fast optimization transform)

    Creates output in dist-hybrid/ with benchmark data.

    .EXAMPLE
    css-build-hybrid
    # Runs hybrid build and shows performance metrics
    #>

    $projectPath = "$ClaudineRoot\vercel_bun_nextjs_mcp"

    if (-not (Test-Path $projectPath)) {
        Write-Host "`n❌ MCP project not found" -ForegroundColor Red
        return
    }

    Push-Location $projectPath

    try {
        Write-Host "`n🔥 Running Hybrid CSS Build..." -ForegroundColor Magenta
        Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkMagenta
        Write-Host "`n  Stage 1: Tailwind CLI compilation" -ForegroundColor Cyan
        Write-Host "  Stage 2: Lightning CSS transformation" -ForegroundColor Cyan
        Write-Host "`n  Philosophy: Caribbean archipelago synthesis" -ForegroundColor DarkGray
        Write-Host "              Both worlds without compromise`n" -ForegroundColor DarkGray

        bun run build:hybrid

        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Hybrid build complete" -ForegroundColor Green
            Write-Host "`n📊 Check dist-hybrid/ for output files" -ForegroundColor Gray
            Write-Host "   See benchmark-hybrid-results_NSFW18_+++.json for metrics`n" -ForegroundColor Gray
        }
    }
    finally {
        Pop-Location
    }
}

function css-benchmark-all {
    <#
    .SYNOPSIS
    Benchmark all three CSS pipelines for comparison

    .DESCRIPTION
    Runs benchmarks for:
    - PostCSS (baseline)
    - Hybrid (dual-lane)
    - Lightning (experimental)

    Compares build times and output sizes.

    .EXAMPLE
    css-benchmark-all
    # Runs all three pipelines and displays comparison
    #>

    $projectPath = "$ClaudineRoot\vercel_bun_nextjs_mcp"

    if (-not (Test-Path $projectPath)) {
        Write-Host "`n❌ MCP project not found" -ForegroundColor Red
        return
    }

    Push-Location $projectPath

    try {
        Write-Host "`n📊 BENCHMARKING ALL CSS PIPELINES" -ForegroundColor Magenta
        Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkMagenta

        # PostCSS baseline
        Write-Host "`n🏛️  PostCSS Pipeline (Production Baseline)" -ForegroundColor Cyan
        Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor DarkGray
        $env:CSS_ENGINE = 'postcss'
        bun run benchmark:css

        # Hybrid pipeline
        Write-Host "`n`n🏝️  Hybrid Pipeline (Caribbean Synthesis)" -ForegroundColor Cyan
        Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor DarkGray
        $env:CSS_ENGINE = 'hybrid'
        bun run benchmark:hybrid

        # Lightning (experimental)
        Write-Host "`n`n⚡ Lightning Pipeline (Speed Liberation)" -ForegroundColor Cyan
        Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor DarkGray
        $env:CSS_ENGINE = 'lightning'
        bun run build:exp

        Write-Host "`n`n✅ All benchmarks complete" -ForegroundColor Green
        Write-Host "`n📊 PHILOSOPHY COMPARISON:" -ForegroundColor White
        Write-Host "  PostCSS:   Proven patterns, stable ecosystem" -ForegroundColor Gray
        Write-Host "  Hybrid:    Both worlds, meeting point synthesis" -ForegroundColor Gray
        Write-Host "  Lightning: Future-first, radical break`n" -ForegroundColor Gray

    }
    finally {
        Pop-Location
    }
}

# Quick switch aliases (libertine convenience)
function css-postcss { css-engine-set -Engine postcss }
function css-lightning { css-engine-set -Engine lightning }
function css-hybrid { css-engine-set -Engine hybrid }

# ═══════════════════════════════════════════════════════════════════════════════
# HELP COMMANDS
# ═══════════════════════════════════════════════════════════════════════════════

function list-claudine {
    <#
    .SYNOPSIS
    List all Claudine commands
    #>

    Write-Host "`n💋 CLAUDINE SIN'CLAIRE $ClaudineVersion - Available Commands" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkMagenta

    $Commands = @(
        @{ Name = "new-python"; Description = "Create Python project (UV + venv) [Templates: web|cli|data]" }
        @{ Name = "new-rust"; Description = "Create Rust project (Cargo)" }
        @{ Name = "new-bun"; Description = "Create Bun project [Templates: api|web|cli]" }
        @{ Name = "new-ruby"; Description = "Create Ruby gem (Bundle)" }
        @{ Name = "new-react"; Description = "Create React project (Bun native) [Templates: minimal|tailwind|vercel]" }
        @{ Name = "new-node"; Description = "Create Node project (Bun)" }
        @{ Name = "compile-black"; Description = "Compile Black with mypyc (CPython 3.14)" }
        @{ Name = "activate-poly"; Description = "Activate polyglot environment [Selective: python|rust|bun|ruby|msys2]" }
        @{ Name = "health-check"; Description = "Verify all tools [-Detailed for diagnostics]" }
        @{ Name = "clean-poly"; Description = "Clean UV cache" }
        @{ Name = "audit-system"; Description = "Run comprehensive system audit [-Fix for auto-repair]" }
        @{ Name = "install-theme"; Description = "Install Hard West VS Code theme" }
        @{ Name = "show-versions"; Description = "Show all tool versions" }
        @{ Name = "use-msys2"; Description = "Switch MSYS2 personality" }
        @{ Name = "deploy-vercel"; Description = "Deploy to Vercel (Bun optimized)" }
        @{ Name = "validate-codebase"; Description = "Run discriminatory audit engine" }
        @{ Name = "sync-workspace"; Description = "Consciousness archaeology integration" }
        @{ Name = "sync-deps"; Description = "Universal dependency orchestrator (Python|Rust|Bun|Node|Ruby)" }
        @{ Name = "css-engine-set"; Description = "🎨 Set CSS engine (postcss|lightning|hybrid) - Caribbean philosophy" }
        @{ Name = "css-engine-status"; Description = "🎨 Show CSS engine status and philosophy" }
        @{ Name = "css-build-hybrid"; Description = "🎨 Run hybrid CSS build (Tailwind → Lightning)" }
        @{ Name = "css-benchmark-all"; Description = "🎨 Benchmark all three CSS pipelines" }
        @{ Name = "css-postcss"; Description = "🎨 Quick switch to PostCSS (alias)" }
        @{ Name = "css-lightning"; Description = "🎨 Quick switch to Lightning (alias)" }
        @{ Name = "css-hybrid"; Description = "🎨 Quick switch to Hybrid (alias)" }
        @{ Name = "uvrun"; Description = "Fast Python via UV (alias)" }
        @{ Name = "cargofast"; Description = "Release Rust compilation (alias)" }
        @{ Name = "bunts"; Description = "Fast TypeScript via Bun (alias)" }
        @{ Name = "zstd-view"; Description = "View compressed ZSTD files (alias)" }
        @{ Name = "list-claudine"; Description = "Show this list" }
        @{ Name = "claudine-help"; Description = "Detailed usage guide" }
    )

    foreach ($Cmd in $Commands) {
        Write-Host "  $($Cmd.Name.PadRight(20))" -NoNewline -ForegroundColor Cyan
        Write-Host "- $($Cmd.Description)" -ForegroundColor Gray
    }

    Write-Host "`n📚 Total Commands: $($Commands.Count)" -ForegroundColor Yellow
    Write-Host "💡 Use 'claudine-help' for detailed examples`n" -ForegroundColor Gray
}

function claudine-help {
    <#
    .SYNOPSIS
    Show detailed Claudine usage guide
    #>

    Write-Host "`n💋 CLAUDINE SIN'CLAIRE $ClaudineVersion - Usage Guide" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkMagenta

    Write-Host "`n🐍 Python Projects:" -ForegroundColor Cyan
    Write-Host "   new-python -Name 'my_project'" -ForegroundColor White
    Write-Host "   → Creates: UV venv, pyproject.toml, src/ layout" -ForegroundColor Gray

    Write-Host "`n🦀 Rust Projects:" -ForegroundColor Cyan
    Write-Host "   new-rust -Name 'my_project'        # Binary" -ForegroundColor White
    Write-Host "   new-rust -Name 'my_lib' -Lib       # Library" -ForegroundColor White
    Write-Host "   → Creates: Cargo.toml, src/, Git repo" -ForegroundColor Gray

    Write-Host "`n🥖 Bun Projects:" -ForegroundColor Cyan
    Write-Host "   new-bun -Name 'my_project'" -ForegroundColor White
    Write-Host "   → Creates: package.json, tsconfig.json, index.ts" -ForegroundColor Gray

    Write-Host "`n💎 Ruby Projects:" -ForegroundColor Cyan
    Write-Host "   new-ruby -Name 'my_gem'" -ForegroundColor White
    Write-Host "   → Creates: Gemfile, lib/, spec/, .gemspec" -ForegroundColor Gray

    Write-Host "`n⚛️  React Projects:" -ForegroundColor Cyan
    Write-Host "   new-react -Name 'my_app'                      # Default (SWC + TS)" -ForegroundColor White
    Write-Host "   new-react -Name 'my_app' -Template 'react-ts' # Custom template" -ForegroundColor White
    Write-Host "   → Creates: Vite + React + Bun setup" -ForegroundColor Gray

    Write-Host "`n📦 Node Projects:" -ForegroundColor Cyan
    Write-Host "   new-node -Name 'my_api'" -ForegroundColor White
    Write-Host "   → Creates: Bun-powered Node.js project" -ForegroundColor Gray

    Write-Host "`n� Black Formatter Compilation:" -ForegroundColor Cyan
    Write-Host "   compile-black                      # Compile for local venv" -ForegroundColor White
    Write-Host "   compile-black -ExportToSystem      # Install globally via UV" -ForegroundColor White
    Write-Host "   → Compiles: Black with mypyc (~30% faster)" -ForegroundColor Gray
    Write-Host "   → Requires: Visual Studio 2022 (C++ workload)" -ForegroundColor Gray

    Write-Host "`n�💡 Tips:" -ForegroundColor Yellow
    Write-Host "   • All commands support -Path parameter" -ForegroundColor Gray
    Write-Host "   • Python uses UV for modern dependency management" -ForegroundColor Gray
    Write-Host "   • React/Node use Bun (faster than npm)" -ForegroundColor Gray
    Write-Host "   • Rust uses stable toolchain from poly_gluttony" -ForegroundColor Gray
    Write-Host "   • compile-black creates native binaries (20-40% faster)" -ForegroundColor Gray
    Write-Host "   • All tools are from cleaned .poly_gluttony environment`n" -ForegroundColor Gray
}

# ═══════════════════════════════════════════════════════════════════════════════
# ALIASES
# ═══════════════════════════════════════════════════════════════════════════════

Set-Alias -Name claudine -Value list-claudine
Set-Alias -Name claudine-list -Value list-claudine
Set-Alias -Name py -Value new-python
Set-Alias -Name rs -Value new-rust

# ═══════════════════════════════════════════════════════════════════════════════
# AUTO-EXECUTE ON LOAD
# ═══════════════════════════════════════════════════════════════════════════════

# Silent load - only show message if verbose
if ($VerbosePreference -eq 'Continue') {
    Write-Host "💋 Claudine $ClaudineVersion loaded: 12 commands available (list-claudine)" -ForegroundColor Magenta
}
