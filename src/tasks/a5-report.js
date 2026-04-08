// A5 Report generation. Markdown only. Sonnet writes the executive summary; the rest is
// deterministic markdown so the report stays auditable. System prompt enforces a sober,
// non-marketing tone (Diggigo house style).

const SYSTEM_PROMPT =
  "You write daily intelligence briefings for Diggigo GmbH. Tone: factual, sober, " +
  "concise German business prose. No marketing language, no hype, no superlatives. " +
  "Prefer numbers over adjectives. Cite sources inline as plain URLs.";

export async function runReport({ scoresFile, deltaFile, anthropic, date }) {
  const summary = await buildExecutiveSummary({ scoresFile, deltaFile, anthropic });
  const md = renderMarkdown({ scoresFile, deltaFile, summary, date });
  return md;
}

async function buildExecutiveSummary({ scoresFile, deltaFile, anthropic }) {
  const userPrompt = [
    `Erstelle eine Executive Summary in 5-8 Sätzen für den heutigen SCOUT-Lauf.`,
    `Anbieter im Lauf: ${scoresFile.vendors.length}`,
    `Delta-Events: ${deltaFile.events.length}`,
    `Top-3 nach total_score:`,
    ...top(scoresFile.vendors, 3).map((v, i) => `  ${i + 1}. ${v.name}: ${v.scores.total.toFixed(1)}`),
    `Wichtige Delta-Events:`,
    ...deltaFile.events.slice(0, 5).map((e) => `  - ${e.type} (${e.severity ?? "info"}): ${e.vendor_id ?? ""}`)
  ].join("\n");
  try {
    const { text } = await anthropic.generate({ system: SYSTEM_PROMPT, userPrompt });
    return text.trim();
  } catch {
    return fallbackSummary(scoresFile, deltaFile);
  }
}

function fallbackSummary(scoresFile, deltaFile) {
  const top3 = top(scoresFile.vendors, 3)
    .map((v, i) => `${i + 1}. ${v.name} (${v.scores.total.toFixed(1)})`)
    .join("; ");
  return `Heutiger Lauf erfasst ${scoresFile.vendors.length} Anbieter. Top-3 nach Gesamtscore: ${top3}. ${deltaFile.events.length} Delta-Events identifiziert.`;
}

function renderMarkdown({ scoresFile, deltaFile, summary, date }) {
  const lines = [];
  lines.push(`# SCOUT Tagesreport ${date}`);
  lines.push("");
  lines.push(`*Run-ID:* \`${scoresFile.run_id}\`  `);
  lines.push(`*Generiert:* ${scoresFile.generated_at}`);
  lines.push("");
  lines.push("## Executive Summary");
  lines.push(summary);
  lines.push("");
  lines.push("## Delta-Highlights");
  if (deltaFile.events.length === 0) {
    lines.push("_Keine signifikanten Änderungen gegenüber dem Vortag._");
  } else {
    lines.push("| Typ | Severity | Vendor | Detail |");
    lines.push("| --- | --- | --- | --- |");
    for (const e of deltaFile.events) {
      const detail =
        e.type === "score_change"
          ? `${e.dimension} ${signed(e.delta)} (${e.previous} → ${e.current})`
          : "";
      lines.push(`| ${e.type} | ${e.severity ?? "info"} | ${e.vendor_id ?? ""} | ${detail} |`);
    }
  }
  lines.push("");
  lines.push("## Anbieterliste");
  lines.push("| # | Anbieter | Land | Tier | Maturity | Integration | Governance | Total | Konfidenz | Freshness |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  scoresFile.vendors
    .slice()
    .sort((a, b) => b.scores.total - a.scores.total)
    .forEach((v, i) => {
      lines.push(
        `| ${i + 1} | ${v.name} | ${v.country} | ${v.tier} | ${v.scores.maturity.toFixed(1)} | ${v.scores.integration.toFixed(1)} | ${v.scores.governance.toFixed(1)} | ${v.scores.total.toFixed(1)} | ${(v.confidence * 100).toFixed(0)}% | ${v.freshness_status} |`
      );
    });
  lines.push("");
  lines.push("## Governance-Radar");
  const govRanked = scoresFile.vendors
    .slice()
    .sort((a, b) => b.scores.governance - a.scores.governance)
    .slice(0, 5);
  for (const v of govRanked) {
    lines.push(`- **${v.name}** — ${v.scores.governance.toFixed(1)} (${v.tier})`);
  }
  return lines.join("\n");
}

function top(vendors, n) {
  return vendors.slice().sort((a, b) => b.scores.total - a.scores.total).slice(0, n);
}

function signed(n) {
  if (n > 0) return `+${n.toFixed(1)}`;
  return n.toFixed(1);
}

export function renderWeeklyDigest({ days, weekLabel }) {
  const lines = [];
  lines.push(`# SCOUT Wochendigest ${weekLabel}`);
  lines.push("");
  lines.push(`Aggregat aus ${days.length} Tagesläufen.`);
  lines.push("");
  const allVendors = new Map();
  for (const d of days) {
    for (const v of d.scoresFile.vendors) {
      const list = allVendors.get(v.vendor_id) ?? [];
      list.push({ date: d.date, score: v.scores.total });
      allVendors.set(v.vendor_id, list);
    }
  }
  lines.push("## Wochen-Trend (Total Score)");
  lines.push("| Vendor | Start | Ende | Δ |");
  lines.push("| --- | --- | --- | --- |");
  for (const [vendor_id, history] of allVendors.entries()) {
    if (history.length < 2) continue;
    const first = history[0].score;
    const last = history[history.length - 1].score;
    lines.push(`| ${vendor_id} | ${first.toFixed(1)} | ${last.toFixed(1)} | ${signed(last - first)} |`);
  }
  lines.push("");
  lines.push("## Delta-Events der Woche");
  for (const d of days) {
    if (!d.deltaFile?.events?.length) continue;
    lines.push(`### ${d.date}`);
    for (const e of d.deltaFile.events) lines.push(`- ${e.type} (${e.severity ?? "info"}): ${e.vendor_id ?? ""}`);
  }
  return lines.join("\n");
}
