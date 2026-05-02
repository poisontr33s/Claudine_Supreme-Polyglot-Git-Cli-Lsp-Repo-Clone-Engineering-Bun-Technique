/**
 * Versions Command - Tool version display and update checking
 * 
 * Shows all polyglot tool versions, checks for updates,
 * and optionally upgrades tools to latest versions.
 * 
 * @module commands/env/versions
 */

import { Command } from "commander";
import { existsSync } from "fs";
import { homedir } from "os";
import { resolve } from "path";
import { execa } from "execa";
import { logger } from "../../core/logger.js";
import { colors, text, withSpinner } from "../../core/ui/index.js";

interface ToolVersion {
  name: string;
  icon: string;
  category: "language" | "package-manager" | "tool";
  command: string;
  args: string[];
  current: string | null;
  latest?: string | null;
  updateAvailable?: boolean;
  upgradeCommand?: string;
}

interface VersionsOptions {
  check?: boolean;
  upgrade?: boolean;
  tool?: string;
  verbose?: boolean;
  json?: boolean;
}

/**
 * Tool definitions with version checking
 */
const TOOLS: ToolVersion[] = [
  // Languages
  {
    name: "Python",
    icon: "🐍",
    category: "language",
    command: "python",
    args: ["--version"],
    current: null,
    upgradeCommand: "uv python install --latest",
  },
  {
    name: "Rust",
    icon: "🦀",
    category: "language",
    command: "rustc",
    args: ["--version"],
    current: null,
    upgradeCommand: "rustup update stable",
  },
  {
    name: "Ruby",
    icon: "💎",
    category: "language",
    command: "ruby",
    args: ["--version"],
    current: null,
    upgradeCommand: "gem update --system",
  },
  {
    name: "Bun",
    icon: "🥖",
    category: "language",
    command: "bun",
    args: ["--version"],
    current: null,
    upgradeCommand: "bun upgrade",
  },
  {
    name: "Go",
    icon: "🐹",
    category: "language",
    command: "go",
    args: ["version"],
    current: null,
    upgradeCommand: "go install golang.org/dl/latest@latest",
  },
  {
    name: "Node.js",
    icon: "🟢",
    category: "language",
    command: "node",
    args: ["--version"],
    current: null,
    upgradeCommand: "nvm install node",
  },

  // Package Managers
  {
    name: "uv",
    icon: "📦",
    category: "package-manager",
    command: "uv",
    args: ["--version"],
    current: null,
    upgradeCommand: "uv self update",
  },
  {
    name: "cargo",
    icon: "📦",
    category: "package-manager",
    command: "cargo",
    args: ["--version"],
    current: null,
    upgradeCommand: "rustup update",
  },
  {
    name: "gem",
    icon: "📦",
    category: "package-manager",
    command: "gem",
    args: ["--version"],
    current: null,
    upgradeCommand: "gem update --system",
  },
  {
    name: "npm",
    icon: "📦",
    category: "package-manager",
    command: "npm",
    args: ["--version"],
    current: null,
    upgradeCommand: "npm install -g npm@latest",
  },

  // Tools
  {
    name: "Git",
    icon: "🔧",
    category: "tool",
    command: "git",
    args: ["--version"],
    current: null,
    upgradeCommand: "winget upgrade Git.Git", // Windows-specific
  },
  {
    name: "gopls",
    icon: "🔧",
    category: "tool",
    command: "gopls",
    args: ["version"],
    current: null,
    upgradeCommand: "go install golang.org/x/tools/gopls@latest",
  },
];

/**
 * Detect polyglot directory
 */
