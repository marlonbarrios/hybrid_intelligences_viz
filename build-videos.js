#!/usr/bin/env node
/**
 * Video publishing workflow
 *
 * Edit videos.json, add transcript via ingest-video.js, then:
 *   node build-videos.js
 *
 * Generates videos.html (hub) and video-{id}.html for each entry.
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MANIFEST = path.join(ROOT, "videos.json");

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
}

function loadTranscript(relPath) {
  if (!relPath) return null;
  const file = path.join(ROOT, relPath);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function sharedStyles() {
  return `    :root {
      --bg: #0e1018;
      --panel: #12141e;
      --border: #323848;
      --title: #f4c430;
      --text: #e8eaef;
      --muted: #969eb0;
      --link: #82c3ff;
      --hover: #1a1e2a;
      --accent: rgba(244, 196, 48, 0.12);
    }
    body.light-mode {
      --bg: #fffdf8;
      --panel: #ffffff;
      --border: #d2d6e0;
      --title: #a8760c;
      --text: #202430;
      --muted: #5a6070;
      --link: #125599;
      --hover: #f5f3ee;
      --accent: rgba(168, 118, 12, 0.1);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(ellipse 90% 55% at 12% -10%, rgba(244, 196, 48, 0.07), transparent 55%),
        radial-gradient(ellipse 70% 45% at 100% 0%, rgba(78, 196, 196, 0.05), transparent 50%),
        var(--bg);
      color: var(--text);
      font-family: "IBM Plex Sans", system-ui, sans-serif;
      line-height: 1.5;
    }
    a { color: var(--link); text-decoration: none; }
    a:hover { text-decoration: underline; }
    header {
      padding: 1.25rem 1.5rem 1rem;
      border-bottom: 1px solid var(--border);
      background: color-mix(in srgb, var(--panel) 88%, transparent);
      backdrop-filter: blur(8px);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    header .eyebrow {
      margin: 0 0 0.4rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }
    header h1 {
      margin: 0 0 0.45rem;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 300;
      font-size: clamp(0.95rem, 2.4vw, 1.15rem);
      line-height: 1.4;
      color: var(--title);
      max-width: 48rem;
    }
    header .meta {
      margin: 0;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.78rem;
      color: var(--muted);
    }
    .brand-row { display: flex; align-items: flex-start; gap: 0.85rem; }
    .site-logo { flex-shrink: 0; display: block; line-height: 0; text-decoration: none; }
    .site-logo:hover { opacity: 0.88; text-decoration: none; }
    .site-logo img { display: block; height: 88px; width: auto; }
    .brand-copy { min-width: 0; }
    .header-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.85rem;
    }
    .header-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.78rem;
      align-items: center;
    }
    .header-links a { display: inline-flex; align-items: center; }
    .gh-icon {
      display: inline-block;
      width: 0.92em;
      height: 0.92em;
      margin-right: 0.28em;
      vertical-align: -0.12em;
      background: currentColor;
      -webkit-mask: url("github-mark.svg") center / contain no-repeat;
      mask: url("github-mark.svg") center / contain no-repeat;
    }
    .theme-btn {
      border: 1px solid var(--border);
      background: var(--panel);
      color: var(--muted);
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      padding: 0.35rem 0.55rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .theme-btn:hover { color: var(--title); border-color: var(--title); }
    main {
      max-width: 56rem;
      margin: 0 auto;
      padding: 1.75rem 1.5rem 3.5rem;
    }
    footer.page-foot {
      max-width: 56rem;
      margin: 0 auto;
      padding: 0 1.5rem 3rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.75rem;
      color: var(--muted);
    }`;
}

function headerNav() {
  const links = [
    ["index.html", "← Home"],
    ["about.html", "About"],
    ["essays.html", "Essays"],
    ["videos.html", "Videos"],
    ["ontology.html", "Ontology"],
    ["views.html", "Views"],
    ["voice.html", "Voice"],
    ["image.html", "Image"],
    ["mini-pod.html", "Mini-pod"],
    ["enact.html", "Enact"],
    ["creative-b.html", "Creative B"],
    ["scan-qr.html", "Scan QR Code"],
  ];
  const items = links.map(([href, label]) => `<a href="${href}">${label}</a>`).join("\n        ");
  return `      <div class="header-links">
        ${items}
        <a href="https://github.com/marlonbarrios/hybrid_intelligences_viz" target="_blank" rel="noopener noreferrer"><span class="gh-icon" aria-hidden="true"></span>GitHub ↗</a>
      </div>
      <button type="button" class="theme-btn" id="themeBtn" aria-label="Toggle theme">Theme</button>`;
}

function themeScript() {
  return `  <script>
    function applyTheme(mode) {
      document.body.classList.toggle("light-mode", mode === "light");
      localStorage.setItem("hi-theme", mode);
    }
    function initTheme() {
      const saved = localStorage.getItem("hi-theme");
      const mode = saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      applyTheme(mode);
      document.getElementById("themeBtn").addEventListener("click", () => {
        applyTheme(document.body.classList.contains("light-mode") ? "dark" : "light");
      });
    }
    initTheme();
  </script>`;
}

function networkNodeId(videoId) {
  return `video_${videoId.replace(/-/g, "_")}`;
}

/** Fallback ontology links when ingest has not matched concepts yet. */
const VIDEO_FALLBACK_CONCEPTS = {
  "hayles-integrated-cognition": [
    { conceptId: "hayles", label: "Katherine Hayles" },
    { conceptId: "assemblage", label: "Assemblage" },
    { conceptId: "posthumanism", label: "Posthumanism" },
    { conceptId: "llm", label: "LLM" },
    { conceptId: "coupling", label: "Coupling" },
  ],
  "hayles-bacteria-ai": [
    { conceptId: "hayles", label: "Katherine Hayles" },
    { conceptId: "assemblage", label: "Assemblage" },
    { conceptId: "umwelt", label: "Umwelt" },
    { conceptId: "llm", label: "LLM" },
    { conceptId: "symbiosis", label: "Symbiosis" },
  ],
  "clark-experience-machine": [
    { conceptId: "clark", label: "Andy Clark" },
    { conceptId: "active_inference", label: "Active Inference" },
    { conceptId: "friston", label: "Karl Friston" },
    { conceptId: "embodied", label: "Embodied" },
    { conceptId: "consciousness", label: "Consciousness" },
  ],
  "ai-fluency-generative-ai": [
    { conceptId: "gen_ai", label: "Generative AI" },
    { conceptId: "llm", label: "LLM" },
    { conceptId: "ai", label: "AI" },
    { conceptId: "machine_learning", label: "Machine Learning" },
  ],
  "karla-expanding-possibilities": [
    { conceptId: "karla", label: "Karla Saldaña Ochoa" },
    { conceptId: "architecture", label: "Architecture" },
    { conceptId: "creative_embodiment", label: "Creative Embodiment" },
    { conceptId: "ai", label: "AI" },
  ],
  "gallagher-4e-cognition": [
    { conceptId: "gallagher", label: "Shaun Gallagher" },
    { conceptId: "4e", label: "4E Cognition" },
    { conceptId: "embodied", label: "Embodied" },
    { conceptId: "enactivism", label: "Enactivism" },
  ],
  "privacy-illusion-ai-data": [
    { conceptId: "crawford", label: "Kate Crawford" },
    { conceptId: "track_ethics", label: "Ethics Track" },
    { conceptId: "ai", label: "AI" },
    { conceptId: "llm", label: "LLM" },
  ],
  "friston-brain-constructs-reality": [
    { conceptId: "friston", label: "Karl Friston" },
    { conceptId: "active_inference", label: "Active Inference" },
    { conceptId: "consciousness", label: "Consciousness" },
    { conceptId: "clark", label: "Andy Clark" },
  ],
  "levin-diverse-intelligences": [
    { conceptId: "synthetic_cognition", label: "Synthetic Cognition" },
    { conceptId: "distributed", label: "Distributed" },
    { conceptId: "holobiont", label: "Holobiont" },
    { conceptId: "symbiosis", label: "Symbiosis" },
  ],
  "levin-intelligence-without-brains": [
    { conceptId: "synthetic_cognition", label: "Synthetic Cognition" },
    { conceptId: "distributed", label: "Distributed" },
    { conceptId: "holobiont", label: "Holobiont" },
    { conceptId: "margulis", label: "Lynn Margulis" },
  ],
  "thompson-embodied-cognition": [
    { conceptId: "thompson", label: "Evan Thompson" },
    { conceptId: "enactivism", label: "Enactivism" },
    { conceptId: "4e", label: "4E Cognition" },
    { conceptId: "embodied", label: "Embodied" },
  ],
  "varela-god-computers": [
    { conceptId: "varela", label: "Francisco Varela" },
    { conceptId: "enactivism", label: "Enactivism" },
    { conceptId: "autopoiesis", label: "Autopoiesis" },
    { conceptId: "4e", label: "4E Cognition" },
  ],
  "mini-brains-150k": [
    { conceptId: "neural_networks", label: "Neural Networks" },
    { conceptId: "distributed", label: "Distributed" },
    { conceptId: "embodied", label: "Embodied" },
    { conceptId: "consciousness", label: "Consciousness" },
  ],
  "understanding-ai-inner-thoughts": [
    { conceptId: "ai_interpretability", label: "AI Interpretability" },
    { conceptId: "llm", label: "LLM" },
    { conceptId: "neural_networks", label: "Neural Networks" },
    { conceptId: "aguilera_arcas", label: "Blaise Agüera y Arcas" },
  ],
  "visualizing-transformers-attention": [
    { conceptId: "transformers", label: "Transformers" },
    { conceptId: "llm", label: "LLM" },
    { conceptId: "neural_networks", label: "Neural Networks" },
    { conceptId: "machine_learning", label: "Machine Learning" },
  ],
  "am-i-ai-consciousness-doc": [
    { conceptId: "consciousness", label: "Consciousness" },
    { conceptId: "chalmers", label: "David Chalmers" },
    { conceptId: "ai", label: "AI" },
    { conceptId: "synthetic_cognition", label: "Synthetic Cognition" },
  ],
  "creative-workers-ai-impact": [
    { conceptId: "creative_ai", label: "Creative AI" },
    { conceptId: "creative", label: "Creative Practice" },
    { conceptId: "gen_ai", label: "Generative AI" },
    { conceptId: "creative_embodiment", label: "Creative Embodiment" },
  ],
  "thinking-game-documentary": [
    { conceptId: "ai", label: "AI" },
    { conceptId: "possible_minds", label: "Possible Minds" },
    { conceptId: "shanahan", label: "Murray Shanahan" },
    { conceptId: "agi", label: "AGI" },
  ],
  "noe-out-of-our-heads": [
    { conceptId: "noe", label: "Alva Noë" },
    { conceptId: "embodied", label: "Embodied" },
    { conceptId: "enactivism", label: "Enactivism" },
    { conceptId: "4e", label: "4E Cognition" },
  ],
  "aguilera-what-is-intelligence": [
    { conceptId: "aguilera_arcas", label: "Blaise Agüera y Arcas" },
    { conceptId: "possible_minds", label: "Possible Minds" },
    { conceptId: "ai", label: "AI" },
    { conceptId: "symbiosis", label: "Symbiosis" },
  ],
  "mendieta-decolonial-feminist": [
    { conceptId: "ana_mendieta", label: "ana_mendieta" },
    { conceptId: "art", label: "art" },
    { conceptId: "creative_embodiment", label: "creative_embodiment" },
    { conceptId: "body", label: "body" },
  ],
  "escobar-pluriverse": [
    { conceptId: "escobar", label: "escobar" },
    { conceptId: "pluriversal", label: "pluriversal" },
    { conceptId: "design_thinking", label: "design_thinking" },
    { conceptId: "cultural_critical", label: "cultural_critical" },
  ],
  "akomolafe-animism": [
    { conceptId: "akomolafe", label: "akomolafe" },
    { conceptId: "cultural_critical", label: "cultural_critical" },
    { conceptId: "hybrid", label: "hybrid" },
    { conceptId: "philosophy", label: "philosophy" },
  ],
  "bell-hooks-speaking-freely": [
    { conceptId: "bell_hooks", label: "bell_hooks" },
    { conceptId: "cultural_critical", label: "cultural_critical" },
    { conceptId: "pedagogy", label: "pedagogy" },
    { conceptId: "freire", label: "freire" },
  ],
  "sousa-santos-decolonising": [
    { conceptId: "sousa_santos", label: "sousa_santos" },
    { conceptId: "epistemologies_south", label: "epistemologies_south" },
    { conceptId: "epistemology", label: "epistemology" },
    { conceptId: "freire", label: "freire" },
  ],
  "latour-once-out-of-nature": [
    { conceptId: "latour", label: "latour" },
    { conceptId: "assemblage", label: "assemblage" },
    { conceptId: "distributed", label: "distributed" },
    { conceptId: "technical_agency", label: "technical_agency" },
  ],
  "chalmers-talking-to-ai": [
    { conceptId: "chalmers", label: "chalmers" },
    { conceptId: "extended", label: "extended" },
    { conceptId: "clark", label: "clark" },
    { conceptId: "agi", label: "agi" },
  ],
  "kirsh-thinking-with-body": [
    { conceptId: "kirsh", label: "kirsh" },
    { conceptId: "choreo_knowledge", label: "choreo_knowledge" },
    { conceptId: "extended", label: "extended" },
    { conceptId: "distributed", label: "distributed" },
  ],
  "haraway-chthulucene": [
    { conceptId: "haraway", label: "haraway" },
    { conceptId: "cyborg", label: "cyborg" },
    { conceptId: "technosymbiosis", label: "technosymbiosis" },
    { conceptId: "hybrid", label: "hybrid" },
  ],
  "rosch-prototype-cognition": [
    { conceptId: "rosch", label: "rosch" },
    { conceptId: "buddhism", label: "buddhism" },
    { conceptId: "enacted", label: "enacted" },
    { conceptId: "enactivism", label: "enactivism" },
  ],
  "cuffari-linguistic-bodies": [
    { conceptId: "cuffari", label: "cuffari" },
    { conceptId: "enactivism", label: "enactivism" },
    { conceptId: "di_paolo", label: "di_paolo" },
    { conceptId: "de_jaegher", label: "de_jaegher" },
  ],
  "di-paolo-enactivism": [
    { conceptId: "di_paolo", label: "di_paolo" },
    { conceptId: "enactivism", label: "enactivism" },
    { conceptId: "cuffari", label: "cuffari" },
    { conceptId: "autopoiesis", label: "autopoiesis" },
  ],
  "fanon-colonization-mind": [
    { conceptId: "fanon", label: "fanon" },
    { conceptId: "cultural_critical", label: "cultural_critical" },
    { conceptId: "critical", label: "critical" },
    { conceptId: "perception_politics", label: "perception_politics" },
  ],
  "bateson-ecology-of-mind": [
    { conceptId: "bateson", label: "bateson" },
    { conceptId: "ecology", label: "ecology" },
    { conceptId: "cybernetics", label: "cybernetics" },
    { conceptId: "ecology_d", label: "ecology_d" },
  ],
  "de-jaegher-participatory-sense": [
    { conceptId: "de_jaegher", label: "de_jaegher" },
    { conceptId: "enactivism", label: "enactivism" },
    { conceptId: "coupling", label: "coupling" },
    { conceptId: "di_paolo", label: "di_paolo" },
  ],
  "maturana-interview": [
    { conceptId: "maturana", label: "maturana" },
    { conceptId: "autopoiesis", label: "autopoiesis" },
    { conceptId: "varela", label: "varela" },
    { conceptId: "coupling", label: "coupling" },
  ],
  "uexkuell-umwelt": [
    { conceptId: "uexkuell", label: "uexkuell" },
    { conceptId: "umwelt", label: "umwelt" },
    { conceptId: "ecology", label: "ecology" },
    { conceptId: "varela", label: "varela" },
  ],
  "gibson-ecological-psychology": [
    { conceptId: "gibson", label: "gibson" },
    { conceptId: "embedded", label: "embedded" },
    { conceptId: "architecture", label: "architecture" },
    { conceptId: "ecology", label: "ecology" },
  ],
  "cage-433-lifetime": [
    { conceptId: "cage", label: "cage" },
    { conceptId: "music", label: "music" },
    { conceptId: "fluxus", label: "fluxus" },
    { conceptId: "creative", label: "creative" },
  ],
  "munoz-queer-utopianism": [
    { conceptId: "munoz", label: "munoz" },
    { conceptId: "futurity", label: "futurity" },
    { conceptId: "speculative_futures", label: "speculative_futures" },
    { conceptId: "cultural_imagination", label: "cultural_imagination" },
  ],
  "barad-meeting-universe": [
    { conceptId: "barad", label: "barad" },
    { conceptId: "haraway", label: "haraway" },
    { conceptId: "coupling", label: "coupling" },
    { conceptId: "assemblage", label: "assemblage" },
  ],
  "crawford-ai-planet": [
    { conceptId: "crawford", label: "crawford" },
    { conceptId: "ai", label: "ai" },
    { conceptId: "perception_politics", label: "perception_politics" },
    { conceptId: "gen_ai", label: "gen_ai" },
  ],
  "malafouris-embodied-patterns": [
    { conceptId: "malafouris", label: "malafouris" },
    { conceptId: "extended", label: "extended" },
    { conceptId: "extended_q", label: "extended_q" },
    { conceptId: "synthetic_cognition", label: "synthetic_cognition" },
  ],
  "shapiro-embodied-cognition": [
    { conceptId: "shapiro", label: "shapiro" },
    { conceptId: "enactivism", label: "enactivism" },
    { conceptId: "embodied", label: "embodied" },
    { conceptId: "embedded", label: "embedded" },
  ],
  "leigh-bowery-tate": [
    { conceptId: "leigh_bowery", label: "leigh_bowery" },
    { conceptId: "art", label: "art" },
    { conceptId: "queer_theory", label: "queer_theory" },
    { conceptId: "creative", label: "creative" },
  ],
  "margulis-symbiotic-earth": [
    { conceptId: "margulis", label: "margulis" },
    { conceptId: "symbiosis", label: "symbiosis" },
    { conceptId: "technosymbiosis", label: "technosymbiosis" },
    { conceptId: "ecology_d", label: "ecology_d" },
  ],
  "duchamp-art-dada": [
    { conceptId: "duchamp", label: "duchamp" },
    { conceptId: "art", label: "art" },
    { conceptId: "creative", label: "creative" },
    { conceptId: "curation", label: "curation" },
  ],
  "boden-creativity-ai": [
    { conceptId: "boden", label: "boden" },
    { conceptId: "ai", label: "ai" },
    { conceptId: "creative_ai", label: "creative_ai" },
    { conceptId: "creativity", label: "creativity" },
  ],
  "merleau-ponty-phenomenology": [
    { conceptId: "merleau_ponty", label: "merleau_ponty" },
    { conceptId: "enactivism", label: "enactivism" },
    { conceptId: "embodiment", label: "embodiment" },
    { conceptId: "embodied", label: "embodied" },
  ],
  "foucault-prison-1975": [
    { conceptId: "foucault", label: "foucault" },
    { conceptId: "perception_politics", label: "perception_politics" },
    { conceptId: "critical", label: "critical" },
    { conceptId: "philosophy", label: "philosophy" },
  ],
  "shanahan-consciousness-ai": [
    { conceptId: "shanahan", label: "shanahan" },
    { conceptId: "possible_minds", label: "possible_minds" },
  ],
  "nagarjuna-emptiness": [
    { conceptId: "nagarjuna", label: "nagarjuna" },
    { conceptId: "buddhism", label: "buddhism" },
    { conceptId: "philosophy", label: "philosophy" },
    { conceptId: "epistemology", label: "epistemology" },
  ],
  "butler-parable-climate": [
    { conceptId: "butler", label: "butler" },
    { conceptId: "afrofuturism", label: "afrofuturism" },
    { conceptId: "speculative_futures", label: "speculative_futures" },
    { conceptId: "futurity", label: "futurity" },
  ],
  "freire-incredible-conversation": [
    { conceptId: "freire", label: "freire" },
    { conceptId: "cultural_critical", label: "cultural_critical" },
    { conceptId: "critical", label: "critical" },
    { conceptId: "literacies", label: "literacies" },
  ],
  "wilson-state-space": [
    { conceptId: "wilson", label: "wilson" },
    { conceptId: "situated", label: "situated" },
    { conceptId: "extended", label: "extended" },
    { conceptId: "embedded", label: "embedded" },
  ],
  "brooks-humanoid-robots": [
    { conceptId: "brooks", label: "brooks" },
    { conceptId: "4e", label: "4e" },
    { conceptId: "embodied", label: "embodied" },
    { conceptId: "affordances", label: "affordances" },
  ],
  "braidotti-posthuman-knowledge": [
    { conceptId: "braidotti", label: "braidotti" },
    { conceptId: "hybrid", label: "hybrid" },
    { conceptId: "philosophy", label: "philosophy" },
    { conceptId: "cultural_critical", label: "cultural_critical" },
  ],
  "saul-leiter-color": [
    { conceptId: "saul_leiter", label: "saul_leiter" },
    { conceptId: "art", label: "art" },
    { conceptId: "abstraction", label: "abstraction" },
    { conceptId: "creative", label: "creative" },
  ],
  "paxton-contact-improv": [
    { conceptId: "steve_paxton", label: "steve_paxton" },
    { conceptId: "judson_church", label: "judson_church" },
    { conceptId: "trisha_brown", label: "trisha_brown" },
    { conceptId: "dance", label: "dance" },
  ],
  "trisha-brown-intensive": [
    { conceptId: "trisha_brown", label: "trisha_brown" },
    { conceptId: "dance", label: "dance" },
    { conceptId: "choreography_d", label: "choreography_d" },
    { conceptId: "choreography", label: "choreography" },
  ],
  "vera-molnar-generative": [
    { conceptId: "vera_molnar", label: "vera_molnar" },
    { conceptId: "generative_arts", label: "generative_arts" },
    { conceptId: "abstraction", label: "abstraction" },
    { conceptId: "creativity", label: "creativity" },
  ],
  "forsythe-imagining-lines": [
    { conceptId: "forsythe", label: "forsythe" },
    { conceptId: "choreo_knowledge", label: "choreo_knowledge" },
    { conceptId: "choreo_object", label: "choreo_object" },
    { conceptId: "motion_bank", label: "motion_bank" },
  ],
  "yoko-ono-interview": [
    { conceptId: "yoko_ono", label: "Yoko Ono" },
    { conceptId: "fluxus", label: "Fluxus" },
    { conceptId: "art", label: "Art" },
    { conceptId: "interdisciplinary_art", label: "Interdisciplinary Art" },
  ],
  "batson-minds-in-motion": [
    { conceptId: "somatics", label: "Somatics" },
    { conceptId: "dance", label: "Dance" },
    { conceptId: "embodiment", label: "Embodiment" },
    { conceptId: "marlon", label: "Marlon Barrios Solano" },
  ],
  "forsythe-synchronous-objects-hellerau": [
    { conceptId: "forsythe", label: "William Forsythe" },
    { conceptId: "choreo_object", label: "Choreographic Object" },
    { conceptId: "motion_bank", label: "Motion Bank" },
    { conceptId: "choreo_knowledge", label: "Choreographic Knowledge" },
  ],
};

