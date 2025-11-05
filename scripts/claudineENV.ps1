# claudineENV.ps1 v1.1.0 - Polyglot Environment Activation
# Docs: .poly_gluttony/claudine_docs/claudineENV_REFERENCE.md

param(
    [switch]$ShowVersions,
    [switch]$LoadFunctions,
    [switch]$Quiet,
    [switch]$Validate,
    [switch]$ShowMetrics
)

$POLYGLOT_ROOT = "C:\Users\erdno\PsychoNoir-Kontrapunkt"
$POLYGLOT_DIR = Join-Path $POLYGLOT_ROOT ".poly_gluttony"

# Error handling setup
$ErrorActionPreference = "Stop"
$ActivationStartTime = Get-Date

# Validation: Check if .poly_gluttony exists
if (-not (Test-Path $POLYGLOT_DIR)) {
    Write-Host "❌ ERROR: .poly_gluttony directory not found at: $POLYGLOT_DIR" -ForegroundColor Red
    Write-Host "   Please verify the installation path." -ForegroundColor Yellow
    exit 1
}

# Set marker for diagnostics
$env:CLAUDINE_ACTIVATED = "claudineENV.ps1"
$env:CLAUDINE_VERSION = "1.1.0"
$env:CLAUDINE_ROOT = $POLYGLOT_DIR

# VS Code Shell Integration (MUST BE FIRST)
if ($env:VSCODE_SHELL_INTEGRATION -and $env:VSCODE_NONCE) {
    $shellIntegrationScript = "C:\Users\erdno\meta_automata_env\VSCode\resources\app\out\vs\workbench\contrib\terminal\common\scripts\shellIntegration.ps1"
    if (Test-Path $shellIntegrationScript) {
        try { . $shellIntegrationScript } catch {}
    }
}

# Python (UV + tools)
$env:UV_TOOL_DIR = Join-Path $POLYGLOT_DIR "tools"
$UV_TOOL_PATHS = @("tools\ruff\Scripts", "tools\black\Scripts", "tools\pytest\Scripts", "tools\ipython\Scripts", "tools\httpie\Scripts")
foreach ($p in $UV_TOOL_PATHS) { 
    $fullPath = Join-Path $POLYGLOT_DIR $p
    if (Test-Path $fullPath) { $env:PATH = "$fullPath;$env:PATH" } 
}
$UV_BIN = Join-Path $POLYGLOT_DIR "uv\bin"
if (Test-Path $UV_BIN) { $env:PATH = "$UV_BIN;$env:PATH" }

# Rust
$env:CARGO_HOME = Join-Path $POLYGLOT_DIR "rust"
$env:RUSTUP_HOME = Join-Path $POLYGLOT_DIR "rust\rustup"
$RUST_BIN = Join-Path $POLYGLOT_DIR "rust\bin"
$env:PATH = "$RUST_BIN;$env:PATH"

# Ruby + MSYS2
$RUBY_BIN = Join-Path $POLYGLOT_DIR "ruby\bin"
$MSYS_UCRT64 = Join-Path $POLYGLOT_DIR "msys64\ucrt64\bin"
$env:PATH = "$RUBY_BIN;$MSYS_UCRT64;$env:PATH"

# Bun
$BUN_BIN = Join-Path $POLYGLOT_DIR "bun\bin"
$env:PATH = "$BUN_BIN;$env:PATH"

# Go + gopls
$GO_WORKSPACE = Join-Path $POLYGLOT_DIR "go_workspace"
$GO_GOPLS_BIN = Join-Path $GO_WORKSPACE "bin"
$GO_BIN = Join-Path $POLYGLOT_DIR "go\bin"
$env:GOPATH = $GO_WORKSPACE
if (Test-Path $GO_BIN) { $env:PATH = "$GO_BIN;$env:PATH" }
if (Test-Path $GO_GOPLS_BIN) { $env:PATH = "$GO_GOPLS_BIN;$env:PATH" }

# 7-Zip/ZSTD
$SEVENZ_BIN = Join-Path $POLYGLOT_DIR "tools\7zip"
if (Test-Path (Join-Path $SEVENZ_BIN "7z.exe")) {
    $env:PATH = "$SEVENZ_BIN;$env:PATH"
}

