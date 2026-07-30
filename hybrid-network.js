// Hybrid Intelligences — Conceptual Network
// Radial layout with Dark / Light theme modes

const CATEGORY_META = {
  program:    { label: "Program",      ring: 0.13 },
  premise:    { label: "Premise",      ring: 0.22 },
  framework:  { label: "Framework",    ring: 0.31 },
  tension:    { label: "Tensions",     ring: 0.40 },
  quality:    { label: "Qualities",    ring: 0.49 },
  phenomenon: { label: "Phenomena",    ring: 0.58 },
  domain:     { label: "Domains",      ring: 0.67 },
  practice:   { label: "Practices",    ring: 0.76 },
  author:     { label: "Authors",      ring: 0.85 },
  facilitator:{ label: "Facilitators", ring: 0.94 },
};

const RING_ORDER = ["program", "premise", "framework", "tension", "quality", "phenomenon", "domain", "practice", "author", "facilitator"];

// Shared ring palette — identical in dark and light mode
const RING_COLORS = {
  premise:    [244, 196,  48],
  author:     [186, 168, 128],
  framework:  [ 78, 196, 196],
  quality:    [110, 198, 130],
  phenomenon: [168, 140, 228],
  domain:     [228, 130, 148],
  practice:   [240, 158,  96],
  program:    [255, 178,  96],
  facilitator:[120, 178, 228],
  tension:    [130, 138, 158],
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
    outerRing: 24,
    pulse: [12, 30],
    edgeDim: 28,
    edgeBase: [80, 110],
    edgeGlow: 50,
    nodeDim: 65,
    labelDim: 75,
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
    outerRing: 45,
    pulse: [20, 50],
    edgeDim: 35,
    edgeBase: [100, 160],
    edgeGlow: 70,
    nodeDim: 80,
    labelDim: 90,
  },
};

let themeMode = "dark";
let themeToggleBounds = { dark: null, light: null };
let hoveredCategory = null;
let mouseOnLegend = false;
let hoveredLegendHeader = false;
let detailPanelLinks = [];
let uiLinks = [];

const PORTFOLIO_URL = "https://marlonbarrios.github.io/";
let animateMode = false;
let animateStep = 0;
let animateUntil = 0;
let categoryDisplay = null;
let categoryPrev = null;
let categoryBlend = 1;

const ANIM_SEQUENCE = ["rings", ...RING_ORDER];
const ANIM_HOLD_SEC = 3;
const CATEGORY_FADE_RATE = 0.011;

