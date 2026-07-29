// Hybrid Intelligences — Conceptual Network
// Radial layout with Dark / Light theme modes

const CATEGORY_META = {
  program:    { label: "Program",      ring: 0.13 },
  premise:    { label: "Premise",      ring: 0.22 },
  author:     { label: "Authors",      ring: 0.76 },
  framework:  { label: "Framework",    ring: 0.31 },
  quality:    { label: "Qualities",    ring: 0.40 },
  phenomenon: { label: "Phenomena",    ring: 0.49 },
  domain:     { label: "Domains",      ring: 0.58 },
  practice:   { label: "Practices",    ring: 0.67 },
  facilitator:{ label: "Facilitators", ring: 0.85 },
  tension:    { label: "Tensions",     ring: 0.94 },
};

const RING_ORDER = ["program", "premise", "framework", "quality", "phenomenon", "domain", "practice", "facilitator", "tension", "author"];

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
    bg: [248, 246, 241],
    uiBar: [248, 246, 241, 245],
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
    toggleBg: [232, 234, 240],
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
const CATEGORY_FADE_RATE = 0.014;

const NODES = [
  { id: "coupling",           label: "Intelligence\nas Coupling",     cat: "premise",    weight: 2.2,
    desc: "Intelligence is not located in a skull or machine—it is a relational event happening through bodies, tools, architectures, and co-presence." },
  { id: "hybrid",             label: "Hybrid\nIntelligences",         cat: "premise",    weight: 2.0,
    desc: "Assemblages of biological, technical, social, spatial, legal, and affective processes that co-produce cognition." },
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

  { id: "architecture",       label: "Architecture",                  cat: "domain",     weight: 1.5,
    desc: "Space actively choreographs cognition through affordances; platforms are architectures of attention and memory." },
  { id: "law",                label: "Law &\nGovernance",             cat: "domain",     weight: 1.3,
    desc: "Law choreographs what bodies and systems may do; governance must understand cognitive mediation." },
  { id: "philosophy",         label: "Philosophy",                    cat: "domain",     weight: 1.2,
    desc: "Questions subjectivity, agency, abstraction, and world-making within hybrid couplings." },
  { id: "cs",                 label: "Computer\nScience",            cat: "domain",     weight: 1.1,
    desc: "Technical systems as participants in cognitive assemblages, not neutral tools." },
  { id: "ecology_d",          label: "Ecology",                       cat: "domain",     weight: 1.1,
    desc: "Interdependence across biological and artificial substrates in shared cognitive ecosystems." },

  { id: "dance",              label: "Dance",                         cat: "domain",     weight: 1.4,
    desc: "The domain of dance—movement arts, bodily expression, performance, and choreographic cultures as fields of knowledge." },
  { id: "choreography_d",     label: "Choreography",                  cat: "domain",     weight: 1.4,
    desc: "The art of organizing movement in time and space—bodies, relations, and rhythm as forms of thought and world-making." },
  { id: "music",              label: "Music",                         cat: "domain",     weight: 1.3,
    desc: "Sound, rhythm, and listening as cognitive and social practice—organizing attention, memory, and collective imagination." },
  { id: "storytelling",       label: "Storytelling",                  cat: "domain",     weight: 1.3,
    desc: "Narrative as a technology for sense-making—stories shape what can be remembered, felt, believed, and acted upon." },
  { id: "interdisciplinary_art", label: "Interdisciplinary\nArt",   cat: "domain",     weight: 1.4,
    desc: "Art that crosses disciplines—movement, sound, image, code, and institution woven into hybrid forms of inquiry." },
  { id: "ai_art",             label: "AI Art",                        cat: "domain",     weight: 1.3,
    desc: "Art made with and through machine learning—human intention, dataset, model, and interface co-composing aesthetic outcomes." },

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
    url: "https://arts.ufl.edu/came/", linkLabel: "CAME program page ↗" },
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

  { id: "marlon",             label: "Marlon Barrios-\nSolano",        cat: "facilitator", weight: 1.6,
    desc: "Co-director and co-facilitator across all Hybrid Intelligences sessions. Embodied practice, choreography, and hybrid cognition.",
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
];

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
  ["hayles", "creative_ai", 0.8],
  ["track_future", "gen_ai", 0.8],
  ["track_future", "creative_ai", 0.85],
  ["cameron", "llm", 0.75],
  ["cameron", "ai", 0.7],

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

  ["forsythe", "choreo_knowledge", 0.95],
  ["forsythe", "choreo_object", 0.95],
  ["forsythe", "motion_bank", 0.95],
  ["forsythe", "choreography", 0.9],
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
  ["hi_program", "erika", 0.9],
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
  document.body.style.background = mode === "dark" ? "#0e1018" : "#f8f6f1";
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
  const topPad = 50;
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
  const floatScale = (interacting ? 0.55 : 1.0) * driftBoost;

  for (const n of nodes) {
    if (n === dragging) continue;

    const catFocus = nodeCategoryFocus(n);
    let focusFloat = catFocus === null ? 1 : 0.55 + catFocus * 0.65;
    if (catFocus !== null && categoryBlend < 1) {
      focusFloat += sin(categoryBlend * PI) * 0.28 * max(catFocus, 1 - catFocus);
    }

    if (n.id === "coupling") {
      const breathe = sin(time * 0.38 + n.floatPhase) * 4.5 * floatScale;
      n.x = lerp(n.x, cx + cos(time * 0.26 + n.floatPhase) * breathe, 0.05);
      n.y = lerp(n.y, cy + sin(time * 0.22 + n.floatPhase) * breathe, 0.05);
      continue;
    }

    if (n.pinned) continue;

    const rWave = sin(time * n.floatSpeed + n.floatPhase) * 0.62
      + sin(time * n.floatSpeed2 + n.floatPhase2) * 0.38;
    const aWave = cos(time * n.floatSpeed * 0.68 + n.floatPhase * 1.6) * 0.65
      + sin(time * n.floatSpeed2 * 0.9 + n.floatPhase2 * 1.4) * 0.35;
    const rOff = rWave * n.floatAmpR * floatScale * focusFloat;
    const aOff = aWave * n.floatAmpA * floatScale * focusFloat;
    const goalR = n.targetR + rOff;
    const goalAngle = n.targetAngle + aOff;
    const goalX = cx + cos(goalAngle) * goalR;
    const goalY = cy + sin(goalAngle) * goalR;

    let dx = n.x - cx;
    let dy = n.y - cy;
    let dist = sqrt(dx * dx + dy * dy) || 0.001;

    const bouncing = n.bounceUntil && time < n.bounceUntil;
    const bounceBlend = bouncing ? 1 - (n.bounceUntil - time) / 4.5 : 0;
    const constraintScale = bouncing ? 0.38 + bounceBlend * 0.35 : 0.88;

    const radialForce = (goalR - dist) * 0.048 * constraintScale;
    n.x += (dx / dist) * radialForce;
    n.y += (dy / dist) * radialForce;

    let angle = atan2(dy, dx);
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

    if (bouncing || errDist > 4 || speed > 0.35) {
      const pull = bouncing
        ? min(0.062, 0.032 + errDist * 0.00065)
        : min(0.055, 0.026 + errDist * 0.0006);
      const damp = bouncing ? 0.66 + bounceBlend * 0.14 : 0.76;
      n.vx = (n.vx || 0) * damp + errX * pull;
      n.vy = (n.vy || 0) * damp + errY * pull;
      n.x += n.vx;
      n.y += n.vy;
    } else {
      const cloudPull = 0.013;
      const cloudDamp = 0.87;
      n.vx = (n.vx || 0) * cloudDamp + errX * cloudPull;
      n.vy = (n.vy || 0) * cloudDamp + errY * cloudPull;
      n.x += n.vx * 0.85;
      n.y += n.vy * 0.85;
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
}

function easeSmooth(t) {
  return t * t * (3 - 2 * t);
}

function nudgeNodesForCategory(cat, prevCat) {
  if (!cat) return;
  const { x: cx, y: cy } = layoutCenter;
  for (const n of nodes) {
    if (n.id === "coupling" || n.pinned) continue;
    const dx = n.x - cx;
    const dy = n.y - cy;
    const dist = sqrt(dx * dx + dy * dy) || 0.001;
    const angle = atan2(dy, dx);
    const seed = nodeFloatSeed(n.id);

    if (n.cat === cat) {
      const push = 0.9 + seed * 0.7;
      n.vx = (n.vx || 0) + cos(angle) * push;
      n.vy = (n.vy || 0) + sin(angle) * push;
      n.vx += -sin(angle) * (seed - 0.5) * 0.55;
      n.vy += cos(angle) * (seed - 0.5) * 0.55;
      n.bounceUntil = time + 2.8;
    } else if (prevCat && n.cat === prevCat) {
      n.vx = (n.vx || 0) - cos(angle) * 0.4;
      n.vy = (n.vy || 0) - sin(angle) * 0.4;
    }
  }
}

function categoryTransitionDrift() {
  if (!categoryHighlightActive() || categoryBlend >= 1) return 1;
  return 1 + sin(categoryBlend * PI) * 0.38;
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
    let weight = highlight ? 2.8 + e.strength * 1.5 : 1.2 + e.strength * 2.2;
    if (edgeFocus !== null) {
      weight = 0.8 + edgeFocus * (1.8 + e.strength * 2.2);
    }

    if (highlight) {
      stroke(red(col), green(col), blue(col), t.edgeGlow);
      strokeWeight(weight + 4);
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
      : 0;
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
  const startY = ly + (lines.length - 1) * lineH / 2;

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
      text(lines[i], lx, startY - i * lineH);
    }
  }
}

