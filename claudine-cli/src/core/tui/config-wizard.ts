/**
 * Configuration Wizard
 * 
 * Interactive configuration setup for Claudine CLI.
 * 
 * @module core/tui/config-wizard
 */

import { select, confirm, input } from "@inquirer/prompts";
import { colors, text } from "../ui/index.js";
import type { ConfigWizardResult } from "./types.js";

/**
 * Run interactive configuration wizard
 */
export async function runConfigWizard(): Promise<ConfigWizardResult> {
  console.log();
  console.log(`${text.logo} ${colors.brand.primary("CONFIGURATION WIZARD")}`);
  console.log();
  console.log(colors.dim("Configure Claudine CLI defaults..."));
  console.log();

  // Log level
  const logLevel = await select({
    message: "Default log level:",
    choices: [
      { value: "info", name: "Info (recommended)" },
      { value: "debug", name: "Debug (verbose)" },
      { value: "warn", name: "Warnings only" },
      { value: "error", name: "Errors only" },
    ],
    default: "info",
  });

  // Default language
  const setDefaultLanguage = await confirm({
    message: "Set default language?",
    default: false,
  });

  let defaultLanguage: string | undefined;
  if (setDefaultLanguage) {
    defaultLanguage = await select({
      message: "Default language:",
      choices: [
        { value: "python", name: "🐍 Python" },
        { value: "rust", name: "🦀 Rust" },
        { value: "typescript", name: "📘 TypeScript" },
        { value: "javascript", name: "📗 JavaScript" },
        { value: "react", name: "⚛️  React" },
        { value: "ruby", name: "💎 Ruby" },
        { value: "go", name: "🐹 Go" },
      ],
    });
  }

  // Default template
  const setDefaultTemplate = await confirm({
    message: "Set default template?",
    default: false,
  });

  let defaultTemplate: string | undefined;
  if (setDefaultTemplate) {
    defaultTemplate = await input({
      message: "Default template ID:",
      default: "minimal",
    });
  }

  // Auto-install dependencies
  const autoInstallDeps = await confirm({
    message: "Auto-install dependencies by default?",
    default: true,
  });

  // Auto-initialize Git
  const autoInitGit = await confirm({
    message: "Auto-initialize Git repository by default?",
    default: true,
  });

  // Editor preference
  const setEditor = await confirm({
    message: "Set default editor?",
    default: false,
  });

  let editor: string | undefined;
  if (setEditor) {
    editor = await select({
      message: "Default editor:",
      choices: [
        { value: "vscode", name: "Visual Studio Code" },
        { value: "cursor", name: "Cursor" },
        { value: "vim", name: "Vim" },
        { value: "neovim", name: "Neovim" },
        { value: "emacs", name: "Emacs" },
        { value: "nano", name: "Nano" },
      ],
    });
  }

  console.log();
  console.log(colors.success("✓ Configuration complete!"));
  console.log();

  return {
    logLevel: logLevel as "debug" | "info" | "warn" | "error",
    defaultLanguage,
    defaultTemplate,
    autoInstallDeps,
    autoInitGit,
    editor,
  };
}