function videoConcepts(video, transcript) {
  const max = 4;
  let list;
  if (transcript && transcript.matched && transcript.matched.length) {
    list = transcript.matched.slice(0, max);
  } else {
    list = (VIDEO_FALLBACK_CONCEPTS[video.id] || []).slice(0, max);
  }
  return list.map((c) => ({
    ...c,
    label: conceptDisplayLabel(c.conceptId, c.label),
  }));
}

let conceptLabelCache = null;
function getConceptLabels() {
  if (conceptLabelCache) return conceptLabelCache;
  conceptLabelCache = new Map();
  const srcPath = path.join(ROOT, "hybrid-network.js");
  if (!fs.existsSync(srcPath)) return conceptLabelCache;
  const src = fs.readFileSync(srcPath, "utf8");
  const re = /\{\s*id:\s*"([^"]+)"[^}]*label:\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = re.exec(src))) {
    conceptLabelCache.set(match[1], match[2].replace(/\\n/g, " ").trim());
  }
  return conceptLabelCache;
}

function conceptDisplayLabel(conceptId, fallback) {
  const fromOntology = getConceptLabels().get(conceptId);
  if (fromOntology) return fromOntology;
  const raw = fallback || conceptId;
  return String(raw).replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function videoDisplayLabel(video) {
  return String(video.title || video.speaker || video.id).trim();
}

function normalizeSpeakerKey(name) {
  return String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

function speakerKey(name) {
  return `speaker_${normalizeSpeakerKey(name) || "other"}`;
}

function speakerDisplayName(video) {
  const speaker = String(video.speaker || "").trim();
  if (speaker) return speaker;
  const title = String(video.title || "").trim();
  const dash = title.match(/^(.+?)\s*[—–-]\s+/);
  if (dash) return dash[1].trim();
  const short = title.split(/[—–|]/)[0].trim();
  return short || "Other";
}

const VIDEO_SHORT_LABELS = {
  "hayles-integrated-cognition": "Hayles ·\nICF",
  "hayles-bacteria-ai": "Hayles ·\nBacteria",
  "clark-experience-machine": "Clark ·\nExperience",
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
  "forsythe-synchronous-objects-hellerau": "Forsythe ·\nSync Objects",
  "mendieta-decolonial-feminist": "Mendieta ·\nDecolonial",
  "batson-minds-in-motion": "Batson ·\nMinds",
};

function abbreviateTopic(topic, maxLen = 14) {
  const clean = String(topic).replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const words = clean.split(/\s+/);
  const two = words.slice(0, 2).join(" ");
  if (two.length <= maxLen) return two;
  return `${clean.slice(0, maxLen - 1)}…`;
}

function speakerShortName(speaker) {
  const parts = String(speaker).trim().split(/\s+/);
  if (!parts.length) return "";
  if (speaker.toLowerCase() === "bell hooks") return "hooks";
  const last = parts[parts.length - 1].replace(/[^A-Za-zÀ-ÿ]/g, "");
  return last.slice(0, 12);
}

function videoNetworkShortLabel(video) {
  if (VIDEO_SHORT_LABELS[video.id]) return VIDEO_SHORT_LABELS[video.id];

  const title = videoDisplayLabel(video);
  const speaker = String(video.speaker || "").trim();

  if (speaker && speaker !== "AI Fluency Course") {
    const name = speakerShortName(speaker);
    let topic = title;
    const esc = speaker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    topic = topic
      .replace(new RegExp(`^${esc}\\s*[—–-]\\s*`, "i"), "")
      .replace(new RegExp(`\\s*[—–-]\\s*${esc}\\s*$`, "i"), "")
      .replace(new RegExp(`^${esc}\\s*:\\s*`, "i"), "")
      .replace(/^Prof\.\s+/i, "")
      .trim();
    if (!topic || topic.toLowerCase() === speaker.toLowerCase()) topic = "Talk";
    return `${name} ·\n${abbreviateTopic(topic)}`;
  }

  const head = title.split("—")[0].split("|")[0].trim();
  if (head.length <= 16) return head;
  const mid = Math.ceil(head.length / 2);
  const splitAt = head.lastIndexOf(" ", mid);
  if (splitAt > 4) {
    return `${head.slice(0, splitAt)}\n${abbreviateTopic(head.slice(splitAt + 1))}`;
  }
  return `${head.slice(0, 14)}\n${abbreviateTopic(head.slice(14))}`;
}

function escapeNetworkLabel(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

const VIDEO_AUTHOR_OVERRIDES = {
  "privacy-illusion-ai-data": "crawford",
  "thinking-game-documentary": "shanahan",
  "am-i-ai-consciousness-doc": "chalmers",
};

const SPEAKER_AUTHOR_OVERRIDES = {
  "karla saldana ochoa": "karla",
  "glenna batson": "batson",
  "michael levin": "levin",
  "steve paxton": "steve_paxton",
  "ana mendieta": "ana_mendieta",
  "bell hooks": "bell_hooks",
};

function normalizePersonName(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getNetworkNodeIds(src) {
  const ids = new Set();
  const re = /\{ id: "([^"]+)"/g;
  let match;
  while ((match = re.exec(src))) ids.add(match[1]);
  return ids;
}

function getAuthorIndex(src) {
  const authors = new Map();
  const re = /\{ id: "([^"]+)",\s+label: "((?:[^"\\]|\\.)*)",\s+cat: "(author|facilitator)"/g;
  let match;
  while ((match = re.exec(src))) {
    authors.set(match[1], {
      label: match[2].replace(/\\n/g, " ").trim(),
      cat: match[3],
    });
  }
  return authors;
}

function resolveAuthorForVideo(video, authors) {
  if (VIDEO_AUTHOR_OVERRIDES[video.id]) return VIDEO_AUTHOR_OVERRIDES[video.id];
  const speaker = String(video.speaker || "").trim();
  if (!speaker || speaker === "AI Fluency Course") return null;

  const normalizedSpeaker = normalizePersonName(speaker);
  if (SPEAKER_AUTHOR_OVERRIDES[normalizedSpeaker]) {
    return SPEAKER_AUTHOR_OVERRIDES[normalizedSpeaker];
  }

  for (const [id, meta] of authors) {
    const normalizedLabel = normalizePersonName(meta.label);
    if (
      normalizedSpeaker === normalizedLabel
      || normalizedSpeaker.includes(normalizedLabel)
      || normalizedLabel.includes(normalizedSpeaker)
    ) {
      return id;
    }
  }

  const last = normalizedSpeaker.split(" ").pop();
  const matches = [...authors.entries()].filter(
    ([, meta]) => normalizePersonName(meta.label).split(" ").pop() === last
  );
  if (matches.length === 1) return matches[0][0];
  return null;
}

function parseWeightedEdges(src) {
  const start = src.indexOf("const EDGES = [");
  const end = src.indexOf("\nconst TYPED_EDGES", start);
  const block = src.slice(start, end);
  const edges = new Map();
  const re = /\["([^"]+)", "([^"]+)", ([0-9.]+)\]/g;
  let match;
  while ((match = re.exec(block))) {
    edges.set(`${match[1]}|${match[2]}`, parseFloat(match[3]));
  }
  return edges;
}

function parseTypedEdges(src) {
  const start = src.indexOf("const TYPED_EDGES = [");
  const end = src.indexOf("\n];", start);
  const block = src.slice(start, end);
  const typed = new Set();
  const re = /\["([^"]+)", "([^"]+)", "([^"]+)"\]/g;
  let match;
  while ((match = re.exec(block))) typed.add(`${match[1]}|${match[2]}|${match[3]}`);
  return typed;
}

function hasUndirectedEdge(edges, a, b) {
  return edges.has(`${a}|${b}`) || edges.has(`${b}|${a}`);
}

function syncVideoAuthorEdges(videos) {
  const networkPath = path.join(ROOT, "hybrid-network.js");
  if (!fs.existsSync(networkPath)) return;
  let src = fs.readFileSync(networkPath, "utf8");
  const nodeIds = getNetworkNodeIds(src);
  const authors = getAuthorIndex(src);
  const edges = parseWeightedEdges(src);
  const typed = parseTypedEdges(src);

  const newEdges = [];
  const newTyped = [];
  let upgraded = 0;

  for (const video of videos) {
    const videoNodeId = networkNodeId(video.id);
    if (!nodeIds.has(videoNodeId)) continue;
    const authorId = resolveAuthorForVideo(video, authors);
    if (!authorId || !nodeIds.has(authorId)) continue;

    if (!hasUndirectedEdge(edges, videoNodeId, authorId)) {
      newEdges.push(`  ["${videoNodeId}", "${authorId}", 0.98],`);
      edges.set(`${videoNodeId}|${authorId}`, 0.98);
    } else {
      for (const key of [`${videoNodeId}|${authorId}`, `${authorId}|${videoNodeId}`]) {
        if (edges.has(key) && edges.get(key) < 0.98) {
          const [a, b] = key.split("|");
          src = src.replace(
            new RegExp(`(\\["${a}", "${b}", )([0-9.]+)(\\])`, "g"),
            (_, pre, _w, post) => `${pre}0.98${post}`
          );
          upgraded++;
          edges.set(key, 0.98);
        }
      }
    }

    const typedKey = `${videoNodeId}|${authorId}|instantiates`;
    if (!typed.has(typedKey)) {
      newTyped.push(`  ["${videoNodeId}", "${authorId}", "instantiates"],`);
      typed.add(typedKey);
    }
  }

  if (newEdges.length) {
    const edgesStart = src.indexOf("const EDGES = [");
    const edgesEnd = src.indexOf("\nconst TYPED_EDGES = [", edgesStart);
    const insertAt = src.lastIndexOf("\n];", edgesEnd);
    src = `${src.slice(0, insertAt)}\n${newEdges.join("\n")}${src.slice(insertAt)}`;
  }
  if (newTyped.length) {
    const typedStart = src.indexOf("const TYPED_EDGES = [");
    const typedEnd = src.indexOf("\n];", typedStart);
    src = `${src.slice(0, typedEnd)}\n${newTyped.join("\n")}${src.slice(typedEnd)}`;
  }

  if (newEdges.length || newTyped.length || upgraded) {
    fs.writeFileSync(networkPath, src);
    console.log(
      `Synced author-video links: ${newEdges.length} new edges, ${newTyped.length} typed, ${upgraded} upgraded`
    );
  }
}

function syncVideoNetworkLabels(videos) {
  const networkPath = path.join(ROOT, "hybrid-network.js");
  if (!fs.existsSync(networkPath)) return;
  let src = fs.readFileSync(networkPath, "utf8");
  let changed = 0;
  for (const video of videos) {
    const nodeId = networkNodeId(video.id);
    const fullLabel = escapeNetworkLabel(videoDisplayLabel(video));
    const shortLabel = escapeNetworkLabel(videoNetworkShortLabel(video));
    const withFull = new RegExp(
      `(\\{ id: "${nodeId}", label: ")(?:[^"\\\\]|\\\\.)*(", fullLabel: ")(?:[^"\\\\]|\\\\.)*(", cat: ")(?:practice|video)(")`,
      "g"
    );
    const withoutFull = new RegExp(
      `(\\{ id: "${nodeId}", label: ")(?:[^"\\\\]|\\\\.)*(", cat: ")(?:practice|video)(")`,
      "g"
    );
    const next = src.replace(withFull, `$1${shortLabel}$2${fullLabel}$3video$4`)
      .replace(withoutFull, `$1${shortLabel}", fullLabel: "${fullLabel}$2video$3`);
    if (next !== src) changed++;
    src = next;
  }
  if (changed) {
    fs.writeFileSync(networkPath, src);
    conceptLabelCache = null;
    console.log(`Synced ${changed} video labels in hybrid-network.js`);
  }
}

function buildNetworkGraphData(videos) {
  const nodes = [
    {
      id: "hi_videos",
      label: "Videos",
      type: "hub",
      url: "videos.html",
    },
  ];
  const edges = [];
  const conceptSeen = new Set();
  const videoConceptMap = new Map();

  for (const video of videos) {
    const nodeId = networkNodeId(video.id);
    const transcript = loadTranscript(video.transcript);
    const concepts = videoConcepts(video, transcript);
    const displayLabel = videoDisplayLabel(video);
    const speakerName = speakerDisplayName(video);
    const speakerId = speakerKey(speakerName);

    nodes.push({
      id: nodeId,
      label: displayLabel,
      fullLabel: displayLabel,
      type: "video",
      poster: video.poster || null,
      url: `video-${video.id}.html`,
      speaker: speakerName,
      speakerId,
    });
    edges.push({ source: "hi_videos", target: nodeId, kind: "hub" });
    videoConceptMap.set(nodeId, new Set());

    for (const concept of concepts) {
      const cid = concept.conceptId;
      videoConceptMap.get(nodeId).add(cid);
      if (!conceptSeen.has(cid)) {
        conceptSeen.add(cid);
        nodes.push({
          id: cid,
          label: conceptDisplayLabel(cid, concept.label),
          type: "concept",
          url: `network.html#${cid}`,
        });
      }
      edges.push({ source: nodeId, target: cid, kind: "concept" });
    }
  }

  const videoIds = [...videoConceptMap.keys()];
  for (let i = 0; i < videoIds.length; i++) {
    for (let j = i + 1; j < videoIds.length; j++) {
      const a = videoIds[i];
      const b = videoIds[j];
      const setA = videoConceptMap.get(a);
      const setB = videoConceptMap.get(b);
      const shared = [...setA].filter((c) => setB.has(c));
      const nodeA = nodes.find((n) => n.id === a);
      const nodeB = nodes.find((n) => n.id === b);
      const sameSpeaker =
        nodeA?.speaker && nodeB?.speaker && nodeA.speaker === nodeB.speaker;
      if (shared.length >= 1 || sameSpeaker) {
        edges.push({
          source: a,
          target: b,
          kind: "related",
          shared: Math.max(shared.length, sameSpeaker ? 1 : 0),
        });
      }
    }
  }

  return { nodes, edges };
}

function buildConceptVideosIndex(videos) {
  const byConcept = {};
  for (const video of videos) {
    const transcript = loadTranscript(video.transcript);
    const concepts = videoConcepts(video, transcript);
    const entry = {
      id: video.id,
      title: video.title,
      speaker: video.speaker || "",
      url: `video-${video.id}.html`,
      poster: video.poster || null,
    };
    for (const concept of concepts) {
      const cid = concept.conceptId;
      if (!byConcept[cid]) byConcept[cid] = [];
      if (!byConcept[cid].some((v) => v.id === video.id)) {
        byConcept[cid].push(entry);
      }
    }
  }
  for (const cid of Object.keys(byConcept)) {
    byConcept[cid].sort((a, b) => a.title.localeCompare(b.title));
  }
  return byConcept;
}

function networkVizScript(graphJson) {
  const body = fs.readFileSync(path.join(ROOT, "scripts/video-network-viz.inc.js"), "utf8");
  return `  <script>
    (function () {
      const graph = ${graphJson};
${body}    })();
  </script>`;
}

function voiceTalkHref(video) {
  const id = networkNodeId(video.id);
  const name = encodeURIComponent(String(video.title || video.id).replace(/\n/g, " "));
  return `voice.html?talk=${encodeURIComponent(id)}&name=${name}`;
}

function renderCardConcepts(matched) {
  if (!matched || !matched.length) return "";
  const chips = matched
    .slice(0, 5)
    .map((m) => {
      const label = escapeHtml(m.label || m.conceptId);
      const id = escapeHtml(m.conceptId);
      return `<a class="concept-chip" href="network.html#${id}">${label}</a>`;
    })
    .join("");
  return `<div class="card-concepts">${chips}</div>`;
}

function renderConcepts(matched, videoId, talkHref) {
  const talk = `<p class="talk-row"><a class="talk-link" href="${escapeHtml(talkHref)}">Talk about this</a></p>`;
  const hasIngest = matched && matched.length && matched.some((m) => m.score != null);
  if (matched && matched.length) {
    const chips = matched
      .map((m) => {
        const label = escapeHtml(m.label || m.conceptId);
        const id = escapeHtml(m.conceptId);
        return `<a class="concept-chip" href="network.html#${id}">${label}</a>`;
      })
      .join("\n        ");
    const hint = hasIngest
      ? `<p class="hint">Matched from the speech against the Hybrid Intelligences ontology.</p>`
      : `<p class="hint">Ontology links from the network graph — run ingest for speech-matched concepts.</p>`;
    return `
    ${talk}
    <section class="concepts" aria-labelledby="concepts-heading">
      <h2 id="concepts-heading">Concepts in this video</h2>
      ${hint}
      <div class="concept-list">
        ${chips}
      </div>
    </section>`;
  }
  return `
    ${talk}
    <section class="concepts pending" aria-labelledby="concepts-heading">
      <h2 id="concepts-heading">Ontology</h2>
      <p class="hint">Concept matching runs after ingest. Voice can still discuss the video from its ontology entry and transcript when available.</p>
    </section>`;
}

function hubBadge(transcript) {
  const conceptCount = transcript && transcript.matched ? transcript.matched.length : 0;
  if (conceptCount) {
    return `<span class="badge">${conceptCount} concepts</span>`;
  }
  return `<span class="badge muted">Curated links</span>`;
}

function youtubeEmbedId(url) {
  if (!url) return null;
  const match = String(url).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

function renderPlayer(video) {
  const ytId = youtubeEmbedId(video.youtube);
  if (ytId) {
    return `<div class="player">
      <iframe src="https://www.youtube.com/embed/${ytId}" title="${escapeHtml(video.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
    <p class="watch-external"><a href="${escapeHtml(video.youtube)}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></p>`;
  }
  const poster = video.poster ? ` poster="${escapeHtml(video.poster)}"` : "";
  if (!video.src) {
    return `<p class="hint">No video source configured.</p>`;
  }
  return `<div class="player">
      <video controls playsinline preload="metadata"${poster}>
        <source src="${escapeHtml(video.src)}" type="video/mp4">
        Your browser does not support the video tag.
        <a href="${escapeHtml(video.src)}">Download video</a>
      </video>
    </div>`;
}

function buildVideoPage(video, transcript) {
  const title = escapeHtml(video.title);
  const speaker = video.speaker ? escapeHtml(video.speaker) : "";
  const date = video.date ? escapeHtml(video.date) : "";
  const meta = [speaker, date].filter(Boolean).join(" · ");
  const caption = video.caption ? `<p class="caption">${escapeHtml(video.caption)}</p>` : "";
  const credit = video.credit ? `<p class="credit">${escapeHtml(video.credit)}</p>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hybrid Intelligences — ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Serif:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
  <style>
${sharedStyles()}
    .player { width: 100%; aspect-ratio: 16 / 9; background: #000; border: 1px solid var(--border); overflow: hidden; }
    .player iframe, .player video { display: block; width: 100%; height: 100%; object-fit: contain; background: #000; border: 0; }
    .watch-external { margin: 0.65rem 0 0; font-family: "IBM Plex Mono", monospace; font-size: 0.78rem; }
    .caption { margin: 1rem 0 0; max-width: 42rem; font-size: 0.95rem; color: var(--muted); line-height: 1.55; }
    .credit { margin: 0.55rem 0 0; font-family: "IBM Plex Mono", monospace; font-size: 0.78rem; color: var(--muted); }
    .concepts { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
    .concepts h2 {
      margin: 0 0 0.5rem;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 400;
      font-size: 0.85rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--title);
    }
    .hint { margin: 0 0 1rem; font-size: 0.88rem; color: var(--muted); }
    .concept-list { display: flex; flex-wrap: wrap; gap: 0.45rem; }
    .concept-chip {
      display: inline-block;
      padding: 0.35rem 0.65rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      color: var(--link);
      background: var(--accent);
      text-decoration: none;
    }
    .concept-chip:hover { border-color: var(--title); text-decoration: none; }
    .talk-row { margin: 1.25rem 0 0; }
    .talk-link {
      display: inline-block;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.78rem;
      color: var(--link);
      text-decoration: none;
    }
    .talk-link:hover { text-decoration: underline; }
    .back { display: inline-block; margin-bottom: 1.25rem; font-family: "IBM Plex Mono", monospace; font-size: 0.78rem; }
    code { font-family: "IBM Plex Mono", monospace; font-size: 0.85em; }
  </style>
</head>
<body>
  <header>
    <div class="brand-row">
      <a class="site-logo" href="index.html" aria-label="Hybrid Intelligences home">
        <img src="logo.png" alt="Hybrid Intelligences">
      </a>
      <div class="brand-copy">
        <p class="eyebrow">Videos</p>
        <h1>${title}</h1>
        ${meta ? `<p class="meta">${meta}</p>` : ""}
      </div>
    </div>
    <div class="header-row">
${headerNav()}
    </div>
  </header>
  <main>
    <a class="back" href="videos.html">← All videos</a>
    ${renderPlayer(video)}
    ${caption}
    ${credit}
    ${renderConcepts(videoConcepts(video, transcript), video.id, voiceTalkHref(video))}
  </main>
  <footer class="page-foot">Hybrid Intelligences · University of Florida · ${title}</footer>
${themeScript()}
</body>
</html>
`;
}

function buildHub(videos) {
  const graph = buildNetworkGraphData(videos);
  const graphJson = JSON.stringify(graph).replace(/</g, "\\u003c");

  const cards = videos
    .map((v, index) => {
      const transcript = loadTranscript(v.transcript);
      const badge = hubBadge(transcript);
      const poster = v.poster
        ? `<img src="${escapeHtml(v.poster)}" width="1280" height="720" alt="" loading="${index === 0 ? "eager" : "lazy"}">`
        : `<span class="placeholder">Video</span>`;
      const meta = [v.speaker, v.date].filter(Boolean).map(escapeHtml).join(" · ");
      const talkHref = voiceTalkHref(v);
      const conceptStrip = renderCardConcepts(videoConcepts(v, transcript));
      const featured = videos.length <= 4 && index === 0 ? " featured" : "";
      const caption = v.caption
        ? `<p class="card-caption">${escapeHtml(v.caption)}</p>`
        : "";
      return `      <article class="card${featured}">
        <a class="card-main" href="video-${escapeHtml(v.id)}.html">
          <span class="shot">
            ${poster}
            <span class="play-ring" aria-hidden="true"></span>
          </span>
          <span class="copy">
            <span class="speaker-tag">${escapeHtml(v.speaker || "Video")}</span>
            ${badge}
            <h2>${escapeHtml(v.title)}</h2>
            <p class="meta-line">${meta}</p>
            ${caption}
          </span>
        </a>
        <div class="card-foot">
          <a class="talk-link" href="${escapeHtml(talkHref)}">Talk about this</a>
          ${conceptStrip}
        </div>
      </article>`;
    })
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hybrid Intelligences — Videos</title>
  <meta name="description" content="Video reels linked to the Hybrid Intelligences ontology.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
${sharedStyles()}
    :root {
      --net-hub: #f4c430;
      --net-video: #82c3ff;
      --net-concept: #4ec4c4;
      --net-edge: rgba(150, 158, 176, 0.35);
      --net-label: #e8eaef;
    }
    body.light-mode {
      --net-edge: rgba(50, 60, 78, 0.42);
      --net-label: #1c2433;
    }
    main.videos-main {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.75rem 1.5rem 3.5rem;
    }
    footer.page-foot { max-width: 72rem; }
    .lede {
      max-width: 44rem;
      margin: 1.1rem 0 1.75rem;
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--muted);
    }
    .lede p { margin: 0 0 0.5rem; }
    .section-head { margin-bottom: 0.75rem; }
    .section-head h2 {
      margin: 0 0 0.2rem;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 400;
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--title);
    }
    .section-head p {
      margin: 0;
      max-width: 44rem;
      font-size: 0.84rem;
      color: var(--muted);
      line-height: 1.42;
    }
    .network-section {
      margin-bottom: 2.5rem;
      padding: 0;
      border: none;
      background: transparent;
      border-radius: 0;
    }
    .network-wrap {
      position: relative;
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      background:
        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244, 196, 48, 0.06), transparent 60%),
        color-mix(in srgb, var(--panel) 92%, transparent);
    }
    header .network-intro {
      margin-top: 0.65rem;
      max-width: 36rem;
    }
    header .network-intro h2 {
      margin: 0 0 0.15rem;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 400;
      font-size: 0.78rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--title);
    }
    header .network-intro p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--muted);
      line-height: 1.35;
    }
    #videoNetworkCanvas {
      display: block;
      width: 100%;
      height: min(88vh, 920px);
      min-height: 640px;
    }
    .network-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem 1rem;
      padding: 0.5rem 1rem 0.65rem;
      border-top: 1px solid var(--border);
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.68rem;
      color: var(--muted);
    }
    .legend-item { display: inline-flex; align-items: center; gap: 0.4rem; }
    .legend-dot {
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-dot.hub { background: var(--net-hub); }
    .legend-dot.video {
      width: 1.15rem;
      height: 0.65rem;
      border-radius: 2px;
      background: var(--net-video);
    }
    .legend-dot.concept { background: var(--net-concept); }
    .legend-line.related {
      width: 1.15rem;
      height: 2px;
      background: var(--net-video);
      opacity: 0.55;
      flex-shrink: 0;
    }
    .reels-section { margin-top: 0.5rem; }
    .reels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
      gap: 1.35rem;
    }
    .card {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border);
      background: var(--panel);
      color: inherit;
      overflow: hidden;
      border-radius: 10px;
      transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
    }
    .card:hover {
      border-color: var(--title);
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
    }
    .card.featured {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    }
    @media (max-width: 720px) {
      .card.featured { grid-template-columns: 1fr; }
    }
    .card-main {
      display: flex;
      flex-direction: column;
      flex: 1;
      text-decoration: none;
      color: inherit;
      min-height: 0;
    }
    .card.featured .card-main { flex-direction: row; }
    @media (max-width: 720px) {
      .card.featured .card-main { flex-direction: column; }
    }
    .card-main:hover { text-decoration: none; }
    .card-foot {
      padding: 0.65rem 1.1rem 0.85rem;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }
    .card.featured .card-foot { grid-column: 1 / -1; }
    .card-foot .talk-link {
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      color: var(--link);
      text-decoration: none;
    }
    .card-foot .talk-link:hover { text-decoration: underline; }
    .card-concepts { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .card-concepts .concept-chip {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.62rem;
      color: var(--link);
      background: var(--accent);
      text-decoration: none;
    }
    .card-concepts .concept-chip:hover { border-color: var(--title); text-decoration: none; }
    .shot {
      display: block;
      position: relative;
      aspect-ratio: 16 / 9;
      background: #07080c;
      overflow: hidden;
      flex-shrink: 0;
    }
    .card.featured .shot {
      aspect-ratio: 16 / 9;
      flex: 1 1 52%;
      min-width: min(100%, 20rem);
      max-width: 36rem;
    }
    .shot img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.35s ease;
    }
    .card:hover .shot img { transform: scale(1.04); }
    .shot::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 45%, rgba(0, 0, 0, 0.55) 100%);
      pointer-events: none;
    }
    .play-ring {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 3rem;
      height: 3rem;
      margin: -1.5rem 0 0 -1.5rem;
      border: 2px solid rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      opacity: 0.85;
      transition: transform 0.2s, opacity 0.2s;
      pointer-events: none;
    }
    .play-ring::after {
      content: "";
      position: absolute;
      left: 1.15rem;
      top: 0.85rem;
      border-style: solid;
      border-width: 0.65rem 0 0.65rem 1rem;
      border-color: transparent transparent transparent rgba(255, 255, 255, 0.9);
    }
    .card:hover .play-ring { transform: scale(1.08); opacity: 1; }
    .shot .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.78rem;
      color: var(--muted);
    }
    .copy { padding: 1rem 1.15rem 1.15rem; display: flex; flex-direction: column; justify-content: center; }
    .speaker-tag {
      display: inline-block;
      margin-bottom: 0.5rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.62rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--title);
    }
    .badge {
      display: inline-block;
      margin-bottom: 0.45rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.65rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: var(--accent);
      color: var(--title);
    }
    .badge.muted { background: transparent; border: 1px solid var(--border); color: var(--muted); }
    .copy h2 {
      margin: 0 0 0.35rem;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 400;
      font-size: 0.92rem;
      line-height: 1.45;
      color: var(--text);
    }
    .meta-line {
      margin: 0;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      color: var(--muted);
    }
    .card-caption {
      margin: 0.65rem 0 0;
      font-size: 0.82rem;
      line-height: 1.55;
      color: var(--muted);
    }
    code { font-size: 0.9em; }
  </style>
