// SCOUT pipeline orchestrator. Runs A1→A6 sequentially with vendor-isolated error
// handling. The pipeline is the only place that knows about run_id, manifests, metrics,
// and the promotion semantics.

import { runResearch } from "./tasks/a1-research.js";
import { runExtraction } from "./tasks/a2-extract.js";
import { runScoring } from "./tasks/a3-score.js";
import { runDelta } from "./tasks/a4-delta.js";
import { runReport } from "./tasks/a5-report.js";
import { runPersist } from "./tasks/a6-persist.js";
import { AnthropicAdapter } from "./llm/anthropic.js";
import { OpenAIAdapter } from "./llm/openai.js";
import { GraphClient } from "./sharepoint/client.js";
import { FileRepository } from "./sharepoint/files.js";
import { loadRemoteConfig, loadLocalConfig } from "./config/loader.js";
import { buildRunId, todayUtc } from "./util/runid.js";
import { configHash, auditEntry } from "./util/audit.js";
import { BudgetTracker, SearchCounter, makeLimits } from "./util/limits.js";
import { logger } from "./util/logger.js";

export async function runPipeline({
  date,
  vendorFilter,
  dryRun = false,
  attempt = 1,
  // Injection seams for tests:
  files: filesOverride,
  graph: graphOverride,
  anthropic: anthropicOverride,
  openai: openaiOverride,
  config: configOverride
} = {}) {
  const runDate = date ?? todayUtc();
  const runId = buildRunId({ date: runDate, attempt });
  const log = logger.child({ run_id: runId });
  const startedAt = new Date().toISOString();
  log.info("pipeline started", { date: runDate, dryRun });

  // Resolve site + clients ------------------------------------------------
  let graph = graphOverride ?? null;
  let files = filesOverride ?? null;
  let siteId = null;
  if (!dryRun || !filesOverride) {
    if (!graph) graph = new GraphClient();
    if (!files) {
      siteId = await graph.resolveSiteId();
      files = new FileRepository(graph, siteId);
    } else {
      siteId = files.siteId;
    }
  }

  // Configs ---------------------------------------------------------------
  let config;
  if (configOverride) config = configOverride;
  else if (dryRun || !files) config = loadLocalConfig();
  else config = await loadRemoteConfig(files);
  const cfgHash = configHash(config);

  // Adapters --------------------------------------------------------------
  const anthropic = anthropicOverride ?? new AnthropicAdapter(config.providers);
  const openai = openaiOverride ?? (process.env.OPENAI_API_KEY ? new OpenAIAdapter(config.providers) : null);

  // Filters + limits ------------------------------------------------------
  const allVendors = config.vendors.vendors;
  const vendors = vendorFilter
    ? allVendors.filter((v) => vendorFilter.includes(v.vendor_id))
    : allVendors;
  const limits = makeLimits(config.providers);
  const budget = new BudgetTracker(limits.maxBudgetUsdPerRun);
  const searchCounter = new SearchCounter(limits);
  const events = [];
  const audit = [];
  const metrics = { tasks: {}, started_at: startedAt };

  // ---------------- A1 ----------------
  const a1Started = new Date().toISOString();
  const researchResults = await runResearch({
    vendors,
    anthropic,
    sources: config.sources,
    searchCounter,
    budget,
    log
  });
  const a1Finished = new Date().toISOString();
  audit.push(auditEntry({ task: "A1", inputs: vendors, outputs: researchResults, started_at: a1Started, finished_at: a1Finished, status: "ok" }));
  metrics.tasks.A1 = { duration_ms: new Date(a1Finished) - new Date(a1Started) };

  // ---------------- A2 ----------------
  const a2Started = new Date().toISOString();
  const evidenceFile = await runExtraction({ runId, researchResults, anthropic });
  const a2Finished = new Date().toISOString();
  audit.push(auditEntry({ task: "A2", inputs: researchResults, outputs: evidenceFile, started_at: a2Started, finished_at: a2Finished, status: "ok" }));
  metrics.tasks.A2 = { duration_ms: new Date(a2Finished) - new Date(a2Started) };

  // ---------------- A3 ----------------
  const a3Started = new Date().toISOString();
  const scoresFile = await runScoring({
    runId,
    vendors,
    evidenceFile,
    weights: config.weights,
    providers: config.providers,
    anthropic,
    openai,
    budget,
    events
  });
  const a3Finished = new Date().toISOString();
  audit.push(auditEntry({ task: "A3", inputs: evidenceFile, outputs: scoresFile, started_at: a3Started, finished_at: a3Finished, status: "ok" }));
  metrics.tasks.A3 = { duration_ms: new Date(a3Finished) - new Date(a3Started) };

  const failedVendorIds = scoresFile.vendors
    .filter((v) => v.freshness_status === "failed")
    .map((v) => v.vendor_id);

  // ---------------- A4 ----------------
  const a4Started = new Date().toISOString();
  const deltaFile = await runDelta({ scoresFile, files, weights: config.weights, date: runDate });
  const a4Finished = new Date().toISOString();
  audit.push(auditEntry({ task: "A4", inputs: scoresFile, outputs: deltaFile, started_at: a4Started, finished_at: a4Finished, status: "ok" }));
  metrics.tasks.A4 = { duration_ms: new Date(a4Finished) - new Date(a4Started) };

  // ---------------- A5 ----------------
  const a5Started = new Date().toISOString();
  const reportMd = await runReport({ scoresFile, deltaFile, anthropic, date: runDate });
  const a5Finished = new Date().toISOString();
  audit.push(auditEntry({ task: "A5", inputs: { scoresFile, deltaFile }, outputs: reportMd, started_at: a5Started, finished_at: a5Finished, status: "ok" }));
  metrics.tasks.A5 = { duration_ms: new Date(a5Finished) - new Date(a5Started) };

  // ---------------- Manifest + metrics ----------------
  const finishedAt = new Date().toISOString();
  metrics.finished_at = finishedAt;
  metrics.budget = budget.snapshot();
  metrics.search_count = searchCounter.totalSearches;
  metrics.events = events.length;

  const manifest = {
    run_id: runId,
    run_date: runDate,
    git_sha: process.env.GITHUB_SHA ?? process.env.SCOUT_GIT_SHA ?? null,
    config_hash: cfgHash,
    models: {
      research: config.providers.anthropic.research_model,
      extraction: config.providers.anthropic.extraction_model,
      scoring: config.providers.anthropic.scoring_model,
      report: config.providers.anthropic.report_model,
      second_opinion: config.providers.openai.second_opinion_model
    },
    tool_versions: {
      web_search: config.providers.anthropic.web_search_tool.type
    },
    started_at: startedAt,
    finished_at: finishedAt,
    vendor_count: vendors.length,
    partial_failures: failedVendorIds,
    status: failedVendorIds.length === 0 ? "ok" : "partial",
    audit
  };

  // ---------------- A6 ----------------
  let persistResult = { dryRun: true };
  if (!dryRun) {
    const a6Started = new Date().toISOString();
    persistResult = await runPersist({
      files,
      graph,
      siteId,
      date: runDate,
      runId,
      scoresFile,
      evidenceFile,
      rawSearchResults: researchResults,
      deltaFile,
      reportMd,
      manifest,
      metrics,
      failedVendorIds
    });
    const a6Finished = new Date().toISOString();
    metrics.tasks.A6 = { duration_ms: new Date(a6Finished) - new Date(a6Started) };
  } else {
    log.info("dry-run: skipping A6 persist");
  }

  log.info("pipeline finished", { status: manifest.status, vendors: vendors.length, events: events.length });
  return { runId, manifest, metrics, scoresFile, evidenceFile, deltaFile, reportMd, persistResult, events };
}
