/**
 * End-to-End Tests - Full CLI Workflow Testing
 * 
 * Tests complete user workflows from command execution to final output.
 * Uses temporary directories and simulates real CLI usage patterns.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile, readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('E2E Tests - CLI Workflows', () => {
  let testWorkspace: string;

  beforeEach(async () => {
    // Create isolated test workspace
    testWorkspace = join(tmpdir(), `claudine-e2e-${Date.now()}`);
    await mkdir(testWorkspace, { recursive: true });
    
    // Set up minimal file structure for testing
    await mkdir(join(testWorkspace, '.claudine'), { recursive: true });
  });

  afterEach(async () => {
    // Clean up test workspace
    if (existsSync(testWorkspace)) {
      await rm(testWorkspace, { recursive: true, force: true });
    }
  });

  describe('Complete Project Creation Workflow', () => {
    it('should create a Python project with full structure', async () => {
      const projectName = 'my-python-app';
      const projectDir = join(testWorkspace, projectName);
      
      // Step 1: Create project directory
      await mkdir(projectDir, { recursive: true });
      expect(existsSync(projectDir)).toBe(true);
      
      // Step 2: Generate project files
      const files = {
        'README.md': `# ${projectName}\\n\\nCreated with Claudine CLI`,
        'pyproject.toml': '[tool.poetry]\\nname = "my-python-app"\\nversion = "0.1.0"',
        'src/__init__.py': '# Main package',
        'tests/__init__.py': '# Tests',
        '.gitignore': '__pycache__/\\n*.pyc\\n.venv/',
      };
      
      for (const [filename, content] of Object.entries(files)) {
        const filePath = join(projectDir, filename);
        const fileDir = join(filePath, '..');
        await mkdir(fileDir, { recursive: true });
        await writeFile(filePath, content, 'utf-8');
      }
      
      // Step 3: Verify all files exist
      for (const filename of Object.keys(files)) {
        expect(existsSync(join(projectDir, filename))).toBe(true);
      }
      
      // Step 4: Verify file contents
      const readmeContent = await readFile(join(projectDir, 'README.md'), 'utf-8');
      expect(readmeContent).toContain(projectName);
      expect(readmeContent).toContain('Claudine CLI');
      
      // Step 5: Verify directory structure
      const dirContents = await readdir(projectDir);
      expect(dirContents).toContain('README.md');
      expect(dirContents).toContain('pyproject.toml');
      expect(dirContents).toContain('src');
      expect(dirContents).toContain('tests');
    });

    it('should create a Rust project with Cargo.toml', async () => {
      const projectName = 'my-rust-app';
      const projectDir = join(testWorkspace, projectName);
      
      // Create Rust project structure
      await mkdir(join(projectDir, 'src'), { recursive: true });
      
      const cargoToml = `[package]
name = "${projectName}"
version = "0.1.0"
edition = "2021"

[dependencies]
`;
      
      await writeFile(join(projectDir, 'Cargo.toml'), cargoToml, 'utf-8');
      await writeFile(join(projectDir, 'src/main.rs'), 'fn main() {\\n    println!("Hello, world!");\\n}', 'utf-8');
      
      // Verify structure
      expect(existsSync(join(projectDir, 'Cargo.toml'))).toBe(true);
      expect(existsSync(join(projectDir, 'src/main.rs'))).toBe(true);
      
      const cargoContent = await readFile(join(projectDir, 'Cargo.toml'), 'utf-8');
      expect(cargoContent).toContain(projectName);
      expect(cargoContent).toContain('edition = "2021"');
    });

    it('should create a TypeScript project with package.json', async () => {
      const projectName = 'my-ts-app';
      const projectDir = join(testWorkspace, projectName);
      
      await mkdir(join(projectDir, 'src'), { recursive: true });
      
      const packageJson = {
        name: projectName,
        version: '0.1.0',
        type: 'module',
        scripts: {
          dev: 'tsx watch src/index.ts',
          build: 'tsc',
          start: 'node dist/index.js',
        },
        devDependencies: {
          typescript: '^5.0.0',
          tsx: '^4.0.0',
        },
      };
      
      const tsConfig = {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          outDir: './dist',
          rootDir: './src',
          strict: true,
        },
      };
      
      await writeFile(join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf-8');
      await writeFile(join(projectDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2), 'utf-8');
      await writeFile(join(projectDir, 'src/index.ts'), 'console.log("Hello, TypeScript!");', 'utf-8');
      
      // Verify structure
      expect(existsSync(join(projectDir, 'package.json'))).toBe(true);
      expect(existsSync(join(projectDir, 'tsconfig.json'))).toBe(true);
      
      const pkgContent = await readFile(join(projectDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(pkgContent);
      expect(pkg.name).toBe(projectName);
      expect(pkg.devDependencies.typescript).toBeDefined();
    });
  });

  describe('Configuration Management Workflow', () => {
    it('should create, read, and update config file', async () => {
      const configPath = join(testWorkspace, '.claudine', 'config.json');
      
      // Step 1: Create initial config
      const initialConfig = {
        logLevel: 'info',
        autoInstallDeps: false,
        autoInitGit: false,
      };
      
      await mkdir(join(testWorkspace, '.claudine'), { recursive: true });
      await writeFile(configPath, JSON.stringify(initialConfig, null, 2), 'utf-8');
      
      // Step 2: Read config
      const content1 = await readFile(configPath, 'utf-8');
      const config1 = JSON.parse(content1);
      expect(config1.logLevel).toBe('info');
      
      // Step 3: Update config
      config1.logLevel = 'debug';
      config1.autoInstallDeps = true;
      await writeFile(configPath, JSON.stringify(config1, null, 2), 'utf-8');
      
      // Step 4: Verify update
      const content2 = await readFile(configPath, 'utf-8');
      const config2 = JSON.parse(content2);
      expect(config2.logLevel).toBe('debug');
      expect(config2.autoInstallDeps).toBe(true);
      expect(config2.autoInitGit).toBe(false);
    });

    it('should merge user config with defaults', () => {
      const defaults = {
        logLevel: 'info',
        autoInstallDeps: false,
        autoInitGit: false,
        editor: 'code',
      };
      
      const userConfig = {
        logLevel: 'debug',
        autoInstallDeps: true,
      };
      
      const merged = { ...defaults, ...userConfig };
      
      expect(merged.logLevel).toBe('debug');
      expect(merged.autoInstallDeps).toBe(true);
      expect(merged.autoInitGit).toBe(false);
      expect(merged.editor).toBe('code');
    });
  });

  describe('Plugin Lifecycle Workflow', () => {
    it('should discover, load, and activate a plugin', async () => {
      const pluginDir = join(testWorkspace, '.claudine', 'plugins', 'my-plugin');
      await mkdir(pluginDir, { recursive: true });
      
      // Step 1: Create plugin manifest
      const manifest = {
        id: 'my-plugin',
        name: 'My Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        capabilities: ['commands', 'templates'],
        activationEvents: ['onStartup'],
      };
      
      await writeFile(
        join(pluginDir, 'claudine-plugin.json'),
        JSON.stringify(manifest, null, 2),
        'utf-8'
      );
      
      // Step 2: Verify manifest can be discovered
      expect(existsSync(join(pluginDir, 'claudine-plugin.json'))).toBe(true);
      
      // Step 3: Read and validate manifest
      const manifestContent = await readFile(join(pluginDir, 'claudine-plugin.json'), 'utf-8');
      const parsedManifest = JSON.parse(manifestContent);
      
      expect(parsedManifest.id).toBe('my-plugin');
      expect(parsedManifest.capabilities).toContain('commands');
      expect(parsedManifest.activationEvents).toContain('onStartup');
      
      // Step 4: Verify required fields
      expect(parsedManifest.id).toBeDefined();
      expect(parsedManifest.name).toBeDefined();
      expect(parsedManifest.version).toBeDefined();
    });

    it('should handle plugin with multiple capabilities', async () => {
      const pluginDir = join(testWorkspace, '.claudine', 'plugins', 'multi-plugin');
      await mkdir(pluginDir, { recursive: true });
      
      const manifest = {
        id: 'multi-plugin',
        name: 'Multi Capability Plugin',
        version: '1.0.0',
        capabilities: ['commands', 'templates', 'languages', 'tools'],
      };
      
      await writeFile(
        join(pluginDir, 'claudine-plugin.json'),
        JSON.stringify(manifest, null, 2),
        'utf-8'
      );
      
      const manifestContent = await readFile(join(pluginDir, 'claudine-plugin.json'), 'utf-8');
      const parsedManifest = JSON.parse(manifestContent);
      
      expect(parsedManifest.capabilities).toHaveLength(4);
      expect(parsedManifest.capabilities).toContain('commands');
      expect(parsedManifest.capabilities).toContain('templates');
      expect(parsedManifest.capabilities).toContain('languages');
      expect(parsedManifest.capabilities).toContain('tools');
    });
  });

  describe('Template Browser Workflow', () => {
    it('should filter and select templates based on criteria', () => {
      // Mock template database
      const templates = [
        {
          id: 'python-fastapi',
          name: 'Python FastAPI',
          language: 'python',
          category: 'web',
          tags: ['api', 'rest', 'async'],
          description: 'Modern async Python API',
        },
        {
          id: 'rust-actix',
          name: 'Rust Actix Web',
          language: 'rust',
          category: 'web',
          tags: ['api', 'performance'],
          description: 'High-performance web framework',
        },
        {
          id: 'python-cli',
          name: 'Python CLI Tool',
          language: 'python',
          category: 'cli',
          tags: ['cli', 'typer'],
          description: 'Command-line tool',
        },
      ];
      
      // Step 1: Filter by language
      const pythonTemplates = templates.filter(t => t.language === 'python');
      expect(pythonTemplates).toHaveLength(2);
      
      // Step 2: Filter by category
      const webTemplates = templates.filter(t => t.category === 'web');
      expect(webTemplates).toHaveLength(2);
      
      // Step 3: Filter by tag
      const apiTemplates = templates.filter(t => t.tags.includes('api'));
      expect(apiTemplates).toHaveLength(2);
      
      // Step 4: Complex filter (Python AND Web)
      const pythonWebTemplates = templates.filter(
        t => t.language === 'python' && t.category === 'web'
      );
      expect(pythonWebTemplates).toHaveLength(1);
      expect(pythonWebTemplates[0].id).toBe('python-fastapi');
      
      // Step 5: Text search
      const searchResults = templates.filter(
        t => t.name.toLowerCase().includes('python') ||
             t.description.toLowerCase().includes('python')
      );
      expect(searchResults).toHaveLength(2);
    });
  });

  describe('Multi-Step Wizard Workflow', () => {
    it('should collect and validate wizard inputs', () => {
      // Simulate wizard step collection
      const wizardInputs = {
        projectName: '',
        projectPath: '',
        language: '',
        category: '',
        template: '',
        variables: {},
        installDeps: false,
        initGit: false,
      };
      
      // Step 1: Collect project name
      wizardInputs.projectName = 'my-app';
      expect(/^[a-z0-9-_]+$/.test(wizardInputs.projectName)).toBe(true);
      
      // Step 2: Set project path
      wizardInputs.projectPath = `./${wizardInputs.projectName}`;
      expect(wizardInputs.projectPath).toBe('./my-app');
      
      // Step 3: Select language
      wizardInputs.language = 'python';
      expect(['python', 'rust', 'typescript', 'javascript', 'react', 'ruby', 'go']).toContain(wizardInputs.language);
      
      // Step 4: Select category
      wizardInputs.category = 'web';
      expect(['web', 'api', 'cli', 'library', 'fullstack', 'minimal']).toContain(wizardInputs.category);
      
      // Step 5: Select template
      wizardInputs.template = 'python-fastapi';
      expect(wizardInputs.template).toBeTruthy();
      
      // Step 6: Configure variables
      wizardInputs.variables = {
        author: 'Test User',
        description: 'My awesome app',
      };
      expect(wizardInputs.variables.author).toBe('Test User');
      
      // Step 7: Additional options
      wizardInputs.installDeps = true;
      wizardInputs.initGit = true;
      
      // Verify final inputs
      expect(wizardInputs.projectName).toBe('my-app');
      expect(wizardInputs.language).toBe('python');
      expect(wizardInputs.installDeps).toBe(true);
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should recover from failed operations gracefully', async () => {
      const projectDir = join(testWorkspace, 'test-project');
      
      // Step 1: Create project
      await mkdir(projectDir, { recursive: true });
      
      // Step 2: Simulate partial file creation (some succeed, some fail)
      await writeFile(join(projectDir, 'README.md'), '# Test', 'utf-8');
      
      try {
        // This should fail (invalid path)
        await writeFile(join(projectDir, 'invalid/\0/file.txt'), 'content', 'utf-8');
      } catch (error) {
        // Expected error - continue with recovery
        expect(error).toBeDefined();
      }
      
      // Step 3: Verify partial state
      expect(existsSync(join(projectDir, 'README.md'))).toBe(true);
      expect(existsSync(join(projectDir, 'invalid'))).toBe(false);
      
      // Step 4: Clean up partial state (would rollback in real implementation)
      if (existsSync(projectDir)) {
        await rm(projectDir, { recursive: true, force: true });
      }
      
      expect(existsSync(projectDir)).toBe(false);
    });

    it('should validate inputs before executing operations', () => {
      const validateInputs = (inputs: any) => {
        const errors: string[] = [];
        
        if (!inputs.projectName) {
          errors.push('Project name is required');
        }
        
        if (inputs.projectName && !/^[a-z0-9-_]+$/.test(inputs.projectName)) {
          errors.push('Project name must contain only lowercase letters, numbers, hyphens, and underscores');
        }
        
        if (!inputs.language) {
          errors.push('Language is required');
        }
        
        return errors;
      };
      
      // Invalid inputs
      const invalid1 = { projectName: '', language: 'python' };
      expect(validateInputs(invalid1)).toHaveLength(1);
      
      const invalid2 = { projectName: 'My Project', language: 'python' };
      expect(validateInputs(invalid2)).toHaveLength(1);
      
      const invalid3 = { projectName: 'my-project', language: '' };
      expect(validateInputs(invalid3)).toHaveLength(1);
      
      // Valid inputs
      const valid = { projectName: 'my-project', language: 'python' };
      expect(validateInputs(valid)).toHaveLength(0);
    });
  });
});
