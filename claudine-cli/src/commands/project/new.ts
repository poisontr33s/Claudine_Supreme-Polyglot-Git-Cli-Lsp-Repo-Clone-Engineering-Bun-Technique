/**
 * Project creation command - creates new projects with templates
 */

import { existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { Command } from "commander";
import { execa } from "execa";
import { mkdir } from "fs/promises";
import ora from "ora";
import prompts from "prompts";
import { z } from "zod";

// Validation schema
const ProjectTypeSchema = z.enum(["python", "rust", "bun", "ruby", "react", "node", "go"]);
type ProjectType = z.infer<typeof ProjectTypeSchema>;

export const newProjectCommand = new Command("new")
  .description("Create a new project")
  .argument("<type>", "Project type (python, rust, bun, ruby, react, node, go)")
  .argument("[name]", "Project name")
  .option("-t, --template <template>", "Project template (basic, web, cli, etc.)")
  .option("-y, --yes", "Skip confirmation prompts")
  .option("--no-install", "Skip dependency installation")
  .action(async (typeArg: string, nameArg: string | undefined, options) => {
    try {
      // Validate project type
      const type = ProjectTypeSchema.parse(typeArg.toLowerCase()) as ProjectType;

      // Get project name
      let name = nameArg;
      if (!name) {
        const response = await prompts({
          type: "text",
          name: "name",
          message: `Enter ${type} project name:`,
          validate: (value: string) => (value.length > 0 ? true : "Project name is required"),
        });
        name = response.name;

        if (!name) {
          console.log(chalk.yellow("\n⚠️  Operation cancelled\n"));
          return;
        }
      }

      // Check if directory exists
      if (existsSync(name)) {
        console.log(chalk.red(`\n❌ Directory "${name}" already exists\n`));
        return;
      }

      // Get template
      let template = options.template;
      if (!template && !options.yes) {
        const templates = getTemplatesForType(type);
        const response = await prompts({
          type: "select",
          name: "template",
          message: "Select template:",
          choices: templates.map((t) => ({ title: t, value: t })),
        });
        template = response.template;
      }
      template = template || "basic";

      // Create project
      console.log(chalk.magenta.bold(`\n🔥 Creating ${type} project: ${name}\n`));

      const spinner = ora(`Creating project directory...`).start();
      await mkdir(name, { recursive: true });
      spinner.succeed("Project directory created");

      // Initialize based on type
      await initializeProject(type, name, template, options.install);

      console.log(chalk.green.bold(`\n✅ Project "${name}" created successfully!\n`));
      console.log(chalk.cyan("Next steps:"));
      console.log(chalk.gray(`  cd ${name}`));
      console.log(chalk.gray(`  # Start coding!\n`));
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(chalk.red(`\n❌ Invalid project type: ${typeArg}`));
        console.log(chalk.gray("Available types: python, rust, bun, ruby, react, node, go\n"));
      } else {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
      process.exit(1);
    }
  });

function getTemplatesForType(type: ProjectType): string[] {
  const templates: Record<ProjectType, string[]> = {
    python: ["basic", "web", "cli", "data-science"],
    rust: ["basic", "binary", "library"],
    bun: ["basic", "web", "cli"],
    ruby: ["basic", "rails", "gem"],
    react: ["vite", "nextjs", "remix"],
    node: ["basic", "express", "fastify"],
    go: ["basic", "cli", "web"],
  };
  return templates[type];
}

async function initializeProject(type: ProjectType, name: string, template: string, install: boolean): Promise<void> {
  const cwd = join(process.cwd(), name);

  switch (type) {
    case "python":
      await initPythonProject(name, template, cwd, install);
      break;
    case "rust":
      await initRustProject(name, template, cwd, install);
      break;
    case "bun":
      await initBunProject(name, template, cwd, install);
      break;
    case "ruby":
      await initRubyProject(name, template, cwd, install);
      break;
    case "react":
      await initReactProject(name, template, cwd, install);
      break;
    case "node":
      await initNodeProject(name, template, cwd, install);
      break;
    case "go":
      await initGoProject(name, template, cwd, install);
      break;
  }
}

async function initPythonProject(name: string, template: string, cwd: string, install: boolean) {
  const spinner = ora("Initializing Python project with uv...").start();
  try {
    // Check if uv is available
    await execa("uv", ["--version"], { cwd });

    // Initialize with uv
    await execa("uv", ["init", "--name", name], { cwd });

    spinner.succeed("Python project initialized with uv");

    if (install) {
      const installSpinner = ora("Installing dependencies...").start();
      try {
        await execa("uv", ["sync"], { cwd });
        installSpinner.succeed("Dependencies installed");
      } catch {
        installSpinner.warn("Dependency installation skipped (run `uv sync` manually)");
      }
    }
  } catch (error) {
    spinner.fail("uv not found");
    console.log(chalk.yellow("  ℹ️  Install uv: https://github.com/astral-sh/uv"));
  }
}

async function initRustProject(name: string, template: string, cwd: string, install: boolean) {
  const spinner = ora("Initializing Rust project...").start();
  try {
    const args = template === "library" ? ["--lib"] : [];
    await execa("cargo", ["init", ...args], { cwd });
    spinner.succeed("Rust project initialized");
  } catch (error) {
    spinner.fail("cargo not found");
    console.log(chalk.yellow("  ℹ️  Install Rust: https://rustup.rs"));
  }
}

async function initBunProject(name: string, template: string, cwd: string, install: boolean) {
  const spinner = ora("Initializing Bun project...").start();
  try {
    await execa("bun", ["init", "-y"], { cwd });
    spinner.succeed("Bun project initialized");
  } catch (error) {
    spinner.fail("bun not found");
    console.log(chalk.yellow("  ℹ️  Install Bun: https://bun.sh"));
  }
}

async function initRubyProject(name: string, template: string, cwd: string, install: boolean) {
  const spinner = ora("Initializing Ruby project...").start();
  try {
    if (template === "rails") {
      await execa("rails", ["new", ".", "--skip-git"], { cwd });
    } else {
      await execa("bundle", ["init"], { cwd });
    }
    spinner.succeed("Ruby project initialized");
  } catch (error) {
    spinner.fail("Ruby/Bundler not found");
    console.log(chalk.yellow("  ℹ️  Install Ruby: https://www.ruby-lang.org"));
  }
}

async function initReactProject(name: string, template: string, cwd: string, install: boolean) {
  const spinner = ora(`Initializing React project (${template})...`).start();
  try {
    if (template === "vite") {
      await execa("bun", ["create", "vite", ".", "--template", "react-ts"], { cwd });
    } else if (template === "nextjs") {
      await execa("bunx", ["create-next-app@latest", ".", "--typescript", "--tailwind", "--app", "--no-src-dir"], {
        cwd,
      });
    } else if (template === "remix") {
      await execa("bunx", ["create-remix@latest", "."], { cwd });
    }
    spinner.succeed("React project initialized");

    if (install) {
      const installSpinner = ora("Installing dependencies...").start();
      await execa("bun", ["install"], { cwd });
      installSpinner.succeed("Dependencies installed");
    }
  } catch (error) {
    spinner.fail("Project initialization failed");
    console.log(chalk.yellow("  ℹ️  Ensure Bun/Node is installed"));
  }
}

async function initNodeProject(name: string, template: string, cwd: string, install: boolean) {
  const spinner = ora("Initializing Node.js project...").start();
  try {
    await execa("bun", ["init", "-y"], { cwd });
    spinner.succeed("Node.js project initialized");
  } catch (error) {
    spinner.fail("Initialization failed");
  }
}

async function initGoProject(name: string, template: string, cwd: string, install: boolean) {
  const spinner = ora("Initializing Go project...").start();
  try {
    await execa("go", ["mod", "init", name], { cwd });
    spinner.succeed("Go project initialized");
  } catch (error) {
    spinner.fail("go not found");
    console.log(chalk.yellow("  ℹ️  Install Go: https://go.dev"));
  }
}
