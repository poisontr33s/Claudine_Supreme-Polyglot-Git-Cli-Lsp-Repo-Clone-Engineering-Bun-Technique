# 📦 BUILD PIPELINE PATTERNS EXTRACTED

**Extraction Date**: 2025-01-15 (Autonomous Analysis - Task #6)
**Sources**: Gemini CLI (esbuild), GitHub CLI (GoReleaser), research documents
**Purpose**: Design Claudine CLI build & distribution strategy using Bun

---

## 🎯 EXECUTIVE SUMMARY

**Key Findings**:
1. **Gemini CLI**: esbuild bundler → single executable → npm distribution
2. **GitHub CLI**: GoReleaser → cross-platform binaries → GitHub Releases  
3. **Claudine CLI Strategy**: Bun compile → standalone executables → GitHub Releases + npm

**Technologies**:
- **esbuild**: Fast JavaScript bundler (used by Gemini CLI)
- **GoReleaser**: Go release automation (used by GitHub CLI)
- **Bun**: All-in-one JavaScript runtime with native compilation
- **WASM**: WebAssembly support for binaries

---

## 📊 GEMINI CLI BUILD PIPELINE ANALYSIS

### 1. esbuild Configuration

**File**: `research/gemini-cli/esbuild.config.js`

```javascript
import esbuild from 'esbuild';
import path from 'node:path';
import { createRequire } from 'node:module';
import { wasmLoader } from 'esbuild-plugin-wasm';

const require = createRequire(import.meta.url);
const pkg = require(path.resolve(__dirname, 'package.json'));

// WASM Plugin (for binary dependencies)
function createWasmPlugins() {
  const wasmBinaryPlugin = {
    name: 'wasm-binary',
    setup(build) {
      build.onResolve({ filter: /\.wasm\?binary$/ }, (args) => {
        const specifier = args.path.replace(/\?binary$/, '');
        const resolveDir = args.resolveDir || '';
        const isBareSpecifier =
          !path.isAbsolute(specifier) &&
          !specifier.startsWith('./') &&
          !specifier.startsWith('../');

        let resolvedPath;
        if (isBareSpecifier) {
          resolvedPath = require.resolve(specifier, {
            paths: resolveDir ? [resolveDir, __dirname] : [__dirname],
          });
        } else {
          resolvedPath = path.isAbsolute(specifier)
            ? specifier
            : path.join(resolveDir, specifier);
        }

        return { path: resolvedPath, namespace: 'wasm-embedded' };
      });
    },
  };

  return [wasmBinaryPlugin, wasmLoader({ mode: 'embedded' })];
}

// External dependencies (not bundled)
const external = [
  '@lydell/node-pty',       // Native modules
  'node-pty',
  '@lydell/node-pty-darwin-arm64',
  '@lydell/node-pty-darwin-x64',
  '@lydell/node-pty-linux-x64',
  '@lydell/node-pty-win32-arm64',
  '@lydell/node-pty-win32-x64',
];

// Base configuration
const baseConfig = {
  bundle: true,                   // Bundle all dependencies
  platform: 'node',              // Target Node.js
  format: 'esm',                 // ES Modules output
  external,                      // Don't bundle native modules
  loader: { '.node': 'file' },   // Handle .node files
  write: true,                   // Write to disk
};

// CLI-specific configuration
const cliConfig = {
  ...baseConfig,
  banner: {
    // Inject require() and __dirname/__filename for ESM
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url); globalThis.__filename = require('url').fileURLToPath(import.meta.url); globalThis.__dirname = require('path').dirname(globalThis.__filename);`,
  },
  entryPoints: ['packages/cli/index.ts'],
  outfile: 'bundle/gemini.js',
  define: {
    'process.env.CLI_VERSION': JSON.stringify(pkg.version),
  },
  plugins: createWasmPlugins(),
  alias: {
    'is-in-ci': path.resolve(__dirname, 'packages/cli/src/patches/is-in-ci.ts'),
  },
  metafile: true,  // Generate bundle analysis
};

