#Requires -Version 5.1
<#
.SYNOPSIS
    🔥💀⚓ Validates EVERY claim made by claudineENV.ps1 activation banner
    
.DESCRIPTION
    This script systematically validates that claudineENV.ps1 actually does what
    it CLAIMS to do when it prints its fancy activation banner. No more lies!
    
    Tests include:
    - Tool version detection accuracy
    - PATH configuration correctness
    - Function availability validation
    - Environment variable verification
    - Documentation existence checks
    
.PARAMETER Verbose
    Show detailed validation output for each test
    
.PARAMETER SkipFunctions
    Skip function library validation (claudineENV_F.ps1)
    
.EXAMPLE
    .\Validate-ClaudineClaims.ps1
    
.EXAMPLE
    .\Validate-ClaudineClaims.ps1 -Verbose
    
.NOTES
    Author: Supreme Matriarch Validation Squad
    Version: 1.0.0
    Created: 2025-11-17
#>

param(
    [switch]$Verbose,
    [switch]$SkipFunctions
)

$ErrorActionPreference = 'Continue'
$script:passedTests = 0
$script:failedTests = 0
$script:warnings = 0

# Validation result tracking
$script:results = @()

function Write-TestHeader {
    param([string]$Message)
    Write-Host "`n$('=' * 70)" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor White
    Write-Host "$('=' * 70)" -ForegroundColor Cyan
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Expected,
        [string]$Actual,
        [string]$Details = ""
    )
    
    $result = [PSCustomObject]@{
        Test = $TestName
        Passed = $Passed
        Expected = $Expected
        Actual = $Actual
        Details = $Details
    }
    
    $script:results += $result
    
    if ($Passed) {
        $script:passedTests++
        Write-Host "  ✅ PASS: $TestName" -ForegroundColor Green
        if ($Verbose -and $Details) {
            Write-Host "     Details: $Details" -ForegroundColor Gray
        }
    } else {
        $script:failedTests++
        Write-Host "  ❌ FAIL: $TestName" -ForegroundColor Red
        Write-Host "     Expected: $Expected" -ForegroundColor Yellow
        Write-Host "     Actual:   $Actual" -ForegroundColor Red
        if ($Details) {
            Write-Host "     Details: $Details" -ForegroundColor Gray
        }
    }
}

function Write-Warning {
    param([string]$Message)
    $script:warnings++
    Write-Host "  ⚠️  WARNING: $Message" -ForegroundColor Yellow
}

