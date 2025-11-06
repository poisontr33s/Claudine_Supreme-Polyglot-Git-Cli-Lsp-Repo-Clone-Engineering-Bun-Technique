/**
 * Detect command - detects programming languages in current project
 *
 * This command uses the orchestrator to analyze projects and detect
 * which programming languages are being used.
 */

import chalk from "chalk";
import type { Command } from "commander";
import { orchestrator } from "../core/orchestrator/orchestrator.js";

export function registerDetectCommand(program: Command): void {
  program
    .command("detect")
    .description("Detect programming languages in current project")
    .option("-p, --path <path>", "Project path to analyze", process.cwd())
    .option("--min-confidence <number>", "Minimum confidence threshold", "0.5")
    .action(detectCommand);
}

export async function detectCommand(options: {
  path?: string;
  minConfidence?: string;
}): Promise<void> {
  const projectPath = options.path || process.cwd();
  console.log(chalk.blue(`🔍 Analyzing ${projectPath}...\n`));

  const result = await orchestrator.invoke("detect-languages", {
    params: {
      projectPath,
      minConfidence: Number.parseFloat(options.minConfidence || "0.5"),
    },
  });

  if (!result.success) {
    console.error(chalk.red(`❌ Detection failed: ${result.error}`));
    process.exit(1);
  }

  const detections = result.data as Array<{
    language: string;
    confidence: number;
    evidence: string[];
  }>;

  if (detections.length === 0) {
    console.log(chalk.yellow("No programming languages detected"));
    return;
  }

  console.log(chalk.green(`✅ Detected ${detections.length} language(s):\n`));

  for (const detection of detections) {
    const confidencePercent = (detection.confidence * 100).toFixed(0);
    console.log(chalk.bold(`${detection.language} (${confidencePercent}% confidence)`));
    console.log(chalk.gray("  Evidence:"));
    for (const evidence of detection.evidence) {
      console.log(chalk.gray(`    - ${evidence}`));
    }
    console.log();
  }
}
