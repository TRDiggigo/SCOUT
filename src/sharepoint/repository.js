// SCOUT-Scores list repository.
// upsertScoreItem(vendor_id, fields) implements:
//   1. GET items?$filter=fields/vendor_id eq '...'&$expand=fields
//   2. empty → POST /items
//   3. existing → PATCH /items/{id}/fields with If-Match: <etag>
// On 412 (etag mismatch) we re-fetch once and retry.

import { logger } from "../util/logger.js";

export class ScoresListRepository {
  constructor(graph, siteId, listName) {
    this.graph = graph;
    this.siteId = siteId;
    this.listName = listName;
    this.listId = null;
  }

  async resolveListId() {
    if (this.listId) return this.listId;
    const res = await this.graph.request(
      "GET",
      `/sites/${this.siteId}/lists?$filter=displayName eq '${encodeURIComponent(this.listName)}'`
    );
    const list = res.value?.[0];
    if (!list) throw new Error(`SCOUT list not found: ${this.listName} (run scout bootstrap-sharepoint)`);
    this.listId = list.id;
    return this.listId;
  }

  async findByVendor(vendorId) {
    const listId = await this.resolveListId();
    const url = `/sites/${this.siteId}/lists/${listId}/items?$expand=fields&$filter=fields/vendor_id eq '${encodeURIComponent(vendorId)}'`;
    const res = await this.graph.request("GET", url, {
      headers: { Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly" }
    });
    return res.value?.[0] ?? null;
  }

  async createItem(fields) {
    const listId = await this.resolveListId();
    return this.graph.request("POST", `/sites/${this.siteId}/lists/${listId}/items`, {
      body: { fields }
    });
  }

  async patchItemFields(itemId, fields, etag) {
    const listId = await this.resolveListId();
    return this.graph.request(
      "PATCH",
      `/sites/${this.siteId}/lists/${listId}/items/${itemId}/fields`,
      {
        headers: etag ? { "If-Match": etag } : {},
        body: fields
      }
    );
  }

  async upsertScoreItem(vendorId, fields) {
    const existing = await this.findByVendor(vendorId);
    if (!existing) {
      logger.debug("creating list item", { vendor_id: vendorId });
      return this.createItem({ vendor_id: vendorId, ...fields });
    }
    const etag = existing["@odata.etag"] ?? existing.fields?.["@odata.etag"];
    try {
      return await this.patchItemFields(existing.id, fields, etag);
    } catch (err) {
      if (err.status === 412) {
        logger.warn("etag mismatch, re-fetching for retry", { vendor_id: vendorId });
        const refreshed = await this.findByVendor(vendorId);
        if (!refreshed) throw err;
        const newEtag = refreshed["@odata.etag"] ?? refreshed.fields?.["@odata.etag"];
        return this.patchItemFields(refreshed.id, fields, newEtag);
      }
      throw err;
    }
  }

  // Maps a score entry from scores.json to flat list-item fields.
  static toListFields(scoreEntry) {
    return {
      title: scoreEntry.name,
      run_id: scoreEntry.source_run_id,
      run_date: scoreEntry.last_updated?.slice(0, 10),
      as_of_date: scoreEntry.as_of_date,
      freshness_status: scoreEntry.freshness_status,
      tier: scoreEntry.tier,
      trend: scoreEntry.trend,
      status: scoreEntry.risk_level,
      total_score: scoreEntry.scores.total,
      maturity_score: scoreEntry.scores.maturity,
      integration_score: scoreEntry.scores.integration,
      governance_score: scoreEntry.scores.governance,
      confidence: scoreEntry.confidence,
      evidence_count: scoreEntry.sources?.length ?? 0
    };
  }
}
