#!/usr/bin/env node
/**
 * One-shot patch: add video_* nodes and edges from videos.json to hybrid-network.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "videos.json"), "utf8")).videos;
const networkFile = path.join(ROOT, "hybrid-network.js");
let src = fs.readFileSync(networkFile, "utf8");

const EXISTING = new Set([
  "video_hayles_integrated_cognition",
  "video_hayles_bacteria_ai",
  "video_clark_experience_machine",
]);

function nodeId(videoId) {
  return `video_${videoId.replace(/-/g, "_")}`;
}

function shortLabel(title, speaker) {
  if (speaker && speaker !== "AI Fluency Course") {
    const name = speaker.split(" ").slice(-1)[0];
    return `${name.slice(0, 12)}`;
  }
  const t = title.split("—")[0].split("|")[0].trim();
  if (t.length <= 14) return t;
  return t.slice(0, 12) + "…";
}

const LABELS = {
  "ai-fluency-generative-ai": "Gen AI ·\nFluency",
  "karla-expanding-possibilities": "Karla ·\nSpace",
  "gallagher-4e-cognition": "Gallagher ·\n4E",
  "privacy-illusion-ai-data": "Privacy ·\nIllusion",
  "friston-brain-constructs-reality": "Friston ·\nReality",
  "levin-diverse-intelligences": "Levin ·\nDiverse",
  "levin-intelligence-without-brains": "Levin ·\nNo Brain",
  "thompson-embodied-cognition": "Thompson ·\nEmbodied",
  "varela-god-computers": "Varela ·\nComputers",
  "mini-brains-150k": "150k ·\nMini-Brains",
  "understanding-ai-inner-thoughts": "AI Inner\nThoughts",
  "visualizing-transformers-attention": "Transformers\n& Attention",
  "am-i-ai-consciousness-doc": "AM I?\nDocumentary",
  "creative-workers-ai-impact": "Creative\nWorkers",
  "thinking-game-documentary": "Thinking\nGame",
};

const EDGES = {
  "ai-fluency-generative-ai": [
    ["gen_ai", 0.95],
    ["llm", 0.92],
    ["ai", 0.88],
    ["machine_learning", 0.85],
  ],
  "karla-expanding-possibilities": [
    ["karla", 0.98],
    ["architecture", 0.92],
    ["creative_embodiment", 0.88],
    ["ai", 0.85],
    ["track_space", 0.85],
  ],
  "gallagher-4e-cognition": [
    ["gallagher", 0.98],
    ["4e", 0.95],
    ["embodied", 0.9],
    ["enactivism", 0.88],
    ["extended", 0.85],
  ],
  "privacy-illusion-ai-data": [
    ["crawford", 0.85],
    ["ai", 0.88],
    ["llm", 0.82],
    ["track_ethics", 0.9],
    ["epistemology", 0.78],
  ],
  "friston-brain-constructs-reality": [
    ["friston", 0.98],
    ["active_inference", 0.95],
    ["consciousness", 0.9],
    ["clark", 0.85],
    ["embodied", 0.82],
  ],
  "levin-diverse-intelligences": [
    ["synthetic_cognition", 0.9],
    ["distributed", 0.88],
    ["holobiont", 0.85],
    ["symbiosis", 0.85],
    ["consciousness", 0.8],
  ],
  "levin-intelligence-without-brains": [
    ["synthetic_cognition", 0.92],
    ["distributed", 0.9],
    ["holobiont", 0.85],
    ["margulis", 0.82],
    ["ai", 0.78],
  ],
  "thompson-embodied-cognition": [
    ["thompson", 0.98],
    ["enactivism", 0.95],
    ["4e", 0.92],
    ["embodied", 0.9],
    ["friston", 0.85],
  ],
  "varela-god-computers": [
    ["varela", 0.98],
    ["enactivism", 0.95],
    ["autopoiesis", 0.9],
    ["4e", 0.88],
    ["essay_4", 0.82],
  ],
  "mini-brains-150k": [
    ["neural_networks", 0.9],
    ["distributed", 0.88],
    ["embodied", 0.82],
    ["consciousness", 0.78],
  ],
  "understanding-ai-inner-thoughts": [
    ["ai_interpretability", 0.95],
    ["llm", 0.9],
    ["neural_networks", 0.88],
    ["aguilera_arcas", 0.82],
  ],
  "visualizing-transformers-attention": [
    ["transformers", 0.98],
    ["llm", 0.92],
    ["neural_networks", 0.9],
    ["machine_learning", 0.88],
  ],
  "am-i-ai-consciousness-doc": [
    ["consciousness", 0.95],
    ["chalmers", 0.88],
    ["ai", 0.9],
    ["synthetic_cognition", 0.85],
  ],
  "creative-workers-ai-impact": [
    ["creative_ai", 0.92],
    ["creative", 0.9],
    ["gen_ai", 0.88],
    ["creative_embodiment", 0.85],
  ],
  "thinking-game-documentary": [
    ["ai", 0.92],
    ["possible_minds", 0.88],
    ["shanahan", 0.85],
    ["agi", 0.82],
  ],
};

const TYPED = {
  "ai-fluency-generative-ai": [["gen_ai", "develops"]],
  "karla-expanding-possibilities": [["karla", "instantiates"]],
  "gallagher-4e-cognition": [["gallagher", "instantiates"], ["4e", "develops"]],
  "friston-brain-constructs-reality": [["friston", "instantiates"], ["active_inference", "develops"]],
  "levin-diverse-intelligences": [["synthetic_cognition", "develops"]],
  "thompson-embodied-cognition": [["thompson", "instantiates"], ["enactivism", "develops"]],
  "varela-god-computers": [["varela", "instantiates"], ["enactivism", "develops"]],
  "visualizing-transformers-attention": [["transformers", "develops"]],
  "understanding-ai-inner-thoughts": [["ai_interpretability", "develops"]],
};

const newVideos = manifest.filter((v) => !EXISTING.has(nodeId(v.id)));

const nodeLines = newVideos.map((v) => {
  const nid = nodeId(v.id);
  const label = LABELS[v.id] || shortLabel(v.title, v.speaker);
  const desc = `${v.title}${v.speaker ? ` — ${v.speaker}` : ""}. ${v.caption || ""} Video on YouTube; ingest matches speech to ontology concepts.`.slice(0, 520);
  return `  { id: "${nid}", label: "${label.replace(/\n/g, "\\n")}", cat: "video",   weight: 1.4,
    desc: "${desc.replace(/"/g, '\\"')}",
    url: "video-${v.id}.html", linkLabel: "Open video page →",
    watchUrl: "${v.youtube}", watchLabel: "Watch on YouTube ↗",
    poster: "${v.poster}" },`;
});

const hubEdges = [];

const conceptEdges = [];
for (const v of newVideos) {
  const nid = nodeId(v.id);
  for (const [target, w] of EDGES[v.id] || []) {
    conceptEdges.push(`  ["${nid}", "${target}", ${w}],`);
  }
}

const typedEdges = [];
for (const v of newVideos) {
  const nid = nodeId(v.id);
  for (const [target, verb] of TYPED[v.id] || []) {
    typedEdges.push(`  ["${nid}", "${target}", "${verb}"],`);
  }
}

const marker = `{ id: "video_clark_experience_machine"`;
const insertAfter = src.indexOf("poster: \"screenshots/clark-experience-machine.jpg\" },");
if (insertAfter < 0) throw new Error("clark node marker not found");
const endNode = insertAfter + "poster: \"screenshots/clark-experience-machine.jpg\" },".length;

if (src.includes('id: "video_ai_fluency_generative_ai"')) {
  console.log("Network nodes already patched; skipping node insert.");
} else {
  src = src.slice(0, endNode) + "\n" + nodeLines.join("\n") + src.slice(endNode);
}

const hubMarker = `["hi_videos", "video_clark_experience_machine", 0.98],`;
if (!src.includes('["hi_videos", "video_ai_fluency_generative_ai"')) {
  const hi = src.indexOf(hubMarker);
  if (hi < 0) throw new Error("hub marker not found");
  const hiEnd = hi + hubMarker.length;
  src = src.slice(0, hiEnd) + "\n" + hubEdges.join("\n") + src.slice(hiEnd);
}

const edgeMarker = `["video_clark_experience_machine", "coupling", 0.78],`;
if (!src.includes('["video_ai_fluency_generative_ai", "gen_ai"')) {
  const ei = src.indexOf(edgeMarker);
  if (ei < 0) throw new Error("edge marker not found");
  const eiEnd = ei + edgeMarker.length;
  src = src.slice(0, eiEnd) + "\n" + conceptEdges.join("\n") + src.slice(eiEnd);
}

const typedMarker = `["video_clark_experience_machine", "clark", "instantiates"],`;
if (!src.includes('["video_ai_fluency_generative_ai", "gen_ai", "develops"]')) {
  const ti = src.indexOf(typedMarker);
  if (ti < 0) throw new Error("typed marker not found");
  const tiEnd = ti + typedMarker.length;
  src = src.slice(0, tiEnd) + "\n" + typedEdges.join("\n") + src.slice(tiEnd);
}

fs.writeFileSync(networkFile, src);
console.log(`Patched ${newVideos.length} video nodes into hybrid-network.js`);
