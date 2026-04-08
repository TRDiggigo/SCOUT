// Anthropic adapter. Encapsulates model IDs, the web-search server tool type,
// max_uses, beta headers, and timeouts. Tasks call the high-level methods only —
// no model strings or tool type strings appear in src/tasks/*.

import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../util/logger.js";
import { withBackoff, CircuitBreaker } from "../util/limits.js";

export class AnthropicAdapter {
  constructor(providers, { apiKey = process.env.ANTHROPIC_API_KEY, client } = {}) {
    if (!providers?.anthropic) throw new Error("AnthropicAdapter: missing providers.anthropic");
    this.cfg = providers.anthropic;
    this.client =
      client ??
      new Anthropic({
        apiKey,
        timeout: this.cfg.timeout_ms ?? 120_000,
        defaultHeaders:
          this.cfg.beta_headers?.length > 0
            ? { "anthropic-beta": this.cfg.beta_headers.join(",") }
            : undefined
      });
    this.breaker = new CircuitBreaker();
  }

  // ---------- A1: Web Research ----------
  async researchWithWebSearch({ vendor, queries, system }) {
    if (!this.breaker.canCall()) throw new Error("anthropic circuit open");
    const tool = {
      type: this.cfg.web_search_tool.type,
      name: "web_search",
      max_uses: this.cfg.web_search_tool.max_uses
    };
    const userPrompt = [
      `Vendor: ${vendor.name} (${vendor.country}, ${vendor.tier})`,
      `Run web searches for the following angles and report URLs, dates, and short factual snippets:`,
      ...queries.map((q, i) => `${i + 1}. ${q}`),
      `Stay within ${this.cfg.web_search_tool.max_uses} search calls. Return concise factual notes only — no opinions.`
    ].join("\n");

    try {
      const resp = await withBackoff(
        () =>
          this.client.messages.create({
            model: this.cfg.research_model,
            max_tokens: this.cfg.max_tokens,
            system: system ?? "You are SCOUT, a strict factual market analyst for the EU AI agent market.",
            tools: [tool],
            messages: [{ role: "user", content: userPrompt }]
          }),
        { label: `anthropic.research.${vendor.vendor_id}` }
      );
      this.breaker.recordSuccess();
      return this.#flattenResearchResponse(resp);
    } catch (err) {
      this.breaker.recordFailure();
      throw err;
    }
  }

  #flattenResearchResponse(resp) {
    const blocks = resp?.content ?? [];
    const text = blocks
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const searchResults = blocks
      .filter((b) => b.type === "web_search_tool_result")
      .flatMap((b) => b.content ?? []);
    return {
      text,
      raw_results: searchResults,
      usage: resp.usage,
      model: resp.model
    };
  }

  // ---------- A2: Structured extraction via tool_use ----------
  async extractStructured({ system, userPrompt, schema, schemaName, model }) {
    const toolName = schemaName ?? "extract";
    const tool = {
      name: toolName,
      description: `Return data matching the ${toolName} schema. Do not call any other tool.`,
      input_schema: schema
    };
    const resp = await withBackoff(
      () =>
        this.client.messages.create({
          model: model ?? this.cfg.extraction_model,
          max_tokens: this.cfg.max_tokens,
          system,
          tools: [tool],
          tool_choice: { type: "tool", name: toolName },
          messages: [{ role: "user", content: userPrompt }]
        }),
      { label: "anthropic.extract" }
    );
    const toolUse = (resp.content ?? []).find((b) => b.type === "tool_use");
    if (!toolUse) throw new Error("Anthropic returned no tool_use block for structured extraction");
    return { data: toolUse.input, usage: resp.usage, model: resp.model };
  }

  // ---------- A3: Scoring rubric (structured output) ----------
  async scoreRubric({ system, userPrompt, schema }) {
    return this.extractStructured({
      system,
      userPrompt,
      schema,
      schemaName: "scoring_rubric",
      model: this.cfg.scoring_model
    });
  }

  // ---------- A4 + A5: free-text generation ----------
  async generate({ system, userPrompt, model }) {
    const resp = await withBackoff(
      () =>
        this.client.messages.create({
          model: model ?? this.cfg.report_model,
          max_tokens: this.cfg.max_tokens,
          system,
          messages: [{ role: "user", content: userPrompt }]
        }),
      { label: "anthropic.generate" }
    );
    const text = (resp.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return { text, usage: resp.usage, model: resp.model };
  }
}
