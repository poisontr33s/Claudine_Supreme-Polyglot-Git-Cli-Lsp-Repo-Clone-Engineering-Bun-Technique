<#
.SYNOPSIS
    Migration Script: Transition from .poly_gluttony/ to scripts/ folder
.DESCRIPTION
    Automates the consolidation of Claudine Polyglot Goddess CLI codebase:
    - Verifies PowerShell profile updates
    - Verifies VS Code configuration updates
    - Creates symlinks for backward compatibility
    - Archives deprecated scripts
    - Generates comprehensive migration report
.PARAMETER DryRun
    Preview changes without making modifications
.PARAMETER SkipSymlinks
    Don't create symlinks in .poly_gluttony/
.PARAMETER SkipArchive
    Don't archive deprecated scripts
.EXAMPLE
    .\Migrate-To-Scripts-Folder.ps1
    # Full migration with all steps
.EXAMPLE
    .\Migrate-To-Scripts-Folder.ps1 -DryRun
    # Preview changes without executing
.NOTES
    Version: 1.0.0
    Author: Autonomous Claudine Session (ASC Framework)
    Created: 2025-01-15 (Nighttime Autonomous Operation)
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$SkipSymlinks,
    [switch]$SkipArchive
)

$ErrorActionPreference = "Stop"

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

$workspaceRoot = "C:\Users\erdno\PsychoNoir-Kontrapunkt"
$scriptsFolder = Join-Path $workspaceRoot "scripts"
$polyGluttonyFolder = Join-Path $workspaceRoot ".poly_gluttony"
$archiveFolder = Join-Path $polyGluttonyFolder "archive"

# Canonical scripts that should exist in scripts/
$canonicalScripts = @(
    "claudineENV.ps1"
    "claudineENV_F.ps1"
    "claudine_pwsh_goddess.ps1"
    "Setup-ClaudineProfile.ps1"
    "open-compressed.ps1"
    "view-zstd.ps1"
)

# Scripts to keep in .poly_gluttony/ (utilities)
$utilityScripts = @(
    "cleanup_environment.ps1"
    "health_check.ps1"
    "setup_go_environment.ps1"
    "enhanced_polyglot_lsp_extension_setup.ps1"
)

# Deprecated script patterns (will be archived)
$deprecatedPatterns = @(
    "activate_polyglot*.ps1"
    "INJECT_ENV*.ps1"
    "META_AUTONOMOUS*.ps1"
    "SUPREME_META*.ps1"
    "UNIFIED_META*.ps1"
    "*NSFW18_+++*.ps1"
)

# PowerShell profile paths
$profiles = @{
    'Microsoft.PowerShell' = Join-Path $env:USERPROFILE "Documents\PowerShell\Microsoft.PowerShell_profile.ps1"
    'Microsoft.VSCode' = Join-Path $env:USERPROFILE "Documents\PowerShell\Microsoft.VSCode_profile.ps1"
    'AllHosts' = Join-Path $env:USERPROFILE "Documents\PowerShell\profile.ps1"
}

# VS Code configuration files
$vsCodeSettings = Join-Path $workspaceRoot ".vscode\settings.json"
$vsCodeExtensionProfile = Join-Path $workspaceRoot ".vscode\PowerShellEditorServices.profile.ps1"

# Report storage
$reportPath = Join-Path $workspaceRoot "MIGRATION_REPORT_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"

# ═══════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