let audioCtx = null;

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
  premise: {
    label: "Premise",
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
    label: "Framework",
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
    label: "Authors",
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
    desc: "Intelligence is not located in a skull or machine—it is a relational event happening through bodies, tools, architectures, and co-presence." },
  { id: "hybrid",             label: "Hybrid\nIntelligences",         cat: "premise",    weight: 2.0,
    desc: "Assemblages of biological, technical, social, spatial, legal, and affective processes that co-produce cognition.",
    url: "https://ufl.instructure.com/courses/574408/pages/hybrid-intelligences-cognitive-assemblages-and-speculative-futures-in-the-era-of-ai-essay?module_item_id=13030950", linkLabel: "Read essay ↗" },
  { id: "creative_embodiment", label: "Creative\nEmbodiment",       cat: "premise",    weight: 1.9,
    desc: "The project's embodiment framework: AI-mediated creative process is already embodied, situated, and relational—not a body added after the fact. The artist designs conditions of encounter; prompt, model, interface, dataset, institution, and audience form a cognitive assemblage. Necessary epistemology: the body is where abstraction becomes consequential; space situates cognition; movement temporalizes thought." },
  { id: "mediation",          label: "Cognitive\nMediation",        cat: "phenomenon", weight: 1.8,
    desc: "Mediation has become cognitive—tools now participate in perception, memory, imagination, decision, and future-making." },

  { id: "4e",                 label: "4E Cognition",                  cat: "framework",  weight: 1.9,
    desc: "Embodied, Embedded, Enacted, Extended—cognition as world-involving practice, not internal representation.",
    url: "https://en.wikipedia.org/wiki/Embodied_cognition", linkLabel: "Wikipedia ↗" },
  { id: "enactivism",         label: "Enactivism",                    cat: "framework",  weight: 1.7,
    desc: "Organisms bring forth meaningful worlds through histories of interaction; cognition and world are co-emergent.",
    url: "https://en.wikipedia.org/wiki/Enactivism", linkLabel: "Wikipedia ↗" },
  { id: "assemblage",         label: "Cognitive\nAssemblages",      cat: "framework",  weight: 2.0,
    desc: "Hayles: networked arrangements where human and nonhuman cognizers exchange information, producing emergent meaning.",
    url: "https://en.wikipedia.org/wiki/Katherine_Hayles", linkLabel: "Wikipedia ↗" },
  { id: "extended",           label: "Extended Mind",                 cat: "framework",  weight: 1.4,
    desc: "Cognitive processes include tools, inscriptions, devices, media, and social structures beyond the organism.",
    url: "https://en.wikipedia.org/wiki/Extended_mind_thesis", linkLabel: "Wikipedia ↗" },
  { id: "cyborg",             label: "Natural-Born\nCyborg",          cat: "framework",  weight: 1.5,
    desc: "Clark: humans have always been technologically plastic, incorporating tools into the fabric of thought.",
    url: "https://en.wikipedia.org/wiki/Andy_Clark", linkLabel: "Wikipedia ↗" },
  { id: "possible_minds",     label: "Space of\nPossible Minds",      cat: "framework",  weight: 1.4,
    desc: "Intelligence as a vast landscape of cognitive organizations—not a ladder with humans at the top.",
    url: "https://en.wikipedia.org/wiki/Murray_Shanahan", linkLabel: "Wikipedia ↗" },
  { id: "technosymbiosis",    label: "Techno-\nsymbiosis",            cat: "framework",  weight: 1.6,
    desc: "Hayles: human futures with nonhuman symbionts—biological, technical, and mixed couplings that co-evolve across substrates.",
    url: "https://en.wikipedia.org/wiki/Katherine_Hayles", linkLabel: "Wikipedia ↗" },
  { id: "affordances",        label: "Affordances",                   cat: "framework",  weight: 1.5,
    desc: "Gibson: environments offer possibilities for action—what a situation allows, invites, or constrains for a particular organism or assemblage.",
    url: "https://en.wikipedia.org/wiki/Affordance", linkLabel: "Wikipedia ↗" },
  { id: "umwelt",             label: "Umwelt",                        cat: "framework",  weight: 1.4,
    desc: "von Uexküll: the organism's lived meaningful environment—the world as selectively enacted through sensing, action, and coupling, not a pre-given objective space.",
    url: "https://en.wikipedia.org/wiki/Umwelt", linkLabel: "Wikipedia ↗" },

  { id: "ai",                 label: "Artificial\nIntelligence",      cat: "framework",  weight: 1.8,
    desc: "Computational systems that infer, classify, generate, and act within human-designed environments—participants in cognitive assemblages, not minds in boxes.",
    url: "https://en.wikipedia.org/wiki/Artificial_intelligence", linkLabel: "Wikipedia ↗" },
  { id: "gen_ai",             label: "Generative\nAI",                cat: "framework",  weight: 1.7,
    desc: "Models that produce text, image, sound, code, and movement from learned patterns—extending imagination, abstraction, and co-creation across hybrid couplings.",
    url: "https://en.wikipedia.org/wiki/Generative_artificial_intelligence", linkLabel: "Wikipedia ↗" },
  { id: "creative_ai",        label: "Creative\nAI",                 cat: "framework",  weight: 1.6,
    desc: "AI in artistic, choreographic, architectural, and speculative practice—where prompts, interfaces, and institutions co-compose what can be made and felt." },
  { id: "llm",                label: "Large Language\nModels",        cat: "framework",  weight: 1.6,
    desc: "Language models at scale—statistical engines of prediction and paraphrase that mediate writing, reasoning, memory, and social coupling through text.",
    url: "https://en.wikipedia.org/wiki/Large_language_model", linkLabel: "Wikipedia ↗" },
  { id: "agi",                label: "AGI",                           cat: "framework",  weight: 1.5,
    desc: "Artificial General Intelligence—hypothetical systems with flexible, domain-spanning capability; a horizon concept for comparing minds, agency, and coupling." },
  { id: "asi",                label: "ASI",                           cat: "framework",  weight: 1.4,
    desc: "Artificial Superintelligence—speculative systems exceeding human performance across domains; raises questions of scale, governance, and the space of possible minds." },
  { id: "ai_alignment",       label: "AI\nAlignment",                 cat: "framework",  weight: 1.5,
    desc: "Research and design for steering AI systems toward intended values and outcomes—raising questions of agency, governance, embodiment, and who defines the goals being aligned.",
    url: "https://en.wikipedia.org/wiki/AI_alignment", linkLabel: "Wikipedia ↗" },
  { id: "cybernetics",        label: "Cybernetics",                   cat: "framework",  weight: 1.5,
    desc: "Study of communication and control in systems—feedback, regulation, and circular causality across organisms, machines, and ecologies of mind.",
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
    url: "https://en.wikipedia.org/wiki/Andy_Clark", linkLabel: "Wikipedia ↗" },
  { id: "hayles",             label: "Katherine\nHayles",             cat: "author",     weight: 1.4,
    desc: "Posthuman cognition, cognitive assemblages, technosymbiosis—the nonconscious and human-AI couplings.",
    url: "https://en.wikipedia.org/wiki/Katherine_Hayles", linkLabel: "Wikipedia ↗" },
  { id: "thompson",           label: "Evan\nThompson",                cat: "author",     weight: 1.3,
    desc: "Mind in Life and enactivism—bridging biology, phenomenology, and cognitive science.",
    url: "https://en.wikipedia.org/wiki/Evan_Thompson", linkLabel: "Wikipedia ↗" },
  { id: "varela",             label: "Francisco\nVarela",             cat: "author",     weight: 1.2,
    desc: "The Embodied Mind: cognition as embodied action bringing forth a world of significance.",
    url: "https://en.wikipedia.org/wiki/Francisco_Varela", linkLabel: "Wikipedia ↗" },
  { id: "margulis",           label: "Lynn\nMargulis",                cat: "author",     weight: 1.2,
    desc: "Symbiogenesis and endosymbiosis: evolution as cooperative merger across organisms.",
    url: "https://en.wikipedia.org/wiki/Lynn_Margulis", linkLabel: "Wikipedia ↗" },
  { id: "bateson",            label: "Gregory\nBateson",              cat: "author",     weight: 1.3,
    desc: "Ecology of mind—systems, pattern, and communication across organisms, cultures, and environments; thinking is relational, not confined to the individual skull.",
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
  { id: "carney",             label: "James Carney",                  cat: "author",     weight: 1.0,
    desc: "Review and synthesis of 4E cognition across evolutionary and cultural perspectives.",
    url: "https://en.wikipedia.org/wiki/Embodied_cognition", linkLabel: "Wikipedia ↗" },
  { id: "wilson",             label: "Robert A.\nWilson",             cat: "author",     weight: 1.0,
    desc: "Situated cognition—letting nature take its course across brain, body, and world.",
    url: "https://en.wikipedia.org/wiki/Robert_A._Wilson_(philosopher)", linkLabel: "Wikipedia ↗" },
  { id: "rosch",              label: "Eleanor\nRosch",                cat: "author",     weight: 1.0,
    desc: "The Embodied Mind—categorization, mindfulness, and the enactive approach to experience.",
    url: "https://en.wikipedia.org/wiki/Eleanor_Rosch", linkLabel: "Wikipedia ↗" },
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
  { id: "social_change",      label: "Social\nChange",                cat: "phenomenon", weight: 1.4,
    desc: "Transformation of institutions, habits, and power—when critique, imagination, and collective action reshape what communities can know, feel, and become." },
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
  { id: "cs",                 label: "Computer\nScience",            cat: "domain",     weight: 1.1,
    desc: "Technical systems as participants in cognitive assemblages, not neutral tools." },
  { id: "ai_ml",              label: "Artificial Intelligence/\nMachine Learning", cat: "domain", weight: 1.4,
    desc: "Computational learning, inference, and pattern recognition—models, datasets, and infrastructures that participate in perception, generation, and decision across hybrid couplings." },
  { id: "ecology_d",          label: "Ecology",                       cat: "domain",     weight: 1.1,
    desc: "Interdependence across biological and artificial substrates in shared cognitive ecosystems." },

  { id: "dance",              label: "Dance",                         cat: "domain",     weight: 1.4,
    desc: "The domain of dance—movement arts, bodily expression, performance, and choreographic cultures as fields of knowledge." },
  { id: "choreography_d",     label: "Choreography",                  cat: "domain",     weight: 1.4,
    desc: "The art of organizing movement in time and space—bodies, relations, and rhythm as forms of thought and world-making." },
  { id: "circus_arts",        label: "Circus Arts",                   cat: "domain",     weight: 1.3,
    desc: "Acrobatics, partner work, object manipulation, and ensemble circus—disciplines of timing, trust, and embodied coordination across bodies and apparatus." },
  { id: "music",              label: "Music",                         cat: "domain",     weight: 1.3,
    desc: "Sound, rhythm, and listening as cognitive and social practice—organizing attention, memory, and collective imagination." },
  { id: "storytelling",       label: "Storytelling",                  cat: "domain",     weight: 1.3,
    desc: "Narrative as a technology for sense-making—stories shape what can be remembered, felt, believed, and acted upon." },
  { id: "interdisciplinary_art", label: "Interdisciplinary\nArt",   cat: "domain",     weight: 1.4,
    desc: "Art that crosses disciplines—movement, sound, image, code, and institution woven into hybrid forms of inquiry." },
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
  { id: "design_thinking",    label: "Design\nThinking",              cat: "domain",     weight: 1.3,
    desc: "Human-centered methods for framing problems and prototyping solutions—iteration, empathy, and material testing as ways of knowing through making.",
    url: "https://en.wikipedia.org/wiki/Design_thinking", linkLabel: "Wikipedia ↗" },

  { id: "art",                label: "Art",                           cat: "practice",   weight: 1.4,
    desc: "Studio and speculative practice—futures rehearsed, staged, prototyped, felt, and contested through making." },
  { id: "choreography",       label: "Choreography",                  cat: "practice",   weight: 1.5,
    desc: "Method for studying distributed cognition—thought is temporal, relational, rhythmic; gesture makes ideas thinkable." },
  { id: "choreo_knowledge",   label: "Choreographic\nKnowledge",      cat: "practice",   weight: 1.5,
    desc: "Forsythe: intelligence enacted through spacing, timing, alignment, and relation—thinking that moves, held in bodies, scores, and archives as much as in propositions." },
  { id: "somatics",           label: "Somatic\nAwareness",            cat: "practice",   weight: 1.4,
    desc: "Lived bodily awareness as practice—feeling what systems do to attention, co-regulation, and presence in hybrid couplings." },
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

  { id: "hi_program",         label: "Hybrid Intelligences\nProgram", cat: "program",  weight: 2.0,
    desc: "Modular interdisciplinary program co-led by Marlon Barrios Solano and Erika Moore, hosted by CAME and CAM, in partnership with IGNITE at Wertheim Laboratory. July 13–30, 2026.",
    url: "https://ufl.instructure.com/courses/574408", linkLabel: "Canvas course ↗" },
  { id: "came",               label: "CAME",                          cat: "program",  weight: 1.2,
    desc: "Center for Arts, Migration and Entrepreneurship — lead host institution for Hybrid Intelligences.",
    url: "https://arts.ufl.edu/came/", linkLabel: "CAME at UF ↗" },
  { id: "cam",                label: "CAM",                           cat: "program",  weight: 1.2,
    desc: "Center for Arts in Medicine — advancing education, research, and practice at the intersections of the arts and health.",
    url: "https://arts.ufl.edu/programs-schools/center-for-arts-in-medicine/", linkLabel: "Center for Arts in Medicine ↗" },
  { id: "ignite",             label: "IGNITE\nProgram",               cat: "program",  weight: 1.2,
    desc: "Engineering Innovation Institute partnership integrating innovation leadership into the program.",
    url: "https://www.eng.ufl.edu/innovation/", linkLabel: "IGNITE at UF ↗" },
  { id: "wertheim",           label: "Wertheim\nLaboratory",          cat: "program",  weight: 1.2,
    desc: "Herbert Wertheim Laboratory for Engineering Excellence—Leadership Studio 370, all program activities.",
    url: "https://www.eng.ufl.edu/wertheim/", linkLabel: "Wertheim Laboratory ↗" },
  { id: "track_space",        label: "Track 1\nSpace & Memory",       cat: "program",  weight: 1.4,
    desc: "Mondays 12:30–3:15 — AI, space, memory, and embodiment. Jul 13: Karla Saldaña Ochoa · Jul 20: Onye Ozuzu · Jul 27: Corey Cheval." },
  { id: "track_future",       label: "Track 2\nFuture Lab",           cat: "program",  weight: 1.4,
    desc: "Wednesdays 5:30–7:30 — Speculation, prototyping, and imagining alternative human–AI futures. Jul 15: Jackie Larson · Jul 22: Andrew Hix · Jul 29: Turbado Marabou — with Erika Moore." },
  { id: "track_ethics",       label: "Track 3\nEthics & Leadership",  cat: "program",  weight: 1.4,
    desc: "Thursdays 12:30–3:15 — AI ethics, authorship, law, and embodied leadership. Jul 16, 23, 30 with Erika Moore, Buckner, McNealy, White." },
  { id: "reception",          label: "Public\nReception",           cat: "program",  weight: 1.1,
    desc: "Thursday July 30 — public networking gathering to share experiments and process-based outcomes with the campus and Gainesville community." },

  { id: "marlon",             label: "Marlon Barrios\nSolano",        cat: "facilitator", weight: 1.6,
    desc: "Co-director and co-facilitator across all Hybrid Intelligences sessions, affiliated with CAME. Embodied practice, choreography, and hybrid cognition.",
    url: "https://arts.ufl.edu/people/profiles/marlon-barrios-solano/", linkLabel: "Faculty profile ↗" },
  { id: "erika",              label: "Erika Moore",                   cat: "facilitator", weight: 1.4,
    desc: "Co-director and co-facilitator — Future Lab (Wednesdays) and Ethics & Leadership (Thursdays); AI, art, and medicine.",
    url: "https://arts.ufl.edu/people/profiles/erika-moore/", linkLabel: "Faculty profile ↗" },
  { id: "jackie_larson",      label: "Jackie Larson",                 cat: "facilitator", weight: 1.1,
    desc: "Wednesday July 15 — Future Lab: movement and mapping possible futures; dancer in residence, UF Health Shands Arts in Medicine.",
    url: "https://artsinmedicine.ufhealth.org/about/jackie-larson-dancer-in-residence/", linkLabel: "AIM profile ↗" },
  { id: "andrew_hix",         label: "Andrew Hix",                    cat: "facilitator", weight: 1.1,
    desc: "Wednesday July 22 — Future Lab: sound and listening; writer, storyteller, and integrative therapies practitioner, UF Health Shands Arts in Medicine.",
    url: "https://artsinmedicine.ufhealth.org/about/andrew-hix-lmt-tai-chiqigong-practitioner-massage-therapist/", linkLabel: "AIM profile ↗" },
  { id: "turbado_marabou",    label: "Turbado\nMarabou",               cat: "facilitator", weight: 1.1,
    desc: "Wednesday July 29 — Future Lab: themes, insights, and artifacts; visual artist, muralist, folklorist, Deeproots Arts & Culture.",
    url: "https://www.deeprootscreate.com/", linkLabel: "Deep Roots ↗" },
  { id: "karla",              label: "Karla Saldaña\nOchoa",          cat: "facilitator", weight: 1.2,
    desc: "Monday July 13 — AI and architecture.",
    url: "https://dcp.ufl.edu/faculties/karla-saldana-ochoa/", linkLabel: "Faculty profile ↗" },
  { id: "onye",               label: "Onye P.\nOzuzu",                cat: "facilitator", weight: 1.2,
    desc: "Monday July 20 — Choreography and memory.",
    url: "https://arts.ufl.edu/people/profiles/onye-p-ozuzu/", linkLabel: "Faculty profile ↗" },
  { id: "cheval_bailie",      label: "Corey Cheval",                  cat: "facilitator", weight: 1.1,
    desc: "Monday July 27 — Partner acrobatics and object manipulation.",
    url: "https://www.gainesvillecircus.com/", linkLabel: "Gainesville Circus ↗" },
  { id: "cameron",            label: "Cameron\nBuckner",               cat: "facilitator", weight: 1.2,
    desc: "Thursday July 23 — AI, authorship, ethics, and law.",
    url: "https://phil.ufl.edu/directory/cameron-buckner/", linkLabel: "Faculty profile ↗" },
  { id: "jasmine",            label: "Jasmine\nMcNealy",              cat: "facilitator", weight: 1.2,
    desc: "Thursday July 23 — AI, data ecologies, and law.",
    url: "https://www.jou.ufl.edu/staff/jasmine-mcnealy/", linkLabel: "Faculty profile ↗" },
  { id: "melissa",            label: "Melissa M.\nWhite",             cat: "facilitator", weight: 1.1,
    desc: "Thursday July 30 — IGNITE leadership and program culmination.",
    url: "https://www.eng.ufl.edu/innovation/about/meet-the-team/melissa-white/", linkLabel: "IGNITE team profile ↗" },

  { id: "techno_dualism",     label: "Techno-\nDualism",             cat: "tension",    weight: 0.9,
    desc: "Inadequate position: intelligence cleanly detached from bodies, histories, ecologies, and politics." },
  { id: "bio_exception",      label: "Biological\nExceptionalism",  cat: "tension",    weight: 0.9,
    desc: "Inadequate position: only organic life can participate meaningfully in cognitive processes." },
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
  mediation: "Mediation",
  "4e": "Embodied_cognition",
  enactivism: "Enactivism",
  assemblage: "Assemblage_(philosophy)",
  extended: "Extended_mind_thesis",
  cyborg: "Cyborg",
  possible_minds: "Philosophy_of_artificial_intelligence",
  technosymbiosis: "Symbiogenesis",
  affordances: "Affordance",
  umwelt: "Umwelt",
  ai: "Artificial_intelligence",
  gen_ai: "Generative_artificial_intelligence",
  creative_ai: "Artificial_intelligence_art",
  llm: "Large_language_model",
  agi: "Artificial_general_intelligence",
  asi: "Superintelligence",
  ai_alignment: "AI_alignment",
  cybernetics: "Cybernetics",
  systems_thinking: "Systems_thinking",
  complexity_theory: "Complex_system",
  motion_bank: "William_Forsythe_(choreographer)",
  choreo_object: "Choreography",
  clark: "Andy_Clark",
  hayles: "Katherine_Hayles",
  thompson: "Evan_Thompson",
  varela: "Francisco_Varela",
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
  shapiro: "Lawrence_Shapiro_(philosopher)",
  kirsh: "David_Kirsh",
  forsythe: "William_Forsythe_(choreographer)",
  duchamp: "Marcel_Duchamp",
  cage: "John_Cage",
  yoko_ono: "Yoko_Ono",
  trisha_brown: "Trisha_Brown",
  carney: "Embodied_cognition",
  wilson: "Robert_A._Wilson_(philosopher)",
  rosch: "Eleanor_Rosch",
  cuffari: "Enactivism",
  akomolafe: "Bayo_Akomolafe",
  freire: "Paulo_Freire",
  braidotti: "Rosi_Braidotti",
  haraway: "Donna_Haraway",
  barad: "Karen_Barad",
  fanon: "Frantz_Fanon",
  bell_hooks: "Bell_hooks",
  munoz: "Jos%C3%A9_Esteban_Mu%C3%B1oz",
  escobar: "Arturo_Escobar",
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
  social_change: "Social_change",
  cultural_imagination: "Imagination",
  futurity: "Future",
  ethical_imagination: "Moral_imagination",
  pluriversal: "Decoloniality",
  architecture: "Architecture",
  law: "Law",
  intellectual_property: "Intellectual_property",
  philosophy: "Philosophy",
  cs: "Computer_science",
  ai_ml: "Machine_learning",
  ecology_d: "Ecology",
  dance: "Dance",
  choreography_d: "Choreography",
  circus_arts: "Circus",
  music: "Music",
  storytelling: "Storytelling",
  interdisciplinary_art: "Interdisciplinary_arts",
  ai_art: "Artificial_intelligence_art",
  pedagogy: "Pedagogy",
  art_medicine: "Arts_in_health",
  curation: "Curator",
  speculative_futures: "Speculative_design",
  design_thinking: "Design_thinking",
  art: "Art",
  choreography: "Choreography",
  choreo_knowledge: "Choreography",
  somatics: "Somatics",
  complexity: "Complexity",
  cultural_critical: "Critical_theory",
  juggling: "Juggling",
  creative: "Creativity",
  rehearsal: "Rehearsal",
  literacies: "Literacy",
  hi_program: "Cognitive_science",
  came: "Entrepreneurship",
  cam: "Arts_in_health",
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
  ["coupling", "mediation", 0.9],
  ["hybrid", "assemblage", 1.0],
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
  ["extended", "extended_q", 0.95],
  ["extended", "cyborg", 0.85],
  ["cyborg", "ecology", 0.8],
  ["cyborg", "hybrid", 0.75],
  ["assemblage", "distributed", 0.95],
  ["assemblage", "technical_agency", 0.9],
  ["assemblage", "creative", 0.85],
  ["assemblage", "creative_embodiment", 0.95],
  ["assemblage", "hayles", 0.95],
  ["possible_minds", "ecology", 0.8],
  ["possible_minds", "hybrid", 0.75],
  ["possible_minds", "shanahan", 0.9],
  ["technosymbiosis", "assemblage", 0.95],
  ["technosymbiosis", "symbiosis", 0.9],
  ["technosymbiosis", "margulis", 0.85],
  ["technosymbiosis", "hybrid", 0.9],
  ["technosymbiosis", "cyborg", 0.8],
  ["technosymbiosis", "ecology", 0.85],
  ["technosymbiosis", "hayles", 0.95],

  ["affordances", "gibson", 0.95],
  ["affordances", "embedded", 0.9],
  ["affordances", "4e", 0.85],
  ["affordances", "enactivism", 0.8],
  ["affordances", "architecture", 0.9],
  ["affordances", "ecology", 0.75],
  ["affordances", "umwelt", 0.85],
  ["umwelt", "enactivism", 0.9],
  ["umwelt", "varela", 0.85],
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
  ["ai", "agi", 0.85],
  ["gen_ai", "creative_ai", 0.9],
  ["gen_ai", "llm", 0.95],
  ["gen_ai", "abstraction", 0.8],
  ["gen_ai", "distributed", 0.75],
  ["creative_ai", "creative_embodiment", 0.95],
  ["creative_ai", "creative", 0.9],
  ["creative_ai", "art", 0.85],
  ["creative_ai", "rehearsal", 0.7],
  ["llm", "assemblage", 0.85],
  ["llm", "mediation", 0.85],
  ["llm", "perception_politics", 0.75],
  ["llm", "literacies", 0.7],
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

  ["choreography_d", "choreography", 0.95],
  ["dance", "choreography_d", 0.9],
  ["dance", "choreography", 0.85],
  ["dance", "somatics", 0.8],
  ["dance", "interdisciplinary_art", 0.75],
  ["dance", "jackie_larson", 0.85],
  ["dance", "onye", 0.9],
  ["dance", "marlon", 0.85],
  ["choreography_d", "choreo_knowledge", 0.85],
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
  ["forsythe", "choreography", 0.9],

  ["duchamp", "art", 0.95],
  ["duchamp", "creative", 0.9],
  ["duchamp", "curation", 0.9],
  ["duchamp", "interdisciplinary_art", 0.85],
  ["duchamp", "intellectual_property", 0.85],
  ["duchamp", "abstraction", 0.8],
  ["duchamp", "distributed", 0.75],
  ["duchamp", "cage", 0.85],
  ["duchamp", "yoko_ono", 0.75],

  ["cage", "music", 0.95],
  ["cage", "art", 0.85],
  ["cage", "creative", 0.9],
  ["cage", "enacted", 0.85],
  ["cage", "rehearsal", 0.8],
  ["cage", "interdisciplinary_art", 0.85],
  ["cage", "yoko_ono", 0.8],

  ["yoko_ono", "art", 0.9],
  ["yoko_ono", "interdisciplinary_art", 0.9],
  ["yoko_ono", "creative", 0.85],
  ["yoko_ono", "community", 0.8],
  ["yoko_ono", "cultural_imagination", 0.8],
  ["yoko_ono", "de_jaegher", 0.75],

  ["trisha_brown", "dance", 0.95],
  ["trisha_brown", "choreography_d", 0.95],
  ["trisha_brown", "choreography", 0.9],
  ["trisha_brown", "somatics", 0.85],
  ["trisha_brown", "embodied", 0.85],
  ["trisha_brown", "creative_embodiment", 0.85],
  ["trisha_brown", "forsythe", 0.8],
  ["trisha_brown", "onye", 0.85],
  ["trisha_brown", "marlon", 0.8],
  ["trisha_brown", "architecture", 0.75],

  ["choreo_knowledge", "choreo_object", 0.9],
  ["choreo_knowledge", "motion_bank", 0.85],
  ["choreo_object", "motion_bank", 0.85],
  ["choreo_knowledge", "embodied", 0.85],
  ["choreo_knowledge", "enacted", 0.85],
  ["choreo_knowledge", "distributed", 0.8],
  ["choreo_knowledge", "creative_embodiment", 0.9],
  ["choreo_knowledge", "kirsh", 0.85],
  ["choreo_object", "distributed", 0.85],
  ["choreo_object", "coupling", 0.8],
  ["choreo_object", "abstraction", 0.75],
  ["choreo_object", "creative_embodiment", 0.85],
  ["choreo_object", "rehearsal", 0.75],
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
  ["choreo_knowledge", "choreography", 0.95],
  ["choreo_knowledge", "somatics", 0.85],
  ["somatics", "coregulation", 0.9],
  ["complexity", "choreo_knowledge", 0.7],
  ["cultural_critical", "somatics", 0.7],
  ["marlon", "choreo_knowledge", 0.85],

  ["creative_embodiment", "creative", 0.95],
  ["creative_embodiment", "embodied", 0.9],
  ["creative_embodiment", "art", 0.85],
  ["creative_embodiment", "choreography", 0.9],
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
  ["varela", "enactivism", 0.95],
  ["varela", "4e", 0.85],
  ["varela", "embodied", 0.8],
  ["varela", "rosch", 0.9],
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
  ["di_paolo", "enactivism", 0.9],
  ["di_paolo", "enacted", 0.8],
  ["di_paolo", "coupling", 0.75],
  ["di_paolo", "cuffari", 0.85],
  ["shanahan", "possible_minds", 0.95],
  ["shapiro", "embodied", 0.85],
  ["shapiro", "4e", 0.8],
  ["kirsh", "choreography", 0.85],
  ["kirsh", "embodied", 0.8],
  ["kirsh", "extended_q", 0.75],
  ["carney", "4e", 0.9],
  ["wilson", "situated", 0.85],
  ["wilson", "embedded", 0.8],
  ["wilson", "4e", 0.75],
  ["rosch", "enactivism", 0.85],
  ["rosch", "embodied", 0.75],
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
  ["embodied", "choreography", 0.85],
  ["embedded", "architecture", 0.9],
  ["embedded", "situated", 0.85],
  ["enacted", "choreography", 0.8],
  ["enacted", "rehearsal", 0.75],
  ["extended_q", "cs", 0.7],
  ["critical", "law", 0.85],
  ["critical", "perception_politics", 0.9],
  ["situated", "architecture", 0.85],
  ["situated", "creative", 0.7],
  ["distributed", "choreography", 0.75],
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

  ["abstraction", "architecture", 0.7],
  ["abstraction", "creative", 0.75],
  ["abstraction", "philosophy", 0.7],
  ["perception_politics", "law", 0.75],
  ["perception_politics", "critical", 0.85],

  ["architecture", "choreography", 0.8],
  ["architecture", "choreography_d", 0.75],
  ["architecture", "mediation", 0.7],
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
  ["cs", "assemblage", 0.75],

  ["juggling", "hybrid", 0.8],
  ["juggling", "literacies", 0.75],
  ["creative", "assemblage", 0.8],
  ["rehearsal", "art", 0.85],
  ["literacies", "choreography", 0.7],
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
  ["hi_program", "came", 0.95],
  ["hi_program", "cam", 0.9],
  ["hi_program", "ignite", 0.9],
  ["hi_program", "wertheim", 0.9],
  ["hi_program", "track_space", 0.85],
  ["hi_program", "track_future", 0.85],
  ["hi_program", "track_ethics", 0.85],
  ["hi_program", "reception", 0.85],
  ["hi_program", "marlon", 0.95],
  ["marlon", "came", 0.95],
  ["hi_program", "erika", 0.9],
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

  ["marlon", "choreography", 0.9],
  ["marlon", "creative", 0.85],
  ["marlon", "track_space", 0.8],
  ["marlon", "track_future", 0.75],
  ["marlon", "track_ethics", 0.75],
  ["karla", "architecture", 0.95],
  ["karla", "cs", 0.7],
  ["onye", "choreography", 0.95],
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
];

