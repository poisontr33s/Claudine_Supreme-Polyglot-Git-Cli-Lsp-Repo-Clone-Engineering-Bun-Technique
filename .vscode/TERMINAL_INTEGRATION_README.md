# 🔥💋 VS Code Terminal Integration for Claudine Polyglot CLI

This directory contains VS Code-specific configurations for automatic `claudineENV.ps1` activation across all PowerShell contexts.

## 📦 Files Overview

### **PowerShellEditorServices.profile.ps1**
**Purpose**: Auto-activate claudineENV in PowerShell Extension Host  
**Context**: Runs when PowerShell Extension loads (which uses `-NoProfile` flag)  
**Loaded By**: PowerShell Extension (ms-vscode.powershell)

**Features**:
- Detects Claudine workspace automatically
- Activates `claudineENV.ps1` in quiet mode
- Provides `claudine-status` command
- Provides `claudine-functions` command (loads claudineENV_F.ps1 on-demand)
- Shows quick status banner

**Usage**:
```powershell
# In PowerShell Extension Host terminal:
claudine-status        # Show environment status
claudine-functions     # Load functions library
```

---

### **settings.json**
**Purpose**: VS Code workspace settings  
**Configures**:
- Custom terminal profiles (Claudine Polyglot)
- PowerShell Extension integration
- LSP server paths (rust-analyzer, gopls, ruff)
- Terminal environment variables

**Terminal Profiles**:
1. **Claudine Polyglot (Full)** 🔥💋
   - Activates `claudineENV.ps1 -LoadFunctions`
   - All 14 functions loaded (new-python, new-rust, etc.)
   - Startup time: ~1,300ms
   - Color: Magenta

2. **Claudine Polyglot (Fast)** ⚡ (Default)
   - Activates `claudineENV.ps1` only
   - Functions loadable on-demand
   - Startup time: ~17ms
   - Color: Cyan

3. **Claudine Polyglot (Quiet)** 🔇
   - Silent activation
   - Minimal output
   - Startup time: ~17ms
   - Color: Blue

4. **PowerShell (Default)** 🐚
   - Standard PowerShell (no auto-activation)
   - Uses `$PROFILE` auto-activation if configured

---

### **extensions.json**
**Purpose**: Recommended VS Code extensions  
**Extensions**:
- `ms-vscode.powershell` - PowerShell Extension
- `charliermarsh.ruff` - Python LSP (Ruff)
- `rust-lang.rust-analyzer` - Rust LSP
- `golang.go` - Go LSP
- `biomejs.biome` - TypeScript/JavaScript LSP
- `oven.bun-vscode` - Bun support
- `github.copilot` - Copilot
- `github.copilot-chat` - Copilot Chat

---

## 🚀 Usage

### Creating New Terminals

**Method 1: Terminal Dropdown** (Recommended)
1. Click Terminal dropdown (top-right of terminal panel)
2. Select profile:
   - `Claudine Polyglot (Full)` - Functions loaded
   - `Claudine Polyglot (Fast)` - Fast startup (default)
   - `Claudine Polyglot (Quiet)` - Silent mode

**Method 2: Command Palette**
1. Press `Ctrl+Shift+P`
2. Type: `Terminal: Create New Terminal (With Profile)`
3. Select `Claudine Polyglot (Fast)`

**Method 3: Keyboard Shortcut**
- Default new terminal: `Ctrl+Shift+` (backtick)
- Opens with default profile: `Claudine Polyglot (Fast)`

---

### Extension Host Terminal

**PowerShell Extension Host** (used for debugging/scripts):
- Auto-activates when workspace is Claudine project
- Uses `PowerShellEditorServices.profile.ps1`
- Functions loadable on-demand with `claudine-functions`

**Check Status**:
```powershell
claudine-status
```

**Load Functions**:
```powershell
claudine-functions
```

---

## 🔧 Configuration Details

### Terminal Environment Variables

Set in `settings.json > terminal.integrated.env.windows`:

```json
{
  "BUN_INSTALL": "${workspaceFolder}\\.poly_gluttony\\bun",
  "RUSTUP_HOME": "${workspaceFolder}\\.poly_gluttony\\rust\\rustup",
  "CARGO_HOME": "${workspaceFolder}\\.poly_gluttony\\rust\\cargo",
  "PYTHONHOME": "${workspaceFolder}\\.poly_gluttony\\python",
  "MSYS2_ROOT": "${workspaceFolder}\\.poly_gluttony\\msys64",
  "GOPATH": "${workspaceFolder}\\.poly_gluttony\\go_workspace",
  "CLAUDINE_WORKSPACE": "${workspaceFolder}",
  "CLAUDINE_AUTO_ACTIVATE": "true",
  "PATH": "..."
}
```

