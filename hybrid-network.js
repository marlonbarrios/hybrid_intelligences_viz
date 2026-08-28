// Hybrid Intelligences — Conceptual Network
// Radial layout with Dark / Light theme modes

const CATEGORY_META = {
  program:      { label: "Program",        ring: 0.09 },
  organization: { label: "Organizations",  ring: 0.16 },
  premise:      { label: "Framework",        ring: 0.23 },
  participant:  { label: "Participants",   ring: 0.30 },
  background:   { label: "Backgrounds",    ring: 0.37 },
  facilitator:  { label: "Facilitators",   ring: 0.44 },
  practice:     { label: "Practices",      ring: 0.51 },
  tension:      { label: "Tensions",       ring: 0.58 },
  quality:      { label: "Qualities",      ring: 0.65 },
  phenomenon:   { label: "Phenomena",      ring: 0.72 },
  domain:       { label: "Domains",        ring: 0.80 },
  framework:    { label: "Conceptual Models", ring: 0.87 },
  author:       { label: "Authors/Artists", ring: 0.95 },
};

const RING_ORDER = [
  "program", "organization", "premise", "participant", "background", "facilitator",
  "practice", "tension", "quality", "phenomenon", "domain", "framework", "author",
];

// Shared ring palette — identical in dark and light mode
const RING_COLORS = {
  premise:      [244, 196,  48],
  author:       [186, 168, 128],
  framework:    [ 78, 196, 196],
  quality:      [110, 198, 130],
  phenomenon:   [168, 140, 228],
  domain:       [228, 130, 148],
  practice:     [240, 158,  96],
  program:      [255, 178,  96],
  organization: [255, 140, 110],
  participant:  [255, 196, 140],
  background:   [220, 160, 170],
  facilitator:  [120, 178, 228],
  tension:      [130, 138, 158],
};

const THEMES = {
  dark: {
    label: "Dark",
    bg: [14, 16, 24],
    uiBar: [14, 16, 24, 235],
    panel: [18, 20, 30],
    nodeFill: [18, 20, 30],
    border: [50, 56, 72],
    title: [244, 196, 48],
    subtitle: [150, 158, 175],
    muted: [110, 118, 135],
    legendHead: [170, 178, 195],
    legendText: [145, 152, 168],
    panelTitle: [235, 238, 245],
    panelBody: [155, 163, 180],
    panelMuted: [100, 108, 125],
    toggleBg: [28, 32, 44],
    toggleActive: [244, 196, 48],
    toggleInactive: [100, 108, 125],
    ringLine: 28,
    ringLabel: 70,
    ringFill: [8, 12],
    outerRing: 24,
    pulse: [12, 30],
    edgeDim: 28,
    edgeDimHover: 4,
    edgeDimCategory: 4,
    edgeBase: [38, 52],
    edgeGlow: 28,
    edgeGlowHover: 55,
    edgeGlowCategory: 50,
    nodeDim: 65,
    labelDim: 75,
    labelDimHover: 18,
    labelDimCategory: 18,
    ringLineCategory: 8,
  },
  light: {
    label: "Light",
    bg: [255, 253, 248],
    uiBar: [255, 253, 248, 248],
    panel: [255, 255, 255],
    nodeFill: [255, 255, 255],
    border: [210, 214, 224],
    title: [168, 118, 12],
    subtitle: [80, 86, 102],
    muted: [120, 126, 142],
    legendHead: [60, 66, 82],
    legendText: [90, 96, 112],
    panelTitle: [28, 32, 42],
    panelBody: [70, 76, 92],
    panelMuted: [130, 136, 152],
    toggleBg: [245, 243, 238],
    toggleActive: [168, 118, 12],
    toggleInactive: [140, 146, 162],
    ringLine: 55,
    ringLabel: 130,
    ringFill: [14, 22],
    outerRing: 45,
    pulse: [20, 50],
    edgeDim: 35,
    edgeDimHover: 6,
    edgeDimCategory: 6,
    edgeBase: [48, 72],
    edgeGlow: 38,
    edgeGlowHover: 65,
    edgeGlowCategory: 60,
    nodeDim: 80,
    labelDim: 90,
    labelDimHover: 22,
    labelDimCategory: 22,
    ringLineCategory: 14,
  },
};

let themeMode = "dark";
let themeToggleBounds = { dark: null, light: null };
let hoveredCategory = null;
let selectedCategory = null;
let mouseOnLegend = false;
let hoveredLegendHeader = false;
let detailPanelLinks = [];
let uiLinks = [];
let mobileMenuOpen = false;
let mobileHits = [];

const MOBILE_BREAKPOINT = 720;
const PORTFOLIO_URL = "https://marlonbarrios.github.io/";
const HOME_URL = "index.html";
const ONTOLOGY_URL = "ontology.html";
const ESSAY1_URL = "essay.html";
const ESSAY2_URL = "essay-2.html";
const VIDEO_URL = "video.html";
const SCAN_QR_URL = "scan-qr.html";
const GITHUB_URL = "https://github.com/marlonbarrios/hybrid_intelligences_viz";
const PODCAST_URL = "podcast.html";
const VOICE_URL = "voice.html";
const IMAGE_URL = "image.html";
const DEEP_DIVE_URL = "deep-dive.html";
const SLIDES_URL = "slides.html";
const CANVAS_URL = "https://ufl.instructure.com/courses/574408";
const NOTEBOOK_LM_URL = "https://notebook.google.com/notebook/04fd1fb2-34c0-4f33-aac3-8917c51e1cf1?authuser=1&pli=1";
const SHOWCASE_URL = "showcase.html";
let animateMode = false;
let animateStep = 0;
let animateUntil = 0;
let animatePaused = false;
let animatePauseRemaining = 0;
let categoryDisplay = null;
let categoryPrev = null;
let categoryBlend = 1;

const ANIM_SEQUENCE = ["rings", ...RING_ORDER, "theme"];
const ANIM_HOLD_SEC = 5;
const THEME_CROSSFADE_SEC = 2.4;
const CATEGORY_FADE_RATE = 0.011;
const CATEGORY_FADE_OUT_RATE = 0.008;
const CATEGORY_FADE_OUT_POWER = 0.55;
const EDGE_WEIGHT_SCALE = 0.5;
const NODE_ALPHA_SCALE = 1.2;

function scaleNodeAlpha(a) {
  return min(255, a * NODE_ALPHA_SCALE);
}

let themeCrossfadeActive = false;
let themeCrossfadeFrom = "dark";
let themeCrossfadeTo = "light";
let themeCrossfadeStart = 0;

let audioCtx = null;

function isMobileLayout() {
  return typeof width === "number" && width > 0
    ? width < MOBILE_BREAKPOINT
    : (typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);
}

function mobileBarH() {
  return 92;
}

function mobileBottomH() {
  return 64;
}

function resetNetworkView() {
  animateMode = false;
  animateStep = 0;
  animateUntil = 0;
  animatePaused = false;
  animatePauseRemaining = 0;
  selected = null;
  hovered = null;
  dragging = null;
  relationLinger = null;
  relationLingerUntil = 0;
  selectedCategory = null;
  mobileMenuOpen = false;
  initGraph();
}

function mobilePlayLabel() {
  if (!animateMode) return "Play";
  if (animatePaused) return "Resume";
  return "Pause";
}

function handleMobilePlay() {
  ensureAudio();
  if (!animateMode) {
    toggleAnimate();
    return;
  }
  if (animatePaused) resumeAnimateFromHover();
  else pauseAnimateForHover();
}

function hitMobileAction(mx, my) {
  for (const hit of mobileHits) {
    if (mx >= hit.x && mx <= hit.x + hit.w && my >= hit.y && my <= hit.y + hit.h) {
      return hit;
    }
  }
  return null;
}

function pushMobileHit(id, x, y, w, h, meta = null) {
  mobileHits.push({ id, x, y, w, h, meta });
}

function ensureAudio() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  } catch (_) {}
  return audioCtx;
}

const RING_SOUNDS = {
  rings: {
    label: "Rings",
    hz: [98, 147, 196, 294],
    wave: "sine",
    detune: 14,
    brightness: 0.32,
    space: 0.62,
    warmth: 0.82,
    drift: 0.18,
    dur: 1.45,
    peak: 0.048,
    pan: [-0.55, 0.55],
  },
  program: {
    label: "Program",
    hz: [147, 185, 220],
    wave: "triangle",
    detune: 7,
    brightness: 0.42,
    space: 0.38,
    warmth: 0.9,
    drift: 0.28,
    dur: 1.22,
    peak: 0.052,
    pan: [-0.35, 0.45],
  },
  organization: {
    label: "Organizations",
    hz: [138, 174, 207, 277],
    wave: "triangle",
    detune: 8,
    brightness: 0.45,
    space: 0.4,
    warmth: 0.86,
    drift: 0.24,
    dur: 1.24,
    peak: 0.05,
    pan: [-0.4, 0.42],
  },
  participant: {
    label: "Participants",
    hz: [156, 196, 233, 294],
    wave: "sine",
    detune: 9,
    brightness: 0.5,
    space: 0.48,
    warmth: 0.8,
    drift: 0.22,
    dur: 1.26,
    peak: 0.05,
    pan: [-0.38, 0.48],
  },
  background: {
    label: "Backgrounds",
    hz: [147, 185, 220, 277],
    wave: "sine",
    detune: 8,
    brightness: 0.52,
    space: 0.46,
    warmth: 0.72,
    drift: 0.2,
    dur: 1.24,
    peak: 0.05,
    pan: [-0.36, 0.5],
  },
  premise: {
    label: "Framework",
    hz: [131, 165, 262],
    wave: "sine",
    detune: 9,
    brightness: 0.48,
    space: 0.44,
    warmth: 0.78,
    drift: 0.22,
    dur: 1.28,
    peak: 0.05,
    pan: [-0.5, 0.35],
  },
  framework: {
    label: "Conceptual Models",
    hz: [175, 220, 349, 440],
    wave: "sine",
    detune: 5,
    brightness: 0.68,
    space: 0.5,
    warmth: 0.52,
    drift: 0.14,
    dur: 1.18,
    peak: 0.048,
    pan: [-0.25, 0.55],
  },
  tension: {
    label: "Tensions",
    hz: [103, 110, 155],
    wave: "triangle",
    detune: 19,
    brightness: 0.28,
    space: 0.58,
    warmth: 0.38,
    drift: 0.1,
    dissonance: 1.059,
    dur: 1.35,
    peak: 0.046,
    pan: [-0.65, 0.15],
  },
  quality: {
    label: "Qualities",
    hz: [165, 208, 247, 330],
    wave: "triangle",
    detune: 8,
    brightness: 0.52,
    space: 0.42,
    warmth: 0.84,
    drift: 0.26,
    dur: 1.24,
    peak: 0.051,
    pan: [-0.4, 0.5],
  },
  phenomenon: {
    label: "Phenomena",
    hz: [196, 247, 311, 392],
    wave: "sine",
    detune: 16,
    brightness: 0.62,
    space: 0.7,
    warmth: 0.55,
    drift: 0.16,
    dur: 1.38,
    peak: 0.049,
    pan: [-0.6, 0.6],
  },
  domain: {
    label: "Domains",
    hz: [155, 196, 233, 311],
    wave: "triangle",
    detune: 10,
    brightness: 0.46,
    space: 0.46,
    warmth: 0.76,
    drift: 0.24,
    dur: 1.26,
    peak: 0.05,
    pan: [-0.45, 0.4],
  },
  practice: {
    label: "Practices",
    hz: [174, 220, 262],
    wave: "sine",
    detune: 6,
    brightness: 0.5,
    space: 0.36,
    warmth: 0.8,
    drift: 0.38,
    dur: 1.2,
    peak: 0.053,
    pan: [-0.3, 0.55],
  },
  author: {
    label: "Authors/Artists",
    hz: [123, 155, 196, 247],
    wave: "triangle",
    detune: 4,
    brightness: 0.36,
    space: 0.34,
    warmth: 0.88,
    drift: 0.2,
    dur: 1.32,
    peak: 0.047,
    pan: [-0.55, 0.25],
  },
  facilitator: {
    label: "Facilitators",
    hz: [220, 277, 349, 440],
    wave: "sine",
    detune: 12,
    brightness: 0.74,
    space: 0.72,
    warmth: 0.48,
    drift: 0.12,
    dur: 1.4,
    peak: 0.048,
    pan: [-0.2, 0.72],
  },
  theme: {
    label: "Theme",
    hz: [110, 165, 220, 330],
    wave: "sine",
    detune: 6,
    brightness: 0.55,
    space: 0.78,
    warmth: 0.65,
    drift: 0.16,
    dur: 2.2,
    peak: 0.044,
    pan: [-0.72, 0.72],
  },
};

function playSwish(phase) {
  const ctx = ensureAudio();
  if (!ctx) return;

  const profile = RING_SOUNDS[phase] || RING_SOUNDS.rings;
  const now = ctx.currentTime;
  const dur = profile.dur;
  const peak = profile.peak;
  const stopAt = now + dur + 0.12;

  const master = ctx.createGain();
  master.gain.value = 0.92;
  master.connect(ctx.destination);

  const air = ctx.createBiquadFilter();
  air.type = "lowpass";
  air.frequency.setValueAtTime(900 + profile.brightness * 2200, now);
  air.frequency.linearRampToValueAtTime(520 + profile.warmth * 400, now + dur);
  air.Q.value = 0.6;
  air.connect(master);

  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(profile.pan[0], now);
  panner.pan.linearRampToValueAtTime((profile.pan[0] + profile.pan[1]) * 0.5, now + dur * 0.55);
  panner.pan.linearRampToValueAtTime(profile.pan[1], now + dur);
  panner.connect(air);

  const mix = ctx.createGain();
  mix.gain.value = 1;
  mix.connect(panner);

  const delayA = ctx.createDelay(0.6);
  delayA.delayTime.value = 0.19 + profile.space * 0.14;
  const delayAGain = ctx.createGain();
  delayAGain.gain.value = 0.22 + profile.space * 0.18;
  mix.connect(delayA);
  delayA.connect(delayAGain);
  delayAGain.connect(panner);

  const delayB = ctx.createDelay(0.9);
  delayB.delayTime.value = 0.34 + profile.space * 0.22;
  const delayBGain = ctx.createGain();
  delayBGain.gain.value = 0.12 + profile.space * 0.14;
  mix.connect(delayB);
  delayB.connect(delayBGain);
  delayBGain.connect(panner);

  function ambientEnvelope(gainNode, attack, sustainAt, sustainLevel, releaseStart) {
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(peak * sustainLevel, now + attack);
    gainNode.gain.setValueAtTime(peak * sustainLevel * 0.82, now + dur * sustainAt);
    gainNode.gain.setValueAtTime(peak * sustainLevel * 0.55, now + dur * releaseStart);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  }

  const padGain = ctx.createGain();
  padGain.connect(mix);
  ambientEnvelope(padGain, 0.22, 0.42, 1, 0.72);

  const oscs = [];
  profile.hz.forEach((hz, i) => {
    const osc = ctx.createOscillator();
    osc.type = profile.wave;
    const drift = 1 + (i - (profile.hz.length - 1) * 0.5) * profile.drift * 0.015;
    osc.frequency.setValueAtTime(hz * drift, now);
    osc.frequency.linearRampToValueAtTime(hz * drift * 1.012, now + dur * 0.5);
    osc.frequency.linearRampToValueAtTime(hz * 0.992, now + dur);
    osc.detune.value = (i % 2 === 0 ? 1 : -1) * profile.detune;

    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = "lowpass";
    toneFilter.frequency.value = 680 + profile.brightness * 1800;
    toneFilter.Q.value = 0.4;

    const toneGain = ctx.createGain();
    toneGain.gain.value = 0.55 / profile.hz.length;
    osc.connect(toneFilter);
    toneFilter.connect(toneGain);
    toneGain.connect(padGain);
    oscs.push(osc);
  });

  if (profile.dissonance) {
    const dis = ctx.createOscillator();
    dis.type = "sine";
    dis.frequency.value = profile.hz[0] * profile.dissonance;
    dis.detune.value = -profile.detune * 0.6;
    const disGain = ctx.createGain();
    ambientEnvelope(disGain, 0.28, 0.38, 0.35, 0.68);
    dis.connect(disGain);
    disGain.connect(padGain);
    dis.start(now);
    dis.stop(stopAt);
  }

  const bedLen = Math.floor(ctx.sampleRate * dur);
  const bed = ctx.createBuffer(1, bedLen, ctx.sampleRate);
  const bedCh = bed.getChannelData(0);
  for (let i = 0; i < bedLen; i++) {
    bedCh[i] = Math.random() * 2 - 1;
  }
  const bedSrc = ctx.createBufferSource();
  bedSrc.buffer = bed;
  const bedFilter = ctx.createBiquadFilter();
  bedFilter.type = "bandpass";
  bedFilter.frequency.setValueAtTime(180 + profile.warmth * 120, now);
  bedFilter.frequency.linearRampToValueAtTime(420 + profile.brightness * 900, now + dur * 0.45);
  bedFilter.frequency.linearRampToValueAtTime(160 + profile.warmth * 80, now + dur);
  bedFilter.Q.value = 0.45;
  const bedGain = ctx.createGain();
  ambientEnvelope(bedGain, 0.35, 0.5, 0.28, 0.78);
  bedSrc.connect(bedFilter);
  bedFilter.connect(bedGain);
  bedGain.connect(mix);
  bedSrc.start(now);
  bedSrc.stop(stopAt);

  const bloom = ctx.createOscillator();
  bloom.type = "sine";
  bloom.frequency.setValueAtTime(profile.hz[profile.hz.length - 1] * 0.5, now + dur * 0.08);
  bloom.frequency.exponentialRampToValueAtTime(profile.hz[0] * 2.2, now + dur * 0.55);
  bloom.frequency.exponentialRampToValueAtTime(profile.hz[0], now + dur);
  const bloomGain = ctx.createGain();
  bloomGain.gain.setValueAtTime(0.0001, now + dur * 0.06);
  bloomGain.gain.exponentialRampToValueAtTime(peak * 0.22, now + dur * 0.28);
  bloomGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  bloom.connect(bloomGain);
  bloomGain.connect(mix);
  bloom.start(now + dur * 0.06);
  bloom.stop(stopAt);

  for (const osc of oscs) {
    osc.start(now);
    osc.stop(stopAt);
  }
}