# Deduplicate PATH entries (preserve order, keep first occurrence)
$pathEntries = $env:PATH -split ';'
$seenPaths = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$uniquePaths = @()
foreach ($entry in $pathEntries) {
    if (-not [string]::IsNullOrWhiteSpace($entry) -and $seenPaths.Add($entry)) {
        $uniquePaths += $entry
    }
}
$env:PATH = $uniquePaths -join ';'

# FIRST RUN: Show comprehensive setup validation
if (-not $Quiet) {
    Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║          🔥💋 CLAUDINE POLYGLOT ENVIRONMENT 💋🔥           ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`n📦 Polyglot Tools Status:" -ForegroundColor Yellow
    
    # Python ecosystem
    Write-Host "`n🐍 Python Ecosystem:" -ForegroundColor Green
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Host "   ✅ Python: $(python --version 2>&1)" -ForegroundColor White
    } else {
        Write-Host "   ❌ Python: Not found" -ForegroundColor Red
    }
    if (Get-Command uv -ErrorAction SilentlyContinue) {
        Write-Host "   ✅ UV: $(uv --version)" -ForegroundColor White
    } else {
        Write-Host "   ❌ UV: Not found" -ForegroundColor Red
    }
    
    # Rust ecosystem
    Write-Host "`n🦀 Rust Ecosystem:" -ForegroundColor Green
    if (Get-Command cargo -ErrorAction SilentlyContinue) {
        Write-Host "   ✅ Cargo: $(cargo --version)" -ForegroundColor White
        Write-Host "   ✅ Rustc: $(rustc --version)" -ForegroundColor White
    } else {
        Write-Host "   ❌ Rust: Not found" -ForegroundColor Red
    }
    
    # Ruby + MSYS2
    Write-Host "`n💎 Ruby Ecosystem:" -ForegroundColor Green
    if (Get-Command ruby -ErrorAction SilentlyContinue) {
        $rubyVer = (ruby --version) -replace '\[.*\]',''
        Write-Host "   ✅ Ruby: $rubyVer" -ForegroundColor White
        if (Get-Command bundle -ErrorAction SilentlyContinue) {
            Write-Host "   ✅ Bundle: $(bundle --version)" -ForegroundColor White
        }
    } else {
        Write-Host "   ❌ Ruby: Not found" -ForegroundColor Red
    }
    if (Get-Command gcc -ErrorAction SilentlyContinue) {
        $gccVer = (gcc --version | Select-Object -First 1) -replace '\(.*?\)',''
        Write-Host "   ✅ GCC (MSYS2): $gccVer" -ForegroundColor White
    }
    
    # Bun
    Write-Host "`n🥖 Bun Ecosystem:" -ForegroundColor Green
    if (Get-Command bun -ErrorAction SilentlyContinue) {
        Write-Host "   ✅ Bun: v$(bun --version)" -ForegroundColor White
    } else {
        Write-Host "   ❌ Bun: Not found" -ForegroundColor Red
    }
    
    # Go + gopls
    Write-Host "`n🐹 Go Ecosystem:" -ForegroundColor Green
    if (Get-Command go -ErrorAction SilentlyContinue) {
        Write-Host "   ✅ Go: $(go version)" -ForegroundColor White
    } else {
        Write-Host "   ❌ Go: Not found" -ForegroundColor Red
    }
    if (Get-Command gopls -ErrorAction SilentlyContinue) {
        $goplsVer = (gopls version 2>&1 | Select-String 'v\d' | Select-Object -First 1) -replace '.*?(v[\d\.]+).*','$1'
        Write-Host "   ✅ gopls (LSP): $goplsVer" -ForegroundColor White
    } else {
        Write-Host "   ❌ gopls: Not found" -ForegroundColor Red
    }
    
    # Compression tools
    Write-Host "`n🗜️ Compression Tools:" -ForegroundColor Green
    if (Get-Command 7z -ErrorAction SilentlyContinue) {
        $sevenzRaw = & 7z 2>&1
        $sevenzOutput = $sevenzRaw[1]  # Index 0 is empty, version line at index 1
        if ($sevenzOutput -match 'ZS v[\d\.]+') {
            Write-Host "   ✅ 7-Zip: $sevenzOutput" -ForegroundColor White
        } else {
            Write-Host "   ✅ 7-Zip: $sevenzOutput (No ZSTD support)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ 7-Zip: Not found" -ForegroundColor Red
    }
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "⚡ SCRIPT PARAMETERS (use with & claudineENV.ps1):" -ForegroundColor Yellow
    Write-Host "   -ShowVersions         Show all tool versions on activation" -ForegroundColor Cyan
    Write-Host "   -LoadFunctions        Auto-load claudineENV_F.ps1 functions library" -ForegroundColor Cyan
    Write-Host "   -Quiet                Silent activation (no output)" -ForegroundColor Cyan
    
    Write-Host "`n🔧 BUILT-IN FUNCTIONS (available immediately):" -ForegroundColor Yellow
    Write-Host "   Open-ClaudineZstd     Extract/view .zst compressed files" -ForegroundColor Cyan
    Write-Host "                         Usage: Open-ClaudineZstd -Path file.zst -Action info|extract" -ForegroundColor Gray
    Write-Host "   uvs / uvr             UV with sanitized PYTHONHOME (safer package management)" -ForegroundColor Cyan
    Write-Host "   claudine-help         📖 Complete help & documentation" -ForegroundColor Cyan
    Write-Host "   claudine-versions     📊 Show all tool versions" -ForegroundColor Cyan
    Write-Host "   claudine-functions    🔧 Load claudineENV_F.ps1 functions library" -ForegroundColor Cyan
    Write-Host "   claudine-check        ✅ Run full health check (12/12 tools)" -ForegroundColor Cyan
    
    Write-Host "`n📦 FUNCTIONS LIBRARY (load with: claudine-functions):" -ForegroundColor Yellow
    Write-Host "`n   PROJECT CREATORS:" -ForegroundColor White
    Write-Host "   new-python            Create Python project (templates: basic, web, cli, data)" -ForegroundColor Cyan
    Write-Host "                         Usage: new-python -Name myapp -Template web" -ForegroundColor Gray
    Write-Host "   new-rust              Create Rust project (binary or --Lib)" -ForegroundColor Cyan
    Write-Host "   new-bun               Create Bun/TypeScript project (templates: basic, api, web, cli)" -ForegroundColor Cyan
    Write-Host "   new-ruby              Create Ruby gem with bundler" -ForegroundColor Cyan
    Write-Host "   new-react             Create React project with Bun 1.3.1 (basic, tailwind, shadcn, next)" -ForegroundColor Cyan
    Write-Host "                         ⚡ Native React Fast Refresh + Lightning CSS + JSX transpilation" -ForegroundColor Gray
    Write-Host "                         Usage: new-react -Name myapp -Type tailwind -Yes" -ForegroundColor Gray
    Write-Host "   new-node              Create Node.js project with Bun runtime" -ForegroundColor Cyan
    Write-Host "   new-go                Create Go module (with go mod init)" -ForegroundColor Cyan
    Write-Host "                         Usage: new-go -Name myapp or new-go -Name github.com/user/myapp" -ForegroundColor Gray
    
    Write-Host "`n   DIAGNOSTICS:" -ForegroundColor White
    Write-Host "   health-check          Verify all 14 tools (use -Detailed for verbose)" -ForegroundColor Cyan
    Write-Host "   show-versions         Display all tool versions" -ForegroundColor Cyan
    Write-Host "   clean-poly            Clean UV cache, remove test projects" -ForegroundColor Cyan
    Write-Host "                         Usage: clean-poly -All (removes test_* projects)" -ForegroundColor Gray
    Write-Host "                         Usage: clean-poly -TestDir C:\Path\To\Tests" -ForegroundColor Gray
    
    Write-Host "`n   BUN CONVENIENCE (Bun 1.3.1 Native Features):" -ForegroundColor White
    Write-Host "   bundev                Start dev server with Fast Refresh (bun --hot)" -ForegroundColor Cyan
    Write-Host "   bunbuild              Build production bundle (native bundler)" -ForegroundColor Cyan
    Write-Host "   buntest               Run tests (native test runner)" -ForegroundColor Cyan
    Write-Host "   bunts                 General Bun TypeScript runner" -ForegroundColor Cyan
    
    Write-Host "`n   ADVANCED:" -ForegroundColor White
    Write-Host "   use-msys2             Switch MSYS2 personality (ucrt64, mingw64, clang64, etc.)" -ForegroundColor Cyan
    Write-Host "   uvrun                 UV run with --quiet flag" -ForegroundColor Cyan
    Write-Host "   cargofast             Cargo build --release" -ForegroundColor Cyan
    Write-Host "   list-claudine         Show all available functions" -ForegroundColor Cyan
    
    Write-Host "`n📚 Documentation:" -ForegroundColor Yellow
    Write-Host "   .poly_gluttony\claudine_docs\README.md              Quick start" -ForegroundColor Gray
    Write-Host "   .poly_gluttony\claudine_docs\EXAMPLES.md            10 real-world scenarios" -ForegroundColor Gray
    Write-Host "   .poly_gluttony\claudine_docs\claudineENV_REFERENCE.md        Script reference" -ForegroundColor Gray
    Write-Host "   .poly_gluttony\claudine_docs\claudineENV_F_REFERENCE.md      Functions reference" -ForegroundColor Gray
    
    Write-Host "`n💡 EXAMPLE WORKFLOWS:" -ForegroundColor Magenta
    Write-Host "   claudine-functions                           # Load all functions" -ForegroundColor Cyan
    Write-Host "   new-python -Name myapi -Template web         # Create FastAPI project" -ForegroundColor Cyan
    Write-Host "   new-rust -Name mylib --Lib                   # Create Rust library" -ForegroundColor Cyan
    Write-Host "   new-react -Name myapp -Template tailwind     # Create React+Tailwind app" -ForegroundColor Cyan
    Write-Host "   health-check -Detailed                       # Verify all tools work" -ForegroundColor Cyan
    Write-Host "   Open-ClaudineZstd -Path data.zst -Action extract  # Extract ZSTD file" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray
}