let nodes = [];
let edges = [];
let hovered = null;
let selected = null;
let dragging = null;
let panelAlpha = 0;
let time = 0;
let layoutCenter = { x: 0, y: 0 };
let layoutRadius = 0;

function theme() {
  return THEMES[themeMode];
}

function ringColor(cat) {
  return RING_COLORS[cat];
}

function setTextFill(alpha = 255) {
  if (themeMode === "dark") {
    fill(255, 255, 255, alpha);
  } else {
    fill(32, 36, 48, alpha);
  }
}

function setTheme(mode) {
  if (!THEMES[mode]) return;
  themeMode = mode;
  document.body.style.background = mode === "dark" ? "#0e1018" : "#fffdf8";
  document.body.classList.toggle("light-mode", mode === "light");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("IBM Plex Mono");
  setTheme(themeMode);
  initGraph();
}

function getCenter() {
  return { x: width / 2, y: height / 2 + 10 };
}

function getMaxRadius() {
  const topPad = 62;
  const toggleH = 54;
  const focus = getActiveNode();
  const panelH = focus && focus.url ? 128 : 108;
  const bottomPad = focus ? toggleH + panelH + 18 : toggleH + 16;
  const sidePad = 98;
  const layoutScale = 1.08;
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
    radius: 14,
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
        radius: 7 + n.weight * 4,
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
  initGraph();
}

