// A4 Delta Detection. Compares the current scores.json against the previous day's
// promoted snapshot at /SCOUT/data/{prev-date}/latest/scores.json. Reads the previous
// run's manifest for provenance.

import { logger } from "../util/logger.js";

export async function runDelta({ scoresFile, files, weights, date }) {
  const prevDate = previousDate(date);
  let prevScoresFile = null;
  let prevManifest = null;
  if (files) {
    prevScoresFile = await files.readJson(`SCOUT/data/${prevDate}/latest/scores.json`);
    prevManifest = await files.readJson(`SCOUT/data/${prevDate}/latest.manifest.json`);
  }

  const events = [];
  const minPoints = weights?.delta_thresholds?.score_change_min_points ?? 5;
  const warnPoints = weights?.delta_thresholds?.score_change_warning_points ?? 10;

  const prevByVendor = new Map();
  for (const v of prevScoresFile?.vendors ?? []) prevByVendor.set(v.vendor_id, v);

  const vendorDeltas = [];
  for (const current of scoresFile.vendors) {
    const prev = prevByVendor.get(current.vendor_id);
    if (!prev) {
      events.push({ type: "new_vendor_in_scores", vendor_id: current.vendor_id, severity: "info" });
      vendorDeltas.push({ vendor_id: current.vendor_id, kind: "new", scores: current.scores });
      continue;
    }
    const changed = [];
    for (const dim of ["maturity", "integration", "governance", "total"]) {
      const diff = (current.scores[dim] ?? 0) - (prev.scores?.[dim] ?? 0);
      if (Math.abs(diff) >= minPoints) {
        changed.push({ dim, prev: prev.scores?.[dim] ?? 0, curr: current.scores[dim], diff });
        const severity = Math.abs(diff) >= warnPoints ? "warning" : "info";
        events.push({
          type: "score_change",
          severity,
          vendor_id: current.vendor_id,
          dimension: dim,
          delta: diff,
          previous: prev.scores?.[dim] ?? 0,
          current: current.scores[dim]
        });
      }
    }
    if (changed.length > 0) vendorDeltas.push({ vendor_id: current.vendor_id, kind: "changed", changed });
  }

  // Vendors that vanished from the current run.
  const currentIds = new Set(scoresFile.vendors.map((v) => v.vendor_id));
  for (const prev of prevScoresFile?.vendors ?? []) {
    if (!currentIds.has(prev.vendor_id)) {
      events.push({ type: "vendor_disappeared", vendor_id: prev.vendor_id, severity: "warning" });
      vendorDeltas.push({ vendor_id: prev.vendor_id, kind: "disappeared" });
    }
  }

  logger.info("delta computed", {
    prev_date: prevDate,
    prev_run_id: prevManifest?.source_run_id ?? null,
    events: events.length
  });

  return {
    run_id: scoresFile.run_id,
    generated_at: new Date().toISOString(),
    previous_date: prevDate,
    previous_run_id: prevManifest?.source_run_id ?? null,
    events,
    vendors: vendorDeltas
  };
}

function previousDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