// Build with error handling
Promise.allSettled([
  esbuild.build(cliConfig).then(({ metafile }) => {
    if (process.env.DEV === 'true') {
      writeFileSync('./bundle/esbuild.json', JSON.stringify(metafile, null, 2));
    }
  }),
]).then((results) => {
  const [cliResult] = results;
  if (cliResult.status === 'rejected') {
    console.error('gemini.js build failed:', cliResult.reason);
    process.exit(1);
  }
});
```

**Key Patterns**:
1. ✅ **WASM support**: Custom plugin for WebAssembly binaries
2. ✅ **Native modules external**: Don't bundle platform-specific binaries
3. ✅ **ESM banner**: Inject `require()`, `__dirname`, `__filename` for compatibility
4. ✅ **Metafile generation**: Bundle analysis in dev mode
5. ✅ **Version injection**: Compile-time constants
6. ✅ **Alias support**: Module path remapping

---

### 2. Build Scripts Workflow

**File**: `research/gemini-cli/package.json`

```json
{
  "scripts": {
    // Multi-step build process
    "build": "npm run build --workspaces",
    "bundle": "npm run generate && node esbuild.config.js && node scripts/copy_bundle_assets.js",
    
    // Asset copying
    "copy_bundle_assets": "node scripts/copy_bundle_assets.js",
    
    // Package preparation
    "prepare:package": "node scripts/prepare-package.js",
    
    // Release versioning
    "release:version": "node scripts/version.js",
    
    // Clean build artifacts
    "clean": "node scripts/clean.js"
  },
  
  "bin": {
    "gemini": "bundle/gemini.js"
  },
  
  "files": [
    "bundle/",
    "README.md",
    "LICENSE"
  ]
}
```

**Build Flow**:
```
1. npm run build           → Build workspaces (TypeScript compilation)
2. npm run generate        → Generate code/schemas
3. node esbuild.config.js  → Bundle to single executable
4. node scripts/copy_bundle_assets.js → Copy static assets
5. npm run prepare:package → Prepare for npm publish
```

---

### 3. Asset Copying Script

**File**: `research/gemini-cli/scripts/copy_bundle_assets.js`

```javascript
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const bundleDir = join(root, 'bundle');

// Create bundle directory
if (!existsSync(bundleDir)) {
  mkdirSync(bundleDir);
}

// Find and copy all .sb files (sandbox files)
const sbFiles = glob.sync('packages/**/*.sb', { cwd: root });
for (const file of sbFiles) {
  copyFileSync(join(root, file), join(bundleDir, basename(file)));
}

console.log('Assets copied to bundle/');
```

**Key Patterns**:
- ✅ **Glob patterns**: Find assets across packages
- ✅ **Flatten structure**: Copy to bundle root (simplify distribution)
- ✅ **Create directories**: Ensure bundle/ exists

---

## 🚀 GITHUB CLI BUILD PIPELINE ANALYSIS

### 1. GoReleaser Configuration

**File**: `research/gh-cli/.goreleaser.yml` (inferred from documentation)

```yaml
# GoReleaser configuration (conceptual based on docs)
builds:
  - id: gh
    binary: gh
    env:
      - CGO_ENABLED=0  # Static binary
    goos:
      - linux
      - darwin
      - windows
    goarch:
      - amd64
      - arm64
    ldflags:
      - -s -w  # Strip debug symbols
      - -X main.version={{.Version}}

archives:
  - id: gh-archive
    format: tar.gz
    format_overrides:
      - goos: windows
        format: zip
    files:
      - LICENSE
      - README.md
      - share/man/**/*

release:
  github:
    owner: cli
    name: cli

signs:
  - cmd: gpg
    args:
      - "--batch"
      - "--local-user"
      - "{{ .Env.GPG_FINGERPRINT }}"
      - "--output"
      - "${signature}"
      - "--detach-sign"
      - "${artifact}"
    artifacts: checksum
