#!/usr/bin/env node

/**
 * Validation script for orchestrator architecture
 * 
 * This script validates that:
 * 1. All commands are properly registered
 * 2. Orchestrator tool mappings are defined
 * 3. Config schema is valid
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Validating Orchestrator Architecture\n');

let errors = 0;
let warnings = 0;

// Check 1: Verify cli.ts has all command imports
console.log('✓ Checking cli.ts command imports...');
const cliContent = readFileSync(join(__dirname, '../src/cli.ts'), 'utf-8');

const requiredImports = [
  'createCommand',
  'activateCommand',
  'registerHealthCommand',
  'registerDetectCommand'
];

for (const importName of requiredImports) {
  if (!cliContent.includes(importName)) {
    console.error(`  ✗ Missing import: ${importName}`);
    errors++;
  } else {
    console.log(`  ✓ Found import: ${importName}`);
  }
}

// Check 2: Verify commands are registered
console.log('\n✓ Checking command registrations...');
const requiredRegistrations = [
  'addCommand(createCommand)',
  'addCommand(activateCommand)',
  'registerHealthCommand(program)',
  'registerDetectCommand(program)'
];

for (const registration of requiredRegistrations) {
  if (!cliContent.includes(registration)) {
    console.error(`  ✗ Missing registration: ${registration}`);
    errors++;
  } else {
    console.log(`  ✓ Found registration: ${registration}`);
  }
}

// Check 3: Verify orchestrator has tool mappings
console.log('\n✓ Checking orchestrator tool mappings...');
const orchestratorContent = readFileSync(
  join(__dirname, '../src/core/orchestrator/orchestrator.ts'),
  'utf-8'
);

const requiredMappings = [
  'project-create-python',
  'project-create-rust',
  'project-create-bun',
  'environment-activate',
  'health-check',
  'detect-languages'
];

for (const mapping of requiredMappings) {
  if (!orchestratorContent.includes(`"${mapping}"`)) {
    console.error(`  ✗ Missing tool mapping: ${mapping}`);
    errors++;
  } else {
    console.log(`  ✓ Found tool mapping: ${mapping}`);
  }
}

// Check 4: Verify config module exports
console.log('\n✓ Checking config module exports...');
const configContent = readFileSync(
  join(__dirname, '../src/core/config/index.ts'),
  'utf-8'
);

const requiredExports = [
  'export function loadConfig',
  'export function getTemplatesForLanguage',
  'export function isToolEnabled',
  'export function getToolsPath'
];

for (const exportName of requiredExports) {
  if (!configContent.includes(exportName)) {
    console.error(`  ✗ Missing export: ${exportName}`);
    errors++;
  } else {
    console.log(`  ✓ Found export: ${exportName}`);
  }
}

// Check 5: Verify all command files exist and have proper structure
console.log('\n✓ Checking command file structure...');
const commandFiles = [
  { name: 'create', path: '../src/commands/create.ts', hasHandler: true },
  { name: 'activate', path: '../src/commands/activate.ts', hasHandler: true },
  { name: 'health', path: '../src/commands/health.ts', hasRegister: true },
  { name: 'detect', path: '../src/commands/detect.ts', hasRegister: true }
];

for (const cmd of commandFiles) {
  try {
    const content = readFileSync(join(__dirname, cmd.path), 'utf-8');
    console.log(`  ✓ Found ${cmd.name} command file`);
    
    if (cmd.hasHandler && !content.includes('CommandHandler')) {
      console.warn(`  ⚠ ${cmd.name} command missing handler function`);
      warnings++;
    }
    
    if (cmd.hasRegister && !content.includes('export function register')) {
      console.warn(`  ⚠ ${cmd.name} command missing register function`);
      warnings++;
    }
    
    if (!content.includes('orchestrator.invoke')) {
      console.error(`  ✗ ${cmd.name} command doesn't use orchestrator`);
      errors++;
    } else {
      console.log(`  ✓ ${cmd.name} command uses orchestrator`);
    }
  } catch (err) {
    console.error(`  ✗ Cannot read ${cmd.name} command file`);
    errors++;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed! Architecture is valid.');
  process.exit(0);
} else if (errors === 0) {
  console.log(`⚠️  Validation passed with ${warnings} warning(s).`);
  process.exit(0);
} else {
  console.log(`❌ Validation failed with ${errors} error(s) and ${warnings} warning(s).`);
  process.exit(1);
}