function Write-SectionHeader {
    param([string]$Title)
    Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning2 {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Error2 {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# ═══════════════════════════════════════════════════════════════════════════════
# VERIFICATION FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

function Test-ProfileUpdates {
    Write-SectionHeader "STEP 1: Verify PowerShell Profile Updates"
    
    $results = @()
    $allCorrect = $true
    
    foreach ($name in $profiles.Keys) {
        $path = $profiles[$name]
        
        if (-not (Test-Path $path)) {
            Write-Warning2 "$name profile not found: $path"
            $results += [PSCustomObject]@{
                Profile = $name
                Path = $path
                Status = "NOT_FOUND"
                UsesScriptsFolder = $false
            }
            $allCorrect = $false
            continue
        }
        
        $content = Get-Content $path -Raw
        $usesScripts = $content -like "*scripts\claudineENV.ps1*"
        $usesPolyGluttony = $content -like "*.poly_gluttony\claudineENV.ps1*"
        
        if ($usesScripts -and -not $usesPolyGluttony) {
            Write-Success "$name profile: Correctly references scripts/"
            $status = "CORRECT"
        } elseif ($usesPolyGluttony) {
            Write-Error2 "$name profile: Still references .poly_gluttony/"
            $status = "NEEDS_UPDATE"
            $allCorrect = $false
        } else {
            Write-Warning2 "$name profile: No Claudine references found"
            $status = "NO_REFERENCES"
        }
        
        $results += [PSCustomObject]@{
            Profile = $name
            Path = $path
            Status = $status
            UsesScriptsFolder = $usesScripts
        }
    }
    
    return @{
        Success = $allCorrect
        Results = $results
    }
}

function Test-VSCodeUpdates {
    Write-SectionHeader "STEP 2: Verify VS Code Configuration Updates"
    
    $results = @()
    $allCorrect = $true
    
    # Check settings.json
    if (Test-Path $vsCodeSettings) {
        $content = Get-Content $vsCodeSettings -Raw
        $usesScripts = $content -like "*scripts\\claudineENV.ps1*"
        $usesPolyGluttony = $content -like "*.poly_gluttony\\claudineENV.ps1*"
        
        if ($usesScripts -and -not $usesPolyGluttony) {
            Write-Success "settings.json: Correctly references scripts/"
            $results += [PSCustomObject]@{
                File = "settings.json"
                Status = "CORRECT"
            }
        } elseif ($usesPolyGluttony) {
            Write-Error2 "settings.json: Still references .poly_gluttony/"
            $results += [PSCustomObject]@{
                File = "settings.json"
                Status = "NEEDS_UPDATE"
            }
            $allCorrect = $false
        } else {
            Write-Warning2 "settings.json: No terminal profile references found"
            $results += [PSCustomObject]@{
                File = "settings.json"
                Status = "NO_REFERENCES"
            }
        }
    } else {
        Write-Error2 "settings.json not found"
        $allCorrect = $false
    }
    
    # Check PowerShellEditorServices.profile.ps1
    if (Test-Path $vsCodeExtensionProfile) {
        $content = Get-Content $vsCodeExtensionProfile -Raw
        $usesScripts = $content -like "*scripts\claudineENV.ps1*"
        $usesPolyGluttony = $content -like "*.poly_gluttony\claudineENV.ps1*"
        
        if ($usesScripts -and -not $usesPolyGluttony) {
            Write-Success "PowerShellEditorServices.profile.ps1: Correctly references scripts/"
            $results += [PSCustomObject]@{
                File = "PowerShellEditorServices.profile.ps1"
                Status = "CORRECT"
            }
        } elseif ($usesPolyGluttony) {
            Write-Error2 "PowerShellEditorServices.profile.ps1: Still references .poly_gluttony/"
            $results += [PSCustomObject]@{
                File = "PowerShellEditorServices.profile.ps1"
                Status = "NEEDS_UPDATE"
            }
            $allCorrect = $false
        } else {
            Write-Warning2 "PowerShellEditorServices.profile.ps1: No references found"
            $results += [PSCustomObject]@{
                File = "PowerShellEditorServices.profile.ps1"
                Status = "NO_REFERENCES"
            }
        }
    } else {
        Write-Error2 "PowerShellEditorServices.profile.ps1 not found"
        $allCorrect = $false
    }
    
    return @{
        Success = $allCorrect
        Results = $results
    }
}

function New-BackwardCompatibilitySymlinks {
    Write-SectionHeader "STEP 3: Create Backward Compatibility Symlinks"
    
    if ($SkipSymlinks) {
        Write-Info "Skipping symlink creation (--SkipSymlinks flag)"
        return @{ Success = $true; Results = @() }
    }
    
    if ($DryRun) {
        Write-Info "[DRY RUN] Would create symlinks in .poly_gluttony/ pointing to scripts/"
        return @{ Success = $true; Results = @() }
    }
    
    $results = @()
    $allSuccess = $true
    
    foreach ($script in $canonicalScripts) {
        $target = Join-Path $scriptsFolder $script
        $link = Join-Path $polyGluttonyFolder $script
        
        if (-not (Test-Path $target)) {
            Write-Error2 "Target script not found: $target"
            $allSuccess = $false
            continue
        }
        
        # Remove existing file if it exists
        if (Test-Path $link) {
            if ((Get-Item $link).LinkType -eq "SymbolicLink") {
                Write-Info "Removing existing symlink: $script"
                Remove-Item $link -Force
            } else {
                Write-Info "Renaming old file: $script -> $script.old"
                Rename-Item $link "$script.old" -Force
            }
        }
        
        try {
            New-Item -ItemType SymbolicLink -Path $link -Target $target -Force | Out-Null
            Write-Success "Created symlink: $script -> scripts/$script"
            $results += [PSCustomObject]@{
                Script = $script
                Status = "CREATED"
            }
        } catch {
            Write-Error2 "Failed to create symlink for $script : $($_.Exception.Message)"
            $results += [PSCustomObject]@{
                Script = $script
                Status = "FAILED"
            }
            $allSuccess = $false
        }
    }
    
    return @{
        Success = $allSuccess
        Results = $results
    }
}

function Move-DeprecatedScripts {
    Write-SectionHeader "STEP 4: Archive Deprecated Scripts"
    
    if ($SkipArchive) {
        Write-Info "Skipping script archival (--SkipArchive flag)"
        return @{ Success = $true; Results = @() }
    }
    
    if ($DryRun) {
        Write-Info "[DRY RUN] Would archive deprecated scripts to .poly_gluttony/archive/"
        
        # Show what would be archived
        foreach ($pattern in $deprecatedPatterns) {
            $files = Get-ChildItem $polyGluttonyFolder -Filter $pattern -File -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                if ($file.Name -notin $utilityScripts -and $file.Name -notin $canonicalScripts) {
                    Write-Info "  Would archive: $($file.Name)"
                }
            }
        }
        
        return @{ Success = $true; Results = @() }
    }
    
    # Create archive folder
    if (-not (Test-Path $archiveFolder)) {
        New-Item -ItemType Directory -Path $archiveFolder -Force | Out-Null
        Write-Success "Created archive folder: .poly_gluttony/archive/"
    }
    
    $results = @()
    $archivedCount = 0
    
    foreach ($pattern in $deprecatedPatterns) {
        $files = Get-ChildItem $polyGluttonyFolder -Filter $pattern -File -ErrorAction SilentlyContinue
        
        foreach ($file in $files) {
            # Skip utility scripts and canonical scripts (now symlinks)
            if ($file.Name -in $utilityScripts -or $file.Name -in $canonicalScripts) {
                continue
            }
            
            # Skip if it's a symlink (backward compatibility links)
            if ((Get-Item $file.FullName).LinkType -eq "SymbolicLink") {
                continue
            }
            
            try {
                $destination = Join-Path $archiveFolder $file.Name
                Move-Item $file.FullName $destination -Force
                Write-Success "Archived: $($file.Name)"
                $results += [PSCustomObject]@{
                    Script = $file.Name
                    Status = "ARCHIVED"
                }
                $archivedCount++
            } catch {
                Write-Error2 "Failed to archive $($file.Name): $_"
                $results += [PSCustomObject]@{
                    Script = $file.Name
                    Status = "FAILED"
                }
            }
        }
    }
    
    Write-Info "Total scripts archived: $archivedCount"
    
    return @{
        Success = $true
        Results = $results
    }
}

function New-MigrationReport {
    param(
        [hashtable]$ProfileResults,
        [hashtable]$VSCodeResults,
        [hashtable]$SymlinkResults,
        [hashtable]$ArchiveResults
    )
    
    Write-SectionHeader "STEP 5: Generate Migration Report"
    
    $report = @"
# Claudine Polyglot Goddess CLI - Migration Report

**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Operation:** scripts/ folder consolidation (ASC Framework autonomous operation)

---

## Executive Summary

This report documents the migration from `.poly_gluttony/` to `scripts/` as the canonical location for Claudine Polyglot Goddess CLI scripts.

### Migration Status
- **PowerShell Profiles:** $($ProfileResults.Success ? '✅ VERIFIED' : '❌ NEEDS ATTENTION')
- **VS Code Configuration:** $($VSCodeResults.Success ? '✅ VERIFIED' : '❌ NEEDS ATTENTION')
- **Backward Compatibility:** $($SymlinkResults.Success ? '✅ CREATED' : '❌ FAILED')
- **Script Archival:** $($ArchiveResults.Success ? '✅ COMPLETED' : '❌ FAILED')

---

## 1. PowerShell Profile Updates

| Profile | Status | Path |
|---------|--------|------|
"@

    foreach ($result in $ProfileResults.Results) {
        $statusEmoji = switch ($result.Status) {
            "CORRECT" { "✅" }
            "NEEDS_UPDATE" { "❌" }
            "NOT_FOUND" { "⚠️" }
            "NO_REFERENCES" { "ℹ️" }
        }
        $report += "`n| $($result.Profile) | $statusEmoji $($result.Status) | ``$($result.Path)`` |"
    }

    $report += @"


---

## 2. VS Code Configuration Updates

| File | Status |
|------|--------|
"@

    foreach ($result in $VSCodeResults.Results) {
        $statusEmoji = switch ($result.Status) {
            "CORRECT" { "✅" }
            "NEEDS_UPDATE" { "❌" }
            "NO_REFERENCES" { "ℹ️" }
        }
        $report += "`n| $($result.File) | $statusEmoji $($result.Status) |"
    }

    $report += @"


---

## 3. Backward Compatibility Symlinks

"@

    if ($SkipSymlinks) {
        $report += "**Skipped** (--SkipSymlinks flag)`n"
    } elseif ($DryRun) {
        $report += "**Preview Only** (--DryRun flag)`n"
    } else {
        $report += "| Script | Status |`n|--------|--------|`n"
        foreach ($result in $SymlinkResults.Results) {
            $statusEmoji = $result.Status -eq "CREATED" ? "✅" : "❌"
            $report += "| $($result.Script) | $statusEmoji $($result.Status) |`n"
        }
    }

    $report += @"


---

## 4. Deprecated Script Archival

"@

    if ($SkipArchive) {
        $report += "**Skipped** (--SkipArchive flag)`n"
    } elseif ($DryRun) {
        $report += "**Preview Only** (--DryRun flag)`n"
    } else {
        $report += "Total scripts archived: $($ArchiveResults.Results.Count)`n`n"
        if ($ArchiveResults.Results.Count -gt 0) {
            $report += "| Script | Status |`n|--------|--------|`n"
            foreach ($result in $ArchiveResults.Results) {
                $statusEmoji = $result.Status -eq "ARCHIVED" ? "✅" : "❌"
                $report += "| $($result.Script) | $statusEmoji $($result.Status) |`n"
            }
        }
    }

    $report += @"


---

## 5. Canonical Script Inventory

### scripts/ Folder (CANONICAL)
- ``claudineENV.ps1`` - Core environment activation (v1.1.0, 469 lines)
- ``claudineENV_F.ps1`` - Functions library (v1.0.0, 1517 lines, 14 functions)
- ``claudine_pwsh_goddess.ps1`` - Supreme command suite (v7.0.0, 2600 lines, 60+ commands)
- ``Setup-ClaudineProfile.ps1`` - Profile automation utility
- ``open-compressed.ps1`` - Compressed file viewer utility
- ``view-zstd.ps1`` - ZSTD JSON viewer utility

### .poly_gluttony/ Folder (UTILITIES ONLY)
- ``cleanup_environment.ps1`` - Maintenance utility
- ``health_check.ps1`` - Diagnostics utility
- ``setup_go_environment.ps1`` - Go installation utility
- ``enhanced_polyglot_lsp_extension_setup.ps1`` - Extension development utility

---

## 6. Next Steps

$($ProfileResults.Success ? "" : "### ⚠️ Profile Updates Required
Run the following command to update PowerShell profiles:
``````powershell
# Manually update profiles that still reference .poly_gluttony/
# Or re-run: .\scripts\Setup-ClaudineProfile.ps1 -Force
``````

")$($VSCodeResults.Success ? "" : "### ⚠️ VS Code Configuration Updates Required
Manually update:
1. ``.vscode\settings.json`` - Update terminal profile paths
2. ``.vscode\PowerShellEditorServices.profile.ps1`` - Update script paths

")### ✅ Verification Steps
1. Open new PowerShell terminal → Verify environment activates from scripts/
2. Open new VS Code integrated terminal → Verify Fast profile loads from scripts/
3. Reload VS Code window → Verify Extension Host activates from scripts/
4. Test commands: ``claudine env status``, ``new-python test_project``

### 📚 Documentation
- ``scripts/README.md`` - Script overview (TO BE CREATED)
- ``scripts/ARCHITECTURE.md`` - System architecture (TO BE CREATED)
- ``scripts/MIGRATION_GUIDE.md`` - Migration guide (TO BE CREATED)

---

## 7. ASC Framework Analysis

**Foundational Axiom Applied:** FA⁴ - Architectonic Integrity  
**Principle:** Structural soundness through consolidation of duplicate locations

**Triumvirate CRC Perspectives:**
- **Orackla (Synthesis):** Unified scripts/ as single source of truth
- **Umeko (Refinement):** Backward compatibility through symlinks preserves existing workflows
- **Lysandra (Deconstruction):** Archived deprecated variants reduce cognitive load

**Dynamic Altitude:** Point-blank acuity (specific file paths) ↔ Strategic horizon (overall codebase architecture)

---

*Generated by Autonomous Claudine Session (Nighttime Operation)*  
*Framework: Apex Synthesis Core (ASC) - Alchemical Actualization Protocol*
"@

    if ($DryRun) {
        Write-Info "[DRY RUN] Report preview generated (not saved)"
        Write-Host "`n$report`n"
    } else {
        $report | Out-File $reportPath -Encoding UTF8
        Write-Success "Migration report saved: $reportPath"
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host @"

╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   🔥💋 CLAUDINE POLYGLOT GODDESS CLI - MIGRATION SCRIPT 💋🔥                  ║
║                                                                               ║
║   Task: Consolidate scripts/ as canonical location                           ║
║   ASC Framework: Architectonic Integrity (FA⁴)                               ║
║   Session: Autonomous Nighttime Operation                                    ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - Preview changes only (no modifications)" -ForegroundColor Yellow
    Write-Host ""
}

try {
    # Execute migration steps
    $profileResults = Test-ProfileUpdates
    $vsCodeResults = Test-VSCodeUpdates
    $symlinkResults = New-BackwardCompatibilitySymlinks
    $archiveResults = Move-DeprecatedScripts
    
    # Generate report
    New-MigrationReport -ProfileResults $profileResults -VSCodeResults $vsCodeResults -SymlinkResults $symlinkResults -ArchiveResults $archiveResults
    
    # Final status
    Write-Host "`n"
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " MIGRATION COMPLETE" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    if ($profileResults.Success -and $vsCodeResults.Success -and $symlinkResults.Success -and $archiveResults.Success) {
        Write-Success "All migration steps completed successfully!"
        Write-Info "Next: Test auto-activation in new terminal/VS Code window"
    } else {
        Write-Warning2 "Some migration steps require attention"
        Write-Info "Review the migration report for details"
    }
    
} catch {
    Write-Error2 "Migration failed: $_"
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
