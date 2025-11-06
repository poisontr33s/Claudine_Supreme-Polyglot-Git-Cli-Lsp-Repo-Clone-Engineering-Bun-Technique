/**
 * Interactive Project Creation Wizard
 * 
 * Guides users through project creation with interactive prompts.
 * 
 * @module core/tui/wizard
 */

import { input, select, confirm, checkbox } from "@inquirer/prompts";
import { colors, text } from "../ui/index.js";
import type { ProjectCreationInputs, TemplateSelection } from "./types.js";

/**
 * Available languages with metadata
 */
const LANGUAGES = [
  { value: "python", name: "🐍 Python", description: "Modern Python with uv, ruff, pytest" },
  { value: "rust", name: "🦀 Rust", description: "Systems programming with cargo, clippy" },
  { value: "typescript", name: "📘 TypeScript", description: "Type-safe JavaScript with Bun" },
  { value: "javascript", name: "📗 JavaScript", description: "Node.js or Bun runtime" },
  { value: "react", name: "⚛️  React", description: "React with Vite or Next.js" },
  { value: "ruby", name: "💎 Ruby", description: "Ruby with bundler, rubocop" },
  { value: "go", name: "🐹 Go", description: "Go with standard tooling" },
];

/**
 * Template categories
 */
const CATEGORIES = [
  { value: "web", name: "🌐 Web Application" },
  { value: "api", name: "🔌 API/Backend" },
  { value: "cli", name: "⌨️  CLI Tool" },
  { value: "library", name: "📚 Library/Package" },
  { value: "fullstack", name: "🎯 Full-Stack" },
  { value: "minimal", name: "📦 Minimal/Starter" },
];

/**
 * Run interactive project creation wizard
 */
export async function runProjectWizard(): Promise<ProjectCreationInputs> {
  // Display header
  console.log();
  console.log(`${text.logo} ${colors.brand.primary("PROJECT CREATION WIZARD")}`);
  console.log();
  console.log(colors.dim("Answer a few questions to create your project..."));
  console.log();

  // Step 1: Project name
  const projectName = await input({
    message: "Project name:",
    default: "my-project",
    validate: (value) => {
      if (!value) return "Project name is required";
      if (!/^[a-z0-9-_]+$/.test(value)) {
        return "Project name must be lowercase alphanumeric with dashes or underscores";
      }
      return true;
    },
  });

  // Step 2: Project path
  const projectPath = await input({
    message: "Project path:",
    default: `./${projectName}`,
  });

  // Step 3: Language selection
  const language = await select({
    message: "Select language:",
    choices: LANGUAGES,
    pageSize: 10,
  });

  // Step 4: Category selection
  const category = await select({
    message: "Project category:",
    choices: CATEGORIES,
    pageSize: 10,
  });

  // Step 5: Template selection (mock for now - will integrate with template system)
  const templates = getTemplatesForLanguage(language, category);
  
  const templateId = await select({
    message: "Select template:",
    choices: templates.map(t => ({
      value: t.id,
      name: t.name,
      description: t.description,
    })),
    pageSize: 10,
  });

  const selectedTemplate = templates.find(t => t.id === templateId);
  if (!selectedTemplate) {
    throw new Error("Template not found");
  }

  const template: TemplateSelection = {
    language,
    templateId: selectedTemplate.id,
    templateName: selectedTemplate.name,
    category,
  };

  // Step 6: Template variables (if any)
  const variables: Record<string, unknown> = {};
  
  if (selectedTemplate.variables && selectedTemplate.variables.length > 0) {
    console.log();
    console.log(colors.brand.accent("Template Configuration:"));
    console.log();
    
    for (const variable of selectedTemplate.variables) {
      if (variable.type === "boolean") {
        variables[variable.name] = await confirm({
          message: variable.label,
          default: variable.default === "true" || variable.default === true,
        });
      } else if (variable.type === "choice" && variable.choices) {
        variables[variable.name] = await select({
          message: variable.label,
          choices: variable.choices.map(c => ({ value: c, name: c })),
          default: variable.default as string,
        });
      } else {
        variables[variable.name] = await input({
          message: variable.label,
          default: variable.default as string,
          validate: (value) => {
            if (!value && !variable.default) {
              return `${variable.label} is required`;
            }
            return true;
          },
        });
      }
    }
  }

  // Step 7: Additional options
  console.log();
  console.log(colors.brand.accent("Additional Options:"));
  console.log();

  const initGit = await confirm({
    message: "Initialize Git repository?",
    default: true,
  });

  const installDeps = await confirm({
    message: "Install dependencies?",
    default: true,
  });

  return {
    projectName,
    projectPath,
    language,
    template,
    variables,
    initGit,
    installDeps,
  };
}

