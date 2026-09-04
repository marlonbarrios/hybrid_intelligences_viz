#!/usr/bin/env node
/**
 * Bulk-add YouTube reels for network authors into videos.json + hybrid-network.js
 * Run: node scripts/bulk-add-author-videos.js && node build-videos.js && node build-ontology.js
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const MANIFEST = path.join(ROOT, "videos.json");
const NETWORK = path.join(ROOT, "hybrid-network.js");
const BUILD_VIDEOS = path.join(ROOT, "build-videos.js");

/** author node id -> { youtubeId, title, caption, credit, concepts[] } */
const AUTHOR_VIDEOS = [
  { author: "ana_mendieta", slug: "mendieta-decolonial-feminist", yt: "nVk4UBA6HGQ", title: "Ana Mendieta: Decolonialized Feminist and Artist", caption: "On Mendieta's body-earth works, feminist practice, and decolonial art.", credit: "YouTube documentary" },
  { author: "escobar", slug: "escobar-pluriverse", yt: "8Ouy7aN6XPs", title: "Arturo Escobar — Designs for the Pluriverse", caption: "Clark University Atwood Lecture on pluriversal design and alternatives to one-world modernity.", credit: "Clark University · Atwood Lecture" },
  { author: "akomolafe", slug: "akomolafe-animism", yt: "5cuJnFZo_oA", title: "Animism — Bayo Akomolafe and Daniel Foor", caption: "Conversation on animism, ecology, and worlds beyond extractive modernity.", credit: "YouTube conversation" },
  { author: "bell_hooks", slug: "bell-hooks-speaking-freely", yt: "g2bmnwehlpA", title: "Speaking Freely — bell hooks", caption: "bell hooks on love, freedom, pedagogy, and cultural critique.", credit: "Speaking Freely" },
  { author: "sousa_santos", slug: "sousa-santos-decolonising", yt: "HIjbgX7lY4M", title: "Boaventura de Sousa Santos — Decolonising the Curriculum", caption: "Epistemologies of the South and decolonial approaches to knowledge and university practice.", credit: "University of Bristol" },
  { author: "latour", slug: "latour-once-out-of-nature", yt: "MC3E6vdQEzk", title: "Bruno Latour — Once Out of Nature", caption: "Natural religion, ecology of practices, and rethinking nature in the Anthropocene.", credit: "YouTube lecture" },
  { author: "chalmers", slug: "chalmers-talking-to-ai", yt: "uUjJOMcNU9w", title: "David Chalmers — When We Talk to AI, What Are We Talking To?", caption: "UC Berkeley — consciousness, philosophy of mind, and large language models.", credit: "UC Berkeley" },
  { author: "kirsh", slug: "kirsh-thinking-with-body", yt: "NOrkD7koecg", title: "David Kirsh — Thinking and Creating with the Body", caption: "Extended and embodied cognition — how bodies think, arrange, and create in the world.", credit: "UC San Diego" },
  { author: "haraway", slug: "haraway-chthulucene", yt: "GrYA7sMQaBQ", title: "Donna Haraway — Staying with the Trouble", caption: "Making kin in the Chthulucene — multispecies response-ability and posthuman futures.", credit: "YouTube lecture" },
  { author: "rosch", slug: "rosch-prototype-cognition", yt: "cL2Z2cJlcJ0", title: "Eleanor Rosch — Prototype Cognition", caption: "Why a robin is more of a bird than a penguin — prototypes, categories, and embodied mind.", credit: "YouTube talk" },
  { author: "cuffari", slug: "cuffari-linguistic-bodies", yt: "mJxtO6am5ZI", title: "Elena Clare Cuffari — Linguistic Bodies", caption: "Enactivist linguistics — language as participatory sense-making between bodies.", credit: "YouTube lecture" },
  { author: "di_paolo", slug: "di-paolo-enactivism", yt: "c1_0RnN_1xM", title: "Ezequiel Di Paolo — Ontologizing Enactivism", caption: "Dialogue on enactivism, worldmaking, and the ontology of living cognition.", credit: "YouTube dialogue" },
  { author: "fanon", slug: "fanon-colonization-mind", yt: "M0_AUXD-1bc", title: "Frantz Fanon — Colonization and the Mind", caption: "On Fanon's analysis of colonial violence, psychiatry, and liberation.", credit: "YouTube documentary" },
  { author: "bateson", slug: "bateson-ecology-of-mind", yt: "KePJVhhOELA", title: "Gregory Bateson — Ecology of Mind", caption: "Introduction to Bateson's ecology of mind — systems, learning, and relational cognition.", credit: "YouTube lecture" },
  { author: "de_jaegher", slug: "de-jaegher-participatory-sense", yt: "AiFuQD-ZWy4", title: "Hanne De Jaegher — Participatory Sense-Making", caption: "Introduction to participatory sense-making and social enaction.", credit: "YouTube lecture" },
  { author: "maturana", slug: "maturana-interview", yt: "fQFlceVouPA", title: "Humberto Maturana — Interview", caption: "Autopoiesis, cognition, and the biology of knowing.", credit: "YouTube interview" },
  { author: "uexkuell", slug: "uexkuell-umwelt", yt: "G_0jJfliUvQ", title: "Jakob von Uexküll — Umwelt and Biosemiotics", caption: "Introduction to Umwelt theory and the organism's meaningful world.", credit: "YouTube lecture" },
  { author: "gibson", slug: "gibson-ecological-psychology", yt: "fmPD0xF766k", title: "James J. Gibson — Ecological Psychology", caption: "Affordances, direct perception, and the ecological approach to psychology.", credit: "YouTube explainer" },
  { author: "cage", slug: "cage-433-lifetime", yt: "Y7q8iQPxLBY", title: "John Cage — 4'33\" and a Lifetime of Music", caption: "Chance operations, silence, and indeterminacy as perceptual and compositional method.", credit: "YouTube talk" },
  { author: "munoz", slug: "munoz-queer-utopianism", yt: "DHLxmCe4GpI", title: "José Esteban Muñoz — Queer Utopianism", caption: "Cruising utopia, performance, and queer futurity against the tyranny of the present.", credit: "YouTube lecture" },
  { author: "barad", slug: "barad-meeting-universe", yt: "JQlZAyAjcZQ", title: "Karen Barad — Meeting the Universe Halfway", caption: "Agential realism, intra-action, and quantum physics as philosophy of matter.", credit: "YouTube lecture" },
  { author: "crawford", slug: "crawford-ai-planet", yt: "tuqEro3NPaI", title: "Kate Crawford — AI and the Planet", caption: "Atlas of AI — extraction, energy, labor, and the material politics of machine learning.", credit: "YouTube interview" },
  { author: "malafouris", slug: "malafouris-embodied-patterns", yt: "n1BH4tdSvds", title: "Lambros Malafouris — Embodied Patterns", caption: "Material engagement — how things shape minds and cognitive archaeology of making.", credit: "YouTube lecture" },
  { author: "shapiro", slug: "shapiro-embodied-cognition", yt: "aJ6FY8oOwJE", title: "Lawrence Shapiro — Embodied Cognition", caption: "Full interview on embodied cognition and the body as constraint and resource for mind.", credit: "YouTube interview" },
  { author: "leigh_bowery", slug: "leigh-bowery-tate", yt: "8r4GwWAQN8s", title: "Leigh Bowery — Tate Highlights", caption: "Performance, fashion, and club culture as radical embodiment and social sculpture.", credit: "Tate" },
  { author: "margulis", slug: "margulis-symbiotic-earth", yt: "AJSENoONB10", title: "Lynn Margulis — Symbiotic Earth", caption: "Graduate seminar footage — symbiosis, holobionts, and evolution as cooperative process.", credit: "Symbiotic Earth documentary" },
  { author: "duchamp", slug: "duchamp-art-dada", yt: "Wuf_GHmjxLM", title: "Marcel Duchamp — Art and Dada (1956)", caption: "Archive interview on readymades, choice, and conceptual art.", credit: "1956 interview" },
  { author: "boden", slug: "boden-creativity-ai", yt: "5dEXIOiAsaw", title: "Margaret Boden — Creativity & AI", caption: "Creativity as novelty plus value — combinational, exploratory, and transformational forms in AI and art.", credit: "YouTube lecture" },
  { author: "merleau_ponty", slug: "merleau-ponty-phenomenology", yt: "JFj8kWm_N-Y", title: "Merleau-Ponty — Phenomenology of Perception", caption: "Lived body, perception, and phenomenological approaches to embodied experience.", credit: "YouTube lecture" },
  { author: "foucault", slug: "foucault-prison-1975", yt: "kQsoX_Yv0hE", title: "Michel Foucault — We Live in a Prison (1975)", caption: "Archive footage on power, discipline, and institutions that shape what can be known and done.", credit: "1975 archive" },
  { author: "shanahan", slug: "shanahan-consciousness-ai", yt: "v1Py_hWcmkU", title: "Murray Shanahan — Consciousness and AI", caption: "Philosophy of AI, consciousness, and reasoning in artificial systems.", credit: "YouTube talk" },
  { author: "nagarjuna", slug: "nagarjuna-emptiness", yt: "awzUd3wzTCM", title: "Nāgārjuna — Philosophy of Emptiness", caption: "Thupten Jinpa on Madhyamaka emptiness and why it matters for cognition and reality.", credit: "YouTube lecture" },
  { author: "butler", slug: "butler-parable-climate", yt: "sv5m3tnT9wk", title: "Octavia Butler — Parable and Climate Chaos", caption: "Butler on Parable books, Afrofuturism, and imagining futures under ecological collapse.", credit: "YouTube interview" },
  { author: "freire", slug: "freire-incredible-conversation", yt: "aFWjnkFypFA", title: "Paulo Freire — An Incredible Conversation", caption: "Archive conversation on pedagogy of the oppressed, literacy, and freedom as practice.", credit: "Archive interview" },
  { author: "wilson", slug: "wilson-state-space", yt: "u1qWPYQHsvo", title: "Robert A. Wilson — State Space Theory", caption: "MIND 2019 — extended mind, boundaries of cognition, and philosophical psychology.", credit: "MIND 2019" },
  { author: "brooks", slug: "brooks-humanoid-robots", yt: "6qxO13-3-Gk", title: "Rodney Brooks — Humanoid Robots and AI Hype", caption: "Subsumption architecture, embodied robotics, and intelligence without representation.", credit: "YouTube talk" },
  { author: "braidotti", slug: "braidotti-posthuman-knowledge", yt: "0CewnVzOg5w", title: "Rosi Braidotti — Posthuman Knowledge", caption: "Posthuman subjectivity, nomadic theory, and knowledge after the human.", credit: "YouTube lecture" },
  { author: "saul_leiter", slug: "saul-leiter-color", yt: "RbtnUY7j__A", title: "Saul Leiter — Life and Work", caption: "Color street photography, painterly vision, and everyday urban perception.", credit: "YouTube documentary" },
  { author: "steve_paxton", slug: "paxton-contact-improv", yt: "O3wgG1qPRTY", title: "Steve Paxton — Contact Improvisation", caption: "Contact improvisation, weight-sharing, and democratic intelligence of bodies in motion.", credit: "YouTube talk" },
  { author: "trisha_brown", slug: "trisha-brown-intensive", yt: "zPOMha3cIzo", title: "Trisha Brown Dance Company — Summer Intensive", caption: "Postmodern dance, ordinary movement, and somatic intelligence in choreography.", credit: "Trisha Brown Dance Company" },
  { author: "vera_molnar", slug: "vera-molnar-generative", yt: "8tNESHtfkr0", title: "Vera Molnár — Life and Work", caption: "Pioneer of computer and generative art — algorithms, chance, and systematic creativity.", credit: "YouTube documentary" },
  { author: "forsythe", slug: "forsythe-imagining-lines", yt: "6X29OjcBHG8", title: "William Forsythe — Imagining Lines", caption: "Choreographic objects, lines, and movement as distributed cognition.", credit: "YouTube lecture" },
  { author: "yoko_ono", slug: "yoko-ono-interview", yt: "o2cA9kGjoHc", title: "Yoko Ono — Interview", caption: "Fluxus, instruction pieces, and art as participatory worldmaking.", credit: "YouTube interview" },
];