```

**Key Patterns**:
1. ✅ **Cross-compilation**: Build for multiple OS/arch
2. ✅ **Static binaries**: CGO_ENABLED=0 (no C dependencies)
3. ✅ **Strip symbols**: Reduce binary size (-s -w)
4. ✅ **Version injection**: Compile-time constants
5. ✅ **Platform-specific archives**: .tar.gz (Unix), .zip (Windows)
6. ✅ **GPG signing**: Secure distribution

---

### 2. Release Script

**File**: `research/gh-cli/script/release`

```bash
#!/bin/bash
set -e

print_help() {
    cat <<EOF
To tag a new release:
  script/release [--staging] <tag-name> [--platform {linux|macos|windows}] [--branch <branch>]

To build staging binaries from the current branch:
  script/release --current [--platform {linux|macos|windows}]

To build binaries locally with goreleaser:
  script/release --local --platform {linux|macos|windows}
EOF
}

# Parse arguments
tag_name=""
is_local=""
platform=""
branch="trunk"
deploy_env="production"

# Trigger GitHub Actions deployment
trigger_deployment() {
  announce gh workflow -R cli/cli run deployment.yml \
    --ref "$branch" \
    -f tag_name="$tag_name" \
    -f environment="$deploy_env"
}

# Build locally with GoReleaser
build_local() {
  local goreleaser_config=".goreleaser.yml"
  
  case "$platform" in
  linux )
    sed '/#build:windows/,/^$/d; /#build:macos/,/^$/d' .goreleaser.yml >.goreleaser.generated.yml
    goreleaser_config=".goreleaser.generated.yml"
    ;;
  macos )
    sed '/#build:windows/,/^$/d; /#build:linux/,/^$/d' .goreleaser.yml >.goreleaser.generated.yml
    goreleaser_config=".goreleaser.generated.yml"
    ;;
  windows )
    sed '/#build:linux/,/^$/d; /#build:macos/,/^$/d' .goreleaser.yml >.goreleaser.generated.yml
    goreleaser_config=".goreleaser.generated.yml"
    ;;
  esac
  
  [ -z "$tag_name" ] || export GORELEASER_CURRENT_TAG="$tag_name"
  announce goreleaser release -f "$goreleaser_config" --clean --skip-validate --skip-publish --release-notes="$(mktemp)"
}
```

**Key Patterns**:
- ✅ **Platform filtering**: Modify GoReleaser config per platform
- ✅ **Local builds**: Test release builds locally
- ✅ **GitHub Actions integration**: Trigger workflows remotely
- ✅ **Environment support**: Production vs staging

---

### 3. GitHub Actions Workflow

**File**: `research/gh-cli/.github/workflows/deployment.yml` (from docs)

```yaml
name: Deployment
on:
  workflow_dispatch:
    inputs:
      tag_name:
        required: true
      environment:
        required: true
      platforms:
        required: true

jobs:
  linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version-file: 'go.mod'
      - uses: goreleaser/goreleaser-action@v6
        with:
          version: "~1.17.1"
          install-only: true
      - run: script/release --local "$TAG_NAME" --platform linux
      - uses: actions/upload-artifact@v4
        with:
          name: linux
          path: dist/

  macos:
    runs-on: macos-latest
    steps:
      # Same as linux, but with code signing
      - run: codesign --sign "$CERT_ID" dist/gh_*_darwin_amd64/gh
      
  windows:
    runs-on: windows-latest
    steps:
      # Same as linux, but builds MSI installers
      - run: MSBuild.exe ./build/windows/gh.wixproj

  release:
    needs: [linux, macos, windows]
    runs-on: ubuntu-latest
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/**/*
```

**Key Patterns**:
1. ✅ **Matrix builds**: Parallel builds per platform
2. ✅ **Artifact upload/download**: Share builds between jobs
3. ✅ **Code signing**: macOS/Windows signing
4. ✅ **Release automation**: Auto-create GitHub Release

---

## 🦊 BUN COMPILATION STRATEGY

### 1. Bun Native Compilation

**Bun's Built-in Compiler**:
```bash
# Bun can compile TypeScript to standalone executable
bun build ./cli.ts --compile --outfile claudine

