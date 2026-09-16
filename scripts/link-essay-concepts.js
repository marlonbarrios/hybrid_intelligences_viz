#!/usr/bin/env node
/**
 * After an essay is pasted, match it against the Hybrid Intelligences ontology
 * and insert first-occurrence [label](concept:id) links.
 *
 *   node scripts/link-essay-concepts.js essay-5.md
 *   node scripts/link-essay-concepts.js --all
 *
 * Studio calls linkEssayMarkdown() on ingest. Uses the same ontology catalog as
 * video matching. If OPENAI_API_KEY is set, an LLM pass keeps only concepts the
 * essay actually discusses; otherwise a conservative lexical pass runs.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const NETWORK = path.join(ROOT, "hybrid-network.js");

const SKIP_CATS = new Set(["video", "participant", "facilitator", "background", "program"]);
const SKIP_IDS = new Set(["hi_essays", "hi_videos", "hi_hub"]);
const GENERIC = new Set([
  "art", "body", "code", "time", "space", "object", "event", "form", "work", "world",
  "practice", "system", "systems", "knowledge", "research", "performance", "digital",
  "mind", "nature", "culture", "human", "machine", "language", "movement", "audience",
  "artist", "idea", "meaning", "truth", "power", "process", "data", "field", "site",
  "turn", "score", "rule", "agency", "identity", "memory", "image", "text", "model",
  "models", "network", "tool", "tools", "objecthood",
]);
const REQUIRE_MULTIWORD = new Set([
  "ontology", "intelligence", "embedded", "art", "body", "knowledge",
  "practice", "performance", "research", "digital",
]);
const CAT_RANK = {
  premise: 0, framework: 1, author: 2, practice: 3, tension: 4,
  quality: 5, phenomenon: 6, domain: 7, organization: 8,
};
const EXTRA_ALIASES = {
  assemblage: ["cognitive assemblage", "cognitive assemblages"],
  hybrid: ["Hybrid Intelligences", "hybrid intelligences"],
  coupling: ["coupling"],
  ai: ["artificial intelligence", "AI"],
  gen_ai: ["generative AI", "generative model", "generative models"],
  posthumanism: ["posthuman", "posthumanism", "post-human", "posthumanist", "post-humanist"],
  embodiment: ["embodiment", "embodied"],
  choreography: ["choreography", "choreographic"],
  dance: ["dance"],
  cognition: ["cognition"],
  cybernetics: ["cybernetics"],
  machine_learning: ["machine learning"],
  hayles: ["Hayles", "N. Katherine Hayles"],
  varela: ["Varela", "Francisco Varela"],
  maturana: ["Maturana"],
  umwelt: ["Umwelt", "Umwelten"],
  autopoiesis: ["autopoiesis", "autopoietic"],
  enactivism: ["enactivism", "enactive"],
  somatics: ["somatics", "somatic"],
  conceptual_complexity: [],
};

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

function cleanLabel(label) {
  return String(label || "")
    .replace(/\\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadNetworkConcepts() {
  const src = fs.readFileSync(NETWORK, "utf8");
  const nodes = [];
  const re = /\{\s*id:\s*"([^"]+)",\s*label:\s*"((?:[^"\\]|\\.)*)",\s*cat:\s*"([^"]+)"/g;
  let match;
  while ((match = re.exec(src))) {
    const id = match[1];
    const cat = match[3];
    if (SKIP_IDS.has(id) || SKIP_CATS.has(cat)) continue;
    if (id.startsWith("video_") || id.startsWith("essay_")) continue;
    nodes.push({
      id,
      label: cleanLabel(match[2].replace(/\\"/g, '"')),
      cat,
    });
  }
  return nodes;
}

function phraseList(concept) {
  const phrases = new Set();
  const label = concept.label;
  if (label) phrases.add(label);
  const compact = label.replace(/-\s+/g, "-").replace(/\s+/g, " ");
  if (compact) phrases.add(compact);
  const noHyphenSpace = label.replace(/\s*-\s*/g, "-");
  if (noHyphenSpace) phrases.add(noHyphenSpace);
  for (const extra of EXTRA_ALIASES[concept.id] || []) phrases.add(extra);
  if (/\bassemblages\b/i.test(label)) phrases.add(label.replace(/assemblages/i, "assemblage"));
  return [...phrases]
    .map((p) => p.trim())
    .filter((p) => p.length >= 2);
}

function isGenericPhrase(phrase) {
  const key = phrase.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  if (["ai", "llm"].includes(key)) return false;
  if (GENERIC.has(key)) return true;
  if (key.length < 3) return true;
  if (key.length < 5 && !key.includes(" ")) return true;
  return false;
}