# ZSTD helper
function Open-ClaudineZstd {
    param(
        [Parameter(Mandatory=$true)][string]$Path,
        [ValidateSet("info", "extract")][string]$Action = "info"
    )
    if (-not (Test-Path $Path)) {
        Write-Host "❌ File not found: $Path" -ForegroundColor Red
        return
    }
    switch ($Action) {
        "info" { 
            & 7z l $Path 
        }
        "extract" { 
            $outDir = [System.IO.Path]::GetFileNameWithoutExtension($Path)
            
            # If output directory already exists, warn user
            if (Test-Path $outDir) {
                Write-Host "⚠️  WARNING: Output directory already exists: $outDir" -ForegroundColor Yellow
                Write-Host "   7-Zip will overwrite files with same names" -ForegroundColor Gray
            }
            
            # Extract with overwrite flag
            & 7z x $Path -o"$outDir" -aoa 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Extracted to: $outDir" -ForegroundColor Green
                
                # Show extracted files
                $extractedFiles = Get-ChildItem -Path $outDir -Recurse -File -ErrorAction SilentlyContinue
                if ($extractedFiles) {
                    Write-Host "   Files extracted: $($extractedFiles.Count)" -ForegroundColor Gray
                }
            } else {
                Write-Host "❌ Extraction failed" -ForegroundColor Red
            }
        }
    }
}