# Cross-compilation support (experimental)
bun build ./cli.ts --compile --target=bun-windows-x64 --outfile claudine.exe
bun build ./cli.ts --compile --target=bun-darwin-x64 --outfile claudine-macos
bun build ./cli.ts --compile --target=bun-linux-x64 --outfile claudine-linux
```

**Supported Targets** (Bun 1.3+):
- `bun-linux-x64`
- `bun-linux-arm64`
- `bun-darwin-x64`
- `bun-darwin-arm64`
- `bun-windows-x64`

**Features**:
- ✅ **Single binary**: Includes Bun runtime + code
- ✅ **No dependencies**: Fully standalone
- ✅ **Fast startup**: Native executable
- ✅ **Cross-compilation**: Build for any platform from any platform

---

### 2. Bun Build Configuration

**File**: `claudine-cli/build.config.ts`

```typescript
// Bun build configuration
import { BuildConfig } from 'bun';

export default {
  entrypoints: ['./src/cli.ts'],
  outdir: './dist',
  target: 'bun',
  splitting: false,  // Single bundle
  sourcemap: 'external',
  minify: process.env.NODE_ENV === 'production',
  define: {
    'process.env.CLI_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  external: [
    // No externals needed - Bun bundles everything
  ],
} satisfies BuildConfig;
```

---

### 3. Build Scripts for Claudine CLI

**File**: `claudine-cli/package.json`

```json
{
  "name": "claudine-cli",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    // Development
    "dev": "bun run src/cli.ts",
    
    // Build single-file bundle (not executable)
    "build": "bun build src/cli.ts --outdir dist --target bun --minify",
    
    // Compile standalone executables
    "compile": "bun run scripts/compile.ts",
    "compile:linux": "bun build src/cli.ts --compile --target=bun-linux-x64 --outfile dist/claudine-linux-x64",
    "compile:macos": "bun build src/cli.ts --compile --target=bun-darwin-arm64 --outfile dist/claudine-macos-arm64",
    "compile:windows": "bun build src/cli.ts --compile --target=bun-windows-x64 --outfile dist/claudine-windows-x64.exe",
    "compile:all": "bun run compile:linux && bun run compile:macos && bun run compile:windows",
    
    // Package for distribution
    "package": "bun run scripts/package.ts",
    
    // Release
    "release": "bun run scripts/release.ts"
  },
  "bin": {
    "claudine": "./dist/claudine.js"
  },
  "files": [
    "dist/",
    "README.md",
    "LICENSE"
  ]
}
```

---

### 4. Cross-Platform Compilation Script

**File**: `claudine-cli/scripts/compile.ts`

```typescript
#!/usr/bin/env bun
/**
 * Cross-platform compilation script for Claudine CLI
 * Builds standalone executables for all platforms
 */

import { $ } from 'bun';
import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';

const distDir = join(import.meta.dir, '..', 'dist');
const version = process.env.npm_package_version || '0.0.0';

// Ensure dist directory exists
await mkdir(distDir, { recursive: true });

const targets = [
  { platform: 'linux', arch: 'x64', ext: '' },
  { platform: 'linux', arch: 'arm64', ext: '' },
  { platform: 'darwin', arch: 'x64', ext: '' },
  { platform: 'darwin', arch: 'arm64', ext: '' },
  { platform: 'windows', arch: 'x64', ext: '.exe' },
];

console.log('🔨 Compiling Claudine CLI for all platforms...\n');

for (const target of targets) {
  const { platform, arch, ext } = target;
  const targetName = `bun-${platform}-${arch}`;
  const outfile = join(distDir, `claudine-${platform}-${arch}${ext}`);
  
  console.log(`📦 Building for ${platform}-${arch}...`);
  
  try {
    await $`bun build src/cli.ts --compile --target=${targetName} --outfile=${outfile}`;
    console.log(`✅ ${platform}-${arch} compiled successfully\n`);
  } catch (error) {
    console.error(`❌ ${platform}-${arch} compilation failed:`, error);
    process.exit(1);
  }
}

