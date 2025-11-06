/**
 * Environment health check command
 * Checks installation status and versions of polyglot tools
 */

import chalk from "chalk";
import Table from "cli-table3";
import { Command } from "commander";
import { execa } from "execa";
import ora from "ora";

interface ToolStatus {
  tool: string;
  installed: boolean;
  version?: string;
  path?: string;
  error?: string;
}

interface ToolCheck {
  name: string;
  command: string;
  versionFlag: string;
  category: "language" | "package-manager" | "tool";
}

const TOOLS_TO_CHECK: ToolCheck[] = [
  // Languages
  { name: "Python", command: "python", versionFlag: "--version", category: "language" },
  { name: "Node.js", command: "node", versionFlag: "--version", category: "language" },
  { name: "Ruby", command: "ruby", versionFlag: "--version", category: "language" },
  { name: "Go", command: "go", versionFlag: "version", category: "language" },
  { name: "Rust", command: "rustc", versionFlag: "--version", category: "language" },

  // Package managers
  { name: "uv", command: "uv", versionFlag: "--version", category: "package-manager" },
  { name: "pip", command: "pip", versionFlag: "--version", category: "package-manager" },
  { name: "cargo", command: "cargo", versionFlag: "--version", category: "package-manager" },
  { name: "Bun", command: "bun", versionFlag: "--version", category: "package-manager" },
  { name: "npm", command: "npm", versionFlag: "--version", category: "package-manager" },
  { name: "gem", command: "gem", versionFlag: "--version", category: "package-manager" },

  // Tools
  { name: "Git", command: "git", versionFlag: "--version", category: "tool" },
  { name: "VSCode", command: "code", versionFlag: "--version", category: "tool" },
];

export const healthCommand = new Command("health")
  .description("Check polyglot environment health")
  .option("-v, --verbose", "Show detailed information including paths")
  .option("-c, --category <category>", "Filter by category (language, package-manager, tool)")
  .option("--json", "Output results as JSON")
  .action(async (options) => {
    if (!options.json) {
      console.log(chalk.cyan.bold("\n🔍 Checking environment health...\n"));
    }

    const spinner = options.json ? null : ora("Scanning tools...").start();

    // Filter tools by category if specified
    const toolsToCheck = options.category
      ? TOOLS_TO_CHECK.filter((t) => t.category === options.category)
      : TOOLS_TO_CHECK;

    // Check all tools in parallel
    const statuses = await Promise.all(toolsToCheck.map((tool) => checkTool(tool)));

    if (spinner) spinner.succeed("Scan complete");

    if (options.json) {
      console.log(JSON.stringify(statuses, null, 2));
    } else {
      displayResults(statuses, options.verbose);
    }

    // Exit with error if any critical tools are missing
    const criticalTools = ["python", "node", "git"];
    const missingCritical = statuses.filter((s) => !s.installed && criticalTools.includes(s.tool.toLowerCase()));

    if (missingCritical.length > 0) {
      process.exit(1);
    }
  });

async function checkTool(toolCheck: ToolCheck): Promise<ToolStatus> {
  try {
    // Try to get version
    const versionArgs = toolCheck.versionFlag.split(" ");
    const { stdout: versionOutput } = await execa(toolCheck.command, versionArgs, {
      timeout: 5000,
    });

    // Extract version (first line, cleaned)
    const version = versionOutput.split("\n")[0].trim();

    // Try to get path (platform-specific)
    let path: string | undefined;
    try {
      const whichCommand = process.platform === "win32" ? "where" : "which";
      const { stdout: pathOutput } = await execa(whichCommand, [toolCheck.command]);
      path = pathOutput.split("\n")[0].trim();
    } catch {
      // Path lookup failed, not critical
    }

    return {
      tool: toolCheck.name,
      installed: true,
      version,
      path,
    };
  } catch (error: any) {
    return {
      tool: toolCheck.name,
      installed: false,
      error: error.message,
    };
  }
}

function displayResults(statuses: ToolStatus[], verbose: boolean): void {
  // Group by status
  const installed = statuses.filter((s) => s.installed);
  const missing = statuses.filter((s) => !s.installed);

  // Create table
  const headers = verbose
    ? [chalk.cyan("Tool"), chalk.cyan("Status"), chalk.cyan("Version"), chalk.cyan("Path")]
    : [chalk.cyan("Tool"), chalk.cyan("Status"), chalk.cyan("Version")];

  const colWidths = verbose ? [15, 15, 40, 60] : [20, 15, 50];

  const table = new Table({
    head: headers,
    colWidths,
    style: {
      head: [],
      border: ["gray"],
    },
  });

  // Add installed tools
  for (const status of installed) {
    const row = [chalk.yellow(status.tool), chalk.green("✓ Installed"), chalk.gray(status.version!)];

    if (verbose && status.path) {
      row.push(chalk.dim(status.path));
    }

    table.push(row);
  }

  // Add missing tools
  for (const status of missing) {
    const row = [chalk.yellow(status.tool), chalk.red("✗ Missing"), chalk.dim("N/A")];

    if (verbose) {
      row.push(chalk.dim("Not found in PATH"));
    }

    table.push(row);
  }

  console.log(table.toString());

  // Summary
  console.log(chalk.cyan("\n📊 Summary:\n"));
  console.log(chalk.green(`  ✓ Installed: ${installed.length}`));
  console.log(chalk.red(`  ✗ Missing: ${missing.length}`));
  console.log(chalk.gray(`  Total: ${statuses.length}`));

  // Recommendations for missing tools
  if (missing.length > 0) {
    console.log(chalk.yellow("\n⚠️  Missing tools:\n"));

    for (const tool of missing) {
      console.log(chalk.yellow(`  • ${tool.tool}`));
      const installCmd = getInstallCommand(tool.tool);
      if (installCmd) {
        console.log(chalk.gray(`    Install: ${installCmd}`));
      }
    }

    console.log();
  } else {
    console.log(chalk.green("\n✅ All tools installed and ready!\n"));
  }
}

function getInstallCommand(tool: string): string | null {
  const commands: Record<string, string> = {
    Python: "https://www.python.org/downloads/",
    "Node.js": "https://nodejs.org/",
    Ruby: "https://www.ruby-lang.org/en/downloads/",
    Go: "https://go.dev/doc/install",
    Rust: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
    uv: "curl -LsSf https://astral.sh/uv/install.sh | sh",
    pip: "python -m ensurepip --upgrade",
    cargo: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
    Bun: "curl -fsSL https://bun.sh/install | bash",
    npm: "Installed with Node.js",
    gem: "Installed with Ruby",
    Git: "https://git-scm.com/downloads",
    VSCode: "https://code.visualstudio.com/",
  };

  return commands[tool] || null;
}