function drawUI() {
  const t = theme();
  uiLinks = [];

  fill(...t.uiBar);
  noStroke();
  rect(0, 0, width, 58);

  setTextFill();
  textAlign(LEFT, CENTER);
  textSize(13);
  textStyle(BOLD);
  text("HYBRID INTELLIGENCES", 20, 16);
  textStyle(NORMAL);

  const subtitleY = 30;
  const subtitlePrefix = "Conceptual network visualization by ";
  const subtitleName = "Marlon Barrios Solano";
  textSize(9);
  fill(...t.subtitle);
  text(subtitlePrefix, 20, subtitleY);
  const nameX = 20 + textWidth(subtitlePrefix);
  const nameW = textWidth(subtitleName);
  uiLinks.push({
    url: PORTFOLIO_URL,
    x: nameX,
    y: subtitleY - 7,
    w: nameW,
    h: 14,
  });
  const nameHover = hitUiLink(mouseX, mouseY) === PORTFOLIO_URL;
  fill(...t.title, nameHover ? 255 : 220);
  text(subtitleName, nameX, subtitleY);
  stroke(...t.title, nameHover ? 220 : 140);
  strokeWeight(0.5);
  line(nameX, subtitleY + 6, nameX + nameW, subtitleY + 6);
  noStroke();

  fill(...t.muted);
  textSize(10);
  text("CAME · CAM · IGNITE · Wertheim Lab · Jul 13–30, 2026 — hover legend · drag nodes · A animate · R reset · T theme", 20, 44);

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
  const hasLink = n && n.url;
  const panelH = hasLink ? 128 : 108;
  return { panelW, x: 16, y: height - toggleH - panelH, panelH, hasLink };
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
  const { panelW, x, y, panelH, hasLink } = detailPanelLayout(n);

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
  const maxLines = hasLink ? 2 : 3;
  for (const line of wrapped.slice(0, maxLines)) {
    text(line, x + 14, ty);
    ty += 14;
  }

  if (n.url) {
    const linkLabel = n.linkLabel || "Open external link ↗";
    const linkY = y + panelH - 36;
    const linkCol = themeMode === "dark" ? [130, 195, 255] : [18, 85, 155];
    textSize(10);
    fill(...linkCol);
    text(linkLabel, x + 14, linkY);
    const tw = textWidth(linkLabel);
    stroke(...linkCol, 200);
    strokeWeight(0.8);
    line(x + 14, linkY + 11, x + 14 + tw, linkY + 11);
    noStroke();
    detailPanelLinks.push({ url: n.url, x: x + 14, y: linkY - 2, w: tw, h: 16 });
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