/**
 * Get available templates for language and category
 * (Mock implementation - will integrate with template system)
 */
function getTemplatesForLanguage(language: string, category: string) {
  const templates: Array<{
    id: string;
    name: string;
    description: string;
    variables?: Array<{
      name: string;
      label: string;
      type?: string;
      default?: string | boolean;
      choices?: string[];
    }>;
  }> = [];

  // Python templates
  if (language === "python") {
    if (category === "web") {
      templates.push({
        id: "python-fastapi",
        name: "FastAPI Web Application",
        description: "Modern async web API with FastAPI, SQLAlchemy, Pydantic",
        variables: [
          { name: "database", label: "Database", type: "choice", choices: ["PostgreSQL", "SQLite", "None"], default: "PostgreSQL" },
          { name: "includeAuth", label: "Include authentication?", type: "boolean", default: true },
        ],
      });
      templates.push({
        id: "python-flask",
        name: "Flask Web Application",
        description: "Classic Flask web app with Jinja2 templates",
      });
    } else if (category === "api") {
      templates.push({
        id: "python-api-minimal",
        name: "Minimal REST API",
        description: "Simple REST API with FastAPI",
      });
    } else if (category === "cli") {
      templates.push({
        id: "python-cli",
        name: "CLI Tool",
        description: "Command-line tool with Click framework",
      });
    }
  }

  // Rust templates
  if (language === "rust") {
    if (category === "cli") {
      templates.push({
        id: "rust-cli",
        name: "CLI Tool",
        description: "Command-line tool with clap",
      });
    } else if (category === "api") {
      templates.push({
        id: "rust-actix",
        name: "Actix Web API",
        description: "High-performance REST API with Actix",
      });
    }
  }

  // TypeScript templates
  if (language === "typescript") {
    if (category === "web") {
      templates.push({
        id: "typescript-vite",
        name: "Vite Application",
        description: "Modern web app with Vite and TypeScript",
        variables: [
          { name: "framework", label: "Framework", type: "choice", choices: ["React", "Vue", "Svelte", "Vanilla"], default: "React" },
        ],
      });
    } else if (category === "api") {
      templates.push({
        id: "typescript-express",
        name: "Express API",
        description: "REST API with Express and TypeScript",
      });
    }
  }

  // React templates
  if (language === "react") {
    if (category === "web") {
      templates.push({
        id: "react-vite",
        name: "React + Vite",
        description: "React application with Vite",
      });
      templates.push({
        id: "react-nextjs",
        name: "Next.js",
        description: "Full-stack React with Next.js",
        variables: [
          { name: "appRouter", label: "Use App Router?", type: "boolean", default: true },
        ],
      });
    }
  }

  // Go templates
  if (language === "go") {
    if (category === "api") {
      templates.push({
        id: "go-gin",
        name: "Gin Web API",
        description: "REST API with Gin framework",
      });
    } else if (category === "cli") {
      templates.push({
        id: "go-cobra",
        name: "CLI Tool",
        description: "Command-line tool with Cobra",
      });
    }
  }

  // Ruby templates
  if (language === "ruby") {
    if (category === "web") {
      templates.push({
        id: "ruby-rails",
        name: "Rails Application",
        description: "Full-stack web app with Ruby on Rails",
      });
      templates.push({
        id: "ruby-sinatra",
        name: "Sinatra Web App",
        description: "Lightweight web app with Sinatra",
      });
    }
  }

  // Fallback minimal template
  if (templates.length === 0) {
    templates.push({
      id: `${language}-minimal`,
      name: "Minimal Project",
      description: `Basic ${language} project structure`,
    });
  }

  return templates;
}