</head>
<body>
  <header>
    <div class="brand-row">
      <a class="site-logo" href="index.html" aria-label="Hybrid Intelligences home">
        <img src="logo.png" alt="Hybrid Intelligences">
      </a>
      <div class="brand-copy">
        <p class="eyebrow">Videos</p>
        <h1>Videos</h1>
        <div class="network-intro">
          <h2 id="video-network-heading">Video network</h2>
          <p>Reels and ontology nodes — linked by shared concepts, drifting on elastic springs. Hover a thumbnail to enlarge. Click to open.</p>
        </div>
      </div>
    </div>
    <div class="header-row">
${headerNav()}
    </div>
  </header>
  <main class="videos-main">
    <section class="network-section" aria-labelledby="video-network-heading">
      <div class="network-wrap">
        <canvas id="videoNetworkCanvas" role="img" aria-label="Video network — reels linked to ontology concepts"></canvas>
        <div class="network-legend">
          <span class="legend-item"><span class="legend-dot hub"></span> Hub</span>
          <span class="legend-item"><span class="legend-dot video"></span> Reel · hover to enlarge</span>
          <span class="legend-item"><span class="legend-line related"></span> Shared concept</span>
          <span class="legend-item"><span class="legend-dot concept"></span> Ontology node</span>
        </div>
      </div>
    </section>

    <section class="reels-section" aria-labelledby="reels-heading">
      <div class="section-head">
        <h2 id="reels-heading">Reels</h2>
        <p>Watch, then use Voice to talk through what each reel contributes to the graph.</p>
      </div>
      <div class="reels-grid">
