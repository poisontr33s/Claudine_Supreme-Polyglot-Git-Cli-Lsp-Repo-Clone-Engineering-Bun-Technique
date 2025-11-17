# Get-RepositoryRoot.ps1 v1.0.0
# Dynamic repository root detection for isolated environments
# Returns absolute path to repository root (where .git folder exists)

function Get-RepositoryRoot {
    <#
    .SYNOPSIS
        Dynamically detects repository root directory for isolated environment paths
    
    .DESCRIPTION
        Searches upward from current script location to find .git directory.
        Ensures all environment paths are relative to repository root, not hardcoded.
        
        This enables:
        - Portability across machines/users
        - Repository relocation without reconfiguration
        - Multi-workspace support (different clones)
    
    .PARAMETER StartPath
        Starting directory for search (defaults to script location)
    
    .EXAMPLE
        $repoRoot = Get-RepositoryRoot
        $polyglotDir = Join-Path $repoRoot ".poly_gluttony"
    
    .OUTPUTS
        String - Absolute path to repository root
    #>
    
    param(
        [string]$StartPath = $PSScriptRoot
    )
    
    # Strategy 1: Use git command if available (most reliable)
    if (Get-Command git -ErrorAction SilentlyContinue) {
        try {
            Push-Location $StartPath
            $gitRoot = git rev-parse --show-toplevel 2>$null
            Pop-Location
            
            if ($gitRoot -and (Test-Path $gitRoot)) {
                # Convert Unix-style path to Windows
                return $gitRoot -replace '/', '\'
            }
        } catch {
            Pop-Location
        }
    }
    
    # Strategy 2: Walk up directory tree looking for .git
    $currentPath = $StartPath
    $maxDepth = 10  # Prevent infinite loop
    $depth = 0
    
    while ($depth -lt $maxDepth) {
        $gitPath = Join-Path $currentPath ".git"
        
        if (Test-Path $gitPath) {
            return $currentPath
        }
        
        # Move up one directory
        $parent = Split-Path $currentPath -Parent
        
        # Reached filesystem root
        if (-not $parent -or $parent -eq $currentPath) {
            break
        }
        
        $currentPath = $parent
        $depth++
    }
    
    # Strategy 3: Fallback to known structure (scripts folder)
    # If this script is in /scripts, parent is repo root
    if ($StartPath -like "*\scripts") {
        $potentialRoot = Split-Path $StartPath -Parent
        if (Test-Path (Join-Path $potentialRoot ".poly_gluttony")) {
            return $potentialRoot
        }
    }
    
    # Strategy 4: Emergency fallback - return script's parent directory
    Write-Warning "Could not detect repository root via .git folder. Using script parent directory."
    return Split-Path $StartPath -Parent
}

# Function is automatically available when dot-sourced (no Export-ModuleMember needed)
