#!/usr/bin/env pwsh
# @SID: ci-local.ps1
# Local equivalent of .github/workflows/test.yml
# Runs the full CI gate on this machine — no GitHub required.
#
# Usage:
#   .\scripts\ci-local.ps1               # full pipeline (typecheck + lint + test + build)
#   .\scripts\ci-local.ps1 -SkipBuild    # skip the prod build step (faster)
#   .\scripts\ci-local.ps1 -Coverage     # emit coverage report after tests
#   .\scripts\ci-local.ps1 -Watch        # run tests in watch mode (infinite loop)
#
# Exit codes: 0 = all passed | 1 = one or more steps failed

param(
    [switch]$SkipBuild,
    [switch]$Coverage,
    [switch]$Watch,
    [switch]$NoInstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── colours ──────────────────────────────────────────────────────────────────
function Write-Step  { param($msg) Write-Host "`n◆ $msg" -ForegroundColor Cyan }
function Write-Pass  { param($msg) Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Fail  { param($msg) Write-Host "  ✗ $msg" -ForegroundColor Red }
function Write-Warn  { param($msg) Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Write-Info  { param($msg) Write-Host "  · $msg" -ForegroundColor DarkGray }

# ── timing helper ─────────────────────────────────────────────────────────────
$script:steps = [System.Collections.Generic.List[hashtable]]::new()

function Invoke-Step {
    param([string]$Name, [scriptblock]$Block)
    Write-Step $Name
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $ok = $true
    try {
        & $Block
        if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { $ok = $false }
    } catch {
        Write-Fail $_.Exception.Message
        $ok = $false
    }
    $sw.Stop()
    $elapsed = "{0:0.0}s" -f $sw.Elapsed.TotalSeconds
    $script:steps.Add(@{ Name = $Name; Pass = $ok; Elapsed = $elapsed })
    if ($ok) { Write-Pass "done in $elapsed" }
    else     { Write-Fail "FAILED in $elapsed" }
    return $ok
}

# ── locate claudine-cli ───────────────────────────────────────────────────────
$repoRoot = Split-Path $PSScriptRoot -Parent
$cliDir   = Join-Path $repoRoot "claudine-cli"

if (-not (Test-Path $cliDir)) {
    Write-Fail "claudine-cli/ not found at $cliDir"
    exit 1
}

Push-Location $cliDir
$total = [System.Diagnostics.Stopwatch]::StartNew()

# ── pipeline ─────────────────────────────────────────────────────────────────
$allPass = $true

if (-not $NoInstall) {
    $allPass = (Invoke-Step "Install dependencies" {
        bun install --frozen-lockfile
    }) -and $allPass
}

$allPass = (Invoke-Step "Typecheck" {
    bunx tsc --noEmit
}) -and $allPass

$allPass = (Invoke-Step "Lint (Biome)" {
    bun run lint
}) -and $allPass

if ($Watch) {
    Invoke-Step "Tests (watch mode — Ctrl+C to exit)" {
        bun test --watch
    }
    Pop-Location
    exit 0
}

$testCmd = if ($Coverage) { "bun test --coverage" } else { "bun test" }
$allPass = (Invoke-Step "Tests$(if($Coverage){' + coverage'})" {
    Invoke-Expression $testCmd
}) -and $allPass

if (-not $SkipBuild) {
    $allPass = (Invoke-Step "Build (prod bundle → dist/claudine.js)" {
        bun run build:prod
    }) -and $allPass
}

Pop-Location
$total.Stop()

# ── summary ──────────────────────────────────────────────────────────────────
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  CI-LOCAL RESULTS  ($("{0:0.0}s" -f $total.Elapsed.TotalSeconds) total)" -ForegroundColor White

foreach ($s in $script:steps) {
    $icon  = if ($s.Pass) { "✓" } else { "✗" }
    $color = if ($s.Pass) { "Green" } else { "Red" }
    $pad   = $s.Name.PadRight(38)
    Write-Host "  $icon $pad $($s.Elapsed)" -ForegroundColor $color
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if ($allPass) {
    Write-Host "`n  ✅ ALL PASSED — clean push anytime`n" -ForegroundColor Green
    exit 0
} else {
    $failed = ($script:steps | Where-Object { -not $_.Pass } | ForEach-Object { $_.Name }) -join ", "
    Write-Host "`n  ❌ FAILED: $failed`n" -ForegroundColor Red
    exit 1
}