console.log('🎉 All platforms compiled successfully!');
console.log(`📂 Executables available in: ${distDir}`);
```

---

### 5. Packaging Script (Create Archives)

**File**: `claudine-cli/scripts/package.ts`

```typescript
#!/usr/bin/env bun
/**
 * Package compiled binaries into distributable archives
 * Creates .tar.gz for Unix, .zip for Windows
 */

import { $ } from 'bun';
import { join } from 'node:path';
import { readdir } from 'node:fs/promises';

const distDir = join(import.meta.dir, '..', 'dist');
const releaseDir = join(distDir, 'release');

// Ensure release directory exists
await Bun.write(join(releaseDir, '.gitkeep'), '');

console.log('📦 Packaging Claudine CLI executables...\n');

const files = await readdir(distDir);
const executables = files.filter(f => 
  f.startsWith('claudine-') && (f.endsWith('.exe') || !f.includes('.'))
);

for (const exe of executables) {
  const exePath = join(distDir, exe);
  const isWindows = exe.endsWith('.exe');
  const archiveName = exe.replace('.exe', isWindows ? '.zip' : '.tar.gz');
  const archivePath = join(releaseDir, archiveName);
  
  console.log(`📦 Packaging ${exe}...`);
  
  try {
    if (isWindows) {
      // Create .zip for Windows
      await $`cd ${distDir} && zip ${archivePath} ${exe} ../README.md ../LICENSE`;
    } else {
      // Create .tar.gz for Unix
      await $`cd ${distDir} && tar -czf ${archivePath} ${exe} ../README.md ../LICENSE`;
    }
    console.log(`✅ ${archiveName} created\n`);
  } catch (error) {
    console.error(`❌ Failed to package ${exe}:`, error);
    process.exit(1);
  }
}

console.log('🎉 All archives created successfully!');
console.log(`📂 Archives available in: ${releaseDir}`);
```

---

## 🚀 GITHUB ACTIONS WORKFLOW FOR CLAUDINE CLI

**File**: `.github/workflows/release.yml`

```yaml
name: Release Claudine CLI

on:
  push:
    tags:
      - 'v*.*.*'

permissions:
  contents: write

jobs:
  build:
    name: Build ${{ matrix.platform }}-${{ matrix.arch }}
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            platform: linux
            arch: x64
          - os: ubuntu-latest
            platform: linux
            arch: arm64
          - os: macos-latest
            platform: darwin
            arch: x64
          - os: macos-latest
            platform: darwin
            arch: arm64
          - os: windows-latest
            platform: windows
            arch: x64

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build executable
        run: bun run compile:${{ matrix.platform }}

      - name: Package executable
        run: bun run package

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: claudine-${{ matrix.platform }}-${{ matrix.arch }}
          path: dist/release/*

  release:
    name: Create GitHub Release
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: dist/release

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/release/**/*
          draft: false
          prerelease: false
          generate_release_notes: true