function slugToId(slug) {
  return slug;
}

function nodeId(slug) {
  return `video_${slug.replace(/-/g, "_")}`;
}

function shortLabel(speaker) {
  const parts = speaker.split(" ");
  if (parts.length >= 2) {
    const last = parts[parts.length - 1].replace(/[^A-Za-z]/g, "");
    return `${last.slice(0, 10)} ·\nTalk`;
  }
  return speaker.slice(0, 12);
}

function authorLabel(authorId, src) {
  const re = new RegExp(`\\{ id: "${authorId}"[^}]*label: "((?:[^"\\\\]|\\\\.)*)"`, "s");
  const m = src.match(re);
  if (!m) return authorId;
  return m[1].replace(/\\n/g, " ");
}

function getAuthorConcepts(authorId, src) {
  const edges = [];
  const re = new RegExp(`\\["${authorId}", "([^"]+)", ([0-9.]+)\\]`, "g");
  let m;
  while ((m = re.exec(src))) edges.push({ id: m[1], w: parseFloat(m[2]) });
  edges.sort((a, b) => b.w - a.w);
  const top = edges.slice(0, 4).map((e) => e.id);
  if (!top.includes(authorId)) top.unshift(authorId);
  return [...new Set(top)].slice(0, 4);
}

function downloadPoster(yt, outPath) {
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 5000) return;
  const urls = [
    `https://i.ytimg.com/vi/${yt}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
  ];
  for (const url of urls) {
    const r = spawnSync("curl", ["-sL", url, "-o", outPath], { stdio: "pipe" });
    if (r.status === 0 && fs.existsSync(outPath) && fs.statSync(outPath).size > 5000) return;
  }
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  let network = fs.readFileSync(NETWORK, "utf8");
  let buildVideos = fs.readFileSync(BUILD_VIDEOS, "utf8");

  const existingYts = new Set(manifest.videos.map((v) => {
    const m = (v.youtube || "").match(/v=([\w-]+)/);
    return m ? m[1] : null;
  }).filter(Boolean));
  const existingIds = new Set(manifest.videos.map((v) => v.id));
  const usedYts = new Set();

  const newNodes = [];
  const newHubEdges = [];
  const newConceptEdges = [];
  const newTypedEdges = [];
  const newFallbacks = [];
  let added = 0;

  for (const entry of AUTHOR_VIDEOS) {
    if (existingIds.has(slugToId(entry.slug))) continue;
    if (existingYts.has(entry.yt)) continue;
    if (entry.skipIfYtUsed && usedYts.has(entry.yt)) continue;
    usedYts.add(entry.yt);

    const id = slugToId(entry.slug);
    const vid = nodeId(entry.slug);
    const speaker = authorLabel(entry.author, network);
    const poster = `screenshots/${entry.slug}.jpg`;
    const concepts = getAuthorConcepts(entry.author, network);

    downloadPoster(entry.yt, path.join(ROOT, poster));

    manifest.videos.push({
      id,
      title: `${speaker} — ${entry.title}`,
      youtube: `https://www.youtube.com/watch?v=${entry.yt}`,
      poster,
      date: "2024-01-01",
      speaker,
      caption: entry.caption,
      credit: entry.credit,
      transcript: `transcripts/${entry.slug}.json`,
    });

    const transcriptPath = path.join(ROOT, "transcripts", `${entry.slug}.json`);
    if (!fs.existsSync(transcriptPath)) {
      fs.writeFileSync(transcriptPath, JSON.stringify({
        videoId: entry.yt,
        text: "",
        source: "pending",
        ingestedAt: new Date().toISOString(),
        note: `Run: python3 scripts/import-youtube-captions.py ${entry.slug}`,
      }, null, 2) + "\n");
    }

    const label = shortLabel(speaker);
    const desc = `${entry.title} — ${speaker}. ${entry.caption} Video on YouTube; ingest matches speech to ontology concepts.`.slice(0, 520);
    newNodes.push(`  { id: "${vid}", label: "${label.replace(/\n/g, "\\n")}", cat: "video",   weight: 1.4,
    desc: "${desc.replace(/"/g, '\\"')}",
    url: "video-${id}.html", linkLabel: "Open video page →",
    watchUrl: "https://www.youtube.com/watch?v=${entry.yt}", watchLabel: "Watch on YouTube ↗",
    poster: "${poster}" },`);

    // Hub edges omitted: hi_videos lives on the Practices ring; individual videos on the Videos ring.

    for (const cid of concepts) {
      const w = cid === entry.author ? 0.98 : 0.88;
      newConceptEdges.push(`  ["${vid}", "${cid}", ${w}],`);
    }
    newTypedEdges.push(`  ["${vid}", "${entry.author}", "instantiates"],`);

    const chips = concepts.map((cid) => {
      const lm = network.match(new RegExp(`id: "${cid}"[^\\n]*\\n[^\\n]*label: "([^"]+)"`));
      const labelText = lm ? lm[1].replace(/\\n/g, " ") : cid;
      return `{ conceptId: "${cid}", label: "${labelText.replace(/"/g, '\\"')}" }`;
    });
    newFallbacks.push(`  "${id}": [\n    ${chips.join(",\n    ")},\n  ],`);

    added++;
  }

  if (!added) {
    console.log("No new videos to add.");
    return;
  }

  const insertMarker = `{ id: "video_aguilera_what_is_intelligence"`;
  const idx = network.indexOf(insertMarker);
  if (idx < 0) throw new Error("Insert marker not found");
  const lineStart = network.lastIndexOf("\n", idx) + 1;
  const blockEnd = network.indexOf("poster: \"screenshots/aguilera-what-is-intelligence.jpg\" },", idx);
  if (blockEnd < 0) throw new Error("aguilera block end not found");
  const endPos = blockEnd + "poster: \"screenshots/aguilera-what-is-intelligence.jpg\" },".length;
  network = network.slice(0, endPos) + "\n" + newNodes.join("\n") + network.slice(endPos);

  const hubMarker = `["hi_videos", "video_aguilera_what_is_intelligence", 0.96],`;
  const hi = network.indexOf(hubMarker);
  if (hi < 0) throw new Error("hub marker not found");
  network = network.slice(0, hi + hubMarker.length) + "\n" + newHubEdges.join("\n") + network.slice(hi + hubMarker.length);

  const edgeMarker = `["video_aguilera_what_is_intelligence", "holobiont", 0.85],`;
  const ei = network.indexOf(edgeMarker);
  if (ei < 0) throw new Error("edge marker not found");
  network = network.slice(0, ei + edgeMarker.length) + "\n" + newConceptEdges.join("\n") + network.slice(ei + edgeMarker.length);

  const typedMarker = `["video_aguilera_what_is_intelligence", "possible_minds", "develops"],`;
  const ti = network.indexOf(typedMarker);
  if (ti < 0) throw new Error("typed marker not found");
  network = network.slice(0, ti + typedMarker.length) + "\n" + newTypedEdges.join("\n") + network.slice(ti + typedMarker.length);

  const fbMarker = `"aguilera-what-is-intelligence": [`;
  const fi = buildVideos.indexOf(fbMarker);
  if (fi < 0) throw new Error("fallback marker not found");
  const fbEnd = buildVideos.indexOf("],", fi) + 2;
  buildVideos = buildVideos.slice(0, fbEnd) + "\n" + newFallbacks.join("\n") + buildVideos.slice(fbEnd);

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  fs.writeFileSync(NETWORK, network);
  fs.writeFileSync(BUILD_VIDEOS, buildVideos);
  console.log(`Added ${added} author videos.`);
}

main();