function preferredId(existingId, nextId, conceptsById) {
  const a = conceptsById.get(existingId);
  const b = conceptsById.get(nextId);
  const ra = CAT_RANK[a && a.cat] ?? 20;
  const rb = CAT_RANK[b && b.cat] ?? 20;
  return rb < ra ? nextId : existingId;
}

function lexicalCandidates(markdown, concepts) {
  const conceptsById = new Map(concepts.map((c) => [c.id, c]));
  const byPhrase = new Map();
  for (const concept of concepts) {
    for (const phrase of phraseList(concept)) {
      if (REQUIRE_MULTIWORD.has(concept.id) && phrase.split(/\s+/).length < 2) continue;
      if (isGenericPhrase(phrase) && phrase.split(/\s+/).length < 2) continue;
      const key = phrase.toLowerCase();
      const prev = byPhrase.get(key);
      if (!prev) byPhrase.set(key, { id: concept.id, phrase });
      else byPhrase.set(key, { id: preferredId(prev.id, concept.id, conceptsById), phrase: prev.phrase.length >= phrase.length ? prev.phrase : phrase });
    }
  }
  const items = [...byPhrase.values()]
    .sort((a, b) => b.phrase.length - a.phrase.length || a.id.localeCompare(b.id));
  const found = [];
  const seen = new Set();
  const haystack = markdown;
  for (const item of items) {
    if (seen.has(item.id)) continue;
    const escaped = item.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, "iu");
    if (!re.test(haystack)) continue;
    seen.add(item.id);
    found.push({ id: item.id, phrase: item.phrase, score: Math.min(0.95, 0.55 + item.phrase.length / 40) });
  }
  return found;
}

