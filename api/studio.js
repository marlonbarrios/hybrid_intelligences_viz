const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REPO = process.env.HI_GITHUB_REPO || "marlonbarrios/hybrid_intelligences_viz";
const BRANCH = process.env.HI_GITHUB_BRANCH || "main";

function applyCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      return {};
    }
  }
  return {};
}

function clip(text, max) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function secretsMatch(provided, expected) {
  if (!expected || !provided) return false;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return require("crypto").timingSafeEqual(a, b);
}

function githubHeaders(token) {
  return {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "hybrid-intelligences-studio",
  };
}

async function githubJson(token, url, init) {
  const response = await fetch(url, {
    ...init,
    headers: { ...githubHeaders(token), ...(init && init.headers) },
  });
  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }
  if (!response.ok) {
    const err = new Error(
      (data && data.message) || "GitHub request failed (" + response.status + ")."
    );
    err.status = response.status;
    throw err;
  }
  return data;
}

function truthy(value) {
  const v = String(value || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "on" || v === "yes";
}

function jobPayload(body) {
  const action = String(body.action || "").trim().toLowerCase();
  if (action === "auth") return { action: "auth" };
  if (action === "concept") {
    return {
      action: "concept",
      concept: {
        id: clip(body.id, 48),
        label: clip(body.label || body.name, 80),
        category: clip(body.category || body.cat, 24) || "framework",
        definition: clip(body.definition || body.desc, 1200),
        related: clip(body.related, 400),
        wikipedia: clip(body.wikipedia || body.wiki, 160),
        addVideo: truthy(body.addVideo),
      },
    };
  }
  if (action === "video") {
    return {
      action: "video",
      video: {
        url: clip(body.url || body.youtube, 200),
        title: clip(body.title, 180),
        speaker: clip(body.speaker, 80),
        date: clip(body.date, 20),
        caption: clip(body.caption, 400),
        credit: clip(body.credit, 120),
        id: clip(body.id, 48),
      },
    };
  }
  if (action === "essay") {
    const markdown = String(body.markdown || body.body || "").replace(/\r\n/g, "\n");
    return {
      action: "essay",
      essay: {
        title: clip(body.title, 160),
        author: clip(body.author, 120) || "Marlon Barrios Solano",
        date: clip(body.date, 60),
        markdown: markdown.slice(0, 100000),
      },
    };
  }
  const err = new Error("Unknown action. Use concept, video, or essay.");
  err.status = 400;
  throw err;
}

async function queueOnGitHub(token, payload) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jobPath = `ingest/jobs/${stamp}-${payload.action}.json`;
  await githubJson(token, `https://api.github.com/repos/${REPO}/contents/${jobPath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `studio: queue ${payload.action}`,
      content: Buffer.from(JSON.stringify(payload, null, 2) + "\n").toString("base64"),
      branch: BRANCH,
    }),
  });

  await githubJson(token, `https://api.github.com/repos/${REPO}/actions/workflows/studio.yml/dispatches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ref: BRANCH,
      inputs: { job: jobPath },
    }),
  });

  await new Promise((resolve) => setTimeout(resolve, 1200));
  let runUrl = `https://github.com/${REPO}/actions`;
  try {
    const runs = await githubJson(
      token,
      `https://api.github.com/repos/${REPO}/actions/workflows/studio.yml/runs?per_page=1`
    );
    if (runs.workflow_runs && runs.workflow_runs[0] && runs.workflow_runs[0].html_url) {
      runUrl = runs.workflow_runs[0].html_url;
    }
  } catch (_) {}

  return { job: jobPath, runUrl };
}

function runLocal(payload) {
  const dir = path.join(ROOT, "ingest", "jobs");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jobPath = path.join(dir, `${stamp}-${payload.action}.json`);
  fs.writeFileSync(jobPath, JSON.stringify(payload, null, 2) + "\n");
  const result = spawnSync("node", ["scripts/studio-publish.js", "--job", jobPath], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 10 * 60 * 1000,
  });
  const output = ((result.stdout || "") + "\n" + (result.stderr || "")).trim();
  if (result.status !== 0) {
    const err = new Error(output.slice(-1200) || "Studio publish failed locally.");
    err.status = 500;
    throw err;
  }
  let summary = {};
  try {
    const jsonStart = output.lastIndexOf("{");
    if (jsonStart >= 0) summary = JSON.parse(output.slice(jsonStart));
  } catch (_) {}
  return { local: true, summary, log: output.slice(-2000) };
}

module.exports = async function handler(req, res) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const expected = process.env.HI_STUDIO_SECRET || "";
  if (!expected) {
    res.status(500).json({
      error: "Studio is not configured. Set HI_STUDIO_SECRET on the server.",
    });
    return;
  }

  const body = readJsonBody(req);
  if (!secretsMatch(body.secret, expected)) {
    res.status(401).json({ error: "Wrong passphrase." });
    return;
  }

  try {
    const payload = jobPayload(body);
    if (payload.action === "auth") {
      res.status(200).json({ ok: true });
      return;
    }

    const token = process.env.HI_GITHUB_TOKEN || "";
    if (token) {
      const queued = await queueOnGitHub(token, payload);
      res.status(200).json({
        ok: true,
        queued: true,
        job: queued.job,
        runUrl: queued.runUrl,
        message:
          "Queued. GitHub Actions will ingest, rebuild, and push to main. GitHub Pages and Vercel follow that commit.",
      });
      return;
    }

    if (process.env.VERCEL) {
      res.status(500).json({
        error: "Set HI_GITHUB_TOKEN on Vercel (repo Contents + Actions write) so Studio can queue a publish. Also set OPENAI_API_KEY as a GitHub Actions secret.",
      });
      return;
    }

    const local = runLocal(payload);
    res.status(200).json({
      ok: true,
      local: true,
      summary: local.summary,
      message:
        "Updated files on this machine. Commit and push to publish the live Hub, or set HI_GITHUB_TOKEN on Vercel to publish from the page.",
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || "Studio failed." });
  }
};

module.exports.config = { maxDuration: 60 };
