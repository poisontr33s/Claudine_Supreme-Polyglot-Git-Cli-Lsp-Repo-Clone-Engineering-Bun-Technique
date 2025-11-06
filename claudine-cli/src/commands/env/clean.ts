/**
 * Clean Command - Cache and temporary file management
 * 
 * Clears package manager caches, temporary files, and build artifacts
 * to reclaim disk space and reset the polyglot environment.
 * 
 * @module commands/env/clean
 */

import { Command } from "commander";
import { existsSync, rmSync, statSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { homedir } from "os";
import { logger } from "../../core/logger.js";
import { colors, text, withSpinner } from "../../core/ui/index.js";

interface CleanTarget {
  name: string;
  path: string;
  category: "cache" | "temp" | "build" | "logs";
  icon: string;
}

interface CleanOptions {
  cache?: boolean;
  temp?: boolean;
  build?: boolean;
  logs?: boolean;
  all?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  json?: boolean;
}

interface CleanResult {
  target: string;
  existed: boolean;
  size: number;
  removed: boolean;
  error?: string;
}

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
 * Get directory size recursively
 */
function getDirectorySize(dirPath: string): number {
  if (!existsSync(dirPath)) return 0;

  let size = 0;
  try {
    const items = readdirSync(dirPath, { withFileTypes: true });
    for (const item of items) {
      const itemPath = join(dirPath, item.name);
      if (item.isDirectory()) {
        size += getDirectorySize(itemPath);
      } else if (item.isFile()) {
        size += statSync(itemPath).size;
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  return size;
}

/**
 * Format bytes to human-readable size
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Build clean targets based on polyglot directory
 */
function buildCleanTargets(polyglotDir: string): CleanTarget[] {
  return [
    // Cache targets
    {
      name: "UV Cache",
      path: join(polyglotDir, "tools", ".cache"),
      category: "cache",
      icon: "🐍",
    },
    {
      name: "Pip Cache",
      path: join(homedir(), ".cache", "pip"),
      category: "cache",
      icon: "🐍",
    },
    {
      name: "Cargo Cache",
      path: join(polyglotDir, "rust", "registry"),
      category: "cache",
      icon: "🦀",
    },
    {
      name: "Cargo Git Cache",
      path: join(polyglotDir, "rust", "git"),
      category: "cache",
      icon: "🦀",
    },
    {
      name: "Gem Cache",
      path: join(polyglotDir, "ruby", "cache"),
      category: "cache",
      icon: "💎",
    },
    {
      name: "Go Cache",
      path: join(polyglotDir, "go", "pkg", "mod", "cache"),
      category: "cache",
      icon: "🐹",
    },
    {
      name: "Bun Cache",
      path: join(homedir(), ".bun", "install", "cache"),
      category: "cache",
      icon: "🥖",
    },

    // Temp targets
    {
      name: "UV Temp",
      path: join(polyglotDir, "tools", ".tmp"),
      category: "temp",
      icon: "🗑️",
    },
    {
      name: "Cargo Temp",
      path: join(polyglotDir, "rust", "tmp"),
      category: "temp",
      icon: "🗑️",
    },
    {
      name: "System Temp (Claudine)",
      path: join(homedir(), ".tmp", "claudine"),
      category: "temp",
      icon: "🗑️",
    },

    // Build targets
    {
      name: "Rust Target Dirs",
      path: join(polyglotDir, "rust", "target"),
      category: "build",
      icon: "🔨",
    },
    {
      name: "Go Build Cache",
      path: join(polyglotDir, "go", "pkg", "mod", "build"),
      category: "build",
      icon: "🔨",
    },
    {
      name: "Python __pycache__",
      path: join(polyglotDir, "tools", "__pycache__"),
      category: "build",
      icon: "🔨",
    },

    // Log targets
    {
      name: "Claudine Logs",
      path: join(homedir(), ".claudine", "logs"),
      category: "logs",
      icon: "📋",
    },
    {
      name: "UV Logs",
      path: join(polyglotDir, "tools", "logs"),
      category: "logs",
      icon: "📋",
    },
  ];
}

/**
 * Filter targets based on options
 */
function filterTargets(
  targets: CleanTarget[],
  options: CleanOptions
): CleanTarget[] {
  if (options.all) {
    return targets;
  }

  const categories: Array<"cache" | "temp" | "build" | "logs"> = [];
  if (options.cache) categories.push("cache");
  if (options.temp) categories.push("temp");
  if (options.build) categories.push("build");
  if (options.logs) categories.push("logs");

  // If no specific categories selected, default to cache + temp
  if (categories.length === 0) {
    categories.push("cache", "temp");
  }

  return targets.filter((t) => categories.includes(t.category));
}

/**
 * Clean a single target
 */
async function cleanTarget(
  target: CleanTarget,
  dryRun: boolean
): Promise<CleanResult> {
  const existed = existsSync(target.path);
  const size = existed ? getDirectorySize(target.path) : 0;

  if (!existed) {
    return {
      target: target.name,
      existed: false,
      size: 0,
      removed: false,
    };
  }

  if (dryRun) {
    return {
      target: target.name,
      existed: true,
      size,
      removed: false,
    };
  }

  try {
    rmSync(target.path, { recursive: true, force: true });
    return {
      target: target.name,
      existed: true,
      size,
      removed: true,
    };
  } catch (error) {
    return {
      target: target.name,
      existed: true,
      size,
      removed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Display clean results
 */
function displayResults(
  results: CleanResult[],
  options: CleanOptions
): void {
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log();
  console.log(`${text.logo} ${colors.brand.primary('CLAUDINE CLEAN RESULTS')}`);
  console.log();

  // Group by category
  const categories = [
    { key: "cache", label: "CACHE", icon: "📦" },
    { key: "temp", label: "TEMPORARY FILES", icon: "🗑️" },
    { key: "build", label: "BUILD ARTIFACTS", icon: "🔨" },
    { key: "logs", label: "LOG FILES", icon: "📋" },
  ];

  let totalSize = 0;
  let totalRemoved = 0;

  for (const category of categories) {
    const categoryResults = results.filter(
      (r) =>
        r.existed &&
        (category.key === "cache"
          ? r.target.includes("Cache")
          : category.key === "temp"
            ? r.target.includes("Temp")
            : category.key === "build"
              ? r.target.includes("Target") ||
                r.target.includes("Build") ||
                r.target.includes("__pycache__")
              : r.target.includes("Logs"))
    );

    if (categoryResults.length === 0) continue;

    console.log(colors.brand.accent(`${category.icon} ${category.label}:`));
    for (const result of categoryResults) {
      const status = result.removed
        ? colors.success("✓")
        : result.error
          ? colors.error("✗")
          : colors.dim("○");

      const sizeStr = colors.dim(formatSize(result.size));
      console.log(`  ${status} ${result.target}: ${sizeStr}`);

      if (result.error && options.verbose) {
        console.log(colors.error(`    Error: ${result.error}`));
      }

      totalSize += result.size;
      if (result.removed) totalRemoved++;
    }
    console.log();
  }

  // Summary
  console.log(text.section("Summary:"));
  console.log(`  • Total space: ${colors.brand.primary(formatSize(totalSize))}`);
  console.log(
    `  • Targets cleaned: ${colors.brand.primary(`${totalRemoved}/${results.filter((r) => r.existed).length}`)}`
  );

  if (options.dryRun) {
    console.log();
    console.log(
      colors.dim(
        "  💡 This was a dry run. Use without --dry-run to actually remove files."
      )
    );
  }

  console.log();
}

/**
 * Clean command implementation
 */
async function cleanAction(options: CleanOptions): Promise<void> {
  const polyglotDir = detectPolyglotDir();

  if (!polyglotDir) {
    logger.error("Polyglot environment not found");
    console.log();
    console.log(colors.error("❌ Polyglot environment not found"));
    console.log();
    console.log("Possible solutions:");
    console.log(
      colors.dim("  • Run setup script: setup_polyglot_v2.ps1")
    );
    console.log(
      colors.dim("  • Set CLAUDINE_ROOT environment variable")
    );
    console.log(colors.dim("  • Create .poly_gluttony in project root"));
    console.log();
    process.exit(1);
  }

  if (options.verbose) {
    logger.info(`Using polyglot directory: ${polyglotDir}`);
  }

  // Build and filter targets
  const allTargets = buildCleanTargets(polyglotDir);
  const targets = filterTargets(allTargets, options);

  if (targets.length === 0) {
    console.log(colors.warning("⚠️  No targets selected for cleaning"));
    console.log();
    console.log("Use one of:");
    console.log(colors.dim("  • --cache    Clean package manager caches"));
    console.log(colors.dim("  • --temp     Clean temporary files"));
    console.log(colors.dim("  • --build    Clean build artifacts"));
    console.log(colors.dim("  • --logs     Clean log files"));
    console.log(colors.dim("  • --all      Clean everything"));
    console.log();
    return;
  }

  // Show what will be cleaned
  if (options.verbose || options.dryRun) {
    console.log();
    console.log(`${text.logo} ${colors.brand.primary('CLAUDINE CLEAN')}`);
    console.log();
    console.log(
      `Targets to clean: ${colors.brand.primary(String(targets.length))}`
    );
    for (const target of targets) {
      console.log(
        colors.dim(`  ${target.icon} ${target.name} → ${target.path}`)
      );
    }
    console.log();
  }

  // Clean targets with spinner
  const results = await withSpinner(
    options.dryRun ? "Analyzing targets" : "Cleaning targets",
    async () => {
      const promises = targets.map((target) =>
        cleanTarget(target, options.dryRun || false)
      );
      return await Promise.all(promises);
    }
  );

  // Display results
  displayResults(results, options);

  // Log summary
  const totalSize = results.reduce((sum, r) => sum + r.size, 0);
  const removed = results.filter((r) => r.removed).length;

  if (options.dryRun) {
    logger.info(
      `Dry run complete: ${removed} targets found, ${formatSize(totalSize)} total`
    );
  } else {
    logger.info(
      `Cleaned ${removed} targets, freed ${formatSize(totalSize)}`
    );
  }
}

/**
 * Create clean command
 */
export const cleanCommand = new Command("clean")
  .description("Clean caches, temporary files, and build artifacts")
  .option("--cache", "Clean package manager caches (uv, cargo, gem, go, bun)")
  .option("--temp", "Clean temporary files")
  .option("--build", "Clean build artifacts (target dirs, __pycache__)")
  .option("--logs", "Clean log files")
  .option("--all", "Clean everything (cache + temp + build + logs)")
  .option("--dry-run", "Show what would be cleaned without removing")
  .option("--verbose", "Show detailed information")
  .option("--json", "Output results as JSON")
  .action(cleanAction);
