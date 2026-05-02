#!/usr/bin/env pwsh
# @SID: release-local.ps1
# Local equivalent of .github/workflows/release.yml
# Bun cross-compiles all 6 platforms from this machine — no GitHub runners needed.
#
# Usage:
#   .\scripts\release-local.ps1                     # build all 6 platforms, version from package.json
#   .\scripts\release-local.ps1 -Version 2.1.0      # override version label
#   .\scripts\release-local.ps1 -Platform win        # only Windows targets (win-x64, win-arm64)
#   .\scripts\release-local.ps1 -Platform linux      # only Linux targets
#   .\scripts\release-local.ps1 -Platform macos      # only macOS targets
#   .\scripts\release-local.ps1 -SkipTests           # skip the validate/test step
#   .\scripts\release-local.ps1 -NoPackage           # compile only, skip zip/tar.gz packaging
#
# Outputs:
#   claudine-cli/dist/claudine-<platform>[.exe]      native executables
#   claudine-cli/release/claudine-<platform>.zip     packaged archives (ready for GitHub Release upload)
#
# Exit codes: 0 = all passed | 1 = one or more builds failed

param(
    [string]$Version   = "",
    [ValidateSet("all","win","linux","macos")] [string]$Platform = "all",
    [switch]$SkipTests,
    [switch]$NoPackage
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── colours ──────────────────────────────────────────────────────────────────
function Write-Step  { param($msg) Write-Host "`n◆ $msg" -ForegroundColor Cyan }
function Write-Pass  { param($msg) Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Fail  { param($msg) Write-Host "  ✗ $msg" -ForegroundColor Red }
function Write-Info  { param($msg) Write-Host "  · $msg" -ForegroundColor DarkGray }
function Write-Head  { param($msg) Write-Host "`n  $msg" -ForegroundColor Yellow }

# ── locate claudine-cli ───────────────────────────────────────────────────────
$repoRoot = Split-Path $PSScriptRoot -Parent
$cliDir   = Join-Path $repoRoot "claudine-cli"
$distDir  = Join-Path $cliDir "dist"
$releaseDir = Join-Path $cliDir "release"

if (-not (Test-Path $cliDir)) {
    Write-Fail "claudine-cli/ not found at $cliDir"; exit 1
}

# ── read version from package.json if not provided ────────────────────────────
if (-not $Version) {
    $pkg     = Get-Content (Join-Path $cliDir "package.json") -Raw | ConvertFrom-Json
    $Version = $pkg.version
}
Write-Host "`n🚀 release-local — building Claudine CLI v$Version" -ForegroundColor Magenta
Write-Info "Platform filter : $Platform"
Write-Info "Output          : $distDir"

# ── platform matrix (mirrors release.yml exactly) ────────────────────────────
$allTargets = @(
    @{ Name = "windows-x64";  BunTarget = "bun-windows-x64";  Ext = ".exe"; Group = "win"   }
    @{ Name = "windows-arm64"; BunTarget = "bun-windows-arm64"; Ext = ".exe"; Group = "win"  }
    @{ Name = "linux-x64";    BunTarget = "bun-linux-x64";    Ext = "";     Group = "linux" }
    @{ Name = "linux-arm64";  BunTarget = "bun-linux-arm64";  Ext = "";     Group = "linux" }
    @{ Name = "darwin-x64";   BunTarget = "bun-darwin-x64";   Ext = "";     Group = "macos" }
    @{ Name = "darwin-arm64"; BunTarget = "bun-darwin-arm64"; Ext = "";     Group = "macos" }
)

$targets = if ($Platform -eq "all") {
    $allTargets
} else {
    $allTargets | Where-Object { $_.Group -eq $Platform }
}

# ── timing helper ─────────────────────────────────────────────────────────────
$script:results = [System.Collections.Generic.List[hashtable]]::new()

function Invoke-Step {
    param([string]$Name, [scriptblock]$Block)
    Write-Step $Name
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $ok = $true
    try {
        & $Block
        if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { $ok = $false }
    } catch {
        Write-Fail $_.Exception.Message; $ok = $false
    }
    $sw.Stop()
    $elapsed = "{0:0.0}s" -f $sw.Elapsed.TotalSeconds
    $script:results.Add(@{ Name = $Name; Pass = $ok; Elapsed = $elapsed })
    if ($ok) { Write-Pass "done in $elapsed" } else { Write-Fail "FAILED in $elapsed" }
    return $ok
}

$allPass = $true
$total = [System.Diagnostics.Stopwatch]::StartNew()

Push-Location $cliDir

# ── STEP 1: validate (install + test + version check) ────────────────────────
$allPass = (Invoke-Step "Install dependencies" {
    bun install --frozen-lockfile
}) -and $allPass

if (-not $SkipTests) {
    $allPass = (Invoke-Step "Validate: typecheck" {
        bunx tsc --noEmit
    }) -and $allPass

    $allPass = (Invoke-Step "Validate: test suite" {
        bun test
    }) -and $allPass
}

# ── STEP 2: cross-compile all targets ────────────────────────────────────────
$null = New-Item -ItemType Directory -Force -Path $distDir
$null = New-Item -ItemType Directory -Force -Path $releaseDir

Write-Head "Compiling $($targets.Count) platform(s) — Bun cross-compilation, no runners needed"

foreach ($t in $targets) {
    $outName = "claudine-$($t.Name)$($t.Ext)"
    $outPath = Join-Path $distDir $outName

    $allPass = (Invoke-Step "Compile: $($t.Name)" {
        bun build src/cli.ts --compile `
            --target=$($t.BunTarget) `
            --outfile=$outPath
    }) -and $allPass

    if ($allPass -and -not $NoPackage -and (Test-Path $outPath)) {
        # Package into .zip (Compress-Archive handles cross-platform binaries fine)
        $zipName = "claudine-$($t.Name).zip"
        $zipPath = Join-Path $releaseDir $zipName
        Invoke-Step "Package: $zipName" {
            if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
            Compress-Archive -Path $outPath -DestinationPath $zipPath -CompressionLevel Optimal
            $size = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
            Write-Info "$zipName  ($size MB)"
        } | Out-Null
    }
}

Pop-Location
$total.Stop()

# ── summary ──────────────────────────────────────────────────────────────────
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  RELEASE-LOCAL RESULTS — v$Version  ($("{0:0.1}s" -f $total.Elapsed.TotalSeconds) total)" -ForegroundColor White

foreach ($r in $script:results) {
    $icon  = if ($r.Pass) { "✓" } else { "✗" }
    $color = if ($r.Pass) { "Green" } else { "Red" }
    Write-Host ("  $icon {0,-42} {1}" -f $r.Name, $r.Elapsed) -ForegroundColor $color
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if (-not $NoPackage -and $allPass) {
    Write-Host "`n  📦 Packaged archives:" -ForegroundColor Yellow
    Get-ChildItem $releaseDir -Filter "*.zip" | Sort-Object Name | ForEach-Object {
        $sz = [math]::Round($_.Length / 1MB, 2)
        Write-Host "     $($_.Name.PadRight(40)) $sz MB" -ForegroundColor DarkGray
    }
}

if ($allPass) {
    Write-Host "`n  ✅ RELEASE BUILD COMPLETE`n" -ForegroundColor Green
    Write-Host "  Next steps:" -ForegroundColor DarkGray
    Write-Host "    git tag v$Version && git push origin v$Version" -ForegroundColor DarkGray
    Write-Host "    # — triggers the GitHub release pipeline (npm publish + GitHub Release)" -ForegroundColor DarkGray
    Write-Host "    # — or skip GitHub entirely and distribute the archives from release/ directly`n" -ForegroundColor DarkGray
    exit 0
} else {
    $failed = ($script:results | Where-Object { -not $_.Pass } | ForEach-Object { $_.Name }) -join ", "
    Write-Host "`n  ❌ FAILED: $failed`n" -ForegroundColor Red
    exit 1
}