# uvs alias (sanitized PYTHONHOME)
function uvs {
    param([Parameter(ValueFromRemainingArguments=$true)][string[]]$args)
    $scriptsDir = Join-Path $POLYGLOT_DIR "scripts"
    $wrapper = Join-Path $scriptsDir 'uv_sanitized.ps1'
    if (Test-Path $wrapper) {
        & $wrapper @args
    } else {
        & uv @args
    }
}
Set-Alias -Name uvr -Value uvs -Force

# Version display (optional)
if ($ShowVersions) {
    $versions = @(
        "Python: $(python --version 2>&1)",
        "UV: $(uv --version)",
        "Rust: $(rustc --version)",
        "Ruby: $(ruby --version)",
        "Bun: v$(bun --version)",
        "Go: $(go version)",
        "gopls: $(gopls version 2>&1 | Select-String 'v\d' | Select-Object -First 1)"
    )
    Write-Host ($versions -join " | ") -ForegroundColor Gray
}

# Load functions library (optional)
if ($LoadFunctions) {
    $functionsLib = Join-Path $POLYGLOT_DIR "claudineENV_F.ps1"
    if (Test-Path $functionsLib) {
        . $functionsLib
        if (-not $Quiet) { 
            Write-Host "💋 Functions loaded (new-python, new-rust, health-check, etc.)" -ForegroundColor Magenta 
        }
    }
}

