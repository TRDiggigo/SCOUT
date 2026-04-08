// Loads the four remote config files (vendors, weights, sources, providers) from
// /SCOUT/config/ in SharePoint. Falls back to local seed files only when explicitly
// allowed (`localOnly:true` for tests / dry-run smoke).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { logger } from "../util/logger.js";

const REQUIRED = ["vendors", "weights", "sources", "providers"];

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const minimalSchemas = {
  vendors: {
    type: "object",
    required: ["vendors"],
    properties: {
      vendors: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["vendor_id", "name", "country", "tier"],
          properties: {
            vendor_id: { type: "string", minLength: 1 },
            name: { type: "string", minLength: 1 },
            country: { type: "string", minLength: 2 },
            tier: { type: "string", enum: ["EU-Native", "EU-Adjacent", "Global"] }
          }
        }
      }
    }
  },
  weights: {
    type: "object",
    required: ["dimensions"],
    properties: {
      dimensions: {
        type: "object",
        required: ["maturity", "integration", "governance"],
        properties: {
          maturity: { type: "object", required: ["weight"] },
          integration: { type: "object", required: ["weight"] },
          governance: { type: "object", required: ["weight"] }
        }
      }
    }
  },
  sources: {
    type: "object",
    required: ["sources"],
    properties: { sources: { type: "array", minItems: 1 } }
  },
  providers: {
    type: "object",
    required: ["anthropic", "openai", "limits"],
    properties: {
      anthropic: {
        type: "object",
        required: ["research_model", "scoring_model", "web_search_tool"]
      },
      openai: { type: "object", required: ["second_opinion_model"] },
      limits: { type: "object" }
    }
  }
};

export async function loadRemoteConfig(files) {
  const out = {};
  for (const key of REQUIRED) {
    const data = await files.readJson(`SCOUT/config/${key}.json`);
    if (!data) throw new Error(`SCOUT config missing in SharePoint: SCOUT/config/${key}.json`);
    out[key] = data;
  }
  return validateAll(out);
}

export function loadLocalConfig({ projectRoot = process.cwd() } = {}) {
  const out = {};
  for (const key of REQUIRED) {
    const path = join(projectRoot, "config", `${key}.json`);
    out[key] = JSON.parse(readFileSync(path, "utf8"));
  }
  return validateAll(out);
}

export function validateAll(config) {
  const errors = [];
  for (const key of REQUIRED) {
    const validate = ajv.compile(minimalSchemas[key]);
    if (!validate(config[key])) {
      errors.push({ file: `${key}.json`, errors: validate.errors });
    }
  }
  if (errors.length > 0) {
    logger.error("config validation failed", { errors });
    const err = new Error(`SCOUT config validation failed: ${JSON.stringify(errors)}`);
    err.details = errors;
    throw err;
  }
  return config;
}
