/**
 * 🔥 Claudine CLI Activation Command
 * 
 * Environment activation for polyglot development
 * Ports functionality from claudineENV.ps1 to TypeScript
 * 
 * Features:
 * - PATH management (Python, Rust, Ruby, Bun, Go, etc.)
 * - Tool detection and version display
 * - Health checks
 * - Environment variable setup
 */

import { Command } from 'commander';
import { existsSync } from 'fs';
import { homedir, platform } from 'os';
import { join, delimiter } from 'path';
import { execa } from 'execa';
import { logger } from '../../core/logger.js';
import { text, colors, environmentTable, statusCell, withSpinner } from '../../core/ui/index.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ToolInfo {
  name: string;
  command: string;
  versionFlag: string;
  category: 'language' | 'package-manager' | 'tool';
  icon: string;
}

interface ToolStatus {
  tool: string;
  installed: boolean;
  version?: string;
  path?: string;
}

interface ActivationPaths {
  polyglotRoot: string;
  polyglotDir: string;
  paths: {
    python: string[];
    rust: string[];
    ruby: string[];
    bun: string[];
    go: string[];
    tools: string[];
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tool Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TOOLS: ToolInfo[] = [
  // Languages
  { name: 'Python', command: 'python', versionFlag: '--version', category: 'language', icon: '🐍' },
  { name: 'Rust', command: 'rustc', versionFlag: '--version', category: 'language', icon: '🦀' },
  { name: 'Ruby', command: 'ruby', versionFlag: '--version', category: 'language', icon: '💎' },
  { name: 'Bun', command: 'bun', versionFlag: '--version', category: 'language', icon: '🥖' },
  { name: 'Go', command: 'go', versionFlag: 'version', category: 'language', icon: '🐹' },
  { name: 'Node.js', command: 'node', versionFlag: '--version', category: 'language', icon: '🟢' },
  
  // Package Managers
  { name: 'uv', command: 'uv', versionFlag: '--version', category: 'package-manager', icon: '📦' },
  { name: 'cargo', command: 'cargo', versionFlag: '--version', category: 'package-manager', icon: '📦' },
  { name: 'gem', command: 'gem', versionFlag: '--version', category: 'package-manager', icon: '📦' },
  { name: 'npm', command: 'npm', versionFlag: '--version', category: 'package-manager', icon: '📦' },
  
  // Tools
  { name: 'Git', command: 'git', versionFlag: '--version', category: 'tool', icon: '🔧' },
  { name: 'gopls', command: 'gopls', versionFlag: 'version', category: 'tool', icon: '🔧' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Path Detection
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function detectPolyglotPaths(): ActivationPaths | null {
  // Try common locations
  const candidates = [
    join(homedir(), 'PsychoNoir-Kontrapunkt', '.poly_gluttony'),
    join(process.cwd(), '.poly_gluttony'),
    join(homedir(), '.claudine'),
    process.env.CLAUDINE_ROOT,
  ].filter(Boolean) as string[];
  
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      const root = join(candidate, '..');
      return {
        polyglotRoot: root,
        polyglotDir: candidate,
        paths: buildPaths(candidate),
      };
    }
  }
  
  return null;
}

function buildPaths(polyglotDir: string): ActivationPaths['paths'] {
  return {
    python: [
      join(polyglotDir, 'tools', 'ruff', 'Scripts'),
      join(polyglotDir, 'tools', 'black', 'Scripts'),
      join(polyglotDir, 'tools', 'pytest', 'Scripts'),
      join(polyglotDir, 'uv', 'bin'),
    ],
    rust: [
      join(polyglotDir, 'rust', 'bin'),
    ],
    ruby: [
      join(polyglotDir, 'ruby', 'bin'),
      join(polyglotDir, 'msys64', 'ucrt64', 'bin'),
    ],
    bun: [
      join(polyglotDir, 'bun', 'bin'),
    ],
    go: [
      join(polyglotDir, 'go', 'bin'),
      join(polyglotDir, 'go_workspace', 'bin'),
    ],
    tools: [
      join(polyglotDir, 'tools', '7zip'),
    ],
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tool Checking
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function checkTool(tool: ToolInfo): Promise<ToolStatus> {
  try {
    const result = await execa(tool.command, [tool.versionFlag], {
      timeout: 5000,
      reject: false,
    });
    
    if (result.exitCode === 0) {
      const version = (result.stdout || result.stderr).trim().split('\n')[0];
      return {
        tool: tool.name,
        installed: true,
        version: cleanVersion(version),
      };
    }
    
    return {
      tool: tool.name,
      installed: false,
    };
  } catch (error) {
    return {
      tool: tool.name,
      installed: false,
    };
  }
}

function cleanVersion(version: string): string {
  // Remove ANSI codes and extra whitespace
  return version
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATH Management
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function activateEnvironment(paths: ActivationPaths): string {
  const existingPath = process.env.PATH || '';
  const newPaths: string[] = [];
  
  // Add all polyglot paths
  for (const category of Object.values(paths.paths)) {
    for (const path of category) {
      if (existsSync(path)) {
        newPaths.push(path);
      }
    }
  }
  
  // Deduplicate and combine with existing PATH
  const allPaths = [...newPaths, ...existingPath.split(delimiter)];
  const uniquePaths = Array.from(new Set(allPaths.filter(p => p.length > 0)));
  
  return uniquePaths.join(delimiter);
}

function setEnvironmentVariables(paths: ActivationPaths): void {
  // Claudine markers
  process.env.CLAUDINE_ACTIVATED = 'claudine-cli';
  process.env.CLAUDINE_VERSION = '2.0.0';
  process.env.CLAUDINE_ROOT = paths.polyglotDir;
  
  // Python
  process.env.UV_TOOL_DIR = join(paths.polyglotDir, 'tools');
  
  // Rust
  process.env.CARGO_HOME = join(paths.polyglotDir, 'rust');
  process.env.RUSTUP_HOME = join(paths.polyglotDir, 'rust', 'rustup');
  
  // Go
  const goWorkspace = join(paths.polyglotDir, 'go_workspace');
  if (existsSync(goWorkspace)) {
    process.env.GOPATH = goWorkspace;
  }
  
  // Update PATH
  process.env.PATH = activateEnvironment(paths);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Display Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function displayStatus(options: { verbose?: boolean; json?: boolean }): Promise<void> {
  if (!options.json) {
    console.log(`\n${text.logo} ${colors.brand.primary('CLAUDINE POLYGLOT ENVIRONMENT')}\n`);
  }
  
  const statuses = await withSpinner(
    'Checking tools...',
    async () => await Promise.all(TOOLS.map(checkTool))
  );
  
  if (options.json) {
    console.log(JSON.stringify(statuses, null, 2));
    return;
  }
  
  // Group by category
  const byCategory = {
    language: statuses.filter(s => TOOLS.find(t => t.name === s.tool)?.category === 'language'),
    'package-manager': statuses.filter(s => TOOLS.find(t => t.name === s.tool)?.category === 'package-manager'),
    tool: statuses.filter(s => TOOLS.find(t => t.name === s.tool)?.category === 'tool'),
  };
  
  // Display by category
  for (const [category, tools] of Object.entries(byCategory)) {
    if (tools.length === 0) continue;
    
    const icon = category === 'language' ? '🌍' : category === 'package-manager' ? '📦' : '🔧';
    console.log(`${icon} ${colors.brand.accent(category.toUpperCase().replace('-', ' '))}:`);
    
    for (const status of tools) {
      const toolInfo = TOOLS.find(t => t.name === status.tool);
      const icon = toolInfo?.icon || '  ';
      
      if (status.installed) {
        console.log(text.bullet(`${icon} ${colors.success(status.tool)}: ${colors.dim(status.version!)}`));
      } else {
        console.log(text.bullet(`${icon} ${colors.error(status.tool)}: ${colors.muted('not installed')}`));
      }
    }
    console.log();
  }
  
  // Summary
  const installed = statuses.filter(s => s.installed).length;
  const total = statuses.length;
  
  console.log(text.section('Summary:'));
  console.log(text.bullet(colors.success(`Installed: ${installed}/${total}`)));
  
  if (installed < total) {
    console.log(text.bullet(colors.warning(`Missing: ${total - installed}`)));
  } else {
    console.log(text.success('All tools installed! 🎉'));
  }
  
  console.log();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Command Definition
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const activateCommand = new Command('activate')
  .description('Activate polyglot development environment')
  .option('-s, --status', 'Show environment status without activating')
  .option('-v, --verbose', 'Show detailed information')
  .option('--json', 'Output as JSON')
  .option('--shell <shell>', 'Generate shell script for activation (bash, zsh, fish, pwsh)')
  .action(async (options) => {
    try {
      // Detect polyglot installation
      const paths = detectPolyglotPaths();
      
      if (!paths) {
        console.log(colors.error('❌ Polyglot environment not found'));
        console.log(colors.muted('  Looking for .poly_gluttony directory...'));
        console.log();
        console.log(text.section('Possible solutions:'));
        console.log(text.bullet('Run setup script: ' + text.code('setup_polyglot_v2.ps1')));
        console.log(text.bullet('Set CLAUDINE_ROOT environment variable'));
        console.log(text.bullet('Create .poly_gluttony in project root'));
        console.log();
        process.exit(1);
      }
      
      // Status mode
      if (options.status) {
        await displayStatus(options);
        return;
      }
      
      // Shell script generation mode
      if (options.shell) {
        generateShellScript(paths, options.shell);
        return;
      }
      
      // Normal activation mode
      console.log(`\n${text.logo} ${colors.brand.primary('Activating polyglot environment...')}\n`);
      
      setEnvironmentVariables(paths);
      
      console.log(text.success('Environment activated!'));
      console.log();
      console.log(text.section('Environment variables set:'));
      console.log(text.bullet(`CLAUDINE_ACTIVATED: ${colors.info('claudine-cli')}`));
      console.log(text.bullet(`CLAUDINE_ROOT: ${colors.dim(paths.polyglotDir)}`));
      console.log(text.bullet(`PATH: ${colors.success('updated')}`));
      console.log();
      
      await displayStatus({ verbose: false, json: false });
      
      console.log(text.section('Next steps:'));
      console.log(text.bullet('Run ' + text.code('claudine env health') + ' for full diagnostics'));
      console.log(text.bullet('Run ' + text.code('claudine project new') + ' to create a project'));
      console.log();
      
    } catch (error) {
      logger.error('Activation failed', error as Error);
      process.exit(1);
    }
  });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shell Script Generation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function generateShellScript(paths: ActivationPaths, shell: string): void {
  const newPath = activateEnvironment(paths);
  
  switch (shell.toLowerCase()) {
    case 'bash':
    case 'zsh':
      console.log('#!/bin/bash');
      console.log('# Claudine Polyglot Environment Activation');
      console.log();
      console.log(`export CLAUDINE_ACTIVATED="claudine-cli"`);
      console.log(`export CLAUDINE_ROOT="${paths.polyglotDir}"`);
      console.log(`export PATH="${newPath}"`);
      console.log(`export CARGO_HOME="${join(paths.polyglotDir, 'rust')}"`);
      console.log(`export GOPATH="${join(paths.polyglotDir, 'go_workspace')}"`);
      break;
      
    case 'fish':
      console.log('# Claudine Polyglot Environment Activation');
      console.log();
      console.log(`set -gx CLAUDINE_ACTIVATED "claudine-cli"`);
      console.log(`set -gx CLAUDINE_ROOT "${paths.polyglotDir}"`);
      console.log(`set -gx PATH "${newPath.split(delimiter).join('" "')}"`);
      break;
      
    case 'pwsh':
    case 'powershell':
      console.log('# Claudine Polyglot Environment Activation');
      console.log();
      console.log(`$env:CLAUDINE_ACTIVATED = "claudine-cli"`);
      console.log(`$env:CLAUDINE_ROOT = "${paths.polyglotDir}"`);
      console.log(`$env:PATH = "${newPath}"`);
      console.log(`$env:CARGO_HOME = "${join(paths.polyglotDir, 'rust')}"`);
      console.log(`$env:GOPATH = "${join(paths.polyglotDir, 'go_workspace')}"`);
      break;
      
    default:
      console.error(colors.error(`Unknown shell: ${shell}`));
      console.error(colors.muted('Supported shells: bash, zsh, fish, pwsh'));
      process.exit(1);
  }
}