# Help function
function global:claudine-help {
    Write-Host "`n🔥 claudineENV - Polyglot Development Environment" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    
    Write-Host "`n📊 Quick Commands:" -ForegroundColor Yellow
    Write-Host "  claudine-versions     Show all tool versions" -ForegroundColor White
    Write-Host "  claudine-functions    Load project creation functions" -ForegroundColor White
    Write-Host "  claudine-check        Run health check (needs functions)" -ForegroundColor White
    Write-Host "  claudine-help         Show this help" -ForegroundColor White
    
    Write-Host "`n🛠️  Available Tools:" -ForegroundColor Yellow
    Write-Host "  python, uv, cargo, rustc, ruby, bundle, bun, go, gopls, 7z" -ForegroundColor Gray
    
    Write-Host "`n📚 Functions (load with: claudine-functions):" -ForegroundColor Yellow
    Write-Host "  new-python            Create Python project (templates: web, cli, data)" -ForegroundColor White
    Write-Host "  new-rust              Create Rust project" -ForegroundColor White
    Write-Host "  new-bun               Create Bun/TypeScript project" -ForegroundColor White
    Write-Host "  new-react             Create React project (Vite)" -ForegroundColor White
    Write-Host "  new-ruby, new-node    Create Ruby/Node projects" -ForegroundColor White
    Write-Host "  health-check          Verify all tools (12/12 check)" -ForegroundColor White
    Write-Host "  clean-poly            Clean caches" -ForegroundColor White
    
    Write-Host "`n📖 Documentation:" -ForegroundColor Yellow
    Write-Host "  .poly_gluttony\claudine_docs\README.md" -ForegroundColor Gray
    Write-Host "  .poly_gluttony\claudine_docs\EXAMPLES.md" -ForegroundColor Gray
    
    Write-Host "`n💡 Examples:" -ForegroundColor Magenta
    Write-Host "  claudine-versions                    # See all versions" -ForegroundColor Cyan
    Write-Host "  claudine-functions                   # Load functions" -ForegroundColor Cyan
    Write-Host "  new-python -Name myapp -Template web # Create FastAPI project" -ForegroundColor Cyan
    Write-Host "  health-check -Detailed               # Full system check" -ForegroundColor Cyan
    Write-Host ""
}

# Quick aliases
function global:claudine-versions {
    Write-Host "`n📊 Tool Versions:" -ForegroundColor Cyan
    Write-Host "  Python: $(python --version 2>&1)" -ForegroundColor White
    Write-Host "  UV: $(uv --version)" -ForegroundColor White
    Write-Host "  Rust: $(rustc --version)" -ForegroundColor White
    Write-Host "  Cargo: $(cargo --version)" -ForegroundColor White
    Write-Host "  Ruby: $(ruby --version)" -ForegroundColor White
    Write-Host "  Bun: v$(bun --version)" -ForegroundColor White
    Write-Host "  Go: $(go version)" -ForegroundColor White
    Write-Host "  gopls: $(gopls version 2>&1 | Select-String 'v\d' | Select-Object -First 1)" -ForegroundColor White
    $sevenzRaw = & 7z 2>&1
    $sevenzVer = $sevenzRaw[1]  # Index 0 is empty, version at index 1
    Write-Host "  7-Zip: $sevenzVer" -ForegroundColor White
    Write-Host ""
}

function global:claudine-functions {
    $polyglotDir = "C:\Users\erdno\PsychoNoir-Kontrapunkt\.poly_gluttony"
    $functionsLib = Join-Path $polyglotDir "claudineENV_F.ps1"
    if (Test-Path $functionsLib) {
        . $functionsLib
        Write-Host "✅ Functions loaded! Try: list-claudine" -ForegroundColor Green
    } else {
        Write-Host "❌ Functions library not found: $functionsLib" -ForegroundColor Red
    }
}