---

### PowerShell Profile Integration

**User Profile** (`$PROFILE`):
- Configured by `scripts/Setup-ClaudineProfile.ps1`
- Auto-activates in **regular pwsh terminals** (non-VS Code)
- Workspace detection (only activates if in Claudine directory)

**Extension Host Profile** (`.vscode/PowerShellEditorServices.profile.ps1`):
- Loaded by PowerShell Extension (bypasses `-NoProfile`)
- Auto-activates in **Extension Host terminals**
- Workspace detection via `$psEditor.Workspace.Path`

---

## 📊 Performance Comparison

| Terminal Type | Activation Method | Startup Time | Functions Loaded |
|--------------|------------------|--------------|------------------|
| Claudine Polyglot (Full) | claudineENV.ps1 -LoadFunctions | ~1,300ms | ✅ Yes (14 functions) |
| Claudine Polyglot (Fast) | claudineENV.ps1 | ~17ms | ❌ No (load on-demand) |
| Claudine Polyglot (Quiet) | claudineENV.ps1 -Quiet | ~17ms | ❌ No (silent) |
| PowerShell (Default) | $PROFILE auto-activation | ~50ms | ❌ No (via $PROFILE) |
| Extension Host | PowerShellEditorServices.profile.ps1 | ~100ms | ❌ No (load on-demand) |

---

## 🎯 Recommendations

### For Development (Default)
Use **Claudine Polyglot (Fast)**:
- Instant activation (~17ms)
- Load functions when needed: `. .\.poly_gluttony\claudineENV_F.ps1`
- Best for quick terminal sessions

### For Project Creation
Use **Claudine Polyglot (Full)**:
- Functions pre-loaded (new-python, new-rust, etc.)
- Ready for `new-python -Name myapp -Template web`
- Best for initial setup sessions

### For Scripting/Automation
Use **Claudine Polyglot (Quiet)**:
- Minimal output
- Fast activation
- Best for CI/CD, background tasks

### For PowerShell Extension
Terminals auto-activate via `PowerShellEditorServices.profile.ps1`:
- No manual activation needed
- Use `claudine-status` to verify
- Use `claudine-functions` to load library

---

## 🔍 Troubleshooting

### Terminal Profile Not Found
**Symptom**: "Claudine Polyglot (Fast)" not in dropdown

**Solution**:
1. Reload VS Code: `Ctrl+Shift+P` → `Reload Window`
2. Verify `settings.json` has `terminal.integrated.profiles.windows` section

---

### Extension Host Not Auto-Activating
**Symptom**: PowerShell Extension terminal shows no activation message

**Solution**:
1. Verify file exists: `.vscode\PowerShellEditorServices.profile.ps1`
2. Restart PowerShell Extension: `Ctrl+Shift+P` → `PowerShell: Restart Session`
3. Check workspace path matches Claudine workspace

---

### Environment Not Activated
**Symptom**: Tools not found (python, cargo, etc.)

**Solution**:
```powershell
# Check activation status
$env:CLAUDINE_ACTIVATED

# Manual activation
. .\.poly_gluttony\claudineENV.ps1

# Verify tools
python --version
cargo --version
bun --version
```

---

### Functions Not Available
**Symptom**: `new-python` command not found

**Solution**:
```powershell
# Load functions manually
. .\.poly_gluttony\claudineENV_F.ps1

# Or use Full profile next time
# Terminal dropdown → "Claudine Polyglot (Full)"
```

---

## 📚 See Also

- [claudineENV_REFERENCE.md](../.poly_gluttony/claudine_docs/claudineENV_REFERENCE.md) - Environment activation reference
- [claudineENV_F_REFERENCE.md](../.poly_gluttony/claudine_docs/claudineENV_F_REFERENCE.md) - Functions library reference
- [Setup-ClaudineProfile.ps1](../scripts/Setup-ClaudineProfile.ps1) - User profile setup script

---

**Last Updated**: November 5, 2025  
**Tested On**: Windows 11, PowerShell 7.4+, VS Code 1.95+
