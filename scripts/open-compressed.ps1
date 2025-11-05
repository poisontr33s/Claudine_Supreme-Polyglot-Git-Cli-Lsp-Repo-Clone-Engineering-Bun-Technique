#!/usr/bin/env pwsh
<#
.SYNOPSIS
🔥💀⚓ CLAUDINE ZSTD VIEWER - Universal Handler

.DESCRIPTION
Universal handler for .zst files in VS Code.
- Detects Claudine dictionary format vs standard ZSTD
- Falls back to 7-Zip for standard formats
- Uses Python viewer for Claudine dictionary files

.PARAMETER FilePath
Path to the compressed file

.PARAMETER Action
Action to perform: info, view, extract

.EXAMPLE
pwsh .vscode/scripts/open-compressed.ps1 "file.json.zst" -Action info
pwsh .vscode/scripts/open-compressed.ps1 "file.json.zst" -Action extract
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("info", "view", "extract")]
    [string]$Action = "info"
)

$ErrorActionPreference = "Stop"

Write-Host "🔥💀⚓ CLAUDINE COMPRESSED FILE HANDLER" -ForegroundColor Cyan
Write-Host ""

# Check if file exists
if (-not (Test-Path $FilePath)) {
    Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
    exit 1
}

# Get file extension
$extension = [System.IO.Path]::GetExtension($FilePath).ToLower()

# Check if it's a Claudine dictionary ZSTD file (first 4 bytes = dict size)
$isClaudineDictFormat = $false
if ($extension -eq ".zst") {
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    if ($bytes.Length -ge 4) {
        $dictSize = [BitConverter]::ToUInt32($bytes, 0)
        # Claudine dict sizes: 32KB, 64KB, 128KB
        if ($dictSize -in @(32768, 65536, 131072)) {
            $isClaudineDictFormat = $true
            Write-Host "📖 Detected: Claudine Dictionary ZSTD (dict size: $dictSize bytes)" -ForegroundColor Yellow
        }
    }
}

if ($isClaudineDictFormat) {
    # Use Python viewer for Claudine format
    $scriptDir = $PSScriptRoot
    $workspaceRoot = Resolve-Path (Join-Path $scriptDir "..\..")
    $uvPath = Join-Path $workspaceRoot ".poly_gluttony\uv\bin\uv.exe"
    $viewerPath = Join-Path $workspaceRoot ".github\ZSTD_JSON_VIEWER_NSFW18_+++.py"
    
    if (-not (Test-Path $uvPath)) {
        Write-Host "❌ UV not found at: $uvPath" -ForegroundColor Red
        exit 1
    }
    
    switch ($Action) {
        "info" {
            & $uvPath run $viewerPath $FilePath --info
        }
        "view" {
            & $uvPath run $viewerPath $FilePath
        }
        "extract" {
            $outputPath = $FilePath -replace '\.zst$', ''
            Write-Host "💾 Extracting to: $outputPath" -ForegroundColor Green
            & $uvPath run $viewerPath $FilePath --save $outputPath
            
            # Offer to open
            $open = Read-Host "`nOpen extracted file in VS Code? (y/N)"
            if ($open -eq 'y' -or $open -eq 'Y') {
                & code $outputPath
            }
        }
    }
} else {
    # Use 7-Zip for standard compressed files
    $scriptDir = $PSScriptRoot
    $workspaceRoot = Resolve-Path (Join-Path $scriptDir "..\..")
    $7zipPath = Join-Path $workspaceRoot ".poly_gluttony\tools\7zip\7z.exe"
    
    if (-not (Test-Path $7zipPath)) {
        Write-Host "❌ 7-Zip not found. Installing..." -ForegroundColor Red
        & pwsh (Join-Path $PSScriptRoot "..\..\..\.poly_gluttony\scripts\install-7zip.ps1")
    }
    
    Write-Host "📦 Using 7-Zip for standard compressed file" -ForegroundColor Yellow
    Write-Host ""
    
    switch ($Action) {
        "info" {
            & $7zipPath l $FilePath
        }
        "view" {
            Write-Host "💡 7-Zip cannot view compressed files directly." -ForegroundColor Gray
            Write-Host "   Use 'extract' action to decompress first." -ForegroundColor Gray
        }
        "extract" {
            $outputDir = [System.IO.Path]::GetDirectoryName($FilePath)
            Write-Host "💾 Extracting to: $outputDir" -ForegroundColor Green
            & $7zipPath x $FilePath "-o$outputDir" -y
        }
    }
}

Write-Host ""
