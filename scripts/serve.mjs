// Tiny static server for local use on http://localhost:8123 (the same origin used to test widget tokens locally).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.argv[2] ?? ".";
const port = Number(process.env.PORT ?? 8123);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript" };
createServer(async (req, res) => {
  const pathname = new URL(req.url ?? "/", "http://x").pathname;
  const rel = normalize(pathname === "/" ? "/index.html" : pathname).replace(/^(\.\.[/\\])+/, "");
  try {
    const body = await readFile(join(root, rel));
    res.writeHead(200, { "content-type": types[extname(rel)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
  }
}).listen(port, () => console.log(`Site on http://localhost:${port}`));