function draw() {
  time += 0.016;
  updateAnimate();
  updateCategoryTransition();
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
      fill(cr, cg, cb, themeMode === "dark" ? 22 : 28);
      ellipse(cx, cy, r * 2);

      noFill();
      stroke(cr, cg, cb, 255);
      strokeWeight(i === RING_ORDER.length - 1 ? 3.2 : 2.6);
      ellipse(cx, cy, r * 2);

      if (innerR > 0) {
        stroke(...t.bg, themeMode === "dark" ? 200 : 230);
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
      fill(...t.bg, themeMode === "dark" ? 235 : 245);
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

  noFill();
  for (const cat of RING_ORDER) {
    const r = maxR * CATEGORY_META[cat].ring;
    const [cr, cg, cb] = ringColor(cat);
    const ringFocus = ringCategoryFocus(cat);
    const ringHot = categoryHighlightActive() && cat === activeCategory();
    const ringAlpha = categoryHighlightActive()
      ? t.ringLine + ringFocus * t.ringLine * 1.4
      : t.ringLine;
    stroke(cr, cg, cb, ringAlpha);
    strokeWeight(1 + ringFocus * 1.2 + (ringHot ? 0.4 : themeMode === "light" ? 0.2 : 0));
    ellipse(cx, cy, r * 2);

    noStroke();
    fill(cr, cg, cb, t.ringLabel + ringFocus * 90);
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
  return hoveredCategory;
}

function updateAnimate() {
  if (!animateMode) return;
  if (time < animateUntil) return;
  animateStep = (animateStep + 1) % ANIM_SEQUENCE.length;
  animateUntil = time + ANIM_HOLD_SEC;
  const phase = getAnimatePhase();
  playSwish(phase);
  if (phase === "rings") {
    nudgeNodesForRings();
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

function updateCategoryTransition() {
  const active = categoryHighlightActive();
  const target = active ? activeCategory() : null;

  if (!active) {
    if (categoryDisplay !== null) {
      categoryBlend = max(0, categoryBlend - CATEGORY_FADE_RATE);
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
  if (!categoryHighlightActive() || categoryDisplay === null) return null;
  const t = easeSmooth(categoryBlend);
  if (n.cat === categoryDisplay) return t;
  if (n.cat === categoryPrev && categoryPrev !== null) return 1 - t;
  return 0;
}

function ringCategoryFocus(cat) {
  if (!categoryHighlightActive() || categoryDisplay === null) return 0;
  const t = easeSmooth(categoryBlend);
  if (cat === categoryDisplay) return t;
  if (cat === categoryPrev && categoryPrev !== null) return 1 - t;
  return 0;
}

function toggleAnimate() {
  animateMode = !animateMode;
  if (animateMode) {
    ensureAudio();
    selected = null;
    hovered = null;
    dragging = null;
    hoveredCategory = null;
    hoveredLegendHeader = false;
    animateStep = 0;
    animateUntil = time + ANIM_HOLD_SEC;
    categoryDisplay = null;
    categoryPrev = null;
    categoryBlend = 0;
  } else {
    animateStep = 0;
    animateUntil = 0;
    categoryDisplay = null;
    categoryPrev = null;
    categoryBlend = 1;
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
  return mouseOnLegend && hoveredCategory !== null;
}

function nodeDimmed(n) {
  if (categoryHighlightActive()) {
    return n.cat !== activeCategory();
  }
  const active = getActiveNode();
  if (active) {
    return n !== active && !isConnected(active, n);
  }
  return false;
}

function nodeHighlighted(n) {
  if (categoryHighlightActive()) return n.cat === activeCategory();
  const active = getActiveNode();
  if (active) return n === active;
  return false;
}

function nodeNeighbor(n) {
  if (categoryHighlightActive()) return false;
  const active = getActiveNode();
  if (active) return isConnected(active, n);
  return false;
}

function nodeAt(mx, my) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
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
  if (dim) return color(red(blended), green(blended), blue(blended), t.edgeDim);
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
      ? max(nodeCategoryFocus(e.a) ?? 0, nodeCategoryFocus(e.b) ?? 0)
      : null;
    const highlight = catHL
      ? edgeFocus > 0.45
      : active && (e.a === active || e.b === active);
    const dim = catHL
      ? edgeFocus < 0.2
      : active && !highlight;
    const col = edgeColor(e, highlight, dim);
    let weight = highlight ? 2.0 + e.strength * 1.2 : 0.9 + e.strength * 1.6;
    if (edgeFocus !== null) {
      weight = 0.6 + edgeFocus * (1.4 + e.strength * 1.6);
    }

    if (highlight) {
      stroke(red(col), green(col), blue(col), t.edgeGlow);
      strokeWeight(weight + 2.5);
      line(e.a.x, e.a.y, e.b.x, e.b.y);
    }

    stroke(col);
    strokeWeight(weight);
    line(e.a.x, e.a.y, e.b.x, e.b.y);

    if (highlight || e.strength >= 0.85) {
      const mx = lerp(e.a.x, e.b.x, 0.55);
      const my = lerp(e.a.y, e.b.y, 0.55);
      const sz = highlight ? 5 : 3;
      noStroke();
      fill(red(col), green(col), blue(col), highlight ? 220 : 140);
      ellipse(mx, my, sz);
    }
  }
}

function drawNodes() {
  drawNodeCircles();
  drawNodeLabels();
}

function drawNodeCircles() {
  for (const n of nodes) {
    const [r, g, b] = ringColor(n.cat);
    const catFocus = nodeCategoryFocus(n);
    const isActive = catFocus === null ? nodeHighlighted(n) : catFocus > 0.65;
    const isNeighbor = catFocus === null && nodeNeighbor(n);
    const dim = catFocus === null ? nodeDimmed(n) : catFocus < 0.2;
    const focus = catFocus === null
      ? (isActive ? 1 : isNeighbor ? 0.75 : dim ? 0.08 : themeMode === "light" ? 0.15 : 0.25)
      : catFocus;

    const pulse = catFocus !== null && focus > 0.35
      ? sin(time * 1.6 + n.floatPhase) * 0.035 * focus
      : categoryTransitionWave() * sin(time * 1.1 + n.floatPhase) * 0.028;
    const drawR = n.radius * (1 + focus * 0.07 + pulse);

    const glow = focus;
    const fillAlpha = 40 + focus * 215;

    noStroke();
    for (let i = 4; i >= 0; i--) {
      fill(r, g, b, glow * (themeMode === "light" ? 12 : 16) * (5 - i));
      ellipse(n.x, n.y, drawR * 2 + i * 6);
    }

    fill(r, g, b, fillAlpha);
    stroke(r, g, b, 70 + focus * 185);
    strokeWeight(1.5 + focus * 1.5);
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
  const sorted = [...nodes].sort((a, b) => {
    const aScore = nodeHighlighted(a) ? 2 : nodeNeighbor(a) ? 1 : 0;
    const bScore = nodeHighlighted(b) ? 2 : nodeNeighbor(b) ? 1 : 0;
    return aScore - bScore;
  });

  for (const n of sorted) {
    const catFocus = nodeCategoryFocus(n);
    const isActive = catFocus === null ? nodeHighlighted(n) : catFocus > 0.65;
    const dim = catFocus === null ? nodeDimmed(n) : catFocus < 0.2;
    const { lines, lineH, lx, startY } = nodeLabelLayout(n, isActive);
    const labelAlpha = catFocus === null
      ? (dim ? t.labelDim : 255)
      : 50 + catFocus * 205;

    setTextFill(labelAlpha);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(catFocus === null ? (isActive ? 11 : 9) : 8 + catFocus * 3);
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], lx, startY + i * lineH);
    }
  }
}

function drawUI() {
  const t = theme();
  uiLinks = [];

  fill(...t.uiBar);
  noStroke();
  rect(0, 0, width, 72);

  setTextFill();
  textAlign(LEFT, CENTER);
  textSize(11);
  textStyle(BOLD);
  fill(...t.title);
  text("Hybrid Intelligences: Embodied Leadership and Creativity in the Era of AI", 20, 14);
  textStyle(NORMAL);

  textSize(8.5);
  fill(...t.subtitle);
  text(
    "Center for Arts in Medicine \u2022 Center for Arts, Migration + Entrepreneurship \u2022 College of the Arts",
    20,
    30
  );

  const creditY = 44;
  const subtitlePrefix = "Conceptual network visualization by ";
  const subtitleName = "Marlon Barrios Solano";
  textSize(8);
  fill(...t.subtitle);
  text(subtitlePrefix, 20, creditY);
  const nameX = 20 + textWidth(subtitlePrefix);
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

  fill(...t.muted);
  textSize(9);
  text("CAME \u00b7 CAM \u00b7 IGNITE \u00b7 Wertheim Lab \u00b7 Jul 13\u201330, 2026 \u2014 hover legend \u00b7 drag nodes \u00b7 A animate \u00b7 R reset \u00b7 T theme", 20, 58);

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
      : CATEGORY_META[phase].label.toUpperCase();
    fill(...t.title, 220);
    text(`ANIMATE · ${phaseLabel}`, width - 16, height - 24);
    fill(...t.muted, 180);
  }
  text(`${nodes.length} concepts · ${edges.length} relations`, width - 16, height - 12);
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
    const active = themeMode === mode;
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
  const hotRings = (legendHeaderHit(mouseX, mouseY) && mouseX >= header.rings.x - 1 && mouseX <= header.rings.x + header.rings.w + 1)
    || (animateMode && getAnimatePhase() === "rings");
  const hotCats = (legendHeaderHit(mouseX, mouseY) && mouseX >= header.categories.x - 1 && mouseX <= header.categories.x + header.categories.w + 1)
    || (animateMode && getAnimatePhase() === "rings");

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
    const isHot = activeCategory() === key;

    if (isHot) {
      fill(...ringColor(key), 35);
      noStroke();
      rect(x + 6, ly - 2, boxW - 12, 18, 4);
    }

    fill(...ringColor(key));
    noStroke();
    ellipse(x + 18, ly + 7, 10);
    stroke(...ringColor(key), isHot ? 180 : themeMode === "light" ? 100 : 60);
    strokeWeight(isHot ? 1.5 : 1);
    noFill();
    ellipse(x + 18, ly + 7, 18);
    noStroke();
    fill(...t.legendText);
    textSize(9);
    textStyle(isHot ? BOLD : NORMAL);
    text(meta.label, x + 32, ly);
    textStyle(NORMAL);
  });
}

