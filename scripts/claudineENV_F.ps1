# claudineENV_F.ps1 v2.0.0 - Functions Library (Isolated/Portable)
# Docs: .poly_gluttony/claudine_docs/claudineENV_F_REFERENCE.md

# DYNAMIC PATH RESOLUTION - Use environment variables set by claudineENV.ps1
# Fallback to dynamic detection if not already activated
if ($env:CLAUDINE_REPO_ROOT -and $env:CLAUDINE_ROOT) {
    # Already activated by claudineENV.ps1
    $ClaudineWorkspace = $env:CLAUDINE_REPO_ROOT
    $ClaudineRoot = $env:CLAUDINE_ROOT
} else {
    # Standalone execution - perform dynamic detection
    . (Join-Path $PSScriptRoot "Get-RepositoryRoot.ps1")
    $ClaudineWorkspace = Get-RepositoryRoot -StartPath $PSScriptRoot
    $ClaudineRoot = Join-Path $ClaudineWorkspace ".poly_gluttony"
}

$ClaudineVersion = "2.0.0"  # Updated for isolated/portable environments
$ClaudineTemp = Join-Path $ClaudineWorkspace "Temp"

# HELPER FUNCTIONS

function Test-IsolatedEnvironment {
    <#
    .SYNOPSIS
        Check if current directory is safe for test project creation
    .DESCRIPTION
        Warns if creating projects in workspace root or other sensitive locations.
        Returns $true if location is safe (Temp directory), $false otherwise.
    #>
    param([string]$CurrentPath = $PWD.Path)
    
    # Temp directory and its subdirectories are ALWAYS safe
    if ($CurrentPath -like "$ClaudineTemp*") {
        return $true
    }
    
    $sensitiveLocations = @(
        $ClaudineWorkspace,
        $ClaudineRoot,
        $env:USERPROFILE,
        "C:\",
        "C:\Windows",
        "C:\Program Files"
    )
    
    foreach ($location in $sensitiveLocations) {
        if ($CurrentPath -eq $location) {
            Write-Host "⚠️  WARNING: Creating projects in workspace/system directory" -ForegroundColor Yellow
            Write-Host "   Current: $CurrentPath" -ForegroundColor Gray
            Write-Host "   Recommended: Use default Temp directory" -ForegroundColor Gray
            Write-Host "   Tip: Omit -Path parameter to use: $ClaudineTemp\<projecttype>" -ForegroundColor Cyan
            return $false
        }
    }
    return $true
}

# PROJECT CREATORS

