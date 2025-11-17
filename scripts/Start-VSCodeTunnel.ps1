<#
.SYNOPSIS
    🔥💀⚓ VS Code Remote Tunnel - Secure Access to Local Machine

.DESCRIPTION
    Creates a secure VS Code tunnel allowing remote access to this laptop from anywhere.
    Uses Microsoft's official vscode.dev tunnel service with GitHub authentication.

.PARAMETER Name
    Custom machine name for the tunnel (optional - generates random name if not provided)

.PARAMETER AcceptLicense
    Automatically accept the VS Code Server license terms

.PARAMETER NoSleep
    Prevent the machine from sleeping while tunnel is active

.PARAMETER Status
    Check current tunnel status instead of starting

.PARAMETER Kill
    Stop any running tunnel

.EXAMPLE
    .\Start-VSCodeTunnel.ps1
    # Start tunnel with random name

.EXAMPLE
    .\Start-VSCodeTunnel.ps1 -Name "claudine-supreme-laptop"
    # Start tunnel with custom name

.EXAMPLE
    .\Start-VSCodeTunnel.ps1 -Status
    # Check tunnel status

.EXAMPLE
    .\Start-VSCodeTunnel.ps1 -Kill
    # Stop running tunnel
#>

[CmdletBinding()]
param(
    [Parameter()]
    [string]$Name,

    [Parameter()]
    [switch]$AcceptLicense,

    [Parameter()]
    [switch]$NoSleep,

    [Parameter()]
    [switch]$Status,

    [Parameter()]
    [switch]$Kill
)

# Find VS Code installation
$CodePaths = @(
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
    "$env:ProgramFiles\Microsoft VS Code\bin\code.cmd",
    "${env:ProgramFiles(x86)}\Microsoft VS Code\bin\code.cmd"
)

$CodeCmd = $CodePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $CodeCmd) {
    Write-Error "❌ VS Code not found. Please install VS Code first: https://code.visualstudio.com/"
    exit 1
}

Write-Host "🔥💀⚓ " -NoNewline -ForegroundColor Red
Write-Host "VS Code Remote Tunnel Manager" -ForegroundColor Cyan
Write-Host ""

# Handle status check
if ($Status) {
    Write-Host "📊 Checking tunnel status..." -ForegroundColor Yellow
    & $CodeCmd tunnel status
    exit $LASTEXITCODE
}

# Handle kill command
if ($Kill) {
    Write-Host "🛑 Stopping tunnel..." -ForegroundColor Yellow
    & $CodeCmd tunnel kill
    exit $LASTEXITCODE
}

# Build tunnel start command
$TunnelArgs = @('tunnel')

if ($Name) {
    $TunnelArgs += '--name', $Name
    Write-Host "🏷️  Machine Name: $Name" -ForegroundColor Green
} else {
    $TunnelArgs += '--random-name'
    Write-Host "🎲 Using random machine name" -ForegroundColor Cyan
}

if ($AcceptLicense) {
    $TunnelArgs += '--accept-server-license-terms'
}

if ($NoSleep) {
    $TunnelArgs += '--no-sleep'
    Write-Host "⚡ Sleep prevention enabled" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting VS Code Tunnel..." -ForegroundColor Green
Write-Host ""
Write-Host "📝 You will be prompted to:" -ForegroundColor Cyan
Write-Host "   1. Sign in with GitHub (opens browser)" -ForegroundColor White
Write-Host "   2. Authorize VS Code Tunnel service" -ForegroundColor White
Write-Host ""
Write-Host "🌐 After authentication, you can access this machine from:" -ForegroundColor Yellow
Write-Host "   - https://vscode.dev/" -ForegroundColor White
Write-Host "   - Or any VS Code instance with 'Remote - Tunnels' extension" -ForegroundColor White
Write-Host ""
Write-Host "⏹️  Press Ctrl+C to stop the tunnel" -ForegroundColor Red
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""

# Start tunnel
& $CodeCmd @TunnelArgs