const NODES = [
  { id: "coupling",           label: "Intelligence\nas Coupling",     cat: "premise",    weight: 2.2,
    desc: "Intelligence is not located in a skull or machine—it is a relational event happening through bodies, tools, architectures, and co-presence.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "hybrid",             label: "Hybrid\nIntelligences",         cat: "premise",    weight: 2.0,
    desc: "Assemblages of biological, technical, social, spatial, legal, and affective processes that co-produce cognition.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "creative_embodiment", label: "Creative\nEmbodiment",       cat: "premise",    weight: 1.9,
    desc: "The project's embodiment framework: AI-mediated creative process is already embodied, situated, and relational—not a body added after the fact. The artist designs conditions of encounter; prompt, model, interface, dataset, institution, and audience form a cognitive assemblage. Necessary epistemology: the body is where abstraction becomes consequential; space situates cognition; movement temporalizes thought.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "intelligence",       label: "Intelligence",                  cat: "premise",    weight: 1.9,
    desc: "The capacity to perceive, infer, learn, adapt, and act in relation to an environment—not a substance locked in a skull or chip, but a capacity enacted through coupling among bodies, tools, symbols, institutions, and ecologies.",
    url: "https://en.wikipedia.org/wiki/Intelligence", linkLabel: "Wikipedia ↗" },
  { id: "embodiment",         label: "Embodiment",                    cat: "premise",    weight: 1.8,
    desc: "The condition of being a living body in a world—mind, affect, and meaning arising through sensorimotor engagement rather than added to a disembodied processor.",
    url: "https://en.wikipedia.org/wiki/Embodied_cognition", linkLabel: "Wikipedia ↗" },
  { id: "body",               label: "Body",                          cat: "premise",    weight: 1.7,
    desc: "The lived organism—flesh, breath, gesture, and sensation—as the primary site where cognition, emotion, relation, and creative action become real and consequential.",
    url: "https://en.wikipedia.org/wiki/Human_body", linkLabel: "Wikipedia ↗" },
  { id: "hybrid_coupling",    label: "Hybrid",                        cat: "premise",    weight: 1.7,
    desc: "The mixing of biological, technical, social, and institutional processes within a single field of action—neither purely human nor purely machine, but co-produced across coupled agents, infrastructures, and ecologies.",
    url: "https://en.wikipedia.org/wiki/Hybrid", linkLabel: "Wikipedia ↗" },
  { id: "assemblage",         label: "Cognitive\nAssemblages",        cat: "premise",    weight: 2.05,
    desc: "N. Katherine Hayles: cognition as interpretation of information within contexts that connect it with meaning—networked arrangements in which human and nonhuman cognizers exchange, process, select, and transform information, producing emergent meaning and action. Intelligence does not belong to one sovereign subject; it circulates through bodies, sensors, interfaces, datasets, institutions, and environments.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "assemblage_form",    label: "Assemblage",                    cat: "premise",    weight: 1.85,
    desc: "A composition of heterogeneous parts—bodies, tools, institutions, laws, media, atmospheres—whose relations co-produce capacities and meaning. Not a collection of fixed objects, but a dynamic arrangement; related to Hayles’s cognitive assemblages and to broader assemblage thinking (Latour, Deleuze & Guattari).",
    url: "https://en.wikipedia.org/wiki/Assemblage_(philosophy)", linkLabel: "Wikipedia ↗" },
  { id: "technosymbiosis",    label: "Techno-symbiosis",              cat: "premise",    weight: 1.95,
    desc: "N. Katherine Hayles: human futures with nonhuman symbionts—biological, technical, and mixed couplings that co-evolve across substrates, institutions, and AI systems. Techno-symbiosis names interdependence without sameness: humans and machines do not collapse into one another, yet their metabolisms of information, energy, and action become mutually constitutive.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "cognition",          label: "Cognition",                     cat: "premise",    weight: 1.95,
    desc: "Processes of knowing, perceiving, remembering, imagining, and deciding—historically located in brains, now understood as spanning bodies, environments, tools, and collectives. In this program, cognition is a world-involving practice, not an abstract operation floating above situation.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "4e",                 label: "4E Cognition",                  cat: "premise",    weight: 2.0,
    desc: "Embodied cognition as four coupled claims: Embodied (depends on sensorimotor capacities of living bodies), Embedded (emerges within environments that constrain and enable action), Enacted (organisms bring forth meaningful worlds through interaction histories), and Extended (tools, inscriptions, devices, media, and social structures can participate in cognitive processes). Challenges the classical image of mind as internal representation in a brain-computer.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },

  { id: "creativity",         label: "Creativity",                    cat: "framework",  weight: 1.8,
    desc: "Margaret Boden: an idea or artifact counts as creative only when it is both novel (surprising, not obvious or routine) and valuable (worthwhile in its domain—useful, interesting, beautiful, or apt). She distinguishes combinational creativity (new combinations of familiar elements), exploratory creativity (moving within a structured conceptual space), and transformational creativity (altering the space's rules or dimensions).",
    url: "https://en.wikipedia.org/wiki/Creativity", linkLabel: "Wikipedia ↗" },
  { id: "enactivism",         label: "Enactivism",                    cat: "framework",  weight: 1.7,
    desc: "Organisms bring forth meaningful worlds through histories of interaction; cognition and world are co-emergent. Rooted in Maturana and Varela’s autopoiesis: a living system first produces itself, then a world of significance.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "autopoiesis",        label: "Autopoiesis",                   cat: "framework",  weight: 1.65,
    desc: "Humberto Maturana and Francisco Varela: living systems as networks that continually produce and regenerate the components and boundaries that constitute them. An autopoietic unity is operationally closed—it specifies its own organization—yet structurally coupled with a medium. Cognition, in this biology of knowing, is the effective conduct of a living system in its world, not representation of a pre-given environment. Autopoiesis is the biological root of enactivism: organisms bring forth worlds because they first bring forth themselves.",
    url: "https://en.wikipedia.org/wiki/Autopoiesis", linkLabel: "Wikipedia ↗" },
  { id: "buddhism",           label: "Buddhism",                      cat: "framework",  weight: 1.5,
    desc: "Tradition of practice and philosophy centered on suffering, interdependence, impermanence, and liberation—mindfulness, emptiness (śūnyatā), and non-self (anattā) as frameworks for understanding cognition, ethics, and embodied experience; foundational for enactivism via phenomenology and contemplative science. Vipassana (insight) is a core method of this tradition: first-person training of attention that later informed Varela’s neurophenomenology.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "active_inference",   label: "Active\nInference",             cat: "framework",  weight: 1.5,
    desc: "Karl Friston's framework—perception, action, and planning as Bayesian inference minimizing free energy; minds predict and act to reduce surprise through embodied coupling with the world." },
  { id: "extended",           label: "Extended Mind",                 cat: "framework",  weight: 1.4,
    desc: "Cognitive processes include tools, inscriptions, devices, media, and social structures beyond the organism.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "cyborg",             label: "Natural-Born\nCyborg",          cat: "framework",  weight: 1.5,
    desc: "Clark: humans have always been technologically plastic, incorporating tools into the fabric of thought.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "cyberfeminism",      label: "Cyber-\nfeminism",              cat: "framework",  weight: 1.4,
    desc: "Feminist critique and practice at the intersection of gender, technology, and cyberspace—from 1990s net activism through Haraway's cyborg politics to contemporary feminist AI critique; technologies are never neutral, and liberation requires reworking gender, labor, and embodiment in digital infrastructures.",
    url: "https://en.wikipedia.org/wiki/Cyberfeminism", linkLabel: "Wikipedia ↗" },
  { id: "queer_theory",       label: "Queer\nTheory",                 cat: "framework",  weight: 1.4,
    desc: "Critical framework questioning normative categories of gender, sexuality, and identity—drawing on Foucault, Sedgwick, and Muñoz to analyze how power produces the 'normal,' open performative accounts of subjectivity, and orient imagination toward queer futurity and world-making beyond heteronormative scripts.",
    url: "https://en.wikipedia.org/wiki/Queer_theory", linkLabel: "Wikipedia ↗" },
  { id: "possible_minds",     label: "Space of\nPossible Minds",      cat: "framework",  weight: 1.4,
    desc: "Intelligence as a vast landscape of cognitive organizations—not a ladder with humans at the top.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "holobiont",          label: "Holobiont",                     cat: "framework",  weight: 1.5,
    desc: "A host organism together with its associated microorganisms as a functional unit—evolution, metabolism, immunity, and behavior distributed across symbiotic partners. A biological framework for hybrid life: the individual is already an ecology.",
    url: "https://en.wikipedia.org/wiki/Holobiont", linkLabel: "Wikipedia ↗" },
  { id: "affordances",        label: "Affordances",                   cat: "framework",  weight: 1.5,
    desc: "Gibson: environments offer possibilities for action—what a situation allows, invites, or constrains for a particular organism or assemblage.",
    url: "essay-2.html", linkLabel: "Read Essay 2 →" },
  { id: "umwelt",             label: "Umwelt",                        cat: "framework",  weight: 1.4,
    desc: "von Uexküll: the organism's lived meaningful environment—the world as selectively enacted through sensing, action, and coupling, not a pre-given objective space.",
    url: "essay-2.html", linkLabel: "Read Essay 2 →" },

  { id: "ai",                 label: "Artificial\nIntelligence",      cat: "framework",  weight: 1.8,
    desc: "Computational systems that infer, classify, generate, and act within human-designed environments—participants in cognitive assemblages, not minds in boxes.",
    url: "https://en.wikipedia.org/wiki/Artificial_intelligence", linkLabel: "Wikipedia ↗" },
  { id: "machine_learning",   label: "Machine\nLearning",            cat: "framework",  weight: 1.7,
    desc: "Algorithms that learn patterns from data to infer, classify, predict, and generate—training models on examples rather than hand-coded rules; the core computational paradigm behind contemporary AI systems and hybrid couplings.",
    url: "https://en.wikipedia.org/wiki/Machine_learning", linkLabel: "Wikipedia ↗" },
  { id: "neural_networks",    label: "Neural\nNetworks",              cat: "framework",  weight: 1.7,
    desc: "Layered computational models of interconnected units that transform inputs through weighted connections and nonlinear activation—architectures that learn distributed representations and underpin deep learning, language models, and generative systems.",
    url: "https://en.wikipedia.org/wiki/Neural_network_(machine_learning)", linkLabel: "Wikipedia ↗" },
  { id: "perceptron",         label: "Perceptron",                    cat: "framework",  weight: 1.4,
    desc: "Foundational unit of artificial neural networks—a weighted threshold classifier proposed by Frank Rosenblatt (1958); the historical bridge from cybernetics to modern machine learning.",
    url: "https://en.wikipedia.org/wiki/Perceptron", linkLabel: "Wikipedia ↗" },
  { id: "linear_transform",   label: "z = Wx + b",                     cat: "framework",  weight: 1.55,
    desc: "The affine transform at the heart of every dense layer: each output unit j computes zⱼ = Σᵢ wⱼᵢ xᵢ + bⱼ (matrix form z = Wx + b)—a weighted sum of inputs plus bias—before a nonlinear activation. The elementary operation of artificial neurons, shared by perceptrons, deep nets, and transformers.",
    url: "https://en.wikipedia.org/wiki/Artificial_neuron", linkLabel: "Wikipedia ↗" },
  { id: "rnn_update",         label: "σ(Wₓx + Wₕh + b)",               cat: "framework",  weight: 1.5,
    desc: "Recurrent update (and LSTM/GRU gate form): σ(Wₓxₜ + Wₕhₜ₋₁ + b)—combine current input xₜ with previous hidden state hₜ₋₁ through separate weight matrices, add bias, then apply nonlinearity σ. Memory through time via recurrence; the sequential counterpart to the feedforward affine layer z = Wx + b. Foundational for sequence modeling; largely succeeded for long context by transformers.",
    url: "https://en.wikipedia.org/wiki/Recurrent_neural_network", linkLabel: "Wikipedia ↗" },
  { id: "convolutional_networks", label: "Convolutional\nNeural Networks", cat: "framework", weight: 1.5,
    desc: "Neural architectures that learn spatial hierarchies through local receptive fields and shared weights—dominant in computer vision, image generation, and perceptual classification; central to how machines learn to see.",
    url: "https://en.wikipedia.org/wiki/Convolutional_neural_network", linkLabel: "Wikipedia ↗" },
  { id: "transformers",       label: "Transformers\n(Attention Is\nAll You Need)", cat: "framework", weight: 1.6,
    desc: "Vaswani et al. (2017)—architecture built on self-attention rather than recurrence, enabling parallel training and long-range dependency modeling; the foundation of modern language models, GPTs, and multimodal generative systems.",
    url: "https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)", linkLabel: "Wikipedia ↗" },
  { id: "gpt",                label: "GPTs",                          cat: "framework",  weight: 1.6,
    desc: "Generative Pre-trained Transformers—large models trained on vast text corpora then fine-tuned or prompted for downstream tasks; paradigmatic engines of generative AI, coupling human language with statistical prediction at scale.",
    url: "https://en.wikipedia.org/wiki/Generative_pre-trained_transformer", linkLabel: "Wikipedia ↗" },
  { id: "gen_ai",             label: "Generative\nAI",                cat: "framework",  weight: 1.7,
    desc: "Models that produce text, image, sound, code, and movement from learned patterns—extending imagination, abstraction, and co-creation across hybrid couplings.",
    url: "https://en.wikipedia.org/wiki/Generative_artificial_intelligence", linkLabel: "Wikipedia ↗" },
  { id: "creative_ai",        label: "Creative\nAI",                 cat: "framework",  weight: 1.6,
    desc: "AI in artistic, choreographic, architectural, and speculative practice—where prompts, interfaces, and institutions co-compose what can be made and felt." },
  { id: "llm",                label: "Large Language\nModels",        cat: "framework",  weight: 1.6,
    desc: "Language models at scale—statistical engines of prediction and paraphrase that mediate writing, reasoning, memory, and social coupling through text.",
    url: "essay-2.html", linkLabel: "Read Essay 2 →" },
  { id: "latent_space",       label: "Latent\nSpace",                 cat: "framework",  weight: 1.55,
    desc: "The high-dimensional continuous representation learned by neural models—where meanings, images, and trajectories live as coordinates and neighborhoods rather than symbols. A mathematical embedding that also functions as an ecological niche of possible meanings: navigable, generative, and co-constitutive of how models and humans couple through prompts, sampling, and interpretation.",
    url: "essay-2.html", linkLabel: "Read Essay 2 →" },
  { id: "agi",                label: "AGI",                           cat: "framework",  weight: 1.5,
    desc: "Artificial General Intelligence—hypothetical systems with flexible, domain-spanning capability; a horizon concept for comparing minds, agency, and coupling." },
  { id: "asi",                label: "ASI",                           cat: "framework",  weight: 1.4,
    desc: "Artificial Superintelligence—speculative systems exceeding human performance across domains; raises questions of scale, governance, and the space of possible minds." },
  { id: "ai_alignment",       label: "AI\nAlignment",                 cat: "framework",  weight: 1.5,
    desc: "Research and design for steering AI systems toward intended values and outcomes—raising questions of agency, governance, embodiment, and who defines the goals being aligned.",
    url: "https://en.wikipedia.org/wiki/AI_alignment", linkLabel: "Wikipedia ↗" },
  { id: "constitutional_ai",  label: "Constitutional\nAI",           cat: "framework",  weight: 1.4,
    desc: "Anthropic's training paradigm—models critique and revise their own outputs against explicit principles, scaling oversight and value alignment without purely human feedback at every step.",
    url: "https://www.anthropic.com/research/constitutional-ai", linkLabel: "Anthropic ↗" },
  { id: "ai_interpretability", label: "AI\nInterpretability",        cat: "framework",  weight: 1.5,
    desc: "Methods for explaining how AI systems represent, classify, and decide—making model behavior legible through features, attention, embeddings, and outputs; central to accountability, trust, epistemology, and the politics of what can be known about machine reasoning.",
    url: "https://en.wikipedia.org/wiki/Explainable_artificial_intelligence", linkLabel: "Wikipedia ↗" },
  { id: "model_introspection", label: "Model\nIntrospection",        cat: "framework",  weight: 1.5,
    desc: "The capacity of AI models to detect, report on, and sometimes control their own internal representations—studied through concept injection, activation monitoring, and self-report; functional yet often unreliable and context-dependent, distinct from confabulation (Anthropic, 2025).",
    url: "https://www.anthropic.com/research/introspection", linkLabel: "Anthropic research ↗" },
  { id: "alphago",            label: "AlphaGo",                       cat: "framework",  weight: 1.5,
    desc: "DeepMind system that mastered Go through deep neural networks and reinforcement learning—defeating world champion Lee Sedol (2016); a landmark in machine intuition, search, and the space of possible minds beyond explicit symbolic rules.",
    url: "https://en.wikipedia.org/wiki/AlphaGo", linkLabel: "Wikipedia ↗" },
  { id: "alphafold",          label: "AlphaFold",                     cat: "framework",  weight: 1.5,
    desc: "DeepMind protein structure prediction system—uses deep learning to infer 3D protein folds from amino acid sequences; transformed computational biology and exemplifies AI as instrument of scientific discovery at planetary scale.",
    url: "https://en.wikipedia.org/wiki/AlphaFold", linkLabel: "Wikipedia ↗" },
  { id: "three_es_ai",        label: "3 E's of\nAI Impact",           cat: "framework",  weight: 1.5,
    desc: "Kate Crawford’s notion of AI impact across three coupled registers: environmental (extraction, energy, water, ecologies), ethics (labor, bias, governance, harm), and epistemological (classification, knowledge, and what counts as real). These are not separate aftermaths of computation; they are how AI already organizes worlds.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "ai_impact_environment", label: "Environmental\n(AI Impact)", cat: "framework",  weight: 1.3,
    desc: "Kate Crawford: the environmental register of AI—material extraction, energy use, water, carbon, and ecological damage hidden behind seemingly immaterial computation." },
  { id: "ai_impact_ethics",   label: "Ethics\n(AI Impact)",          cat: "framework",  weight: 1.3,
    desc: "Kate Crawford: the ethical register of AI—labor conditions, surveillance, bias, accountability, and the distribution of benefit and harm across bodies and communities." },
  { id: "ai_impact_epistemic", label: "Epistemological\n(AI Impact)", cat: "framework",  weight: 1.3,
    desc: "Kate Crawford: the epistemological register of AI—how classification, datasets, and models organize perception, truth, memory, and what can be known or imagined." },
  { id: "epistemologies_south", label: "Epistemologies\nof the South", cat: "framework", weight: 1.5,
    desc: "Boaventura de Sousa Santos—framework for global cognitive justice against epistemicide: valuing suppressed knowledges of the global South through ecology of knowledges, sociology of absences and emergences, and intercultural translation." },
  { id: "technologies_of_self", label: "Technologies\nof the Self",    cat: "framework",  weight: 1.4,
    desc: "Michel Foucault—practices through which subjects work on their own bodies, thoughts, and conduct; ethics as self-formation rather than compliance, linking care, habit, and critical relation to power." },
  { id: "cybernetics",        label: "Cybernetics",                   cat: "framework",  weight: 1.5,
    desc: "Study of communication, feedback, and control in living and artificial systems—circular causality, regulation, and information flows across organisms, machines, and ecologies of mind; foundational for systems thinking, AI, and Gregory Bateson's ecology of mind.",
    url: "https://en.wikipedia.org/wiki/Cybernetics", linkLabel: "Wikipedia ↗" },
  { id: "systems_thinking",   label: "Systems\nThinking",             cat: "framework",  weight: 1.4,
    desc: "Approaching phenomena as interdependent wholes—relations, loops, and emergent patterns rather than isolated parts.",
    url: "https://en.wikipedia.org/wiki/Systems_thinking", linkLabel: "Wikipedia ↗" },
  { id: "complexity_theory",  label: "Complexity\nTheory",           cat: "framework",  weight: 1.4,
    desc: "Nonlinear dynamics, emergence, and self-organization—how complex systems generate order, adaptation, and unpredictability across scales.",
    url: "https://en.wikipedia.org/wiki/Complex_system", linkLabel: "Wikipedia ↗" },

  { id: "motion_bank",        label: "Motion\nBank",                   cat: "framework",  weight: 1.4,
    desc: "Forsythe Company's digital research platform—archiving, annotating, and analyzing movement to make choreographic intelligence legible across bodies, media, and computation.",
    url: "https://motionbank.org/", linkLabel: "Motion Bank ↗" },
  { id: "choreo_object",      label: "Choreographic\nObject",          cat: "framework",  weight: 1.5,
    desc: "Forsythe: a movement idea with its own consistency—transferable, analyzable, and co-present with dancers; choreography as object-oriented practice, not mere sequence." },

  { id: "clark",              label: "Andy Clark",                    cat: "author",     weight: 1.5,
    desc: "Extended mind, natural-born cyborgs, predictive processing—cognition as deeply entangled with body, world, and tools.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "hayles",             label: "Katherine\nHayles",             cat: "author",     weight: 1.4,
    desc: "Posthuman cognition, cognitive assemblages, technosymbiosis—the nonconscious and human-AI couplings.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "thompson",           label: "Evan\nThompson",                cat: "author",     weight: 1.3,
    desc: "Mind in Life and enactivism—extending autopoiesis from living organization to consciousness, bridging biology, phenomenology, and cognitive science.",
    url: "https://en.wikipedia.org/wiki/Evan_Thompson", linkLabel: "Wikipedia ↗" },
  { id: "maturana",           label: "Humberto\nMaturana",            cat: "author",     weight: 1.25,
    desc: "Chilean biologist—Autopoiesis and Cognition with Francisco Varela: living systems as self-producing, operationally closed unities that persist through structural coupling with a medium. A biology of knowing in which the observer, language, and cognition arise from the organization of life rather than from representation.",
    url: "https://en.wikipedia.org/wiki/Humberto_Maturana", linkLabel: "Wikipedia ↗" },
  { id: "varela",             label: "Francisco\nVarela",             cat: "author",     weight: 1.25,
    desc: "Chilean biologist and neuroscientist—autopoiesis with Humberto Maturana; The Embodied Mind with Thompson and Rosch: cognition as embodied action bringing forth a world of significance.",
    url: "https://en.wikipedia.org/wiki/Francisco_Varela", linkLabel: "Wikipedia ↗" },
  { id: "merleau_ponty",      label: "Maurice\nMerleau-Ponty",        cat: "author",     weight: 1.3,
    desc: "Phenomenologist—Phenomenology of Perception, the lived body (corps propre), motor intentionality, and being-in-the-world; foundational for enactivism, ecological perception, and embodied cognition through pre-reflective coupling of body and world.",
    url: "https://en.wikipedia.org/wiki/Maurice_Merleau-Ponty", linkLabel: "Wikipedia ↗" },
  { id: "margulis",           label: "Lynn\nMargulis",                cat: "author",     weight: 1.2,
    desc: "Symbiogenesis and endosymbiosis: evolution as cooperative merger across organisms.",
    url: "https://en.wikipedia.org/wiki/Lynn_Margulis", linkLabel: "Wikipedia ↗" },
  { id: "bateson",            label: "Gregory\nBateson",              cat: "author",     weight: 1.4,
    desc: "Anthropologist and cyberneticist—Steps to an Ecology of Mind, double bind, and the metapattern that connects; mind as distributed across organisms, cultures, and environments through communication, feedback, and relational learning.",
    url: "https://en.wikipedia.org/wiki/Gregory_Bateson", linkLabel: "Wikipedia ↗" },
  { id: "gibson",             label: "James J.\nGibson",              cat: "author",     weight: 1.2,
    desc: "Ecological perception and affordances—environment as active participant in cognition.",
    url: "https://en.wikipedia.org/wiki/James_J._Gibson", linkLabel: "Wikipedia ↗" },
  { id: "uexkuell",           label: "Jakob von\nUexküll",            cat: "author",     weight: 1.2,
    desc: "Originated Umwelt—the organism's self-world—as a biosemiotic framework for how living beings enact meaningful environments through perception and action.",
    url: "https://en.wikipedia.org/wiki/Jakob_Johann_von_Uexk%C3%BCll", linkLabel: "Wikipedia ↗" },
  { id: "gallagher",          label: "Shaun\nGallagher",              cat: "author",     weight: 1.1,
    desc: "How the body shapes the mind—embodiment, agency, and the structures of experience.",
    url: "https://en.wikipedia.org/wiki/Shaun_Gallagher", linkLabel: "Wikipedia ↗" },
  { id: "noe",                label: "Alva Noë",                      cat: "author",     weight: 1.1,
    desc: "Action in perception—perceiving as a way of acting, not internal picture-building.",
    url: "https://en.wikipedia.org/wiki/Alva_No%C3%AB", linkLabel: "Wikipedia ↗" },
  { id: "malafouris",         label: "Lambros\nMalafouris",           cat: "author",     weight: 1.1,
    desc: "Material engagement—things and tools as constitutive participants in cognitive life.",
    url: "https://en.wikipedia.org/wiki/Lambros_Malafouris", linkLabel: "Wikipedia ↗" },
  { id: "chalmers",           label: "David\nChalmers",               cat: "author",     weight: 1.1,
    desc: "The Extended Mind thesis—with Clark, argues cognitive processes can extend beyond the brain.",
    url: "https://en.wikipedia.org/wiki/David_Chalmers", linkLabel: "Wikipedia ↗" },
  { id: "de_jaegher",         label: "Hanne De\nJaegher",             cat: "author",     weight: 1.1,
    desc: "Participatory sense-making—social interaction as constitutive of cognition.",
    url: "https://en.wikipedia.org/wiki/Hanne_De_Jaegher", linkLabel: "Wikipedia ↗" },
  { id: "di_paolo",           label: "Ezequiel\nDi Paolo",            cat: "author",     weight: 1.1,
    desc: "Enactive agency and linguistic bodies—life, language, and adaptive coupling.",
    url: "https://en.wikipedia.org/wiki/Ezequiel_Di_Paolo", linkLabel: "Wikipedia ↗" },
  { id: "shanahan",           label: "Murray\nShanahan",              cat: "author",     weight: 1.1,
    desc: "The space of possible minds—mapping diverse cognitive organizations beyond human consciousness.",
    url: "https://en.wikipedia.org/wiki/Murray_Shanahan", linkLabel: "Wikipedia ↗" },
  { id: "boden",              label: "Margaret\nBoden",               cat: "author",     weight: 1.2,
    desc: "Philosopher and cognitive scientist—pioneer of AI and creativity studies; author of The Creative Mind, defining creativity as novelty plus value and mapping combinational, exploratory, and transformational forms across computational models, art, and the space of possible minds.",
    url: "https://en.wikipedia.org/wiki/Margaret_Boden", linkLabel: "Wikipedia ↗" },
  { id: "shapiro",            label: "Lawrence\nShapiro",             cat: "author",     weight: 1.0,
    desc: "Embodied cognition as a research program challenging brain-bound models of mind.",
    url: "https://en.wikipedia.org/wiki/Lawrence_Shapiro_(philosopher)", linkLabel: "Wikipedia ↗" },
  { id: "kirsh",              label: "David Kirsh",                   cat: "author",     weight: 1.0,
    desc: "Thinking with the body—distributed cognition through action, gesture, and environment.",
    url: "https://en.wikipedia.org/wiki/David_Kirsh", linkLabel: "Wikipedia ↗" },
  { id: "forsythe",           label: "William\nForsythe",              cat: "author",     weight: 1.2,
    desc: "Choreographer—choreographic objects, improvisational technologies, and Motion Bank; movement as knowledge and distributed cognition.",
    url: "https://en.wikipedia.org/wiki/William_Forsythe_(choreographer)", linkLabel: "Wikipedia ↗" },
  { id: "duchamp",            label: "Marcel\nDuchamp",                cat: "author",     weight: 1.2,
    desc: "Artist—readymades and conceptual art redefining authorship, choice, and the artwork as an assemblage of context, object, and institution.",
    url: "https://en.wikipedia.org/wiki/Marcel_Duchamp", linkLabel: "Wikipedia ↗" },
  { id: "cage",               label: "John\nCage",                    cat: "author",     weight: 1.2,
    desc: "Composer—chance operations, silence, and indeterminacy as methods for opening perception, collaboration, and the politics of listening.",
    url: "https://en.wikipedia.org/wiki/John_Cage", linkLabel: "Wikipedia ↗" },
  { id: "yoko_ono",           label: "Yoko\nOno",                     cat: "author",     weight: 1.1,
    desc: "Artist—instruction pieces, participation, and conceptual world-making that invite audiences into shared acts of imagination and care.",
    url: "https://en.wikipedia.org/wiki/Yoko_Ono", linkLabel: "Wikipedia ↗" },
  { id: "trisha_brown",       label: "Trisha\nBrown",                 cat: "author",     weight: 1.2,
    desc: "Choreographer—postmodern dance, task-based movement, and site-sensitive choreography; gravity, trust, and everyday motion as forms of thought.",
    url: "https://en.wikipedia.org/wiki/Trisha_Brown", linkLabel: "Wikipedia ↗" },
  { id: "steve_paxton",       label: "Steve\nPaxton",                 cat: "author",     weight: 1.2,
    desc: "Choreographer and dancer—inventor of contact improvisation and a central figure in postmodern dance; movement research grounded in ordinary motion, physical listening, weight-sharing, and the democratic intelligence of bodies in contact.",
    url: "https://en.wikipedia.org/wiki/Steve_Paxton", linkLabel: "Wikipedia ↗" },
  { id: "saul_leiter",        label: "Saul\nLeiter",                  cat: "author",     weight: 1.1,
    desc: "Photographer and painter—color street photography and painterly abstraction through windows, reflections, and urban atmosphere; everyday perception reframed as composition, mood, and embodied attention.",
    url: "https://en.wikipedia.org/wiki/Saul_Leiter", linkLabel: "Wikipedia ↗" },
  { id: "vera_molnar",        label: "Vera\nMolnár",                  cat: "author",     weight: 1.2,
    desc: "Pioneer of computer and generative art—algorithmic systems, geometric abstraction, and rule-based variation from the 1960s onward; a foundational figure linking computation, chance, and aesthetic exploration before contemporary AI art.",
    url: "https://en.wikipedia.org/wiki/Vera_Moln%C3%A1r", linkLabel: "Wikipedia ↗" },
  { id: "ana_mendieta",       label: "Ana\nMendieta",                 cat: "author",     weight: 1.2,
    desc: "Cuban-American artist—earth-body works, Siluetas, and performance merging body, land, ritual, and exile; feminist art that inscribes presence, memory, and identity into earth, blood, and fire as embodied world-making.",
    url: "https://en.wikipedia.org/wiki/Ana_Mendieta", linkLabel: "Wikipedia ↗" },
  { id: "leigh_bowery",       label: "Leigh\nBowery",                 cat: "author",     weight: 1.2,
    desc: "Performance artist, club impresario, and fashion provocateur—extravagant bodily transformation, queer nightlife, and the club as laboratory for identity, spectacle, and social choreography at the edges of art, fashion, and performance.",
    url: "https://en.wikipedia.org/wiki/Leigh_Bowery", linkLabel: "Wikipedia ↗" },
  { id: "carney",             label: "James Carney",                  cat: "author",     weight: 1.0,
    desc: "Review and synthesis of 4E cognition across evolutionary and cultural perspectives.",
    url: "https://en.wikipedia.org/wiki/Embodied_cognition", linkLabel: "Wikipedia ↗" },
  { id: "wilson",             label: "Robert A.\nWilson",             cat: "author",     weight: 1.0,
    desc: "Situated cognition—letting nature take its course across brain, body, and world.",
    url: "https://en.wikipedia.org/wiki/Robert_A._Wilson_(philosopher)", linkLabel: "Wikipedia ↗" },
  { id: "rosch",              label: "Eleanor\nRosch",                cat: "author",     weight: 1.0,
    desc: "The Embodied Mind—categorization, mindfulness, and the enactive approach to experience.",
    url: "https://en.wikipedia.org/wiki/Eleanor_Rosch", linkLabel: "Wikipedia ↗" },
  { id: "nagarjuna",          label: "Nāgārjuna",                     cat: "author",     weight: 1.2,
    desc: "Indian Buddhist philosopher—founder of Madhyamaka (Middle Way); argues that all phenomena are empty (śūnyatā) of inherent existence through dependent origination, dissolving fixed essences and opening a rigorous philosophy of interdependence for cognition, ethics, and contemporary theories of relation.",
    url: "https://en.wikipedia.org/wiki/Nagarjuna", linkLabel: "Wikipedia ↗" },
  { id: "cuffari",            label: "Elena Clare\nCuffari",          cat: "author",     weight: 1.0,
    desc: "Linguistic Bodies—the continuity between living bodies, language, and social coupling.",
    url: "https://en.wikipedia.org/wiki/Participatory_sense-making", linkLabel: "Wikipedia ↗" },
  { id: "akomolafe",          label: "Bayo\nAkomolafe",               cat: "author",     weight: 1.1,
    desc: "Postactivist philosopher and psychologist—fugitive thought, decolonizing knowledge, and posthuman relationality beyond fixed coordinates of victory and defeat.",
    url: "https://www.bayoakomolafe.net/", linkLabel: "Website ↗" },
  { id: "freire",             label: "Paulo\nFreire",                 cat: "author",     weight: 1.2,
    desc: "Critical pedagogy and dialogical education—conscientization, the critique of banking models of learning, and liberation through co-inquiry between teachers and learners.",
    url: "https://en.wikipedia.org/wiki/Paulo_Freire", linkLabel: "Wikipedia ↗" },
  { id: "braidotti",          label: "Rosi\nBraidotti",               cat: "author",     weight: 1.2,
    desc: "Posthuman feminist philosopher—nomadic subjects, new materialism, and critical posthumanities for rethinking embodiment, subjectivity, and knowledge beyond the humanist tradition.",
    url: "https://en.wikipedia.org/wiki/Rosi_Braidotti", linkLabel: "Wikipedia ↗" },
  { id: "haraway",            label: "Donna\nHaraway",                cat: "author",     weight: 1.3,
    desc: "Feminist technoscience—cyborg figurations, situated knowledges, and companion species; cognition and kinship as always partial, coupled, and worldly.",
    url: "https://en.wikipedia.org/wiki/Donna_Haraway", linkLabel: "Wikipedia ↗" },
  { id: "barad",              label: "Karen\nBarad",                  cat: "author",     weight: 1.2,
    desc: "Agential realism and intra-action—phenomena emerge through entangled material-discursive practices; knowing and being are mutually constituted.",
    url: "https://en.wikipedia.org/wiki/Karen_Barad", linkLabel: "Wikipedia ↗" },
  { id: "latour",             label: "Bruno\nLatour",                 cat: "author",     weight: 1.3,
    desc: "Sociologist and philosopher of science—actor-network theory, symmetry between human and nonhuman actors, and the study of how facts, technologies, and collectives are assembled through chains of translation; agency and cognition distributed across people, instruments, data, and institutions.",
    url: "https://en.wikipedia.org/wiki/Bruno_Latour", linkLabel: "Wikipedia ↗" },
  { id: "fanon",              label: "Frantz\nFanon",                 cat: "author",     weight: 1.2,
    desc: "Psychiatrist and philosopher of decolonization—embodied experience under colonialism, the politics of recognition, and liberation as a transformation of perception and social relation.",
    url: "https://en.wikipedia.org/wiki/Frantz_Fanon", linkLabel: "Wikipedia ↗" },
  { id: "bell_hooks",         label: "bell\nhooks",                   cat: "author",     weight: 1.2,
    desc: "Feminist cultural critic and educator—love, community, and pedagogy as practices of freedom; intersectional critique of domination across race, gender, and class.",
    url: "https://en.wikipedia.org/wiki/Bell_hooks", linkLabel: "Wikipedia ↗" },
  { id: "munoz",              label: "José Esteban\nMuñoz",           cat: "author",     weight: 1.2,
    desc: "Performance theorist—Cruising Utopia and queer futurity: utopia as a temporal horizon glimpsed in performance, collectivity, and aesthetic acts that refuse the tyranny of the present.",
    url: "https://en.wikipedia.org/wiki/Jos%C3%A9_Esteban_Mu%C3%B1oz", linkLabel: "Wikipedia ↗" },
  { id: "escobar",            label: "Arturo\nEscobar",               cat: "author",     weight: 1.2,
    desc: "Decolonial anthropologist—Designs for the Pluriverse; autonomía, territorial struggles, and alternatives to one-world modernity through situated design and communal world-making.",
    url: "https://en.wikipedia.org/wiki/Arturo_Escobar", linkLabel: "Wikipedia ↗" },
  { id: "crawford",           label: "Kate\nCrawford",                cat: "author",     weight: 1.3,
    desc: "Scholar of AI, politics, and culture—Atlas of AI. The three E’s of AI impact: environmental, ethics, and epistemological—extraction, labor, infrastructure, classification, and the material-ecological conditions of artificial intelligence.",
    url: "https://en.wikipedia.org/wiki/Kate_Crawford", linkLabel: "Wikipedia ↗" },
  { id: "aguilera_arcas",     label: "Blaise Agüera\ny Arcas",        cat: "author",     weight: 1.2,
    desc: "AI researcher and author of What Is Intelligence?—work on neural computing, active inference, federated learning, artificial life, and symbiotic models of mind linking evolution, sociality, and machine intelligence.",
    url: "https://en.wikipedia.org/wiki/Blaise_Ag%C3%BCera_y_Arcas", linkLabel: "Wikipedia ↗" },
  { id: "butler",             label: "Octavia\nButler",               cat: "author",     weight: 1.3,
    desc: "Science fiction writer—Afrofuturist worlds of adaptation, hierarchy, and survival; speculative storytelling that rehearses alternative futures through embodied, relational, and ecological imagination.",
    url: "https://en.wikipedia.org/wiki/Octavia_E._Butler", linkLabel: "Wikipedia ↗" },
  { id: "sousa_santos",       label: "Boaventura de\nSousa Santos",   cat: "author",     weight: 1.3,
    desc: "Sociologist and legal scholar—architect of Epistemologies of the South; argues that global social justice requires cognitive justice and the recovery of knowledges marginalized by colonialism and Eurocentrism.",
    url: "https://en.wikipedia.org/wiki/Boaventura_de_Sousa_Santos", linkLabel: "Wikipedia ↗" },
  { id: "foucault",           label: "Michel\nFoucault",              cat: "author",     weight: 1.3,
    desc: "Philosopher and historian of systems of thought—power/knowledge, biopolitics, and technologies of the self; how subjects, bodies, and institutions co-produce what can be seen, said, and lived.",
    url: "https://en.wikipedia.org/wiki/Michel_Foucault", linkLabel: "Wikipedia ↗" },
  { id: "brooks",             label: "Rodney\nBrooks",                cat: "author",     weight: 1.2,
    desc: "Roboticist and AI researcher—subsumption architecture and intelligence without representation; argues minds emerge through embodied action, perception, and coupling with the world rather than detached symbol processing.",
    url: "https://en.wikipedia.org/wiki/Rodney_Brooks", linkLabel: "Wikipedia ↗" },
  { id: "friston",            label: "Karl\nFriston",                 cat: "author",     weight: 1.2,
    desc: "Theoretical neuroscientist—architect of the free energy principle and active inference; frames brain, body, and behavior as variational Bayesian inference minimizing surprise.",
    url: "https://en.wikipedia.org/wiki/Karl_Friston", linkLabel: "Wikipedia ↗" },

  { id: "embodied",           label: "Embodied",                      cat: "quality",    weight: 1.3,
    desc: "Cognition depends on sensorimotor capacities of living bodies and their substrates." },
  { id: "embedded",           label: "Embedded",                      cat: "quality",    weight: 1.2,
    desc: "Cognition emerges within environments that constrain and enable action." },
  { id: "enacted",            label: "Enacted",                       cat: "quality",    weight: 1.2,
    desc: "Meaningful worlds are brought forth through interaction histories." },
  { id: "extended_q",         label: "Extended",                      cat: "quality",    weight: 1.2,
    desc: "Tools and structures beyond the body participate in cognitive processes." },
  { id: "critical",           label: "Critical\nCognition",         cat: "quality",    weight: 1.4,
    desc: "Every cognitive system filters what can be known, felt, and acted upon—shaped by power and infrastructure." },
  { id: "situated",           label: "Situated",                      cat: "quality",    weight: 1.4,
    desc: "Thinking always happens somewhere: in a body, room, platform, archive, or economy of attention." },
  { id: "distributed",        label: "Distributed\nAgency",         cat: "quality",    weight: 1.5,
    desc: "Agency circulates through relations among bodies, sensors, datasets, habits, and institutions." },
  { id: "technical_agency",   label: "Technical\nAgency",           cat: "quality",    weight: 1.4,
    desc: "Systems need not be conscious to sort, infer, classify, prioritize, and act within meaningful contexts." },

  { id: "ecology",            label: "Cognitive\nEcology",          cat: "phenomenon", weight: 1.6,
    desc: "AI becomes part of an expanded cognitive environment—prosthesis and weather, not merely instrument." },
  { id: "mediation",          label: "Cognitive\nMediation",        cat: "phenomenon", weight: 1.8,
    desc: "Mediation has become cognitive—tools now participate in perception, memory, imagination, decision, and future-making.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "coregulation",       label: "Co-regulation",                 cat: "phenomenon", weight: 1.3,
    desc: "Bodies co-regulate across human-human, human-machine, body-space, and body-law couplings." },
  { id: "abstraction",        label: "Abstraction",                   cat: "phenomenon", weight: 1.3,
    desc: "Not disembodiment but trained movement across scales—diagrams, models, scores intervene in the world." },
  { id: "perception_politics",label: "Politics of\nPerception",       cat: "phenomenon", weight: 1.4,
    desc: "AI helps organize what can appear as real, plausible, valuable, or actionable." },
  { id: "symbiosis",          label: "Symbiosis",                     cat: "phenomenon", weight: 1.5,
    desc: "Intimate co-constitution across organisms and systems—partnerships in which neither party remains unchanged." },
  { id: "community",          label: "Community",                     cat: "phenomenon", weight: 1.4,
    desc: "Shared life and mutual obligation—collective belonging formed through co-presence, care, dialogue, and the ongoing work of staying in relation." },
  { id: "judson_church",      label: "Judson\nChurch",                cat: "phenomenon", weight: 1.3,
    desc: "Judson Memorial Church and the Judson Dance Theater (1960s New York)—historic crucible of postmodern dance where everyday movement, task, improvisation, and interdisciplinary experiment overturned virtuosity and narrative; Paxton, Brown, Rainer, and peers rethought what choreography could be.",
    url: "https://en.wikipedia.org/wiki/Judson_Dance_Theater", linkLabel: "Wikipedia ↗" },
  { id: "social_change",      label: "Social\nChange",                cat: "phenomenon", weight: 1.4,
    desc: "Transformation of institutions, habits, and power—when critique, imagination, and collective action reshape what communities can know, feel, and become." },
  { id: "theory_of_mind",     label: "Theory\nof Mind",               cat: "phenomenon", weight: 1.4,
    desc: "The capacity to attribute mental states—beliefs, intentions, desires—to oneself and others; a phenomenon at stake in human social cognition, developmental learning, and debates over machine understanding." },
  { id: "cultural_imagination", label: "Cultural\nImagination",       cat: "quality",    weight: 1.4,
    desc: "The capacity to envision alternative worlds—stories, images, and practices through which communities rehearse futures and expand what seems possible." },
  { id: "futurity",           label: "Futurity",                      cat: "quality",    weight: 1.4,
    desc: "Orientation toward the not-yet—how present couplings, habits, and tools already carry and compose possible futures into being." },
  { id: "ethical_imagination", label: "Ethical\nImagination",         cat: "quality",    weight: 1.4,
    desc: "The capacity to feel and think otherwise about responsibility—imagining just couplings, accountable institutions, and livable futures beyond default moral frames." },
  { id: "pluriversal",        label: "Pluriversal",                   cat: "quality",    weight: 1.4,
    desc: "Many worlds in one world—knowledges, ecologies, and futures coexisting without a single universal center; a decolonial orientation toward multiplicity and situated world-making." },

  { id: "architecture",       label: "Architecture",                  cat: "domain",     weight: 1.5,
    desc: "Space actively choreographs cognition through affordances; platforms are architectures of attention and memory." },
  { id: "law",                label: "Law &\nGovernance",             cat: "domain",     weight: 1.3,
    desc: "Law choreographs what bodies and systems may do; governance must understand cognitive mediation." },
  { id: "intellectual_property", label: "Intellectual\nProperty",    cat: "domain",     weight: 1.3,
    desc: "Legal and cultural regimes of authorship, ownership, and access—who may create, copy, remix, and profit when cognition is distributed across humans, datasets, and machines.",
    url: "https://en.wikipedia.org/wiki/Intellectual_property", linkLabel: "Wikipedia ↗" },
  { id: "philosophy",         label: "Philosophy",                    cat: "domain",     weight: 1.2,
    desc: "Questions subjectivity, agency, abstraction, and world-making within hybrid couplings." },
  { id: "epistemology",       label: "Epistemology",                  cat: "domain",     weight: 1.3,
    desc: "The study of knowledge—how knowing happens, what counts as evidence, and how bodies, tools, institutions, and AI systems co-produce what can be thought and believed.",
    url: "https://en.wikipedia.org/wiki/Epistemology", linkLabel: "Wikipedia ↗" },
  { id: "consciousness",      label: "Consciousness",                 cat: "domain",     weight: 1.4,
    desc: "Subjective experience, awareness, and felt presence—phenomena at the center of philosophy of mind and open questions about biological, embodied, and possibly artificial forms of being." },
  { id: "synthetic_cognition", label: "Synthetic\nCognition",          cat: "domain",     weight: 1.4,
    desc: "Cognition engineered, simulated, or assembled through computational, robotic, and hybrid systems—where inference, perception, and action emerge from synthetic substrates coupled with human and institutional worlds." },
  { id: "physical_ai",        label: "Physical AI\n& Robotics",       cat: "domain",     weight: 1.4,
    desc: "Intelligence situated in bodies, sensors, and actuators—robots and embodied systems that perceive, move, and couple with environments rather than reasoning in abstraction alone." },
  { id: "cs",                 label: "Computer\nScience",            cat: "domain",     weight: 1.1,
    desc: "Technical systems as participants in cognitive assemblages, not neutral tools." },
  { id: "ai_ml",              label: "Artificial Intelligence/\nMachine Learning", cat: "domain", weight: 1.4,
    desc: "Computational learning, inference, and pattern recognition—models, datasets, and infrastructures that participate in perception, generation, and decision across hybrid couplings." },
  { id: "anthropic",          label: "Anthropic",                     cat: "domain",     weight: 1.3,
    desc: "AI research company—Claude, Constitutional AI, mechanistic interpretability, and emergent model introspection; foregrounds AI safety, alignment, and understanding internal model states through activation analysis, concept injection, and scalable oversight.",
    url: "https://www.anthropic.com/research", linkLabel: "Research ↗" },
  { id: "deepmind",           label: "Google\nDeepMind",              cat: "domain",     weight: 1.3,
    desc: "Google's AI research laboratory—pioneering deep reinforcement learning, game-playing systems, and scientific discovery; home of AlphaGo, AlphaFold, and foundational work on neural networks, attention, and general-purpose learning agents.",
    url: "https://deepmind.google/", linkLabel: "DeepMind ↗" },
  { id: "ecology_d",          label: "Ecology",                       cat: "domain",     weight: 1.1,
    desc: "Interdependence across biological and artificial substrates in shared cognitive ecosystems." },

  { id: "dance",              label: "Dance",                         cat: "domain",     weight: 1.4,
    desc: "The domain of dance—movement arts, bodily expression, performance, and choreographic cultures as fields of knowledge." },
  { id: "choreography_d",     label: "Choreography",                  cat: "domain",     weight: 1.4,
    desc: "The domain of choreography as an art form and field—histories, institutions, and cultures of organizing movement in time and space." },
  { id: "circus_arts",        label: "Circus Arts",                   cat: "domain",     weight: 1.3,
    desc: "Acrobatics, partner work, object manipulation, and ensemble circus—disciplines of timing, trust, and embodied coordination across bodies and apparatus." },
  { id: "music",              label: "Music",                         cat: "domain",     weight: 1.3,
    desc: "Sound, rhythm, and listening as cognitive and social practice—organizing attention, memory, and collective imagination." },
  { id: "storytelling",       label: "Storytelling",                  cat: "domain",     weight: 1.3,
    desc: "Narrative as a technology for sense-making—stories shape what can be remembered, felt, believed, and acted upon." },
  { id: "interdisciplinary_art", label: "Interdisciplinary\nArt",   cat: "domain",     weight: 1.4,
    desc: "Art that crosses disciplines—movement, sound, image, code, and institution woven into hybrid forms of inquiry." },
  { id: "generative_arts",    label: "Generative\nArts",              cat: "domain",     weight: 1.4,
    desc: "Art produced through systems with partial autonomy—algorithms, rules, chance, and computational processes that generate form, sound, movement, or image; spans pre-digital and digital practices and connects to generative AI as a contemporary extension of rule-based and learned creation.",
    url: "https://en.wikipedia.org/wiki/Generative_art", linkLabel: "Wikipedia ↗" },
  { id: "ai_art",             label: "AI Art",                        cat: "domain",     weight: 1.3,
    desc: "Art made with and through machine learning—human intention, dataset, model, and interface co-composing aesthetic outcomes." },
  { id: "pedagogy",           label: "Pedagogy",                      cat: "domain",     weight: 1.3,
    desc: "The art and science of teaching and learning—designing conditions where knowledge is co-produced through dialogue, embodiment, and critical reflection." },
  { id: "art_medicine",       label: "Art &\nMedicine",               cat: "domain",     weight: 1.4,
    desc: "Arts integrated with health and care—movement, sound, image, and presence as practices of healing, co-regulation, and meaning-making in clinical and community settings.",
    url: "https://arts.ufl.edu/programs-schools/center-for-arts-in-medicine/", linkLabel: "Center for Arts in Medicine ↗" },
  { id: "curation",           label: "Curation",                      cat: "domain",     weight: 1.3,
    desc: "Selecting, organizing, and contextualizing works, archives, and experiences—practices of care, framing, and public meaning-making across institutions and media." },
  { id: "speculative_futures", label: "Speculative\nFutures",         cat: "domain",     weight: 1.4,
    desc: "Methods and cultures of imagining alternative human–AI worlds—prototyping, storytelling, and embodied rehearsal as ways of thinking with what might yet come." },
  { id: "afrofuturism",       label: "Afrofuturism",                  cat: "domain",     weight: 1.4,
    desc: "Cultural and aesthetic movement weaving African diasporic histories with speculative technology, music, and narrative—imagining Black futures beyond colonial and technocratic frames." },
  { id: "fluxus",             label: "Fluxus",                        cat: "domain",     weight: 1.4,
    desc: "International avant-garde movement—intermedia art, event scores, anti-commercial ethos, and playful dissolution of boundaries between art and life; extends Cage, Ono, and Duchamp through participatory, instruction-based, and embodied experimentation.",
    url: "https://en.wikipedia.org/wiki/Fluxus", linkLabel: "Wikipedia ↗" },
  { id: "design_thinking",    label: "Design\nThinking",              cat: "domain",     weight: 1.3,
    desc: "Human-centered methods for framing problems and prototyping solutions—iteration, empathy, and material testing as ways of knowing through making.",
    url: "https://en.wikipedia.org/wiki/Design_thinking", linkLabel: "Wikipedia ↗" },
  { id: "entrepreneurship_vision", label: "Entrepreneurship &\nStrategic Vision", cat: "domain", weight: 1.4,
    desc: "Entrepreneurial imagination joined to long-range strategic vision—designing institutions, programs, and couplings that can sustain creative inquiry, migration, arts, and hybrid intelligence across scales of time and impact." },
  { id: "leadership",         label: "Leadership",                    cat: "premise",     weight: 1.5,
    desc: "The practice of orienting collective action—cultivating trust, direction, and conditions where others can think, feel, and create together. In this program: embodied presence, ethical imagination, and strategic vision inseparable from somatic awareness and hybrid coupling.",
    url: "https://en.wikipedia.org/wiki/Leadership", linkLabel: "Wikipedia ↗" },

  { id: "art",                label: "Art",                           cat: "practice",   weight: 1.4,
    desc: "Studio and speculative practice—futures rehearsed, staged, prototyped, felt, and contested through making." },
  { id: "choreography",       label: "Choreography",                  cat: "practice",   weight: 1.5,
    desc: "The compositional practice of organizing movement—structuring rhythm, spacing, and relation through studio work, task, rehearsal, and embodied decision-making. Thinking-through-making: gesture and timing are worked out in action, not only described afterward." },
  { id: "choreo_knowledge",   label: "Choreographic\nKnowledge",      cat: "practice",   weight: 1.5,
    desc: "The epistemic yield of choreography—what movement knows. Forsythe: intelligence enacted through alignment, spacing, and timing; knowledge held in bodies, scores, choreographic objects, and archives (Motion Bank) as much as in propositions. A form of distributed, enacted cognition legible across media and bodies." },
  { id: "somatics",           label: "Somatics",                      cat: "practice",   weight: 1.4,
    desc: "Practices of felt bodily awareness—noticing breath, tension, sensation, and co-regulation as ways of knowing; the body attended to as a site of intelligence, leadership presence, and creative decision-making in hybrid couplings.",
    url: "https://en.wikipedia.org/wiki/Somatics", linkLabel: "Wikipedia ↗" },
  { id: "vipassana",          label: "Vipassana",                     cat: "practice",   weight: 1.35,
    desc: "Buddhist contemplative practice of insight and mindfulness—disciplined attention to sensation, arising, and passing as a way of knowing. A practice-level tool supporting enactive and embodied approaches: first-person training of awareness rather than theory about mind from the outside. In Varela’s neurophenomenology, such practice becomes a method for coupling lived experience with the sciences of mind. In hybrid intelligence, Vipassana is also a literacy of coupling—sensing how attention is already assembled with body, tradition, room, and technical mediation.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "complexity",         label: "Conceptual\nComplexity",        cat: "practice",   weight: 1.3,
    desc: "Awareness of overlapping frameworks, scales, and couplings—holding multiplicity without collapsing ideas into false simplicity." },
  { id: "cultural_critical",  label: "Cultural Critical\nPerspective", cat: "practice", weight: 1.4,
    desc: "Reading hybrid intelligences through power, history, race, gender, labor, and institution—who benefits, who is excluded, what worlds are rehearsed." },
  { id: "juggling",           label: "Juggling",                      cat: "practice",   weight: 1.2,
    desc: "Model for hybrid cognition—training reflexes within coupling: trust, pause, verify, refuse, attune." },
  { id: "creative",           label: "Creative\nPractice",          cat: "practice",   weight: 1.4,
    desc: "Studio methods for hybrid coupling—designing prompts, interfaces, and encounters where human intention meets model, dataset, and institution as co-participants." },
  { id: "rehearsal",          label: "Embodied\nRehearsal",         cat: "practice",   weight: 1.3,
    desc: "Every interface is a small rehearsal of a world—futures enacted through present habits and tools." },
  { id: "literacies",         label: "Literacies\nof Coupling",     cat: "practice",   weight: 1.3,
    desc: "Sensory, technical, legal, spatial, poetic, and ethical skills for participating in expanded ecologies." },
  { id: "arch_design",        label: "Architecture &\nDesign",        cat: "practice",   weight: 1.45,
    desc: "Spatial and material practice—shaping rooms, interfaces, prototypes, and infrastructures that choreograph attention, movement, and encounter. Design here is not styling after the fact; it is composing conditions under which hybrid cognition can happen." },
  { id: "philosophical_practice", label: "Philosophical\nPractice", cat: "practice",   weight: 1.4,
    desc: "Philosophical thinking as a lived method—questioning concepts, testing distinctions, staying with ambivalence, and refining vocabulary through dialogue, reading, and writing. Not only a domain of theory, but a practice of inquiry that clarifies agency, embodiment, and world-making in the era of AI." },
  { id: "conversational_ai",  label: "Conversational\nAI",            cat: "practice",   weight: 1.55,
    desc: "The spoken companion for Hybrid Intelligences—a chatbot grounded in the program ontology. Voice is one layer of a hybrid dynamic knowledge architecture of concepts, essays, documentation, visualization, conversational AI, and program materials for embodied leadership and creativity in the era of AI. It explains concepts from their definitions and relations, can be interrupted, and opens from Talk about this on any node.",
    url: "voice.html", linkLabel: "Open Voice →" },
  { id: "pendular_umwelt",    label: "My Pendular\nUmwelt",           cat: "practice",   weight: 1.5,
    desc: "Speculative web work by Marlon Barrios Solano, developed during the open labs of the inaugural Hybrid Intelligences program, July 2026. GPT-4o writes from a proposed computational Umwelt and reads aloud; p5.js pendulums inscribe the words along branching trails — folds of speed and path that poetically stage a large language model’s possible world (a Latentwelt of tokens, embeddings, and continuations) rather than a still map. The work lets a model self-report an Umwelt while physics and type refuse to keep that speech still.",
    url: "showcase.html#pendular-umwelt", linkLabel: "Open in showcase →" },
  { id: "lobby_showcase",     label: "Lobby\nShowcase",               cat: "practice",   weight: 1.4,
    desc: "Works from Marlon Barrios Solano’s repertoire of AI pieces, gathered as the Showcase: My Pendular Umwelt (open labs) first, then the pieces shown on the large screen in the lobby of the Herbert Wertheim Laboratory during the inaugural Hybrid Intelligences program, July 2026. Selected as relevant to the program’s concepts and practices: coupling, embodiment, latent space, hybrid bodies, and language as a moving field. The stills open My Pendular Umwelt, All Watched Over By Machines of Loving Grace, Barely There, Wingspan, Proteans, and Semantic Tensegrities.",
    url: "showcase.html", linkLabel: "Open showcase →" },

  { id: "hi_program",         label: "Hybrid Intelligences\nProgram", cat: "program",  weight: 2.2,
    desc: "Hybrid Intelligences: Embodied Leadership and Creativity in the Era of AI — the inaugural University of Florida Creative B program, held July 13–30, 2026. It was co-led by Marlon Barrios Solano and Erika Moore; hosted by CAME and CAM in the College of the Arts, in partnership with IGNITE at the Wertheim Laboratory. It had three tracks: Space & Memory (Mondays), Future Lab (Wednesdays), and Ethics & Leadership (Thursdays), and closed with a public reception. The program treated intelligence as coupling across bodies, tools, institutions, and worlds, and rehearsed hybrid cognition through embodiment, ethics, and creative practice. Hybrid Intelligences remains an ongoing research framework. Its public site is a hybrid dynamic knowledge architecture of concepts, essays, documentation, visualization, conversational AI, and program materials.",
    url: "https://ufl.instructure.com/courses/574408", linkLabel: "Canvas course ↗" },
  { id: "track_space",        label: "Track 1\nSpace & Memory",       cat: "program",  weight: 1.5,
    desc: "Met Mondays 12:30–3:15 during the inaugural program (July 2026) — AI, space, memory, and embodiment. Jul 13: Karla Saldaña Ochoa · Jul 20: Onye Ozuzu · Jul 27: Corey Cheval." },
  { id: "track_future",       label: "Track 2\nFuture Lab",           cat: "program",  weight: 1.5,
    desc: "Met Wednesdays 5:30–7:30 during the inaugural program (July 2026) — speculation, prototyping, and imagining alternative human–AI futures. Jul 15: Jackie Larson · Jul 22: Andrew Hix · Jul 29: Turbado Marabou — with Erika Moore." },
  { id: "track_ethics",       label: "Track 3\nEthics & Leadership",  cat: "program",  weight: 1.5,
    desc: "Met Thursdays 12:30–3:15 during the inaugural program (July 2026) — AI ethics, authorship, law, and embodied leadership. Jul 16, 23, 30 with Erika Moore, Buckner, McNealy, White." },
  { id: "reception",          label: "Public\nReception",           cat: "program",  weight: 1.15,
    desc: "Thursday July 30, 2026 — public networking gathering that closed the inaugural program, sharing experiments and process-based outcomes with the campus and Gainesville community." },

  { id: "cota",               label: "College of\nthe Arts",          cat: "organization",  weight: 1.5,
    desc: "University of Florida College of the Arts (COA / COTA)—home college for Hybrid Intelligences; includes CAME and CAM among its centers and programs.",
    url: "https://arts.ufl.edu/", linkLabel: "UF College of the Arts ↗" },
  { id: "came",               label: "CAME",                          cat: "organization",  weight: 1.35,
    desc: "Center for Arts, Migration and Entrepreneurship — lead host of the inaugural Hybrid Intelligences program within the College of the Arts; entrepreneurship and strategic vision across arts, migration, and interdisciplinary innovation.",
    url: "https://arts.ufl.edu/came/", linkLabel: "CAME at UF ↗" },
  { id: "cam",                label: "CAM",                           cat: "organization",  weight: 1.35,
    desc: "Center for Arts in Medicine — within the College of the Arts; advancing education, research, and practice at the intersections of the arts and health.",
    url: "https://arts.ufl.edu/programs-schools/center-for-arts-in-medicine/", linkLabel: "Center for Arts in Medicine ↗" },
  { id: "ignite",             label: "IGNITE\nProgram",               cat: "organization",  weight: 1.3,
    desc: "Engineering Innovation Institute partnership that integrated innovation leadership into the inaugural program.",
    url: "https://www.eng.ufl.edu/innovation/", linkLabel: "IGNITE at UF ↗" },
  { id: "wertheim",           label: "Wertheim\nLaboratory",          cat: "organization",  weight: 1.3,
    desc: "Herbert Wertheim Laboratory for Engineering Excellence—Leadership Studio 370, where the inaugural program’s activities were held.",
    url: "https://www.eng.ufl.edu/wertheim/", linkLabel: "Wertheim Laboratory ↗" },
  { id: "gainesville_circus", label: "Gainesville\nCircus Center",    cat: "organization",  weight: 1.2,
    desc: "External partner organization for embodied circus practice—partner acrobatics, object manipulation, and ensemble training in community with Hybrid Intelligences.",
    url: "https://www.gainesvillecircus.com/", linkLabel: "Gainesville Circus Center ↗" },

  { id: "undergrad_participants", label: "Undergraduate\nStudents", cat: "participant", weight: 1.45,
    desc: "Undergraduate students in Art and Art History, Industrial Systems Engineering, Dance and Museum Studies, Computer Science, Industrial Systems and Political Science—bringing studio, engineering, and civic lenses into hybrid coupling." },
  { id: "grad_participants", label: "Graduate\nStudents",         cat: "participant", weight: 1.4,
    desc: "Graduate students in Human-Centered Computing, Art History, Chemical Engineering, Machine Learning and Health Outcomes—research and practice at the intersections of computation, culture, learning systems, and care." },
  { id: "staff_participants", label: "UF Staff",                  cat: "participant", weight: 1.3,
    desc: "Current and retired UF staff in Lighting Design, Nursing, Public Health and Dance Therapy—institutional knowledge meeting embodied and clinical practice." },
  { id: "community_participants", label: "Community &\nAlumni",   cat: "participant", weight: 1.35,
    desc: "Community members, alumnae and former faculty in IT, Digital Media and AI, Choreography and Film, Library Sciences and Digital Art—extending the program beyond campus into local and alumni ecologies." },

  { id: "bg_art_history",      label: "Art &\nArt History",           cat: "background", weight: 1.25,
    desc: "Background of undergraduate and graduate participants—studio practice, visual culture, and historical inquiry into art." },
  { id: "bg_ise",              label: "Industrial Systems\nEngineering", cat: "background", weight: 1.2,
    desc: "Undergraduate background—systems design, optimization, and socio-technical process across industrial and organizational settings." },
  { id: "bg_dance_museum",     label: "Dance &\nMuseum Studies",      cat: "background", weight: 1.2,
    desc: "Undergraduate background—embodied performance joined with curation, collections, and public cultural institutions." },
  { id: "bg_cs",               label: "Computer\nScience",            cat: "background", weight: 1.25,
    desc: "Undergraduate background—algorithms, systems, and computational thinking as a formative background distinct from the conceptual Domains ring." },
  { id: "bg_ise_polisci",      label: "Industrial Systems &\nPolitical Science", cat: "background", weight: 1.15,
    desc: "Undergraduate double lens—industrial systems with civic and political analysis of institutions, power, and public life." },
  { id: "bg_hcc",              label: "Human-Centered\nComputing",    cat: "background", weight: 1.25,
    desc: "Graduate background—interaction, usability, and computing designed around human practices, bodies, and contexts." },
  { id: "bg_chem_eng",         label: "Chemical\nEngineering",        cat: "background", weight: 1.15,
    desc: "Graduate background—process, materials, and molecular-scale engineering meeting hybrid cognition and care." },
  { id: "bg_ml",               label: "Machine\nLearning",            cat: "background", weight: 1.25,
    desc: "Graduate background—statistical learning and model-building as institutional training, linked to the Machine Learning framework concept." },
  { id: "bg_health_outcomes",  label: "Health\nOutcomes",             cat: "background", weight: 1.2,
    desc: "Graduate background—measuring and improving health, care pathways, and wellbeing at clinical and population scales." },
  { id: "bg_lighting",         label: "Lighting\nDesign",             cat: "background", weight: 1.15,
    desc: "UF staff background—theatrical and spatial light as compositional practice shaping attention, atmosphere, and stage ecology." },
  { id: "bg_nursing",          label: "Nursing",                      cat: "background", weight: 1.15,
    desc: "UF staff background—clinical care, embodiment, and relational knowledge in health systems." },
  { id: "bg_public_health",    label: "Public\nHealth",               cat: "background", weight: 1.15,
    desc: "UF staff background—population health, prevention, and community wellbeing beyond the individual clinic." },
  { id: "bg_dance_therapy",    label: "Dance\nTherapy",               cat: "background", weight: 1.15,
    desc: "UF staff background—dance/movement as therapeutic practice coupling body, psyche, and care." },
  { id: "bg_it",               label: "Information\nTechnology",      cat: "background", weight: 1.15,
    desc: "Community / alumni background—systems, networks, and infrastructure that keep institutions and media running." },
  { id: "bg_digital_media_ai", label: "Digital Media\n& AI",          cat: "background", weight: 1.2,
    desc: "Community / alumni background—digital media practice intersecting generative and machine-learning systems." },
  { id: "bg_choreo_film",      label: "Choreography\n& Film",         cat: "background", weight: 1.2,
    desc: "Community / alumni background—moving-image and choreographic composition across stage and screen." },
  { id: "bg_library",          label: "Library\nSciences",            cat: "background", weight: 1.15,
    desc: "Community / alumni background—archives, information organization, access, and cultural memory institutions." },
  { id: "bg_digital_art",      label: "Digital\nArt",                 cat: "background", weight: 1.2,
    desc: "Community / alumni background—art practice through code, screens, networks, and computational media." },

  { id: "marlon",             label: "Marlon Barrios\nSolano",        cat: "facilitator", weight: 1.6,
    desc: "Co-director of Hybrid Intelligences and Maker-in-Residence at CAME, focused on AI, arts, and diasporas. Venezuelan-American interdisciplinary artist, creative technologist, and researcher with a background in dance, software engineering, and cognitive science; MFA in Dance and Technology (Ohio State). Founder of dance-tech.net; work combines generative AI, creative coding, and performance. Certified in Vipassana/mindfulness (Spirit Rock), Embodyoga, and Somatic Experiencing.",
    url: "https://arts.ufl.edu/people/profiles/marlon-barrios-solano/", linkLabel: "Faculty profile ↗" },
  { id: "erika",              label: "Erika Moore",                   cat: "facilitator", weight: 1.4,
    desc: "Co-director of Hybrid Intelligences—Future Lab (Wednesdays) and Ethics & Leadership (Thursdays). Assistant Professor in UF’s Center for Arts in Medicine; educator, facilitator, and arts strategist with an MFA in Dance (Arizona State) and a B.S. in Nonprofit Leadership and Management. Classically trained dancer and certified Pilates instructor; research at the crossroads of arts, AI, human performance, and community engagement. Teaches arts in health and leads Moore Arts.",
    url: "https://arts.ufl.edu/people/profiles/erika-moore/", linkLabel: "Faculty profile ↗" },
  { id: "jackie_larson",      label: "Jackie Larson",                 cat: "facilitator", weight: 1.1,
    desc: "Wednesday July 15 — Future Lab: movement and mapping possible futures. Dancer in residence at UF Health Shands Arts in Medicine; head ballet instructor and former hospital nurse (UF Health and Haven Hospice). Trained at Ballet Florida and South Florida Ballet Academy; longtime Gainesville resident who returned to UF Health to combine dance, nursing, and arts in medicine as movement for healing, reflection, and connection.",
    url: "https://artsinmedicine.ufhealth.org/about/jackie-larson-dancer-in-residence/", linkLabel: "AIM profile ↗" },
  { id: "andrew_hix",         label: "Andrew Hix",                    cat: "facilitator", weight: 1.1,
    desc: "Wednesday July 22 — Future Lab: sound and listening. Writer, storyteller, and integrative therapies practitioner at UF Health Shands Arts in Medicine; licensed massage therapist who teaches tai chi, qigong, and mindfulness meditation to hospital patients. University of Florida graduate (2009) and Florida School of Massage (2011); co-principal investigator on integrative-medicine studies. Practices tai chi as a martial art; attention and listening as method.",
    url: "https://artsinmedicine.ufhealth.org/about/andrew-hix-lmt-tai-chiqigong-practitioner-massage-therapist/", linkLabel: "AIM profile ↗" },
  { id: "turbado_marabou",    label: "Turbado\nMarabou",               cat: "facilitator", weight: 1.1,
    desc: "Wednesday July 29 — Future Lab: themes, insights, and artifacts. Gainesville visual artist, muralist, folklorist, and educator; BFA (Florida A&M), MFA (University of Wisconsin–Madison), doctoral candidate in Arts Education (Florida State). Founder of Deeproots Arts & Culture Creative Services; more than three decades of Afrocentric cultural practice using visual and performing arts for storytelling, cultural preservation, and community empowerment across the African diaspora.",
    url: "https://www.deeprootscreate.com/", linkLabel: "Deep Roots ↗" },
  { id: "karla",              label: "Karla Saldaña\nOchoa",          cat: "facilitator", weight: 1.2,
    desc: "Monday July 13 — AI and architecture. Ecuadorian architect and Assistant Professor in UF’s School of Architecture; Master of Advanced Studies in Landscape Architecture and Ph.D. from ETH Zurich on integrating artificial and human intelligence for disaster response. Leads SHARE Lab, developing human-centered AI for architectural practice at building and urban scale.",
    url: "https://dcp.ufl.edu/faculties/karla-saldana-ochoa/", linkLabel: "Faculty profile ↗" },
  { id: "onye",               label: "Onye P.\nOzuzu",                cat: "facilitator", weight: 1.2,
    desc: "Monday July 20 — Choreography and memory. Dancer, choreographer, educator, and researcher; Professor in UF’s School of Theatre + Dance and former Dean of the College of the Arts (2018–2024). Work at the intersections of ritual, club, concert, and experimental movement, grounded in contemporary dance, West African dance and drumming, martial arts, yoga, salsa, and house. Recent project Space Carcasses investigates architecture, atmosphere, and African diaspora histories through site-responsive performance.",
    url: "https://arts.ufl.edu/people/profiles/onye-p-ozuzu/", linkLabel: "Faculty profile ↗" },
  { id: "cheval_bailie",      label: "Corey Cheval",                  cat: "facilitator", weight: 1.1,
    desc: "Monday July 27 — Partner acrobatics and object manipulation. Artist, educator, and entrepreneur; founder and executive director of Gainesville Circus Center. Ph.D. in Cultural Anthropology (University of Florida, 2015) and M.A. in Performance Studies (Federal University of Bahia, 2008); research on performance and identity. Acrobat, singer, and dancer who has performed in the U.S. and Brazil; co-creator of Dusty’s Ragtime Circus and author of the Cheval Aerial Method (NASM/AFAA).",
    url: "https://www.coreycheval.com/bio", linkLabel: "Bio ↗" },
  { id: "cameron",            label: "Cameron\nBuckner",               cat: "facilitator", weight: 1.2,
    desc: "Thursday July 23 — AI, authorship, ethics, and law. Professor of philosophy at the University of Florida and Donald F. Cronin Chair in the Humanities; specializes in philosophy of mind, cognitive science, and artificial intelligence. Author of From Deep Learning to Rational Machines: What the History of Philosophy Can Teach Us about the Future of Artificial Intelligence (Oxford, 2023). Teaches ethics, data, and technology.",
    url: "https://phil.ufl.edu/directory/cameron-buckner/", linkLabel: "Faculty profile ↗" },
  { id: "jasmine",            label: "Jasmine\nMcNealy",              cat: "facilitator", weight: 1.2,
    desc: "Thursday July 23 — AI, data ecologies, and law. Professor in UF’s College of Journalism and Communications (Department of Media Production, Management, and Technology); attorney and critical public interest technologist. Research on privacy, surveillance, data governance, and AI policy, with a view toward more just outcomes for communities. Ph.D. in Mass Communication (media law) and J.D. from UF; Faculty Associate at Harvard’s Berkman Klein Center. Directs Infrastructure for Communities, Ecology for Data (ICED).",
    url: "https://www.jou.ufl.edu/staff/jasmine-mcnealy/", linkLabel: "Faculty profile ↗" },
  { id: "melissa",            label: "Melissa M.\nWhite",             cat: "facilitator", weight: 1.1,
    desc: "Thursday July 30 — IGNITE leadership and program culmination. Senior Lecturer in UF’s Herbert Wertheim College of Engineering; develops engineering innovation and entrepreneurship curriculum. Ph.D. in Industrial and Systems Engineering (North Carolina State), M.S. in Engineering, Science, Technology, and Entrepreneurship (Notre Dame), B.S. in Biomedical Engineering (University of Miami). Co-founded MEDIC, a nonprofit for student–clinician medical innovation in the Research Triangle.",
    url: "https://www.eng.ufl.edu/innovation/about/meet-the-team/melissa-white/", linkLabel: "IGNITE team profile ↗" },

  { id: "techno_dualism",     label: "Techno-\nDualism",             cat: "tension",    weight: 0.9,
    desc: "Inadequate position: intelligence cleanly detached from bodies, histories, ecologies, and politics.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "bio_exception",      label: "Biological\nExceptionalism",  cat: "tension",    weight: 0.9,
    desc: "Inadequate position: only organic life can participate meaningfully in cognitive processes.",
    url: "essay.html", linkLabel: "Read Essay 1 →" },
  { id: "humanism",           label: "Humanism",                      cat: "tension",    weight: 0.9,
    desc: "Inadequate position: the human treated as a fixed center of value, reason, and history—closed to hybrid, more-than-human, and situated couplings." },
  { id: "anthropocentrism",   label: "Anthropo-\ncentrism",           cat: "tension",    weight: 0.9,
    desc: "Inadequate position: organizing knowledge, design, and ethics around human exceptionalism while excluding other agents, substrates, and scales of cognition." },
  { id: "essentialism",       label: "Essentialism",                  cat: "tension",    weight: 0.9,
    desc: "Inadequate position: fixed identities, natures, and categories that ignore relational emergence, power, and historical becoming." },
  { id: "universalism",       label: "Universalism",                  cat: "tension",    weight: 0.9,
    desc: "Inadequate position: one universal framework imposed as the measure of truth, value, and progress—erasing situated knowledges and other worlds." },
  { id: "posthumanism",       label: "Post-\nhumanism",               cat: "tension",    weight: 0.9,
    desc: "Contested horizon: rethinking the human beyond liberal humanist frames—neither anti-human nor simply transhuman, but open to distributed agency and more-than-human couplings." },
];

const WIKIPEDIA = {
  coupling: "Distributed_cognition",
  hybrid: "Cognitive_architecture",
  creative_embodiment: "Embodied_cognition",
  intelligence: "Intelligence",
  embodiment: "Embodied_cognition",
  body: "Human_body",
  hybrid_coupling: "Hybrid",
  cognition: "Cognition",
  creativity: "Creativity",
  leadership: "Leadership",
  mediation: "Mediation",
  "4e": "Embodied_cognition",
  enactivism: "Enactivism",
  autopoiesis: "Autopoiesis",
  buddhism: "Buddhism",
  active_inference: "Active_inference",
  assemblage: "N._Katherine_Hayles",
  assemblage_form: "Assemblage_(philosophy)",
  extended: "Extended_mind_thesis",
  cyborg: "Cyborg",
  cyberfeminism: "Cyberfeminism",
  queer_theory: "Queer_theory",
  possible_minds: "Philosophy_of_artificial_intelligence",
  technosymbiosis: "N._Katherine_Hayles",
  holobiont: "Holobiont",
  affordances: "Affordance",
  umwelt: "Umwelt",
  ai: "Artificial_intelligence",
  machine_learning: "Machine_learning",
  neural_networks: "Neural_network_(machine_learning)",
  perceptron: "Perceptron",
  linear_transform: "Artificial_neuron",
  rnn_update: "Recurrent_neural_network",
  convolutional_networks: "Convolutional_neural_network",
  transformers: "Transformer_(deep_learning_architecture)",
  gpt: "Generative_pre-trained_transformer",
  gen_ai: "Generative_artificial_intelligence",
  creative_ai: "Artificial_intelligence_art",
  llm: "Large_language_model",
  latent_space: "Latent_space",
  agi: "Artificial_general_intelligence",
  asi: "Superintelligence",
  ai_alignment: "AI_alignment",
  constitutional_ai: "Artificial_intelligence_alignment",
  ai_interpretability: "Explainable_artificial_intelligence",
  alphago: "AlphaGo",
  alphafold: "AlphaFold",
  three_es_ai: "Kate_Crawford",
  ai_impact_environment: "Environmental_impact_of_artificial_intelligence",
  ai_impact_ethics: "Ethics_of_artificial_intelligence",
  ai_impact_epistemic: "Epistemology",
  epistemologies_south: "Boaventura_de_Sousa_Santos",
  technologies_of_self: "Technologies_of_the_self",
  cybernetics: "Cybernetics",
  systems_thinking: "Systems_thinking",
  complexity_theory: "Complex_system",
  motion_bank: "William_Forsythe_(choreographer)",
  choreo_object: "Choreography",
  clark: "Andy_Clark",
  hayles: "N._Katherine_Hayles",
  thompson: "Evan_Thompson",
  maturana: "Humberto_Maturana",
  varela: "Francisco_Varela",
  merleau_ponty: "Maurice_Merleau-Ponty",
  margulis: "Lynn_Margulis",
  bateson: "Gregory_Bateson",
  gibson: "James_J._Gibson",
  uexkuell: "Jakob_Johann_von_Uexk%C3%BCll",
  gallagher: "Shaun_Gallagher",
  noe: "Alva_No%C3%AB",
  malafouris: "Lambros_Malafouris",
  chalmers: "David_Chalmers",
  de_jaegher: "Hanne_De_Jaegher",
  di_paolo: "Ezequiel_Di_Paolo",
  shanahan: "Murray_Shanahan",
  boden: "Margaret_Boden",
  shapiro: "Lawrence_Shapiro_(philosopher)",
  kirsh: "David_Kirsh",
  forsythe: "William_Forsythe_(choreographer)",
  duchamp: "Marcel_Duchamp",
  cage: "John_Cage",
  yoko_ono: "Yoko_Ono",
  trisha_brown: "Trisha_Brown",
  steve_paxton: "Steve_Paxton",
  saul_leiter: "Saul_Leiter",
  vera_molnar: "Vera_Moln%C3%A1r",
  ana_mendieta: "Ana_Mendieta",
  leigh_bowery: "Leigh_Bowery",
  carney: "Embodied_cognition",
  wilson: "Robert_A._Wilson_(philosopher)",
  rosch: "Eleanor_Rosch",
  nagarjuna: "Nagarjuna",
  cuffari: "Enactivism",
  akomolafe: "Bayo_Akomolafe",
  freire: "Paulo_Freire",
  braidotti: "Rosi_Braidotti",
  haraway: "Donna_Haraway",
  barad: "Karen_Barad",
  latour: "Bruno_Latour",
  fanon: "Frantz_Fanon",
  bell_hooks: "Bell_hooks",
  munoz: "Jos%C3%A9_Esteban_Mu%C3%B1oz",
  escobar: "Arturo_Escobar",
  crawford: "Kate_Crawford",
  aguilera_arcas: "Blaise_Ag%C3%BCera_y_Arcas",
  butler: "Octavia_E._Butler",
  sousa_santos: "Boaventura_de_Sousa_Santos",
  foucault: "Michel_Foucault",
  brooks: "Rodney_Brooks",
  friston: "Karl_Friston",
  embodied: "Embodied_cognition",
  embedded: "Embeddedness",
  enacted: "Enactivism",
  extended_q: "Extended_mind_thesis",
  critical: "Critical_thinking",
  situated: "Situated_cognition",
  distributed: "Distributed_cognition",
  technical_agency: "Agency_(philosophy)",
  ecology: "Ecological_psychology",
  coregulation: "Emotional_self-regulation",
  abstraction: "Abstraction",
  perception_politics: "Politics",
  symbiosis: "Symbiosis",
  community: "Community",
  judson_church: "Judson_Dance_Theater",
  social_change: "Social_change",
  theory_of_mind: "Theory_of_mind",
  cultural_imagination: "Imagination",
  futurity: "Future",
  ethical_imagination: "Moral_imagination",
  pluriversal: "Decoloniality",
  architecture: "Architecture",
  law: "Law",
  intellectual_property: "Intellectual_property",
  philosophy: "Philosophy",
  epistemology: "Epistemology",
  consciousness: "Consciousness",
  synthetic_cognition: "Cognitive_architecture",
  physical_ai: "Robotics",
  cs: "Computer_science",
  ai_ml: "Machine_learning",
  anthropic: "Anthropic",
  deepmind: "Google_DeepMind",
  ecology_d: "Ecology",
  dance: "Dance",
  choreography_d: "Choreography",
  circus_arts: "Circus",
  music: "Music",
  storytelling: "Storytelling",
  interdisciplinary_art: "Interdisciplinary_arts",
  generative_arts: "Generative_art",
  ai_art: "Artificial_intelligence_art",
  pedagogy: "Pedagogy",
  art_medicine: "Arts_in_health",
  curation: "Curator",
  speculative_futures: "Speculative_design",
  afrofuturism: "Afrofuturism",
  fluxus: "Fluxus",
  design_thinking: "Design_thinking",
  entrepreneurship_vision: "Entrepreneurship",
  art: "Art",
  choreography: "Choreography",
  choreo_knowledge: "Dance_research",
  somatics: "Somatics",
  vipassana: "Vipassan%C4%81",
  complexity: "Complexity",
  cultural_critical: "Critical_theory",
  juggling: "Juggling",
  creative: "Creativity",
  rehearsal: "Rehearsal",
  literacies: "Literacy",
  arch_design: "Architectural_design",
  philosophical_practice: "Philosophy",
  conversational_ai: "Chatbot",
  hi_program: "Cognitive_science",
  came: "Entrepreneurship",
  cam: "Arts_in_health",
  cota: "University_of_Florida_College_of_the_Arts",
  gainesville_circus: "Circus",
  undergrad_participants: "Undergraduate_education",
  grad_participants: "Postgraduate_education",
  staff_participants: "University_of_Florida",
  community_participants: "Community",
  bg_art_history: "Art_history",
  bg_ise: "Industrial_engineering",
  bg_dance_museum: "Museum_studies",
  bg_cs: "Computer_science",
  bg_ise_polisci: "Political_science",
  bg_hcc: "Human%E2%80%93computer_interaction",
  bg_chem_eng: "Chemical_engineering",
  bg_ml: "Machine_learning",
  bg_health_outcomes: "Health_outcome",
  bg_lighting: "Lighting_designer",
  bg_nursing: "Nursing",
  bg_public_health: "Public_health",
  bg_dance_therapy: "Dance_therapy",
  bg_it: "Information_technology",
  bg_digital_media_ai: "Digital_media",
  bg_choreo_film: "Choreography",
  bg_library: "Library_science",
  bg_digital_art: "Digital_art",
  ignite: "Innovation",
  wertheim: "University_of_Florida",
  track_space: "Spatial_memory",
  track_future: "Futures_studies",
  track_ethics: "Ethics",
  reception: "Art_exhibition",
  marlon: "Interdisciplinary_arts",
  erika: "Medical_humanities",
  jackie_larson: "Dance_movement_therapy",
  andrew_hix: "Music_therapy",
  turbado_marabou: "Public_art",
  karla: "Architecture",
  onye: "Postmodern_dance",
  cheval_bailie: "Acro_balance",
  cameron: "Philosophy_of_artificial_intelligence",
  jasmine: "Information_privacy",
  melissa: "Leadership_studies",
  techno_dualism: "Mind%E2%80%93body_dualism",
  bio_exception: "Biological_essentialism",
  humanism: "Humanism",
  anthropocentrism: "Anthropocentrism",
  essentialism: "Essentialism",
  universalism: "Universalism",
  posthumanism: "Posthumanism",
};

function attachWikipediaLinks() {
  for (const n of NODES) {
    const article = WIKIPEDIA[n.id];
    if (article) {
      n.wikiUrl = `https://en.wikipedia.org/wiki/${article}`;
    } else if (n.url?.includes("wikipedia.org/wiki/")) {
      n.wikiUrl = n.url;
    }
    if (!n.url && n.wikiUrl) {
      n.url = n.wikiUrl;
      n.linkLabel = "Wikipedia ↗";
    }
  }
}
attachWikipediaLinks();

const EDGES = [
  ["coupling", "hybrid", 1.0],
  ["coupling", "creative_embodiment", 0.95],
  ["coupling", "intelligence", 0.95],
  ["coupling", "embodiment", 0.9],
  ["coupling", "body", 0.85],
  ["coupling", "hybrid_coupling", 0.9],
  ["coupling", "mediation", 0.9],
  ["coupling", "assemblage", 0.95],
  ["coupling", "assemblage_form", 0.9],
  ["hybrid", "hybrid_coupling", 0.95],
  ["hybrid", "intelligence", 0.9],
  ["hybrid", "embodiment", 0.85],
  ["hybrid", "assemblage", 1.0],
  ["hybrid", "assemblage_form", 0.95],
  ["creative_embodiment", "assemblage", 0.95],
  ["creative_embodiment", "assemblage_form", 0.85],
  ["assemblage", "assemblage_form", 0.95],
  ["assemblage", "hayles", 0.98],
  ["assemblage_form", "hayles", 0.9],
  ["assemblage_form", "latour", 0.9],
  ["assemblage_form", "hybrid_coupling", 0.85],
  ["technosymbiosis", "assemblage", 0.95],
  ["technosymbiosis", "assemblage_form", 0.85],
  ["technosymbiosis", "hayles", 0.98],
  ["technosymbiosis", "hybrid", 0.95],
  ["technosymbiosis", "coupling", 0.9],
  ["technosymbiosis", "creative_embodiment", 0.85],
  ["4e", "coupling", 0.95],
  ["4e", "embodiment", 0.95],
  ["4e", "cognition", 0.95],
  ["4e", "hybrid", 0.85],
  ["4e", "creative_embodiment", 0.9],
  ["4e", "body", 0.85],
  ["4e", "intelligence", 0.9],
  ["cognition", "embodiment", 0.9],
  ["cognition", "coupling", 0.9],
  ["hybrid", "cognition", 0.9],
  ["intelligence", "cognition", 0.95],
  ["intelligence", "embodiment", 0.85],
  ["intelligence", "body", 0.8],
  ["intelligence", "hybrid_coupling", 0.9],
  ["intelligence", "ai", 0.85],
  ["intelligence", "4e", 0.85],
  ["intelligence", "possible_minds", 0.85],
  ["intelligence", "philosophy", 0.8],
  ["intelligence", "synthetic_cognition", 0.8],
  ["embodiment", "body", 0.95],
  ["embodiment", "somatics", 0.9],
  ["embodiment", "creative_embodiment", 0.95],
  ["embodiment", "embodied", 0.95],
  ["embodiment", "4e", 0.9],
  ["embodiment", "enactivism", 0.9],
  ["embodiment", "cognition", 0.9],
  ["embodiment", "leadership", 0.85],
  ["embodiment", "technologies_of_self", 0.8],
  ["embodiment", "choreography", 0.8],
  ["embodiment", "thompson", 0.8],
  ["embodiment", "gallagher", 0.85],
  ["body", "somatics", 0.95],
  ["body", "creative_embodiment", 0.9],
  ["body", "coregulation", 0.8],
  ["body", "leadership", 0.8],
  ["body", "technologies_of_self", 0.85],
  ["body", "foucault", 0.75],
  ["body", "dance", 0.8],
  ["body", "rehearsal", 0.75],
  ["body", "cognition", 0.8],
  ["hybrid_coupling", "assemblage", 0.85],
  ["hybrid_coupling", "technosymbiosis", 0.85],
  ["hybrid_coupling", "ai", 0.8],
  ["hybrid_coupling", "gen_ai", 0.75],
  ["hybrid_coupling", "holobiont", 0.75],
  ["cognition", "4e", 0.95],
  ["cognition", "enactivism", 0.9],
  ["cognition", "assemblage", 0.85],
  ["cognition", "mediation", 0.85],
  ["cognition", "synthetic_cognition", 0.85],
  ["cognition", "consciousness", 0.8],
  ["cognition", "epistemology", 0.75],
  ["cognition", "extended", 0.8],
  ["cognition", "active_inference", 0.8],
  ["creativity", "boden", 0.95],
  ["creativity", "cognition", 0.9],
  ["creativity", "intelligence", 0.85],
  ["creativity", "creative", 0.95],
  ["creativity", "creative_ai", 0.9],
  ["creativity", "creative_embodiment", 0.85],
  ["creativity", "art", 0.9],
  ["creativity", "ai", 0.8],
  ["creativity", "machine_learning", 0.7],
  ["creativity", "gen_ai", 0.8],
  ["creativity", "possible_minds", 0.75],
  ["creativity", "cultural_imagination", 0.85],
  ["creativity", "speculative_futures", 0.8],
  ["creativity", "synthetic_cognition", 0.8],
  ["creativity", "design_thinking", 0.85],
  ["creativity", "abstraction", 0.75],
  ["creativity", "epistemology", 0.7],
  ["creativity", "duchamp", 0.75],
  ["creativity", "cage", 0.7],
  ["creativity", "hayles", 0.7],
  ["creativity", "philosophy", 0.75],
  ["leadership", "track_ethics", 0.95],
  ["leadership", "melissa", 0.9],
  ["leadership", "entrepreneurship_vision", 0.85],
  ["leadership", "ethical_imagination", 0.85],
  ["leadership", "creative_embodiment", 0.9],
  ["leadership", "embodiment", 0.85],
  ["leadership", "body", 0.8],
  ["leadership", "somatics", 0.85],
  ["leadership", "marlon", 0.85],
  ["leadership", "erika", 0.85],
  ["leadership", "pedagogy", 0.8],
  ["leadership", "community", 0.85],
  ["leadership", "coregulation", 0.75],
  ["leadership", "hi_program", 0.8],
  ["leadership", "ignite", 0.8],
  ["leadership", "came", 0.75],
  ["leadership", "cognition", 0.75],
  ["leadership", "intelligence", 0.7],
  ["hybrid", "creative_embodiment", 0.95],
  ["hybrid", "ecology", 0.9],
  ["hybrid", "literacies", 0.8],
  ["mediation", "ecology", 0.85],
  ["mediation", "perception_politics", 0.9],

  ["4e", "enactivism", 0.95],
  ["4e", "embodied", 0.9],
  ["4e", "embedded", 0.9],
  ["4e", "enacted", 0.9],
  ["4e", "extended_q", 0.9],
  ["enactivism", "coupling", 0.85],
  ["enactivism", "rehearsal", 0.7],
  ["enactivism", "autopoiesis", 0.95],

  ["autopoiesis", "maturana", 0.98],
  ["autopoiesis", "varela", 0.98],
  ["autopoiesis", "enactivism", 0.95],
  ["autopoiesis", "coupling", 0.92],
  ["autopoiesis", "cognition", 0.9],
  ["autopoiesis", "embodiment", 0.88],
  ["autopoiesis", "body", 0.85],
  ["autopoiesis", "thompson", 0.88],
  ["autopoiesis", "4e", 0.85],
  ["autopoiesis", "enacted", 0.85],
  ["autopoiesis", "embodied", 0.85],
  ["autopoiesis", "cybernetics", 0.88],
  ["autopoiesis", "systems_thinking", 0.82],
  ["autopoiesis", "complexity_theory", 0.78],
  ["autopoiesis", "holobiont", 0.82],
  ["autopoiesis", "ecology", 0.78],
  ["autopoiesis", "consciousness", 0.8],
  ["autopoiesis", "epistemology", 0.8],
  ["autopoiesis", "di_paolo", 0.85],
  ["autopoiesis", "de_jaegher", 0.8],
  ["autopoiesis", "bateson", 0.75],
  ["autopoiesis", "merleau_ponty", 0.72],
  ["autopoiesis", "buddhism", 0.7],
  ["autopoiesis", "creative_embodiment", 0.72],
  ["autopoiesis", "technosymbiosis", 0.7],
  ["autopoiesis", "coregulation", 0.72],
  ["autopoiesis", "intelligence", 0.8],

  ["buddhism", "enactivism", 0.95],
  ["buddhism", "vipassana", 0.98],
  ["buddhism", "nagarjuna", 0.95],
  ["buddhism", "varela", 0.9],
  ["buddhism", "rosch", 0.9],
  ["buddhism", "thompson", 0.85],
  ["buddhism", "philosophy", 0.9],
  ["buddhism", "epistemology", 0.85],
  ["buddhism", "consciousness", 0.85],
  ["buddhism", "embodied", 0.8],
  ["buddhism", "enacted", 0.8],
  ["buddhism", "4e", 0.75],
  ["buddhism", "somatics", 0.75],
  ["buddhism", "essentialism", 0.85],
  ["buddhism", "technologies_of_self", 0.75],
  ["buddhism", "ethical_imagination", 0.8],
  ["buddhism", "coupling", 0.7],
  ["buddhism", "complexity", 0.7],
  ["buddhism", "track_ethics", 0.7],

  ["active_inference", "friston", 0.95],
  ["active_inference", "enactivism", 0.85],
  ["active_inference", "4e", 0.85],
  ["active_inference", "embodied", 0.85],
  ["active_inference", "coupling", 0.85],
  ["active_inference", "clark", 0.9],
  ["active_inference", "aguilera_arcas", 0.9],
  ["active_inference", "cybernetics", 0.8],
  ["active_inference", "systems_thinking", 0.75],
  ["active_inference", "mediation", 0.8],
  ["active_inference", "perception_politics", 0.7],
  ["active_inference", "physical_ai", 0.8],
  ["active_inference", "synthetic_cognition", 0.85],
  ["active_inference", "possible_minds", 0.8],
  ["active_inference", "consciousness", 0.75],
  ["active_inference", "umwelt", 0.75],
  ["active_inference", "thompson", 0.75],

  ["extended", "extended_q", 0.95],
  ["extended", "cyborg", 0.85],
  ["cyborg", "ecology", 0.8],
  ["cyborg", "hybrid", 0.75],
  ["assemblage", "distributed", 0.95],
  ["assemblage", "technical_agency", 0.9],
  ["assemblage", "creative", 0.85],
  ["possible_minds", "ecology", 0.8],
  ["possible_minds", "hybrid", 0.75],
  ["possible_minds", "shanahan", 0.9],
  ["technosymbiosis", "symbiosis", 0.9],
  ["technosymbiosis", "margulis", 0.85],
  ["technosymbiosis", "cyborg", 0.8],
  ["technosymbiosis", "ecology", 0.85],
  ["technosymbiosis", "ai", 0.85],
  ["technosymbiosis", "gen_ai", 0.8],
  ["technosymbiosis", "active_inference", 0.75],
  ["technosymbiosis", "physical_ai", 0.75],
  ["technosymbiosis", "synthetic_cognition", 0.8],
  ["holobiont", "symbiosis", 0.95],
  ["holobiont", "margulis", 0.9],
  ["holobiont", "technosymbiosis", 0.9],
  ["holobiont", "hybrid", 0.85],
  ["holobiont", "assemblage", 0.85],
  ["holobiont", "coupling", 0.8],
  ["holobiont", "ecology", 0.85],
  ["holobiont", "ecology_d", 0.85],
  ["holobiont", "coregulation", 0.75],
  ["holobiont", "enactivism", 0.75],
  ["holobiont", "haraway", 0.85],
  ["holobiont", "hayles", 0.8],
  ["holobiont", "posthumanism", 0.8],
  ["holobiont", "aguilera_arcas", 0.75],
  ["holobiont", "bateson", 0.75],
  ["holobiont", "complexity_theory", 0.7],
  ["holobiont", "ai_impact_environment", 0.65],
  ["holobiont", "creative_embodiment", 0.75],
  ["holobiont", "distributed", 0.7],
  ["holobiont", "autopoiesis", 0.82],

  ["affordances", "gibson", 0.95],
  ["affordances", "embedded", 0.9],
  ["affordances", "4e", 0.85],
  ["affordances", "enactivism", 0.8],
  ["affordances", "architecture", 0.9],
  ["affordances", "ecology", 0.75],
  ["affordances", "umwelt", 0.85],
  ["umwelt", "enactivism", 0.9],
  ["umwelt", "varela", 0.85],
  ["umwelt", "maturana", 0.75],
  ["umwelt", "autopoiesis", 0.8],
  ["umwelt", "thompson", 0.8],
  ["umwelt", "4e", 0.8],
  ["umwelt", "embedded", 0.85],
  ["umwelt", "ecology", 0.8],
  ["umwelt", "coupling", 0.75],
  ["uexkuell", "umwelt", 0.95],
  ["uexkuell", "enactivism", 0.75],
  ["uexkuell", "affordances", 0.7],
  ["uexkuell", "ecology", 0.8],
  ["uexkuell", "embedded", 0.75],
  ["uexkuell", "gibson", 0.7],
  ["uexkuell", "thompson", 0.75],
  ["uexkuell", "varela", 0.8],

  ["ai", "assemblage", 0.9],
  ["ai", "ecology", 0.85],
  ["ai", "hybrid", 0.85],
  ["ai", "cs", 0.9],
  ["ai", "extended", 0.75],
  ["ai", "technical_agency", 0.85],
  ["ai", "mediation", 0.8],
  ["ai", "gen_ai", 0.95],
  ["ai", "machine_learning", 0.95],
  ["ai", "neural_networks", 0.9],
  ["ai", "perceptron", 0.85],
  ["ai", "convolutional_networks", 0.85],
  ["ai", "transformers", 0.9],
  ["ai", "gpt", 0.9],
  ["ai", "agi", 0.85],
  ["machine_learning", "neural_networks", 0.95],
  ["machine_learning", "ai_ml", 0.95],
  ["machine_learning", "gen_ai", 0.9],
  ["machine_learning", "llm", 0.9],
  ["machine_learning", "cs", 0.9],
  ["machine_learning", "creative_ai", 0.85],
  ["machine_learning", "ai_interpretability", 0.85],
  ["machine_learning", "ai_alignment", 0.8],
  ["machine_learning", "synthetic_cognition", 0.85],
  ["machine_learning", "technical_agency", 0.85],
  ["machine_learning", "mediation", 0.8],
  ["machine_learning", "perception_politics", 0.75],
  ["machine_learning", "cognition", 0.7],
  ["machine_learning", "intelligence", 0.75],
  ["machine_learning", "creativity", 0.7],
  ["machine_learning", "ai_art", 0.85],
  ["machine_learning", "physical_ai", 0.85],
  ["machine_learning", "cybernetics", 0.7],
  ["machine_learning", "distributed", 0.75],
  ["machine_learning", "boden", 0.8],
  ["machine_learning", "aguilera_arcas", 0.85],
  ["machine_learning", "brooks", 0.7],
  ["machine_learning", "friston", 0.7],
  ["machine_learning", "crawford", 0.8],
  ["machine_learning", "three_es_ai", 0.75],
  ["neural_networks", "gen_ai", 0.95],
  ["neural_networks", "llm", 0.95],
  ["neural_networks", "ai_ml", 0.9],
  ["neural_networks", "ai_interpretability", 0.9],
  ["neural_networks", "creative_ai", 0.85],
  ["neural_networks", "synthetic_cognition", 0.85],
  ["neural_networks", "cs", 0.9],
  ["neural_networks", "physical_ai", 0.8],
  ["neural_networks", "possible_minds", 0.7],
  ["neural_networks", "consciousness", 0.65],
  ["neural_networks", "cybernetics", 0.75],
  ["neural_networks", "friston", 0.75],
  ["neural_networks", "aguilera_arcas", 0.85],
  ["neural_networks", "boden", 0.75],
  ["neural_networks", "active_inference", 0.65],
  ["perceptron", "neural_networks", 0.95],
  ["perceptron", "machine_learning", 0.9],
  ["perceptron", "ai", 0.85],
  ["perceptron", "cs", 0.85],
  ["perceptron", "cybernetics", 0.85],
  ["perceptron", "possible_minds", 0.7],
  ["perceptron", "synthetic_cognition", 0.75],
  ["linear_transform", "neural_networks", 0.98],
  ["linear_transform", "perceptron", 0.95],
  ["linear_transform", "machine_learning", 0.9],
  ["linear_transform", "convolutional_networks", 0.85],
  ["linear_transform", "transformers", 0.85],
  ["linear_transform", "ai_ml", 0.9],
  ["linear_transform", "cs", 0.9],
  ["linear_transform", "ai", 0.8],
  ["linear_transform", "synthetic_cognition", 0.75],
  ["linear_transform", "ai_interpretability", 0.8],
  ["linear_transform", "model_introspection", 0.7],
  ["linear_transform", "cybernetics", 0.7],
  ["rnn_update", "linear_transform", 0.95],
  ["rnn_update", "neural_networks", 0.95],
  ["rnn_update", "machine_learning", 0.9],
  ["rnn_update", "transformers", 0.85],
  ["rnn_update", "llm", 0.75],
  ["rnn_update", "gen_ai", 0.7],
  ["rnn_update", "ai_ml", 0.9],
  ["rnn_update", "cs", 0.85],
  ["rnn_update", "ai", 0.8],
  ["rnn_update", "synthetic_cognition", 0.75],
  ["rnn_update", "mediation", 0.7],
  ["rnn_update", "cybernetics", 0.8],
  ["rnn_update", "distributed", 0.7],
  ["rnn_update", "storytelling", 0.65],
  ["rnn_update", "music", 0.65],
  ["rnn_update", "choreography_d", 0.6],
  ["convolutional_networks", "neural_networks", 0.95],
  ["convolutional_networks", "machine_learning", 0.9],
  ["convolutional_networks", "gen_ai", 0.85],
  ["convolutional_networks", "creative_ai", 0.85],
  ["convolutional_networks", "ai_art", 0.9],
  ["convolutional_networks", "generative_arts", 0.75],
  ["convolutional_networks", "ai_interpretability", 0.85],
  ["convolutional_networks", "perception_politics", 0.8],
  ["convolutional_networks", "cs", 0.9],
  ["convolutional_networks", "physical_ai", 0.8],
  ["convolutional_networks", "synthetic_cognition", 0.8],
  ["convolutional_networks", "crawford", 0.75],
  ["transformers", "neural_networks", 0.9],
  ["transformers", "machine_learning", 0.9],
  ["transformers", "gpt", 0.95],
  ["transformers", "llm", 0.95],
  ["transformers", "gen_ai", 0.95],
  ["transformers", "ai_interpretability", 0.9],
  ["transformers", "creative_ai", 0.8],
  ["transformers", "mediation", 0.8],
  ["transformers", "distributed", 0.75],
  ["transformers", "ai", 0.9],
  ["transformers", "cs", 0.85],
  ["transformers", "aguilera_arcas", 0.8],
  ["transformers", "cameron", 0.75],
  ["gpt", "llm", 0.95],
  ["gpt", "gen_ai", 0.95],
  ["gpt", "transformers", 0.95],
  ["gpt", "machine_learning", 0.9],
  ["gpt", "neural_networks", 0.85],
  ["gpt", "creative_ai", 0.8],
  ["gpt", "ai_art", 0.75],
  ["gpt", "mediation", 0.85],
  ["gpt", "literacies", 0.8],
  ["gpt", "perception_politics", 0.75],
  ["gpt", "ai_alignment", 0.8],
  ["gpt", "ai_interpretability", 0.85],
  ["gpt", "cameron", 0.75],
  ["gpt", "crawford", 0.75],
  ["gen_ai", "creative_ai", 0.9],
  ["gen_ai", "llm", 0.95],
  ["gen_ai", "abstraction", 0.8],
  ["gen_ai", "distributed", 0.75],
  ["creative_ai", "creative_embodiment", 0.95],
  ["creative_ai", "creative", 0.9],
  ["creative_ai", "art", 0.85],
  ["creative_ai", "rehearsal", 0.7],
  ["llm", "assemblage", 0.85],
  ["llm", "transformers", 0.95],
  ["llm", "gpt", 0.95],
  ["llm", "mediation", 0.85],
  ["llm", "perception_politics", 0.75],
  ["llm", "literacies", 0.7],
  ["latent_space", "llm", 0.95],
  ["latent_space", "gen_ai", 0.9],
  ["latent_space", "neural_networks", 0.9],
  ["latent_space", "machine_learning", 0.85],
  ["latent_space", "transformers", 0.85],
  ["latent_space", "gpt", 0.85],
  ["latent_space", "umwelt", 0.9],
  ["latent_space", "affordances", 0.85],
  ["latent_space", "ai_interpretability", 0.85],
  ["latent_space", "model_introspection", 0.8],
  ["latent_space", "creative_ai", 0.8],
  ["latent_space", "possible_minds", 0.75],
  ["latent_space", "cognition", 0.75],
  ["latent_space", "mediation", 0.75],
  ["latent_space", "synthetic_cognition", 0.8],
  ["latent_space", "ai_impact_epistemic", 0.7],
  ["agi", "possible_minds", 0.9],
  ["agi", "philosophy", 0.8],
  ["agi", "shanahan", 0.85],
  ["agi", "asi", 0.9],
  ["asi", "possible_minds", 0.85],
  ["asi", "agi", 0.9],
  ["hayles", "ai", 0.85],

  ["ai_alignment", "ai", 0.95],
  ["ai_alignment", "agi", 0.9],
  ["ai_alignment", "asi", 0.85],
  ["ai_alignment", "llm", 0.85],
  ["ai_alignment", "gen_ai", 0.8],
  ["ai_alignment", "ai_ml", 0.85],
  ["ai_alignment", "track_ethics", 0.9],
  ["ai_alignment", "ethical_imagination", 0.85],
  ["ai_alignment", "law", 0.8],
  ["ai_alignment", "philosophy", 0.85],
  ["ai_alignment", "critical", 0.8],
  ["ai_alignment", "technical_agency", 0.85],
  ["ai_alignment", "distributed", 0.75],

  ["constitutional_ai", "anthropic", 0.95],
  ["constitutional_ai", "ai_alignment", 0.95],
  ["constitutional_ai", "ai", 0.9],
  ["constitutional_ai", "gen_ai", 0.85],
  ["constitutional_ai", "llm", 0.9],
  ["constitutional_ai", "gpt", 0.9],
  ["constitutional_ai", "model_introspection", 0.8],
  ["constitutional_ai", "ai_interpretability", 0.85],
  ["constitutional_ai", "track_ethics", 0.9],
  ["constitutional_ai", "ethical_imagination", 0.85],
  ["constitutional_ai", "law", 0.8],
  ["constitutional_ai", "philosophy", 0.85],
  ["constitutional_ai", "critical", 0.8],
  ["constitutional_ai", "technical_agency", 0.85],
  ["constitutional_ai", "cameron", 0.8],
  ["constitutional_ai", "jasmine", 0.75],

  ["ai_interpretability", "ai", 0.95],
  ["ai_interpretability", "gen_ai", 0.9],
  ["ai_interpretability", "llm", 0.9],
  ["ai_interpretability", "ai_ml", 0.9],
  ["ai_interpretability", "creative_ai", 0.8],
  ["ai_interpretability", "ai_alignment", 0.85],
  ["ai_interpretability", "ai_impact_epistemic", 0.9],
  ["ai_interpretability", "three_es_ai", 0.8],
  ["ai_interpretability", "epistemology", 0.85],
  ["ai_interpretability", "critical", 0.85],
  ["ai_interpretability", "perception_politics", 0.85],
  ["ai_interpretability", "crawford", 0.8],
  ["ai_interpretability", "cameron", 0.75],
  ["ai_interpretability", "jasmine", 0.75],
  ["ai_interpretability", "track_ethics", 0.85],
  ["ai_interpretability", "law", 0.75],
  ["ai_interpretability", "cs", 0.85],
  ["ai_interpretability", "synthetic_cognition", 0.8],
  ["ai_interpretability", "mediation", 0.75],
  ["ai_interpretability", "technical_agency", 0.8],
  ["ai_interpretability", "philosophy", 0.8],
  ["ai_interpretability", "distributed", 0.7],
  ["ai_interpretability", "aguilera_arcas", 0.7],
  ["ai_interpretability", "systems_thinking", 0.7],
  ["ai_interpretability", "model_introspection", 0.95],
  ["ai_interpretability", "transformers", 0.85],
  ["ai_interpretability", "anthropic", 0.9],

  ["model_introspection", "anthropic", 0.95],
  ["model_introspection", "ai_interpretability", 0.95],
  ["model_introspection", "constitutional_ai", 0.8],
  ["model_introspection", "ai_alignment", 0.85],
  ["model_introspection", "ai", 0.9],
  ["model_introspection", "gen_ai", 0.85],
  ["model_introspection", "llm", 0.9],
  ["model_introspection", "gpt", 0.9],
  ["model_introspection", "transformers", 0.9],
  ["model_introspection", "neural_networks", 0.85],
  ["model_introspection", "machine_learning", 0.85],
  ["model_introspection", "ai_ml", 0.85],
  ["model_introspection", "synthetic_cognition", 0.85],
  ["model_introspection", "consciousness", 0.75],
  ["model_introspection", "theory_of_mind", 0.85],
  ["model_introspection", "possible_minds", 0.8],
  ["model_introspection", "epistemology", 0.85],
  ["model_introspection", "ai_impact_epistemic", 0.85],
  ["model_introspection", "critical", 0.85],
  ["model_introspection", "philosophy", 0.85],
  ["model_introspection", "perception_politics", 0.8],
  ["model_introspection", "technical_agency", 0.8],
  ["model_introspection", "mediation", 0.75],
  ["model_introspection", "distributed", 0.7],
  ["model_introspection", "cs", 0.8],
  ["model_introspection", "track_ethics", 0.85],
  ["model_introspection", "cameron", 0.75],
  ["model_introspection", "jasmine", 0.75],
  ["model_introspection", "crawford", 0.7],
  ["model_introspection", "shanahan", 0.75],
  ["model_introspection", "chalmers", 0.7],

  ["anthropic", "model_introspection", 0.95],
  ["anthropic", "constitutional_ai", 0.95],
  ["anthropic", "ai_interpretability", 0.95],
  ["anthropic", "ai_alignment", 0.95],
  ["anthropic", "ai", 0.95],
  ["anthropic", "gen_ai", 0.9],
  ["anthropic", "llm", 0.95],
  ["anthropic", "gpt", 0.95],
  ["anthropic", "transformers", 0.9],
  ["anthropic", "neural_networks", 0.85],
  ["anthropic", "machine_learning", 0.9],
  ["anthropic", "ai_ml", 0.9],
  ["anthropic", "cs", 0.9],
  ["anthropic", "synthetic_cognition", 0.9],
  ["anthropic", "consciousness", 0.7],
  ["anthropic", "theory_of_mind", 0.85],
  ["anthropic", "possible_minds", 0.85],
  ["anthropic", "agi", 0.85],
  ["anthropic", "track_ethics", 0.9],
  ["anthropic", "ethical_imagination", 0.85],
  ["anthropic", "law", 0.8],
  ["anthropic", "cameron", 0.85],
  ["anthropic", "jasmine", 0.8],
  ["anthropic", "crawford", 0.75],
  ["anthropic", "shanahan", 0.8],
  ["anthropic", "chalmers", 0.75],
  ["anthropic", "aguilera_arcas", 0.75],
  ["anthropic", "philosophy", 0.85],
  ["anthropic", "epistemology", 0.85],
  ["anthropic", "ai_impact_epistemic", 0.85],
  ["anthropic", "ai_impact_ethics", 0.85],
  ["anthropic", "three_es_ai", 0.7],
  ["anthropic", "critical", 0.8],
  ["anthropic", "perception_politics", 0.8],
  ["anthropic", "technical_agency", 0.85],
  ["anthropic", "distributed", 0.75],
  ["anthropic", "assemblage", 0.8],
  ["anthropic", "mediation", 0.85],
  ["anthropic", "hybrid", 0.8],
  ["anthropic", "systems_thinking", 0.75],
  ["anthropic", "literacies", 0.75],
  ["anthropic", "intellectual_property", 0.7],
  ["anthropic", "creative_ai", 0.75],

  ["deepmind", "alphago", 0.95],
  ["deepmind", "alphafold", 0.95],
  ["deepmind", "ai", 0.95],
  ["deepmind", "machine_learning", 0.95],
  ["deepmind", "neural_networks", 0.9],
  ["deepmind", "agi", 0.85],
  ["deepmind", "possible_minds", 0.85],
  ["deepmind", "shanahan", 0.85],
  ["deepmind", "synthetic_cognition", 0.9],
  ["deepmind", "cs", 0.9],
  ["deepmind", "ai_ml", 0.9],
  ["deepmind", "transformers", 0.75],
  ["deepmind", "theory_of_mind", 0.8],
  ["deepmind", "track_ethics", 0.8],
  ["deepmind", "ai_impact_environment", 0.8],
  ["deepmind", "ai_impact_epistemic", 0.85],
  ["deepmind", "holobiont", 0.7],
  ["deepmind", "ecology_d", 0.7],
  ["deepmind", "art_medicine", 0.75],
  ["deepmind", "cam", 0.7],
  ["deepmind", "anthropic", 0.7],
  ["deepmind", "crawford", 0.75],
  ["deepmind", "complexity_theory", 0.75],
  ["deepmind", "systems_thinking", 0.75],

  ["alphago", "deepmind", 0.95],
  ["alphago", "machine_learning", 0.95],
  ["alphago", "neural_networks", 0.95],
  ["alphago", "ai", 0.9],
  ["alphago", "possible_minds", 0.9],
  ["alphago", "shanahan", 0.85],
  ["alphago", "agi", 0.8],
  ["alphago", "creativity", 0.75],
  ["alphago", "boden", 0.75],
  ["alphago", "complexity_theory", 0.8],
  ["alphago", "systems_thinking", 0.75],
  ["alphago", "synthetic_cognition", 0.85],
  ["alphago", "theory_of_mind", 0.75],
  ["alphago", "hybrid", 0.7],
  ["alphago", "alphafold", 0.75],

  ["alphafold", "deepmind", 0.95],
  ["alphafold", "machine_learning", 0.95],
  ["alphafold", "neural_networks", 0.9],
  ["alphafold", "ai", 0.9],
  ["alphafold", "synthetic_cognition", 0.85],
  ["alphafold", "holobiont", 0.85],
  ["alphafold", "margulis", 0.75],
  ["alphafold", "technosymbiosis", 0.7],
  ["alphafold", "ecology_d", 0.8],
  ["alphafold", "art_medicine", 0.85],
  ["alphafold", "cam", 0.8],
  ["alphafold", "epistemology", 0.85],
  ["alphafold", "ai_impact_epistemic", 0.9],
  ["alphafold", "abstraction", 0.8],
  ["alphafold", "cs", 0.85],
  ["alphafold", "possible_minds", 0.75],
  ["alphafold", "boden", 0.7],
  ["alphafold", "alphago", 0.75],

  ["three_es_ai", "crawford", 0.95],
  ["three_es_ai", "ai", 0.9],
  ["three_es_ai", "gen_ai", 0.85],
  ["three_es_ai", "ai_impact_environment", 0.95],
  ["three_es_ai", "ai_impact_ethics", 0.95],
  ["three_es_ai", "ai_impact_epistemic", 0.95],
  ["ai_impact_environment", "ai_impact_ethics", 0.85],
  ["ai_impact_environment", "ai_impact_epistemic", 0.85],
  ["ai_impact_ethics", "ai_impact_epistemic", 0.85],
  ["ai_impact_environment", "crawford", 0.9],
  ["ai_impact_ethics", "crawford", 0.9],
  ["ai_impact_epistemic", "crawford", 0.9],
  ["ai_impact_environment", "ecology", 0.9],
  ["ai_impact_environment", "ecology_d", 0.85],
  ["ai_impact_environment", "ai_ml", 0.85],
  ["ai_impact_environment", "gen_ai", 0.8],
  ["ai_impact_environment", "symbiosis", 0.75],
  ["ai_impact_environment", "technosymbiosis", 0.75],
  ["ai_impact_environment", "margulis", 0.7],
  ["ai_impact_ethics", "ai_alignment", 0.9],
  ["ai_impact_ethics", "track_ethics", 0.85],
  ["ai_impact_ethics", "critical", 0.85],
  ["ai_impact_ethics", "ethical_imagination", 0.85],
  ["ai_impact_ethics", "cultural_critical", 0.85],
  ["ai_impact_ethics", "law", 0.8],
  ["ai_impact_ethics", "cameron", 0.8],
  ["ai_impact_ethics", "jasmine", 0.8],
  ["ai_impact_ethics", "intellectual_property", 0.75],
  ["ai_impact_epistemic", "perception_politics", 0.95],
  ["ai_impact_epistemic", "situated", 0.85],
  ["ai_impact_epistemic", "critical", 0.85],
  ["ai_impact_epistemic", "mediation", 0.85],
  ["ai_impact_epistemic", "abstraction", 0.8],
  ["ai_impact_epistemic", "assemblage", 0.85],
  ["ai_impact_epistemic", "distributed", 0.8],
  ["ai_impact_epistemic", "philosophy", 0.75],

  ["epistemologies_south", "sousa_santos", 0.95],
  ["epistemologies_south", "epistemology", 0.9],
  ["epistemologies_south", "pluriversal", 0.9],
  ["epistemologies_south", "escobar", 0.9],
  ["epistemologies_south", "freire", 0.85],
  ["epistemologies_south", "fanon", 0.85],
  ["epistemologies_south", "cultural_critical", 0.9],
  ["epistemologies_south", "universalism", 0.85],
  ["epistemologies_south", "pedagogy", 0.85],
  ["epistemologies_south", "community", 0.85],
  ["epistemologies_south", "social_change", 0.85],
  ["epistemologies_south", "akomolafe", 0.8],
  ["epistemologies_south", "situated", 0.85],
  ["epistemologies_south", "critical", 0.85],
  ["epistemologies_south", "law", 0.75],
  ["epistemologies_south", "ai_impact_epistemic", 0.75],

  ["technologies_of_self", "foucault", 0.95],
  ["technologies_of_self", "somatics", 0.9],
  ["technologies_of_self", "creative_embodiment", 0.85],
  ["technologies_of_self", "embodied", 0.85],
  ["technologies_of_self", "situated", 0.8],
  ["technologies_of_self", "pedagogy", 0.8],
  ["technologies_of_self", "rehearsal", 0.75],
  ["technologies_of_self", "literacies", 0.75],
  ["technologies_of_self", "critical", 0.85],
  ["technologies_of_self", "cultural_critical", 0.8],
  ["technologies_of_self", "perception_politics", 0.8],
  ["technologies_of_self", "track_ethics", 0.75],
  ["technologies_of_self", "community", 0.7],
  ["technologies_of_self", "freire", 0.75],

  ["foucault", "perception_politics", 0.9],
  ["foucault", "critical", 0.9],
  ["foucault", "cultural_critical", 0.85],
  ["foucault", "law", 0.85],
  ["foucault", "epistemology", 0.85],
  ["foucault", "philosophy", 0.9],
  ["foucault", "mediation", 0.8],
  ["foucault", "somatics", 0.8],
  ["foucault", "creative_embodiment", 0.8],
  ["foucault", "fanon", 0.75],
  ["foucault", "bell_hooks", 0.75],
  ["foucault", "crawford", 0.8],
  ["foucault", "essentialism", 0.8],
  ["foucault", "humanism", 0.75],
  ["foucault", "track_ethics", 0.8],
  ["foucault", "epistemologies_south", 0.7],

  ["ai_impact_epistemic", "llm", 0.8],

  ["ai_alignment", "assemblage", 0.8],
  ["ai_alignment", "possible_minds", 0.8],
  ["ai_alignment", "hybrid", 0.75],
  ["ai_alignment", "perception_politics", 0.75],
  ["ai_alignment", "cameron", 0.85],
  ["ai_alignment", "shanahan", 0.8],
  ["ai_alignment", "humanism", 0.45],
  ["ai_alignment", "anthropocentrism", 0.45],

  ["cybernetics", "systems_thinking", 0.95],
  ["cybernetics", "complexity_theory", 0.85],
  ["cybernetics", "bateson", 0.95],
  ["cybernetics", "assemblage", 0.85],
  ["cybernetics", "coregulation", 0.9],
  ["cybernetics", "coupling", 0.85],
  ["cybernetics", "distributed", 0.85],
  ["cybernetics", "technical_agency", 0.8],
  ["cybernetics", "hayles", 0.75],
  ["cybernetics", "ai", 0.75],
  ["cybernetics", "design_thinking", 0.75],
  ["cybernetics", "intelligence", 0.8],
  ["cybernetics", "cognition", 0.85],
  ["cybernetics", "hybrid", 0.85],
  ["cybernetics", "enactivism", 0.75],
  ["cybernetics", "4e", 0.7],
  ["cybernetics", "mediation", 0.8],
  ["cybernetics", "margulis", 0.85],
  ["cybernetics", "symbiosis", 0.8],
  ["cybernetics", "holobiont", 0.8],
  ["cybernetics", "technosymbiosis", 0.75],
  ["cybernetics", "varela", 0.75],
  ["cybernetics", "maturana", 0.85],
  ["cybernetics", "autopoiesis", 0.88],
  ["cybernetics", "thompson", 0.7],
  ["cybernetics", "model_introspection", 0.7],
  ["cybernetics", "active_inference", 0.75],

  ["systems_thinking", "complexity_theory", 0.9],
  ["systems_thinking", "ecology", 0.8],
  ["systems_thinking", "complexity", 0.85],
  ["systems_thinking", "design_thinking", 0.85],
  ["systems_thinking", "ai_alignment", 0.75],
  ["systems_thinking", "enactivism", 0.75],

  ["complexity_theory", "complexity", 0.9],
  ["complexity_theory", "symbiosis", 0.75],
  ["complexity_theory", "akomolafe", 0.75],
  ["complexity_theory", "enactivism", 0.7],
  ["complexity_theory", "design_thinking", 0.75],

  ["design_thinking", "creative", 0.9],
  ["design_thinking", "creative_embodiment", 0.85],
  ["design_thinking", "architecture", 0.85],
  ["design_thinking", "affordances", 0.85],
  ["design_thinking", "track_future", 0.8],
  ["design_thinking", "rehearsal", 0.75],
  ["design_thinking", "pedagogy", 0.75],
  ["design_thinking", "ignite", 0.7],
  ["design_thinking", "entrepreneurship_vision", 0.85],
  ["entrepreneurship_vision", "came", 0.95],
  ["entrepreneurship_vision", "hi_program", 0.9],
  ["entrepreneurship_vision", "ignite", 0.9],
  ["entrepreneurship_vision", "marlon", 0.85],
  ["entrepreneurship_vision", "melissa", 0.85],
  ["entrepreneurship_vision", "track_ethics", 0.8],
  ["entrepreneurship_vision", "speculative_futures", 0.85],
  ["entrepreneurship_vision", "futurity", 0.8],
  ["entrepreneurship_vision", "cultural_imagination", 0.75],
  ["entrepreneurship_vision", "ethical_imagination", 0.75],
  ["entrepreneurship_vision", "interdisciplinary_art", 0.85],
  ["entrepreneurship_vision", "creative", 0.8],
  ["entrepreneurship_vision", "pedagogy", 0.75],
  ["entrepreneurship_vision", "community", 0.75],
  ["entrepreneurship_vision", "social_change", 0.8],
  ["entrepreneurship_vision", "reception", 0.75],
  ["entrepreneurship_vision", "wertheim", 0.7],
  ["entrepreneurship_vision", "hybrid", 0.75],
  ["entrepreneurship_vision", "creative_embodiment", 0.7],
  ["design_thinking", "ai_ml", 0.7],
  ["design_thinking", "speculative_futures", 0.8],

  ["hayles", "creative_ai", 0.8],
  ["track_future", "gen_ai", 0.8],
  ["track_future", "creative_ai", 0.85],
  ["cameron", "llm", 0.75],
  ["cameron", "ai", 0.7],

  ["ai_ml", "ai", 0.95],
  ["ai_ml", "gen_ai", 0.9],
  ["ai_ml", "llm", 0.9],
  ["ai_ml", "creative_ai", 0.85],
  ["ai_ml", "agi", 0.8],
  ["ai_ml", "asi", 0.75],
  ["ai_ml", "cs", 0.95],
  ["ai_ml", "ai_art", 0.9],
  ["ai_ml", "hybrid", 0.85],
  ["ai_ml", "assemblage", 0.8],
  ["ai_ml", "mediation", 0.8],
  ["ai_ml", "ecology", 0.75],
  ["ai_ml", "perception_politics", 0.7],
  ["ai_ml", "technical_agency", 0.85],
  ["ai_ml", "distributed", 0.75],
  ["ai_ml", "creative", 0.75],
  ["ai_ml", "literacies", 0.7],
  ["ai_ml", "architecture", 0.75],
  ["ai_ml", "hayles", 0.8],
  ["ai_ml", "shanahan", 0.75],
  ["ai_ml", "motion_bank", 0.7],
  ["ai_ml", "track_future", 0.85],
  ["ai_ml", "track_ethics", 0.75],
  ["ai_ml", "track_space", 0.8],
  ["ai_ml", "karla", 0.75],
  ["ai_ml", "cameron", 0.7],
  ["ai_ml", "jasmine", 0.7],

  ["choreography_d", "choreography", 0.9],
  ["dance", "choreography_d", 0.9],
  ["dance", "choreography", 0.85],
  ["dance", "choreo_knowledge", 0.75],
  ["dance", "somatics", 0.8],
  ["dance", "interdisciplinary_art", 0.75],
  ["dance", "jackie_larson", 0.85],
  ["dance", "onye", 0.9],
  ["dance", "marlon", 0.85],
  ["choreography_d", "choreo_knowledge", 0.8],
  ["choreography_d", "choreo_object", 0.8],
  ["choreography_d", "onye", 0.85],
  ["choreography_d", "jackie_larson", 0.85],
  ["circus_arts", "cheval_bailie", 0.95],
  ["circus_arts", "juggling", 0.9],
  ["music", "storytelling", 0.75],
  ["music", "andrew_hix", 0.9],
  ["music", "track_future", 0.8],
  ["music", "rehearsal", 0.7],
  ["storytelling", "andrew_hix", 0.9],
  ["storytelling", "mediation", 0.75],
  ["storytelling", "cultural_critical", 0.8],
  ["storytelling", "literacies", 0.7],
  ["interdisciplinary_art", "art", 0.9],
  ["interdisciplinary_art", "creative", 0.85],
  ["interdisciplinary_art", "hybrid", 0.8],
  ["interdisciplinary_art", "came", 0.85],
  ["interdisciplinary_art", "cam", 0.85],
  ["interdisciplinary_art", "turbado_marabou", 0.85],
  ["interdisciplinary_art", "hi_program", 0.75],
  ["generative_arts", "art", 0.95],
  ["generative_arts", "creative", 0.9],
  ["generative_arts", "creativity", 0.9],
  ["generative_arts", "creative_ai", 0.85],
  ["generative_arts", "gen_ai", 0.85],
  ["generative_arts", "ai_art", 0.9],
  ["generative_arts", "machine_learning", 0.8],
  ["generative_arts", "neural_networks", 0.75],
  ["generative_arts", "creative_embodiment", 0.85],
  ["generative_arts", "interdisciplinary_art", 0.9],
  ["generative_arts", "abstraction", 0.85],
  ["generative_arts", "cs", 0.8],
  ["generative_arts", "music", 0.85],
  ["generative_arts", "dance", 0.7],
  ["generative_arts", "choreography", 0.75],
  ["generative_arts", "choreo_knowledge", 0.7],
  ["generative_arts", "motion_bank", 0.75],
  ["generative_arts", "speculative_futures", 0.8],
  ["generative_arts", "cultural_imagination", 0.85],
  ["generative_arts", "intellectual_property", 0.8],
  ["generative_arts", "curation", 0.8],
  ["generative_arts", "track_future", 0.85],
  ["generative_arts", "duchamp", 0.8],
  ["generative_arts", "cage", 0.85],
  ["generative_arts", "yoko_ono", 0.75],
  ["generative_arts", "boden", 0.85],
  ["generative_arts", "marlon", 0.85],
  ["generative_arts", "erika", 0.75],
  ["generative_arts", "forsythe", 0.7],
  ["generative_arts", "vera_molnar", 0.95],
  ["generative_arts", "hybrid", 0.75],
  ["generative_arts", "rehearsal", 0.7],
  ["ai_art", "creative_ai", 0.95],
  ["ai_art", "gen_ai", 0.9],
  ["ai_art", "art", 0.85],
  ["ai_art", "cs", 0.75],
  ["ai_art", "track_future", 0.85],
  ["ai_art", "creative_embodiment", 0.85],
  ["ai_art", "erika", 0.75],

  ["pedagogy", "freire", 0.95],
  ["pedagogy", "literacies", 0.9],
  ["pedagogy", "cultural_critical", 0.85],
  ["pedagogy", "hi_program", 0.85],
  ["pedagogy", "track_ethics", 0.8],
  ["pedagogy", "track_space", 0.75],
  ["pedagogy", "track_future", 0.75],
  ["pedagogy", "creative", 0.8],
  ["pedagogy", "rehearsal", 0.75],
  ["pedagogy", "coupling", 0.7],
  ["pedagogy", "de_jaegher", 0.75],
  ["pedagogy", "cam", 0.7],
  ["pedagogy", "came", 0.75],

  ["art_medicine", "cam", 0.95],
  ["art_medicine", "came", 0.9],
  ["art_medicine", "art", 0.9],
  ["art_medicine", "somatics", 0.9],
  ["art_medicine", "creative_embodiment", 0.9],
  ["art_medicine", "dance", 0.85],
  ["art_medicine", "music", 0.85],
  ["art_medicine", "storytelling", 0.85],
  ["art_medicine", "coregulation", 0.85],
  ["art_medicine", "community", 0.8],
  ["art_medicine", "pedagogy", 0.8],
  ["art_medicine", "interdisciplinary_art", 0.85],
  ["art_medicine", "hi_program", 0.85],
  ["art_medicine", "track_future", 0.8],
  ["art_medicine", "erika", 0.9],
  ["art_medicine", "jackie_larson", 0.9],
  ["art_medicine", "andrew_hix", 0.9],

  ["curation", "art", 0.9],
  ["curation", "motion_bank", 0.9],
  ["curation", "interdisciplinary_art", 0.85],
  ["curation", "storytelling", 0.8],
  ["curation", "ai_art", 0.8],
  ["curation", "architecture", 0.75],
  ["curation", "choreography_d", 0.75],
  ["curation", "creative_embodiment", 0.75],
  ["curation", "track_future", 0.75],
  ["curation", "came", 0.7],
  ["curation", "turbado_marabou", 0.7],

  ["forsythe", "choreo_knowledge", 0.95],
  ["forsythe", "choreo_object", 0.95],
  ["forsythe", "motion_bank", 0.95],
  ["forsythe", "choreography", 0.85],

  ["duchamp", "art", 0.95],
  ["duchamp", "creative", 0.9],
  ["duchamp", "curation", 0.9],
  ["duchamp", "interdisciplinary_art", 0.85],
  ["duchamp", "intellectual_property", 0.85],
  ["duchamp", "abstraction", 0.8],
  ["duchamp", "distributed", 0.75],
  ["duchamp", "cage", 0.85],
  ["duchamp", "yoko_ono", 0.75],
  ["duchamp", "fluxus", 0.9],

  ["saul_leiter", "art", 0.95],
  ["saul_leiter", "creative", 0.85],
  ["saul_leiter", "abstraction", 0.9],
  ["saul_leiter", "creative_embodiment", 0.8],
  ["saul_leiter", "situated", 0.8],
  ["saul_leiter", "interdisciplinary_art", 0.8],
  ["saul_leiter", "curation", 0.75],
  ["saul_leiter", "perception_politics", 0.7],
  ["saul_leiter", "duchamp", 0.7],
  ["saul_leiter", "cage", 0.75],
  ["vera_molnar", "generative_arts", 0.95],
  ["vera_molnar", "creativity", 0.9],
  ["vera_molnar", "art", 0.9],
  ["vera_molnar", "creative", 0.85],
  ["vera_molnar", "abstraction", 0.95],
  ["vera_molnar", "cs", 0.85],
  ["vera_molnar", "gen_ai", 0.75],
  ["vera_molnar", "machine_learning", 0.7],
  ["vera_molnar", "ai_art", 0.8],
  ["vera_molnar", "creative_ai", 0.75],
  ["vera_molnar", "interdisciplinary_art", 0.85],
  ["vera_molnar", "boden", 0.85],
  ["vera_molnar", "cage", 0.8],
  ["vera_molnar", "duchamp", 0.75],
  ["vera_molnar", "intellectual_property", 0.75],
  ["vera_molnar", "curation", 0.8],

  ["ana_mendieta", "art", 0.95],
  ["ana_mendieta", "creative", 0.9],
  ["ana_mendieta", "creative_embodiment", 0.95],
  ["ana_mendieta", "embodiment", 0.9],
  ["ana_mendieta", "body", 0.95],
  ["ana_mendieta", "somatics", 0.85],
  ["ana_mendieta", "cultural_critical", 0.85],
  ["ana_mendieta", "perception_politics", 0.85],
  ["ana_mendieta", "interdisciplinary_art", 0.9],
  ["ana_mendieta", "ecology_d", 0.85],
  ["ana_mendieta", "situated", 0.85],
  ["ana_mendieta", "rehearsal", 0.8],
  ["ana_mendieta", "storytelling", 0.8],
  ["ana_mendieta", "community", 0.75],
  ["ana_mendieta", "social_change", 0.8],
  ["ana_mendieta", "hybrid", 0.75],
  ["ana_mendieta", "cyberfeminism", 0.8],
  ["ana_mendieta", "haraway", 0.75],
  ["ana_mendieta", "barad", 0.7],
  ["ana_mendieta", "fanon", 0.75],
  ["ana_mendieta", "bell_hooks", 0.75],
  ["ana_mendieta", "munoz", 0.75],
  ["ana_mendieta", "yoko_ono", 0.75],
  ["ana_mendieta", "trisha_brown", 0.7],
  ["ana_mendieta", "escobar", 0.7],
  ["ana_mendieta", "leigh_bowery", 0.7],

  ["leigh_bowery", "art", 0.95],
  ["leigh_bowery", "creative", 0.9],
  ["leigh_bowery", "queer_theory", 0.95],
  ["leigh_bowery", "munoz", 0.9],
  ["leigh_bowery", "cultural_critical", 0.85],
  ["leigh_bowery", "creative_embodiment", 0.9],
  ["leigh_bowery", "embodiment", 0.85],
  ["leigh_bowery", "body", 0.85],
  ["leigh_bowery", "interdisciplinary_art", 0.9],
  ["leigh_bowery", "dance", 0.8],
  ["leigh_bowery", "choreography", 0.75],
  ["leigh_bowery", "rehearsal", 0.85],
  ["leigh_bowery", "community", 0.85],
  ["leigh_bowery", "social_change", 0.8],
  ["leigh_bowery", "cultural_imagination", 0.85],
  ["leigh_bowery", "futurity", 0.75],
  ["leigh_bowery", "hybrid", 0.8],
  ["leigh_bowery", "essentialism", 0.8],
  ["leigh_bowery", "track_future", 0.75],
  ["leigh_bowery", "technologies_of_self", 0.8],
  ["leigh_bowery", "foucault", 0.75],
  ["leigh_bowery", "speculative_futures", 0.75],
  ["leigh_bowery", "somatics", 0.8],
  ["leigh_bowery", "cage", 0.7],
  ["leigh_bowery", "duchamp", 0.7],

  ["cage", "music", 0.95],
  ["cage", "art", 0.85],
  ["cage", "creative", 0.9],
  ["cage", "enacted", 0.85],
  ["cage", "rehearsal", 0.8],
  ["cage", "interdisciplinary_art", 0.85],
  ["cage", "yoko_ono", 0.8],
  ["cage", "fluxus", 0.95],

  ["yoko_ono", "art", 0.9],
  ["yoko_ono", "interdisciplinary_art", 0.9],
  ["yoko_ono", "creative", 0.85],
  ["yoko_ono", "community", 0.8],
  ["yoko_ono", "cultural_imagination", 0.8],
  ["yoko_ono", "de_jaegher", 0.75],
  ["yoko_ono", "fluxus", 0.95],

  ["trisha_brown", "dance", 0.95],
  ["trisha_brown", "choreography_d", 0.95],
  ["trisha_brown", "choreography", 0.95],
  ["trisha_brown", "choreo_knowledge", 0.7],
  ["trisha_brown", "somatics", 0.85],
  ["trisha_brown", "embodied", 0.85],
  ["trisha_brown", "creative_embodiment", 0.85],
  ["trisha_brown", "forsythe", 0.8],
  ["trisha_brown", "onye", 0.85],
  ["trisha_brown", "marlon", 0.8],
  ["trisha_brown", "architecture", 0.75],
  ["trisha_brown", "steve_paxton", 0.95],
  ["trisha_brown", "judson_church", 0.95],

  ["steve_paxton", "judson_church", 0.95],
  ["steve_paxton", "trisha_brown", 0.95],
  ["steve_paxton", "dance", 0.95],
  ["steve_paxton", "choreography", 0.95],
  ["steve_paxton", "choreography_d", 0.95],
  ["steve_paxton", "somatics", 0.9],
  ["steve_paxton", "embodied", 0.9],
  ["steve_paxton", "creative_embodiment", 0.9],
  ["steve_paxton", "coupling", 0.85],
  ["steve_paxton", "coregulation", 0.85],
  ["steve_paxton", "rehearsal", 0.85],
  ["steve_paxton", "community", 0.8],
  ["steve_paxton", "art", 0.85],
  ["steve_paxton", "creative", 0.85],
  ["steve_paxton", "marlon", 0.85],
  ["steve_paxton", "onye", 0.8],
  ["steve_paxton", "forsythe", 0.75],
  ["steve_paxton", "de_jaegher", 0.8],
  ["steve_paxton", "enactivism", 0.75],
  ["steve_paxton", "juggling", 0.75],
  ["steve_paxton", "track_space", 0.75],
  ["steve_paxton", "fluxus", 0.7],

  ["judson_church", "dance", 0.95],
  ["judson_church", "choreography", 0.9],
  ["judson_church", "choreography_d", 0.9],
  ["judson_church", "art", 0.85],
  ["judson_church", "interdisciplinary_art", 0.85],
  ["judson_church", "somatics", 0.8],
  ["judson_church", "embodied", 0.85],
  ["judson_church", "creative_embodiment", 0.85],
  ["judson_church", "community", 0.8],
  ["judson_church", "marlon", 0.75],
  ["judson_church", "onye", 0.8],
  ["judson_church", "architecture", 0.7],
  ["judson_church", "fluxus", 0.7],
  ["judson_church", "cage", 0.75],
  ["judson_church", "yoko_ono", 0.7],
  ["judson_church", "rehearsal", 0.8],

  ["choreo_knowledge", "choreo_object", 0.9],
  ["choreo_knowledge", "motion_bank", 0.9],
  ["choreo_object", "motion_bank", 0.85],
  ["choreo_knowledge", "embodied", 0.85],
  ["choreo_knowledge", "enacted", 0.9],
  ["choreo_knowledge", "distributed", 0.85],
  ["choreo_knowledge", "creative_embodiment", 0.9],
  ["choreo_knowledge", "kirsh", 0.9],
  ["choreo_knowledge", "epistemology", 0.8],
  ["choreo_knowledge", "abstraction", 0.75],
  ["choreo_knowledge", "literacies", 0.8],
  ["choreo_object", "distributed", 0.85],
  ["choreo_object", "coupling", 0.8],
  ["choreo_object", "abstraction", 0.75],
  ["choreo_object", "creative_embodiment", 0.85],
  ["choreo_object", "rehearsal", 0.75],
  ["choreography", "choreo_object", 0.8],
  ["choreography", "rehearsal", 0.9],
  ["choreography", "enacted", 0.85],
  ["motion_bank", "cs", 0.85],
  ["motion_bank", "assemblage", 0.8],
  ["motion_bank", "mediation", 0.75],
  ["motion_bank", "architecture", 0.7],
  ["motion_bank", "literacies", 0.75],
  ["motion_bank", "gen_ai", 0.7],
  ["marlon", "erika", 0.95],
  ["marlon", "ai", 0.85],
  ["marlon", "creative_ai", 0.9],
  ["marlon", "forsythe", 0.85],
  ["onye", "forsythe", 0.9],
  ["cheval_bailie", "choreo_object", 0.75],

  ["art", "creative", 0.9],
  ["art", "rehearsal", 0.85],
  ["art", "cultural_critical", 0.9],
  ["art", "creative_embodiment", 0.85],
  ["complexity", "hybrid", 0.8],
  ["complexity", "assemblage", 0.75],
  ["complexity", "philosophy", 0.8],
  ["complexity", "critical", 0.85],
  ["complexity", "literacies", 0.75],
  ["cultural_critical", "critical", 0.95],
  ["cultural_critical", "perception_politics", 0.9],
  ["cultural_critical", "law", 0.8],
  ["cultural_critical", "creative_embodiment", 0.85],
  ["cultural_critical", "track_ethics", 0.8],
  ["cultural_critical", "jasmine", 0.75],
  ["choreo_knowledge", "choreography", 0.88],
  ["choreo_knowledge", "somatics", 0.8],
  ["somatics", "coregulation", 0.9],
  ["somatics", "vipassana", 0.9],
  ["vipassana", "buddhism", 0.98],
  ["vipassana", "enactivism", 0.92],
  ["vipassana", "embodiment", 0.9],
  ["vipassana", "cognition", 0.88],
  ["vipassana", "varela", 0.92],
  ["vipassana", "thompson", 0.82],
  ["vipassana", "rosch", 0.88],
  ["vipassana", "somatics", 0.9],
  ["vipassana", "assemblage", 0.78],
  ["vipassana", "coupling", 0.82],
  ["vipassana", "4e", 0.82],
  ["vipassana", "embodied", 0.88],
  ["vipassana", "consciousness", 0.85],
  ["vipassana", "technologies_of_self", 0.8],
  ["vipassana", "autopoiesis", 0.72],
  ["vipassana", "nagarjuna", 0.7],
  ["vipassana", "creative_embodiment", 0.72],
  ["vipassana", "rehearsal", 0.7],
  ["complexity", "choreo_knowledge", 0.7],
  ["cultural_critical", "somatics", 0.7],
  ["marlon", "choreo_knowledge", 0.85],

  ["creative_embodiment", "creative", 0.95],
  ["creative_embodiment", "embodied", 0.9],
  ["creative_embodiment", "art", 0.85],
  ["creative_embodiment", "choreography", 0.85],
  ["creative_embodiment", "choreo_knowledge", 0.9],
  ["creative_embodiment", "architecture", 0.8],
  ["creative_embodiment", "somatics", 0.85],
  ["creative_embodiment", "hi_program", 0.9],
  ["creative_embodiment", "came", 0.85],
  ["creative_embodiment", "abstraction", 0.85],

  ["clark", "cyborg", 0.95],
  ["clark", "extended", 0.95],
  ["clark", "4e", 0.9],
  ["clark", "extended_q", 0.85],
  ["clark", "situated", 0.8],
  ["clark", "wilson", 0.75],
  ["hayles", "assemblage", 0.95],
  ["hayles", "technosymbiosis", 0.95],
  ["hayles", "technical_agency", 0.85],
  ["hayles", "mediation", 0.8],
  ["thompson", "enactivism", 0.95],
  ["thompson", "4e", 0.85],
  ["thompson", "embodied", 0.8],
  ["thompson", "varela", 0.9],
  ["thompson", "rosch", 0.85],
  ["thompson", "buddhism", 0.85],
  ["thompson", "vipassana", 0.8],
  ["thompson", "nagarjuna", 0.8],
  ["thompson", "merleau_ponty", 0.9],
  ["thompson", "autopoiesis", 0.88],
  ["maturana", "autopoiesis", 0.98],
  ["maturana", "varela", 0.95],
  ["maturana", "enactivism", 0.88],
  ["maturana", "coupling", 0.9],
  ["maturana", "cognition", 0.85],
  ["maturana", "cybernetics", 0.88],
  ["maturana", "embodiment", 0.8],
  ["maturana", "epistemology", 0.8],
  ["maturana", "thompson", 0.8],
  ["varela", "autopoiesis", 0.98],
  ["varela", "maturana", 0.95],
  ["varela", "enactivism", 0.95],
  ["varela", "4e", 0.85],
  ["varela", "embodied", 0.8],
  ["varela", "rosch", 0.9],
  ["varela", "buddhism", 0.9],
  ["varela", "vipassana", 0.9],
  ["varela", "nagarjuna", 0.85],
  ["varela", "merleau_ponty", 0.9],
  ["varela", "coupling", 0.85],
  ["varela", "cybernetics", 0.82],

  ["merleau_ponty", "enactivism", 0.95],
  ["merleau_ponty", "embodiment", 0.95],
  ["merleau_ponty", "embodied", 0.95],
  ["merleau_ponty", "enacted", 0.9],
  ["merleau_ponty", "4e", 0.85],
  ["merleau_ponty", "thompson", 0.9],
  ["merleau_ponty", "varela", 0.9],
  ["merleau_ponty", "rosch", 0.85],
  ["merleau_ponty", "gallagher", 0.9],
  ["merleau_ponty", "noe", 0.9],
  ["merleau_ponty", "gibson", 0.85],
  ["merleau_ponty", "affordances", 0.9],
  ["merleau_ponty", "umwelt", 0.8],
  ["merleau_ponty", "philosophy", 0.9],
  ["merleau_ponty", "consciousness", 0.85],
  ["merleau_ponty", "epistemology", 0.8],
  ["merleau_ponty", "somatics", 0.85],
  ["merleau_ponty", "creative_embodiment", 0.85],
  ["merleau_ponty", "body", 0.9],
  ["merleau_ponty", "coupling", 0.8],
  ["merleau_ponty", "situated", 0.85],
  ["merleau_ponty", "buddhism", 0.7],
  ["merleau_ponty", "nagarjuna", 0.65],
  ["merleau_ponty", "barad", 0.75],
  ["merleau_ponty", "steve_paxton", 0.75],
  ["merleau_ponty", "trisha_brown", 0.75],
  ["merleau_ponty", "choreography", 0.75],
  ["merleau_ponty", "clark", 0.75],
  ["merleau_ponty", "brooks", 0.7],
  ["merleau_ponty", "active_inference", 0.7],

  ["margulis", "symbiosis", 0.95],
  ["margulis", "ecology_d", 0.8],
  ["margulis", "enactivism", 0.7],
  ["margulis", "technosymbiosis", 0.85],

  ["bateson", "ecology", 0.95],
  ["bateson", "ecology_d", 0.9],
  ["bateson", "coupling", 0.9],
  ["bateson", "margulis", 0.9],
  ["bateson", "symbiosis", 0.85],
  ["bateson", "assemblage", 0.85],
  ["bateson", "hybrid", 0.8],
  ["bateson", "enactivism", 0.8],
  ["bateson", "4e", 0.75],
  ["bateson", "coregulation", 0.85],
  ["bateson", "complexity", 0.85],
  ["bateson", "gibson", 0.8],
  ["bateson", "de_jaegher", 0.75],
  ["bateson", "community", 0.75],
  ["bateson", "perception_politics", 0.7],
  ["bateson", "cybernetics", 0.95],
  ["bateson", "intelligence", 0.85],
  ["bateson", "cognition", 0.85],
  ["bateson", "holobiont", 0.8],
  ["bateson", "technosymbiosis", 0.8],
  ["bateson", "hayles", 0.85],
  ["bateson", "friston", 0.7],
  ["bateson", "active_inference", 0.75],
  ["bateson", "akomolafe", 0.7],

  ["gibson", "embedded", 0.9],
  ["gibson", "architecture", 0.8],
  ["gibson", "ecology", 0.75],
  ["gallagher", "embodied", 0.9],
  ["gallagher", "4e", 0.8],
  ["gallagher", "somatics", 0.7],
  ["noe", "enacted", 0.9],
  ["noe", "embodied", 0.85],
  ["noe", "enactivism", 0.8],
  ["malafouris", "extended", 0.85],
  ["malafouris", "extended_q", 0.85],
  ["malafouris", "creative", 0.7],
  ["chalmers", "extended", 0.95],
  ["chalmers", "extended_q", 0.85],
  ["chalmers", "clark", 0.9],
  ["de_jaegher", "enactivism", 0.9],
  ["de_jaegher", "coupling", 0.85],
  ["de_jaegher", "coregulation", 0.8],
  ["de_jaegher", "di_paolo", 0.85],
  ["de_jaegher", "cuffari", 0.8],
  ["de_jaegher", "autopoiesis", 0.8],
  ["di_paolo", "enactivism", 0.9],
  ["di_paolo", "enacted", 0.8],
  ["di_paolo", "coupling", 0.75],
  ["di_paolo", "cuffari", 0.85],
  ["di_paolo", "autopoiesis", 0.85],
  ["di_paolo", "maturana", 0.75],
  ["di_paolo", "varela", 0.8],
  ["shanahan", "possible_minds", 0.95],
  ["boden", "ai", 0.95],
  ["boden", "gen_ai", 0.85],
  ["boden", "ai_ml", 0.9],
  ["boden", "machine_learning", 0.85],
  ["boden", "neural_networks", 0.75],
  ["boden", "creative_ai", 0.95],
  ["boden", "creativity", 0.95],
  ["boden", "possible_minds", 0.9],
  ["boden", "cognition", 0.9],
  ["boden", "intelligence", 0.9],
  ["boden", "synthetic_cognition", 0.85],
  ["boden", "consciousness", 0.8],
  ["boden", "philosophy", 0.85],
  ["boden", "cs", 0.85],
  ["boden", "art", 0.85],
  ["boden", "creative", 0.9],
  ["boden", "ai_art", 0.85],
  ["boden", "cultural_imagination", 0.8],
  ["boden", "speculative_futures", 0.75],
  ["boden", "intellectual_property", 0.7],
  ["boden", "ai_interpretability", 0.75],
  ["boden", "shanahan", 0.85],
  ["boden", "chalmers", 0.75],
  ["boden", "brooks", 0.8],
  ["boden", "aguilera_arcas", 0.75],
  ["boden", "hayles", 0.75],
  ["boden", "crawford", 0.7],
  ["boden", "duchamp", 0.7],
  ["boden", "vera_molnar", 0.85],
  ["shapiro", "embodied", 0.85],
  ["shapiro", "4e", 0.8],
  ["kirsh", "choreo_knowledge", 0.9],
  ["kirsh", "embodied", 0.8],
  ["kirsh", "extended_q", 0.75],
  ["carney", "4e", 0.9],
  ["wilson", "situated", 0.85],
  ["wilson", "embedded", 0.8],
  ["wilson", "4e", 0.75],
  ["rosch", "enactivism", 0.85],
  ["rosch", "embodied", 0.75],
  ["rosch", "buddhism", 0.9],
  ["rosch", "vipassana", 0.85],

  ["nagarjuna", "buddhism", 0.95],
  ["nagarjuna", "philosophy", 0.9],
  ["nagarjuna", "epistemology", 0.9],
  ["nagarjuna", "enactivism", 0.85],
  ["nagarjuna", "varela", 0.85],
  ["nagarjuna", "rosch", 0.8],
  ["nagarjuna", "thompson", 0.8],
  ["nagarjuna", "essentialism", 0.9],
  ["nagarjuna", "universalism", 0.75],
  ["nagarjuna", "humanism", 0.65],
  ["nagarjuna", "consciousness", 0.8],
  ["nagarjuna", "embodied", 0.75],
  ["nagarjuna", "complexity", 0.7],
  ["nagarjuna", "assemblage", 0.7],
  ["nagarjuna", "coupling", 0.75],
  ["nagarjuna", "barad", 0.7],
  ["nagarjuna", "bateson", 0.7],

  ["cuffari", "di_paolo", 0.85],
  ["cuffari", "de_jaegher", 0.8],
  ["cuffari", "coupling", 0.7],

  ["akomolafe", "hybrid", 0.85],
  ["akomolafe", "philosophy", 0.85],
  ["akomolafe", "cultural_critical", 0.9],
  ["akomolafe", "enactivism", 0.8],
  ["akomolafe", "complexity", 0.8],
  ["akomolafe", "ecology", 0.75],
  ["akomolafe", "possible_minds", 0.75],
  ["akomolafe", "track_future", 0.75],

  ["freire", "cultural_critical", 0.95],
  ["freire", "critical", 0.9],
  ["freire", "literacies", 0.9],
  ["freire", "philosophy", 0.85],
  ["freire", "track_ethics", 0.8],
  ["freire", "coupling", 0.75],
  ["freire", "enactivism", 0.75],
  ["freire", "de_jaegher", 0.8],
  ["freire", "creative_embodiment", 0.7],

  ["braidotti", "hybrid", 0.9],
  ["braidotti", "hayles", 0.85],
  ["braidotti", "philosophy", 0.9],
  ["braidotti", "cultural_critical", 0.9],
  ["braidotti", "critical", 0.85],
  ["braidotti", "creative_embodiment", 0.85],
  ["braidotti", "embodied", 0.8],
  ["braidotti", "technosymbiosis", 0.75],
  ["braidotti", "possible_minds", 0.75],
  ["braidotti", "track_ethics", 0.8],
  ["braidotti", "track_future", 0.75],

  ["haraway", "cyborg", 0.95],
  ["haraway", "technosymbiosis", 0.9],
  ["haraway", "hybrid", 0.9],
  ["haraway", "hayles", 0.9],
  ["haraway", "braidotti", 0.9],
  ["haraway", "posthumanism", 0.85],
  ["haraway", "assemblage", 0.85],
  ["haraway", "symbiosis", 0.85],
  ["haraway", "margulis", 0.8],
  ["haraway", "cultural_critical", 0.85],
  ["haraway", "critical", 0.8],
  ["haraway", "situated", 0.9],
  ["haraway", "distributed", 0.8],
  ["haraway", "creative_ai", 0.75],
  ["haraway", "speculative_futures", 0.8],
  ["haraway", "anthropocentrism", 0.85],
  ["haraway", "essentialism", 0.85],
  ["haraway", "humanism", 0.8],

  ["cyberfeminism", "haraway", 0.95],
  ["cyberfeminism", "cyborg", 0.9],
  ["cyberfeminism", "crawford", 0.85],
  ["cyberfeminism", "ai_impact_ethics", 0.9],
  ["cyberfeminism", "cultural_critical", 0.85],
  ["cyberfeminism", "situated", 0.85],
  ["cyberfeminism", "hybrid", 0.8],
  ["cyberfeminism", "technical_agency", 0.8],
  ["cyberfeminism", "braidotti", 0.8],
  ["cyberfeminism", "creative_ai", 0.75],
  ["cyberfeminism", "ai", 0.75],
  ["cyberfeminism", "track_ethics", 0.8],
  ["cyberfeminism", "posthumanism", 0.75],
  ["cyberfeminism", "essentialism", 0.8],
  ["cyberfeminism", "queer_theory", 0.85],

  ["queer_theory", "munoz", 0.95],
  ["queer_theory", "cultural_critical", 0.9],
  ["queer_theory", "futurity", 0.9],
  ["queer_theory", "speculative_futures", 0.85],
  ["queer_theory", "bell_hooks", 0.85],
  ["queer_theory", "technologies_of_self", 0.8],
  ["queer_theory", "art", 0.8],
  ["queer_theory", "creative", 0.8],
  ["queer_theory", "social_change", 0.85],
  ["queer_theory", "community", 0.8],
  ["queer_theory", "rehearsal", 0.75],
  ["queer_theory", "essentialism", 0.85],
  ["queer_theory", "humanism", 0.7],
  ["queer_theory", "hybrid", 0.75],
  ["queer_theory", "track_future", 0.85],
  ["queer_theory", "afrofuturism", 0.75],
  ["queer_theory", "perception_politics", 0.8],
  ["queer_theory", "ethical_imagination", 0.75],
  ["queer_theory", "fanon", 0.7],

  ["barad", "haraway", 0.9],
  ["barad", "braidotti", 0.85],
  ["barad", "coupling", 0.9],
  ["barad", "assemblage", 0.9],
  ["barad", "enactivism", 0.85],
  ["barad", "enacted", 0.85],
  ["barad", "embodied", 0.85],
  ["barad", "hybrid", 0.85],
  ["barad", "posthumanism", 0.85],
  ["barad", "distributed", 0.85],
  ["barad", "technical_agency", 0.8],
  ["barad", "situated", 0.9],
  ["barad", "creative_embodiment", 0.85],
  ["barad", "perception_politics", 0.8],
  ["barad", "essentialism", 0.9],
  ["barad", "philosophy", 0.8],
  ["barad", "ai_ml", 0.7],

  ["latour", "assemblage", 0.95],
  ["latour", "distributed", 0.95],
  ["latour", "technical_agency", 0.95],
  ["latour", "hybrid", 0.9],
  ["latour", "coupling", 0.85],
  ["latour", "haraway", 0.9],
  ["latour", "barad", 0.85],
  ["latour", "hayles", 0.85],
  ["latour", "crawford", 0.9],
  ["latour", "epistemology", 0.9],
  ["latour", "philosophy", 0.85],
  ["latour", "situated", 0.85],
  ["latour", "mediation", 0.85],
  ["latour", "cultural_critical", 0.85],
  ["latour", "critical", 0.8],
  ["latour", "ai", 0.8],
  ["latour", "ai_ml", 0.8],
  ["latour", "ai_impact_epistemic", 0.85],
  ["latour", "ai_impact_environment", 0.8],
  ["latour", "creative_embodiment", 0.8],
  ["latour", "creative", 0.75],
  ["latour", "posthumanism", 0.8],
  ["latour", "anthropocentrism", 0.85],
  ["latour", "humanism", 0.8],
  ["latour", "systems_thinking", 0.8],
  ["latour", "complexity_theory", 0.75],
  ["latour", "cybernetics", 0.75],
  ["latour", "escobar", 0.75],
  ["latour", "bateson", 0.75],
  ["latour", "technosymbiosis", 0.8],
  ["latour", "track_ethics", 0.8],
  ["latour", "perception_politics", 0.8],
  ["latour", "duchamp", 0.7],
  ["latour", "enactivism", 0.7],

  ["fanon", "cultural_critical", 0.95],
  ["fanon", "critical", 0.95],
  ["fanon", "perception_politics", 0.9],
  ["fanon", "creative_embodiment", 0.85],
  ["fanon", "embodied", 0.85],
  ["fanon", "philosophy", 0.85],
  ["fanon", "somatics", 0.75],
  ["fanon", "law", 0.75],
  ["fanon", "track_ethics", 0.85],
  ["fanon", "freire", 0.8],

  ["bell_hooks", "cultural_critical", 0.95],
  ["bell_hooks", "pedagogy", 0.9],
  ["bell_hooks", "freire", 0.9],
  ["bell_hooks", "community", 0.9],
  ["bell_hooks", "critical", 0.9],
  ["bell_hooks", "fanon", 0.85],
  ["bell_hooks", "creative_embodiment", 0.85],
  ["bell_hooks", "somatics", 0.8],
  ["bell_hooks", "ethical_imagination", 0.8],
  ["bell_hooks", "social_change", 0.85],
  ["bell_hooks", "essentialism", 0.85],
  ["bell_hooks", "track_ethics", 0.8],
  ["bell_hooks", "storytelling", 0.75],
  ["bell_hooks", "braidotti", 0.75],

  ["munoz", "futurity", 0.95],
  ["munoz", "speculative_futures", 0.9],
  ["munoz", "cultural_imagination", 0.9],
  ["munoz", "track_future", 0.85],
  ["munoz", "art", 0.85],
  ["munoz", "creative", 0.85],
  ["munoz", "rehearsal", 0.8],
  ["munoz", "interdisciplinary_art", 0.85],
  ["munoz", "dance", 0.8],
  ["munoz", "community", 0.8],
  ["munoz", "social_change", 0.8],
  ["munoz", "cultural_critical", 0.85],
  ["munoz", "ethical_imagination", 0.75],
  ["munoz", "storytelling", 0.75],
  ["munoz", "cage", 0.7],

  ["embodied", "somatics", 0.9],
  ["embodied", "choreography", 0.8],
  ["embodied", "choreo_knowledge", 0.85],
  ["embedded", "architecture", 0.9],
  ["embedded", "situated", 0.85],
  ["enacted", "choreo_knowledge", 0.85],
  ["enacted", "rehearsal", 0.75],
  ["extended_q", "cs", 0.7],
  ["critical", "law", 0.85],
  ["critical", "perception_politics", 0.9],
  ["situated", "architecture", 0.85],
  ["situated", "creative", 0.7],
  ["distributed", "choreo_knowledge", 0.85],
  ["technical_agency", "cs", 0.8],
  ["technical_agency", "law", 0.7],

  ["ecology", "coregulation", 0.8],
  ["ecology", "ecology_d", 0.85],
  ["symbiosis", "coupling", 0.85],
  ["symbiosis", "hybrid", 0.85],
  ["symbiosis", "coregulation", 0.8],
  ["symbiosis", "ecology", 0.8],

  ["community", "coupling", 0.9],
  ["community", "coregulation", 0.85],
  ["community", "hybrid", 0.8],
  ["community", "de_jaegher", 0.85],
  ["community", "symbiosis", 0.75],
  ["community", "ecology", 0.75],
  ["community", "reception", 0.85],
  ["community", "hi_program", 0.8],
  ["community", "pedagogy", 0.75],
  ["community", "cam", 0.8],
  ["community", "came", 0.75],
  ["community", "storytelling", 0.75],
  ["community", "social_change", 0.85],
  ["community", "cultural_imagination", 0.8],

  ["social_change", "freire", 0.9],
  ["social_change", "fanon", 0.9],
  ["social_change", "cultural_critical", 0.9],
  ["social_change", "critical", 0.85],
  ["social_change", "perception_politics", 0.85],
  ["social_change", "track_ethics", 0.8],
  ["social_change", "law", 0.75],
  ["social_change", "reception", 0.8],
  ["social_change", "pedagogy", 0.8],
  ["social_change", "cultural_imagination", 0.85],
  ["social_change", "akomolafe", 0.75],

  ["theory_of_mind", "possible_minds", 0.9],
  ["theory_of_mind", "coupling", 0.85],
  ["theory_of_mind", "coregulation", 0.85],
  ["theory_of_mind", "community", 0.8],
  ["theory_of_mind", "ai", 0.85],
  ["theory_of_mind", "agi", 0.85],
  ["theory_of_mind", "llm", 0.8],
  ["theory_of_mind", "4e", 0.75],
  ["theory_of_mind", "enactivism", 0.75],
  ["theory_of_mind", "de_jaegher", 0.85],
  ["theory_of_mind", "chalmers", 0.8],
  ["theory_of_mind", "shanahan", 0.85],
  ["theory_of_mind", "cameron", 0.8],
  ["theory_of_mind", "philosophy", 0.8],
  ["theory_of_mind", "epistemology", 0.75],
  ["theory_of_mind", "hybrid", 0.75],
  ["theory_of_mind", "creative_embodiment", 0.7],
  ["theory_of_mind", "perception_politics", 0.7],

  ["cultural_imagination", "storytelling", 0.9],
  ["cultural_imagination", "art", 0.85],
  ["cultural_imagination", "track_future", 0.9],
  ["cultural_imagination", "possible_minds", 0.85],
  ["cultural_imagination", "creative", 0.85],
  ["cultural_imagination", "rehearsal", 0.8],
  ["cultural_imagination", "abstraction", 0.75],
  ["cultural_imagination", "interdisciplinary_art", 0.85],
  ["cultural_imagination", "turbado_marabou", 0.8],
  ["cultural_imagination", "akomolafe", 0.75],
  ["cultural_imagination", "braidotti", 0.75],

  ["futurity", "speculative_futures", 0.95],
  ["futurity", "cultural_imagination", 0.9],
  ["futurity", "track_future", 0.9],
  ["futurity", "possible_minds", 0.85],
  ["futurity", "hybrid", 0.85],
  ["futurity", "mediation", 0.8],
  ["futurity", "rehearsal", 0.85],
  ["futurity", "creative", 0.8],
  ["futurity", "technosymbiosis", 0.75],
  ["futurity", "social_change", 0.75],
  ["futurity", "akomolafe", 0.8],
  ["futurity", "braidotti", 0.75],

  ["ethical_imagination", "cultural_imagination", 0.9],
  ["ethical_imagination", "critical", 0.9],
  ["ethical_imagination", "cultural_critical", 0.85],
  ["ethical_imagination", "track_ethics", 0.9],
  ["ethical_imagination", "law", 0.85],
  ["ethical_imagination", "philosophy", 0.8],
  ["ethical_imagination", "pedagogy", 0.8],
  ["ethical_imagination", "social_change", 0.85],
  ["ethical_imagination", "futurity", 0.85],
  ["ethical_imagination", "creative_embodiment", 0.8],
  ["ethical_imagination", "freire", 0.85],
  ["ethical_imagination", "fanon", 0.85],
  ["ethical_imagination", "braidotti", 0.8],
  ["ethical_imagination", "cameron", 0.8],
  ["ethical_imagination", "jasmine", 0.8],
  ["ethical_imagination", "perception_politics", 0.75],

  ["speculative_futures", "track_future", 0.95],
  ["speculative_futures", "possible_minds", 0.9],
  ["speculative_futures", "creative_ai", 0.85],
  ["speculative_futures", "gen_ai", 0.8],
  ["speculative_futures", "art", 0.85],
  ["speculative_futures", "creative", 0.9],
  ["speculative_futures", "rehearsal", 0.85],
  ["speculative_futures", "cultural_imagination", 0.9],
  ["speculative_futures", "ai_art", 0.8],
  ["speculative_futures", "interdisciplinary_art", 0.85],
  ["speculative_futures", "storytelling", 0.8],
  ["speculative_futures", "shanahan", 0.8],
  ["speculative_futures", "jackie_larson", 0.8],
  ["speculative_futures", "andrew_hix", 0.75],
  ["speculative_futures", "turbado_marabou", 0.75],

  ["afrofuturism", "butler", 0.95],
  ["afrofuturism", "speculative_futures", 0.9],
  ["afrofuturism", "futurity", 0.9],
  ["afrofuturism", "cultural_imagination", 0.9],
  ["afrofuturism", "track_future", 0.85],
  ["afrofuturism", "storytelling", 0.85],
  ["afrofuturism", "art", 0.85],
  ["afrofuturism", "interdisciplinary_art", 0.85],
  ["afrofuturism", "music", 0.8],
  ["afrofuturism", "munoz", 0.8],
  ["afrofuturism", "akomolafe", 0.75],
  ["afrofuturism", "hybrid", 0.75],
  ["afrofuturism", "social_change", 0.8],
  ["afrofuturism", "creative", 0.8],
  ["afrofuturism", "turbado_marabou", 0.75],

  ["fluxus", "cage", 0.95],
  ["fluxus", "yoko_ono", 0.95],
  ["fluxus", "duchamp", 0.9],
  ["fluxus", "art", 0.9],
  ["fluxus", "creative", 0.9],
  ["fluxus", "interdisciplinary_art", 0.95],
  ["fluxus", "generative_arts", 0.8],
  ["fluxus", "rehearsal", 0.75],
  ["fluxus", "community", 0.75],
  ["fluxus", "cultural_imagination", 0.8],
  ["fluxus", "enacted", 0.75],
  ["fluxus", "distributed", 0.7],
  ["fluxus", "intellectual_property", 0.7],
  ["fluxus", "vera_molnar", 0.7],
  ["fluxus", "steve_paxton", 0.7],
  ["fluxus", "judson_church", 0.7],
  ["fluxus", "creative_ai", 0.65],

  ["abstraction", "architecture", 0.7],
  ["abstraction", "creative", 0.75],
  ["abstraction", "philosophy", 0.7],
  ["perception_politics", "law", 0.75],
  ["perception_politics", "critical", 0.85],

  ["architecture", "choreography", 0.8],
  ["architecture", "choreography_d", 0.75],
  ["architecture", "mediation", 0.7],
  ["architecture", "arch_design", 0.95],
  ["arch_design", "design_thinking", 0.9],
  ["arch_design", "creative", 0.85],
  ["arch_design", "creative_embodiment", 0.85],
  ["arch_design", "affordances", 0.9],
  ["arch_design", "track_space", 0.9],
  ["arch_design", "karla", 0.9],
  ["arch_design", "wertheim", 0.75],
  ["arch_design", "rehearsal", 0.75],
  ["arch_design", "hybrid", 0.8],
  ["arch_design", "literacies", 0.75],
  ["choreography", "juggling", 0.85],
  ["choreography", "hybrid", 0.7],
  ["somatics", "coupling", 0.65],
  ["law", "critical", 0.75],

  ["intellectual_property", "law", 0.95],
  ["intellectual_property", "track_ethics", 0.9],
  ["intellectual_property", "cameron", 0.9],
  ["intellectual_property", "jasmine", 0.85],
  ["intellectual_property", "creative_ai", 0.9],
  ["intellectual_property", "gen_ai", 0.85],
  ["intellectual_property", "ai", 0.85],
  ["intellectual_property", "llm", 0.8],
  ["intellectual_property", "ai_art", 0.9],
  ["intellectual_property", "art", 0.85],
  ["intellectual_property", "creative", 0.8],
  ["intellectual_property", "cultural_critical", 0.85],
  ["intellectual_property", "critical", 0.8],
  ["intellectual_property", "distributed", 0.75],
  ["intellectual_property", "ai_alignment", 0.75],
  ["intellectual_property", "curation", 0.8],
  ["intellectual_property", "perception_politics", 0.75],

  ["philosophy", "4e", 0.7],
  ["philosophy", "possible_minds", 0.65],
  ["philosophy", "philosophical_practice", 0.95],
  ["philosophical_practice", "epistemology", 0.9],
  ["philosophical_practice", "4e", 0.85],
  ["philosophical_practice", "cognition", 0.85],
  ["philosophical_practice", "coupling", 0.8],
  ["philosophical_practice", "assemblage", 0.8],
  ["philosophical_practice", "cultural_critical", 0.85],
  ["philosophical_practice", "track_ethics", 0.85],
  ["philosophical_practice", "complexity", 0.8],
  ["philosophical_practice", "creative_embodiment", 0.75],
  ["philosophical_practice", "clark", 0.8],
  ["philosophical_practice", "hayles", 0.85],
  ["philosophical_practice", "merleau_ponty", 0.85],
  ["philosophical_practice", "cameron", 0.75],
  ["epistemology", "philosophy", 0.95],
  ["epistemology", "ai_impact_epistemic", 0.9],
  ["epistemology", "critical", 0.85],
  ["epistemology", "situated", 0.85],
  ["epistemology", "perception_politics", 0.85],
  ["epistemology", "4e", 0.8],
  ["epistemology", "enactivism", 0.8],
  ["epistemology", "crawford", 0.85],
  ["epistemology", "abstraction", 0.8],
  ["epistemology", "mediation", 0.8],
  ["epistemology", "pedagogy", 0.75],
  ["epistemology", "hybrid", 0.75],
  ["epistemology", "creative_embodiment", 0.75],
  ["epistemology", "three_es_ai", 0.8],

  ["consciousness", "philosophy", 0.9],
  ["consciousness", "epistemology", 0.85],
  ["consciousness", "4e", 0.8],
  ["consciousness", "enactivism", 0.85],
  ["consciousness", "possible_minds", 0.9],
  ["consciousness", "agi", 0.85],
  ["consciousness", "theory_of_mind", 0.85],
  ["consciousness", "chalmers", 0.9],
  ["consciousness", "thompson", 0.85],
  ["consciousness", "varela", 0.8],
  ["consciousness", "shanahan", 0.85],
  ["consciousness", "aguilera_arcas", 0.85],
  ["consciousness", "hayles", 0.8],
  ["consciousness", "somatics", 0.75],
  ["consciousness", "creative_embodiment", 0.8],
  ["consciousness", "hybrid", 0.75],
  ["consciousness", "technical_agency", 0.7],
  ["consciousness", "synthetic_cognition", 0.9],

  ["synthetic_cognition", "ai", 0.95],
  ["synthetic_cognition", "ai_ml", 0.9],
  ["synthetic_cognition", "gen_ai", 0.9],
  ["synthetic_cognition", "llm", 0.85],
  ["synthetic_cognition", "creative_ai", 0.85],
  ["synthetic_cognition", "hybrid", 0.9],
  ["synthetic_cognition", "assemblage", 0.9],
  ["synthetic_cognition", "distributed", 0.85],
  ["synthetic_cognition", "technical_agency", 0.9],
  ["synthetic_cognition", "cs", 0.85],
  ["synthetic_cognition", "coupling", 0.8],
  ["synthetic_cognition", "creative_embodiment", 0.85],
  ["synthetic_cognition", "possible_minds", 0.85],
  ["synthetic_cognition", "aguilera_arcas", 0.9],
  ["synthetic_cognition", "hayles", 0.85],
  ["synthetic_cognition", "shanahan", 0.8],
  ["synthetic_cognition", "4e", 0.75],
  ["synthetic_cognition", "extended", 0.8],
  ["synthetic_cognition", "consciousness", 0.9],
  ["synthetic_cognition", "epistemology", 0.75],
  ["synthetic_cognition", "theory_of_mind", 0.8],

  ["physical_ai", "brooks", 0.95],
  ["physical_ai", "synthetic_cognition", 0.95],
  ["physical_ai", "ai", 0.9],
  ["physical_ai", "ai_ml", 0.9],
  ["physical_ai", "4e", 0.9],
  ["physical_ai", "enactivism", 0.85],
  ["physical_ai", "embodied", 0.9],
  ["physical_ai", "affordances", 0.9],
  ["physical_ai", "coupling", 0.85],
  ["physical_ai", "hybrid", 0.85],
  ["physical_ai", "creative_embodiment", 0.85],
  ["physical_ai", "extended", 0.8],
  ["physical_ai", "technical_agency", 0.85],
  ["physical_ai", "architecture", 0.75],
  ["physical_ai", "track_space", 0.8],
  ["physical_ai", "gibson", 0.85],
  ["physical_ai", "malafouris", 0.8],
  ["physical_ai", "aguilera_arcas", 0.8],
  ["physical_ai", "circus_arts", 0.7],
  ["physical_ai", "juggling", 0.7],

  ["brooks", "4e", 0.9],
  ["brooks", "enactivism", 0.85],
  ["brooks", "embodied", 0.9],
  ["brooks", "affordances", 0.9],
  ["brooks", "gibson", 0.85],
  ["brooks", "synthetic_cognition", 0.9],
  ["brooks", "ai", 0.85],
  ["brooks", "ai_ml", 0.85],
  ["brooks", "clark", 0.8],
  ["brooks", "noe", 0.75],
  ["brooks", "malafouris", 0.8],
  ["brooks", "coupling", 0.85],
  ["brooks", "hybrid", 0.8],
  ["brooks", "possible_minds", 0.8],
  ["brooks", "shanahan", 0.75],
  ["brooks", "track_space", 0.75],
  ["brooks", "extended", 0.75],

  ["friston", "clark", 0.85],
  ["friston", "aguilera_arcas", 0.85],
  ["friston", "4e", 0.8],
  ["friston", "enactivism", 0.8],
  ["friston", "embodied", 0.8],
  ["friston", "coupling", 0.8],
  ["friston", "cybernetics", 0.75],
  ["friston", "synthetic_cognition", 0.8],
  ["friston", "physical_ai", 0.75],
  ["friston", "ai", 0.75],
  ["friston", "possible_minds", 0.75],
  ["friston", "brooks", 0.7],


  ["cs", "assemblage", 0.75],

  ["juggling", "hybrid", 0.8],
  ["juggling", "literacies", 0.75],
  ["creative", "assemblage", 0.8],
  ["rehearsal", "art", 0.85],
  ["literacies", "choreo_knowledge", 0.8],
  ["literacies", "somatics", 0.65],

  ["techno_dualism", "4e", 0.5],
  ["bio_exception", "4e", 0.5],
  ["techno_dualism", "hybrid", 0.45],
  ["bio_exception", "technical_agency", 0.45],
  ["bio_exception", "symbiosis", 0.5],
  ["bio_exception", "technosymbiosis", 0.55],

  ["humanism", "hybrid", 0.45],
  ["humanism", "4e", 0.5],
  ["humanism", "enactivism", 0.5],
  ["humanism", "posthumanism", 0.55],
  ["humanism", "braidotti", 0.9],
  ["humanism", "hayles", 0.85],
  ["humanism", "fanon", 0.8],
  ["humanism", "akomolafe", 0.8],

  ["anthropocentrism", "hybrid", 0.45],
  ["anthropocentrism", "technosymbiosis", 0.55],
  ["anthropocentrism", "bio_exception", 0.6],
  ["anthropocentrism", "posthumanism", 0.55],
  ["anthropocentrism", "hayles", 0.9],
  ["anthropocentrism", "braidotti", 0.85],
  ["anthropocentrism", "margulis", 0.85],
  ["anthropocentrism", "uexkuell", 0.8],
  ["anthropocentrism", "gibson", 0.75],

  ["essentialism", "enactivism", 0.5],
  ["essentialism", "cultural_critical", 0.55],
  ["essentialism", "posthumanism", 0.55],
  ["essentialism", "braidotti", 0.9],
  ["essentialism", "fanon", 0.85],
  ["essentialism", "freire", 0.8],
  ["essentialism", "de_jaegher", 0.75],

  ["universalism", "pluriversal", 0.55],
  ["universalism", "humanism", 0.85],
  ["universalism", "essentialism", 0.8],
  ["universalism", "anthropocentrism", 0.75],
  ["universalism", "perception_politics", 0.8],
  ["universalism", "cultural_critical", 0.55],
  ["universalism", "fanon", 0.85],
  ["universalism", "freire", 0.8],
  ["universalism", "akomolafe", 0.85],
  ["universalism", "bell_hooks", 0.8],

  ["pluriversal", "akomolafe", 0.9],
  ["pluriversal", "freire", 0.85],
  ["pluriversal", "fanon", 0.85],
  ["pluriversal", "cultural_critical", 0.9],
  ["pluriversal", "community", 0.85],
  ["pluriversal", "cultural_imagination", 0.85],
  ["pluriversal", "social_change", 0.8],
  ["pluriversal", "hybrid", 0.8],
  ["pluriversal", "possible_minds", 0.75],
  ["pluriversal", "complexity", 0.75],
  ["pluriversal", "pedagogy", 0.75],
  ["pluriversal", "munoz", 0.75],
  ["pluriversal", "universalism", 0.55],

  ["escobar", "pluriversal", 0.95],
  ["escobar", "design_thinking", 0.9],
  ["escobar", "universalism", 0.85],
  ["escobar", "cultural_critical", 0.9],
  ["escobar", "akomolafe", 0.85],
  ["escobar", "freire", 0.85],
  ["escobar", "community", 0.9],
  ["escobar", "ecology_d", 0.85],
  ["escobar", "ecology", 0.8],
  ["escobar", "social_change", 0.85],
  ["escobar", "architecture", 0.75],
  ["escobar", "creative_embodiment", 0.8],
  ["escobar", "pedagogy", 0.8],
  ["escobar", "systems_thinking", 0.75],

  ["crawford", "ai", 0.95],
  ["crawford", "gen_ai", 0.9],
  ["crawford", "ai_ml", 0.9],
  ["crawford", "creative_ai", 0.85],
  ["crawford", "technical_agency", 0.9],
  ["crawford", "perception_politics", 0.95],
  ["crawford", "cultural_critical", 0.9],
  ["crawford", "critical", 0.9],
  ["crawford", "assemblage", 0.85],
  ["crawford", "distributed", 0.85],
  ["crawford", "situated", 0.85],
  ["crawford", "ecology", 0.85],
  ["crawford", "ecology_d", 0.8],
  ["crawford", "law", 0.8],
  ["crawford", "intellectual_property", 0.8],
  ["crawford", "haraway", 0.85],
  ["crawford", "barad", 0.8],
  ["crawford", "hayles", 0.8],
  ["crawford", "cameron", 0.85],
  ["crawford", "jasmine", 0.85],
  ["crawford", "track_ethics", 0.85],
  ["crawford", "creative_embodiment", 0.8],
  ["crawford", "mediation", 0.8],
  ["crawford", "hybrid", 0.8],

  ["aguilera_arcas", "ai", 0.95],
  ["aguilera_arcas", "gen_ai", 0.9],
  ["aguilera_arcas", "llm", 0.9],
  ["aguilera_arcas", "ai_ml", 0.85],
  ["aguilera_arcas", "creative_ai", 0.85],
  ["aguilera_arcas", "possible_minds", 0.9],
  ["aguilera_arcas", "agi", 0.85],
  ["aguilera_arcas", "theory_of_mind", 0.85],
  ["aguilera_arcas", "symbiosis", 0.85],
  ["aguilera_arcas", "technosymbiosis", 0.8],
  ["aguilera_arcas", "margulis", 0.75],
  ["aguilera_arcas", "enactivism", 0.8],
  ["aguilera_arcas", "4e", 0.75],
  ["aguilera_arcas", "distributed", 0.85],
  ["aguilera_arcas", "hybrid", 0.85],
  ["aguilera_arcas", "creative_embodiment", 0.8],
  ["aguilera_arcas", "creative", 0.8],
  ["aguilera_arcas", "ai_art", 0.8],
  ["aguilera_arcas", "interdisciplinary_art", 0.75],
  ["aguilera_arcas", "complexity_theory", 0.75],
  ["aguilera_arcas", "systems_thinking", 0.7],
  ["aguilera_arcas", "shanahan", 0.85],
  ["aguilera_arcas", "chalmers", 0.75],
  ["aguilera_arcas", "crawford", 0.75],
  ["aguilera_arcas", "epistemology", 0.75],
  ["aguilera_arcas", "track_ethics", 0.75],
  ["aguilera_arcas", "ethical_imagination", 0.7],

  ["butler", "afrofuturism", 0.95],
  ["butler", "speculative_futures", 0.9],
  ["butler", "futurity", 0.9],
  ["butler", "cultural_imagination", 0.9],
  ["butler", "storytelling", 0.85],
  ["butler", "hybrid", 0.8],
  ["butler", "creative_embodiment", 0.75],
  ["butler", "social_change", 0.8],
  ["butler", "community", 0.75],
  ["butler", "munoz", 0.8],
  ["butler", "fanon", 0.75],
  ["butler", "bell_hooks", 0.75],
  ["butler", "track_future", 0.8],
  ["butler", "art", 0.8],
  ["butler", "interdisciplinary_art", 0.8],

  ["sousa_santos", "epistemologies_south", 0.95],
  ["sousa_santos", "epistemology", 0.9],
  ["sousa_santos", "freire", 0.85],
  ["sousa_santos", "escobar", 0.85],
  ["sousa_santos", "pluriversal", 0.85],
  ["sousa_santos", "fanon", 0.8],
  ["sousa_santos", "pedagogy", 0.85],
  ["sousa_santos", "law", 0.8],
  ["sousa_santos", "cultural_critical", 0.85],
  ["sousa_santos", "community", 0.8],
  ["sousa_santos", "social_change", 0.85],
  ["sousa_santos", "universalism", 0.8],
  ["sousa_santos", "akomolafe", 0.75],
  ["sousa_santos", "critical", 0.8],

  ["posthumanism", "hybrid", 0.9],
  ["posthumanism", "technosymbiosis", 0.85],
  ["posthumanism", "assemblage", 0.85],
  ["posthumanism", "possible_minds", 0.8],
  ["posthumanism", "humanism", 0.55],
  ["posthumanism", "anthropocentrism", 0.55],
  ["posthumanism", "essentialism", 0.55],
  ["posthumanism", "hayles", 0.95],
  ["posthumanism", "braidotti", 0.95],
  ["posthumanism", "akomolafe", 0.85],
  ["posthumanism", "shanahan", 0.8],
  ["posthumanism", "margulis", 0.75],
  ["posthumanism", "futurity", 0.75],

  ["hi_program", "hybrid", 1.0],
  ["hi_program", "coupling", 0.9],
  ["hi_program", "cota", 0.95],
  ["hi_program", "came", 0.95],
  ["hi_program", "cam", 0.9],
  ["hi_program", "ignite", 0.9],
  ["hi_program", "wertheim", 0.9],
  ["hi_program", "gainesville_circus", 0.8],
  ["hi_program", "undergrad_participants", 0.95],
  ["hi_program", "grad_participants", 0.95],
  ["hi_program", "staff_participants", 0.9],
  ["hi_program", "community_participants", 0.9],
  ["hi_program", "track_space", 0.85],
  ["hi_program", "track_future", 0.85],
  ["hi_program", "track_ethics", 0.85],
  ["hi_program", "reception", 0.85],
  ["hi_program", "conversational_ai", 0.9],
  ["hi_program", "marlon", 0.95],
  ["marlon", "came", 0.95],
  ["marlon", "cota", 0.9],
  ["hi_program", "erika", 0.9],
  ["conversational_ai", "hybrid", 0.9],
  ["conversational_ai", "coupling", 0.85],
  ["conversational_ai", "llm", 0.9],
  ["conversational_ai", "ai", 0.85],
  ["conversational_ai", "extended", 0.8],
  ["conversational_ai", "mediation", 0.8],
  ["conversational_ai", "literacies", 0.8],
  ["conversational_ai", "creative", 0.8],
  ["conversational_ai", "marlon", 0.85],
  ["pendular_umwelt", "umwelt", 0.95],
  ["pendular_umwelt", "llm", 0.9],
  ["pendular_umwelt", "latent_space", 0.9],
  ["pendular_umwelt", "affordances", 0.85],
  ["pendular_umwelt", "enactivism", 0.85],
  ["pendular_umwelt", "uexkuell", 0.85],
  ["pendular_umwelt", "embodiment", 0.8],
  ["pendular_umwelt", "creative", 0.8],
  ["pendular_umwelt", "hi_program", 0.85],
  ["pendular_umwelt", "marlon", 0.9],
  ["lobby_showcase", "hi_program", 0.9],
  ["lobby_showcase", "wertheim", 0.95],
  ["lobby_showcase", "marlon", 0.95],
  ["lobby_showcase", "latent_space", 0.85],
  ["lobby_showcase", "embodiment", 0.85],
  ["lobby_showcase", "hybrid", 0.85],
  ["lobby_showcase", "creative", 0.8],
  ["lobby_showcase", "pendular_umwelt", 0.75],
  ["cota", "came", 0.95],
  ["cota", "cam", 0.95],
  ["cota", "art", 0.85],
  ["cota", "interdisciplinary_art", 0.85],
  ["cota", "onye", 0.85],
  ["came", "cam", 0.9],
  ["came", "art_medicine", 0.85],
  ["came", "interdisciplinary_art", 0.85],
  ["came", "art", 0.7],
  ["came", "creative", 0.75],
  ["cam", "art", 0.8],
  ["cam", "somatics", 0.75],
  ["cam", "erika", 0.85],
  ["creative_embodiment", "cam", 0.8],
  ["ignite", "track_ethics", 0.75],
  ["ignite", "melissa", 0.85],
  ["wertheim", "architecture", 0.7],
  ["gainesville_circus", "cheval_bailie", 0.95],
  ["gainesville_circus", "circus_arts", 0.95],
  ["gainesville_circus", "track_space", 0.85],
  ["gainesville_circus", "juggling", 0.85],
  ["gainesville_circus", "embodiment", 0.75],
  ["track_space", "architecture", 0.9],
  ["track_space", "choreography", 0.85],
  ["track_space", "embodied", 0.8],
  ["track_space", "mediation", 0.75],
  ["track_space", "karla", 0.9],
  ["track_space", "onye", 0.9],
  ["track_space", "cheval_bailie", 0.85],
  ["track_future", "art", 0.9],
  ["track_future", "rehearsal", 0.85],
  ["track_future", "creative", 0.85],
  ["track_future", "possible_minds", 0.8],
  ["track_future", "erika", 0.9],
  ["track_future", "jackie_larson", 0.9],
  ["track_future", "andrew_hix", 0.9],
  ["track_future", "turbado_marabou", 0.9],
  ["erika", "jackie_larson", 0.9],
  ["erika", "andrew_hix", 0.9],
  ["erika", "turbado_marabou", 0.9],
  ["jackie_larson", "choreography", 0.9],
  ["jackie_larson", "choreo_knowledge", 0.75],
  ["jackie_larson", "somatics", 0.85],
  ["jackie_larson", "art", 0.8],
  ["jackie_larson", "cam", 0.85],
  ["andrew_hix", "art", 0.85],
  ["andrew_hix", "rehearsal", 0.8],
  ["andrew_hix", "literacies", 0.75],
  ["andrew_hix", "cam", 0.8],
  ["turbado_marabou", "art", 0.9],
  ["turbado_marabou", "cultural_critical", 0.85],
  ["turbado_marabou", "creative", 0.8],
  ["turbado_marabou", "possible_minds", 0.7],
  ["track_ethics", "law", 0.9],
  ["track_ethics", "critical", 0.85],
  ["track_ethics", "philosophy", 0.8],
  ["track_ethics", "distributed", 0.75],
  ["track_ethics", "erika", 0.8],
  ["track_ethics", "cameron", 0.9],
  ["track_ethics", "jasmine", 0.9],
  ["track_ethics", "melissa", 0.85],
  ["reception", "literacies", 0.8],
  ["reception", "hybrid", 0.7],
  ["undergrad_participants", "grad_participants", 0.85],
  ["undergrad_participants", "art", 0.85],
  ["undergrad_participants", "dance", 0.85],
  ["undergrad_participants", "cs", 0.8],
  ["undergrad_participants", "ai_ml", 0.75],
  ["undergrad_participants", "pedagogy", 0.85],
  ["undergrad_participants", "reception", 0.8],
  ["undergrad_participants", "cota", 0.8],
  ["grad_participants", "cs", 0.85],
  ["grad_participants", "art_medicine", 0.8],
  ["grad_participants", "ai_ml", 0.8],
  ["grad_participants", "machine_learning", 0.9],
  ["grad_participants", "neural_networks", 0.75],
  ["grad_participants", "pedagogy", 0.85],
  ["grad_participants", "reception", 0.8],
  ["grad_participants", "epistemology", 0.7],
  ["staff_participants", "art_medicine", 0.85],
  ["staff_participants", "dance", 0.8],
  ["staff_participants", "somatics", 0.75],
  ["staff_participants", "community", 0.8],
  ["staff_participants", "reception", 0.85],
  ["community_participants", "community", 0.95],
  ["community_participants", "generative_arts", 0.8],
  ["community_participants", "choreography", 0.85],
  ["community_participants", "ai_art", 0.75],
  ["community_participants", "ai", 0.8],
  ["community_participants", "ai_ml", 0.8],
  ["community_participants", "reception", 0.9],
  ["community_participants", "interdisciplinary_art", 0.8],
  ["community_participants", "staff_participants", 0.75],
  ["grad_participants", "staff_participants", 0.7],
  ["undergrad_participants", "community_participants", 0.75],
  ["undergrad_participants", "bg_art_history", 0.95],
  ["undergrad_participants", "bg_ise", 0.95],
  ["undergrad_participants", "bg_dance_museum", 0.95],
  ["undergrad_participants", "bg_cs", 0.95],
  ["undergrad_participants", "bg_ise_polisci", 0.95],
  ["grad_participants", "bg_hcc", 0.95],
  ["grad_participants", "bg_art_history", 0.9],
  ["grad_participants", "bg_chem_eng", 0.95],
  ["grad_participants", "bg_ml", 0.95],
  ["grad_participants", "bg_health_outcomes", 0.95],
  ["staff_participants", "bg_lighting", 0.95],
  ["staff_participants", "bg_nursing", 0.95],
  ["staff_participants", "bg_public_health", 0.95],
  ["staff_participants", "bg_dance_therapy", 0.95],
  ["community_participants", "bg_it", 0.95],
  ["community_participants", "bg_digital_media_ai", 0.95],
  ["community_participants", "bg_choreo_film", 0.95],
  ["community_participants", "bg_library", 0.95],
  ["community_participants", "bg_digital_art", 0.95],
  ["bg_art_history", "art", 0.9],
  ["bg_ise", "cs", 0.7],
  ["bg_ise", "design_thinking", 0.75],
  ["bg_dance_museum", "dance", 0.9],
  ["bg_dance_museum", "curation", 0.85],
  ["bg_cs", "cs", 0.95],
  ["bg_cs", "ai_ml", 0.8],
  ["bg_ise_polisci", "bg_ise", 0.8],
  ["bg_ise_polisci", "law", 0.7],
  ["bg_hcc", "cs", 0.85],
  ["bg_hcc", "ai_ml", 0.8],
  ["bg_hcc", "affordances", 0.7],
  ["bg_chem_eng", "cs", 0.6],
  ["bg_chem_eng", "art_medicine", 0.65],
  ["bg_ml", "machine_learning", 0.98],
  ["bg_ml", "neural_networks", 0.9],
  ["bg_ml", "ai_ml", 0.95],
  ["bg_health_outcomes", "art_medicine", 0.9],
  ["bg_lighting", "art", 0.75],
  ["bg_lighting", "architecture", 0.7],
  ["bg_nursing", "art_medicine", 0.9],
  ["bg_public_health", "art_medicine", 0.85],
  ["bg_public_health", "community", 0.8],
  ["bg_dance_therapy", "dance", 0.9],
  ["bg_dance_therapy", "somatics", 0.9],
  ["bg_dance_therapy", "art_medicine", 0.85],
  ["bg_it", "cs", 0.85],
  ["bg_digital_media_ai", "ai", 0.9],
  ["bg_digital_media_ai", "ai_ml", 0.9],
  ["bg_digital_media_ai", "generative_arts", 0.85],
  ["bg_choreo_film", "choreography", 0.95],
  ["bg_choreo_film", "choreography_d", 0.9],
  ["bg_choreo_film", "storytelling", 0.8],
  ["bg_library", "epistemology", 0.7],
  ["bg_library", "curation", 0.85],
  ["bg_digital_art", "ai_art", 0.9],
  ["bg_digital_art", "generative_arts", 0.9],
  ["bg_digital_art", "interdisciplinary_art", 0.8],
  ["bg_art_history", "bg_digital_art", 0.7],
  ["bg_ml", "bg_digital_media_ai", 0.8],
  ["bg_cs", "bg_hcc", 0.8],
  ["bg_dance_museum", "bg_dance_therapy", 0.75],
  ["bg_health_outcomes", "bg_nursing", 0.8],
  ["bg_health_outcomes", "bg_public_health", 0.85],

  ["marlon", "choreography", 0.9],
  ["marlon", "creative", 0.85],
  ["marlon", "track_space", 0.8],
  ["marlon", "track_future", 0.75],
  ["marlon", "track_ethics", 0.75],
  ["marlon", "karla", 0.85],
  ["marlon", "onye", 0.85],
  ["marlon", "cheval_bailie", 0.85],
  ["marlon", "cameron", 0.85],
  ["marlon", "jasmine", 0.85],
  ["marlon", "melissa", 0.85],
  ["karla", "architecture", 0.95],
  ["karla", "cs", 0.7],
  ["onye", "choreography", 0.95],
  ["onye", "choreo_knowledge", 0.8],
  ["onye", "rehearsal", 0.8],
  ["cheval_bailie", "choreography", 0.85],
  ["cheval_bailie", "somatics", 0.8],
  ["cheval_bailie", "juggling", 0.85],
  ["erika", "art", 0.85],
  ["erika", "somatics", 0.75],
  ["cameron", "law", 0.9],
  ["cameron", "philosophy", 0.85],
  ["cameron", "critical", 0.8],
  ["jasmine", "law", 0.9],
  ["jasmine", "perception_politics", 0.8],
  ["jasmine", "ecology_d", 0.75],
  ["melissa", "reception", 0.85],
  ["melissa", "literacies", 0.7],

  // 4E authors — strengthen author–framework–quality couplings
  ["carney", "embodied", 0.9],
  ["carney", "enactivism", 0.85],
  ["carney", "situated", 0.8],
  ["carney", "thompson", 0.8],
  ["carney", "varela", 0.75],
  ["carney", "rosch", 0.75],
  ["shapiro", "enactivism", 0.9],
  ["shapiro", "embedded", 0.85],
  ["shapiro", "extended", 0.8],
  ["shapiro", "enacted", 0.8],
  ["shapiro", "situated", 0.85],
  ["shapiro", "wilson", 0.75],
  ["gallagher", "enactivism", 0.85],
  ["gallagher", "enacted", 0.8],
  ["gallagher", "thompson", 0.75],
  ["noe", "active_inference", 0.75],
  ["thompson", "friston", 0.85],
  ["chalmers", "synthetic_cognition", 0.85],
  ["chalmers", "agi", 0.9],
  ["cuffari", "enactivism", 0.9],
  ["cuffari", "4e", 0.8],
  ["wilson", "extended", 0.85],
  ["wilson", "distributed", 0.8],
  ["rosch", "enacted", 0.9],
  ["rosch", "situated", 0.85],
  ["kirsh", "extended", 0.9],
  ["kirsh", "distributed", 0.85],
  ["kirsh", "creative_ai", 0.8],
  ["kirsh", "assemblage", 0.75],
  ["malafouris", "synthetic_cognition", 0.85],
  ["bateson", "systems_thinking", 0.9],

  // Active inference, consciousness, and embodied AI cluster
  ["friston", "consciousness", 0.85],
  ["friston", "theory_of_mind", 0.8],
  ["brooks", "active_inference", 0.85],
  ["brooks", "cybernetics", 0.8],
  ["physical_ai", "cybernetics", 0.75],

  // Decolonial, epistemic, and futurist couplings
  ["sousa_santos", "ai_impact_epistemic", 0.8],
  ["epistemologies_south", "butler", 0.75],
  ["epistemologies_south", "afrofuturism", 0.8],
  ["three_es_ai", "epistemologies_south", 0.8],
  ["butler", "ethical_imagination", 0.8],
  ["entrepreneurship_vision", "afrofuturism", 0.75],
  ["essentialism", "epistemology", 0.5],
  ["essentialism", "epistemologies_south", 0.55],

  // Technologies of the self and consciousness
  ["technologies_of_self", "consciousness", 0.75],
  ["technologies_of_self", "theory_of_mind", 0.7],

  // Creative AI and conceptual art lineage
  ["duchamp", "creative_ai", 0.8],
  ["cage", "creative_ai", 0.75],
  ["yoko_ono", "creative_ai", 0.75],

  // Tensions — oppose inadequate positions to relevant frameworks
  ["techno_dualism", "cyborg", 0.45],
  ["techno_dualism", "extended", 0.5],
  ["techno_dualism", "mediation", 0.55],
  ["techno_dualism", "ai", 0.5],
  ["techno_dualism", "gen_ai", 0.45],
  ["techno_dualism", "embodied", 0.45],
  ["bio_exception", "embodied", 0.45],
  ["bio_exception", "somatics", 0.4],
  ["bio_exception", "physical_ai", 0.4],
  ["anthropocentrism", "ecology_d", 0.5],
  ["posthumanism", "physical_ai", 0.75],
  ["posthumanism", "synthetic_cognition", 0.8],
  ["posthumanism", "brooks", 0.7],

  // Domains, program, and facilitators
  ["circus_arts", "embodied", 0.85],
  ["circus_arts", "coupling", 0.7],
  ["motion_bank", "choreography_d", 0.9],
  ["asi", "track_ethics", 0.8],
  ["wertheim", "ignite", 0.7],
  ["karla", "ai", 0.75],
  ["karla", "physical_ai", 0.7],
];

let nodes = [];
let edges = [];
let hovered = null;
let selected = null;
let dragging = null;
let relationLinger = null;
let relationLingerUntil = 0;
let panelAlpha = 0;
let time = 0;
let layoutCenter = { x: 0, y: 0 };
let layoutRadius = 0;

function blendThemeValue(a, b, t) {
  if (Array.isArray(a)) return a.map((v, i) => lerp(v, b[i], t));
  return lerp(a, b, t);
}

function blendThemes(fromKey, toKey, t) {
  const from = THEMES[fromKey];
  const to = THEMES[toKey];
  const out = {};
  for (const key of Object.keys(from)) {
    if (key === "label") {
      out[key] = t < 0.5 ? from[key] : to[key];
    } else {
      out[key] = blendThemeValue(from[key], to[key], t);
    }
  }
  return out;
}

function themeCrossfadeT() {
  if (!themeCrossfadeActive) return 1;
  return easeSmooth(min(1, (time - themeCrossfadeStart) / THEME_CROSSFADE_SEC));
}

function themeDarkness() {
  const from = themeCrossfadeActive
    ? (themeCrossfadeFrom === "dark" ? 1 : 0)
    : (themeMode === "dark" ? 1 : 0);
  const to = themeCrossfadeActive
    ? (themeCrossfadeTo === "dark" ? 1 : 0)
    : from;
  if (!themeCrossfadeActive) return from;
  return lerp(from, to, themeCrossfadeT());
}

function theme() {
  if (!themeCrossfadeActive) return THEMES[themeMode];
  return blendThemes(themeCrossfadeFrom, themeCrossfadeTo, themeCrossfadeT());
}

function ringColor(cat) {
  return RING_COLORS[cat];
}

function ringBandFill(cat, ringFocus) {
  const t = theme();
  const [cr, cg, cb] = ringColor(cat);
  const [br, bg, bb] = t.bg;
  const mix = 0.97;
  let r = lerp(cr, br, mix);
  let g = lerp(cg, bg, mix);
  let b = lerp(cb, bb, mix);
  const gray = (r + g + b) / 3;
  const desat = 0.72;
  r = lerp(r, lerp(gray, br, 0.2), desat);
  g = lerp(g, lerp(gray, bg, 0.2), desat);
  b = lerp(b, lerp(gray, bb, 0.2), desat);
  const baseAlpha = lerp(t.ringFill[0], t.ringFill[1], themeDarkness());
  const alpha = categoryHighlightActive()
    ? (ringFocus > 0.2 ? baseAlpha + ringFocus * 12 : baseAlpha * 0.45)
    : baseAlpha;
  return [r, g, b, alpha];
}

function setTextFill(alpha = 255) {
  const d = themeDarkness();
  fill(lerp(32, 255, d), lerp(36, 255, d), lerp(48, 255, d), alpha);
}

function setThemeBody(mode) {
  document.body.style.background = mode === "dark" ? "#0e1018" : "#fffdf8";
  document.body.classList.toggle("light-mode", mode === "light");
  try {
    localStorage.setItem("hi-theme", mode);
  } catch (_) {}
}

function applyThemeBodyBlend(fromKey, toKey, t) {
  const fromBg = THEMES[fromKey].bg;
  const toBg = THEMES[toKey].bg;
  const bg = fromBg.map((v, i) => Math.round(lerp(v, toBg[i], t)));
  document.body.style.background = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`;
  document.body.classList.toggle("light-mode", t >= 0.5 ? toKey === "light" : fromKey === "light");
}

function beginThemeCrossfade(toMode) {
  if (!THEMES[toMode]) return;
  themeCrossfadeFrom = themeCrossfadeActive ? themeCrossfadeTo : themeMode;
  themeCrossfadeTo = toMode;
  themeCrossfadeStart = time;
  themeCrossfadeActive = true;
}

function finishThemeCrossfade() {
  if (!themeCrossfadeActive) return;
  themeMode = themeCrossfadeTo;
  themeCrossfadeActive = false;
  setThemeBody(themeMode);
}

function updateThemeCrossfade() {
  if (!themeCrossfadeActive) return;
  const t = themeCrossfadeT();
  applyThemeBodyBlend(themeCrossfadeFrom, themeCrossfadeTo, t);
  if (t >= 1) finishThemeCrossfade();
}

function setTheme(mode, instant = true) {
  if (!THEMES[mode]) return;
  if (!instant && mode !== themeMode) {
    beginThemeCrossfade(mode);
    return;
  }
  themeCrossfadeActive = false;
  themeMode = mode;
  setThemeBody(mode);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("IBM Plex Mono");
  try {
    const saved = localStorage.getItem("hi-theme");
    if (saved === "light" || saved === "dark") themeMode = saved;
  } catch (_) {}
  setTheme(themeMode);
  initGraph();
  applyHashSelection();
  window.addEventListener("hashchange", applyHashSelection);
}

function applyHashSelection() {
  const raw = (location.hash || "").replace(/^#/, "");
  if (!raw || !nodes.length) return;

  if (raw.startsWith("cat/")) {
    const cat = raw.slice(4);
    if (CATEGORY_META[cat]) {
      pinCategory(cat);
      selected = null;
      hovered = null;
      dragging = null;
    }
    return;
  }

  const n = nodes.find((node) => node.id === raw);
  if (n) {
    selected = n;
    hovered = n;
  }
}

function getCenter() {
  if (isMobileLayout()) {
    return { x: width / 2, y: height / 2 + (mobileBarH() - mobileBottomH()) * 0.25 };
  }
  return { x: width / 2, y: height / 2 + 10 };
}

function getMaxRadius() {
  const mobile = isMobileLayout();
  const topPad = mobile ? mobileBarH() + 8 : 120;
  const toggleH = mobile ? mobileBottomH() + 8 : 54;
  const focus = getActiveNode();
  const panelH = focus ? detailPanelLayout(focus).panelH : 108;
  const bottomPad = focus
    ? toggleH + (mobile ? min(panelH, 230) : panelH) + 18
    : toggleH + 16;
  const sidePad = mobile ? 28 : 98;
  const layoutScale = mobile ? 0.98 : 1.08;
  return min(width / 2 - sidePad, height / 2 - max(topPad, bottomPad) - 12) * layoutScale;
}

function nodeFloatSeed(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return h / 997;
}

function initGraph() {
  layoutCenter = getCenter();
  layoutRadius = getMaxRadius();
  const nodeMap = {};

  const byCategory = {};
  for (const cat of RING_ORDER) byCategory[cat] = [];
  for (const n of NODES) {
    if (n.id === "coupling") continue;
    byCategory[n.cat].push(n);
  }

  nodes = [];

  const couplingSeed = nodeFloatSeed("coupling");
  const coupling = {
    ...NODES.find(n => n.id === "coupling"),
    x: layoutCenter.x,
    y: layoutCenter.y,
    targetR: 0,
    targetAngle: 0,
    radius: 12.6,
    pinned: true,
    floatPhase: couplingSeed * TWO_PI,
    floatSpeed: 0.45,
    floatAmpR: 0,
    floatAmpA: 0,
  };
  nodeMap.coupling = coupling;
  nodes.push(coupling);

  let ringOffset = 0;
  for (const cat of RING_ORDER) {
    const group = byCategory[cat];
    if (!group.length) continue;

    const ringFrac = CATEGORY_META[cat].ring;
    const ringR = layoutRadius * ringFrac;
    const angleStep = TWO_PI / group.length;
    const startAngle = ringOffset - HALF_PI;

    group.forEach((n, i) => {
      const angle = startAngle + i * angleStep;
      const jitter = random(-0.04, 0.04);
      const seed = nodeFloatSeed(n.id);
      const node = {
        ...n,
        x: layoutCenter.x + cos(angle + jitter) * ringR,
        y: layoutCenter.y + sin(angle + jitter) * ringR,
        targetR: ringR,
        targetAngle: angle + jitter,
        radius: (7 + n.weight * 4) * 0.9,
        pinned: false,
        vx: 0,
        vy: 0,
        bounceUntil: 0,
        floatPhase: seed * TWO_PI,
        floatPhase2: seed * TWO_PI * 1.73,
        floatSpeed: 0.34 + seed * 0.22,
        floatSpeed2: 0.16 + seed * 0.14,
        floatAmpR: 4.5 + seed * 5.5,
        floatAmpA: 0.011 + seed * 0.013,
      };
      nodeMap[n.id] = node;
      nodes.push(node);
    });

    ringOffset += PI / RING_ORDER.length;
  }

  edges = EDGES.map(([a, b, strength]) => ({
    a: nodeMap[a],
    b: nodeMap[b],
    strength: strength || 0.5,
  })).filter(e => e.a && e.b);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (!isMobileLayout()) mobileMenuOpen = false;
  initGraph();
}

function draw() {
  time += 0.016;
  if (
    relationLinger &&
    time >= relationLingerUntil &&
    !hovered &&
    !(selected && activeCategory() && selected.cat !== activeCategory())
  ) {
    relationLinger = null;
  }
  updateAnimate();
  updateCategoryTransition();
  updateThemeCrossfade();
  const t = theme();
  background(...t.bg);

  drawCircularField();
  applyForces();
  if (!ringsOnlyMode()) {
    drawEdges();
    drawNodes();
  }
  drawUI();

  panelAlpha = lerp(panelAlpha, (hovered || selected) ? 255 : 200, 0.12);
}

function drawCircularField() {
  const { x: cx, y: cy } = layoutCenter;
  const maxR = layoutRadius;
  const t = theme();
  const ringsOnly = ringsOnlyMode();

  if (ringsOnly) {
    for (let i = RING_ORDER.length - 1; i >= 0; i--) {
      const cat = RING_ORDER[i];
      const r = maxR * CATEGORY_META[cat].ring;
      const innerR = i > 0 ? maxR * CATEGORY_META[RING_ORDER[i - 1]].ring : 0;
      const [cr, cg, cb] = ringColor(cat);

      noStroke();
      const [fr, fg, fb, fa] = ringBandFill(cat, 1);
      fill(fr, fg, fb, fa * 1.6);
      ellipse(cx, cy, r * 2);

      noFill();
      stroke(cr, cg, cb, 255);
      strokeWeight(i === RING_ORDER.length - 1 ? 3.2 : 2.6);
      ellipse(cx, cy, r * 2);

      if (innerR > 0) {
        stroke(...t.bg, lerp(230, 200, themeDarkness()));
        strokeWeight(1.5);
        noFill();
        ellipse(cx, cy, innerR * 2 + 3);
      }
    }

    RING_ORDER.forEach((cat, i) => {
      const r = maxR * CATEGORY_META[cat].ring;
      const labelAngle = -HALF_PI + i * (TWO_PI / RING_ORDER.length) * 0.78;
      const ox = cx + cos(labelAngle) * (r + 18);
      const oy = cy + sin(labelAngle) * (r + 18);
      const label = CATEGORY_META[cat].label.toUpperCase();
      const [cr, cg, cb] = ringColor(cat);

      textSize(10);
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      const tw = textWidth(label);
      const padX = 8;
      const padY = 4;

      noStroke();
      fill(...t.bg, lerp(245, 235, themeDarkness()));
      rect(ox - tw / 2 - padX, oy - 7 - padY, tw + padX * 2, 14 + padY * 2, 5);

      stroke(cr, cg, cb, 200);
      strokeWeight(1.5);
      noFill();
      rect(ox - tw / 2 - padX, oy - 7 - padY, tw + padX * 2, 14 + padY * 2, 5);

      noStroke();
      setTextFill();
      text(label, ox, oy + 1);
      textStyle(NORMAL);
    });
    return;
  }

  for (let i = RING_ORDER.length - 1; i >= 0; i--) {
    const cat = RING_ORDER[i];
    const r = maxR * CATEGORY_META[cat].ring;
    const ringFocus = ringCategoryFocus(cat);
    const [fr, fg, fb, fa] = ringBandFill(cat, ringFocus);
    noStroke();
    fill(fr, fg, fb, fa);
    ellipse(cx, cy, r * 2);

    const innerR = i > 0 ? maxR * CATEGORY_META[RING_ORDER[i - 1]].ring : 0;
    if (innerR > 0) {
      stroke(...t.bg, lerp(200, 170, themeDarkness()));
      strokeWeight(1.2);
      noFill();
      ellipse(cx, cy, innerR * 2 + 2);
    }
  }

  noFill();
  for (const cat of RING_ORDER) {
    const r = maxR * CATEGORY_META[cat].ring;
    const [cr, cg, cb] = ringColor(cat);
    const ringFocus = ringCategoryFocus(cat);
    const ringHot = categoryHighlightActive() && cat === activeCategory();
    const ringAlpha = categoryHighlightActive()
      ? (ringFocus > 0.2
        ? t.ringLine + ringFocus * t.ringLine * 1.4
        : t.ringLineCategory)
      : t.ringLine + 12;
    stroke(cr, cg, cb, ringAlpha);
    strokeWeight(1.2 + ringFocus * 1.2 + (ringHot ? 0.4 : lerp(0.35, 0.15, themeDarkness())));
    ellipse(cx, cy, r * 2);

    noStroke();
    fill(cr, cg, cb, categoryHighlightActive()
      ? (ringFocus > 0.2 ? t.ringLabel + ringFocus * 90 : t.labelDimCategory)
      : t.ringLabel);
    textAlign(CENTER, CENTER);
    textSize(8 + ringFocus * 1.5);
    text(CATEGORY_META[cat].label.toUpperCase(), cx, cy - r - 6);
  }

  const [pr, pg, pb] = ringColor("premise");
  stroke(pr, pg, pb, t.outerRing);
  strokeWeight(1.5);
  noFill();
  ellipse(cx, cy, maxR * 2 + 40);

  const pulse = (sin(time * 0.6) + 1) * 0.5;
  stroke(pr, pg, pb, t.pulse[0] + pulse * (t.pulse[1] - t.pulse[0]));
  ellipse(cx, cy, 60 + pulse * 20);
}

function applyForces() {
  const { x: cx, y: cy } = layoutCenter;
  const maxR = layoutRadius + 20;
  const damping = 0.75;
  const interacting = dragging || selected;
  const driftBoost = categoryTransitionDrift();
  const transitionWave = categoryTransitionWave();
  const floatScale = (interacting ? 0.55 : 1.0) * driftBoost * (1 + transitionWave * 0.55);

  for (const n of nodes) {
    if (n === dragging) continue;

    const catFocus = nodeCategoryFocus(n);
    let focusFloat = catFocus === null ? 1 : 0.55 + catFocus * 0.65;
    if (catFocus !== null && categoryBlend < 1) {
      focusFloat += sin(categoryBlend * PI) * 0.42 * max(catFocus, 1 - catFocus);
    } else if (transitionWave > 0 && catFocus === null) {
      focusFloat = 1 + transitionWave * 0.38;
    }

    if (n.id === "coupling") {
      const breathe = sin(time * 0.38 + n.floatPhase) * (4.5 + transitionWave * 5.5) * floatScale;
      n.x = lerp(n.x, cx + cos(time * 0.26 + n.floatPhase) * breathe, 0.04 + transitionWave * 0.02);
      n.y = lerp(n.y, cy + sin(time * 0.22 + n.floatPhase) * breathe, 0.04 + transitionWave * 0.02);
      continue;
    }

    if (n.pinned) continue;

    const rWave = sin(time * n.floatSpeed + n.floatPhase) * 0.62
      + sin(time * n.floatSpeed2 + n.floatPhase2) * 0.38
      + sin(time * 0.52 + n.floatPhase * 2.1) * transitionWave * 0.48;
    const aWave = cos(time * n.floatSpeed * 0.68 + n.floatPhase * 1.6) * 0.65
      + sin(time * n.floatSpeed2 * 0.9 + n.floatPhase2 * 1.4) * 0.35
      + cos(time * 0.44 + n.floatPhase2 * 1.3) * transitionWave * 0.42;
    const ampBoost = 1 + transitionWave * 0.75;
    const rOff = rWave * n.floatAmpR * floatScale * focusFloat * ampBoost;
    const aOff = aWave * n.floatAmpA * floatScale * focusFloat * ampBoost;
    const goalR = n.targetR + rOff;
    const goalAngle = n.targetAngle + aOff;
    const goalX = cx + cos(goalAngle) * goalR;
    const goalY = cy + sin(goalAngle) * goalR;

    let dx = n.x - cx;
    let dy = n.y - cy;
    let dist = sqrt(dx * dx + dy * dy) || 0.001;
    let angle = atan2(dy, dx);

    const bouncing = n.bounceUntil && time < n.bounceUntil;
    const bounceBlend = bouncing ? 1 - (n.bounceUntil - time) / 4.8 : 0;
    const transitionLoose = bouncing ? 0 : transitionWave * 0.52;
    const constraintScale = bouncing
      ? 0.32 + bounceBlend * 0.38
      : 0.88 * (1 - transitionLoose * 0.48);

    if (transitionWave > 0.04) {
      const seed = nodeFloatSeed(n.id);
      const orbit = transitionWave * (0.07 + seed * 0.05) * focusFloat;
      n.vx = (n.vx || 0) + -sin(angle) * orbit;
      n.vy = (n.vy || 0) + cos(angle) * orbit;
      n.vx += cos(angle + seed * TWO_PI) * transitionWave * 0.025;
      n.vy += sin(angle + seed * TWO_PI) * transitionWave * 0.025;
    }

    const radialForce = (goalR - dist) * 0.048 * constraintScale;
    n.x += (dx / dist) * radialForce;
    n.y += (dy / dist) * radialForce;

    let angleDiff = goalAngle - angle;
    while (angleDiff > PI) angleDiff -= TWO_PI;
    while (angleDiff < -PI) angleDiff += TWO_PI;
    const tangentForce = angleDiff * 0.032 * n.targetR * constraintScale;
    n.x += -sin(angle) * tangentForce;
    n.y += cos(angle) * tangentForce;

    const errX = goalX - n.x;
    const errY = goalY - n.y;
    const errDist = sqrt(errX * errX + errY * errY) || 0.001;
    const speed = sqrt((n.vx || 0) ** 2 + (n.vy || 0) ** 2);

    if (bouncing || errDist > 4 || speed > 0.35 || transitionWave > 0.12) {
      const pull = bouncing
        ? min(0.062, 0.032 + errDist * 0.00065)
        : min(0.055, 0.026 + errDist * 0.0006) * (1 - transitionLoose * 0.55);
      const damp = bouncing
        ? 0.66 + bounceBlend * 0.14
        : 0.76 - transitionWave * 0.14;
      n.vx = (n.vx || 0) * damp + errX * pull;
      n.vy = (n.vy || 0) * damp + errY * pull;
      n.x += n.vx;
      n.y += n.vy;
    } else {
      const cloudPull = 0.013 * (1 - transitionWave * 0.35);
      const cloudDamp = 0.87 - transitionWave * 0.08;
      n.vx = (n.vx || 0) * cloudDamp + errX * cloudPull;
      n.vy = (n.vy || 0) * cloudDamp + errY * cloudPull;
      n.x += n.vx * (0.85 + transitionWave * 0.12);
      n.y += n.vy * (0.85 + transitionWave * 0.12);
    }

    dx = n.x - cx;
    dy = n.y - cy;
    dist = sqrt(dx * dx + dy * dy) || 0.001;
    if (dist > maxR) {
      n.x = cx + (dx / dist) * maxR;
      n.y = cy + (dy / dist) * maxR;
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.pinned && b.pinned) continue;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = sqrt(dx * dx + dy * dy) || 1;
      const minDist = a.radius + b.radius + 28;
      if (dist < minDist) {
        const push = (minDist - dist) * 0.15 * damping;
        const fx = (dx / dist) * push;
        const fy = (dy / dist) * push;
        if (!a.pinned && a !== dragging) { a.x -= fx; a.y -= fy; }
        if (!b.pinned && b !== dragging) { b.x += fx; b.y += fy; }
      }
    }
  }
}

function isConnected(a, b) {
  if (!a || !b || a === b) return false;
  return edges.some(e => (e.a === a && e.b === b) || (e.a === b && e.b === a));
}

function getActiveNode() {
  return selected || hovered;
}

function relationFocusNode() {
  if (!categoryHighlightActive()) return null;
  const cat = activeCategory();
  if (hovered) return hovered;
  if (selected && cat && selected.cat !== cat) return selected;
  if (relationLinger && time < relationLingerUntil) return relationLinger;
  return null;
}

function nodeFocusHighlightActive() {
  if (categoryExploreActive() && relationFocusNode()) return true;
  return getActiveNode() && !categoryHighlightActive();
}

function categoryFocusHighlightActive() {
  return categoryHighlightActive() && categoryDisplay !== null;
}

function legendLayout() {
  const boxW = 136;
  const boxH = 24 + RING_ORDER.length * 20;
  return { boxW, boxH, x: width - boxW - 16, y: 70 };
}

function legendHeaderLayout() {
  const { x, y } = legendLayout();
  textSize(9);
  textAlign(LEFT, TOP);
  const sx = x + 12;
  const hy = y + 10;
  const ringsW = textWidth("RINGS");
  const sepW = textWidth(" · ");
  const catW = textWidth("CATEGORIES");
  const textH = 11;
  return {
    rings: { x: sx, y: hy, w: ringsW, h: textH },
    categories: { x: sx + ringsW + sepW, y: hy, w: catW, h: textH },
  };
}

function legendHeaderHit(mx, my) {
  const { x, boxW } = legendLayout();
  if (mx < x || mx > x + boxW) return false;

  const { rings, categories } = legendHeaderLayout();
  const padX = 1;
  const padY = 2;
  const hit = (r) =>
    mx >= r.x - padX && mx <= r.x + r.w + padX &&
    my >= r.y - padY && my <= r.y + r.h + padY;

  return hit(rings) || hit(categories);
}

function ringsOnlyMode() {
  if (animateMode && getAnimatePhase() === "rings") return true;
  return hoveredLegendHeader;
}

function getAnimatePhase() {
  if (!animateMode) return null;
  return ANIM_SEQUENCE[animateStep];
}

function activeCategory() {
  if (animateMode) {
    const phase = getAnimatePhase();
    if (!phase || phase === "rings") return null;
    return phase;
  }
  if (selectedCategory !== null) return selectedCategory;
  return hoveredCategory;
}

function categoryPinned() {
  return selectedCategory !== null && !animateMode;
}

function categoryExploreActive() {
  return categoryPinned() || (animateMode && animatePaused);
}

function pauseAnimateForHover() {
  if (!animateMode || animatePaused) return;
  animatePaused = true;
  animatePauseRemaining = max(0, animateUntil - time);
}

function resumeAnimateFromHover() {
  if (!animateMode || !animatePaused) return;
  animatePaused = false;
  animateUntil = time + animatePauseRemaining;
}

function updateAnimate() {
  if (!animateMode || animatePaused) return;
  if (time < animateUntil) return;
  animateStep = (animateStep + 1) % ANIM_SEQUENCE.length;
  animateUntil = time + ANIM_HOLD_SEC;
  const phase = getAnimatePhase();
  playSwish(phase);
  if (phase === "rings") {
    nudgeNodesForRings();
  }
  if (phase === "theme") {
    beginThemeCrossfade(themeMode === "dark" ? "light" : "dark");
  }
}

function easeSmooth(t) {
  return t * t * (3 - 2 * t);
}

function categoryTransitionActive() {
  return categoryDisplay !== null && categoryBlend < 1;
}

function categoryTransitionWave() {
  if (!categoryTransitionActive()) return 0;
  return sin(categoryBlend * PI);
}

function nudgeNodesForCategory(cat, prevCat) {
  if (!cat) return;
  const { x: cx, y: cy } = layoutCenter;
  for (const n of nodes) {
    if (n.id === "coupling" || n.pinned) continue;
    const dx = n.x - cx;
    const dy = n.y - cy;
    const angle = atan2(dy, dx);
    const seed = nodeFloatSeed(n.id);
    const swirl = 0.42 + seed * 0.32;

    n.vx = (n.vx || 0) + -sin(angle) * swirl * 0.42;
    n.vy = (n.vy || 0) + cos(angle) * swirl * 0.42;

    if (n.cat === cat) {
      const push = 0.75 + seed * 0.65;
      n.vx = (n.vx || 0) + cos(angle) * push;
      n.vy = (n.vy || 0) + sin(angle) * push;
      n.vx += -sin(angle) * (seed - 0.5) * 0.72;
      n.vy += cos(angle) * (seed - 0.5) * 0.72;
      n.bounceUntil = time + 4.2;
    } else if (prevCat && n.cat === prevCat) {
      n.vx = (n.vx || 0) - cos(angle) * 0.55;
      n.vy = (n.vy || 0) - sin(angle) * 0.55;
      n.bounceUntil = max(n.bounceUntil || 0, time + 3.2);
    } else {
      n.vx = (n.vx || 0) + cos(angle) * (seed - 0.5) * 0.38;
      n.vy = (n.vy || 0) + sin(angle) * (seed - 0.5) * 0.38;
      n.bounceUntil = max(n.bounceUntil || 0, time + 2.8);
    }
  }
}

function nudgeNodesForRings() {
  const { x: cx, y: cy } = layoutCenter;
  for (const n of nodes) {
    if (n.id === "coupling" || n.pinned) continue;
    const dx = n.x - cx;
    const dy = n.y - cy;
    const angle = atan2(dy, dx);
    const seed = nodeFloatSeed(n.id);
    const drift = 0.3 + seed * 0.28;

    n.vx = (n.vx || 0) - cos(angle) * drift;
    n.vy = (n.vy || 0) - sin(angle) * drift;
    n.vx += -sin(angle) * (seed - 0.5) * 0.62;
    n.vy += cos(angle) * (seed - 0.5) * 0.62;
    n.bounceUntil = time + 4.0;
  }
}

function categoryTransitionDrift() {
  if (!categoryTransitionActive()) return 1;
  return 1 + sin(categoryBlend * PI) * 0.62;
}

function categoryFocusIn() {
  return easeSmooth(categoryBlend);
}

function categoryFocusOut() {
  return 1 - easeSmooth(pow(categoryBlend, CATEGORY_FADE_OUT_POWER));
}

function updateCategoryTransition() {
  const active = categoryHighlightActive();
  const target = active ? activeCategory() : null;

  if (!active) {
    if (categoryDisplay !== null) {
      categoryBlend = max(0, categoryBlend - CATEGORY_FADE_OUT_RATE);
      if (categoryBlend <= 0) {
        categoryDisplay = null;
        categoryPrev = null;
        categoryBlend = 1;
      }
    }
    return;
  }

  if (target !== categoryDisplay) {
    nudgeNodesForCategory(target, categoryDisplay);
    categoryPrev = categoryDisplay;
    categoryDisplay = target;
    categoryBlend = 0;
  }
  categoryBlend = min(1, categoryBlend + CATEGORY_FADE_RATE);
}

function nodeCategoryFocus(n) {
  if (categoryExploreActive() && relationFocusNode()) return null;
  if (!categoryHighlightActive() || categoryDisplay === null) return null;
  if (n.cat === categoryDisplay) return categoryFocusIn();
  if (n.cat === categoryPrev && categoryPrev !== null) return categoryFocusOut();
  return 0;
}

function ringCategoryFocus(cat) {
  if (!categoryHighlightActive() || categoryDisplay === null) return 0;
  if (cat === categoryDisplay) return categoryFocusIn();
  if (cat === categoryPrev && categoryPrev !== null) return categoryFocusOut();
  return 0;
}

function toggleAnimate() {
  if (!animateMode) {
    animateMode = true;
    ensureAudio();
    selected = null;
    hovered = null;
    dragging = null;
    hoveredCategory = null;
    selectedCategory = null;
    hoveredLegendHeader = false;
    animatePaused = false;
    const holdLeft = animatePauseRemaining > 0 ? animatePauseRemaining : ANIM_HOLD_SEC;
    animateUntil = time + holdLeft;
    animatePauseRemaining = 0;

    const phase = ANIM_SEQUENCE[animateStep];
    if (RING_ORDER.includes(phase)) {
      if (categoryDisplay !== phase) {
        categoryPrev = categoryDisplay;
        categoryDisplay = phase;
        categoryBlend = 0;
      } else if (categoryBlend >= 1) {
        categoryBlend = 1;
      }
    } else {
      categoryDisplay = null;
      categoryPrev = null;
      categoryBlend = 1;
    }
    return;
  }

  animateMode = false;
  if (themeCrossfadeActive) finishThemeCrossfade();
  const phase = ANIM_SEQUENCE[animateStep];
  animatePauseRemaining = animatePaused
    ? animatePauseRemaining
    : max(0, animateUntil - time);
  animateUntil = 0;
  animatePaused = false;
  if (RING_ORDER.includes(phase)) {
    pinCategory(phase);
  } else {
    selectedCategory = null;
    categoryDisplay = null;
    categoryPrev = null;
    categoryBlend = 1;
  }
}

function legendCategoryAt(mx, my) {
  const { x, y, boxW, boxH } = legendLayout();
  if (mx < x || mx > x + boxW || my < y || my > y + boxH) return null;
  if (legendHeaderHit(mx, my)) return null;

  let found = null;
  RING_ORDER.forEach((key, i) => {
    const ly = y + 30 + i * 20;
    if (my >= ly - 2 && my <= ly + 18 && mx >= x + 4 && mx <= x + boxW - 4) {
      found = key;
    }
  });
  return found;
}

function setSelectedCategory(cat) {
  if (cat === selectedCategory) {
    selectedCategory = null;
    relationLinger = null;
    relationLingerUntil = 0;
    return;
  }
  pinCategory(cat);
}

function stepCategory(delta) {
  if (animateMode) return;
  const n = RING_ORDER.length;
  if (n === 0) return;

  let idx;
  if (selectedCategory == null) {
    idx = delta > 0 ? 0 : n - 1;
  } else {
    idx = RING_ORDER.indexOf(selectedCategory);
    if (idx < 0) idx = 0;
    idx = (idx + delta + n * 10) % n;
  }
  pinCategory(RING_ORDER[idx]);
}

function pinCategory(cat) {
  if (!CATEGORY_META[cat]) return;
  selectedCategory = cat;
  if (selected && selected.cat !== cat) selected = null;
  if (hovered && hovered.cat !== cat) hovered = null;
  if (dragging && dragging.cat !== cat) dragging = null;
  if (relationLinger && relationLinger.cat !== cat) {
    relationLinger = null;
    relationLingerUntil = 0;
  }
  if (!animateMode) {
    const idx = RING_ORDER.indexOf(cat);
    if (idx >= 0) {
      const nextStep = 1 + idx;
      if (animateStep !== nextStep) {
        animateStep = nextStep;
        animatePauseRemaining = ANIM_HOLD_SEC;
      }
    }
  }
  if (cat !== categoryDisplay) {
    nudgeNodesForCategory(cat, categoryDisplay);
    categoryPrev = categoryDisplay;
    categoryDisplay = cat;
    categoryBlend = 0;
  }
}

function updateLegendHover(mx, my) {
  if (animateMode) return;

  hoveredCategory = null;
  mouseOnLegend = false;
  hoveredLegendHeader = false;

  if (legendHeaderHit(mx, my)) {
    hoveredLegendHeader = true;
    mouseOnLegend = true;
    return;
  }

  const { x, y, boxW, boxH } = legendLayout();
  if (mx < x || mx > x + boxW || my < y || my > y + boxH) return;

  mouseOnLegend = true;

  RING_ORDER.forEach((key, i) => {
    const ly = y + 30 + i * 20;
    if (my >= ly - 2 && my <= ly + 18 && mx >= x + 4 && mx <= x + boxW - 4) {
      hoveredCategory = key;
    }
  });
}

function categoryHighlightActive() {
  if (animateMode && activeCategory()) return true;
  if (selectedCategory !== null) return true;
  return mouseOnLegend && hoveredCategory !== null;
}

function nodeKeptInCategoryFocus(n) {
  const cat = activeCategory();
  if (cat && n.cat === cat) return true;
  const focus = relationFocusNode();
  return !!(focus && (n === focus || isConnected(focus, n)));
}

function nodeDimmed(n) {
  if (categoryHighlightActive()) {
    return !nodeKeptInCategoryFocus(n);
  }
  const active = getActiveNode();
  if (active) {
    return n !== active && !isConnected(active, n);
  }
  return false;
}

function nodeHighlighted(n) {
  if (categoryExploreActive() || categoryHighlightActive()) {
    const focus = relationFocusNode();
    if (focus) return n === focus || isConnected(focus, n);
    return n.cat === activeCategory();
  }
  const active = getActiveNode();
  if (active) return n === active;
  return false;
}

function nodeNeighbor(n) {
  if (categoryHighlightActive() && !relationFocusNode()) return false;
  const active = relationFocusNode() || getActiveNode();
  if (active) return isConnected(active, n);
  return false;
}

function nodeAcceptsPointer(n) {
  if (!n) return false;
  if (ringsOnlyMode()) return false;
  if (!categoryHighlightActive()) return true;
  return nodeKeptInCategoryFocus(n);
}

function nodeAt(mx, my) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    if (!nodeAcceptsPointer(n)) continue;
    if (dist(mx, my, n.x, n.y) < n.radius + 8) return n;
  }
  return null;
}

function edgeColor(e, highlight, dim) {
  const t = theme();
  const ca = color(...ringColor(e.a.cat));
  const cb = color(...ringColor(e.b.cat));
  const blended = lerpColor(ca, cb, 0.5);
  if (highlight) return blended;
  if (dim) {
    let dimAlpha = t.edgeDim;
    if (nodeFocusHighlightActive()) dimAlpha = t.edgeDimHover;
    else if (categoryFocusHighlightActive()) dimAlpha = t.edgeDimCategory;
    return color(red(blended), green(blended), blue(blended), dimAlpha);
  }
  const alpha = t.edgeBase[0] + e.strength * (t.edgeBase[1] - t.edgeBase[0]);
  return color(red(blended), green(blended), blue(blended), alpha);
}

function drawEdges() {
  const active = getActiveNode();
  const t = theme();

  const sorted = [...edges].sort((a, b) => {
    const aH = active && (a.a === active || a.b === active) ? 1 : 0;
    const bH = active && (b.a === active || b.b === active) ? 1 : 0;
    return aH - bH;
  });

  for (const e of sorted) {
    const catHL = categoryHighlightActive();
    const edgeFocus = catHL
      ? min(nodeCategoryFocus(e.a) ?? 0, nodeCategoryFocus(e.b) ?? 0)
      : null;
    const rel = relationFocusNode();
    const highlight = catHL
      ? (rel
        ? (e.a === rel || e.b === rel)
        : edgeFocus > 0.45)
      : active && (e.a === active || e.b === active);
    const dim = catHL
      ? (rel
        ? !(highlight || (activeCategory() && e.a.cat === activeCategory() && e.b.cat === activeCategory()))
        : edgeFocus < 0.2)
      : active && !highlight;
    const col = edgeColor(e, highlight, dim);
    let weight = highlight ? 2.0 + e.strength * 1.2 : 0.9 + e.strength * 1.6;
    if (edgeFocus !== null) {
      weight = 0.6 + edgeFocus * (1.4 + e.strength * 1.6);
    }
    if (nodeFocusHighlightActive() && dim) {
      weight *= 0.55;
    }
    if (categoryFocusHighlightActive() && dim) {
      weight *= 0.55;
    }
    weight *= EDGE_WEIGHT_SCALE;

    if (highlight) {
      let glowAlpha = t.edgeGlow;
      if (nodeFocusHighlightActive()) glowAlpha = t.edgeGlowHover;
      else if (categoryFocusHighlightActive()) glowAlpha = t.edgeGlowCategory;
      stroke(red(col), green(col), blue(col), glowAlpha);
      strokeWeight(weight + 1.5 * EDGE_WEIGHT_SCALE);
      line(e.a.x, e.a.y, e.b.x, e.b.y);
    }

    stroke(col);
    strokeWeight(weight);
    line(e.a.x, e.a.y, e.b.x, e.b.y);

    if (highlight) {
      const mx = lerp(e.a.x, e.b.x, 0.55);
      const my = lerp(e.a.y, e.b.y, 0.55);
      const sz = 4 * EDGE_WEIGHT_SCALE;
      noStroke();
      fill(red(col), green(col), blue(col), 180);
      ellipse(mx, my, sz);
    }
  }
}

function drawNodes() {
  drawNodeCircles();
  drawNodeLabels();
}

function nodeAccentStroke(r, g, b, dark) {
  const depth = dark ? 0.68 : 0.78;
  return [r * depth, g * depth, b * depth];
}

function drawNodeCircles() {
  const hoverFocus = nodeFocusHighlightActive();
  const catHL = categoryFocusHighlightActive();
  const dark = themeDarkness() > 0.5;

  for (const n of nodes) {
    const [r, g, b] = ringColor(n.cat);
    const [sr, sg, sb] = nodeAccentStroke(r, g, b, dark);
    const catFocus = nodeCategoryFocus(n);
    const isActive = catFocus === null ? nodeHighlighted(n) : catFocus > 0.65;
    const isNeighbor = catFocus === null && nodeNeighbor(n);
    const dim = catFocus === null ? nodeDimmed(n) : catFocus < 0.2;
    const catDim = catFocus !== null && catFocus < 0.2;
    const focus = catFocus === null
      ? (isActive ? 1 : isNeighbor ? 0.88 : dim ? (hoverFocus ? 0.018 : 0.08) : lerp(0.72, 0.82, themeDarkness()))
      : catFocus;

    const pulse = catFocus !== null && focus > 0.35
      ? sin(time * 1.6 + n.floatPhase) * 0.035 * focus
      : categoryTransitionWave() * sin(time * 1.1 + n.floatPhase) * 0.028;
    const drawR = n.radius * (1 + focus * 0.07 + pulse);

    const faded = (hoverFocus && dim) || (catHL && catDim);
    const glow = faded ? 0 : focus;
    const fillAlpha = scaleNodeAlpha(faded
      ? 4 + focus * 24
      : lerp(225, 255, focus));

    if (!faded) {
      noStroke();
      for (let i = 4; i >= 0; i--) {
        fill(r, g, b, scaleNodeAlpha(glow * lerp(22, 30, themeDarkness()) * (5 - i)));
        ellipse(n.x, n.y, drawR * 2 + i * 6);
      }
    }

    fill(r, g, b, fillAlpha);
    stroke(sr, sg, sb, scaleNodeAlpha(faded ? 20 + focus * 30 : lerp(170, 255, focus)));
    strokeWeight(faded ? 0.8 : 1.5 + focus * 1.2);
    ellipse(n.x, n.y, drawR * 2);
  }
}

function nodeLabelLayout(n, isActive) {
  const lines = n.label.split("\n");
  const lineH = 12;
  const labelR = n.radius + 14;
  const baseAngle = atan2(n.y - layoutCenter.y, n.x - layoutCenter.x);
  const outward = n.id !== "coupling";
  const lx = outward ? n.x + cos(baseAngle) * labelR * 0.3 : n.x;
  const ly = outward ? n.y + sin(baseAngle) * labelR * 0.3 + n.radius + 8 : n.y + n.radius + 16;
  const startY = ly - (lines.length - 1) * lineH / 2;

  return { lines, lineH, lx, startY };
}

function drawNodeLabels() {
  const t = theme();
  const hoverFocus = nodeFocusHighlightActive();
  const catHL = categoryFocusHighlightActive();
  const sorted = [...nodes].sort((a, b) => {
    const aScore = nodeHighlighted(a) ? 2 : nodeNeighbor(a) ? 1 : 0;
    const bScore = nodeHighlighted(b) ? 2 : nodeNeighbor(b) ? 1 : 0;
    return aScore - bScore;
  });

  for (const n of sorted) {
    const catFocus = nodeCategoryFocus(n);
    const isActive = catFocus === null ? nodeHighlighted(n) : catFocus > 0.65;
    const dim = catFocus === null ? nodeDimmed(n) : catFocus < 0.2;
    const catDim = catFocus !== null && catFocus < 0.2;
    if (
      isMobileLayout() &&
      !isActive &&
      !nodeHighlighted(n) &&
      !(catFocus !== null && catFocus >= 0.45)
    ) {
      continue;
    }
    const { lines, lineH, lx, startY } = nodeLabelLayout(n, isActive);
    const labelAlpha = scaleNodeAlpha(catFocus === null
      ? (dim ? (hoverFocus ? t.labelDimHover : t.labelDim) : 255)
      : catDim && catHL
        ? t.labelDimCategory
        : 50 + catFocus * 205);

    setTextFill(labelAlpha);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(catFocus === null ? (isActive ? 11 : 9) : 8 + catFocus * 3);
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], lx, startY + i * lineH);
    }
  }
}

function drawMobileUI() {
  const t = theme();
  const topH = mobileBarH();
  const bottomH = mobileBottomH();

  fill(...t.uiBar);
  noStroke();
  rect(0, 0, width, topH);

  fill(...t.title);
  textAlign(LEFT, CENTER);
  textSize(12);
  drawingContext.font = '300 12px "IBM Plex Mono", monospace';
  text("Hybrid Intelligences", 98, 36);
  drawingContext.font = '400 11px "IBM Plex Mono", monospace';

  textSize(8);
  fill(...t.subtitle);
  let status = "Tap a node · Play for tour";
  if (animateMode) {
    const phase = getAnimatePhase();
    const phaseLabel = phase === "rings"
      ? "Rings"
      : phase === "theme"
      ? "Theme"
      : (CATEGORY_META[phase]?.label || "");
    status = `Tour · ${phaseLabel}${animatePaused ? " · Paused" : ""}`;
  } else if (selectedCategory) {
    status = `Focus · ${CATEGORY_META[selectedCategory].label}`;
  }
  text(status, 98, 56);

  const focus = getActiveNode();
  if (focus && !ringsOnlyMode()) drawDetailPanel(focus);

  // Bottom control bar
  const by = height - bottomH;
  fill(...t.uiBar);
  noStroke();
  rect(0, by, width, bottomH);
  stroke(...t.border);
  strokeWeight(1);
  line(0, by, width, by);
  noStroke();

  const pad = 8;
  const gap = 6;
  const btnH = 36;
  const btnY = by + (bottomH - btnH) / 2;
  const labels = [
    { id: "prev", label: "\u2191" },
    { id: "play", label: mobilePlayLabel() },
    { id: "next", label: "\u2193" },
    { id: "reset", label: "Reset" },
    { id: "menu", label: mobileMenuOpen ? "Close" : "Menu" },
  ];
  const widths = labels.map((b) => {
    if (b.id === "prev" || b.id === "next") return 40;
    if (b.id === "play") return max(64, textWidth(b.label) + 22);
    if (b.id === "reset") return 58;
    return 58;
  });
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (labels.length - 1);
  let bx = max(pad, (width - totalW) / 2);

  textAlign(CENTER, CENTER);
  textSize(11);
  for (let i = 0; i < labels.length; i++) {
    const b = labels[i];
    const bw = widths[i];
    const hot = hitMobileAction(mouseX, mouseY)?.id === b.id;
    fill(...t.toggleBg);
    stroke(...t.border);
    strokeWeight(1);
    rect(bx, btnY, bw, btnH, 8);
    noStroke();
    fill(...(hot || (b.id === "play" && animateMode && !animatePaused) ? t.title : t.subtitle));
    text(b.label, bx + bw / 2, btnY + btnH / 2 + 1);
    pushMobileHit(b.id, bx, btnY, bw, btnH);
    bx += bw + gap;
  }

  if (mobileMenuOpen) drawMobileMenu();
}

function drawMobileMenu() {
  const t = theme();
  const bottomH = mobileBottomH();
  const sheetH = min(height * 0.62, 420);
  const y = height - bottomH - sheetH;

  fill(t.bg[0], t.bg[1], t.bg[2], 160);
  noStroke();
  rect(0, 0, width, y);
  pushMobileHit("menu_backdrop", 0, 0, width, y);

  fill(...t.panel);
  stroke(...t.border);
  strokeWeight(1);
  rect(0, y, width, sheetH);

  noStroke();
  fill(...t.title);
  textAlign(LEFT, TOP);
  textSize(11);
  text("MENU", 16, y + 14);

  fill(...t.muted);
  textSize(9);
  text("Browse on phone · categories · theme · links", 16, y + 32);

  const items = [
    { id: "link", label: "Home", url: HOME_URL },
    { id: "link", label: "Ontology", url: ONTOLOGY_URL },
    { id: "link", label: "Voice", url: VOICE_URL },
    { id: "link", label: "Image", url: IMAGE_URL },
    { id: "link", label: "Essay 1", url: ESSAY1_URL },
    { id: "link", label: "Essay 2", url: ESSAY2_URL },
    { id: "link", label: "Slides", url: SLIDES_URL },
    { id: "link", label: "Showcase", url: SHOWCASE_URL },
    { id: "link", label: "Video", url: VIDEO_URL },
    { id: "link", label: "Synthetic Podcast", url: PODCAST_URL },
    { id: "link", label: "NotebookLM \u2197", url: NOTEBOOK_LM_URL },
    { id: "link", label: "Scan QR Code", url: SCAN_QR_URL },
    { id: "link", label: "GitHub \u2197", url: GITHUB_URL },
    { id: "theme_dark", label: "Theme: Dark" },
    { id: "theme_light", label: "Theme: Light" },
  ];

  let rowY = y + 54;
  textSize(12);
  for (const item of items) {
    const hot = hitMobileAction(mouseX, mouseY)?.meta === item.label
      || (hitMobileAction(mouseX, mouseY)?.id === item.id && item.id.startsWith("theme"));
    fill(hot ? t.title[0] : t.panelTitle[0], hot ? t.title[1] : t.panelTitle[1], hot ? t.title[2] : t.panelTitle[2]);
    textAlign(LEFT, CENTER);
    text(item.label, 16, rowY + 14);
    pushMobileHit(item.id, 0, rowY, width, 28, item.url || item.label);
    stroke(...t.border);
    strokeWeight(0.5);
    line(16, rowY + 28, width - 16, rowY + 28);
    noStroke();
    rowY += 30;
  }

  // Compact category chips
  fill(...t.muted);
  textAlign(LEFT, TOP);
  textSize(9);
  text("CATEGORIES — tap to focus", 16, rowY + 8);
  rowY += 28;
  textSize(10);
  let chipX = 16;
  const chipY = rowY;
  const chipH = 26;
  for (const cat of RING_ORDER) {
    const label = CATEGORY_META[cat].label;
    const chipW = textWidth(label) + 16;
    if (chipX + chipW > width - 16) {
      chipX = 16;
      rowY += chipH + 6;
    }
    const active = selectedCategory === cat;
    fill(...(active ? t.title : t.toggleBg));
    if (!active) {
      stroke(...t.border);
      strokeWeight(1);
    } else noStroke();
    rect(chipX, rowY, chipW, chipH, 6);
    noStroke();
    fill(...(active ? t.bg : t.subtitle));
    textAlign(CENTER, CENTER);
    text(label, chipX + chipW / 2, rowY + chipH / 2 + 1);
    pushMobileHit("category", chipX, rowY, chipW, chipH, cat);
    chipX += chipW + 6;
  }
}

function drawUI() {
  const t = theme();
  uiLinks = [];
  mobileHits = [];

  if (isMobileLayout()) {
    drawMobileUI();
    return;
  }

  const barH = 112;
  const headerTextX = 118;
  fill(...t.uiBar);
  noStroke();
  rect(0, 0, width, barH);

  setTextFill();
  textAlign(LEFT, CENTER);
  textSize(11);
  textStyle(NORMAL);
  fill(...t.title);
  drawingContext.font = '300 11px "IBM Plex Mono", monospace';
  text("Hybrid Intelligences: Embodied Leadership and Creativity in the Era of AI", headerTextX, 27);
  drawingContext.font = '400 11px "IBM Plex Mono", monospace';

  textSize(8);
  fill(...t.subtitle);
  text(
    "A hybrid dynamic knowledge architecture of concepts, essays, documentation, visualization, conversational AI, and program materials for embodied leadership and creativity in the era of AI.",
    headerTextX,
    41
  );

  textSize(8.5);
  const orgY = 55;
  const orgSep = " \u2022 ";
  const orgLinks = [
    { label: "University of Florida", url: "https://www.ufl.edu/" },
    { label: "Center for Arts, Migration + Entrepreneurship", url: "https://arts.ufl.edu/came/" },
    { label: "IGNITE Engineering", url: "https://www.eng.ufl.edu/innovation/" },
    { label: "Center for Arts in Medicine", url: "https://arts.ufl.edu/programs-schools/center-for-arts-in-medicine/" },
    { label: "College of the Arts", url: "https://arts.ufl.edu/" },
  ];
  let orgX = headerTextX;
  for (let i = 0; i < orgLinks.length; i++) {
    if (i > 0) {
      fill(...t.subtitle);
      text(orgSep, orgX, orgY);
      orgX += textWidth(orgSep);
    }
    const org = orgLinks[i];
    const orgW = textWidth(org.label);
    uiLinks.push({
      url: org.url,
      x: orgX,
      y: orgY - 6,
      w: orgW,
      h: 12,
    });
    const orgHover = hitUiLink(mouseX, mouseY) === org.url;
    fill(...t.title, orgHover ? 255 : 200);
    text(org.label, orgX, orgY);
    stroke(...t.title, orgHover ? 220 : 120);
    strokeWeight(0.5);
    line(orgX, orgY + 5, orgX + orgW, orgY + 5);
    noStroke();
    orgX += orgW;
  }

  const creditY = 69;
  const subtitlePrefix = "Conceptual network visualization by ";
  const subtitleName = "Marlon Barrios Solano";
  textSize(8);
  fill(...t.subtitle);
  text(subtitlePrefix, headerTextX, creditY);
  const nameX = headerTextX + textWidth(subtitlePrefix);
  const nameW = textWidth(subtitleName);
  uiLinks.push({
    url: PORTFOLIO_URL,
    x: nameX,
    y: creditY - 6,
    w: nameW,
    h: 12,
  });
  const nameHover = hitUiLink(mouseX, mouseY) === PORTFOLIO_URL;
  fill(...t.title, nameHover ? 255 : 220);
  text(subtitleName, nameX, creditY);
  stroke(...t.title, nameHover ? 220 : 140);
  strokeWeight(0.5);
  line(nameX, creditY + 5, nameX + nameW, creditY + 5);
  noStroke();

  const creditSep = " \u00b7 ";
  textSize(8);
  fill(...t.subtitle);
  let creditCursorX = nameX + nameW;

  const creditNavLinks = [
    { url: HOME_URL, label: "Home" },
    { url: ONTOLOGY_URL, label: "Ontology \u2197" },
    { url: VOICE_URL, label: "Voice" },
    { url: IMAGE_URL, label: "Image" },
    { url: ESSAY1_URL, label: "Essay 1" },
    { url: ESSAY2_URL, label: "Essay 2" },
    { url: CANVAS_URL, label: "Canvas \u2197" },
    { url: SLIDES_URL, label: "Slides" },
    { url: SHOWCASE_URL, label: "Showcase" },
    { url: VIDEO_URL, label: "Video" },
    { url: PODCAST_URL, label: "Synthetic Podcast" },
    { url: NOTEBOOK_LM_URL, label: "NotebookLM \u2197" },
    { url: SCAN_QR_URL, label: "Scan QR Code" },
    { url: GITHUB_URL, label: "GitHub \u2197" },
  ];
  for (const link of creditNavLinks) {
    text(creditSep, creditCursorX, creditY);
    creditCursorX += textWidth(creditSep);
    const linkW = textWidth(link.label);
    uiLinks.push({
      url: link.url,
      x: creditCursorX,
      y: creditY - 6,
      w: linkW,
      h: 12,
    });
    const linkHover = hitUiLink(mouseX, mouseY) === link.url;
    fill(...t.title, linkHover ? 255 : 220);
    text(link.label, creditCursorX, creditY);
    stroke(...t.title, linkHover ? 220 : 140);
    strokeWeight(0.5);
    line(creditCursorX, creditY + 5, creditCursorX + linkW, creditY + 5);
    noStroke();
    fill(...t.subtitle);
    creditCursorX += linkW;
  }

  fill(...t.muted);
  textSize(9);
  text("Jul 13\u201330, 2026 \u00b7 click legend / \u2191\u2193 categories \u00b7 A animate \u00b7 R reset \u00b7 T theme", headerTextX, 87);

  drawLegend();

  const focus = getActiveNode();
  if (focus && !ringsOnlyMode()) drawDetailPanel(focus);

  drawThemeToggle();

  fill(...t.muted, 180);
  textAlign(RIGHT, BOTTOM);
  textSize(9);
  if (animateMode) {
    const phase = getAnimatePhase();
    const phaseLabel = phase === "rings"
      ? "RINGS · CATEGORIES"
      : phase === "theme"
      ? `THEME · ${themeCrossfadeTo === "light" ? "LIGHT" : "DARK"}`
      : CATEGORY_META[phase].label.toUpperCase();
    fill(...t.title, 220);
    const pauseLabel = animatePaused ? " · PAUSED" : "";
    text(`ANIMATE · ${phaseLabel}${pauseLabel}`, width - 16, height - 24);
    fill(...t.muted, 180);
  } else if (selectedCategory) {
    fill(...t.title, 220);
    text(`FOCUSED · ${CATEGORY_META[selectedCategory].label.toUpperCase()} · \u2191\u2193 move \u00b7 Esc clear`, width - 16, height - 24);
    fill(...t.muted, 180);
  }
  const footerStats = `${nodes.length} concepts \u00b7 ${edges.length} relations \u00b7 `;
  const footerOntology = "ontology";
  const footerW = textWidth(footerStats + footerOntology);
  const footerX = width - 16 - footerW;
  textAlign(LEFT, BOTTOM);
  fill(...t.muted, 180);
  text(footerStats, footerX, height - 12);
  const footerOntologyX = footerX + textWidth(footerStats);
  uiLinks.push({
    url: ONTOLOGY_URL,
    x: footerOntologyX,
    y: height - 22,
    w: textWidth(footerOntology),
    h: 14,
  });
  const footerHover = hitUiLink(mouseX, mouseY) === ONTOLOGY_URL;
  fill(...t.title, footerHover ? 220 : 180);
  text(footerOntology, footerOntologyX, height - 12);
}

function toggleLayout() {
  const btnW = 46;
  const btnH = 26;
  const gap = 4;
  const padX = 6;
  const padY = 4;
  const totalW = btnW * 2 + gap;
  const bottom = 16;
  const x = 16 + padX;
  const y = height - bottom - btnH - padY;
  return { btnW, btnH, gap, padX, padY, totalW, x, y, bottom };
}

function drawThemeToggle() {
  const t = theme();
  const { btnW, btnH, gap, padX, padY, totalW, x, y } = toggleLayout();
  const boxX = 16;
  const boxY = y - padY;

  fill(...t.toggleBg);
  stroke(...t.border);
  strokeWeight(1);
  rect(boxX, boxY, totalW + padX * 2, btnH + padY * 2, 8);

  noStroke();
  const modes = ["dark", "light"];
  themeToggleBounds = { _box: { x: boxX, y: boxY, w: totalW + padX * 2, h: btnH + padY * 2 } };

  modes.forEach((mode, i) => {
    const bx = x + i * (btnW + gap);
    const displayMode = themeCrossfadeActive ? themeCrossfadeTo : themeMode;
    const active = displayMode === mode;
    if (active) {
      fill(...t.toggleActive, 40);
      rect(bx, y, btnW, btnH, 6);
    }
    fill(active ? t.toggleActive : t.toggleInactive);
    textAlign(CENTER, CENTER);
    textSize(10);
    textStyle(active ? BOLD : NORMAL);
    text(THEMES[mode].label, bx + btnW / 2, y + btnH / 2 + 1);
    textStyle(NORMAL);
    themeToggleBounds[mode] = { x: bx, y, w: btnW, h: btnH };
  });
}

function hitThemeToggle(mx, my) {
  const box = themeToggleBounds._box;
  if (box && mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
    for (const [mode, b] of Object.entries(themeToggleBounds)) {
      if (mode === "_box") continue;
      if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        return mode;
      }
    }
    return themeMode === "dark" ? "light" : "dark";
  }
  return null;
}

function legendCategoryFocus(key) {
  if (categoryHighlightActive() && categoryDisplay !== null) {
    const focus = ringCategoryFocus(key);
    if (focus > 0) return focus;
  }
  if (!animateMode && mouseOnLegend && hoveredCategory === key) return 0.4;
  return 0;
}

function drawLegend() {
  const t = theme();
  const cats = RING_ORDER.map(key => [key, CATEGORY_META[key]]);
  const { boxW, boxH, x, y } = legendLayout();

  fill(...t.panel, 230);
  stroke(...t.border);
  strokeWeight(1);
  rect(x, y, boxW, boxH, 6);

  fill(...t.legendHead);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(9);

  const header = legendHeaderLayout();
  const wordColor = (hot) => hot ? t.title : t.legendHead;
  let hx = header.rings.x;
  const hy = y + 10;
  const phase = animateMode ? getAnimatePhase() : null;
  const hotRings = (legendHeaderHit(mouseX, mouseY) && mouseX >= header.rings.x - 1 && mouseX <= header.rings.x + header.rings.w + 1)
    || (animateMode && phase === "rings");
  const hotCats = (legendHeaderHit(mouseX, mouseY) && mouseX >= header.categories.x - 1 && mouseX <= header.categories.x + header.categories.w + 1)
    || (animateMode && phase === "rings")
    || (animateMode && phase && RING_ORDER.includes(phase));

  if (hotRings) {
    fill(...t.title, 30);
    noStroke();
    rect(header.rings.x - 2, header.rings.y - 1, header.rings.w + 4, header.rings.h + 2, 3);
  }
  if (hotCats) {
    fill(...t.title, 30);
    noStroke();
    rect(header.categories.x - 2, header.categories.y - 1, header.categories.w + 4, header.categories.h + 2, 3);
  }

  fill(...wordColor(hotRings));
  text("RINGS", hx, hy);
  hx += textWidth("RINGS");
  fill(...t.legendText, 120);
  text(" · ", hx, hy);
  hx += textWidth(" · ");
  fill(...wordColor(hotCats));
  text("CATEGORIES", hx, hy);

  cats.forEach(([key, meta], i) => {
    const ly = y + 30 + i * 20;
    const focus = legendCategoryFocus(key);
    const isPinned = !animateMode && selectedCategory === key;
    const isAnimate = animateMode && focus > 0;
    const [lr, lg, lb] = ringColor(key);

    if (focus > 0) {
      fill(lr, lg, lb, isPinned ? 52 * focus : 24 + focus * 28);
      noStroke();
      rect(x + 6, ly - 2, boxW - 12, 18, 4);
    }

    fill(lr, lg, lb);
    noStroke();
    ellipse(x + 18, ly + 7, 10);
    stroke(lr, lg, lb, focus > 0 ? lerp(100, 220, focus) : lerp(100, 60, themeDarkness()));
    strokeWeight(focus > 0 ? 1 + focus * 0.8 : 1);
    noFill();
    ellipse(x + 18, ly + 7, 16 + focus * 4);
    noStroke();
    fill(lerp(t.legendText[0], t.title[0], focus), lerp(t.legendText[1], t.title[1], focus), lerp(t.legendText[2], t.title[2], focus));
    textSize(9);
    textStyle(focus > 0.45 ? BOLD : NORMAL);
    text(meta.label, x + 32, ly);
    if (isAnimate && categoryDisplay === key && focus > 0.12) {
      fill(...t.title, 140 + focus * 115);
      textSize(8);
      text("▶", x + boxW - 16, ly + 1);
    } else if (isPinned && focus > 0.45) {
      fill(...t.title, 140 + focus * 115);
      textSize(8);
      text("●", x + boxW - 16, ly + 1);
    }
    textStyle(NORMAL);
  });
}

function voiceTalkUrl(id, label) {
  const name = String(label || id).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  return `${VOICE_URL}?talk=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
}

function imageObjectUrl(id, label) {
  const name = String(label || id).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  return `${IMAGE_URL}?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
}

function podcastObjectUrl(id, label) {
  const name = String(label || id).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  return `${DEEP_DIVE_URL}?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
}

function detailPanelLayout(n) {
  const panelW = min(360, width - 32);
  const mobile = isMobileLayout();
  const toggleH = mobile
    ? mobileBottomH() + 10
    : toggleLayout().bottom + toggleLayout().btnH + toggleLayout().padY * 2 + 12;
  const wikiUrl = n?.wikiUrl || (n?.url?.includes("wikipedia.org") ? n.url : null);
  const primaryUrl = n?.url && n.url !== wikiUrl ? n.url : null;
  const linkCount = 3 + (primaryUrl ? 1 : 0) + (wikiUrl ? 1 : 0) + 1;
  const hasLink = linkCount > 0;
  const panelH = mobile ? min(108 + linkCount * 18, 248) : 108 + linkCount * 20;
  return { panelW, x: 16, y: height - toggleH - panelH, panelH, hasLink, linkCount, wikiUrl, primaryUrl };
}

function hitDetailPanelLink(mx, my) {
  for (const link of detailPanelLinks) {
    if (mx >= link.x && mx <= link.x + link.w && my >= link.y && my <= link.y + link.h) {
      return link.url;
    }
  }
  return null;
}

function hitUiLink(mx, my) {
  for (const link of uiLinks) {
    if (mx >= link.x && mx <= link.x + link.w && my >= link.y && my <= link.y + link.h) {
      return link.url;
    }
  }
  return null;
}

function drawDetailPanel(n) {
  const t = theme();
  detailPanelLinks = [];
  const { panelW, x, y, panelH, hasLink, linkCount, wikiUrl, primaryUrl } = detailPanelLayout(n);

  fill(...t.panel, panelAlpha * 0.96);
  stroke(...ringColor(n.cat), 140);
  strokeWeight(1.5);
  rect(x, y, panelW, panelH, 6);

  fill(...ringColor(n.cat));
  noStroke();
  textAlign(LEFT, TOP);
  textSize(10);
  text(CATEGORY_META[n.cat].label.toUpperCase(), x + 14, y + 12);

  fill(...t.panelTitle);
  textSize(13);
  textStyle(BOLD);
  text(n.label.replace(/\n/g, " "), x + 14, y + 28);
  textStyle(NORMAL);

  fill(...t.panelBody);
  textSize(10);
  const wrapped = wrapText(n.desc, panelW - 28, 10);
  let ty = y + 48;
  const extraLinks = 1 + (primaryUrl ? 1 : 0) + (wikiUrl ? 1 : 0);
  const maxLines = hasLink ? max(2, 4 - extraLinks) : 3;
  for (const line of wrapped.slice(0, maxLines)) {
    text(line, x + 14, ty);
    ty += 14;
  }

  const linkCol = [18, 85, 155].map((v, i) => lerp(v, [130, 195, 255][i], themeDarkness()));
  let linkY = y + panelH - 14 - (linkCount * 20);

  function drawPanelLink(url, label) {
    textSize(10);
    fill(...linkCol);
    text(label, x + 14, linkY);
    const tw = textWidth(label);
    stroke(...linkCol, 200);
    strokeWeight(0.8);
    line(x + 14, linkY + 11, x + 14 + tw, linkY + 11);
    noStroke();
    detailPanelLinks.push({ url, x: x + 14, y: linkY - 2, w: tw, h: 16 });
    linkY += 20;
  }

  drawPanelLink(voiceTalkUrl(n.id, n.label), "Talk about this");
  drawPanelLink(imageObjectUrl(n.id, n.label), "Make an image");
  drawPanelLink(podcastObjectUrl(n.id, n.label), "Make a podcast");
  if (primaryUrl) {
    drawPanelLink(primaryUrl, n.linkLabel || "Open external link ↗");
  }
  if (wikiUrl) {
    drawPanelLink(wikiUrl, "Wikipedia ↗");
  }
  drawPanelLink(`${ONTOLOGY_URL}#${n.id}`, "View in ontology ↗");

  const connCount = edges.filter(e => e.a === n || e.b === n).length;
  fill(...t.panelMuted);
  textSize(9);
  text(`${connCount} connections${hasLink ? " · click link to open" : " highlighted on hover"}`, x + 14, y + panelH - 14);
}

function wrapText(str, maxW, sz) {
  textSize(sz);
  const words = str.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    if (textWidth(test) > maxW && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function mouseMoved() {
  if (!dragging) {
    if (!isMobileLayout()) updateLegendHover(mouseX, mouseY);
    const prevHovered = hovered;
    hovered = nodeAt(mouseX, mouseY);
    if (hovered) {
      relationLinger = hovered;
      relationLingerUntil = time + 0.45;
    } else if (!(selected && activeCategory() && selected.cat !== activeCategory())) {
      if (time >= relationLingerUntil) relationLinger = null;
    }
    if (selected && !nodeAcceptsPointer(selected) && !(activeCategory() && selected.cat === activeCategory())) {
      selected = null;
    }

    if (animateMode && !ringsOnlyMode()) {
      if (hovered) pauseAnimateForHover();
      else if (prevHovered && !isMobileLayout()) resumeAnimateFromHover();
    }

    if (
      hitUiLink(mouseX, mouseY) ||
      hitDetailPanelLink(mouseX, mouseY) ||
      hitMobileAction(mouseX, mouseY) ||
      hovered ||
      (!isMobileLayout() && (legendCategoryAt(mouseX, mouseY) || legendHeaderHit(mouseX, mouseY)))
    ) {
      cursor("pointer");
    } else {
      cursor("default");
    }
  }
}

function handleMobileChromePress(hit) {
  if (!hit) return false;
  if (hit.id === "menu_backdrop") {
    mobileMenuOpen = false;
    return true;
  }
  if (hit.id === "play") {
    mobileMenuOpen = false;
    handleMobilePlay();
    return true;
  }
  if (hit.id === "reset") {
    resetNetworkView();
    return true;
  }
  if (hit.id === "menu") {
    mobileMenuOpen = !mobileMenuOpen;
    return true;
  }
  if (hit.id === "prev") {
    mobileMenuOpen = false;
    if (animateMode) {
      animateMode = false;
      animatePaused = false;
      animatePauseRemaining = 0;
    }
    stepCategory(-1);
    return true;
  }
  if (hit.id === "next") {
    mobileMenuOpen = false;
    if (animateMode) {
      animateMode = false;
      animatePaused = false;
      animatePauseRemaining = 0;
    }
    stepCategory(1);
    return true;
  }
  if (hit.id === "link" && hit.meta) {
    mobileMenuOpen = false;
    window.open(hit.meta, "_blank", "noopener,noreferrer");
    return true;
  }
  if (hit.id === "theme_dark") {
    setTheme("dark", false);
    return true;
  }
  if (hit.id === "theme_light") {
    setTheme("light", false);
    return true;
  }
  if (hit.id === "category" && hit.meta) {
    if (animateMode) {
      animateMode = false;
      animatePaused = false;
    }
    setSelectedCategory(hit.meta);
    return true;
  }
  return false;
}

function mousePressed() {
  const link = hitUiLink(mouseX, mouseY) || hitDetailPanelLink(mouseX, mouseY);
  if (link) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }

  if (isMobileLayout()) {
    const mobileHit = hitMobileAction(mouseX, mouseY);
    if (handleMobileChromePress(mobileHit)) return;

    const n = nodeAt(mouseX, mouseY);
    if (animateMode) {
      pauseAnimateForHover();
      if (n) {
        selected = n;
        hovered = n;
      }
      return;
    }

    if (n) {
      dragging = n;
      selected = n;
      if (n.id !== "coupling") n.pinned = false;
    } else {
      selected = null;
      relationLinger = null;
      relationLingerUntil = 0;
      if (mobileMenuOpen) mobileMenuOpen = false;
    }
    return;
  }

  if (animateMode) return;

  const catClick = legendCategoryAt(mouseX, mouseY);
  if (catClick) {
    setSelectedCategory(catClick);
    return;
  }

  const toggled = hitThemeToggle(mouseX, mouseY);
  if (toggled) {
    setTheme(toggled, false);
    return;
  }

  const n = nodeAt(mouseX, mouseY);
  if (n) {
    dragging = n;
    selected = n;
    if (n.id !== "coupling") n.pinned = false;
  } else {
    selected = null;
    relationLinger = null;
    relationLingerUntil = 0;
  }
}

function mouseDragged() {
  if (dragging) {
    dragging.x = mouseX;
    dragging.y = mouseY;
  }
}

function mouseReleased() {
  if (dragging) {
    const { x: cx, y: cy } = layoutCenter;
    const rOff = sin(time * dragging.floatSpeed + dragging.floatPhase) * dragging.floatAmpR;
    const aOff = cos(time * dragging.floatSpeed * 0.71 + dragging.floatPhase * 1.6) * dragging.floatAmpA;
    const goalX = cx + cos(dragging.targetAngle + aOff) * (dragging.targetR + rOff);
    const goalY = cy + sin(dragging.targetAngle + aOff) * (dragging.targetR + rOff);
    dragging.vx = (goalX - dragging.x) * 0.09;
    dragging.vy = (goalY - dragging.y) * 0.09;
    dragging.bounceUntil = time + 4.5;
  }
  dragging = null;
}

function doubleClicked() {
  const n = nodeAt(mouseX, mouseY);
  if (n && n.id !== "coupling") {
    n.pinned = !n.pinned;
    selected = n;
  }
  return false;
}

function keyPressed() {
  if (key === "a" || key === "A") {
    toggleAnimate();
  }
  if (key === "r" || key === "R") {
    resetNetworkView();
  }
  if (key === "t" || key === "T") {
    setTheme(themeMode === "dark" ? "light" : "dark", false);
  }
  if (keyCode === ESCAPE) {
    selectedCategory = null;
  }
  if (keyCode === UP_ARROW) {
    stepCategory(-1);
    return false;
  }
  if (keyCode === DOWN_ARROW) {
    stepCategory(1);
    return false;
  }
}