function detailPanelLayout(n) {
  const panelW = min(360, width - 32);
  const toggleH = toggleLayout().bottom + toggleLayout().btnH + toggleLayout().padY * 2 + 12;
  const wikiUrl = n?.wikiUrl || (n?.url?.includes("wikipedia.org") ? n.url : null);
  const primaryUrl = n?.url && n.url !== wikiUrl ? n.url : null;
  const linkCount = (primaryUrl ? 1 : 0) + (wikiUrl ? 1 : 0);
  const hasLink = linkCount > 0;
  const panelH = hasLink ? 108 + linkCount * 20 : 108;
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
  const { panelW, x, y, panelH, hasLink, wikiUrl, primaryUrl } = detailPanelLayout(n);

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
  const maxLines = hasLink ? max(2, 4 - (primaryUrl && wikiUrl ? 2 : primaryUrl || wikiUrl ? 1 : 0)) : 3;
  for (const line of wrapped.slice(0, maxLines)) {
    text(line, x + 14, ty);
    ty += 14;
  }

  const linkCol = themeMode === "dark" ? [130, 195, 255] : [18, 85, 155];
  let linkY = y + panelH - 14 - ((primaryUrl ? 1 : 0) + (wikiUrl ? 1 : 0)) * 20;

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

  if (primaryUrl) {
    drawPanelLink(primaryUrl, n.linkLabel || "Open external link ↗");
  }
  if (wikiUrl) {
    drawPanelLink(wikiUrl, "Wikipedia ↗");
  }

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
    updateLegendHover(mouseX, mouseY);
    hovered = (ringsOnlyMode() || animateMode) ? null : nodeAt(mouseX, mouseY);
    if (hitUiLink(mouseX, mouseY) || hitDetailPanelLink(mouseX, mouseY)) {
      cursor("pointer");
    } else if (legendHeaderHit(mouseX, mouseY)) {
      cursor("pointer");
    } else {
      cursor("default");
    }
  }
}

function mousePressed() {
  const link = hitUiLink(mouseX, mouseY) || hitDetailPanelLink(mouseX, mouseY);
  if (link) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }

  if (animateMode) return;

  const toggled = hitThemeToggle(mouseX, mouseY);
  if (toggled) {
    setTheme(toggled);
    return;
  }

  const n = nodeAt(mouseX, mouseY);
  if (n) {
    dragging = n;
    selected = n;
    if (n.id !== "coupling") n.pinned = false;
  } else {
    selected = null;
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
    animateMode = false;
    animateStep = 0;
    animateUntil = 0;
    selected = null;
    hovered = null;
    dragging = null;
    initGraph();
  }
  if (key === "t" || key === "T") {
    setTheme(themeMode === "dark" ? "light" : "dark");
  }
}
