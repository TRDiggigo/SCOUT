// Microsoft Graph client. OAuth 2.0 client-credentials via @azure/msal-node.
// Resolves the SCOUT site by either explicit ID or hostname+path.

import { ConfidentialClientApplication } from "@azure/msal-node";
import { logger } from "../util/logger.js";
import { withBackoff } from "../util/limits.js";

const GRAPH_HOST = "https://graph.microsoft.com/v1.0";
const SCOPE = "https://graph.microsoft.com/.default";

export class GraphClient {
  constructor({
    tenantId = process.env.GRAPH_TENANT_ID,
    clientId = process.env.GRAPH_CLIENT_ID,
    clientSecret = process.env.GRAPH_CLIENT_SECRET,
    fetchImpl = globalThis.fetch
  } = {}) {
    if (!tenantId || !clientId || !clientSecret) {
      throw new Error("GraphClient: missing GRAPH_TENANT_ID/CLIENT_ID/CLIENT_SECRET");
    }
    this.fetch = fetchImpl;
    this.msal = new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: `https://login.microsoftonline.com/${tenantId}`
      }
    });
    this.tokenCache = null;
  }

  async getToken() {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresOn - now > 60_000) {
      return this.tokenCache.accessToken;
    }
    const result = await this.msal.acquireTokenByClientCredential({ scopes: [SCOPE] });
    if (!result?.accessToken) throw new Error("GraphClient: token acquisition failed");
    this.tokenCache = result;
    return result.accessToken;
  }

  async request(method, path, { headers = {}, body, raw = false } = {}) {
    return withBackoff(
      async () => {
        const token = await this.getToken();
        const url = path.startsWith("http") ? path : `${GRAPH_HOST}${path}`;
        const init = {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(body && !raw ? { "Content-Type": "application/json" } : {}),
            ...headers
          },
          body: raw ? body : body ? JSON.stringify(body) : undefined
        };
        const res = await this.fetch(url, init);
        if (!res.ok) {
          const text = await res.text();
          const err = new Error(`Graph ${method} ${path} → ${res.status}: ${text}`);
          err.status = res.status;
          if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
            err.nonRetryable = true;
          }
          throw err;
        }
        if (res.status === 204) return null;
        const ct = res.headers.get("content-type") ?? "";
        return ct.includes("application/json") ? res.json() : res.text();
      },
      { label: `graph.${method}` }
    );
  }

  async resolveSiteId({ siteId, hostname, path } = {}) {
    if (siteId) return siteId;
    const envId = process.env.SCOUT_SITE_ID;
    if (envId) return envId;
    const host = hostname ?? process.env.SCOUT_SITE_HOSTNAME;
    const sitePath = path ?? process.env.SCOUT_SITE_PATH;
    if (!host || !sitePath) {
      throw new Error("GraphClient.resolveSiteId: need SCOUT_SITE_ID or SCOUT_SITE_HOSTNAME+SCOUT_SITE_PATH");
    }
    const cleanPath = sitePath.startsWith("/") ? sitePath : `/${sitePath}`;
    const site = await this.request("GET", `/sites/${host}:${cleanPath}`);
    logger.info("resolved sharepoint site", { id: site.id, name: site.displayName });
    return site.id;
  }
}
