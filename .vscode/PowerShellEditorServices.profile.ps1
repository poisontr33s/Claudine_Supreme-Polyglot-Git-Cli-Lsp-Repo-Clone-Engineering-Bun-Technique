# ═══════════════════════════════════════════════════════════════════════════════
# POWERSHELL EDITOR SERVICES PROFILE
# ═══════════════════════════════════════════════════════════════════════════════
# This profile is loaded by the PowerShell Extension Host (which runs with -NoProfile)
# File: .vscode/PowerShellEditorServices.profile.ps1
# Purpose: Auto-activate claudineENV.ps1 in Extension Host terminal
#
# The PowerShell Extension looks for this file at:
# 1. $PSScriptRoot/PowerShellEditorServices.profile.ps1 (workspace .vscode folder)
# 2. ~/.config/powershell/PowerShellEditorServices.profile.ps1 (global config)
#
# This allows us to bypass the -NoProfile flag limitation!
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

# Detect workspace root (PowerShell Extension sets $psEditor.Workspace.Path)
$workspaceRoot = if ($psEditor -and $psEditor.Workspace -and $psEditor.Workspace.Path) {
    $psEditor.Workspace.Path
} else {
    # Fallback: use current directory
    $PWD.Path
}

# Claudine environment paths
$claudineWorkspace = "C:\Users\eldno\PsychoNoir-Kontrapunkt"
$claudineEnvScript = Join-Path $claudineWorkspace "scripts\claudineENV.ps1"
$claudineFunctionsScript = Join-Path $claudineWorkspace "scripts\claudineENV_F.ps1"

# Only activate if we're in the Claudine workspace
if (($workspaceRoot -like "$claudineWorkspace*") -and (Test-Path $claudineEnvScript)) {
    
    # Check if already activated (avoid double-activation)
    if (-not $env:CLAUDINE_ACTIVATED) {
        try {
            Write-Host "🔥💋 Activating Claudine polyglot environment in Extension Host..." -ForegroundColor Magenta
            
            # Activate environment (quiet mode for Extension Host)
            . $claudineEnvScript -Quiet
            
            # Optionally load functions library (commented out for performance)
            # Uncomment the line below if you want functions available in Extension Host:
            # . $claudineFunctionsScript
            
            Write-Host "✅ Claudine environment activated in Extension Host" -ForegroundColor Green
            Write-Host "   💡 To load functions: . .\.poly_gluttony\claudineENV_F.ps1" -ForegroundColor Cyan
            
        } catch {
            Write-Warning "Failed to activate Claudine environment: $_"
        }
    } else {
        Write-Host "✅ Claudine environment already activated (source: $env:CLAUDINE_ACTIVATED)" -ForegroundColor Green
    }
} else {
    # Not in Claudine workspace, skip activation
    if ($workspaceRoot -notlike "$claudineWorkspace*") {
        Write-Verbose "PowerShell Extension Host: Not in Claudine workspace, skipping activation"
    } elseif (-not (Test-Path $claudineEnvScript)) {
        Write-Warning "PowerShell Extension Host: claudineENV.ps1 not found at: $claudineEnvScript"
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# EXTENSION HOST CUSTOMIZATIONS
# ═══════════════════════════════════════════════════════════════════════════════

# Custom prompt for Extension Host (optional)
# function prompt {
#     "🔥💋 PS> "
# }

# Helper function for quick environment info
function global:claudine-status {
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  🔥💋 CLAUDINE EXTENSION HOST STATUS 💋🔥                   ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`n📍 Context:" -ForegroundColor Yellow
    Write-Host "   Terminal Type: PowerShell Extension Host" -ForegroundColor White
    Write-Host "   Workspace: $workspaceRoot" -ForegroundColor Gray
    
    Write-Host "`n🔧 Environment:" -ForegroundColor Yellow
    if ($env:CLAUDINE_ACTIVATED) {
        Write-Host "   ✅ Activated: $env:CLAUDINE_ACTIVATED" -ForegroundColor Green
        Write-Host "   📦 Version: $env:CLAUDINE_VERSION" -ForegroundColor Gray
        Write-Host "   📂 Root: $env:CLAUDINE_ROOT" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Not Activated" -ForegroundColor Red
    }
    
    Write-Host "`n📦 Quick Tools Check:" -ForegroundColor Yellow
    $tools = @("python", "uv", "cargo", "bun", "go", "gopls")
    foreach ($tool in $tools) {
        $available = Get-Command $tool -ErrorAction SilentlyContinue
        $status = if ($available) { "✅" } else { "❌" }
        Write-Host "   $status $tool" -ForegroundColor $(if ($available) { "Green" } else { "Red" })
    }
    
    Write-Host "`n💡 Quick Commands:" -ForegroundColor Yellow
    Write-Host "   claudine-status       Show this status" -ForegroundColor Cyan
    Write-Host "   claudine-functions    Load full functions library" -ForegroundColor Cyan
    Write-Host "   . .\.poly_gluttony\claudineENV_F.ps1" -ForegroundColor Gray
    Write-Host ""
}

# Helper to load functions on-demand
function global:claudine-functions {
    if (Test-Path $claudineFunctionsScript) {
        Write-Host "📦 Loading claudineENV_F.ps1 functions library..." -ForegroundColor Cyan
        . $claudineFunctionsScript
        Write-Host "✅ Functions loaded!" -ForegroundColor Green
    } else {
        Write-Warning "Functions script not found: $claudineFunctionsScript"
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# WELCOME MESSAGE
# ═══════════════════════════════════════════════════════════════════════════════

if ($env:CLAUDINE_ACTIVATED -and $workspaceRoot -like "$claudineWorkspace*") {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "💡 Extension Host Commands:" -ForegroundColor Cyan
    Write-Host "   claudine-status       📊 Show environment status" -ForegroundColor White
    Write-Host "   claudine-functions    🔧 Load functions library" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""
}
