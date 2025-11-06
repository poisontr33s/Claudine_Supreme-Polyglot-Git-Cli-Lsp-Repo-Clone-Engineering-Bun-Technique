/**
 * Terminal UI Types
 * 
 * Type definitions for interactive terminal UI components.
 * 
 * @module core/tui/types
 */

/**
 * Template selection result
 */
export interface TemplateSelection {
  language: string;
  templateId: string;
  templateName: string;
  category?: string;
}

/**
 * Project creation inputs
 */
export interface ProjectCreationInputs {
  projectName: string;
  projectPath: string;
  language: string;
  template: TemplateSelection;
  variables: Record<string, unknown>;
  initGit: boolean;
  installDeps: boolean;
}

/**
 * Template filter options
 */
export interface TemplateFilter {
  language?: string;
  category?: string;
  tags?: string[];
  search?: string;
}

/**
 * Template metadata for display
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  language: string;
  category?: string;
  tags?: string[];
  author?: string;
  variables?: Array<{
    name: string;
    label: string;
    description?: string;
    default?: string;
    type?: "string" | "boolean" | "number" | "choice";
    choices?: string[];
  }>;
}

/**
 * Configuration wizard result
 */
export interface ConfigWizardResult {
  logLevel: "debug" | "info" | "warn" | "error";
  defaultLanguage?: string;
  defaultTemplate?: string;
  autoInstallDeps: boolean;
  autoInitGit: boolean;
  editor?: string;
}
