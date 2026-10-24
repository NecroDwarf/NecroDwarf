import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { pathToFileURL } from "node:url";
const root = resolve("build/client");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};
export function createStaticServer() {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const pathname = decodeURIComponent(url.pathname);
      if (pathname !== "/" && /\/$/.test(pathname)) {
        response.writeHead(301, {
          Location: pathname.replace(/\/+$/, "") + url.search,
        });
        response.end();
        return;
      }
      const file = resolve(
        root,
        pathname === "/" ? "index.html" : "." + pathname,
      );
      if (!file.startsWith(root + sep)) {
        response.writeHead(400);
        response.end();
        return;
      }
      for (const candidate of [file, file + ".html"]) {
        try {
          if (!(await stat(candidate)).isFile()) continue;
          response.writeHead(200, {
            "Content-Type":
              mime[extname(candidate)] || "application/octet-stream",
          });
          response.end(await readFile(candidate));
          return;
        } catch (error) {
          if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
        }
      }
      response.writeHead(404, { "Content-Type": mime[".html"] });
      response.end(await readFile(resolve(root, "404.html")));
    } catch {
      response.writeHead(500);
      response.end("Static preview error");
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  createStaticServer().listen(4173, "127.0.0.1", () =>
    console.log("Local: http://127.0.0.1:4173"),
  );
}
