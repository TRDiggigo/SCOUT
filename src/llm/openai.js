// OpenAI adapter — used as the dual-LLM second-opinion path for A3 scoring.
// Uses response_format json_schema with strict:true so we never parse best-effort JSON.

import OpenAI from "openai";
import { withBackoff, CircuitBreaker } from "../util/limits.js";

export class OpenAIAdapter {
  constructor(providers, { apiKey = process.env.OPENAI_API_KEY, client } = {}) {
    if (!providers?.openai) throw new Error("OpenAIAdapter: missing providers.openai");
    this.cfg = providers.openai;
    this.client = client ?? new OpenAI({ apiKey, timeout: this.cfg.timeout_ms ?? 120_000 });
    this.breaker = new CircuitBreaker();
  }

  async scoreRubric({ system, userPrompt, schema, schemaName = "scoring_rubric" }) {
    if (!this.breaker.canCall()) throw new Error("openai circuit open");
    try {
      const resp = await withBackoff(
        () =>
          this.client.chat.completions.create({
            model: this.cfg.second_opinion_model,
            max_tokens: this.cfg.max_tokens,
            messages: [
              { role: "system", content: system },
              { role: "user", content: userPrompt }
            ],
            response_format: {
              type: "json_schema",
              json_schema: { name: schemaName, schema, strict: true }
            }
          }),
        { label: "openai.scoreRubric" }
      );
      this.breaker.recordSuccess();
      const content = resp.choices?.[0]?.message?.content;
      if (!content) throw new Error("OpenAI returned empty content for structured output");
      return { data: JSON.parse(content), usage: resp.usage, model: resp.model };
    } catch (err) {
      this.breaker.recordFailure();
      throw err;
    }
  }
}
