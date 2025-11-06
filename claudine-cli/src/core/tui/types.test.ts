/**
 * TUI System Unit Tests
 */

import { describe, it, expect } from 'vitest';
import type {
  ProjectCreationInputs,
  TemplateFilter,
  TemplateMetadata,
  ConfigWizardResult,
} from '../tui/types.js';

describe('TUI Types', () => {
  describe('ProjectCreationInputs', () => {
    it('should have required fields', () => {
      const inputs: ProjectCreationInputs = {
        projectName: 'test-project',
        projectPath: './test-project',
        language: 'python',
        template: {
          language: 'python',
          templateId: 'python-minimal',
          templateName: 'Minimal Project',
        },
        variables: {},
        initGit: true,
        installDeps: true,
      };

      expect(inputs.projectName).toBe('test-project');
      expect(inputs.language).toBe('python');
      expect(inputs.template.templateId).toBe('python-minimal');
    });

    it('should support template variables', () => {
      const inputs: ProjectCreationInputs = {
        projectName: 'test',
        projectPath: './test',
        language: 'python',
        template: {
          language: 'python',
          templateId: 'python-fastapi',
          templateName: 'FastAPI',
        },
        variables: {
          database: 'PostgreSQL',
          includeAuth: true,
        },
        initGit: false,
        installDeps: true,
      };

      expect(inputs.variables.database).toBe('PostgreSQL');
      expect(inputs.variables.includeAuth).toBe(true);
    });
  });

  describe('TemplateFilter', () => {
    it('should support partial filters', () => {
      const filter: TemplateFilter = {
        language: 'python',
      };

      expect(filter.language).toBe('python');
      expect(filter.category).toBeUndefined();
    });

    it('should support full filters', () => {
      const filter: TemplateFilter = {
        language: 'python',
        category: 'web',
        tags: ['api', 'async'],
        search: 'fastapi',
      };

      expect(filter.language).toBe('python');
      expect(filter.tags).toContain('api');
      expect(filter.search).toBe('fastapi');
    });
  });

  describe('TemplateMetadata', () => {
    it('should have required template fields', () => {
      const template: TemplateMetadata = {
        id: 'python-minimal',
        name: 'Minimal Project',
        description: 'Basic Python project',
        language: 'python',
      };

      expect(template.id).toBe('python-minimal');
      expect(template.language).toBe('python');
    });

    it('should support optional fields', () => {
      const template: TemplateMetadata = {
        id: 'python-fastapi',
        name: 'FastAPI Web Application',
        description: 'Modern async web API',
        language: 'python',
        category: 'web',
        tags: ['web', 'api', 'async'],
        author: 'Claudine Team',
        variables: [
          {
            name: 'database',
            label: 'Database',
            type: 'choice',
            choices: ['PostgreSQL', 'SQLite'],
            default: 'PostgreSQL',
          },
        ],
      };

      expect(template.category).toBe('web');
      expect(template.tags).toContain('async');
      expect(template.variables?.length).toBe(1);
    });
  });

  describe('ConfigWizardResult', () => {
    it('should have log level', () => {
      const config: ConfigWizardResult = {
        logLevel: 'info',
        autoInstallDeps: true,
        autoInitGit: true,
      };

      expect(config.logLevel).toBe('info');
      expect(config.autoInstallDeps).toBe(true);
    });

    it('should support optional preferences', () => {
      const config: ConfigWizardResult = {
        logLevel: 'debug',
        defaultLanguage: 'python',
        defaultTemplate: 'python-minimal',
        autoInstallDeps: false,
        autoInitGit: false,
        editor: 'vscode',
      };

      expect(config.defaultLanguage).toBe('python');
      expect(config.editor).toBe('vscode');
    });
  });
});
