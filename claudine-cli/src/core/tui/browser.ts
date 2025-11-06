/**
 * Template Browser
 * 
 * Interactive template browsing with search and filter.
 * 
 * @module core/tui/browser
 */

import { input, select, checkbox, Separator } from "@inquirer/prompts";
import { colors, text } from "../ui/index.js";
import type { TemplateFilter, TemplateMetadata } from "./types.js";

/**
 * Browse templates interactively
 */
export async function browseTemplates(): Promise<TemplateMetadata | null> {
  console.log();
  console.log(`${text.logo} ${colors.brand.primary("TEMPLATE BROWSER")}`);
  console.log();

  // Step 1: Filter by language
  const language = await select({
    message: "Filter by language:",
    choices: [
      { value: "all", name: "All Languages" },
      new Separator(),
      { value: "python", name: "🐍 Python" },
      { value: "rust", name: "🦀 Rust" },
      { value: "typescript", name: "📘 TypeScript" },
      { value: "javascript", name: "📗 JavaScript" },
      { value: "react", name: "⚛️  React" },
      { value: "ruby", name: "💎 Ruby" },
      { value: "go", name: "🐹 Go" },
    ],
    pageSize: 15,
  });

  // Step 2: Filter by category
  const categories = await checkbox({
    message: "Filter by category (optional):",
    choices: [
      { value: "web", name: "🌐 Web Application" },
      { value: "api", name: "🔌 API/Backend" },
      { value: "cli", name: "⌨️  CLI Tool" },
      { value: "library", name: "📚 Library/Package" },
      { value: "fullstack", name: "🎯 Full-Stack" },
      { value: "minimal", name: "📦 Minimal/Starter" },
    ],
    pageSize: 10,
  });

  // Step 3: Search (optional)
  const search = await input({
    message: "Search templates (optional):",
    default: "",
  });

  // Apply filters
  const filter: TemplateFilter = {
    language: language !== "all" ? language : undefined,
    category: categories.length > 0 ? categories[0] : undefined,
    tags: categories,
    search: search || undefined,
  };

  // Get filtered templates (local only, no fetch to /api/templates)
  const templates = getFilteredTemplates(filter);
  
  if (templates.length === 0) {
    console.log();
    console.log(colors.warning("⚠️  No templates match your filters."));
    console.log();
    return null;
  }

  // Step 4: Select template
  console.log();
  console.log(colors.success(`✓ Found ${templates.length} template${templates.length === 1 ? "" : "s"}`));
  console.log();

  const templateId = await select({
    message: "Select template:",
    choices: templates.map((t) => ({
      value: t.id,
      name: `${t.name} ${colors.dim(`(${t.language})`)}`,
      description: t.description,
    })),
    pageSize: 15,
  });

  const selectedTemplate = templates.find((t) => t.id === templateId);
  return selectedTemplate || null;
}

/**
 * Get templates matching filter criteria
 */
function getFilteredTemplates(filter: TemplateFilter): TemplateMetadata[] {
  const allTemplates = getAllTemplates();

  let filtered = allTemplates;

  // Filter by language
  if (filter.language) {
    filtered = filtered.filter((t) => t.language === filter.language);
  }

  // Filter by category
  if (filter.category) {
    filtered = filtered.filter((t) => t.category === filter.category);
  }

  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    filtered = filtered.filter((t) => {
      if (!t.tags) return false;
      return filter.tags!.some((tag) => t.tags!.includes(tag));
    });
  }

  // Filter by search
  if (filter.search) {
    const search = filter.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(search)))
    );
  }

  return filtered;
}

/**
 * Get all available templates
 * (Mock implementation - will integrate with template system)
 */
function getAllTemplates(): TemplateMetadata[] {
  return [
    // Python
    {
      id: "python-fastapi",
      name: "FastAPI Web Application",
      description: "Modern async web API with FastAPI, SQLAlchemy, Pydantic",
      language: "python",
      category: "web",
      tags: ["web", "api", "async", "database"],
    },
    {
      id: "python-flask",
      name: "Flask Web Application",
      description: "Classic Flask web app with Jinja2 templates",
      language: "python",
      category: "web",
      tags: ["web", "templates"],
    },
    {
      id: "python-cli",
      name: "CLI Tool",
      description: "Command-line tool with Click framework",
      language: "python",
      category: "cli",
      tags: ["cli", "terminal"],
    },
    {
      id: "python-minimal",
      name: "Minimal Project",
      description: "Basic Python project with uv and ruff",
      language: "python",
      category: "minimal",
      tags: ["minimal", "starter"],
    },

    // Rust
    {
      id: "rust-actix",
      name: "Actix Web API",
      description: "High-performance REST API with Actix",
      language: "rust",
      category: "api",
      tags: ["api", "web", "async"],
    },
    {
      id: "rust-cli",
      name: "CLI Tool",
      description: "Command-line tool with clap",
      language: "rust",
      category: "cli",
      tags: ["cli", "terminal"],
    },
    {
      id: "rust-minimal",
      name: "Minimal Binary",
      description: "Basic Rust binary project",
      language: "rust",
      category: "minimal",
      tags: ["minimal", "starter"],
    },

    // TypeScript
    {
      id: "typescript-vite-react",
      name: "Vite + React",
      description: "Modern web app with Vite, React, and TypeScript",
      language: "typescript",
      category: "web",
      tags: ["web", "react", "vite"],
    },
    {
      id: "typescript-express",
      name: "Express API",
      description: "REST API with Express and TypeScript",
      language: "typescript",
      category: "api",
      tags: ["api", "express", "backend"],
    },
    {
      id: "typescript-cli",
      name: "CLI Tool",
      description: "Command-line tool with Commander.js",
      language: "typescript",
      category: "cli",
      tags: ["cli", "terminal"],
    },

    // React
    {
      id: "react-vite",
      name: "React + Vite",
      description: "React application with Vite bundler",
      language: "react",
      category: "web",
      tags: ["web", "vite", "spa"],
    },
    {
      id: "react-nextjs",
      name: "Next.js",
      description: "Full-stack React with Next.js",
      language: "react",
      category: "fullstack",
      tags: ["web", "fullstack", "ssr"],
    },

    // Go
    {
      id: "go-gin",
      name: "Gin Web API",
      description: "REST API with Gin framework",
      language: "go",
      category: "api",
      tags: ["api", "web", "backend"],
    },
    {
      id: "go-cobra",
      name: "CLI Tool",
      description: "Command-line tool with Cobra",
      language: "go",
      category: "cli",
      tags: ["cli", "terminal"],
    },

    // Ruby
    {
      id: "ruby-rails",
      name: "Rails Application",
      description: "Full-stack web app with Ruby on Rails",
      language: "ruby",
      category: "fullstack",
      tags: ["web", "fullstack", "mvc"],
    },
    {
      id: "ruby-sinatra",
      name: "Sinatra Web App",
      description: "Lightweight web app with Sinatra",
      language: "ruby",
      category: "web",
      tags: ["web", "lightweight"],
    },
  ];
} 