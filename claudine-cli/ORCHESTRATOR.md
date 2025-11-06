# Orchestrator Architecture

## Overview

The orchestrator pattern transforms the Claudine CLI from an **implementer** to a **conductor**. Instead of implementing project creation, environment activation, and other features directly in TypeScript, the CLI now orchestrates existing PowerShell tools.

## Components

### 1. Orchestrator (`src/core/orchestrator/orchestrator.ts`)

The orchestrator is responsible for:
- Mapping tool names to PowerShell scripts/functions
- Building PowerShell command arguments
- Executing PowerShell scripts
- Parsing and returning results

#### Tool Mappings

```typescript
'project-create-python' → claudineENV.ps1::new-python
'project-create-rust' → claudineENV.ps1::new-rust
'environment-activate' → claudineENV.ps1
'health-check' → claudineENV.ps1::check-health
'detect-languages' → claudineENV.ps1::detect-languages
```

### 2. Config Loader (`src/core/config/index.ts`)

Loads configuration from:
1. `.claudine/config.json` (workspace)
2. `claudine.config.json` (workspace root)
3. Defaults

Schema includes:
- `toolsPath`: Path to PowerShell scripts (default: `.poly_gluttony`)
- `environment`: Environment settings
- `templates`: Available templates per language
- `tools`: Tool-specific configuration

### 3. Commands

#### Top-Level Commands (New)

- **`claudine create`** - Orchestrated project creation
- **`claudine activate`** - Orchestrated environment activation
- **`claudine health`** - Orchestrated health check
- **`claudine detect`** - Orchestrated language detection

#### Existing Commands

- **`claudine project new`** - Direct implementation (can be refactored to use orchestrator)
- **`claudine env health`** - Direct implementation (can be refactored to use orchestrator)
- **`claudine env status`** - Direct implementation

## Usage Examples

### Create a Python Project

```bash
claudine create myapp --language python --template web
```

Orchestrator flow:
1. Maps to `project-create-python`
2. Executes: `pwsh -Command ". '.poly_gluttony/claudineENV.ps1'; new-python -Name myapp -Template web"`
3. Parses JSON output from PowerShell
4. Displays results

### Check Environment Health

```bash
claudine health --verbose
```

Orchestrator flow:
1. Maps to `health-check`
2. Executes: `pwsh -Command ". '.poly_gluttony/claudineENV.ps1'; check-health -Verbose"`
3. Parses health status
4. Displays results with colored output

### Detect Languages

```bash
claudine detect --path ./my-project
```

Orchestrator flow:
1. Maps to `detect-languages`
2. Executes: `pwsh -Command ". '.poly_gluttony/claudineENV.ps1'; detect-languages -projectPath ./my-project -minConfidence 0.5"`
3. Parses detection results
4. Displays languages with confidence levels

## Benefits

1. **Separation of Concerns**: CLI handles UI/UX, PowerShell handles logic
2. **Reusability**: PowerShell tools can be used independently
3. **Maintainability**: Changes to logic don't require TypeScript changes
4. **Consistency**: Same tools used by CLI and directly by users
5. **Testing**: PowerShell tools can be tested independently

## Implementation Details

### PowerShell Execution

The orchestrator uses two modes:

1. **Script mode** (no function specified):
   ```bash
   pwsh -NoProfile -NonInteractive -File script.ps1 -Param Value
   ```

2. **Function mode** (function specified):
   ```bash
   pwsh -NoProfile -NonInteractive -Command ". 'script.ps1'; function-name -Param Value"
   ```

### Result Format

PowerShell scripts should return JSON:

```json
{
  "path": "/path/to/project",
  "language": "python",
  "template": "web"
}
```

The orchestrator parses this and returns:

```typescript
{
  success: true,
  data: { path: "...", language: "...", template: "..." },
  metadata: { setupInstructions: "..." }
}
```

### Error Handling

Errors are caught and returned in a standardized format:

```typescript
{
  success: false,
  error: "Error message",
  metadata: { stderr: "..." }
}
```

## Next Steps

1. Refactor existing commands to use orchestrator (optional)
2. Add integration tests
3. Create PowerShell script stubs for development/testing
4. Add caching layer for expensive operations
5. Add logging and debugging options