function global:claudine-check {
    if (-not (Get-Command health-check -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Loading functions..." -ForegroundColor Yellow
        claudine-functions
        Write-Host ""
    }
    if (Get-Command health-check -ErrorAction SilentlyContinue) {
        health-check -Detailed
    } else {
        Write-Host "❌ Could not load health-check function" -ForegroundColor Red
    }
}

function global:claudine-metrics {
    Write-Host "`n⚡ Claudine Performance Metrics" -ForegroundColor Cyan
    
    # Activation time
    if ($ActivationStartTime) {
        $elapsed = (Get-Date) - $ActivationStartTime
        Write-Host "  Activation Time: $([math]::Round($elapsed.TotalMilliseconds, 2))ms" -ForegroundColor White
    }
    
    # Environment info
    Write-Host "`n📊 Environment Information:" -ForegroundColor Yellow
    Write-Host "  Version: $env:CLAUDINE_VERSION" -ForegroundColor White
    Write-Host "  Root: $env:CLAUDINE_ROOT" -ForegroundColor White
    Write-Host "  PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor White
    
    # PATH analysis
    $pathEntries = $env:PATH -split ';'
    $polyglotPaths = $pathEntries | Where-Object { $_ -like "*\.poly_gluttony*" }
    Write-Host "`n🛤️  PATH Entries (Polyglot):" -ForegroundColor Yellow
    Write-Host "  Total PATH entries: $($pathEntries.Count)" -ForegroundColor White
    Write-Host "  Polyglot entries: $($polyglotPaths.Count)" -ForegroundColor White
    
    # Tool detection
    $tools = @("python", "uv", "cargo", "rustc", "ruby", "bundle", "bun", "go", "gopls", "7z")
    $available = ($tools | Where-Object { Get-Command $_ -ErrorAction SilentlyContinue }).Count
    Write-Host "`n🔧 Tool Availability:" -ForegroundColor Yellow
    Write-Host "  Available: $available/$($tools.Count) tools" -ForegroundColor $(if ($available -eq $tools.Count) {"Green"} else {"Yellow"})
    
    Write-Host ""
}

function global:claudine-diagnose {
    Write-Host "`n🔍 Claudine Diagnostics" -ForegroundColor Cyan
    
    # Check for PATH conflicts
    Write-Host "`n⚠️  Checking for PATH conflicts..." -ForegroundColor Yellow
    $pathEntries = $env:PATH -split ';'
    $duplicates = $pathEntries | Group-Object | Where-Object { $_.Count -gt 1 }
    if ($duplicates) {
        Write-Host "  ⚠️  Found $($duplicates.Count) duplicate PATH entries:" -ForegroundColor Yellow
        $duplicates | ForEach-Object { Write-Host "     $($_.Name)" -ForegroundColor Gray }
    } else {
        Write-Host "  ✅ No duplicate PATH entries" -ForegroundColor Green
    }
    
    # Check for tool conflicts (multiple versions in PATH)
    Write-Host "`n🔧 Checking for tool version conflicts..." -ForegroundColor Yellow
    $tools = @("python", "cargo", "ruby", "bun", "go")
    foreach ($tool in $tools) {
        $instances = Get-Command $tool -All -ErrorAction SilentlyContinue
        if ($instances.Count -gt 1) {
            Write-Host "  ⚠️  Multiple $tool instances found:" -ForegroundColor Yellow
            $instances | ForEach-Object { Write-Host "     $($_.Source)" -ForegroundColor Gray }
        }
    }
    
    # Check disk space in .poly_gluttony
    Write-Host "`n💾 Disk Space Analysis..." -ForegroundColor Yellow
    if (Test-Path $env:CLAUDINE_ROOT) {
        try {
            $size = (Get-ChildItem -Path $env:CLAUDINE_ROOT -Recurse -File -ErrorAction SilentlyContinue | 
                     Measure-Object -Property Length -Sum).Sum / 1GB
            Write-Host "  .poly_gluttony size: $([math]::Round($size, 2)) GB" -ForegroundColor White
        } catch {
            Write-Host "  ⚠️  Could not calculate size" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

# Performance metrics (if requested)
if ($ShowMetrics) {
    $ActivationEndTime = Get-Date
    $elapsed = ($ActivationEndTime - $ActivationStartTime).TotalMilliseconds
    if (-not $Quiet) {
        Write-Host "`n⚡ Activation completed in $([math]::Round($elapsed, 2))ms" -ForegroundColor Cyan
    }
}
