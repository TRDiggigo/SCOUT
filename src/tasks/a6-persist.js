// A6 Persistence. Always writes to /SCOUT/data/{date}/{run_id}/ FIRST. Only on
// promotion does latest/ get updated. Per-vendor freshness keeps stale entries
// honest in latest/scores.json.

import { ScoresListRepository, ScoresListRepository as Repo } from "../sharepoint/repository.js";
import { logger } from "../util/logger.js";

const SCORES_LIST_NAME = "SCOUT-Scores";

export async function runPersist({
  files,
  graph,
  siteId,
  date,
  runId,
  scoresFile,
  evidenceFile,
  rawSearchResults,
  deltaFile,
  reportMd,
  manifest,
  metrics,
  failedVendorIds = [],
  dryRun = false
}) {
  const runDir = `SCOUT/data/${date}/${runId}`;
  const reportDir = `SCOUT/reports/${date}/${runId}`;
  const logDir = `SCOUT/logs/${date}/${runId}`;
  const latestDir = `SCOUT/data/${date}/latest`;

  if (dryRun) {
    logger.info("dry-run: skipping all SharePoint writes", { runDir });
    return { runDir, reportDir, latestDir, dryRun: true };
  }

  // Step 1: write run-scoped artefacts.
  await files.uploadJson(`${runDir}/scores.json`, scoresFile);
  await files.uploadJson(`${runDir}/evidence.json`, evidenceFile);
  await files.uploadJson(`${runDir}/raw_search.json`, rawSearchResults);
  await files.uploadJson(`${runDir}/delta.json`, deltaFile);
  await files.uploadJson(`${runDir}/run-manifest.json`, manifest);
  await files.uploadJson(`${runDir}/metrics.json`, metrics);
  await files.uploadText(`${reportDir}/daily.md`, reportMd, "text/markdown");
  await files.uploadJson(`${logDir}/audit.json`, { manifest, metrics });

  // Step 2: promote successful vendors to latest. Failed ones keep yesterday's value.
  const promoted = await promoteLatest({
    files,
    date,
    latestDir,
    scoresFile,
    failedVendorIds,
    runId
  });

  // Step 3: upsert SCOUT-Scores list rows for promoted vendors only.
  const repo = new ScoresListRepository(graph, siteId, SCORES_LIST_NAME);
  for (const entry of promoted.vendors) {
    if (entry.freshness_status === "failed") continue;
    try {
      await repo.upsertScoreItem(entry.vendor_id, Repo.toListFields(entry));
    } catch (err) {
      logger.error("list upsert failed", { vendor_id: entry.vendor_id, err: String(err?.message ?? err) });
    }
  }

  return { runDir, reportDir, latestDir, promotedCount: promoted.vendors.length };
}

async function promoteLatest({ files, date, latestDir, scoresFile, failedVendorIds, runId }) {
  const today = new Date().toISOString().slice(0, 10);
  const previousLatest = await files.readJson(`SCOUT/data/${date}/latest/scores.json`);
  const previousByVendor = new Map();
  if (previousLatest?.vendors) {
    for (const v of previousLatest.vendors) previousByVendor.set(v.vendor_id, v);
  } else {
    // First run of the day → fall back to yesterday's promoted snapshot for failed vendors.
    const prevDate = previousDate(date);
    const yesterday = await files.readJson(`SCOUT/data/${prevDate}/latest/scores.json`);
    if (yesterday?.vendors) {
      for (const v of yesterday.vendors) previousByVendor.set(v.vendor_id, v);
    }
  }

  const merged = scoresFile.vendors.map((v) => {
    if (failedVendorIds.includes(v.vendor_id)) {
      const prev = previousByVendor.get(v.vendor_id);
      if (prev) {
        return {
          ...prev,
          freshness_status: "stale",
          source_run_id: prev.source_run_id ?? runId
        };
      }
      return { ...v, freshness_status: "failed", source_run_id: runId, as_of_date: today };
    }
    return { ...v, freshness_status: "current", source_run_id: runId, as_of_date: today };
  });

  const promoted = {
    run_id: runId,
    generated_at: new Date().toISOString(),
    vendors: merged
  };
  await files.uploadJson(`${latestDir}/scores.json`, promoted);
  await files.uploadJson(`SCOUT/data/${date}/latest.manifest.json`, {
    source_run_id: runId,
    promoted_at: new Date().toISOString(),
    failed_vendor_ids: failedVendorIds
  });
  return promoted;
}

function previousDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