```

**Key Features**:
- ✅ **Matrix builds**: Parallel compilation for all platforms
- ✅ **Artifact sharing**: Upload/download between jobs
- ✅ **Auto-release**: Create GitHub Release on tag push
- ✅ **Release notes**: Auto-generated from commits

---

## 📊 COMPARISON TABLE

| Feature | Gemini CLI (esbuild) | GitHub CLI (GoReleaser) | Claudine CLI (Bun) |
|---------|---------------------|------------------------|-------------------|
| **Build Tool** | esbuild | GoReleaser + Go compiler | Bun native compiler |
| **Output** | Single JS bundle | Native binaries per platform | Native binaries per platform |
| **Dependencies** | Node.js runtime required | Fully standalone | Bun runtime included |
| **Bundle Size** | ~5 MB (JS) | ~10-20 MB per platform | ~40-50 MB per platform |
| **Cross-Compilation** | N/A (JS is portable) | Yes (GOOS/GOARCH) | Yes (--target flag) |
| **WASM Support** | Via plugins | Via CGO | Native support |
| **Distribution** | npm + GitHub Releases | GitHub Releases + package managers | GitHub Releases + npm |
| **Code Signing** | No | Yes (macOS, Windows) | Manual |
| **Speed** | Fast (esbuild) | Fast (Go compiler) | Very fast (Bun) |

---

## 🎯 CLAUDINE CLI BUILD STRATEGY

### Phase 1: Development Build ✅
```bash
# Quick development iteration
bun run dev  # Directly run src/cli.ts
```

### Phase 2: Testing Build
```bash
# Build single bundle for testing
bun run build  # Creates dist/claudine.js
bun dist/claudine.js --help  # Test bundle
```

### Phase 3: Local Compilation
```bash
# Compile for current platform only
bun run compile:linux     # → dist/claudine-linux-x64
bun run compile:macos     # → dist/claudine-macos-arm64
bun run compile:windows   # → dist/claudine-windows-x64.exe
```

### Phase 4: CI/CD Release
```bash
# GitHub Actions automatically:
# 1. Compiles all platforms in parallel
# 2. Creates archives (.tar.gz, .zip)
# 3. Uploads to GitHub Releases
# 4. Publishes to npm (optional)
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Basic Build Scripts ✅ (Complete)
- [x] package.json scripts structure
- [x] bun build configuration
- [x] Development workflow (bun run dev)

### Phase 2: Compilation Scripts 🚧 (Next)
- [ ] Create `scripts/compile.ts` (cross-platform compilation)
- [ ] Create `scripts/package.ts` (archive creation)
- [ ] Test local compilation for all platforms
- [ ] Verify binary sizes and startup times

### Phase 3: GitHub Actions Workflow
- [ ] Create `.github/workflows/release.yml`
- [ ] Configure matrix builds
- [ ] Test artifact upload/download
- [ ] Test release creation

### Phase 4: Distribution
- [ ] Setup GitHub Releases
- [ ] Configure npm publish (optional)
- [ ] Create installation documentation
- [ ] Add version checking to CLI

---

## 📝 BEST PRACTICES EXTRACTED

### 1. Build Configuration
- ✅ **Single entry point**: One main CLI file
- ✅ **Version injection**: Compile-time constants
- ✅ **Minification**: Reduce bundle size in production
- ✅ **Source maps**: Enable debugging when needed

### 2. Cross-Platform Support
- ✅ **Target all platforms**: Linux, macOS, Windows
- ✅ **Architecture support**: x64 and arm64
- ✅ **File extensions**: .exe for Windows, none for Unix
- ✅ **Archive formats**: .tar.gz (Unix), .zip (Windows)

### 3. CI/CD Integration
- ✅ **Matrix builds**: Parallel compilation
- ✅ **Artifact caching**: Speed up workflows
- ✅ **Auto-release**: Trigger on git tags
- ✅ **Release notes**: Generate from commits

### 4. Distribution
- ✅ **GitHub Releases**: Primary distribution
- ✅ **npm fallback**: For users without binaries
- ✅ **Package managers**: Homebrew, Chocolatey, AUR (future)
- ✅ **Installation scripts**: Automated setup

---

## 🎉 EXTRACTION COMPLETE

**Files Analyzed**:
- ✅ `research/gemini-cli/esbuild.config.js`
- ✅ `research/gemini-cli/scripts/copy_bundle_assets.js`
- ✅ `research/gemini-cli/package.json`
- ✅ `research/gh-cli/script/release`
- ✅ `research/gh-cli/docs/release-process-deep-dive.md`
- ✅ `research/gh-cli/.github/workflows/deployment.yml` (from docs)

**Key Insights**:
1. **Gemini CLI**: Uses esbuild for fast bundling, npm for distribution
2. **GitHub CLI**: Uses GoReleaser for multi-platform binaries, extensive signing
3. **Bun advantages**: Native compilation, built-in cross-platform support, no external tools needed
4. **Strategy**: Bun compile → GitHub Actions matrix builds → GitHub Releases

**Ready for Implementation** ✅

---

*End of Build Pipeline Analysis*