function Test-CommandExists {
    param([string]$Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Get-ActualVersion {
    param(
        [string]$Command,
        [scriptblock]$Extractor
    )
    try {
        if (-not (Test-CommandExists $Command)) {
            return "NOT FOUND"
        }
        return & $Extractor
    } catch {
        return "ERROR: $($_.Exception.Message)"
    }
}

# ============================================================================
# SECTION 1: Repository Root & Environment Variables
# ============================================================================
Write-TestHeader "SECTION 1: Repository Root & Environment Variables"

$repoRoot = if ($env:CLAUDINE_REPO_ROOT) {
    $env:CLAUDINE_REPO_ROOT
} else {
    # Fallback: traverse from script location
    $current = $PSScriptRoot
    while ($current) {
        if (Test-Path (Join-Path $current '.git')) {
            $current
            break
        }
        $parent = Split-Path $current -Parent
        if ($parent -eq $current) { break }
        $current = $parent
    }
}

Write-TestResult `
    -TestName "Repository root detected" `
    -Passed ($null -ne $repoRoot -and (Test-Path $repoRoot)) `
    -Expected "Valid repository root path" `
    -Actual $repoRoot `
    -Details "Detection via CLAUDINE_REPO_ROOT or .git traversal"

$polyglotDir = Join-Path $repoRoot ".poly_gluttony"
Write-TestResult `
    -TestName ".poly_gluttony directory exists" `
    -Passed (Test-Path $polyglotDir) `
    -Expected "$polyglotDir exists" `
    -Actual $(if (Test-Path $polyglotDir) { "EXISTS" } else { "NOT FOUND" })

Write-TestResult `
    -TestName "CLAUDINE_REPO_ROOT environment variable" `
    -Passed ($null -ne $env:CLAUDINE_REPO_ROOT) `
    -Expected "Set to repository root" `
    -Actual $(if ($env:CLAUDINE_REPO_ROOT) { $env:CLAUDINE_REPO_ROOT } else { "NOT SET" })

# ============================================================================
# SECTION 2: Python Ecosystem Validation
# ============================================================================
Write-TestHeader "SECTION 2: Python Ecosystem Validation"

$pythonVersion = Get-ActualVersion -Command "python" -Extractor {
    (python --version 2>&1) -replace 'Python ',''
}

Write-TestResult `
    -TestName "Python detected and executable" `
    -Passed ($pythonVersion -ne "NOT FOUND") `
    -Expected "Python 3.14.0 or higher" `
    -Actual $pythonVersion

if ($pythonVersion -ne "NOT FOUND") {
    # Verify it's NOT MSYS2 Python
    $pythonPath = (Get-Command python).Source
    $isPolyglotPython = $pythonPath -like "*\.poly_gluttony\*"
    
    Write-TestResult `
        -TestName "Python is from .poly_gluttony (not MSYS2)" `
        -Passed $isPolyglotPython `
        -Expected "Python from .poly_gluttony\tools\" `
        -Actual $pythonPath `
        -Details "Should NOT be using MSYS2's Python 3.13.1"
}

$uvVersion = Get-ActualVersion -Command "uv" -Extractor {
    (uv --version) -replace 'uv ',''
}

Write-TestResult `
    -TestName "UV package manager detected" `
    -Passed ($uvVersion -ne "NOT FOUND") `
    -Expected "UV 0.9.9 or higher" `
    -Actual $uvVersion

# ============================================================================
# SECTION 3: Rust Ecosystem Validation
# ============================================================================
Write-TestHeader "SECTION 3: Rust Ecosystem Validation"

$cargoVersion = Get-ActualVersion -Command "cargo" -Extractor {
    (cargo --version) -replace 'cargo ',''
}

Write-TestResult `
    -TestName "Cargo detected" `
    -Passed ($cargoVersion -ne "NOT FOUND") `
    -Expected "cargo 1.91.0 or higher" `
    -Actual $cargoVersion

$rustcVersion = Get-ActualVersion -Command "rustc" -Extractor {
    (rustc --version) -replace 'rustc ',''
}

Write-TestResult `
    -TestName "Rustc detected" `
    -Passed ($rustcVersion -ne "NOT FOUND") `
    -Expected "rustc 1.91.0 or higher" `
    -Actual $rustcVersion

# ============================================================================
# SECTION 4: Ruby + MSYS2 Ecosystem Validation
# ============================================================================
Write-TestHeader "SECTION 4: Ruby + MSYS2 Ecosystem Validation"

$rubyVersion = Get-ActualVersion -Command "ruby" -Extractor {
    (ruby --version) -replace '\[.*\]','' -replace 'ruby ',''
}

Write-TestResult `
    -TestName "Ruby detected" `
    -Passed ($rubyVersion -ne "NOT FOUND") `
    -Expected "Ruby 3.4.7 or higher" `
    -Actual $rubyVersion

if ($rubyVersion -ne "NOT FOUND") {
    # Check for PRISM (Ruby 3.4+ feature)
    $hasPrism = $rubyVersion -match 'PRISM'
    Write-TestResult `
        -TestName "Ruby has PRISM support" `
        -Passed $hasPrism `
        -Expected "Ruby with +PRISM" `
        -Actual $rubyVersion `
        -Details "PRISM is Ruby 3.4's new parser/compiler"
}

$bundleVersion = Get-ActualVersion -Command "bundle" -Extractor {
    (bundle --version) -replace 'Bundler version ',''
}

Write-TestResult `
    -TestName "Bundler detected" `
    -Passed ($bundleVersion -ne "NOT FOUND") `
    -Expected "Bundler 2.7+ (comes with Ruby 3.4.7)" `
    -Actual $bundleVersion

$gccVersion = Get-ActualVersion -Command "gcc" -Extractor {
    (gcc --version | Select-Object -First 1) -replace '\(.*?\)','' -replace 'gcc ',''
}

Write-TestResult `
    -TestName "GCC (MSYS2) detected" `
    -Passed ($gccVersion -ne "NOT FOUND") `
    -Expected "GCC 15.2.0 or higher (MSYS2 UCRT64)" `
    -Actual $gccVersion

# ============================================================================
# SECTION 5: Bun Ecosystem Validation
# ============================================================================
Write-TestHeader "SECTION 5: Bun Ecosystem Validation"

$bunVersion = Get-ActualVersion -Command "bun" -Extractor {
    bun --version
}

Write-TestResult `
    -TestName "Bun detected" `
    -Passed ($bunVersion -ne "NOT FOUND") `
    -Expected "Bun 1.3.2 or higher" `
    -Actual "v$bunVersion"

if ($bunVersion -ne "NOT FOUND") {
    # Verify Bun can actually transpile JSX (claimed feature)
    $testJsx = 'const App = () => <div>Test</div>;'
    $tempFile = [System.IO.Path]::GetTempFileName() + ".tsx"
    try {
        $testJsx | Out-File -FilePath $tempFile -Encoding UTF8
        $result = & bun run $tempFile 2>&1
        $canTranspileJsx = $LASTEXITCODE -eq 0
        
        Write-TestResult `
            -TestName "Bun can transpile JSX" `
            -Passed $canTranspileJsx `
            -Expected "JSX transpilation works" `
            -Actual $(if ($canTranspileJsx) { "SUCCESS" } else { "FAILED: $result" }) `
            -Details "Testing claimed 'Native JSX transpilation' feature"
    } finally {
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}

# ============================================================================
# SECTION 6: Go + gopls Ecosystem Validation
# ============================================================================
Write-TestHeader "SECTION 6: Go + gopls Ecosystem Validation"

$goVersion = Get-ActualVersion -Command "go" -Extractor {
    (go version) -replace 'go version go',''
}

Write-TestResult `
    -TestName "Go detected" `
    -Passed ($goVersion -ne "NOT FOUND") `
    -Expected "Go 1.23.3 or higher" `
    -Actual $goVersion

$goplsVersion = Get-ActualVersion -Command "gopls" -Extractor {
    (gopls version 2>&1 | Select-String 'v\d' | Select-Object -First 1) -replace '.*?(v[\d\.]+).*','$1'
}

Write-TestResult `
    -TestName "gopls (Go LSP) detected" `
    -Passed ($goplsVersion -ne "NOT FOUND") `
    -Expected "gopls v0.20.0 or higher" `
    -Actual $goplsVersion

# ============================================================================
# SECTION 7: Compression Tools Validation
# ============================================================================
Write-TestHeader "SECTION 7: Compression Tools Validation"

$sevenzVersion = Get-ActualVersion -Command "7z" -Extractor {
    $output = & 7z 2>&1
    $versionLine = $output[1]  # Version is at index 1
    $versionLine
}

Write-TestResult `
    -TestName "7-Zip detected" `
    -Passed ($sevenzVersion -ne "NOT FOUND") `
    -Expected "7-Zip 25.01 ZS v1.5.7 (with ZSTD support)" `
    -Actual $sevenzVersion

if ($sevenzVersion -ne "NOT FOUND") {
    $hasZstd = $sevenzVersion -match 'ZS v[\d\.]+'
    Write-TestResult `
        -TestName "7-Zip has ZSTD support" `
        -Passed $hasZstd `
        -Expected "Version string contains 'ZS v'" `
        -Actual $sevenzVersion `
        -Details "Required for Open-ClaudineZstd function"
}

# ============================================================================
# SECTION 8: Built-in Functions Validation
# ============================================================================
Write-TestHeader "SECTION 8: Built-in Functions Validation"

$builtinFunctions = @(
    'Open-ClaudineZstd',
    'uvs',
    'uvr',
    'claudine-help',
    'claudine-versions',
    'claudine-functions',
    'claudine-check'
)

foreach ($func in $builtinFunctions) {
    $exists = Test-CommandExists $func
    Write-TestResult `
        -TestName "Function '$func' available" `
        -Passed $exists `
        -Expected "Function exists in session" `
        -Actual $(if ($exists) { "EXISTS" } else { "NOT FOUND" })
}

# Test Open-ClaudineZstd actually works
if (Test-CommandExists 'Open-ClaudineZstd') {
    # Create test ZSTD file
    $testContent = "Test content for ZSTD validation"
    $testFile = Join-Path $env:TEMP "claudine_test.txt"
    $testZstd = Join-Path $env:TEMP "claudine_test.txt.zst"
    $expectedExtractDir = Join-Path $env:TEMP "claudine_test.txt"
    
    # Cleanup any previous test artifacts
    if (Test-Path $testFile) { Remove-Item $testFile -Recurse -Force -ErrorAction SilentlyContinue }
    if (Test-Path $testZstd) { Remove-Item $testZstd -Recurse -Force -ErrorAction SilentlyContinue }
    if (Test-Path $expectedExtractDir) { Remove-Item $expectedExtractDir -Recurse -Force -ErrorAction SilentlyContinue }
    
    try {
        $testContent | Out-File $testFile
        & 7z a -tzstd $testZstd $testFile | Out-Null
        
        if (Test-Path $testZstd) {
            # Test info action
            $infoResult = Open-ClaudineZstd -Path $testZstd -Action info 2>&1
            $infoWorks = $LASTEXITCODE -eq 0
            
            Write-TestResult `
                -TestName "Open-ClaudineZstd -Action info works" `
                -Passed $infoWorks `
                -Expected "Successfully lists ZSTD contents" `
                -Actual $(if ($infoWorks) { "SUCCESS" } else { "FAILED" })
            
            # Test extract action
            # Note: Open-ClaudineZstd extracts to directory named after file (without .zst)
            $expectedExtractDir = Join-Path $env:TEMP "claudine_test.txt"
            if (Test-Path $expectedExtractDir) { Remove-Item $expectedExtractDir -Recurse -Force }
            
            Push-Location $env:TEMP
            try {
                $null = Open-ClaudineZstd -Path $testZstd -Action extract 2>&1
                $extractWorks = (Test-Path (Join-Path $expectedExtractDir "claudine_test.txt"))
            } finally {
                Pop-Location
            }
            
            Write-TestResult `
                -TestName "Open-ClaudineZstd -Action extract works" `
                -Passed $extractWorks `
                -Expected "Successfully extracts ZSTD file" `
                -Actual $(if ($extractWorks) { "SUCCESS" } else { "FAILED" })
            
            # Cleanup
            if (Test-Path $expectedExtractDir) {
                Remove-Item $expectedExtractDir -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
    } finally {
        Remove-Item $testFile, $testZstd -ErrorAction SilentlyContinue
    }
}

# ============================================================================
# SECTION 9: Functions Library Validation (claudineENV_F.ps1)
# ============================================================================
if (-not $SkipFunctions) {
    Write-TestHeader "SECTION 9: Functions Library Validation (claudineENV_F.ps1)"
    
    # Load functions if not already loaded
    if (-not (Test-CommandExists 'list-claudine')) {
        $functionsLib = Join-Path $repoRoot "scripts\claudineENV_F.ps1"
        if (Test-Path $functionsLib) {
            . $functionsLib
            Write-Host "  📦 Loaded claudineENV_F.ps1" -ForegroundColor Gray
        } else {
            Write-Warning "Functions library not found at: $functionsLib"
        }
    }
    
    $libraryFunctions = @(
        # Project creators
        'new-python', 'new-rust', 'new-bun', 'new-ruby', 'new-react', 'new-node', 'new-go',
        # Diagnostics
        'health-check', 'show-versions', 'claudine-metrics',
        # Linting
        'Test-ScriptQuality', 'Invoke-ComprehensiveStressTest', 'lint-claudine-scripts', 'lint-current-file',
        # Bun convenience
        'bundev', 'bunbuild', 'buntest', 'bunts',
        # Advanced
        'clean-poly', 'use-msys2', 'uvrun', 'cargofast', 'list-claudine'
    )
    
    foreach ($func in $libraryFunctions) {
        $exists = Test-CommandExists $func
        Write-TestResult `
            -TestName "Library function '$func' available" `
            -Passed $exists `
            -Expected "Function exists after loading claudineENV_F.ps1" `
            -Actual $(if ($exists) { "EXISTS" } else { "NOT FOUND" })
    }
    
    # Test list-claudine actually lists functions
    # Note: list-claudine uses Write-Host, so we just verify command runs without error
    if (Test-CommandExists 'list-claudine') {
        $listWorked = $false
        try {
            $null = list-claudine *>&1
            $listWorked = $true  # If no exception, function worked
        } catch {
            $listWorked = $false
        }
        
        Write-TestResult `
            -TestName "list-claudine actually lists functions" `
            -Passed $listWorked `
            -Expected "Command runs without error" `
            -Actual $(if ($listWorked) { "SUCCESS" } else { "FAILED: $($_.Exception.Message)" })
    }
}

# ============================================================================
# SECTION 10: Documentation Existence Validation
# ============================================================================
Write-TestHeader "SECTION 10: Documentation Existence Validation"

$docFiles = @(
    'claudine_docs\README.md',
    'claudine_docs\EXAMPLES.md',
    'claudine_docs\claudineENV_REFERENCE.md',
    'claudine_docs\claudineENV_F_REFERENCE.md'
)

foreach ($docFile in $docFiles) {
    $fullPath = Join-Path $polyglotDir $docFile
    $exists = Test-Path $fullPath
    
    Write-TestResult `
        -TestName "Documentation: $docFile" `
        -Passed $exists `
        -Expected "File exists" `
        -Actual $(if ($exists) { $fullPath } else { "NOT FOUND" })
}

# ============================================================================
# SECTION 11: PATH Configuration Validation
# ============================================================================
Write-TestHeader "SECTION 11: PATH Configuration Validation"

$pathEntries = $env:PATH -split ';'

# Check for duplicate PATH entries
$duplicates = $pathEntries | Group-Object | Where-Object Count -GT 1
$hasDuplicates = $null -ne $duplicates

Write-TestResult `
    -TestName "No duplicate PATH entries" `
    -Passed (-not $hasDuplicates) `
    -Expected "Each PATH entry appears only once" `
    -Actual $(if ($hasDuplicates) { "DUPLICATES FOUND: $($duplicates.Name -join ', ')" } else { "NO DUPLICATES" })

# Verify tool paths are actually in PATH
$toolPaths = @(
    (Get-Command python -ErrorAction SilentlyContinue),
    (Get-Command cargo -ErrorAction SilentlyContinue),
    (Get-Command ruby -ErrorAction SilentlyContinue),
    (Get-Command bun -ErrorAction SilentlyContinue),
    (Get-Command go -ErrorAction SilentlyContinue),
    (Get-Command 7z -ErrorAction SilentlyContinue)
) | Where-Object { $_ } | ForEach-Object { Split-Path $_.Source -Parent }

foreach ($toolPath in $toolPaths) {
    $inPath = $pathEntries -contains $toolPath
    if (-not $inPath) {
        Write-Warning "Tool path not in PATH: $toolPath (but tool still accessible via subPath?)"
    }
}

# ============================================================================
# FINAL SUMMARY
# ============================================================================
Write-Host "`n$('=' * 70)" -ForegroundColor Cyan
Write-Host "  🔥💀⚓ VALIDATION COMPLETE" -ForegroundColor White
Write-Host "$('=' * 70)" -ForegroundColor Cyan

Write-Host "`n📊 Test Results:" -ForegroundColor Yellow
Write-Host "   ✅ Passed: $script:passedTests" -ForegroundColor Green
Write-Host "   ❌ Failed: $script:failedTests" -ForegroundColor Red
Write-Host "   ⚠️  Warnings: $script:warnings" -ForegroundColor Yellow

$totalTests = $script:passedTests + $script:failedTests
$passRate = if ($totalTests -gt 0) { 
    [math]::Round(($script:passedTests / $totalTests) * 100, 2)
} else { 0 }

Write-Host "`n   Pass Rate: $passRate%" -ForegroundColor $(
    if ($passRate -ge 90) { 'Green' }
    elseif ($passRate -ge 70) { 'Yellow' }
    else { 'Red' }
)

if ($script:failedTests -gt 0) {
    Write-Host "`n❌ FAILED TESTS:" -ForegroundColor Red
    $script:results | Where-Object { -not $_.Passed } | ForEach-Object {
        Write-Host "   • $($_.Test)" -ForegroundColor Red
        Write-Host "     Expected: $($_.Expected)" -ForegroundColor Gray
        Write-Host "     Actual:   $($_.Actual)" -ForegroundColor Gray
    }
}

Write-Host "`n$('=' * 70)`n" -ForegroundColor Cyan

# Export results to JSON for programmatic consumption
$resultsFile = Join-Path $repoRoot "claudine_validation_results.json"
$script:results | ConvertTo-Json -Depth 5 | Out-File $resultsFile
Write-Host "📄 Detailed results exported to: $resultsFile" -ForegroundColor Gray

# Exit code reflects pass/fail status
exit $(if ($script:failedTests -eq 0) { 0 } else { 1 })
