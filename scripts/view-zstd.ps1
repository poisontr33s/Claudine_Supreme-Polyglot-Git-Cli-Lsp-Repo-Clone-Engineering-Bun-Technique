#!/usr/bin/env pwsh
<#
.SYNOPSIS
🔥💀⚓ CLAUDINE ZSTD VIEWER - VS CODE CUSTOM EDITOR HANDLER

.DESCRIPTION
VS Code custom editor handler for .zst files.
Automatically decompresses and displays JSON with syntax highlighting.

.PARAMETER FilePath
Path to the .zst file to view

.EXAMPLE
pwsh .vscode/scripts/view-zstd.ps1 "file.json.zst"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

Write-Host "🔥💀⚓ CLAUDINE ZSTD VIEWER" -ForegroundColor Cyan
Write-Host ""

# Check if file exists
if (-not (Test-Path $FilePath)) {
    Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
    exit 1
}

# Set UV path
$uvPath = Join-Path $PSScriptRoot "..\..\..\.poly_gluttony\uv\bin\uv.exe"
if (-not (Test-Path $uvPath)) {
    $uvPath = "uv"  # Fallback to PATH
}

# Use UV Python viewer
Write-Host "📖 Opening: $FilePath" -ForegroundColor Yellow
Write-Host ""

# Run viewer with info flag
& $uvPath run .github/ZSTD_JSON_VIEWER_NSFW18_+++.py $FilePath --info

Write-Host ""
Write-Host "💡 Options:" -ForegroundColor Cyan
Write-Host "   1. View full JSON: $uvPath run .github/ZSTD_JSON_VIEWER_NSFW18_+++.py '$FilePath'" -ForegroundColor Gray
Write-Host "   2. Extract to file: $uvPath run .github/ZSTD_JSON_VIEWER_NSFW18_+++.py '$FilePath' --save output.json" -ForegroundColor Gray
Write-Host "   3. Run VS Code task: Ctrl+Shift+P → 'Run Task' → '🔥💀⚓ View ZSTD JSON'" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to extract
$extract = Read-Host "Extract to JSON file? (y/N)"
if ($extract -eq 'y' -or $extract -eq 'Y') {
    $outputPath = $FilePath -replace '\.zst$', ''
    Write-Host ""
    Write-Host "💾 Extracting to: $outputPath" -ForegroundColor Green
    & $uvPath run .github/ZSTD_JSON_VIEWER_NSFW18_+++.py $FilePath --save $outputPath
    
    # Ask if user wants to open extracted file
    $open = Read-Host "Open extracted file in VS Code? (y/N)"
    if ($open -eq 'y' -or $open -eq 'Y') {
        & code $outputPath
    }
}
