#!/usr/bin/env node
/**
 * Ingest a video into the ontology pipeline.
 *
 *   node ingest-video.js --id hayles-bacteria-ai --build
 *   node ingest-video.js --id hayles-bacteria-ai --match-only --build
 *   node ingest-video.js --add path/to/talk.mp4 --title "My Talk" --speaker "Name"
 *
 * YouTube: fetches captions automatically.
 * Local file: Whisper transcription (requires ffmpeg for video).
 * Transcript text is stored in transcripts/{id}.json (not shown on the site).
 * Matched concepts appear on video pages; edge proposals go to ingest/{id}.proposal.json.
 *
 * Requires OPENAI_API_KEY for concept matching; Whisper for local media without captions.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { loadOntology } = require("./api/ontology-context");

const ROOT = __dirname;
const MANIFEST = path.join(ROOT, "videos.json");
const TRANSCRIPTS_DIR = path.join(ROOT, "transcripts");
const INGEST_DIR = path.join(ROOT, "ingest");
const TMP_DIR = path.join(ROOT, ".ingest-tmp");

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

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "video";
}

function networkNodeId(videoId) {
  return `video_${videoId.replace(/-/g, "_")}`;
}

function parseArgs(argv) {
  const opts = { build: false, matchOnly: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") opts.id = argv[++i];
    else if (a === "--add") opts.add = argv[++i];
    else if (a === "--title") opts.title = argv[++i];
    else if (a === "--speaker") opts.speaker = argv[++i];
    else if (a === "--date") opts.date = argv[++i];
    else if (a === "--caption") opts.caption = argv[++i];
    else if (a === "--build") opts.build = true;
    else if (a === "--match-only") opts.matchOnly = true;
    else if (a === "--help" || a === "-h") opts.help = true;
  }
  return opts;
}

function usage() {
  console.log(`Usage:
  node ingest-video.js --id VIDEO_ID [--match-only] [--build]
  node ingest-video.js --add PATH --title "Title" [--speaker "Name"] [--date YYYY-MM-DD] [--build]

Examples:
  node ingest-video.js --id hayles-bacteria-ai --build
  node ingest-video.js --id hayles-integrated-cognition --match-only --build
`);
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
}

function saveManifest(data) {
  fs.writeFileSync(MANIFEST, JSON.stringify(data, null, 2) + "\n");
}

function findVideo(id) {
  const { videos } = loadManifest();
  const video = videos.find((v) => v.id === id);
  if (!video) throw new Error(`Video id not found in videos.json: ${id}`);
  return video;
}

function ensureDirs() {
  for (const dir of [TRANSCRIPTS_DIR, INGEST_DIR, TMP_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function transcriptPath(video) {
  const rel = video.transcript || `transcripts/${video.id}.json`;
  return path.join(ROOT, rel);
}

function loadExistingTranscript(video) {
  const file = transcriptPath(video);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function youtubeVideoId(url) {
  const match = String(url || "").match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

function decodeHtmlEntities(text) {
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ");
}

function parseCaptionXml(xml) {
  const segments = [];
  const re = /<text start="([^"]+)" dur="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    const text = decodeHtmlEntities(match[3].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    if (!text) continue;
    segments.push({
      start: parseFloat(match[1]),
      end: parseFloat(match[1]) + parseFloat(match[2]),
      text,
    });
  }
  const text = segments.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();
  return { text, segments };
}

async function fetchYoutubeCaptions(youtubeUrl) {
  const videoId = youtubeVideoId(youtubeUrl);
  if (!videoId) throw new Error(`Invalid YouTube URL: ${youtubeUrl}`);

  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!pageRes.ok) throw new Error(`YouTube page fetch failed (${pageRes.status})`);
  const html = await pageRes.text();

  let tracks = null;
  const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
  if (playerMatch) {
    try {
      const player = JSON.parse(playerMatch[1]);
      tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    } catch (_) {}
  }
  if (!tracks) {
    const trackMatch = html.match(/"captionTracks":(\[[\s\S]*?\]),"audioTracks"/);
    if (trackMatch) {
      try {
        tracks = JSON.parse(trackMatch[1].replace(/\\u0026/g, "&"));
      } catch (_) {}
    }
  }
  if (!tracks || !tracks.length) {
    throw new Error("No captions found on YouTube for this video.");
  }

  const track =
    tracks.find((t) => t.languageCode === "en" && t.kind !== "asr") ||
    tracks.find((t) => t.languageCode?.startsWith("en")) ||
    tracks[0];
  const captionUrl = track.baseUrl || track.url;
  if (!captionUrl) throw new Error("Caption track URL missing.");

  const capRes = await fetch(captionUrl);
  if (!capRes.ok) throw new Error(`Caption download failed (${capRes.status})`);
  const xml = await capRes.text();
  const parsed = parseCaptionXml(xml);
  if (!parsed.text) throw new Error("Caption track was empty.");
  return { ...parsed, source: "youtube", videoId, language: track.languageCode || "en" };
}

function extractAudio(videoPath, outPath) {
  const ff = spawnSync("ffmpeg", [
    "-y", "-i", videoPath,
    "-vn", "-acodec", "libmp3lame", "-q:a", "4",
    outPath,
  ], { encoding: "utf8" });
  if (ff.status !== 0) {
    throw new Error(`ffmpeg failed: ${ff.stderr || ff.stdout || "unknown error"}`);
  }
  if (!fs.existsSync(outPath)) throw new Error("Audio extraction produced no file.");
}

function resolveMediaPath(video) {
  if (!video.src) throw new Error(`Video "${video.id}" has no local src file.`);
  const src = path.join(ROOT, video.src);
  if (!fs.existsSync(src)) throw new Error(`Video file not found: ${video.src}`);
  const ext = path.extname(src).toLowerCase();
  if ([".mp3", ".m4a", ".wav", ".webm", ".mp4"].includes(ext)) {
    return { media: src, isVideo: ext === ".mp4" || ext === ".webm" };
  }
  throw new Error(`Unsupported media type: ${ext}`);
}

async function transcribe(filePath) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set. Add it to .env or the environment.");

  const boundary = "----HybridIntelligences" + Date.now();
  const fileBuf = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const preamble = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="model"',
    "",
    "whisper-1",
    `--${boundary}`,
    'Content-Disposition: form-data; name="response_format"',
    "",
    "verbose_json",
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"`,
    "Content-Type: application/octet-stream",
    "",
  ].join("\r\n");
  const body = Buffer.concat([
    Buffer.from(preamble + "\r\n"),
    fileBuf,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper API error (${res.status}): ${err}`);
  }

  return res.json();
}

function buildConceptCatalog() {
  const data = loadOntology();
  const graph = data["@graph"] || [];
  const concepts = [];
  for (const item of graph) {
    const types = [].concat(item["@type"] || []);
    if (!types.includes("skos:Concept") || types.includes("hi:Category")) continue;
    const id = (item["@id"] || "").split("#")[1];
    if (!id) continue;
    const label = item["skos:prefLabel"] || id;
    const def = (item["skos:definition"] || "").slice(0, 160);
    concepts.push({ id, label, def });
  }
  return concepts;
}

async function matchConcepts(transcriptText, concepts) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set. Add it to .env for concept matching.");

  const catalog = concepts.map((c) => `${c.id}\t${c.label}\t${c.def}`).join("\n");
  const chunks = [];
  const chunkSize = 12000;
  for (let i = 0; i < transcriptText.length; i += chunkSize) {
    chunks.push(transcriptText.slice(i, i + chunkSize));
  }

  const allMatches = new Map();
  for (const chunk of chunks.slice(0, 3)) {
    const system = `You match speech transcripts to an existing ontology. Return ONLY valid JSON.
Rules:
- Only use conceptId values from the catalog (exact id strings).
- Include a concept only if the transcript clearly discusses it (explicit mention or clear paraphrase).
- Provide a short direct quote from the transcript for each match when possible.
- score is 0.0 to 1.0 confidence.
- Do not invent new concepts. matched array only.`;

    const user = `ONTOLOGY CATALOG (id\\tlabel\\tdefinition):
${catalog}

TRANSCRIPT:
${chunk}

Return JSON: {"matched":[{"conceptId":"...","label":"...","score":0.9,"quotes":["..."]}]}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Concept matching failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { matched: [] };
    }

    const validIds = new Set(concepts.map((c) => c.id));
    for (const m of parsed.matched || []) {
      if (!m.conceptId || !validIds.has(m.conceptId)) continue;
      const c = concepts.find((x) => x.id === m.conceptId);
      const score = typeof m.score === "number" ? m.score : 0.7;
      const existing = allMatches.get(m.conceptId);
      if (!existing || score > existing.score) {
        allMatches.set(m.conceptId, {
          conceptId: m.conceptId,
          label: c?.label || m.label || m.conceptId,
          score,
          quotes: Array.isArray(m.quotes) ? m.quotes.slice(0, 3) : [],
        });
      }
    }
  }

  return [...allMatches.values()].sort((a, b) => b.score - a.score);
}

function writeProposal(videoId, matched) {
  const nodeId = networkNodeId(videoId);
  const proposal = {
    videoId,
    networkNodeId: nodeId,
    generatedAt: new Date().toISOString(),
    note: "Suggested edges to add in hybrid-network.js after review.",
    suggestedEdges: matched.map((m) => [nodeId, m.conceptId, Math.min(0.95, m.score)]),
  };
  fs.writeFileSync(
    path.join(INGEST_DIR, `${videoId}.proposal.json`),
    JSON.stringify(proposal, null, 2) + "\n"
  );
  console.log(`Wrote ingest/${videoId}.proposal.json (${matched.length} suggested edges)`);
}

async function resolveSpeech(video, matchOnly) {
  if (matchOnly) {
    const existing = loadExistingTranscript(video);
    if (!existing?.text) {
      throw new Error(`No stored transcript for ${video.id}. Run without --match-only first.`);
    }
    console.log(`Using stored transcript (${existing.text.length} characters)`);
    return existing;
  }

  if (video.youtube) {
    console.log("Fetching YouTube captions…");
    return fetchYoutubeCaptions(video.youtube);
  }

  const { media, isVideo } = resolveMediaPath(video);
  let audioPath = media;
  if (isVideo) {
    ensureDirs();
    audioPath = path.join(TMP_DIR, `${video.id}.mp3`);
    console.log("Extracting audio with ffmpeg…");
    extractAudio(media, audioPath);
  }

  console.log("Transcribing with Whisper…");
  const whisper = await transcribe(audioPath);
  return {
    text: whisper.text || "",
    segments: (whisper.segments || []).map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text,
    })),
    source: "whisper",
  };
}

async function ingestOne(video, opts) {
  ensureDirs();
  const speech = await resolveSpeech(video, opts.matchOnly);
  const text = speech.text || "";

  console.log(`Transcript length: ${text.length} characters`);
  console.log("Matching ontology concepts…");
  const concepts = buildConceptCatalog();
  const matched = text.trim() ? await matchConcepts(text, concepts) : [];
  console.log(`Matched ${matched.length} concepts`);

  const transcript = {
    videoId: video.id,
    text,
    segments: speech.segments || [],
    matched,
    ingestedAt: new Date().toISOString(),
    source: speech.source || (video.youtube ? "youtube" : "whisper"),
    model: speech.source === "whisper" ? "whisper-1" : undefined,
    matchModel: "gpt-4o-mini",
  };

  const outPath = transcriptPath(video);
  if (!video.transcript) {
    video.transcript = `transcripts/${video.id}.json`;
    const manifest = loadManifest();
    const entry = manifest.videos.find((v) => v.id === video.id);
    if (entry) {
      entry.transcript = video.transcript;
      saveManifest(manifest);
    }
  }
  fs.writeFileSync(outPath, JSON.stringify(transcript, null, 2) + "\n");
  console.log(`Wrote ${path.relative(ROOT, outPath)} (text stored internally, not published)`);

  writeProposal(video.id, matched);

  if (fs.existsSync(TMP_DIR)) {
    for (const f of fs.readdirSync(TMP_DIR)) {
      try { fs.unlinkSync(path.join(TMP_DIR, f)); } catch (_) {}
    }
  }
}

function addVideo(opts) {
  if (!opts.add || !opts.title) {
    throw new Error("--add and --title are required for new videos.");
  }
  const srcPath = path.resolve(opts.add);
  if (!fs.existsSync(srcPath)) throw new Error(`File not found: ${srcPath}`);

  const id = slugify(opts.title) + (opts.date ? `-${opts.date.slice(0, 4)}` : "");
  const destName = path.basename(srcPath);
  const destRel = destName;
  const destAbs = path.join(ROOT, destRel);

  if (path.resolve(destAbs) !== srcPath) {
    fs.copyFileSync(srcPath, destAbs);
    console.log(`Copied to ${destRel}`);
  }

  const entry = {
    id,
    title: opts.title,
    src: destRel,
    date: opts.date || new Date().toISOString().slice(0, 10),
    speaker: opts.speaker || "Marlon Barrios Solano",
    caption: opts.caption || "",
    transcript: `transcripts/${id}.json`,
  };

  const manifest = loadManifest();
  if (manifest.videos.some((v) => v.id === id)) {
    throw new Error(`Video id already exists: ${id}`);
  }
  manifest.videos.unshift(entry);
  saveManifest(manifest);
  console.log(`Added ${id} to videos.json`);
  return entry;
}

async function main() {
  loadEnv();
  const opts = parseArgs(process.argv);
  if (opts.help || (!opts.id && !opts.add)) {
    usage();
    process.exit(opts.help ? 0 : 1);
  }

  let video;
  if (opts.add) {
    video = addVideo(opts);
  } else {
    video = findVideo(opts.id);
  }

  await ingestOne(video, opts);

  if (opts.build) {
    const r = spawnSync("node", ["build-videos.js"], { cwd: ROOT, stdio: "inherit" });
    if (r.status !== 0) process.exit(r.status || 1);
  } else {
    console.log("Run node build-videos.js to refresh the site.");
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
