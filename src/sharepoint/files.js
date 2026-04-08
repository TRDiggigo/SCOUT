// File repository for SCOUT artefacts. Uses the default Documents drive of the SCOUT site.
// uploadSmall() = single PUT /content (≤ 250 MB). uploadLarge() = createUploadSession.
// MVP only needs the small path; the abstraction is in place from day 1.

const SMALL_UPLOAD_LIMIT_BYTES = 240 * 1024 * 1024; // 240 MB safety margin under the 250 MB Graph limit.

export class FileRepository {
  constructor(graph, siteId) {
    this.graph = graph;
    this.siteId = siteId;
    this.driveId = null;
  }

  async getDriveId() {
    if (this.driveId) return this.driveId;
    const drive = await this.graph.request("GET", `/sites/${this.siteId}/drive`);
    this.driveId = drive.id;
    return this.driveId;
  }

  async ensureFolder(path) {
    const segments = path.split("/").filter(Boolean);
    let parent = "root";
    let cumulative = "";
    for (const seg of segments) {
      cumulative = cumulative ? `${cumulative}/${seg}` : seg;
      try {
        const child = await this.graph.request(
          "GET",
          `/sites/${this.siteId}/drive/root:/${encodeURI(cumulative)}`
        );
        parent = child.id;
      } catch (err) {
        if (err.status !== 404) throw err;
        const created = await this.graph.request(
          "POST",
          `/sites/${this.siteId}/drive/items/${parent}/children`,
          {
            body: {
              name: seg,
              folder: {},
              "@microsoft.graph.conflictBehavior": "replace"
            }
          }
        );
        parent = created.id;
      }
    }
    return parent;
  }

  async uploadJson(path, data) {
    const body = JSON.stringify(data, null, 2);
    return this.upload(path, body, "application/json");
  }

  async uploadText(path, text, contentType = "text/markdown") {
    return this.upload(path, text, contentType);
  }

  async upload(path, body, contentType) {
    const buf = typeof body === "string" ? Buffer.from(body, "utf8") : body;
    if (buf.length <= SMALL_UPLOAD_LIMIT_BYTES) return this.uploadSmall(path, buf, contentType);
    return this.uploadLarge(path, buf, contentType);
  }

  async uploadSmall(path, buf, contentType) {
    const folder = path.split("/").slice(0, -1).join("/");
    if (folder) await this.ensureFolder(folder);
    return this.graph.request(
      "PUT",
      `/sites/${this.siteId}/drive/root:/${encodeURI(path)}:/content`,
      {
        headers: { "Content-Type": contentType },
        body: buf,
        raw: true
      }
    );
  }

  async uploadLarge(path, buf, contentType) {
    const folder = path.split("/").slice(0, -1).join("/");
    if (folder) await this.ensureFolder(folder);
    const session = await this.graph.request(
      "POST",
      `/sites/${this.siteId}/drive/root:/${encodeURI(path)}:/createUploadSession`,
      { body: { item: { "@microsoft.graph.conflictBehavior": "replace" } } }
    );
    const url = session.uploadUrl;
    const chunkSize = 5 * 1024 * 1024;
    let offset = 0;
    let result;
    while (offset < buf.length) {
      const end = Math.min(offset + chunkSize, buf.length);
      const slice = buf.subarray(offset, end);
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Length": String(slice.length),
          "Content-Range": `bytes ${offset}-${end - 1}/${buf.length}`,
          "Content-Type": contentType
        },
        body: slice
      });
      if (!res.ok && res.status !== 202) throw new Error(`upload session chunk failed: ${res.status}`);
      result = await res.json().catch(() => ({}));
      offset = end;
    }
    return result;
  }

  async readJson(path) {
    try {
      const res = await this.graph.request(
        "GET",
        `/sites/${this.siteId}/drive/root:/${encodeURI(path)}:/content`
      );
      return res;
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  }

  async copyFile(srcPath, destPath) {
    const folder = destPath.split("/").slice(0, -1).join("/");
    const filename = destPath.split("/").pop();
    const srcItem = await this.graph.request(
      "GET",
      `/sites/${this.siteId}/drive/root:/${encodeURI(srcPath)}`
    );
    const parentFolderId = await this.ensureFolder(folder);
    return this.graph.request("POST", `/sites/${this.siteId}/drive/items/${srcItem.id}/copy`, {
      body: {
        parentReference: { driveId: await this.getDriveId(), id: parentFolderId },
        name: filename
      }
    });
  }
}