${cards}
      </div>
    </section>
  </main>
  <footer class="page-foot">Hybrid Intelligences · University of Florida · Videos</footer>
${themeScript()}
${networkVizScript(graphJson)}
</body>
</html>
`;
}

function main() {
  const { videos } = loadManifest();
  if (!videos || !videos.length) {
    console.error("videos.json has no entries.");
    process.exit(1);
  }

  fs.writeFileSync(path.join(ROOT, "videos.html"), buildHub(videos));
  console.log("Wrote videos.html");

  const conceptVideos = buildConceptVideosIndex(videos);
  fs.writeFileSync(
    path.join(ROOT, "concept-videos.json"),
    JSON.stringify({ generated: new Date().toISOString(), byConcept: conceptVideos }, null, 2)
  );
  console.log("Wrote concept-videos.json");

  syncVideoNetworkLabels(videos);
  syncVideoAuthorEdges(videos);

  for (const video of videos) {
    const transcript = loadTranscript(video.transcript);
    fs.writeFileSync(
      path.join(ROOT, `video-${video.id}.html`),
      buildVideoPage(video, transcript)
    );
    console.log(`Wrote video-${video.id}.html`);
  }

  const legacy = videos[0];
  fs.writeFileSync(
    path.join(ROOT, "video.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=video-${escapeHtml(legacy.id)}.html">
  <link rel="canonical" href="video-${escapeHtml(legacy.id)}.html">
  <title>Redirecting…</title>
</head>
<body><p><a href="video-${escapeHtml(legacy.id)}.html">Continue to video</a></p></body>
</html>`
  );
  console.log("Wrote video.html (redirect)");
}

main();
