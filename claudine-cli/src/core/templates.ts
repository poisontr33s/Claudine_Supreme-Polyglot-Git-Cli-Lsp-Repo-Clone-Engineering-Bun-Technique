/**
 * 🔥💋 Claudine CLI Template System
 * 
 * Inspired by: create-react-app + Gemini CLI extension loading
 * Engine: Handlebars with custom helpers
 * 
 * Features:
 * - Template discovery from ~/.claudine/templates/
 * - Built-in templates for 7 languages
 * - Remote Git template repositories
 * - Variable interpolation: {{projectName}}, {{author}}, {{license}}
 * - Custom Handlebars helpers
 * - Template validation with Zod
 */

import Handlebars from 'handlebars';
import { readFile, readdir, writeFile, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { homedir } from 'os';
import { z } from 'zod';
import { execa } from 'execa';
import { logger } from './logger.js';
import { getConfig } from './config.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Template Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TemplateManifestSchema = z.object({
  name: z.string(),
  description: z.string(),
  language: z.enum(['python', 'rust', 'bun', 'ruby', 'react', 'node', 'go']),
  variant: z.string(), // 'basic', 'web', 'cli', etc.
  version: z.string().default('1.0.0'),
  files: z.array(z.string()), // List of template files
  variables: z.record(z.string()).optional(), // Default variable values
  hooks: z.object({
    postCreate: z.string().optional(), // Command to run after creation
  }).optional(),
});

export type TemplateManifest = z.infer<typeof TemplateManifestSchema>;

export const TemplateVariablesSchema = z.object({
  projectName: z.string(),
  author: z.string().optional(),
  email: z.string().email().optional(),
  license: z.string().default('MIT'),
  description: z.string().optional(),
  version: z.string().default('0.1.0'),
  pythonVersion: z.string().optional(),
  nodeVersion: z.string().optional(),
  rustEdition: z.string().optional(),
});

export type TemplateVariables = z.infer<typeof TemplateVariablesSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Handlebars Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function registerHelpers() {
  // Uppercase helper: {{upper projectName}}
  Handlebars.registerHelper('upper', (str: string) => str.toUpperCase());

  // Lowercase helper: {{lower projectName}}
  Handlebars.registerHelper('lower', (str: string) => str.toLowerCase());

  // Kebab-case helper: {{kebab projectName}}
  Handlebars.registerHelper('kebab', (str: string) => 
    str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  );

  // Snake-case helper: {{snake projectName}}
  Handlebars.registerHelper('snake', (str: string) => 
    str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
  );

  // Pascal-case helper: {{pascal projectName}}
  Handlebars.registerHelper('pascal', (str: string) => 
    str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
       .replace(/^\w/, c => c.toUpperCase())
  );

  // Replace helper: {{replace projectName " " "-"}}
  Handlebars.registerHelper('replace', (str: string, search: string, replace: string) => 
    str.replace(new RegExp(search, 'g'), replace)
  );

  // Current year: {{year}}
  Handlebars.registerHelper('year', () => new Date().getFullYear().toString());

  // Date helper: {{date "YYYY-MM-DD"}}
  Handlebars.registerHelper('date', (format: string) => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });

  logger.debug('Handlebars helpers registered');
}

// Initialize helpers
registerHelpers();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Template Discovery
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get template directories (built-in + user custom)
 */
export async function getTemplatePaths(): Promise<string[]> {
  const paths: string[] = [];

  // Built-in templates (in claudine-cli/templates/)
  const builtInPath = join(process.cwd(), 'templates');
  if (existsSync(builtInPath)) {
    paths.push(builtInPath);
  }

  // User custom templates (~/.claudine/templates/)
  const config = await getConfig();
  const customPath = config.getCustomTemplatePath() || join(homedir(), '.claudine', 'templates');
  if (existsSync(customPath)) {
    paths.push(customPath);
  }

  logger.debug('Template paths', { paths });
  return paths;
}

/**
 * Find template by language and variant
 */
export async function findTemplate(
  language: string,
  variant: string = 'basic'
): Promise<string | null> {
  const templatePaths = await getTemplatePaths();

  for (const basePath of templatePaths) {
    const templatePath = join(basePath, language, variant);
    if (existsSync(templatePath)) {
      logger.debug('Template found', { language, variant, path: templatePath });
      return templatePath;
    }
  }

  logger.warn('Template not found', { language, variant });
  return null;
}

/**
 * List available templates for a language
 */
export async function listTemplates(language: string): Promise<string[]> {
  const templatePaths = await getTemplatePaths();
  const variants = new Set<string>();

  for (const basePath of templatePaths) {
    const langPath = join(basePath, language);
    if (existsSync(langPath)) {
      const entries = await readdir(langPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          variants.add(entry.name);
        }
      }
    }
  }

  return Array.from(variants).sort();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Template Rendering
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Load template manifest
 */
async function loadManifest(templatePath: string): Promise<TemplateManifest | null> {
  const manifestPath = join(templatePath, 'template.json');
  
  if (!existsSync(manifestPath)) {
    logger.debug('No template.json found, using defaults');
    return null;
  }

  try {
    const content = await readFile(manifestPath, 'utf-8');
    const data = JSON.parse(content);
    return TemplateManifestSchema.parse(data);
  } catch (error) {
    logger.error('Failed to load template manifest', error as Error);
    return null;
  }
}