async function llmSelectConcepts(markdown, concepts, lexical) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const catalog = concepts
    .map((c) => `${c.id}\t${c.label}`)
    .join("\n");
  const excerpt = markdown.replace(/\s+/g, " ").trim().slice(0, 12000);
  const lexicalHint = lexical.map((c) => c.id).join(", ");
  const system = `You match an essay to an existing ontology. Return ONLY valid JSON.
Rules:
- Only use conceptId values from the catalog (exact id strings).
- Include a concept only if the essay discusses it as part of its argument (explicit mention or clear paraphrase).
- Do not match a word just because it appears in a different sense (e.g. "ontology of the artwork" is not the Hybrid Intelligences ontology node).
- Prefer specific concepts over generic ones.
- Do not invent new concepts.
- 8 to 18 matches is typical.`;
  const user = `ONTOLOGY CATALOG (id\\tlabel):
${catalog}

LEXICAL HINTS (may include false friends; keep only if truly relevant):
${lexicalHint || "(none)"}

ESSAY:
${excerpt}

Return JSON: {"matched":[{"conceptId":"...","score":0.9}]}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
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
    throw new Error("Essay concept matching failed (" + res.status + "): " + err.slice(0, 400));
  }
  const data = await res.json();
  let parsed;
  try {
    parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
  } catch (_) {
    parsed = { matched: [] };
  }
  const valid = new Set(concepts.map((c) => c.id));
  const out = [];
  for (const row of parsed.matched || []) {
    if (!row.conceptId || !valid.has(row.conceptId)) continue;
    const score = typeof row.score === "number" ? row.score : 0.75;
    if (score < 0.55) continue;
    out.push({ id: row.conceptId, score, phrase: (concepts.find((c) => c.id === row.conceptId) || {}).label });
  }
  return out;
}

function parkProtected(markdown) {
  const slots = [];
  const park = (block) => {
    const key = `\u0000S${slots.length}\u0000`;
    slots.push(block);
    return key;
  };
  const replaced = markdown.replace(
    /```[\s\S]*?```|^::: ?[\w-]+[\s\S]*?^:::|^\s*#{1,6} .+$|\[[^\]]+\]\([^)]+\)|<!--[\s\S]*?-->/gm,
    park,
  );
  return { text: replaced, slots };
}

function unpark(text, slots) {
  return text.replace(/\u0000S(\d+)\u0000/g, (_, n) => slots[Number(n)]);
}

function applyConceptLinks(markdown, selected, concepts) {
  const conceptsById = new Map(concepts.map((c) => [c.id, c]));
  const already = new Set();
  const existing = /\(concept:([a-z0-9_]+)\)/gi;
  let found;
  while ((found = existing.exec(markdown))) already.add(found[1]);

  const items = [];
  for (const row of selected) {
    const concept = conceptsById.get(row.id);
    if (!concept || already.has(row.id)) continue;
    for (const phrase of phraseList(concept)) {
      if (REQUIRE_MULTIWORD.has(row.id) && phrase.split(/\s+/).length < 2) continue;
      if (isGenericPhrase(phrase) && phrase.split(/\s+/).length < 2 && !EXTRA_ALIASES[row.id]) continue;
      items.push({ id: row.id, phrase, score: row.score || 0.7 });
    }
  }
  items.sort((a, b) => b.phrase.length - a.phrase.length || b.score - a.score);

  const parked = parkProtected(markdown);
  let text = parked.text;
  const slots = parked.slots;
  const linked = [];
  const used = new Set(already);

  for (const item of items) {
    if (used.has(item.id)) continue;
    const escaped = item.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, "iu");
    const match = re.exec(text);
    if (!match) continue;
    const wrapped = `[${match[0]}](concept:${item.id})`;
    const key = `\u0000S${slots.length}\u0000`;
    slots.push(wrapped);
    text = text.slice(0, match.index) + key + text.slice(match.index + match[0].length);
    used.add(item.id);
    linked.push({ id: item.id, phrase: match[0] });
    if (linked.length >= 18) break;
  }

  return { markdown: unpark(text, slots), linked };
}

async function linkEssayMarkdown(markdown) {
  const concepts = loadNetworkConcepts();
  const lexical = lexicalCandidates(markdown, concepts);
  let selected = lexical;
  let method = "lexical";
  try {
    const llm = await llmSelectConcepts(markdown, concepts, lexical);
    if (llm && llm.length) {
      const allowed = new Set(llm.map((row) => row.id));
      const filtered = lexical.filter((row) => allowed.has(row.id));
      const extra = llm.filter((row) => !filtered.some((item) => item.id === row.id));
      selected = filtered.concat(extra).sort((a, b) => (b.score || 0) - (a.score || 0));
      method = "ontology-review";
    }
  } catch (err) {
    console.log("Ontology review fell back to lexical matching: " + (err.message || err));
  }
  const result = applyConceptLinks(markdown, selected, concepts);
  result.method = method;
  result.candidates = selected.length;
  return result;
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
  if (idx < 0) throw new Error("Could not find insert point for essay concept edges.");
  return src.slice(0, idx) + block + src.slice(idx);
}

function attachEssayConceptEdges(essayId, conceptIds) {
  let src = fs.readFileSync(NETWORK, "utf8");
  const ids = listNodeIds(src);
  const lines = [];
  const applied = [];
  for (const id of [...new Set(conceptIds)].slice(0, 12)) {
    if (!ids.has(id) || id === essayId) continue;
    if (new RegExp(`\\["${essayId}",\\s*"${id}"`).test(src)) continue;
    lines.push(`  ["${essayId}", "${id}", 0.84],`);
    applied.push(id);
  }
  if (!lines.length) return applied;
  src = insertBefore(src, "\n];\n\nconst RELATION_TYPE_ORDER", "\n" + lines.join("\n"));
  fs.writeFileSync(NETWORK, src);
  return applied;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { meta: "", body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end < 0) return { meta: "", body: raw };
  return {
    meta: raw.slice(0, end + 5),
    body: raw.slice(end + 5),
  };
}

function essayNumberFromFile(file) {
  const m = path.basename(file).match(/^essay-(\d+)\.md$/);
  return m ? m[1] : "";
}

async function linkFile(file, opts = {}) {
  const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
  const raw = fs.readFileSync(abs, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const result = await linkEssayMarkdown(body);
  fs.writeFileSync(abs, meta + result.markdown.replace(/^\n/, "\n"));
  const n = essayNumberFromFile(abs);
  let edges = [];
  if (n) edges = attachEssayConceptEdges("essay_" + n, result.linked.map((row) => row.id));
  console.log(`${path.basename(abs)}: ${result.method} → ${result.linked.map((row) => row.id).join(", ") || "(no new links)"}`);
  if (opts.build) {
    const { spawnSync } = require("child_process");
    spawnSync("node", ["build-essays.js"], { cwd: ROOT, stdio: "inherit" });
    if (edges.length) spawnSync("node", ["build-ontology.js"], { cwd: ROOT, stdio: "inherit" });
  }
  return result;
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const build = args.includes("--build");
  const files = args.includes("--all")
    ? fs.readdirSync(ROOT).filter((f) => /^essay-\d+\.md$/.test(f) || f === "essay-1.md").sort()
    : args.filter((a) => !a.startsWith("--"));
  if (!files.length) {
    console.error("Usage: node scripts/link-essay-concepts.js essay-5.md [--build]");
    process.exit(1);
  }
  for (const file of files) {
    await linkFile(file, { build });
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}

module.exports = {
  linkEssayMarkdown,
  attachEssayConceptEdges,
  loadEnv,
};
