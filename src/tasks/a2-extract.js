// A2 Extraction. Sonnet with Structured Outputs (tool_use input_schema).
// Validates against src/evidence/schema.js. Items missing source_url or published_at
// are dropped, never "patched up" — extraction must stay honest.

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { vendorEvidenceSchema, evidenceFileSchema } from "../evidence/schema.js";
import { logger } from "../util/logger.js";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateVendor = ajv.compile(vendorEvidenceSchema);
const validateFile = ajv.compile(evidenceFileSchema);

const SYSTEM_PROMPT =
  "You are SCOUT, an evidence extractor. From the supplied raw research notes, " +
  "produce a structured JSON list of evidence items. Each item must have a verifiable " +
  "source_url, an ISO date for published_at, and a single dimension tag " +
  "(maturity | integration | governance). Discard claims you cannot back up with a URL.";

export async function runExtraction({ runId, researchResults, anthropic }) {
  const vendors = [];
  for (const research of researchResults) {
    if (research.error) {
      vendors.push({ vendor_id: research.vendor_id, evidence: [], notes: `research failed: ${research.error}` });
      continue;
    }
    const userPrompt = buildPrompt(research);
    try {
      const { data } = await anthropic.extractStructured({
        system: SYSTEM_PROMPT,
        userPrompt,
        schema: vendorEvidenceSchema,
        schemaName: "vendor_evidence"
      });
      const cleaned = filterValid(data);
      if (!validateVendor(cleaned)) {
        logger.warn("vendor evidence failed schema, dropping", {
          vendor_id: research.vendor_id,
          errors: validateVendor.errors
        });
        vendors.push({ vendor_id: research.vendor_id, evidence: [], notes: "schema validation failed" });
        continue;
      }
      vendors.push(cleaned);
    } catch (err) {
      logger.error("extraction failed", { vendor_id: research.vendor_id, err: String(err?.message ?? err) });
      vendors.push({ vendor_id: research.vendor_id, evidence: [], notes: `extraction error: ${err.message}` });
    }
  }
  const file = {
    run_id: runId,
    generated_at: new Date().toISOString(),
    vendors
  };
  if (!validateFile(file)) {
    throw new Error(`evidence.json failed schema validation: ${JSON.stringify(validateFile.errors)}`);
  }
  return file;
}

function buildPrompt(research) {
  const lines = [
    `Vendor ID: ${research.vendor_id}`,
    `Search queries used:`,
    ...(research.queries ?? []).map((q, i) => `  ${i + 1}. ${q}`),
    `Raw research notes:`,
    research.text ?? "(none)"
  ];
  return lines.join("\n");
}

function filterValid(vendorEvidence) {
  const evidence = (vendorEvidence?.evidence ?? []).filter(
    (e) => e?.source_url && e?.published_at && e?.dimension && e?.source_type
  );
  return { ...vendorEvidence, evidence };
}
