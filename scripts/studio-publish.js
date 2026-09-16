#!/usr/bin/env node
/**
 * Apply a Studio job: add a concept, ingest a YouTube talk, or add an essay,
 * then rebuild the Hub files. Used by the Studio page (local) and GitHub Actions.
 *
 *   node scripts/studio-publish.js --job ingest/jobs/example.json
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { linkEssayMarkdown, attachEssayConceptEdges } = require("./link-essay-concepts");

const ROOT = path.join(__dirname, "..");
const NETWORK = path.join(ROOT, "hybrid-network.js");
const MANIFEST = path.join(ROOT, "videos.json");

const CATEGORIES = [
  "premise", "framework", "author", "practice", "quality", "phenomenon",
  "domain", "tension", "program", "organization", "participant",
  "background", "facilitator",
];

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

function clip(text, max) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

function youtubeVideoId(url) {
  const match = String(url || "").match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function jsString(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function wrapLabel(label) {
  const t = String(label || "").replace(/\s+/g, " ").trim();
  if (t.length <= 16) return t;
  const mid = Math.ceil(t.length / 2);
  let space = t.lastIndexOf(" ", mid);
  if (space < 4) space = t.indexOf(" ", mid);
  if (space < 4) return t;
  return t.slice(0, space) + "\n" + t.slice(space + 1);
}

function listNodeIds(src) {
  const ids = new Set();
  const re = /\{\s*id:\s*"([^"]+)"/g;
  let match;
  while ((match = re.exec(src))) ids.add(match[1]);
  return ids;
}

function insertBefore(src, marker, block) {
  const idx = src.indexOf(marker);
  if (idx < 0) throw new Error("Could not find insert point: " + marker.replace(/\s+/g, " ").slice(0, 60));
  return src.slice(0, idx) + block + src.slice(idx);
}

function readJob(filePath) {
  const abs = path.resolve(path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath));
  const jobsDir = path.resolve(path.join(ROOT, "ingest", "jobs"));
  if (!abs.startsWith(jobsDir + path.sep)) {
    throw new Error("Job file must live under ingest/jobs.");
  }
  if (!fs.existsSync(abs)) throw new Error("Job file not found: " + filePath);
  return { abs, job: JSON.parse(fs.readFileSync(abs, "utf8")) };
}

function run(cmd, args, opts) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: opts && opts.timeout ? opts.timeout : 8 * 60 * 1000,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    throw new Error((opts && opts.label ? opts.label + " failed. " : "") + (result.stderr || result.stdout || cmd).trim().slice(0, 800));
  }
}

async function downloadPoster(yt, outPath) {
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 5000) return;
  for (const url of [
    `https://i.ytimg.com/vi/${yt}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
  ]) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 5000) {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, buf);
        return;
      }
    } catch (_) {}
  }
}

function parseRelated(raw, ids) {
  const wanted = String(raw || "")
    .split(/[,;\n]+/)
    .map((s) => slugify(s.trim()))
    .filter(Boolean);
  const related = [];
  const missing = [];
  for (const id of wanted) {
    if (ids.has(id)) related.push(id);
    else missing.push(id);
  }
  if (!related.length && ids.has("coupling")) related.push("coupling");
  if (!related.length && ids.has("hybrid")) related.push("hybrid");
  return { related: [...new Set(related)].slice(0, 8), missing };
}

const WIKI_UA = "HybridIntelligencesStudio/1.0 (https://github.com/marlonbarrios/hybrid_intelligences_viz)";

function normalizeName(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "");
}

async function lookupWikipedia(label) {
  const q = clip(label, 80);
  if (!q) return "";
  const searchUrl = "https://en.wikipedia.org/w/api.php?" + new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: q,
    srlimit: "5",
    srnamespace: "0",
    format: "json",
  });
  const res = await fetch(searchUrl, { headers: { "User-Agent": WIKI_UA } });
  if (!res.ok) return "";
  const data = await res.json();
  const hits = (data.query && data.query.search) || [];
  const nq = normalizeName(q);
  let title = "";
  for (const hit of hits) {
    const candidate = String(hit.title || "");
    if (/disambiguation/i.test(candidate)) continue;
    const nt = normalizeName(candidate);
    if (nt === nq || nt.startsWith(nq) || nq.startsWith(nt) || (nq.length >= 5 && nt.includes(nq))) {
      title = candidate;
      break;
    }
  }
  if (!title) return "";

  const resolveUrl = "https://en.wikipedia.org/w/api.php?" + new URLSearchParams({
    action: "query",
    titles: title,
    redirects: "1",
    format: "json",
  });
  const resolved = await fetch(resolveUrl, { headers: { "User-Agent": WIKI_UA } });
  if (!resolved.ok) return title.replace(/ /g, "_");
  const pageData = await resolved.json();
  const pages = Object.values((pageData.query && pageData.query.pages) || {});
  const page = pages[0];
  if (!page || page.missing !== undefined) return "";
  return String(page.title || title).replace(/ /g, "_");
}

async function addConcept(job) {
  const label = clip(job.label || job.name, 80);
  if (!label) throw new Error("A concept name is required.");
  const category = String(job.category || job.cat || "framework").trim().toLowerCase();
  if (!CATEGORIES.includes(category)) {
    throw new Error("Unknown category. Use one of: " + CATEGORIES.join(", "));
  }
  const id = slugify(job.id || label);
  if (!id) throw new Error("Could not make an id from that name.");
  const definition = clip(job.definition || job.desc, 1200);
  if (!definition) throw new Error("A short definition is required.");

  let src = fs.readFileSync(NETWORK, "utf8");
  const ids = listNodeIds(src);
  if (ids.has(id)) throw new Error("That concept id already exists: " + id);

  const { related, missing } = parseRelated(job.related, ids);
  let wiki = clip(job.wikipedia || job.wiki, 120).replace(/^https?:\/\/en\.wikipedia\.org\/wiki\//, "");
  let wikiSource = wiki ? "form" : "";
  if (!wiki) {
    wiki = await lookupWikipedia(label);
    if (wiki) wikiSource = "wikipedia";
  }
  const urlLine = wiki
    ? `\n    url: "https://en.wikipedia.org/wiki/${jsString(wiki)}", linkLabel: "Wikipedia ↗" },`
    : " },";
  const node = `  { id: "${id}", label: "${jsString(wrapLabel(label))}", cat: "${category}", weight: 1.4,
    desc: "${jsString(definition)}",${urlLine}`;

  src = insertBefore(src, "\n];\n\nconst WIKIPEDIA", "\n" + node);
  if (wiki) {
    src = insertBefore(
      src,
      "\n};\n\nfunction attachWikipediaLinks",
      `\n  "${id}": "${jsString(wiki)}",`
    );
  }
  if (related.length) {
    const edges = related.map((other) => `  ["${id}", "${other}", 0.88],`);
    src = insertBefore(src, "\n];\n\nconst RELATION_TYPE_ORDER", "\n" + edges.join("\n"));
  }
  fs.writeFileSync(NETWORK, src);
  run("node", ["build-ontology.js"], { label: "build-ontology.js" });

  const result = {
    id,
    label,
    category,
    related,
    missing,
    wikipedia: wiki || undefined,
    wikipediaSource: wikiSource || "none",
    url: `ontology.html#${id}`,
    network: `network.html#${id}`,
  };
  return result;
}

function nextEssayNumber() {
  const nums = fs.readdirSync(ROOT)
    .map((f) => {
      const m = f.match(/^essay-(\d+)\.(md|html)$/);
      return m ? Number(m[1]) : 0;
    })
    .filter(Boolean);
  return Math.max(4, ...nums) + 1;
}

function essayConceptIds(markdown) {
  const ids = [];
  const re = /\(concept:([a-z0-9_]+)\)/gi;
  let match;
  while ((match = re.exec(markdown))) {
    if (!ids.includes(match[1])) ids.push(match[1]);
  }
  return ids.slice(0, 6);
}

function stripEssayLeadIn(markdown) {
  let body = String(markdown || "").replace(/\r\n/g, "\n").trim();
  const drafts = body.split(/\n\/{6,}\s*\n/);
  if (drafts.length > 1) {
    const last = drafts[drafts.length - 1].trim();
    if (last.length > 200) body = last;
  }
  const lines = body.split("\n");
  let i = 0;
  const skipBlank = () => {
    while (i < lines.length && !lines[i].trim()) i++;
  };
  skipBlank();
  if (lines[i] && /^#\s+/.test(lines[i])) i++;
  skipBlank();
  if (lines[i] && /^by\s+/i.test(lines[i].trim()) && lines[i].trim().length < 90) i++;
  skipBlank();
  if (lines[i] && /\b20\d{2}\b/.test(lines[i]) && lines[i].trim().length < 48) i++;
  skipBlank();
  return lines.slice(i).join("\n").trim();
}

function essayImagePrompt(title, author, markdown) {
  const related = essayConceptIds(markdown).join(", ");
  const excerpt = clip(markdown.replace(/[#>*`\[\]():]/g, " "), 420);
  return [
    "Abstract information visualization of one Hybrid Intelligences essay.",
    "Knowledge map: nodes, thin edges, clusters, small labels. Black, white, grey, optional gold accent.",
    "Not a poster, photograph, classroom, portrait, or UI screenshot.",
    "Focal labeled node: " + title,
    author ? "Author: " + author : "",
    excerpt ? "Meaning: " + excerpt : "",
    related ? "Neighbor nodes: " + related : "",
  ].filter(Boolean).join("\n");
}

async function generateEssayThumbnail(title, author, markdown, outPath) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      "OpenAI-Safety-Identifier": "hybrid-intelligences-viz",
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt: essayImagePrompt(title, author, markdown),
      size: "1024x1024",
      quality: "low",
      output_format: "jpeg",
      output_compression: 80,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error((data && data.error && (data.error.message || data.error)) || "OpenAI did not return an image.");
  }
  const item = data.data && data.data[0];
  const b64 = item && item.b64_json;
  if (b64) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
    return;
  }
  if (item && item.url) {
    const img = await fetch(item.url);
    if (!img.ok) throw new Error("Image download failed.");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(await img.arrayBuffer()));
    return;
  }
  throw new Error("Image response was empty.");
}

async function addEssay(job) {
  const title = clip(job.title, 160);
  const markdown = String(job.markdown || job.body || "").trim();
  if (!title) throw new Error("An essay title is required.");
  if (markdown.length < 40) throw new Error("Paste the essay markdown (at least a short paragraph).");
  const n = Number(job.number) || nextEssayNumber();
  const author = clip(job.author, 120) || "Marlon Barrios Solano";
  const date = clip(job.date, 60) || new Date().toISOString().slice(0, 10);
  const mdFile = `essay-${n}.md`;
  const htmlFile = `essay-${n}.html`;
  const nodeId = `essay_${n}`;
  const posterRel = `screenshots/essay-${n}.jpg`;
  const posterAbs = path.join(ROOT, posterRel);
  let body = stripEssayLeadIn(markdown);
  let linked = [];
  let linkNote = "";
  try {
    const linkedResult = await linkEssayMarkdown(body);
    body = linkedResult.markdown;
    linked = linkedResult.linked || [];
    console.log("Essay concept links (" + (linkedResult.method || "lexical") + "): " + (linked.map((row) => row.id).join(", ") || "none"));
  } catch (err) {
    linkNote = "Concept linking skipped: " + (err.message || err);
    console.log(linkNote);
  }
  let imageNote = "";
  try {
    console.log("Generating essay thumbnail with gpt-image-2…");
    await generateEssayThumbnail(title, author, body, posterAbs);
    console.log("Wrote " + posterRel);
  } catch (err) {
    imageNote = "Thumbnail skipped: " + (err.message || err);
    console.log(imageNote);
  }
  const hasThumb = fs.existsSync(posterAbs) && fs.statSync(posterAbs).size > 2000;
  const figure = hasThumb
    ? [
        "::: figure",
        `![Essay ${n}: ${title}](${posterRel})`,
        "",
        `Essay ${n} as practice · generated still from the Hybrid Intelligences image maker`,
        ":::",
        "",
      ].join("\n")
    : "";

  const front = [
    "---",
    `pageTitle: ${title}`,
    `eyebrow: Essay ${n}`,
    `title: ${title}`,
    `author: ${author}`,
    `date: ${date}`,
    `footer: Hybrid Intelligences · University of Florida · Essay ${n}`,
    `output: ${htmlFile}`,
    `pdf: essay-${n}.pdf`,
    "otherEssay: essays.html",
    "otherEssayLabel: All essays",
    "---",
    "",
    figure + body,
    "",
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, mdFile), front);

  const template = fs.readFileSync(path.join(ROOT, "essay-3.html"), "utf8");
  fs.writeFileSync(path.join(ROOT, htmlFile), template);

  let src = fs.readFileSync(NETWORK, "utf8");
  const ids = listNodeIds(src);
  if (!ids.has(nodeId)) {
    const desc = clip(`${title} — Essay ${n} by ${author} (${date}). Added through Studio.`, 900);
    const node = `  { id: "${nodeId}", label: "Essay ${n}", cat: "practice", weight: 1.5,
    desc: "${jsString(desc)}",
    url: "${htmlFile}", linkLabel: "Read Essay ${n} →" },`;
    src = insertBefore(src, "\n];\n\nconst WIKIPEDIA", "\n" + node);
    const edges = [];
    if (ids.has("hi_essays")) edges.push(`  ["${nodeId}", "hi_essays", 0.95],`);
    if (ids.has("marlon")) edges.push(`  ["${nodeId}", "marlon", 0.9],`);
    if (ids.has("hi_hub")) edges.push(`  ["${nodeId}", "hi_hub", 0.85],`);
    for (const id of linked.slice(0, 12).map((row) => row.id)) {
      if (ids.has(id) && id !== nodeId) edges.push(`  ["${nodeId}", "${id}", 0.84],`);
    }
    if (edges.length) src = insertBefore(src, "\n];\n\nconst RELATION_TYPE_ORDER", "\n" + edges.join("\n"));
    fs.writeFileSync(NETWORK, src);
  } else {
    attachEssayConceptEdges(nodeId, linked.map((row) => row.id));
  }

  const shot = hasThumb
    ? `<img src="${posterRel}" width="1024" height="1024" alt="${title.replace(/"/g, "&quot;")}">`
    : `<span class="placeholder">Essay ${n}</span>`;
  const hub = fs.readFileSync(path.join(ROOT, "essays.html"), "utf8");
  if (!hub.includes(`href="${htmlFile}"`)) {
    const card = `
      <a class="card" href="${htmlFile}">
        <span class="shot">
          ${shot}
        </span>
        <span class="copy">
          <span class="kicker">Essay ${n}</span>
          <h2>${title.replace(/</g, "&lt;")}</h2>
          <p>${author.replace(/</g, "&lt;")} · ${date.replace(/</g, "&lt;")}</p>
        </span>
      </a>
`;
    const next = hub.includes("<!-- studio-essays -->")
      ? hub.replace("<!-- studio-essays -->", card + "      <!-- studio-essays -->")
      : hub.replace("    </section>\n\n    <p class=\"note\">", card + "    </section>\n\n    <p class=\"note\">");
    fs.writeFileSync(path.join(ROOT, "essays.html"), next);
  }

  run("node", ["build-essays.js"], { label: "build-essays.js" });
  run("node", ["build-ontology.js"], { label: "build-ontology.js" });
  return {
    number: n,
    title,
    html: htmlFile,
    id: nodeId,
    thumbnail: hasThumb ? posterRel : undefined,
    imageNote: imageNote || undefined,
    concepts: linked.map((row) => row.id),
    linkNote: linkNote || undefined,
  };
}

function applyProposal(videoId, videoNodeId) {
  const proposalPath = path.join(ROOT, "ingest", `${videoId}.proposal.json`);
  if (!fs.existsSync(proposalPath)) return [];
  const proposal = JSON.parse(fs.readFileSync(proposalPath, "utf8"));
  let src = fs.readFileSync(NETWORK, "utf8");
  const ids = listNodeIds(src);
  const applied = [];
  const lines = [];
  for (const row of proposal.suggestedEdges || []) {
    const target = row[1];
    const weight = typeof row[2] === "number" ? row[2] : 0.8;
    if (!ids.has(target)) continue;
    if (weight < 0.72) continue;
    lines.push(`  ["${videoNodeId}", "${target}", ${Math.min(0.95, weight).toFixed(2)}],`);
    applied.push(target);
  }
  if (ids.has("hi_videos")) {
    lines.push(`  ["hi_videos", "${videoNodeId}", 0.96],`);
  }
  if (lines.length) {
    src = insertBefore(src, "\n];\n\nconst RELATION_TYPE_ORDER", "\n" + lines.join("\n"));
    fs.writeFileSync(NETWORK, src);
  }
  return applied;
}

function resolveAuthorId(speaker, src) {
  const name = String(speaker || "").replace(/\s+/g, " ").trim();
  if (!name) return "";
  const last = name.split(" ").pop().toLowerCase();
  const re = /\{\s*id:\s*"([^"]+)"[^}]*label:\s*"((?:[^"\\]|\\.)*)"[^}]*cat:\s*"author"/g;
  let match;
  const hits = [];
  while ((match = re.exec(src))) {
    const label = match[2].replace(/\\n/g, " ").toLowerCase();
    if (label.includes(name.toLowerCase()) || label.split(" ").pop() === last) {
      hits.push(match[1]);
    }
  }
  return hits.length === 1 ? hits[0] : "";
}

async function addVideo(job) {
  const url = String(job.url || job.youtube || "").trim();
  const yt = youtubeVideoId(url);
  if (!yt) throw new Error("A YouTube URL is required.");
  const title = clip(job.title, 180);
  if (!title) throw new Error("A video title is required.");
  const speaker = clip(job.speaker, 80) || "Unknown";
  const date = clip(job.date, 20) || new Date().toISOString().slice(0, 10);
  const caption = clip(job.caption, 400);
  const credit = clip(job.credit, 120) || "YouTube";
  const id = slugify((job.id || `${speaker}-${title}`).replace(/_/g, "-")).replace(/_/g, "-")
    || `talk-${yt.slice(0, 8)}`;

  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  if (manifest.videos.some((v) => v.id === id)) throw new Error("That video id already exists: " + id);
  if (manifest.videos.some((v) => youtubeVideoId(v.youtube) === yt)) {
    throw new Error("That YouTube URL is already in the Hub.");
  }

  const posterRel = `screenshots/${id}.jpg`;
  await downloadPoster(yt, path.join(ROOT, posterRel));

  const entry = {
    id,
    title,
    youtube: `https://www.youtube.com/watch?v=${yt}`,
    poster: fs.existsSync(path.join(ROOT, posterRel)) ? posterRel : undefined,
    date,
    speaker,
    caption: caption || title,
    credit,
    transcript: `transcripts/${id}.json`,
  };
  manifest.videos.unshift(entry);
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

  const videoNodeId = `video_${id.replace(/-/g, "_")}`;
  let src = fs.readFileSync(NETWORK, "utf8");
  const ids = listNodeIds(src);
  if (!ids.has(videoNodeId)) {
    const short = wrapLabel(speaker.split(" ").slice(-1)[0] + " · Talk");
    const desc = clip(
      `${title} — ${speaker}. ${caption || "Talk ingested against the Hybrid Intelligences ontology."}`,
      520
    );
    const node = `  { id: "${videoNodeId}", label: "${jsString(short)}", fullLabel: "${jsString(title)}", cat: "video",   weight: 1.4,
    desc: "${jsString(desc)}",
    url: "video-${id}.html", linkLabel: "Open video page →",
    watchUrl: "https://www.youtube.com/watch?v=${yt}", watchLabel: "Watch on YouTube ↗"${entry.poster ? `,\n    poster: "${entry.poster}"` : ""} },`;
    src = insertBefore(src, "\n];\n\nconst WIKIPEDIA", "\n" + node);
    const authorId = resolveAuthorId(speaker, src);
    const edges = [];
    if (ids.has("hi_videos")) edges.push(`  ["hi_videos", "${videoNodeId}", 0.96],`);
    if (authorId) edges.push(`  ["${videoNodeId}", "${authorId}", 0.98],`);
    if (edges.length) src = insertBefore(src, "\n];\n\nconst RELATION_TYPE_ORDER", "\n" + edges.join("\n"));
    if (authorId) {
      src = insertBefore(src, "\n];\n\nlet nodes", `\n  ["${videoNodeId}", "${authorId}", "instantiates"],`);
    }
    fs.writeFileSync(NETWORK, src);
  }

  let ingestNote = "";
  try {
    run("node", ["ingest-video.js", "--id", id], { label: "ingest-video.js", timeout: 9 * 60 * 1000 });
  } catch (err) {
    ingestNote = err.message || String(err);
  }

  const matched = applyProposal(id, videoNodeId);
  const review = {
    videoId: id,
    networkNodeId: videoNodeId,
    matched,
    ingestNote: ingestNote || undefined,
    generatedAt: new Date().toISOString(),
    note: "Matched existing ontology concepts. New names from the talk are listed only if ingest proposed them; they are not auto-created.",
  };
  fs.mkdirSync(path.join(ROOT, "ingest"), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, "ingest", `${id}.review.json`),
    JSON.stringify(review, null, 2) + "\n"
  );

  run("node", ["build-videos.js"], { label: "build-videos.js" });
  run("node", ["build-ontology.js"], { label: "build-ontology.js" });
  return {
    id,
    title,
    speaker,
    youtube: entry.youtube,
    page: `video-${id}.html`,
    matched,
    ingestNote: ingestNote || undefined,
  };
}

async function publish(job) {
  const action = String(job.action || "").trim().toLowerCase();
  if (action === "concept") return { action, result: await addConcept(job.concept || job) };
  if (action === "video") return { action, result: await addVideo(job.video || job) };
  if (action === "essay") return { action, result: await addEssay(job.essay || job) };
  throw new Error("Unknown action. Use concept, video, or essay.");
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const jobFlag = args.indexOf("--job");
  if (jobFlag < 0 || !args[jobFlag + 1]) {
    console.error("Usage: node scripts/studio-publish.js --job ingest/jobs/file.json");
    process.exit(1);
  }
  const { abs, job } = readJob(args[jobFlag + 1]);
  const summary = await publish(job);
  try {
    if (abs.includes(`${path.sep}ingest${path.sep}jobs${path.sep}`)) fs.unlinkSync(abs);
  } catch (_) {}
  const message =
    summary.action === "concept"
      ? `Add ${summary.result.label} to the ontology from Studio.`
      : summary.action === "video"
        ? `Ingest ${summary.result.title} from Studio.`
        : `Add ${summary.result.title} from Studio.`;
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, "commit_message<<EOF\n" + message + "\nEOF\n");
  }
  console.log(JSON.stringify({ ok: true, message, ...summary }, null, 2));
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