function detectPolyglotDir(): string | null {
  const candidates = [
    resolve(homedir(), "PsychoNoir-Kontrapunkt", ".poly_gluttony"),
    resolve(process.cwd(), ".poly_gluttony"),
    resolve(homedir(), ".claudine"),
    process.env.CLAUDINE_ROOT,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Check tool version
 */
async function checkToolVersion(tool: ToolVersion): Promise<ToolVersion> {
  try {
    const { stdout } = await execa(tool.command, tool.args, {
      timeout: 5000,
      reject: false,
    });

    // Extract version from output
    const versionMatch = stdout.match(/\d+\.\d+(\.\d+)?/);
    tool.current = versionMatch ? versionMatch[0] : stdout.trim();
  } catch (error) {
    tool.current = null;
  }

  return tool;
}

/**
 * Check for latest version (placeholder - would need API calls)
 */
async function checkLatestVersion(tool: ToolVersion): Promise<ToolVersion> {
  // This is a simplified version. Real implementation would:
  // - Query GitHub releases API
  // - Check package registries (PyPI, crates.io, rubygems, etc.)
  // - Compare versions semantically

  // For now, just mark as "checking" in verbose mode
  tool.latest = null;
  tool.updateAvailable = false;

  return tool;
}

/**
 * Upgrade a tool
 */
async function upgradeTool(tool: ToolVersion): Promise<boolean> {
  if (!tool.upgradeCommand) {
    logger.warn(`No upgrade command available for ${tool.name}`);
    return false;
  }

  try {
    const _upgradeParts = tool.upgradeCommand.split(" ");
    const command = _upgradeParts[0]!;
    const args = _upgradeParts.slice(1);
    const { exitCode } = await execa(command, args, {
      stdio: "inherit",
      timeout: 300000, // 5 minutes
    });

    return exitCode === 0;
  } catch (error) {
    logger.error(`Failed to upgrade ${tool.name}: ${error}`);
    return false;
  }
}

/**
 * Display versions
 */
function displayVersions(
  tools: ToolVersion[],
  options: VersionsOptions
): void {
  if (options.json) {
    console.log(JSON.stringify(tools, null, 2));
    return;
  }

  console.log();
  console.log(`${text.logo} ${colors.brand.primary('CLAUDINE TOOL VERSIONS')}`);
  console.log();

  // Group by category
  const categories = [
    { key: "language" as const, label: "LANGUAGE", icon: "🌍" },
    { key: "package-manager" as const, label: "PACKAGE MANAGER", icon: "📦" },
    { key: "tool" as const, label: "TOOL", icon: "🔧" },
  ];

  for (const category of categories) {
    const categoryTools = tools.filter((t) => t.category === category.key);
    if (categoryTools.length === 0) continue;

    console.log(colors.brand.accent(`${category.icon} ${category.label}:`));

    for (const tool of categoryTools) {
      const status = tool.current
        ? colors.success("✓")
        : colors.error("✗");

      const version = tool.current
        ? colors.brand.primary(tool.current)
        : colors.error("not installed");

      let line = `  ${status} ${tool.icon} ${tool.name}: ${version}`;

      // Show update info if checking
      if (options.check && tool.updateAvailable && tool.latest) {
        line += ` ${colors.warning(`→ ${tool.latest}`)}`;
      }

      console.log(line);

      // Show upgrade command in verbose mode
      if (options.verbose && tool.upgradeCommand) {
        console.log(
          colors.dim(`    Upgrade: ${tool.upgradeCommand}`)
        );
      }
    }

    console.log();
  }

  // Summary
  const installed = tools.filter((t) => t.current !== null).length;
  const total = tools.length;
  const updates = tools.filter((t) => t.updateAvailable).length;

  console.log(text.section("Summary:"));
  console.log(
    `  • Installed: ${colors.brand.primary(`${installed}/${total}`)}`
  );

  if (options.check && updates > 0) {
    console.log(
      `  • Updates available: ${colors.warning(String(updates))}`
    );
  }

  console.log();

  // Next steps
  if (!options.check && !options.upgrade) {
    console.log(colors.dim("Next steps:"));
    console.log(colors.dim("  • Use --check to check for updates"));
    console.log(colors.dim("  • Use --upgrade to upgrade all tools"));
    console.log(
      colors.dim("  • Use --tool <name> --upgrade to upgrade specific tool")
    );
    console.log();
  }
}

/**
 * Versions command implementation
 */
async function versionsAction(options: VersionsOptions): Promise<void> {
  const polyglotDir = detectPolyglotDir();

  if (!polyglotDir && options.verbose) {
    logger.warn("Polyglot environment not found, checking system tools only");
  }

  // Filter tools if specific tool requested
  let tools = TOOLS;
  if (options.tool) {
    tools = TOOLS.filter(
      (t) => t.name.toLowerCase() === options.tool!.toLowerCase()
    );
    if (tools.length === 0) {
      logger.error(`Tool not found: ${options.tool}`);
      console.log();
      console.log(colors.error(`❌ Tool not found: ${options.tool}`));
      console.log();
      console.log("Available tools:");
      for (const tool of TOOLS) {
        console.log(colors.dim(`  • ${tool.icon} ${tool.name}`));
      }
      console.log();
      process.exit(1);
    }
  }

  // Check current versions
  const toolsWithVersions = await withSpinner(
    "Checking tool versions",
    async () => {
      const promises = tools.map((tool) => checkToolVersion(tool));
      return await Promise.all(promises);
    }
  );

  // Check for updates if requested
  let finalTools = toolsWithVersions;
  if (options.check) {
    finalTools = await withSpinner(
      "Checking for updates",
      async () => {
        const promises = toolsWithVersions.map((tool) =>
          checkLatestVersion(tool)
        );
        return await Promise.all(promises);
      }
    );
  }

  // Upgrade if requested
  if (options.upgrade) {
    console.log();
    console.log(`${text.logo} ${colors.brand.primary('UPGRADING TOOLS')}`);
    console.log();

    for (const tool of finalTools) {
      if (!tool.current) {
        console.log(
          colors.dim(`⊘ Skipping ${tool.icon} ${tool.name} (not installed)`)
        );
        continue;
      }

      console.log(
        `⬆️  Upgrading ${tool.icon} ${tool.name}...`
      );

      const success = await upgradeTool(tool);

      if (success) {
        console.log(
          colors.success(`  ✓ ${tool.name} upgraded successfully`)
        );
      } else {
        console.log(colors.error(`  ✗ Failed to upgrade ${tool.name}`));
      }

      console.log();
    }

    // Re-check versions after upgrade
    console.log("Re-checking versions...");
    finalTools = await withSpinner(
      "Verifying upgrades",
      async () => {
        const promises = finalTools.map((tool) => checkToolVersion(tool));
        return await Promise.all(promises);
      }
    );
  }

  // Display results
  displayVersions(finalTools, options);

  // Log summary
  const installed = finalTools.filter((t) => t.current !== null).length;
  logger.info(`Tool versions: ${installed}/${finalTools.length} installed`);
}

/**
 * Create versions command
 */
export const versionsCommand = new Command("versions")
  .description("Show tool versions and check for updates")
  .option("--check", "Check for available updates")
  .option("--upgrade", "Upgrade all tools to latest versions")
  .option("--tool <name>", "Target specific tool")
  .option("--verbose", "Show upgrade commands")
  .option("--json", "Output results as JSON")
  .action(versionsAction);