/**
 * Get default template variables
 */
async function getDefaultVariables(projectName: string): Promise<TemplateVariables> {
  const config = await getConfig();

  return {
    projectName,
    author: config.getUserName(),
    email: config.getUserEmail(),
    license: 'MIT',
    version: '0.1.0',
  };
}

/**
 * Render template file with Handlebars
 */
async function renderFile(
  templatePath: string,
  variables: TemplateVariables
): Promise<string> {
  try {
    const content = await readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(content);
    return template(variables);
  } catch (error) {
    logger.error('Failed to render template', error as Error, { path: templatePath });
    throw error;
  }
}

/**
 * Copy and render template directory to destination
 */
async function copyTemplateFiles(
  templatePath: string,
  destPath: string,
  variables: TemplateVariables
): Promise<void> {
  const entries = await readdir(templatePath, { withFileTypes: true });

  for (const entry of entries) {
    // Skip template.json manifest
    if (entry.name === 'template.json') {
      continue;
    }

    const srcPath = join(templatePath, entry.name);
    const destName = entry.name.replace(/\.hbs$/, ''); // Remove .hbs extension
    const destFilePath = join(destPath, destName);

    if (entry.isDirectory()) {
      // Recursively copy directories
      await mkdir(destFilePath, { recursive: true });
      await copyTemplateFiles(srcPath, destFilePath, variables);
    } else {
      // Render and copy files
      if (entry.name.endsWith('.hbs')) {
        // Handlebars template - render it
        const rendered = await renderFile(srcPath, variables);
        await writeFile(destFilePath, rendered, 'utf-8');
        logger.debug('Rendered template file', { src: entry.name, dest: destName });
      } else {
        // Static file - copy as-is
        const content = await readFile(srcPath);
        await writeFile(destFilePath, content);
        logger.debug('Copied static file', { name: entry.name });
      }
    }
  }
}

/**
 * Execute post-create hook
 */
async function executePostCreateHook(
  hook: string,
  destPath: string,
  variables: TemplateVariables
): Promise<void> {
  try {
    logger.info(`Executing post-create hook: ${hook}`);
    
    // Interpolate variables in hook command
    const template = Handlebars.compile(hook);
    const command = template(variables);

    await execa(command, { cwd: destPath, shell: true });
    logger.success('Post-create hook executed');
  } catch (error) {
    logger.warn('Post-create hook failed (non-fatal)', { error: (error as Error).message });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Public API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Apply template to project directory
 * 
 * Usage:
 * ```typescript
 * await applyTemplate('python', 'web', '/path/to/project', {
 *   projectName: 'my-app',
 *   author: 'Claudine',
 *   license: 'MIT',
 * });
 * ```
 */
export async function applyTemplate(
  language: string,
  variant: string,
  destPath: string,
  customVariables?: Partial<TemplateVariables>
): Promise<void> {
  try {
    // Find template
    const templatePath = await findTemplate(language, variant);
    if (!templatePath) {
      throw new Error(`Template not found: ${language}/${variant}`);
    }

    // Load manifest (optional)
    const manifest = await loadManifest(templatePath);

    // Prepare variables
    const projectName = basename(destPath);
    const defaultVars = await getDefaultVariables(projectName);
    const variables = { ...defaultVars, ...customVariables };

    logger.debug('Applying template', { language, variant, variables });

    // Ensure destination exists
    await mkdir(destPath, { recursive: true });

    // Copy and render template files
    await copyTemplateFiles(templatePath, destPath, variables);

    // Execute post-create hook
    if (manifest?.hooks?.postCreate) {
      await executePostCreateHook(manifest.hooks.postCreate, destPath, variables);
    }

    logger.success(`Template applied: ${language}/${variant}`);
  } catch (error) {
    logger.error('Failed to apply template', error as Error);
    throw error;
  }
}

/**
 * Clone remote template repository
 */
export async function cloneRemoteTemplate(
  repoUrl: string,
  language: string,
  variant: string
): Promise<void> {
  try {
    const config = await getConfig();
    const customPath = config.getCustomTemplatePath() || join(homedir(), '.claudine', 'templates');
    const destPath = join(customPath, language, variant);

    // Ensure parent directory exists
    await mkdir(dirname(destPath), { recursive: true });

    logger.info(`Cloning remote template: ${repoUrl}`);
    await execa('git', ['clone', '--depth', '1', repoUrl, destPath]);
    
    logger.success(`Remote template cloned: ${language}/${variant}`);
  } catch (error) {
    logger.error('Failed to clone remote template', error as Error);
    throw error;
  }
}

/**
 * Validate template directory
 */
export async function validateTemplate(templatePath: string): Promise<boolean> {
  try {
    // Check if directory exists
    if (!existsSync(templatePath)) {
      logger.error('Template path does not exist', undefined, { path: templatePath });
      return false;
    }

    // Check if it's a directory
    const stats = await stat(templatePath);
    if (!stats.isDirectory()) {
      logger.error('Template path is not a directory', undefined, { path: templatePath });
      return false;
    }

    // Load and validate manifest (if exists)
    const manifest = await loadManifest(templatePath);
    if (manifest) {
      logger.debug('Template manifest valid', { name: manifest.name });
    }

    return true;
  } catch (error) {
    logger.error('Template validation failed', error as Error);
    return false;
  }
}
