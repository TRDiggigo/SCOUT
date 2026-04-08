#!/usr/bin/env node
// SCOUT CLI dispatcher. Four commands:
//   bootstrap-sharepoint   one-off provisioning (broader perms)
//   validate-config        schema-check the four remote configs
//   run                    daily run (the operational path)
//   digest                 weekly digest from the past 7 latest snapshots

import { runPipeline } from "./pipeline.js";
import { bootstrapSharePoint } from "./sharepoint/bootstrap.js";
import { loadRemoteConfig, loadLocalConfig } from "./config/loader.js";
import { GraphClient } from "./sharepoint/client.js";
import { FileRepository } from "./sharepoint/files.js";
import { renderWeeklyDigest } from "./tasks/a5-report.js";
import { logger } from "./util/logger.js";

const COMMANDS = ["bootstrap-sharepoint", "validate-config", "run", "digest", "help", "--help", "-h"];

function parseArgs(argv) {
  const args = { _: [] };
  for (const a of argv) {
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      args[k] = v ?? true;
    } else {
      args._.push(a);
    }
  }
  return args;
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd || !COMMANDS.includes(cmd)) {
    printHelp();
    process.exit(cmd ? 1 : 0);
  }
  const args = parseArgs(rest);

  try {
    switch (cmd) {
      case "bootstrap-sharepoint": {
        const result = await bootstrapSharePoint();
        logger.info("bootstrap complete", result);
        break;
      }
      case "validate-config": {
        if (args.local) {
          loadLocalConfig();
          logger.info("local config valid");
        } else {
          const graph = new GraphClient();
          const siteId = await graph.resolveSiteId();
          const files = new FileRepository(graph, siteId);
          await loadRemoteConfig(files);
          logger.info("remote config valid");
        }
        break;
      }
      case "run": {
        const date = args.date ?? undefined;
        const dryRun = args["dry-run"] === true || process.env.SCOUT_DRY_RUN === "true";
        const vendorFilter = args.vendors ? String(args.vendors).split(",").map((s) => s.trim()).filter(Boolean) : null;
        const result = await runPipeline({ date, dryRun, vendorFilter });
        logger.info("run complete", { run_id: result.runId, status: result.manifest.status });
        if (dryRun) {
          process.stdout.write(JSON.stringify({ runId: result.runId, scores: result.scoresFile.vendors.length, events: result.events.length }, null, 2) + "\n");
        }
        break;
      }
      case "digest": {
        await runDigest(args);
        break;
      }
      case "help":
      case "--help":
      case "-h":
      default:
        printHelp();
    }
  } catch (err) {
    logger.error("scout command failed", { cmd, err: String(err?.message ?? err), stack: err?.stack });
    process.exit(1);
  }
}

async function runDigest(args) {
  const graph = new GraphClient();
  const siteId = await graph.resolveSiteId();
  const files = new FileRepository(graph, siteId);
  const week = args.week ?? thisIsoWeek();
  const dates = lastNDates(7);
  const days = [];
  for (const date of dates) {
    const scoresFile = await files.readJson(`SCOUT/data/${date}/latest/scores.json`);
    const deltaFile = await files.readJson(`SCOUT/data/${date}/latest/delta.json`);
    if (scoresFile) days.push({ date, scoresFile, deltaFile });
  }
  if (days.length === 0) {
    logger.warn("no daily snapshots found for digest", { week });
    return;
  }
  const md = renderWeeklyDigest({ days, weekLabel: week });
  await files.uploadText(`SCOUT/reports/weekly/weekly_${week}.md`, md, "text/markdown");
  logger.info("digest written", { week, days: days.length });
}

function lastNDates(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function thisIsoWeek() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function printHelp() {
  process.stdout.write(
    [
      "scout — Strategic Competitive Observation & Update Tracker",
      "",
      "Commands:",
      "  bootstrap-sharepoint        One-off provisioning (folders, list, seed configs).",
      "  validate-config [--local]   Schema-check remote (or local) config.",
      "  run [--date=YYYY-MM-DD]     Daily pipeline run.",
      "      [--vendors=a,b,c]       Restrict to specific vendor_ids.",
      "      [--dry-run]             Skip SharePoint writes.",
      "  digest [--week=YYYY-Wkk]    Build weekly digest.",
      ""
    ].join("\n")
  );
}

main();
