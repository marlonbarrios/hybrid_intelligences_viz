#!/usr/bin/env node
/**
 * Local static server plus /api/token, /api/image, /api/enact, and /api/speech.
 *
 *   OPENAI_API_KEY=sk-... node local-server.js
 *   # or put OPENAI_API_KEY in a gitignored .env file
 *
 * Then open http://localhost:8000/voice.html, image.html, mini-pod.html, or enact.html
 */

const fs = require("fs");
const http = require("http");
const path = require("path");
const tokenHandler = require("./api/token");
const imageHandler = require("./api/image");
const enactHandler = require("./api/enact");
const speechHandler = require("./api/speech");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8000;

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".m4a": "audio/mp4",
  ".pdf": "application/pdf",
  ".ttl": "text/turtle; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function send(res, status, body, headers) {
  res.writeHead(status, headers);
  res.end(body);
}

function vercelRes(res) {
  let code = 200;
  return {
    setHeader(name, value) {
      res.setHeader(name, value);
    },
    status(next) {
      code = next;
      return this;
    },
    json(obj) {
      res.statusCode = code;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(obj));
    },
    send(body) {
      res.statusCode = code;
      res.end(body);
    },
    end() {
      res.statusCode = code;
      res.end();
    },
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function vercelReq(req) {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  let body = {};
  if (req.method === "POST" || req.method === "PUT") {
    const raw = await readBody(req);
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch (_) {
        body = {};
      }
    }
  }
  return {
    method: req.method,
    url: req.url,
    query: Object.fromEntries(url.searchParams),
    body,
  };
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(filePath).pipe(res);
  });
}

loadEnv();

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];
  const handler =
    urlPath === "/api/token" ? tokenHandler
    : urlPath === "/api/image" ? imageHandler
    : urlPath === "/api/enact" ? enactHandler
    : urlPath === "/api/speech" ? speechHandler
    : null;
  if (handler) {
    Promise.resolve(vercelReq(req))
      .then((fakeReq) => handler(fakeReq, vercelRes(res)))
      .catch((err) => {
        send(res, 500, JSON.stringify({ error: err.message || "API handler failed." }), {
          "Content-Type": "application/json; charset=utf-8",
        });
      });
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Hybrid Intelligences local server: http://localhost:${PORT}/`);
  console.log(`Voice: http://localhost:${PORT}/voice.html`);
  console.log(`Image: http://localhost:${PORT}/image.html`);
  console.log(`Enact: http://localhost:${PORT}/enact.html`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. Copy .env.example to .env, or Talk / Make an image / Mini-pod / Enact will fail until you paste a deployed Vercel URL.");
  }
});
