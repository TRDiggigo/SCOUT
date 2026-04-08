// One-off provisioning. Requires broader app permissions (Sites.Manage.All) than the
// daily runtime, which is why this lives behind `scout bootstrap-sharepoint`.
//
// Steps:
//   1. Resolve site ID (hostname+path → ID).
//   2. Ensure /SCOUT/{config,data,reports,reports/weekly,logs} folders.
//   3. Ensure SCOUT-Scores list with indexed unique vendor_id column.
//   4. Seed local config/{vendors,weights,sources,providers}.json into /SCOUT/config/.
//   5. Write .env.resolved with the resolved site ID for downstream commands.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { GraphClient } from "./client.js";
import { FileRepository } from "./files.js";
import { SCOUT_SCORES_LIST, SCOUT_FOLDERS } from "./list-definitions.js";
import { logger } from "../util/logger.js";

const CONFIG_FILES = ["vendors.json", "weights.json", "sources.json", "providers.json"];

export async function bootstrapSharePoint({ projectRoot = process.cwd() } = {}) {
  const graph = new GraphClient();
  const siteId = await graph.resolveSiteId();
  const files = new FileRepository(graph, siteId);

  logger.info("bootstrap: ensuring folders", { siteId });
  for (const folder of SCOUT_FOLDERS) {
    await files.ensureFolder(folder);
  }

  logger.info("bootstrap: ensuring SCOUT-Scores list");
  await ensureScoresList(graph, siteId);

  logger.info("bootstrap: seeding remote config from local seed files");
  for (const file of CONFIG_FILES) {
    const localPath = join(projectRoot, "config", file);
    if (!existsSync(localPath)) {
      logger.warn("seed missing", { file: localPath });
      continue;
    }
    const data = JSON.parse(readFileSync(localPath, "utf8"));
    const remotePath = `SCOUT/config/${file}`;
    const existing = await files.readJson(remotePath);
    if (existing) {
      logger.info("config already present, leaving untouched", { file: remotePath });
      continue;
    }
    await files.uploadJson(remotePath, data);
    logger.info("seeded config", { file: remotePath });
  }

  return { siteId };
}

async function ensureScoresList(graph, siteId) {
  const search = await graph.request(
    "GET",
    `/sites/${siteId}/lists?$filter=displayName eq '${encodeURIComponent(SCOUT_SCORES_LIST.displayName)}'`
  );
  if (search.value?.length) {
    logger.info("scores list already exists", { id: search.value[0].id });
    return search.value[0];
  }
  const created = await graph.request("POST", `/sites/${siteId}/lists`, {
    body: SCOUT_SCORES_LIST
  });
  logger.info("created scores list", { id: created.id });
  return created;
}