function global:new-python {
    param(
        [Parameter(Mandatory=$true)][ValidatePattern('^[a-z0-9_-]+$')][string]$Name,
        [string]$Path = (Join-Path $ClaudineTemp "python"),
        [ValidateSet('basic','web','cli','data')][string]$Template = 'basic',
        [switch]$SkipVenv,
        [switch]$Force  # Skip isolation warning
    )
    
    # Warn if creating in sensitive location (unless -Force specified)
    if (-not $Force) {
        $null = Test-IsolatedEnvironment -CurrentPath $Path
    }
    
    $ProjectPath = Join-Path $Path $Name
    
    # Enhanced validation
    if (Test-Path $ProjectPath) {
        Write-Host "❌ Project exists: $ProjectPath" -ForegroundColor Red
        Write-Host "   Use a different name or remove the existing project first." -ForegroundColor Yellow
        return $false
    }
    
    # Check if UV is available
    if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
        Write-Host "❌ ERROR: UV not found in PATH" -ForegroundColor Red
        Write-Host "   Please activate claudineENV.ps1 first" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "🐍 Creating Python project: $Name [$Template]" -ForegroundColor Cyan
    
    try {
        # Create directory structure
        New-Item -ItemType Directory -Path "$ProjectPath\src\$Name" -Force | Out-Null
        New-Item -ItemType Directory -Path "$ProjectPath\tests" -Force | Out-Null
        
        $templateDeps = @()
        switch ($Template) {
            'web' {
                $templateDeps = @("fastapi>=0.104.0", "uvicorn[standard]>=0.24.0", "pydantic>=2.5.0")
                New-Item -ItemType Directory -Path "$ProjectPath\src\$Name\api" -Force | Out-Null
                Set-Content -Path "$ProjectPath\src\$Name\main.py" -Value "from fastapi import FastAPI`n`napp = FastAPI(title=`"$Name`")`n`n@app.get(`"/`")`nasync def root():`n    return {`"message`": `"Hello from $Name`"}`n`n@app.get(`"/health`")`nasync def health():`n    return {`"status`": `"healthy`"}"
        }
        'cli' {
            $templateDeps = @("typer[all]>=0.9.0", "rich>=13.7.0")
            Set-Content -Path "$ProjectPath\src\$Name\cli.py" -Value "import typer`nfrom rich import print as rprint`n`napp = typer.Typer()`n`n@app.command()`ndef hello(name: str = `"World`"):`n    rprint(f`"[green]Hello {name}![/green]`")`n`nif __name__ == `"__main__`":`n    app()"
        }
        'data' {
            $templateDeps = @("pandas>=2.1.0", "numpy>=1.26.0", "matplotlib>=3.8.0", "jupyter>=1.0.0")
            New-Item -ItemType Directory -Path "$ProjectPath\notebooks" -Force | Out-Null
            New-Item -ItemType Directory -Path "$ProjectPath\data" -Force | Out-Null
            Set-Content -Path "$ProjectPath\src\$Name\analysis.py" -Value "import pandas as pd`nimport numpy as np`nimport matplotlib.pyplot as plt`n`ndef load_data(filepath: str) -> pd.DataFrame:`n    return pd.read_csv(filepath)`n`ndef analyze_data(df: pd.DataFrame):`n    print(df.describe())`n    print(df.info())"
        }
    }
    
    $depsSection = if ($templateDeps.Count -gt 0) {
        "dependencies = [`n" + (($templateDeps | ForEach-Object { "    `"$_`"" }) -join ",`n") + "`n]"
    } else { "dependencies = []" }
    
    Set-Content -Path "$ProjectPath\pyproject.toml" -Value "[project]`nname = `"$Name`"`nversion = `"0.1.0`"`ndescription = `"Add your description here`"`nreadme = `"README.md`"`nrequires-python = `">=3.14`"`n$depsSection`n`n[build-system]`nrequires = [`"hatchling`"]`nbuild-backend = `"hatchling.build`"`n`n[dependency-groups]`ndev = [`n    `"pytest>=8.0.0`",`n    `"black>=25.0.0`",`n    `"ruff>=0.14.0`",`n]"
        Set-Content -Path "$ProjectPath\src\$Name\__init__.py" -Value "`"`"`n$Name`n`"`"`n"
        Set-Content -Path "$ProjectPath\README.md" -Value "# $Name`n`nAdd your project description here.`n`n## Installation`n`n\`\`\`bash`nuv venv`nuv pip install -e .`n\`\`\``n`n## Usage`n`n\`\`\`python`nfrom $Name import *`n\`\`\``n`n## Development`n`n\`\`\`bash`npytest`nblack .`nruff check .`n\`\`\``n"
        Set-Content -Path "$ProjectPath\.gitignore" -Value "__pycache__/`n*.py[cod]`n*`$py.class`n.venv/`nvenv/`n*.egg-info/`ndist/`nbuild/`n.pytest_cache/`n.ruff_cache/"
        
        # Create venv unless skipped
        if (-not $SkipVenv) {
            Push-Location $ProjectPath
            Write-Host "   Creating virtual environment..." -ForegroundColor Gray
            $startTime = Get-Date
            try {
                uv venv --quiet
                $duration = (Get-Date) - $startTime
                Write-Host "✅ Python project created: $ProjectPath (took $([math]::Round($duration.TotalSeconds, 2))s)" -ForegroundColor Green
            } catch {
                Pop-Location
                throw "Failed to create virtual environment: $_"
            }
            Pop-Location
        } else {
            Write-Host "✅ Python project created: $ProjectPath (venv skipped)" -ForegroundColor Green
        }
        
        return $true
        
    } catch {
        Write-Host "❌ ERROR creating project: $_" -ForegroundColor Red
        # Cleanup on failure
        if (Test-Path $ProjectPath) {
            Write-Host "   Cleaning up failed project..." -ForegroundColor Yellow
            Remove-Item -Path $ProjectPath -Recurse -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
}

function global:new-rust {
    param(
        [Parameter(Mandatory=$true)][string]$Name,
        [string]$Path = (Join-Path $ClaudineTemp "rust"),
        [switch]$Lib
    )
    
    # Validate cargo is available
    if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
        Write-Host "❌ ERROR: cargo is not available in PATH" -ForegroundColor Red
        Write-Host "   Try running: claudine-check" -ForegroundColor Yellow
        return $false
    }
    
    $ProjectPath = Join-Path $Path $Name
    
    # Check if project already exists
    if (Test-Path $ProjectPath) {
        Write-Host "❌ ERROR: Directory already exists: $ProjectPath" -ForegroundColor Red
        return $false
    }
    
    try {
        Write-Host "🦀 Creating Rust project: $Name" -ForegroundColor Cyan
        Push-Location $Path
        
        $startTime = Get-Date
        if ($Lib) { 
            cargo new $Name --lib --quiet 2>$null
        } else { 
            cargo new $Name --quiet 2>$null
        }
        
        if ($LASTEXITCODE -ne 0) {
            throw "cargo new failed with exit code $LASTEXITCODE"
        }
        
        $duration = (Get-Date) - $startTime
        Write-Host "✅ Rust project created: $ProjectPath (took $([math]::Round($duration.TotalSeconds, 2))s)" -ForegroundColor Green
        Pop-Location
        return $true
        
    } catch {
        Pop-Location
        Write-Host "❌ ERROR creating Rust project: $_" -ForegroundColor Red
        
        # Cleanup on failure
        if (Test-Path $ProjectPath) {
            Write-Host "   Cleaning up failed project..." -ForegroundColor Yellow
            Remove-Item -Path $ProjectPath -Recurse -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
}

function global:new-bun {
    param(
        [Parameter(Mandatory=$true)][string]$Name,
        [string]$Path = (Join-Path $ClaudineTemp "bun"),
        [ValidateSet('basic','api','web','cli')][string]$Template = 'basic'
    )
    
    # Validate bun is available
    if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
        Write-Host "❌ ERROR: bun is not available in PATH" -ForegroundColor Red
        Write-Host "   Try running: claudine-check" -ForegroundColor Yellow
        return $false
    }
    
    $ProjectPath = Join-Path $Path $Name
    
    # Check if project already exists
    if (Test-Path $ProjectPath) {
        Write-Host "❌ ERROR: Directory already exists: $ProjectPath" -ForegroundColor Red
        return $false
    }
    
    try {
        Write-Host "🥖 Creating Bun project: $Name [$Template]" -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $ProjectPath -ErrorAction Stop | Out-Null
        Push-Location $ProjectPath
        
        $startTime = Get-Date
        bun init -y 2>$null | Out-Null
        
        switch ($Template) {
            'api' {
                New-Item -ItemType Directory -Path "src" -ErrorAction Stop | Out-Null
                Set-Content -Path "src/server.ts" -Value "import { serve } from `"bun`";`n`nserve({`n  port: 3000,`n  fetch(req) {`n    const url = new URL(req.url);`n    if (url.pathname === `"/`") return new Response(`"$Name API`");`n    if (url.pathname === `"/health`") return Response.json({ status: `"healthy`" });`n    return new Response(`"Not Found`", { status: 404 });`n  },`n});`nconsole.log(`"🚀 API on http://localhost:3000`");"
            }
            'web' {
                New-Item -ItemType Directory -Path "public" -ErrorAction Stop | Out-Null
                New-Item -ItemType Directory -Path "src" -Force | Out-Null
                Set-Content -Path "public/index.html" -Value "<h1>$Name</h1>"
                Set-Content -Path "src/server.ts" -Value "import { serve, file } from `"bun`";`nserve({`n  port: 3000,`n  async fetch(req) {`n    const url = new URL(req.url);`n    const path = url.pathname === `"/`" ? `"/index.html`" : url.pathname;`n    try { return new Response(file(\`./public\${path}\`)); }`n    catch { return new Response(`"Not Found`", { status: 404 }); }`n  },`n});`nconsole.log(`"🚀 Web on http://localhost:3000`");"
            }
            'cli' {
                New-Item -ItemType Directory -Path "src" -ErrorAction Stop | Out-Null
                Set-Content -Path "src/cli.ts" -Value "#!/usr/bin/env bun`nconst args = process.argv.slice(2);`nif (args.includes(`"--help`")) {`n  console.log(`"$Name CLI\\nUsage: bun run cli.ts [options]`");`n  process.exit(0);`n}`nconsole.log(`"$Name v1.0.0`");"
            }
        }
        
        $duration = (Get-Date) - $startTime
        Write-Host "✅ Bun project created: $ProjectPath (took $([math]::Round($duration.TotalSeconds, 2))s)" -ForegroundColor Green
        Pop-Location
        return $true
        
    } catch {
        Pop-Location
        Write-Host "❌ ERROR creating Bun project: $_" -ForegroundColor Red
        Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
        Write-Host "   • Verify Bun is installed: bun --version" -ForegroundColor Gray
        Write-Host "   • Check network connectivity for package downloads" -ForegroundColor Gray
        Write-Host "   • Try: bun install --force (if package.json exists)" -ForegroundColor Gray
        Write-Host "   • Verify disk space and write permissions" -ForegroundColor Gray
        
        # Cleanup on failure
        if (Test-Path $ProjectPath) {
            Write-Host "`n   Cleaning up failed project..." -ForegroundColor Yellow
            Remove-Item -Path $ProjectPath -Recurse -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
}

function global:new-ruby {
    param(
        [Parameter(Mandatory=$true)][string]$Name,
        [string]$Path = (Join-Path $ClaudineTemp "ruby")
    )
    
    # Validate bundle is available
    if (-not (Get-Command bundle -ErrorAction SilentlyContinue)) {
        Write-Host "❌ ERROR: bundle is not available in PATH" -ForegroundColor Red
        Write-Host "   Try running: claudine-check" -ForegroundColor Yellow
        return $false
    }
    
    $ProjectPath = Join-Path $Path $Name
    
    # Check if project already exists
    if (Test-Path $ProjectPath) {
        Write-Host "❌ ERROR: Directory already exists: $ProjectPath" -ForegroundColor Red
        return $false
    }
    
    try {
        Write-Host "💎 Creating Ruby gem: $Name" -ForegroundColor Cyan
        Write-Host "   (bundle gem is interactive - answer prompts or press Enter for defaults)" -ForegroundColor Gray
        Push-Location $Path
        
        $startTime = Get-Date
        bundle gem $Name
        
        if ($LASTEXITCODE -ne 0) {
            throw "bundle gem failed with exit code $LASTEXITCODE"
        }
        
        $duration = (Get-Date) - $startTime
        Write-Host "✅ Ruby gem created: $ProjectPath (took $([math]::Round($duration.TotalSeconds, 2))s)" -ForegroundColor Green
        Pop-Location
        return $true
        
    } catch {
        Pop-Location
        Write-Host "❌ ERROR creating Ruby gem: $_" -ForegroundColor Red
        
        # Cleanup on failure
        if (Test-Path $ProjectPath) {
            Write-Host "   Cleaning up failed project..." -ForegroundColor Yellow
            Remove-Item -Path $ProjectPath -Recurse -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
}

function global:new-react {
    param(
        [Parameter(Mandatory=$true)][string]$Name,
        [string]$Path = (Join-Path $ClaudineTemp "react"),
        [ValidateSet('basic','tailwind','shadcn','next')][string]$Type = 'basic',
        [switch]$Yes
    )
    
    # Validate bun is available
    if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
        Write-Host "❌ ERROR: bun is not available in PATH" -ForegroundColor Red
        Write-Host "   Try running: health-check" -ForegroundColor Yellow
        return $false
    }
    
    # Validate Bun version for --react flag (requires 1.3.1+)
    try {
        $bunVersionOutput = & bun --version 2>&1
        $bunVersion = [version]($bunVersionOutput -replace '^(\d+\.\d+\.\d+).*','$1')
        $requiredVersion = [version]"1.3.1"
        
        if ($bunVersion -lt $requiredVersion) {
            Write-Host "❌ ERROR: bun init --react requires Bun 1.3.1+" -ForegroundColor Red
            Write-Host "   Current version: v$bunVersion" -ForegroundColor Yellow
            Write-Host "   Update with: bun upgrade" -ForegroundColor Cyan
            return $false
        }
    } catch {
        Write-Host "⚠️  WARNING: Could not verify Bun version, proceeding anyway..." -ForegroundColor Yellow
    }
    
    $ProjectPath = Join-Path $Path $Name
    
    # Check if project already exists
    if (Test-Path $ProjectPath) {
        Write-Host "❌ ERROR: Directory already exists: $ProjectPath" -ForegroundColor Red
        return $false
    }
    
    try {
        $startTime = Get-Date
        
        if ($Type -eq 'next') {
            # Next.js via bunx create-next-app
            Write-Host "⚛️  Creating Next.js project: $Name" -ForegroundColor Cyan
            Write-Host "   Using bunx create-next-app with Bun runtime" -ForegroundColor Gray
            Push-Location $Path
            
            if ($Yes) {
                bunx create-next-app $Name --use-bun --no-git 2>&1 | Out-Null
            } else {
                bunx create-next-app $Name --use-bun
            }
            
            if ($LASTEXITCODE -ne 0) {
                Pop-Location
                throw "bunx create-next-app failed"
            }
            
            Pop-Location
            
        } else {
            # Bun 1.3.1 native React init
            Write-Host "⚛️  Creating React project: $Name [$Type]" -ForegroundColor Cyan
            Write-Host "   Using bun init --react (native transpilation + Fast Refresh)" -ForegroundColor Gray
            
            New-Item -ItemType Directory -Path $ProjectPath -ErrorAction Stop | Out-Null
            Push-Location $ProjectPath
            
            # Use bun init --react with appropriate flags
            $initArgs = @('init')
            
            switch ($Type) {
                'tailwind' { $initArgs += '--react=tailwind' }
                'shadcn'   { $initArgs += '--react=shadcn' }
                default    { $initArgs += '--react' }
            }
            
            if ($Yes) { $initArgs += '--yes' }
            
            & bun @initArgs 2>&1 | Out-Null
            
            if ($LASTEXITCODE -ne 0) {
                Pop-Location
                throw "bun init failed"
            }
            
            Pop-Location
        }
        
        $duration = (Get-Date) - $startTime
        Write-Host "✅ React project created: $ProjectPath ($([math]::Round($duration.TotalSeconds, 2))s)" -ForegroundColor Green
        
        Write-Host "`n🚀 Quick Start:" -ForegroundColor Cyan
        Write-Host "  cd $Name" -ForegroundColor White
        if ($Type -eq 'next') {
            Write-Host "  bun run dev" -ForegroundColor White
        } else {
            Write-Host "  bun run dev    # Start dev server with Hot Reload" -ForegroundColor White
            Write-Host "  bun build      # Bundle for production" -ForegroundColor White
        }
        
        return $true
        
    } catch {
        if ((Get-Location).Path -like "*$ProjectPath*") { Pop-Location }
        
        Write-Host "❌ ERROR creating React project: $_" -ForegroundColor Red
        Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
        Write-Host "   • Verify Bun is installed: bun --version" -ForegroundColor Gray
        Write-Host "   • Bun 1.3.1+ required for --react flag" -ForegroundColor Gray
        Write-Host "   • Check disk space and write permissions" -ForegroundColor Gray
        Write-Host "   • Try manual setup: bun init --react --yes" -ForegroundColor Gray
        
        # Cleanup on failure
        if (Test-Path $ProjectPath) {
            Write-Host "`n   Cleaning up failed project..." -ForegroundColor Yellow
            Remove-Item -Path $ProjectPath -Recurse -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
}

function global:new-node {
    param(
        [Parameter(Mandatory=$true)][string]$Name,
        [string]$Path = (Join-Path $ClaudineTemp "node")
    )
    
    # Validate bun is available
    if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
        Write-Host "❌ ERROR: bun is not available in PATH" -ForegroundColor Red
        Write-Host "   Try running: claudine-check" -ForegroundColor Yellow
        return $false
    }
    
    $ProjectPath = Join-Path $Path $Name
    
    # Check if project already exists
    if (Test-Path $ProjectPath) {
        Write-Host "❌ ERROR: Directory already exists: $ProjectPath" -ForegroundColor Red
        return $false
    }
    
    try {
        Write-Host "📦 Creating Node project: $Name" -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $ProjectPath -ErrorAction Stop | Out-Null
        Push-Location $ProjectPath
        
        $startTime = Get-Date
        bun init -y 2>$null | Out-Null
        
        $duration = (Get-Date) - $startTime
        Write-Host "✅ Node project created: $ProjectPath (took $([math]::Round($duration.TotalSeconds, 2))s)" -ForegroundColor Green
        Pop-Location
        return $true
        
    } catch {
        Pop-Location
        Write-Host "❌ ERROR creating Node project: $_" -ForegroundColor Red
        
        # Cleanup on failure
        if (Test-Path $ProjectPath) {
            Write-Host "   Cleaning up failed project..." -ForegroundColor Yellow
            Remove-Item -Path $ProjectPath -Recurse -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
}

function global:new-go {
    <#
    .SYNOPSIS
        Create a new Go module project
    .PARAMETER Name
        The name of the Go module (e.g., myapp or github.com/user/myapp)
    .PARAMETER Path
        The parent directory path (defaults to current directory)
    .EXAMPLE
        new-go -Name myapp
        new-go -Name github.com/myuser/myproject
    #>
    param(
        [Parameter(Mandatory=$true)][string]$Name,
        [string]$Path = (Join-Path $ClaudineTemp "go")
    )
    
    # Validate go is available
    if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
        Write-Host "❌ ERROR: go is not available in PATH" -ForegroundColor Red
        Write-Host "   Try running: health-check" -ForegroundColor Yellow
        return $false
    }
    
    # Extract simple name for directory (e.g., "myapp" from "github.com/user/myapp")
    $dirName = if ($Name -match '/') { 
        $Name -split '/' | Select-Object -Last 1 
    } else { 
        $Name 
    }
    
    $ProjectPath = Join-Path $Path $dirName
    
    # Check if project already exists
    if (Test-Path $ProjectPath) {
        Write-Host "❌ ERROR: Directory already exists: $ProjectPath" -ForegroundColor Red
        return $false
    }
    
    try {
        Write-Host "🐹 Creating Go module: $Name" -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $ProjectPath -ErrorAction Stop | Out-Null
        Push-Location $ProjectPath
        
        $startTime = Get-Date
        
        # Initialize Go module
        go mod init $Name 2>&1 | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            throw "go mod init failed with exit code $LASTEXITCODE"
        }
        
        # Create basic main.go
        $mainGo = @"
package main

import (
    "fmt"
)

func main() {
    fmt.Println("Hello from $Name!")
}
"@
        Set-Content -Path "main.go" -Value $mainGo
        
        # Create .gitignore
        Set-Content -Path ".gitignore" -Value "# Binaries for programs and plugins`n*.exe`n*.exe~`n*.dll`n*.so`n*.dylib`n`n# Test binary`n*.test`n`n# Output of the go build`n$dirName`n`n# Go workspace`ngo.work`n"
        
        # Create README
        $readme = @'
# {0}

A Go module created with Claudine.

## Build

```bash
go build
```

## Run

```bash
go run .
```

## Test

```bash
go test ./...
```
'@ -f $Name
        Set-Content -Path "README.md" -Value $readme
        
        $duration = (Get-Date) - $startTime
        Write-Host "✅ Go module created: $ProjectPath ($([math]::Round($duration.TotalSeconds, 2))s)" -ForegroundColor Green
        
        Write-Host "`n🚀 Quick Start:" -ForegroundColor Cyan
        Write-Host "  cd $dirName" -ForegroundColor White
        Write-Host "  go run .       # Run the program" -ForegroundColor White
        Write-Host "  go build       # Build executable" -ForegroundColor White
        
        Pop-Location
        return $true
        
    } catch {
        if ((Get-Location).Path -like "*$ProjectPath*") { Pop-Location }
        
        Write-Host "❌ ERROR creating Go module: $_" -ForegroundColor Red
        Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
        Write-Host "   • Verify Go is installed: go version" -ForegroundColor Gray
        Write-Host "   • Check disk space and write permissions" -ForegroundColor Gray
        Write-Host "   • Try manual setup: go mod init <module-name>" -ForegroundColor Gray
        
        # Cleanup on failure
        if (Test-Path $ProjectPath) {
            Write-Host "`n   Cleaning up failed project..." -ForegroundColor Yellow
            Remove-Item -Path $ProjectPath -Recurse -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
}

# DIAGNOSTICS

function global:health-check {
    param([switch]$Detailed)
    Write-Host "`n🏥 Polyglot Health Check" -ForegroundColor Cyan
    
    # Check tools via Get-Command (uses PATH)
    $tools = @("python", "uv", "cargo", "rustc", "ruby", "bundle", "bun", "go", "gopls", "black", "ruff", "pytest", "gcc", "7z")
    $healthy = 0
    
    foreach ($tool in $tools) {
        $cmd = Get-Command $tool -ErrorAction SilentlyContinue
        if ($cmd) {
            $healthy++
            try {
                $version = switch ($tool) {
                    "python" { & python --version 2>&1 }
                    "uv" { & uv --version }
                    "cargo" { & cargo --version }
                    "rustc" { & rustc --version }
                    "ruby" { (& ruby --version) -replace '\[.*\]','' }
                    "bundle" { & bundle --version }
                    "bun" { "v$(& bun --version)" }
                    "go" { & go version }
                    "gopls" { (& gopls version 2>&1 | Select-String 'v\d' | Select-Object -First 1) -replace '.*?(v[\d\.]+).*','$1' }
                    "black" { & black --version 2>&1 | Select-Object -First 1 }
                    "ruff" { & ruff --version }
                    "pytest" { & pytest --version 2>&1 | Select-Object -First 1 }
                    "gcc" { (& gcc --version | Select-Object -First 1) -replace '\(.*?\)','' }
                    "7z" { 
                        $sevenzOut = & 7z 2>&1
                        $firstLine = $sevenzOut[1]  # Index 0 is empty, version is at index 1
                        if ($firstLine -match 'ZS v[\d\.]+') { $firstLine } else { "Standard version" }
                    }
                }
                Write-Host "  ✅ $tool : $version" -ForegroundColor Green
            } catch {
                Write-Host "  ✅ $tool : Available (version check failed)" -ForegroundColor Green
            }
        } else {
            Write-Host "  ❌ $tool : Not found in PATH" -ForegroundColor Red
        }
    }
    
    Write-Host "`nHealth: $healthy/$($tools.Count) tools verified" -ForegroundColor $(if ($healthy -eq $tools.Count) {"Green"} else {"Yellow"})
}

function global:show-versions {
    Write-Host "`n📊 Tool Versions" -ForegroundColor Cyan
    Write-Host "Python: $(python --version 2>&1)" -ForegroundColor White
    Write-Host "UV: $(uv --version)" -ForegroundColor White
    Write-Host "Rust: $(rustc --version)" -ForegroundColor White
    Write-Host "Cargo: $(cargo --version)" -ForegroundColor White
    Write-Host "Bun: v$(bun --version)" -ForegroundColor White
    Write-Host "Ruby: $(ruby --version)" -ForegroundColor White
    Write-Host "Go: $(go version)" -ForegroundColor White
    Write-Host "gopls: $(gopls version 2>&1 | Select-String 'v\d' | Select-Object -First 1)" -ForegroundColor White
}

function global:clean-poly {
    <#
    .SYNOPSIS
        Clean UV cache and optionally remove test projects
    .PARAMETER All
        Also remove test projects in current directory
    .PARAMETER TestDir
        Specific test directory to remove (e.g., Temp folder stress tests)
    #>
    param(
        [switch]$All,
        [string]$TestDir
    )
    
    Write-Host "`n🧹 Claudine Cleanup" -ForegroundColor Cyan
    
    # Clean UV cache
    Write-Host "`n📦 Cleaning UV cache..." -ForegroundColor Yellow
    $UV_CACHE_DIR = Join-Path $ClaudineRoot "uv_cache"
    if (Test-Path $UV_CACHE_DIR) {
        $cacheSize = (Get-ChildItem -Path $UV_CACHE_DIR -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        uv cache clean 2>&1 | Out-Null
        if (Test-Path $UV_CACHE_DIR) {
            $newCacheSize = (Get-ChildItem -Path $UV_CACHE_DIR -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "✅ Saved: $([math]::Round($cacheSize - $newCacheSize, 2)) MB" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ UV cache already clean" -ForegroundColor Green
    }
    
    # Clean specific test directory
    if ($TestDir) {
        Write-Host "`n🗑️  Removing test directory..." -ForegroundColor Yellow
        if (Test-Path $TestDir) {
            $itemCount = (Get-ChildItem -Path $TestDir -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
            Remove-Item -Path $TestDir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Deleted: $TestDir ($itemCount items)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Directory not found: $TestDir" -ForegroundColor Yellow
        }
    }
    
    # Clean test projects in current directory
    if ($All) {
        Write-Host "`n🗑️  Removing test projects in current directory..." -ForegroundColor Yellow
        $testPatterns = @('test_py_*', 'test_rust_*', 'test_bun_*', 'test_react_*', 'test_*_fixed')
        $removed = 0
        foreach ($pattern in $testPatterns) {
            $items = Get-ChildItem -Path $PWD.Path -Directory -Filter $pattern -ErrorAction SilentlyContinue
            foreach ($item in $items) {
                Write-Host "  Removing: $($item.Name)" -ForegroundColor Gray
                Remove-Item -Path $item.FullName -Recurse -Force -ErrorAction SilentlyContinue
                $removed++
            }
        }
        if ($removed -gt 0) {
            Write-Host "✅ Removed $removed test project(s)" -ForegroundColor Green
        } else {
            Write-Host "✅ No test projects found" -ForegroundColor Green
        }
    }
    
    Write-Host ""
}

# BUN CONVENIENCE FUNCTIONS (Bun 1.3.1 Native Capabilities)

function global:bundev {
    <#
    .SYNOPSIS
        Start Bun development server with React Fast Refresh
    .DESCRIPTION
        Alias for 'bun --hot' which enables React Fast Refresh via JavaScriptCore.
        Hot Module Reloading (HMR) is built into Bun 1.3.1 - no bundler config needed.
    .EXAMPLE
        bundev src/index.ts
    #>
    param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Args)
    Write-Host "⚡ Starting Bun dev server with Fast Refresh..." -ForegroundColor Cyan
    & bun --hot @Args
}

function global:bunbuild {
    <#
    .SYNOPSIS
        Build production bundle with Bun's native bundler
    .DESCRIPTION
        Runs 'bun build' with production optimizations. Bun's native bundler replaces
        Webpack/Vite/esbuild - it's built into the runtime using JavaScriptCore.
    .PARAMETER Minify
        Enable minification (default: true for production)
    .EXAMPLE
        bunbuild src/index.ts --outdir ./dist
    #>
    param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Args)
    Write-Host "📦 Building with Bun's native bundler..." -ForegroundColor Cyan
    & bun build @Args
}

function global:buntest {
    <#
    .SYNOPSIS
        Run tests with Bun's native test runner
    .DESCRIPTION
        Alias for 'bun test' which uses Bun's built-in Jest-compatible test runner.
        Extremely fast - no need for external test frameworks.
    .EXAMPLE
        buntest                # Run all tests
        buntest --watch        # Watch mode
    #>
    param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Args)
    Write-Host "🧪 Running tests with Bun..." -ForegroundColor Cyan
    & bun test @Args
}

# ADVANCED OPERATIONS

function global:use-msys2 {
    <#
    .SYNOPSIS
        Switch MSYS2 environment personality
    .DESCRIPTION
        Activates specified MSYS2 personality (ucrt64, mingw64, clang64, etc.).
        Validates that personality has tools installed before switching.
    .PARAMETER Personality
        MSYS2 personality to activate (default: ucrt64)
    .EXAMPLE
        use-msys2 -Personality ucrt64
    #>
    param([ValidateSet("ucrt64","mingw64","clang64","mingw32","clangarm64","msys")][string]$Personality = "ucrt64")
    
    Write-Host "🔧 Switching MSYS2 to: $Personality" -ForegroundColor Cyan
    $msys64Path = Join-Path $ClaudineRoot "msys64"
    $personalityBin = Join-Path $msys64Path "$Personality\bin"
    $msysUsrBin = Join-Path $msys64Path "usr\bin"
    
    # Validate personality exists
    if (-not (Test-Path $personalityBin)) {
        Write-Host "❌ MSYS2 personality not found: $personalityBin" -ForegroundColor Red
        Write-Host "   Directory does not exist" -ForegroundColor Yellow
        return $false
    }
    
    # Validate personality has tools installed (not empty)
    $toolCount = (Get-ChildItem -Path $personalityBin -ErrorAction SilentlyContinue | Measure-Object).Count
    if ($toolCount -eq 0) {
        Write-Host "❌ MSYS2 personality '$Personality' is not installed (empty bin directory)" -ForegroundColor Red
        Write-Host "`n💡 Available personalities:" -ForegroundColor Yellow
        
        # Show which personalities ARE installed
        $personalities = @("ucrt64","mingw64","clang64","mingw32","clangarm64")
        foreach ($p in $personalities) {
            $pBin = Join-Path $msys64Path "$p\bin"
            if (Test-Path $pBin) {
                $pCount = (Get-ChildItem -Path $pBin -ErrorAction SilentlyContinue | Measure-Object).Count
                if ($pCount -gt 0) {
                    Write-Host "   ✅ $p ($pCount tools)" -ForegroundColor Green
                }
            }
        }
        
        Write-Host "`n   To install $Personality toolchain, run MSYS2 and execute:" -ForegroundColor Cyan
        Write-Host "   pacman -S --needed base-devel mingw-w64-$Personality-toolchain" -ForegroundColor Gray
        return $false
    }
    
    # Remove ALL MSYS2/MinGW entries (including external installations) to prevent conflicts
    $env:PATH = ($env:PATH -split ';' | Where-Object {
        $_ -notlike "*msys64*" -and 
        $_ -notlike "*msys2*" -and 
        $_ -notlike "*mingw*" -and 
        $_ -notlike "*ucrt64*" -and 
        $_ -notlike "*clang64*"
    }) -join ';'
    
    # Add Claudine's MSYS2 paths at the front (highest priority)
    $env:PATH = "$personalityBin;$msysUsrBin;$env:PATH"
    Write-Host "✅ MSYS2 $Personality activated ($toolCount tools available)" -ForegroundColor Green
    return $true
}

# LINTING & DEBUGGING INTEGRATION

function global:Test-ScriptQuality {
    <#
    .SYNOPSIS
        Run comprehensive linting/debugging on PowerShell scripts and generated projects
    .DESCRIPTION
        Integrates ALL available linters and debuggers from .poly_gluttony:
        - PowerShell: PSScriptAnalyzer (if available)
        - Python: ruff check + ruff format --check
        - Rust: cargo clippy + cargo fmt --check
        - TypeScript/JavaScript: biome check
        - Go: go vet + gofmt -l
        - Ruby: bundle exec rubocop (if available)
        - C/C++: gcc -fsyntax-only (basic syntax check)
    .PARAMETER ScriptPath
        Path to script/project to lint (defaults to current directory)
    .PARAMETER Language
        Specific language to lint (auto-detected if not specified)
    .PARAMETER Fix
        Apply automatic fixes where possible
    .EXAMPLE
        Test-ScriptQuality -ScriptPath C:\...\Temp\python\myproject
        Test-ScriptQuality -ScriptPath .\claudineENV_F.ps1 -Language PowerShell
    #>
    param(
        [string]$ScriptPath = $PWD.Path,
        [ValidateSet('Auto','PowerShell','Python','Rust','TypeScript','JavaScript','Go','Ruby','C','Cpp')]
        [string]$Language = 'Auto',
        [switch]$Fix
    )
    
    Write-Host "`n🔍 COMPREHENSIVE QUALITY CHECK" -ForegroundColor Cyan
    Write-Host "   Path: $ScriptPath" -ForegroundColor Gray
    
    $results = @{
        Passed = 0
        Failed = 0
        Skipped = 0
        Details = @()
    }
    
    # Auto-detect language if not specified
    if ($Language -eq 'Auto') {
        if ($ScriptPath -match '\.ps1$') { $Language = 'PowerShell' }
        elseif (Test-Path (Join-Path $ScriptPath 'pyproject.toml')) { $Language = 'Python' }
        elseif (Test-Path (Join-Path $ScriptPath 'Cargo.toml')) { $Language = 'Rust' }
        elseif (Test-Path (Join-Path $ScriptPath 'package.json')) { 
            $pkgJson = Get-Content (Join-Path $ScriptPath 'package.json') -Raw | ConvertFrom-Json
            if ($pkgJson.devDependencies -match 'typescript') { $Language = 'TypeScript' }
            else { $Language = 'JavaScript' }
        }
        elseif (Test-Path (Join-Path $ScriptPath 'go.mod')) { $Language = 'Go' }
        elseif (Test-Path (Join-Path $ScriptPath 'Gemfile')) { $Language = 'Ruby' }
    }
    
    Write-Host "   Language: $Language" -ForegroundColor Cyan
    Write-Host ""
    
    # Determine working directory (parent dir if file, else the path itself)
    $workingDir = if (Test-Path $ScriptPath -PathType Leaf) {
        Split-Path $ScriptPath -Parent
    } else {
        $ScriptPath
    }
    
    Push-Location $workingDir
    
    try {
        switch ($Language) {
            'PowerShell' {
                # PSScriptAnalyzer (if available)
                if (Get-Command Invoke-ScriptAnalyzer -ErrorAction SilentlyContinue) {
                    Write-Host "🔎 Running PSScriptAnalyzer..." -ForegroundColor Yellow
                    $analysisResults = Invoke-ScriptAnalyzer -Path $ScriptPath -Severity Warning,Error
                    if ($analysisResults) {
                        Write-Host "   ⚠️  Issues found:" -ForegroundColor Yellow
                        $analysisResults | Format-Table -AutoSize
                        $results.Failed++
                        $results.Details += "PSScriptAnalyzer: $($analysisResults.Count) issues"
                    } else {
                        Write-Host "   ✅ No issues found" -ForegroundColor Green
                        $results.Passed++
                    }
                } else {
                    Write-Host "   ⏭️  PSScriptAnalyzer not available (optional)" -ForegroundColor Gray
                    $results.Skipped++
                }
            }
            
            'Python' {
                # Ruff linting
                if (Get-Command ruff -ErrorAction SilentlyContinue) {
                    Write-Host "🐍 Running Ruff linter..." -ForegroundColor Yellow
                    $ruffCheck = & ruff check . 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "   ⚠️  Lint issues found:" -ForegroundColor Yellow
                        $ruffCheck | Select-Object -First 20 | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
                        $results.Failed++
                        $results.Details += "Ruff lint: Issues found"
                        
                        if ($Fix) {
                            Write-Host "   🔧 Applying fixes..." -ForegroundColor Cyan
                            & ruff check . --fix 2>&1 | Out-Null
                            Write-Host "   ✅ Fixes applied" -ForegroundColor Green
                        }
                    } else {
                        Write-Host "   ✅ No lint issues" -ForegroundColor Green
                        $results.Passed++
                    }
                    
                    # Ruff formatting check
                    Write-Host "🐍 Checking Python formatting..." -ForegroundColor Yellow
                    $ruffFmt = & ruff format --check . 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "   ⚠️  Formatting issues found" -ForegroundColor Yellow
                        $results.Failed++
                        $results.Details += "Ruff format: Issues found"
                        
                        if ($Fix) {
                            Write-Host "   🔧 Formatting code..." -ForegroundColor Cyan
                            & ruff format . 2>&1 | Out-Null
                            Write-Host "   ✅ Code formatted" -ForegroundColor Green
                        }
                    } else {
                        Write-Host "   ✅ Formatting correct" -ForegroundColor Green
                        $results.Passed++
                    }
                } else {
                    Write-Host "   ❌ Ruff not available" -ForegroundColor Red
                    $results.Skipped++
                }
            }
            
            'Rust' {
                # Clippy linting
                if (Get-Command cargo -ErrorAction SilentlyContinue) {
                    Write-Host "🦀 Running Clippy linter..." -ForegroundColor Yellow
                    $clippyOutput = & cargo clippy -- -D warnings 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "   ⚠️  Clippy warnings found:" -ForegroundColor Yellow
                        $clippyOutput | Select-Object -Last 30 | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
                        $results.Failed++
                        $results.Details += "Clippy: Warnings found"
                        
                        if ($Fix) {
                            Write-Host "   🔧 Applying Clippy fixes..." -ForegroundColor Cyan
                            & cargo clippy --fix --allow-dirty 2>&1 | Out-Null
                            Write-Host "   ✅ Fixes applied" -ForegroundColor Green
                        }
                    } else {
                        Write-Host "   ✅ No Clippy warnings" -ForegroundColor Green
                        $results.Passed++
                    }
                    
                    # Rustfmt check
                    Write-Host "🦀 Checking Rust formatting..." -ForegroundColor Yellow
                    $rustfmtOutput = & cargo fmt -- --check 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "   ⚠️  Formatting issues found" -ForegroundColor Yellow
                        $results.Failed++
                        $results.Details += "Rustfmt: Issues found"
                        
                        if ($Fix) {
                            Write-Host "   🔧 Formatting Rust code..." -ForegroundColor Cyan
                            & cargo fmt 2>&1 | Out-Null
                            Write-Host "   ✅ Code formatted" -ForegroundColor Green
                        }
                    } else {
                        Write-Host "   ✅ Formatting correct" -ForegroundColor Green
                        $results.Passed++
                    }
                } else {
                    Write-Host "   ❌ Cargo not available" -ForegroundColor Red
                    $results.Skipped++
                }
            }
            
            { $_ -in @('TypeScript', 'JavaScript') } {
                # Biome linting and formatting
                if (Get-Command bun -ErrorAction SilentlyContinue) {
                    Write-Host "🥖 Running Biome check..." -ForegroundColor Yellow
                    $biomeOutput = & bun x biome check . 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "   ⚠️  Issues found:" -ForegroundColor Yellow
                        $biomeOutput | Select-Object -First 30 | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
                        $results.Failed++
                        $results.Details += "Biome: Issues found"
                        
                        if ($Fix) {
                            Write-Host "   🔧 Applying Biome fixes..." -ForegroundColor Cyan
                            & bun x biome check . --fix 2>&1 | Out-Null
                            Write-Host "   ✅ Fixes applied" -ForegroundColor Green
                        }
                    } else {
                        Write-Host "   ✅ No issues" -ForegroundColor Green
                        $results.Passed++
                    }
                } else {
                    Write-Host "   ❌ Bun/Biome not available" -ForegroundColor Red
                    $results.Skipped++
                }
            }
            
            'Go' {
                # go vet
                if (Get-Command go -ErrorAction SilentlyContinue) {
                    Write-Host "🐹 Running go vet..." -ForegroundColor Yellow
                    $vetOutput = & go vet ./... 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "   ⚠️  Issues found:" -ForegroundColor Yellow
                        $vetOutput | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
                        $results.Failed++
                        $results.Details += "go vet: Issues found"
                    } else {
                        Write-Host "   ✅ No issues" -ForegroundColor Green
                        $results.Passed++
                    }
                    
                    # gofmt check
                    Write-Host "🐹 Checking Go formatting..." -ForegroundColor Yellow
                    $fmtOutput = & gofmt -l . 2>&1
                    if ($fmtOutput) {
                        Write-Host "   ⚠️  Files need formatting:" -ForegroundColor Yellow
                        $fmtOutput | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
                        $results.Failed++
                        $results.Details += "gofmt: Files need formatting"
                        
                        if ($Fix) {
                            Write-Host "   🔧 Formatting Go code..." -ForegroundColor Cyan
                            & gofmt -w . 2>&1 | Out-Null
                            Write-Host "   ✅ Code formatted" -ForegroundColor Green
                        }
                    } else {
                        Write-Host "   ✅ Formatting correct" -ForegroundColor Green
                        $results.Passed++
                    }
                } else {
                    Write-Host "   ❌ Go not available" -ForegroundColor Red
                    $results.Skipped++
                }
            }
            
            'Ruby' {
                # RuboCop (if available via Bundler)
                if ((Get-Command bundle -ErrorAction SilentlyContinue) -and (Test-Path 'Gemfile')) {
                    Write-Host "💎 Running RuboCop..." -ForegroundColor Yellow
                    $rubocopOutput = & bundle exec rubocop 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "   ⚠️  Issues found:" -ForegroundColor Yellow
                        $rubocopOutput | Select-Object -First 30 | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
                        $results.Failed++
                        $results.Details += "RuboCop: Issues found"
                        
                        if ($Fix) {
                            Write-Host "   🔧 Applying RuboCop fixes..." -ForegroundColor Cyan
                            & bundle exec rubocop -a 2>&1 | Out-Null
                            Write-Host "   ✅ Fixes applied" -ForegroundColor Green
                        }
                    } else {
                        Write-Host "   ✅ No issues" -ForegroundColor Green
                        $results.Passed++
                    }
                } else {
                    Write-Host "   ⏭️  RuboCop not available (install via Bundler)" -ForegroundColor Gray
                    $results.Skipped++
                }
            }
        }
        
        # Summary
        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
        Write-Host "📊 QUALITY CHECK SUMMARY" -ForegroundColor Cyan
        Write-Host "   ✅ Passed: $($results.Passed)" -ForegroundColor Green
        Write-Host "   ❌ Failed: $($results.Failed)" -ForegroundColor $(if ($results.Failed -gt 0) {'Red'} else {'Green'})
        Write-Host "   ⏭️  Skipped: $($results.Skipped)" -ForegroundColor Gray
        
        if ($results.Details.Count -gt 0) {
            Write-Host "`n   Details:" -ForegroundColor Yellow
            $results.Details | ForEach-Object { Write-Host "    • $_" -ForegroundColor Gray }
        }
        
        Write-Host ""
        return ($results.Failed -eq 0)
        
    } finally {
        Pop-Location
    }
}

function global:Invoke-ComprehensiveStressTest {
    <#
    .SYNOPSIS
        Enhanced stress test with integrated linting/debugging for ALL project types
    .DESCRIPTION
        Creates test projects and validates them with:
        - Project creation verification
        - Language-specific linting (ruff, clippy, biome, go vet, etc.)
        - Formatting checks (rustfmt, gofmt, ruff format, biome format)
        - Cleanup tracking
        - Comprehensive logging with linter results
    .PARAMETER IncludeLinting
        Run linters on generated projects (recommended)
    .PARAMETER ApplyFixes
        Automatically fix linting issues
    .PARAMETER TestTypes
        Which project types to test (defaults to all)
    .EXAMPLE
        Invoke-ComprehensiveStressTest -IncludeLinting
        Invoke-ComprehensiveStressTest -IncludeLinting -ApplyFixes
    #>
    param(
        [switch]$IncludeLinting,
        [switch]$ApplyFixes,
        [string[]]$TestTypes = @('python','rust','bun','ruby','react','node','go')
    )
    
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $logDir = Join-Path $ClaudineTemp "stress_test"
    $logFile = Join-Path $logDir "comprehensive_test_$timestamp.log"
    $mdFile = Join-Path $logDir "comprehensive_test_$timestamp.md"
    
    # Ensure log directory exists
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    Write-Host "`n🎯 COMPREHENSIVE STRESS TEST WITH LINTING" -ForegroundColor Magenta
    Write-Host "   Timestamp: $timestamp" -ForegroundColor Gray
    Write-Host "   Log: $logFile" -ForegroundColor Gray
    Write-Host "   Report: $mdFile" -ForegroundColor Gray
    Write-Host "   Linting: $(if ($IncludeLinting) {'ENABLED'} else {'DISABLED'})" -ForegroundColor $(if ($IncludeLinting) {'Green'} else {'Yellow'})
    Write-Host ""
    
    $testResults = @()
    $lintResults = @()
    
    foreach ($type in $TestTypes) {
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
        Write-Host "🧪 Testing: $type" -ForegroundColor Cyan
        
        $testName = "test_$($type)_comprehensive"
        $startTime = Get-Date
        
        try {
            # Create project based on type
            $createResult = switch ($type) {
                'python' { new-python -Name $testName -Template basic }
                'rust' { new-rust -Name $testName }
                'bun' { new-bun -Name $testName -Template basic }
                'ruby' { new-ruby -Name $testName }
                'react' { new-react -Name $testName -Type basic -Yes }
                'node' { new-node -Name $testName }
                'go' { new-go -Name $testName }
            }
            
            $duration = (Get-Date) - $startTime
            $projectPath = Join-Path $ClaudineTemp "$type\$testName"
            
            if ($createResult -and (Test-Path $projectPath)) {
                Write-Host "✅ Project created successfully ($([math]::Round($duration.TotalSeconds, 2))s)" -ForegroundColor Green
                
                $testResults += @{
                    Type = $type
                    Status = 'PASSED'
                    Duration = $duration.TotalSeconds
                    Path = $projectPath
                }
                
                # Run linting if enabled
                if ($IncludeLinting) {
                    Write-Host "`n🔍 Running quality checks..." -ForegroundColor Cyan
                    $lintPassed = Test-ScriptQuality -ScriptPath $projectPath -Fix:$ApplyFixes
                    
                    $lintResults += @{
                        Type = $type
                        Passed = $lintPassed
                        Path = $projectPath
                    }
                }
            } else {
                Write-Host "❌ Project creation failed" -ForegroundColor Red
                $testResults += @{
                    Type = $type
                    Status = 'FAILED'
                    Duration = $duration.TotalSeconds
                    Path = $null
                }
            }
            
        } catch {
            Write-Host "❌ ERROR: $_" -ForegroundColor Red
            $testResults += @{
                Type = $type
                Status = 'ERROR'
                Duration = 0
                Path = $null
                Error = $_.Exception.Message
            }
        }
        
        Write-Host ""
    }
    
    # Generate comprehensive report
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "📊 FINAL RESULTS" -ForegroundColor Magenta
    
    $passed = ($testResults | Where-Object { $_.Status -eq 'PASSED' }).Count
    $failed = ($testResults | Where-Object { $_.Status -ne 'PASSED' }).Count
    
    Write-Host "   Project Creation: $passed/$($testResults.Count) PASSED" -ForegroundColor $(if ($passed -eq $testResults.Count) {'Green'} else {'Yellow'})
    
    if ($IncludeLinting) {
        $lintPassed = ($lintResults | Where-Object { $_.Passed }).Count
        Write-Host "   Linting Quality: $lintPassed/$($lintResults.Count) PASSED" -ForegroundColor $(if ($lintPassed -eq $lintResults.Count) {'Green'} else {'Yellow'})
    }
    
    # Write markdown report
    $mdContent = @"
# Comprehensive Stress Test Report
**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Test Configuration
- **Linting Enabled:** $(if ($IncludeLinting) {'✅ Yes'} else {'❌ No'})
- **Auto-Fix Enabled:** $(if ($ApplyFixes) {'✅ Yes'} else {'❌ No'})
- **Project Types:** $($TestTypes -join ', ')

## Project Creation Results
| Type | Status | Duration (s) | Path |
|------|--------|-------------|------|
$(foreach ($result in $testResults) {
    "| $($result.Type) | $($result.Status) | $([math]::Round($result.Duration, 2)) | ``$($result.Path)`` |"
})

**Summary:** $passed/$($testResults.Count) projects created successfully

"@

    if ($IncludeLinting) {
        $mdContent += @"

## Linting Quality Results
| Type | Status | Project Path |
|------|--------|--------------|
$(foreach ($result in $lintResults) {
    $status = if ($result.Passed) {'✅ PASSED'} else {'❌ FAILED'}
    "| $($result.Type) | $status | ``$($result.Path)`` |"
})

**Summary:** $lintPassed/$($lintResults.Count) projects passed quality checks

"@
    }
    
    $mdContent += @"

## Available Linters/Formatters
- 🐍 **Python:** Ruff (lint + format)
- 🦀 **Rust:** Clippy + Rustfmt
- 🥖 **TypeScript/JavaScript:** Biome
- 🐹 **Go:** go vet + gofmt
- 💎 **Ruby:** RuboCop (optional)
- 🔧 **PowerShell:** PSScriptAnalyzer (optional)

## Commands Used
\`\`\`powershell
# Stress test with linting
Invoke-ComprehensiveStressTest -IncludeLinting

# Stress test with auto-fix
Invoke-ComprehensiveStressTest -IncludeLinting -ApplyFixes

# Test specific project
Test-ScriptQuality -ScriptPath C:\...\Temp\python\myproject -Fix
\`\`\`

---
*Generated by Claudine Polyglot Environment v$ClaudineVersion*
"@
    
    Set-Content -Path $mdFile -Value $mdContent
    Set-Content -Path $logFile -Value ($testResults | ConvertTo-Json -Depth 3)
    
    Write-Host "`n✅ Reports generated:" -ForegroundColor Green
    Write-Host "   📄 $mdFile" -ForegroundColor Cyan
    Write-Host "   📄 $logFile" -ForegroundColor Cyan
    Write-Host ""
    
    return ($passed -eq $testResults.Count)
}

# CONVENIENCE ALIASES

function global:lint-claudine-scripts {
    <#
    .SYNOPSIS
        Lint all Claudine PowerShell scripts with PSScriptAnalyzer
    .DESCRIPTION
        Quickly validate claudineENV.ps1 and claudineENV_F.ps1 for quality issues
    .EXAMPLE
        lint-claudine-scripts
    #>
    Write-Host "`n🔍 LINTING CLAUDINE SCRIPTS" -ForegroundColor Cyan
    
    $scripts = @(
        (Join-Path $ClaudineRoot "claudineENV.ps1"),
        (Join-Path $ClaudineRoot "claudineENV_F.ps1")
    )
    
    $allPassed = $true
    
    foreach ($script in $scripts) {
        $scriptName = Split-Path $script -Leaf
        Write-Host "`n📄 Checking: $scriptName" -ForegroundColor Yellow
        
        if (-not (Test-Path $script)) {
            Write-Host "   ⚠️  File not found: $script" -ForegroundColor Yellow
            continue
        }
        
        # Check if PSScriptAnalyzer is available
        if (-not (Get-Module -ListAvailable -Name PSScriptAnalyzer)) {
            Write-Host "   ⚠️  PSScriptAnalyzer not installed - skipping PowerShell linting" -ForegroundColor Yellow
            Write-Host "   Install with: Install-Module -Name PSScriptAnalyzer -Force" -ForegroundColor Gray
            continue
        }
        
        try {
            Import-Module PSScriptAnalyzer -ErrorAction Stop
            $issues = Invoke-ScriptAnalyzer -Path $script -Severity Warning,Error
            
            if ($issues.Count -eq 0) {
                Write-Host "   ✅ No issues found" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Found $($issues.Count) issues:" -ForegroundColor Yellow
                $issues | Format-Table -Property Severity,RuleName,Line,Message -AutoSize | Out-String | Write-Host
                $allPassed = $false
            }
        } catch {
            Write-Host "   ❌ Error running PSScriptAnalyzer: $_" -ForegroundColor Red
            $allPassed = $false
        }
    }
    
    Write-Host "`n" + ("━" * 60) -ForegroundColor DarkGray
    if ($allPassed) {
        Write-Host "✅ All Claudine scripts passed linting!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some issues found - review above" -ForegroundColor Yellow
    }
    Write-Host ""
    
    return $allPassed
}

function global:lint-current-file {
    <#
    .SYNOPSIS
        Lint the currently open file in VS Code
    .DESCRIPTION
        Detects file type and runs appropriate linter
    .PARAMETER Path
        Path to file (defaults to current directory for project-level linting)
    .EXAMPLE
        lint-current-file -Path C:\path\to\file.py
    #>
    param([string]$Path = $PWD.Path)
    
    Test-ScriptQuality -ScriptPath $Path
}

function global:uvrun {
    param([Parameter(ValueFromRemainingArguments=$true)][string[]]$args)
    & uv run --quiet @args
}

function global:cargofast {
    param([Parameter(ValueFromRemainingArguments=$true)][string[]]$args)
    & cargo build --release @args
}

function global:bunts {
    param([Parameter(ValueFromRemainingArguments=$true)][string[]]$args)
    & bun @args
}

# HELP

function global:list-claudine {
    Write-Host "`n💋 Claudine $ClaudineVersion - Available Functions" -ForegroundColor Magenta
    
    Write-Host "`n   PROJECT CREATORS:" -ForegroundColor White
    Write-Host "  new-python              " -NoNewline -ForegroundColor Cyan
    Write-Host "Create Python project (templates: basic, web, cli, data)" -ForegroundColor Gray
    Write-Host "  new-rust                " -NoNewline -ForegroundColor Cyan
    Write-Host "Create Rust project (binary or --Lib for library)" -ForegroundColor Gray
    Write-Host "  new-bun                 " -NoNewline -ForegroundColor Cyan
    Write-Host "Create Bun/TypeScript project (templates: basic, api, web, cli)" -ForegroundColor Gray
    Write-Host "  new-ruby                " -NoNewline -ForegroundColor Cyan
    Write-Host "Create Ruby gem with bundler" -ForegroundColor Gray
    Write-Host "  new-react               " -NoNewline -ForegroundColor Cyan
    Write-Host "Create React project (basic, tailwind, shadcn, next)" -ForegroundColor Gray
    Write-Host "  new-node                " -NoNewline -ForegroundColor Cyan
    Write-Host "Create Node.js project with Bun runtime" -ForegroundColor Gray
    Write-Host "  new-go                  " -NoNewline -ForegroundColor Cyan
    Write-Host "Create Go module (e.g., new-go -Name myapp)" -ForegroundColor Gray
    
    Write-Host "`n   DIAGNOSTICS:" -ForegroundColor White
    Write-Host "  health-check            " -NoNewline -ForegroundColor Yellow
    Write-Host "Verify all 14 tools are working (use -Detailed)" -ForegroundColor Gray
    Write-Host "  show-versions           " -NoNewline -ForegroundColor Yellow
    Write-Host "Display versions of all installed tools" -ForegroundColor Gray
    Write-Host "  claudine-metrics        " -NoNewline -ForegroundColor Yellow
    Write-Host "Show environment metrics and PATH analysis" -ForegroundColor Gray
    
    Write-Host "`n   LINTING & DEBUGGING:" -ForegroundColor White
    Write-Host "  Test-ScriptQuality      " -NoNewline -ForegroundColor Magenta
    Write-Host "Lint any project (Python/Rust/Go/TS/JS/Ruby/PS1)" -ForegroundColor Gray
    Write-Host "  Invoke-ComprehensiveStressTest" -NoNewline -ForegroundColor Magenta
    Write-Host " Test all project types with linting" -ForegroundColor Gray
    Write-Host "  lint-claudine-scripts   " -NoNewline -ForegroundColor Magenta
    Write-Host "Lint claudineENV.ps1 + claudineENV_F.ps1" -ForegroundColor Gray
    Write-Host "  lint-current-file       " -NoNewline -ForegroundColor Magenta
    Write-Host "Lint current working file/project" -ForegroundColor Gray
    
    Write-Host "`n   BUN CONVENIENCE:" -ForegroundColor White
    Write-Host "  bundev                  " -NoNewline -ForegroundColor Green
    Write-Host "Start dev server with React Fast Refresh (bun --hot)" -ForegroundColor Gray
    Write-Host "  bunbuild                " -NoNewline -ForegroundColor Green
    Write-Host "Build production bundle with Bun's native bundler" -ForegroundColor Gray
    Write-Host "  buntest                 " -NoNewline -ForegroundColor Green
    Write-Host "Run tests with Bun's native test runner" -ForegroundColor Gray
    Write-Host "  bunts                   " -NoNewline -ForegroundColor Green
    Write-Host "General Bun TypeScript runner" -ForegroundColor Gray
    
    Write-Host "`n   ADVANCED:" -ForegroundColor White
    Write-Host "  clean-poly              " -NoNewline -ForegroundColor Magenta
    Write-Host "Clean UV cache, remove test projects (-All, -TestDir)" -ForegroundColor Gray
    Write-Host "  use-msys2               " -NoNewline -ForegroundColor Magenta
    Write-Host "Switch MSYS2 personality (ucrt64, mingw64, clang64)" -ForegroundColor Gray
    Write-Host "  uvrun                   " -NoNewline -ForegroundColor Magenta
    Write-Host "UV run with --quiet flag" -ForegroundColor Gray
    Write-Host "  cargofast               " -NoNewline -ForegroundColor Magenta
    Write-Host "Cargo build --release (optimized binary)" -ForegroundColor Gray
    
    Write-Host "`n📚 Total: 22 functions" -ForegroundColor Yellow
    Write-Host "💡 Type function name + '-?' for detailed help (e.g., new-python -?)" -ForegroundColor Gray
    
    Write-Host "`n🔍 Quick Examples:" -ForegroundColor Cyan
    Write-Host "   new-python -Name myapi -Template web    # Create FastAPI project" -ForegroundColor Gray
    Write-Host "   new-rust -Name mylib --Lib              # Create Rust library" -ForegroundColor Gray
    Write-Host "   health-check -Detailed                  # Full system check" -ForegroundColor Gray
    Write-Host "   Test-ScriptQuality -ScriptPath . -Fix   # Lint & auto-fix current project" -ForegroundColor Gray
    Write-Host "   clean-poly -All                         # Remove all test projects`n" -ForegroundColor Gray
}

Set-Alias -Name claudine -Value list-claudine
Set-Alias -Name py -Value new-python
Set-Alias -Name rs -Value new-rust

